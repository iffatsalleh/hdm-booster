-- 0007_recovery: recovery paths for buyers whose order did not match cleanly, and the email sent per status.
--  * upsert_purchase re-evaluates an existing row while it is 'perlu_semakan' (reprocess really re-checks);
--    belum_dituntut / dituntut / dibatalkan rows are never changed by it. Returns {row, inserted, reevaluated, changed}.
--  * purchase_welcome is queued only for a registrable (belum_dituntut) purchase; an auto-claimed purchase of an
--    existing account queues purchase_added. A perlu_semakan row that becomes registrable then gets its welcome.
--  * admin_purchase_action: new 'set_buyer'; set_package / set_buyer / restore recompute batch_id from paid_at when
--    null (or take a validated payload.batch_id) and re-evaluate unclaimed rows.
--  * admin_add_purchase: manual purchase (buyer paid outside BCL). admin_orphan_orders: BCL orders without a purchase.
--  * admin_summary.webhook_errors: real errors only (ignored / skipped orders live in admin_orphan_orders).
--  * admin_participants / admin_purchases: a phone-like q also matches normalised phones ("012…" finds "6012…").
-- Idempotent: create or replace only.

-- ---------- small helpers ----------
/** Normalised email when it looks like one (x@y.z), else null. */
create or replace function clean_email(p text)
returns text language sql immutable as $$
  select case when v ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then v end
  from (select nullif(normalize_email(p), '') as v) x;
$$;

/** Trimmed name with inner whitespace collapsed, or null. */
create or replace function clean_name(p text)
returns text language sql immutable as $$
  select nullif(regexp_replace(btrim(coalesce(p, '')), '\s+', ' ', 'g'), '');
$$;

/** Batch whose sales window contains p_at (latest opening first), or null. */
create or replace function purchase_batch_at(p_at timestamptz)
returns uuid language sql stable as $$
  select id from batches
  where p_at is not null and sales_open_at <= p_at and p_at <= sales_close_at
  order by sales_open_at desc limit 1;
$$;

/** Why a purchase cannot be registered yet, in the order upsert_purchase always used; null = registrable. */
create or replace function purchase_problem(p_pkg text, p_batch uuid, p_email text, p_phone text)
returns text language sql stable as $$
  select case
    when p_pkg is null or not exists (select 1 from packages where id = p_pkg) then 'Pakej tidak dikenali'
    when p_batch is null then 'Tiada batch dibuka'
    when p_phone is null then 'Telefon tidak sah'
    when p_email is null then 'Emel tidak sah'
  end;
$$;

/** Entitlements of a package (sorted), '{}' for null / unknown. */
create or replace function package_entitlements(p_pkg text)
returns text[] language sql stable as $$
  select coalesce(array_agg(item_key order by item_key), '{}') from package_items where package_id = p_pkg;
$$;

/**
 * Queues one email of p_kind for the purchase's current address, once per (purchase, kind, address).
 * Mail.gs.js renders the text by kind: purchase_welcome (register) or purchase_added (access added, log in).
 */
create or replace function purchase_queue_mail(p_id uuid, p_kind text)
returns boolean language plpgsql as $$
declare v purchases;
begin
  select * into v from purchases where id = p_id;
  if not found or v.email is null then return false; end if;
  if exists (select 1 from email_queue where ref_id = p_id::text and kind = p_kind and to_email = v.email) then
    return false;
  end if;
  insert into email_queue (to_email, subject, kind, ref_id)
  values (v.email,
          case p_kind when 'purchase_added' then 'Akses baharu telah ditambah ke akaun anda - HDM Booster'
                      else 'Pembelian anda telah diterima - HDM Booster' end,
          p_kind, p_id::text);
  return true;
end;
$$;

/**
 * After a purchase changed: a registrable row whose email + phone match an existing account is claimed for it
 * (purchase_added); otherwise a registrable row gets its welcome email. Other statuses are left alone.
 */
create or replace function purchase_settle(p_id uuid)
returns purchases language plpgsql as $$
declare
  v      purchases;
  v_prof text;
begin
  select * into v from purchases where id = p_id;
  if v.status <> 'belum_dituntut' then return v; end if;
  if v.email is not null and v.phone is not null then
    select id into v_prof from profiles where email = v.email and normalize_phone(phone) = v.phone limit 1;
  end if;
  if v_prof is not null then
    update purchases set status = 'dituntut', claimed_by = v_prof, claimed_at = now()
    where id = p_id returning * into v;
    perform purchase_queue_mail(p_id, 'purchase_added');
  else
    perform purchase_queue_mail(p_id, 'purchase_welcome');
  end if;
  return v;
end;
$$;

