-- 0005_admin: admin / coach functions. Each re-checks roles_for(p_actor) and raises 'tiada_kebenaran'.
-- Coach may only call admin_summary, admin_participants, admin_participant. Every mutation writes one audit row.

create or replace function admin_guard(p_actor text, p_coach_ok boolean)
returns void language plpgsql stable as $$
declare v_roles text[] := roles_for(p_actor);
begin
  if 'superadmin' = any(v_roles) then return; end if;
  if p_coach_ok and 'coach' = any(v_roles) then return; end if;
  raise exception 'tiada_kebenaran';
end;
$$;

create or replace function admin_summary(p_actor text)
returns jsonb language plpgsql stable as $$
begin
  perform admin_guard(p_actor, true);
  return jsonb_build_object(
    'participants', (select count(*) from profiles),
    'onboarded', (select count(*) from profiles where onboarded_at is not null),
    'purchases', (select coalesce(jsonb_object_agg(status, n), '{}'::jsonb)
                  from (select status, count(*) n from purchases group by status) s),
    'codes', (select coalesce(jsonb_object_agg(status, n), '{}'::jsonb)
              from (select status, count(*) n from access_codes group by status) s),
    'perlu_semakan', (select count(*) from purchases where status = 'perlu_semakan')
  );
end;
$$;

