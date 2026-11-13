-- 0002_purchases: BCL purchases, registration matching, rate limit, entitlements from purchases.
-- Idempotent: create table if not exists / create or replace function.

-- ---------- normalisers (same rules as src/lib/phone.ts) ----------
create or replace function normalize_email(p text)
returns text language sql immutable as $$
  select lower(btrim(coalesce(p, '')));
$$;

-- Malaysian mobile -> "601…" digits (8-9 digits after 601), else null.
create or replace function normalize_phone(p text)
returns text language plpgsql immutable as $$
declare d text;
begin
  if p is null then return null; end if;
  d := regexp_replace(p, '\D', '', 'g');
  if d = '' then return null; end if;
  if d like '60%' then
    null;
  elsif d like '0%' then
    d := '60' || substr(d, 2);
  elsif d like '1%' then
    d := '60' || d;
  else
    return null;
  end if;
  if d ~ '^601\d{8,9}$' then return d; end if;
  return null;
end;
$$;

-- ---------- tables ----------
create table if not exists purchases (
  id            uuid primary key default gen_random_uuid(),
  order_ref     text not null unique,
  batch_id      uuid references batches(id),
  package_id    text,
  entitlements  text[] not null default '{}',
  buyer_name    text,
  email         text,
  phone         text,
  amount_rm     numeric,
  paid_at       timestamptz,
  status        text not null default 'belum_dituntut'
                check (status in ('belum_dituntut','dituntut','perlu_semakan','dibatalkan')),
  review_reason text,
  claimed_by    text,
  claimed_at    timestamptz,
  source        text not null default 'bcl' check (source in ('bcl','manual')),
  raw           jsonb,
  created_at    timestamptz not null default now()
);
create index if not exists purchases_match_idx on purchases (email, phone);
create index if not exists purchases_claimed_by_idx on purchases (claimed_by) where claimed_by is not null;

create table if not exists bcl_form_map (
  id          uuid primary key default gen_random_uuid(),
  formable_id text,
  amount_rm   numeric,
  field_value text,
  package_id  text,
  active      boolean not null default true
);

-- kind is free-form ('ok','ignored','skipped','error', ...) so Apps Script can add values.
create table if not exists bcl_webhook_log (
  id        bigserial primary key,
  order_ref text,
  kind      text,
  ok        boolean,
  message   text,
  payload   jsonb,
  at        timestamptz not null default now()
);
create index if not exists bcl_webhook_log_at_idx on bcl_webhook_log (at desc);

create table if not exists email_queue (
  id         uuid primary key default gen_random_uuid(),
  to_email   text not null,
  subject    text,
  body_html  text,
  kind       text,
  ref_id     text,
  status     text not null default 'pending' check (status in ('pending','sent','failed')),
  attempts   int not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  sent_at    timestamptz
);
create index if not exists email_queue_pending_idx on email_queue (created_at) where status = 'pending';
create index if not exists email_queue_ref_idx on email_queue (ref_id);

create table if not exists rate_attempts (
  id      bigserial primary key,
  kind    text not null,
  subject text not null,
  ok      boolean not null,
  at      timestamptz not null default now()
);
create index if not exists rate_attempts_lookup_idx on rate_attempts (kind, subject, at desc);

-- ---------- rate limit ----------
-- Blocked when ANY subject has >= 5 failed attempts of this kind in the last 15 minutes.
create or replace function rate_blocked(p_kind text, p_subjects text[])
returns boolean language sql stable as $$
  select exists (
    select 1 from rate_attempts
    where kind = p_kind and subject = any(p_subjects) and ok = false
      and at > now() - interval '15 minutes'
    group by subject
    having count(*) >= 5
  );
$$;

create or replace function rate_record(p_kind text, p_subjects text[], p_ok boolean)
returns void language sql as $$
  insert into rate_attempts (kind, subject, ok)
  select p_kind, s, p_ok from unnest(p_subjects) s;
$$;

-- ---------- entitlements: manual grants + claimed purchases ----------
create or replace function entitlements_for(p_uid text)
returns text[] language sql stable as $$
  select coalesce(array_agg(distinct k order by k), '{}'::text[])
  from (
    select g.item_key as k from manual_grants g
    where g.user_id = p_uid and g.revoked_at is null
    union all
    select unnest(pu.entitlements) from purchases pu
    where pu.claimed_by = p_uid and pu.status = 'dituntut'
  ) x;
$$;

-- ---------- upsert_purchase (called by the Worker with service credentials) ----------
create or replace function upsert_purchase(p jsonb)
returns jsonb language plpgsql as $$
declare
  v_ref     text := nullif(btrim(coalesce(p->>'order_ref', '')), '');
  v_email   text := nullif(normalize_email(p->>'email'), '');
  v_phone   text := normalize_phone(p->>'phone');
  v_paid    timestamptz := nullif(p->>'paid_at', '')::timestamptz;
  v_amount  numeric := nullif(p->>'amount_rm', '')::numeric;
  v_pkg     text := nullif(p->>'package_id', '');
  v_source  text := coalesce(nullif(p->>'source', ''), 'bcl');
  v_reason  text := nullif(p->>'review_reason', '');
  v_name    text := nullif(btrim(coalesce(p->>'buyer_name', '')), '');
  v_batch   uuid;
  v_ents    text[] := '{}';
  v_status  text := 'belum_dituntut';
  v_prof    text;
  v_row     purchases;
  v_inserted boolean := false;
