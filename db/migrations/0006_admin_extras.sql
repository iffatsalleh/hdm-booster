-- 0006_admin_extras: admin summary extras (BCL webhook errors, email queue counts), squatter flag on purchases,
-- and offset paging for the admin lists. Idempotent (create or replace; drop of the old 2-arg overload).
-- Lists stay jsonb ARRAYS (existing consumers unchanged); every row carries `total` = size of the whole filtered
-- set, so a client pages with p_filter.offset / p_offset until offset >= total. Page size stays 200.

create or replace function admin_summary(p_actor text)
returns jsonb language plpgsql stable as $$
declare v_sa boolean;
begin
  perform admin_guard(p_actor, true);
  v_sa := 'superadmin' = any(roles_for(p_actor));
  return jsonb_build_object(
    'participants', (select count(*) from profiles),
    'onboarded', (select count(*) from profiles where onboarded_at is not null),
    'purchases', (select coalesce(jsonb_object_agg(status, n), '{}'::jsonb)
                  from (select status, count(*) n from purchases group by status) s),
    'codes', (select coalesce(jsonb_object_agg(status, n), '{}'::jsonb)
              from (select status, count(*) n from access_codes group by status) s),
    'perlu_semakan', (select count(*) from purchases where status = 'perlu_semakan'),
    -- coach sees counts only, never webhook rows
    'webhook_errors', case when v_sa then (
        select coalesce(jsonb_agg(jsonb_build_object('at', w.at, 'order_ref', w.order_ref, 'kind', w.kind, 'message', w.message)
                                  order by w.at desc, w.id desc), '[]'::jsonb)
        from (select id, at, order_ref, kind, message from bcl_webhook_log
              where ok = false or kind in ('ralat', 'error')
              order by at desc, id desc limit 10) w)
      else '[]'::jsonb end,
    'email_queue', jsonb_build_object(
      'pending', (select count(*) from email_queue where status = 'pending'),
      'failed', (select count(*) from email_queue where status = 'failed'))
  );
end;
$$;

/** Non-negative integer offset from text (bad / missing -> 0). */
create or replace function admin_offset(p text)
returns int language sql immutable as $$
  select case when p ~ '^\d{1,9}$' then p::int else 0 end;
$$;

drop function if exists admin_participants(text, text);
create or replace function admin_participants(p_actor text, p_q text default null, p_offset int default 0)
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
             to_jsonb(entitlements_for(p.id)) as entitlements, count(*) over () as total
      from profiles p
      where v_like is null
         or p.full_name ilike v_like or p.email ilike v_like or p.phone ilike v_like
      order by p.created_at desc, p.id
      limit 200 offset greatest(coalesce(p_offset, 0), 0)
    ) x
  );
end;
$$;

create or replace function admin_purchases(p_actor text, p_filter jsonb default '{}'::jsonb)
returns jsonb language plpgsql stable as $$
declare
  v_status text := nullif(p_filter->>'status', '');
  v_batch  uuid := nullif(p_filter->>'batch_id', '')::uuid;
  v_offset int  := admin_offset(p_filter->>'offset');
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
             pu.claimed_by, pu.claimed_at, pu.source, pu.created_at,
             -- unclaimed for > 24 h while an account already uses the buyer's email: someone else may hold it
             (pu.status = 'belum_dituntut' and pu.created_at < now() - interval '24 hours'
              and normalize_email(pu.email) <> ''
              and exists (select 1 from profiles pr where normalize_email(pr.email) = normalize_email(pu.email)))
               as squatter_suspect,
             count(*) over () as total
      from purchases pu left join packages k on k.id = pu.package_id
      where (v_status is null or pu.status = v_status)
        and (v_batch is null or pu.batch_id = v_batch)
        and (v_like is null or pu.order_ref ilike v_like or pu.buyer_name ilike v_like
             or pu.email ilike v_like or pu.phone ilike v_like)
      order by pu.created_at desc, pu.id
      limit 200 offset v_offset
    ) x
  );
end;
$$;

create or replace function admin_codes(p_actor text, p_filter jsonb default '{}'::jsonb)
returns jsonb language plpgsql stable as $$
declare
  v_status text := nullif(p_filter->>'status', '');
  v_batch  uuid := nullif(p_filter->>'batch_id', '')::uuid;
  v_offset int  := admin_offset(p_filter->>'offset');
  v_like   text;
begin
  perform admin_guard(p_actor, false);
  if nullif(btrim(coalesce(p_filter->>'q', '')), '') is not null then
    v_like := '%' || replace(replace(replace(btrim(p_filter->>'q'), '\', '\\'), '%', '\%'), '_', '\_') || '%';
  end if;
  return (
    select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at desc, x.id), '[]'::jsonb)
    from (
      select c.*, k.name as package_name, count(*) over () as total
      from access_codes c left join packages k on k.id = c.package_id
      where (v_status is null or c.status = v_status)
        and (v_batch is null or c.batch_id = v_batch)
        and (v_like is null or c.code ilike v_like or c.buyer_name ilike v_like or c.buyer_email ilike v_like
             or c.batch_label ilike v_like or c.redeemed_by ilike v_like)
      order by c.created_at desc, c.id
      limit 200 offset v_offset
    ) x
  );
end;
$$;