create or replace function admin_participants(p_actor text, p_q text default null)
returns jsonb language plpgsql stable as $$
declare v_like text;
begin
  perform admin_guard(p_actor, true);
  if nullif(btrim(coalesce(p_q, '')), '') is not null then
    v_like := '%' || replace(replace(replace(btrim(p_q), '\', '\\'), '%', '\%'), '_', '\_') || '%';
  end if;
  return (
    select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at desc, x.id), '[]'::jsonb)
    from (
      select p.id, p.full_name, p.email, p.phone, p.onboarded_at, p.created_at,
             to_jsonb(entitlements_for(p.id)) as entitlements
      from profiles p
      where v_like is null
         or p.full_name ilike v_like or p.email ilike v_like or p.phone ilike v_like
      order by p.created_at desc, p.id
      limit 200
    ) x
  );
end;
$$;

create or replace function admin_participant(p_actor text, p_uid text)
returns jsonb language plpgsql stable as $$
declare v_prof profiles;
begin
  perform admin_guard(p_actor, true);
  select * into v_prof from profiles where id = p_uid;
  if not found then return null; end if;
  return jsonb_build_object(
    'profile', to_jsonb(v_prof),
    'roles', to_jsonb(roles_for(p_uid)),
    'entitlements', to_jsonb(entitlements_for(p_uid)),
    'purchases', (select coalesce(jsonb_agg(to_jsonb(pu) - 'raw' order by pu.created_at desc), '[]'::jsonb)
                  from purchases pu where pu.claimed_by = p_uid),
    'codes', (select coalesce(jsonb_agg(to_jsonb(c) order by c.redeemed_at desc nulls last), '[]'::jsonb)
              from access_codes c where c.redeemed_by = p_uid),
    'grants', (select coalesce(jsonb_agg(to_jsonb(g) order by g.created_at desc), '[]'::jsonb)
               from manual_grants g where g.user_id = p_uid)
  );
end;
$$;

create or replace function admin_purchases(p_actor text, p_filter jsonb default '{}'::jsonb)
returns jsonb language plpgsql stable as $$
declare
  v_status text := nullif(p_filter->>'status', '');
  v_batch  uuid := nullif(p_filter->>'batch_id', '')::uuid;
  v_like   text;
begin
  perform admin_guard(p_actor, false);
  if nullif(btrim(coalesce(p_filter->>'q', '')), '') is not null then
    v_like := '%' || replace(replace(replace(btrim(p_filter->>'q'), '\', '\\'), '%', '\%'), '_', '\_') || '%';
  end if;
  return (
    select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at desc, x.id), '[]'::jsonb)
    from (
      select pu.id, pu.order_ref, pu.batch_id, pu.package_id, k.name as package_name, pu.entitlements,
             pu.buyer_name, pu.email, pu.phone, pu.amount_rm, pu.paid_at, pu.status, pu.review_reason,
             pu.claimed_by, pu.claimed_at, pu.source, pu.created_at
      from purchases pu left join packages k on k.id = pu.package_id
      where (v_status is null or pu.status = v_status)
        and (v_batch is null or pu.batch_id = v_batch)
        and (v_like is null or pu.order_ref ilike v_like or pu.buyer_name ilike v_like
             or pu.email ilike v_like or pu.phone ilike v_like)
      order by pu.created_at desc, pu.id
      limit 200
    ) x
  );
end;
$$;

create or replace function admin_purchase_action(p_actor text, p_id uuid, p_action text, p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql as $$
declare
  v_pu     purchases;
  v_target text;
  v_pkg    text;
  v_ents   text[];
begin
  perform admin_guard(p_actor, false);
  if p_action is null or p_action not in ('assign','set_package','cancel','restore') then
    raise exception 'tindakan_tidak_sah';
  end if;
  select * into v_pu from purchases where id = p_id for update;
  if not found then raise exception 'pembelian_tidak_wujud'; end if;

  if p_action = 'assign' then
    v_target := nullif(btrim(coalesce(p_payload->>'user_id', '')), '');
    if v_target is null or not exists (select 1 from profiles where id = v_target) then
      raise exception 'pengguna_tidak_wujud';
    end if;
    update purchases set claimed_by = v_target, claimed_at = now(), status = 'dituntut', review_reason = null
    where id = p_id returning * into v_pu;

  elsif p_action = 'set_package' then
    v_pkg := nullif(btrim(coalesce(p_payload->>'package_id', '')), '');
    if v_pkg is null or not exists (select 1 from packages where id = v_pkg) then
      raise exception 'pakej_tidak_wujud';
    end if;
    select coalesce(array_agg(item_key order by item_key), '{}') into v_ents
    from package_items where package_id = v_pkg;
    update purchases set package_id = v_pkg, entitlements = v_ents where id = p_id returning * into v_pu;

  elsif p_action = 'cancel' then
    update purchases set status = 'dibatalkan' where id = p_id returning * into v_pu;

  elsif p_action = 'restore' then
    update purchases
       set status = case when claimed_by is not null then 'dituntut' else 'belum_dituntut' end
     where id = p_id returning * into v_pu;
  end if;

  perform log_audit(p_actor, 'purchase.' || p_action, 'purchase', p_id::text,
    jsonb_build_object('payload', p_payload, 'order_ref', v_pu.order_ref));
  return to_jsonb(v_pu) - 'raw';
end;
$$;

create or replace function admin_grant(p_actor text, p_uid text, p_item_key text, p_reason text default null)
returns jsonb language plpgsql as $$
declare v_g manual_grants;
begin
  perform admin_guard(p_actor, false);
  if not exists (select 1 from profiles where id = p_uid) then raise exception 'pengguna_tidak_wujud'; end if;
  if not exists (select 1 from items where key = p_item_key) then raise exception 'item_tidak_sah'; end if;
  insert into manual_grants (user_id, item_key, granted_by, reason)
  values (p_uid, p_item_key, p_actor, p_reason) returning * into v_g;
  perform log_audit(p_actor, 'grant.create', 'manual_grant', v_g.id::text,
    jsonb_build_object('user_id', p_uid, 'item_key', p_item_key, 'reason', p_reason));
  return to_jsonb(v_g);
end;
$$;

create or replace function admin_revoke_grant(p_actor text, p_grant_id uuid)
returns jsonb language plpgsql as $$
declare v_g manual_grants;
begin
  perform admin_guard(p_actor, false);
  select * into v_g from manual_grants where id = p_grant_id for update;
  if not found then raise exception 'geran_tidak_wujud'; end if;
  if v_g.revoked_at is not null then raise exception 'geran_sudah_ditarik'; end if;
  update manual_grants set revoked_at = now() where id = p_grant_id returning * into v_g;
  perform log_audit(p_actor, 'grant.revoke', 'manual_grant', p_grant_id::text,
    jsonb_build_object('user_id', v_g.user_id, 'item_key', v_g.item_key));
  return to_jsonb(v_g);
end;
$$;

create or replace function admin_codes(p_actor text, p_filter jsonb default '{}'::jsonb)
returns jsonb language plpgsql stable as $$
declare
  v_status text := nullif(p_filter->>'status', '');
  v_batch  uuid := nullif(p_filter->>'batch_id', '')::uuid;
  v_like   text;
begin
  perform admin_guard(p_actor, false);
  if nullif(btrim(coalesce(p_filter->>'q', '')), '') is not null then
    v_like := '%' || replace(replace(replace(btrim(p_filter->>'q'), '\', '\\'), '%', '\%'), '_', '\_') || '%';
  end if;
  return (
    select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at desc, x.id), '[]'::jsonb)
    from (
      select c.*, k.name as package_name
      from access_codes c left join packages k on k.id = c.package_id
      where (v_status is null or c.status = v_status)
        and (v_batch is null or c.batch_id = v_batch)
        and (v_like is null or c.code ilike v_like or c.buyer_name ilike v_like or c.buyer_email ilike v_like
             or c.batch_label ilike v_like or c.redeemed_by ilike v_like)
      order by c.created_at desc, c.id
      limit 200
    ) x
  );
end;
$$;

create or replace function admin_audit(p_actor text, p_limit int default 100)
returns jsonb language plpgsql stable as $$
declare v_limit int := least(greatest(coalesce(p_limit, 100), 1), 500);
begin
  perform admin_guard(p_actor, false);
  return (
    select coalesce(jsonb_agg(to_jsonb(x) order by x.at desc, x.id desc), '[]'::jsonb)
    from (select * from audit_logs order by at desc, id desc limit v_limit) x
  );
end;
$$;