begin
  if v_ref is null then raise exception 'order_ref required'; end if;
  if v_email is not null and position('@' in v_email) = 0 then v_email := null; end if;

  if v_pkg is not null then
    if exists (select 1 from packages where id = v_pkg) then
      select coalesce(array_agg(item_key order by item_key), '{}') into v_ents
      from package_items where package_id = v_pkg;
    else
      v_pkg := null;
      v_reason := coalesce(v_reason, 'Pakej tidak dikenali');
    end if;
  end if;

  if v_paid is not null then
    select id into v_batch from batches
    where sales_open_at <= v_paid and v_paid <= sales_close_at
    order by sales_open_at desc limit 1;
  end if;

  if v_pkg is null then
    v_status := 'perlu_semakan';
    v_reason := coalesce(v_reason, 'Pakej tidak dikenali');
  elsif v_batch is null then
    v_status := 'perlu_semakan';
    v_reason := 'Tiada batch dibuka';
  elsif v_phone is null then
    v_status := 'perlu_semakan';
    v_reason := 'Telefon tidak sah';
  elsif v_email is null then
    v_status := 'perlu_semakan';
    v_reason := 'Emel tidak sah';
  end if;

  insert into purchases (order_ref, batch_id, package_id, entitlements, buyer_name, email, phone,
                         amount_rm, paid_at, status, review_reason, source, raw)
  values (v_ref, v_batch, v_pkg, v_ents, v_name, v_email, v_phone,
          v_amount, v_paid, v_status,
          case when v_status = 'perlu_semakan' then v_reason end,
          case when v_source in ('bcl','manual') then v_source else 'bcl' end,
          p->'raw')
  on conflict (order_ref) do nothing
  returning * into v_row;

  if found then
    v_inserted := true;
    if v_status = 'belum_dituntut' then
      select id into v_prof from profiles
      where email = v_email and normalize_phone(phone) = v_phone
      limit 1;
      if v_prof is not null then
        update purchases set status = 'dituntut', claimed_by = v_prof, claimed_at = now()
        where id = v_row.id returning * into v_row;
      end if;
    end if;
    if v_email is not null then
      insert into email_queue (to_email, subject, body_html, kind, ref_id)
      values (v_email, 'Pembelian anda telah diterima - HDM Booster',
              '<p>Salam ' || replace(replace(replace(coalesce(v_name, ''), '&', '&amp;'), '<', '&lt;'), '>', '&gt;') ||
              ',</p><p>Terima kasih. Pembelian anda (' ||
              replace(replace(replace(v_ref, '&', '&amp;'), '<', '&lt;'), '>', '&gt;') ||
              ') telah diterima. Daftar akaun HDM Booster dengan emel dan nombor telefon yang sama semasa pembelian.</p>',
              'purchase_welcome', v_row.id::text);
    end if;
  else
    select * into v_row from purchases where order_ref = v_ref;
  end if;

  return jsonb_build_object('row', to_jsonb(v_row), 'inserted', v_inserted);
end;
$$;

-- ---------- registration matching ----------
create or replace function register_check(p_email text, p_phone text)
returns jsonb language plpgsql stable as $$
declare
  v_email text := nullif(normalize_email(p_email), '');
  v_phone text := normalize_phone(p_phone);
  v_pk    text[];
begin
  if v_email is null or v_phone is null then
    return jsonb_build_object('ok', false, 'reason', 'tiada_pembelian');
  end if;
  select coalesce(array_agg(distinct coalesce(k.name, pu.package_id)), '{}') into v_pk
  from purchases pu left join packages k on k.id = pu.package_id
  where pu.email = v_email and pu.phone = v_phone and pu.status in ('belum_dituntut','dituntut');
  if cardinality(v_pk) = 0 then
    return jsonb_build_object('ok', false, 'reason', 'tiada_pembelian');
  end if;
  return jsonb_build_object('ok', true, 'packages', to_jsonb(v_pk),
    'profile_exists', exists (select 1 from profiles where email = v_email));
end;
$$;

create or replace function register_complete(p_uid text, p_email text, p_phone text, p_name text)
returns jsonb language plpgsql as $$
declare
  v_email text := nullif(normalize_email(p_email), '');
  v_phone text := normalize_phone(p_phone);
  v_owner text;
  v_n     int;
begin
  if p_uid is null or p_uid = '' or v_email is null or v_phone is null
     or not exists (select 1 from purchases
                    where email = v_email and phone = v_phone and status in ('belum_dituntut','dituntut')) then
    return jsonb_build_object('ok', false, 'reason', 'tiada_pembelian');
  end if;

  -- profiles.email is unique and id is the pk: a concurrent duplicate waits, then does nothing.
  insert into profiles (id, full_name, email, phone)
  values (p_uid, nullif(btrim(coalesce(p_name, '')), ''), v_email, v_phone)
  on conflict do nothing;
  get diagnostics v_n = row_count;

  if v_n = 0 then
    select id into v_owner from profiles where email = v_email;
    if v_owner is distinct from p_uid then
      return jsonb_build_object('ok', false, 'reason', 'sudah_didaftar');
    end if;
  end if;

  update purchases set status = 'dituntut', claimed_by = p_uid, claimed_at = now()
  where email = v_email and phone = v_phone and status = 'belum_dituntut';

  perform log_audit(p_uid, 'register.complete', 'profile', p_uid, jsonb_build_object('email', v_email));
  return jsonb_build_object('ok', true, 'entitlements', to_jsonb(entitlements_for(p_uid)));
end;
$$;