/**
 * Recomputes an UNCLAIMED purchase from its current data: entitlements from the package, batch (kept, else from
 * paid_at), status + review_reason, then settles it (auto-claim / email). A specific reason given earlier for an
 * unknown package (e.g. 'Borang tidak dikenali') is kept while the package is still unknown.
 */
create or replace function purchase_reevaluate(p_id uuid)
returns purchases language plpgsql as $$
declare
  v        purchases;
  v_batch  uuid;
  v_reason text;
begin
  select * into v from purchases where id = p_id for update;
  v_batch := coalesce(v.batch_id, purchase_batch_at(v.paid_at));
  v_reason := purchase_problem(v.package_id, v_batch, v.email, v.phone);
  if v_reason = 'Pakej tidak dikenali' and v.review_reason is not null
     and v.review_reason not in ('Tiada batch dibuka', 'Telefon tidak sah', 'Emel tidak sah') then
    v_reason := v.review_reason;
  end if;
  update purchases
     set batch_id = v_batch,
         entitlements = package_entitlements(package_id),
         status = case when v_reason is null then 'belum_dituntut' else 'perlu_semakan' end,
         review_reason = v_reason
   where id = p_id;
  return purchase_settle(p_id);
end;
$$;

-- ---------- upsert_purchase (Worker /internal/purchase, from Apps Script) ----------
create or replace function upsert_purchase(p jsonb)
returns jsonb language plpgsql as $$
declare
  v_ref     text := nullif(btrim(coalesce(p->>'order_ref', '')), '');
  v_email   text := clean_email(p->>'email');
  v_phone   text := normalize_phone(p->>'phone');
  v_paid    timestamptz := nullif(p->>'paid_at', '')::timestamptz;
  v_amount  numeric := nullif(p->>'amount_rm', '')::numeric;
  v_pkg     text := nullif(p->>'package_id', '');
  v_source  text := coalesce(nullif(p->>'source', ''), 'bcl');
  v_reason  text := nullif(p->>'review_reason', '');
  v_name    text := nullif(btrim(coalesce(p->>'buyer_name', '')), ''); -- as sent (Apps Script already tidies it)
  v_raw    jsonb := nullif(p->'raw', 'null'::jsonb);
  v_batch   uuid;
  v_problem text;
  v_old     purchases;
  v_row     purchases;
begin
  if v_ref is null then raise exception 'order_ref required'; end if;
  if v_pkg is not null and not exists (select 1 from packages where id = v_pkg) then
    v_pkg := null;
    v_reason := coalesce(v_reason, 'Pakej tidak dikenali');
  end if;

  select * into v_old from purchases where order_ref = v_ref for update;
  if found then
    -- only a row still under review is looked at again; everything else is final for this path
    if v_old.status <> 'perlu_semakan' then
      return jsonb_build_object('row', to_jsonb(v_old), 'inserted', false, 'reevaluated', false, 'changed', false);
    end if;
    -- new non-empty values win; an admin's earlier fix is kept when BCL still sends nothing usable
    update purchases
       set package_id = coalesce(v_pkg, package_id),
           buyer_name = coalesce(v_name, buyer_name),
           email = coalesce(v_email, email),
           phone = coalesce(v_phone, phone),
           amount_rm = coalesce(v_amount, amount_rm),
           paid_at = coalesce(paid_at, v_paid),
           review_reason = coalesce(v_reason, review_reason),
           raw = coalesce(v_raw, raw)
     where id = v_old.id;
    v_row := purchase_reevaluate(v_old.id);
    return jsonb_build_object('row', to_jsonb(v_row), 'inserted', false, 'reevaluated', true,
      'changed', (to_jsonb(v_row) - 'raw') is distinct from (to_jsonb(v_old) - 'raw'));
  end if;

  v_batch := purchase_batch_at(v_paid);
  v_problem := purchase_problem(v_pkg, v_batch, v_email, v_phone);
  if v_problem = 'Pakej tidak dikenali' then v_problem := coalesce(v_reason, v_problem); end if;

  insert into purchases (order_ref, batch_id, package_id, entitlements, buyer_name, email, phone,
                         amount_rm, paid_at, status, review_reason, source, raw)
  values (v_ref, v_batch, v_pkg, package_entitlements(v_pkg), v_name, v_email, v_phone,
          v_amount, v_paid, case when v_problem is null then 'belum_dituntut' else 'perlu_semakan' end, v_problem,
          case when v_source in ('bcl','manual') then v_source else 'bcl' end, v_raw)
  on conflict (order_ref) do nothing
  returning * into v_row;

  if not found then
    -- a concurrent call inserted it first
    select * into v_row from purchases where order_ref = v_ref;
    return jsonb_build_object('row', to_jsonb(v_row), 'inserted', false, 'reevaluated', false, 'changed', false);
  end if;
  v_row := purchase_settle(v_row.id);
  return jsonb_build_object('row', to_jsonb(v_row), 'inserted', true, 'reevaluated', false, 'changed', true);
end;
$$;

-- ---------- admin: purchase actions ----------
create or replace function admin_purchase_action(p_actor text, p_id uuid, p_action text, p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql as $$
declare
  v_pu     purchases;
  v_target text;
  v_pkg    text;
  v_bid    text := nullif(btrim(coalesce(p_payload->>'batch_id', '')), '');
  v_batch  uuid;
  v_email  text;
  v_phone  text;
begin
  perform admin_guard(p_actor, false);
  if p_action is null or p_action not in ('assign','set_package','cancel','restore','set_buyer') then
    raise exception 'tindakan_tidak_sah';
  end if;
  select * into v_pu from purchases where id = p_id for update;
  if not found then raise exception 'pembelian_tidak_wujud'; end if;

  -- explicit batch (set_package / set_buyer / restore) must exist
  if v_bid is not null and p_action in ('set_package','set_buyer','restore') then
    if v_bid !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
       or not exists (select 1 from batches where id = v_bid::uuid) then
      raise exception 'batch_tidak_wujud';
    end if;
    v_batch := v_bid::uuid;
  end if;

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
    update purchases
       set package_id = v_pkg, entitlements = package_entitlements(v_pkg),
           batch_id = coalesce(v_batch, batch_id, purchase_batch_at(paid_at))
     where id = p_id returning * into v_pu;
    if v_pu.status = 'perlu_semakan' then v_pu := purchase_reevaluate(p_id); end if;

  elsif p_action = 'set_buyer' then
    v_email := clean_email(p_payload->>'email');
    if v_email is null then raise exception 'emel_tidak_sah'; end if;
    v_phone := normalize_phone(p_payload->>'phone');
    if v_phone is null then raise exception 'telefon_tidak_sah'; end if;
    update purchases
       set buyer_name = coalesce(clean_name(p_payload->>'buyer_name'), buyer_name), email = v_email, phone = v_phone,
           batch_id = coalesce(v_batch, batch_id, purchase_batch_at(paid_at))
     where id = p_id returning * into v_pu;
    if v_pu.status = 'perlu_semakan' then
      v_pu := purchase_reevaluate(p_id);
    elsif v_pu.status = 'belum_dituntut' then
      v_pu := purchase_settle(p_id); -- new address gets its welcome; a matching account claims it
    end if;

  elsif p_action = 'cancel' then
    update purchases set status = 'dibatalkan' where id = p_id returning * into v_pu;

  elsif p_action = 'restore' then
    update purchases set batch_id = coalesce(v_batch, batch_id, purchase_batch_at(paid_at))
    where id = p_id returning * into v_pu;
    if v_pu.claimed_by is not null then
      update purchases set status = 'dituntut' where id = p_id returning * into v_pu;
    else
      v_pu := purchase_reevaluate(p_id);
    end if;
  end if;

  perform log_audit(p_actor, 'purchase.' || p_action, 'purchase', p_id::text,
    jsonb_build_object('payload', p_payload, 'order_ref', v_pu.order_ref, 'status', v_pu.status));
  return to_jsonb(v_pu) - 'raw';
end;
$$;

-- ---------- admin: manual purchase (buyer paid outside BCL) ----------
create or replace function admin_add_purchase(p_actor text, p jsonb)
returns jsonb language plpgsql as $$
declare
  v_pkg    text := nullif(btrim(coalesce(p->>'package_id', '')), '');
  v_name   text := clean_name(p->>'buyer_name');
  v_email  text := clean_email(p->>'email');
  v_phone  text := normalize_phone(p->>'phone');
  v_amt    text := nullif(btrim(coalesce(p->>'amount_rm', '')), '');
  v_bid    text := nullif(btrim(coalesce(p->>'batch_id', '')), '');
  v_batch  uuid;
  v_ref    text;
  v_reason text;
  v_row    purchases;
begin
  perform admin_guard(p_actor, false);
  if v_pkg is null or not exists (select 1 from packages where id = v_pkg) then raise exception 'pakej_tidak_wujud'; end if;
  if v_name is null then raise exception 'nama_diperlukan'; end if;
  if v_email is null then raise exception 'emel_tidak_sah'; end if;
  if v_phone is null then raise exception 'telefon_tidak_sah'; end if;
  if v_amt is not null and v_amt !~ '^\d{1,7}(\.\d{1,2})?$' then raise exception 'jumlah_tidak_sah'; end if;
  if v_bid is not null then
    if v_bid !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
       or not exists (select 1 from batches where id = v_bid::uuid) then
      raise exception 'batch_tidak_wujud';
    end if;
    v_batch := v_bid::uuid;
  else
    v_batch := purchase_batch_at(now());
  end if;
  v_reason := purchase_problem(v_pkg, v_batch, v_email, v_phone);

  for i in 1..5 loop
    v_ref := 'MANUAL-' || to_char(now() at time zone 'Asia/Kuala_Lumpur', 'YYYYMMDD') || '-'
             || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
    insert into purchases (order_ref, batch_id, package_id, entitlements, buyer_name, email, phone,
                           amount_rm, paid_at, status, review_reason, source)
    values (v_ref, v_batch, v_pkg, package_entitlements(v_pkg), v_name, v_email, v_phone,
            v_amt::numeric, now(), case when v_reason is null then 'belum_dituntut' else 'perlu_semakan' end, v_reason,
            'manual')
    on conflict (order_ref) do nothing
    returning * into v_row;
    exit when found;
  end loop;
  if v_row.id is null then raise exception 'gagal_cipta_pembelian'; end if;

  v_row := purchase_settle(v_row.id);
  perform log_audit(p_actor, 'purchase.manual_add', 'purchase', v_row.id::text,
    jsonb_build_object('order_ref', v_row.order_ref, 'package_id', v_pkg, 'batch_id', v_batch, 'email', v_email,
                       'status', v_row.status));
  return to_jsonb(v_row) - 'raw';
end;
$$;

-- ---------- admin: BCL orders that never became a purchase ----------
/** Latest 'ignored' / 'error' log per order_ref that has no purchase row (newest first, 200 per page). */
create or replace function admin_orphan_orders(p_actor text, p_offset int default 0)
returns jsonb language plpgsql stable as $$
begin
  perform admin_guard(p_actor, false);
  return (
    select coalesce(jsonb_agg(to_jsonb(x) order by x.at desc, x.order_ref), '[]'::jsonb)
    from (
      select l.order_ref, l.kind, l.message, l.at, c.attempts, c.first_at, count(*) over () as total
      from (select distinct on (order_ref) order_ref, kind, message, at
              from bcl_webhook_log
             where order_ref is not null and kind in ('ignored', 'error', 'ralat')
             order by order_ref, at desc, id desc) l
      join (select order_ref, count(*) as attempts, min(at) as first_at
              from bcl_webhook_log
             where order_ref is not null and kind in ('ignored', 'error', 'ralat')
             group by order_ref) c on c.order_ref = l.order_ref
      where not exists (select 1 from purchases pu where pu.order_ref = l.order_ref)
      order by l.at desc, l.order_ref
      limit 200 offset greatest(coalesce(p_offset, 0), 0)
    ) x
  );
end;
$$;

-- ---------- admin_summary: webhook errors are real errors only ----------
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
    -- coach sees counts only, never webhook rows. 'ignored' / 'skipped' are not errors (see admin_orphan_orders).
    'webhook_errors', case when v_sa then (
        select coalesce(jsonb_agg(jsonb_build_object('at', w.at, 'order_ref', w.order_ref, 'kind', w.kind, 'message', w.message)
                                  order by w.at desc, w.id desc), '[]'::jsonb)
        from (select id, at, order_ref, kind, message from bcl_webhook_log
              where kind in ('ralat', 'error')
                 or (ok = false and coalesce(kind, '') not in ('ignored', 'skipped'))
              order by at desc, id desc limit 10) w)
      else '[]'::jsonb end,
    'email_queue', jsonb_build_object(
      'pending', (select count(*) from email_queue where status = 'pending'),
      'failed', (select count(*) from email_queue where status = 'failed'))
  );
end;
$$;

-- ---------- admin search: phone-like q also matches normalised phones ----------
/** LIKE pattern for a phone-like search ("012-345", "+6012…"): digits with a leading 0 read as 60…; else null. */
create or replace function admin_phone_like(p_q text)
returns text language sql immutable as $$
  select case
    when btrim(coalesce(p_q, '')) ~ '^[0-9 +()-]+$' and length(d) >= 3
      then '%' || case when d like '0%' then '6' || d else d end || '%'
  end
  from (select regexp_replace(coalesce(p_q, ''), '\D', '', 'g') as d) x;
$$;

create or replace function admin_participants(p_actor text, p_q text default null, p_offset int default 0)
returns jsonb language plpgsql stable as $$
declare
  v_like  text;
  v_phone text := admin_phone_like(p_q);
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
         or (v_phone is not null and coalesce(normalize_phone(p.phone), p.phone) like v_phone)
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
  v_phone  text := admin_phone_like(p_filter->>'q');
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
             or pu.email ilike v_like or pu.phone ilike v_like
             or (v_phone is not null and coalesce(normalize_phone(pu.phone), pu.phone) like v_phone))
      order by pu.created_at desc, pu.id
      limit 200 offset v_offset
    ) x
  );
end;
$$;
