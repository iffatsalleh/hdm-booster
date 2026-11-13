-- 0003_codes: access codes (generate / redeem / admin actions) + entitlements from codes.
-- Idempotent: create table if not exists / create or replace function.

create table if not exists access_codes (
  id               uuid primary key default gen_random_uuid(),
  code             text not null unique,
  package_id       text references packages(id),
  entitlements     text[] not null default '{}',
  batch_id         uuid references batches(id),
  batch_label      text,
  status           text not null default 'belum_guna'
                   check (status in ('belum_guna','aktif','dibatalkan')),
  redeemed_by      text,
  redeemed_at      timestamptz,
  access_starts_at timestamptz,
  access_ends_at   timestamptz,
  buyer_name       text,
  buyer_phone      text,
  buyer_email      text,
  order_ref        text,
  note             text,
  created_by       text,
  created_at       timestamptz not null default now()
);
create index if not exists access_codes_redeemed_by_idx on access_codes (redeemed_by) where redeemed_by is not null;
create index if not exists access_codes_batch_idx on access_codes (batch_id);

-- ---------- entitlements: manual grants + claimed purchases + active access codes ----------
create or replace function entitlements_for(p_uid text)
returns text[] language sql stable as $$
  select coalesce(array_agg(distinct k order by k), '{}'::text[])
  from (
    select g.item_key as k from manual_grants g
    where g.user_id = p_uid and g.revoked_at is null
    union all
    select unnest(pu.entitlements) from purchases pu
    where pu.claimed_by = p_uid and pu.status = 'dituntut'
    union all
    select unnest(c.entitlements) from access_codes c
    where c.redeemed_by = p_uid and c.status = 'aktif'
      and (c.access_ends_at is null or c.access_ends_at > now())
  ) x;
$$;

-- ---------- code generation ----------
-- 'HDMB-XXXX-XXXX' over a 31-char alphabet. Random bytes >= 248 (31*8) are rejected so
-- `byte % 31` is uniform (no modulo bias).
create or replace function gen_code_string()
returns text language plpgsql as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_out    text := '';
  v_bytes  bytea;
  v_b      int;
  i        int;
begin
  while length(v_out) < 8 loop
    v_bytes := gen_random_bytes(16);
    for i in 0..15 loop
      v_b := get_byte(v_bytes, i);
      if v_b < 248 then
        v_out := v_out || substr(alphabet, (v_b % 31) + 1, 1);
        exit when length(v_out) = 8;
      end if;
    end loop;
  end loop;
  return 'HDMB-' || substr(v_out, 1, 4) || '-' || substr(v_out, 5, 4);
end;
$$;

create or replace function generate_codes(
  p_actor text, p_package_id text, p_count int, p_batch_id uuid, p_label text,
  p_buyer jsonb default null, p_access_ends_at timestamptz default null)
returns setof access_codes language plpgsql as $$
declare
  v_ents  text[];
  v_row   access_codes;
  v_n     int := 0;
  v_tries int;
begin
  if not ('superadmin' = any(roles_for(p_actor))) then
    raise exception 'tiada_kebenaran';
  end if;
  if p_count is null or p_count < 1 or p_count > 500 then
    raise exception 'bilangan_tidak_sah';
  end if;
  if not exists (select 1 from packages where id = p_package_id) then
    raise exception 'pakej_tidak_wujud';
  end if;
  select coalesce(array_agg(item_key order by item_key), '{}') into v_ents
  from package_items where package_id = p_package_id;

  while v_n < p_count loop
    v_tries := 0;
    loop
      insert into access_codes (code, package_id, entitlements, batch_id, batch_label, access_ends_at,
                                buyer_name, buyer_phone, buyer_email, order_ref, created_by)
      values (gen_code_string(), p_package_id, v_ents, p_batch_id, p_label, p_access_ends_at,
              p_buyer->>'name', p_buyer->>'phone', p_buyer->>'email', p_buyer->>'order_ref', p_actor)
      on conflict (code) do nothing
      returning * into v_row;
      exit when found;
      v_tries := v_tries + 1;
      if v_tries >= 20 then raise exception 'gagal_jana_kod'; end if;
    end loop;
    v_n := v_n + 1;
    return next v_row;
  end loop;

  perform log_audit(p_actor, 'code.generate', 'access_code_batch', coalesce(p_batch_id::text, p_label),
    jsonb_build_object('package_id', p_package_id, 'count', p_count, 'label', p_label,
                       'access_ends_at', p_access_ends_at));
  return;
end;
$$;

-- ---------- redeem ----------
create or replace function redeem_code(p_uid text, p_code text)
returns jsonb language plpgsql as $$
declare
  v_c      access_codes;
  v_before text[];
  v_after  text[];
  v_items  text[];
begin
  if p_uid is null or p_uid = '' then
    return jsonb_build_object('ok', false, 'reason', 'tidak_sah');
  end if;

  -- Row lock serialises concurrent redeems of the same code: the loser re-reads status = 'aktif'.
  select * into v_c from access_codes where code = p_code for update;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'tidak_sah');
  end if;
  if v_c.status = 'dibatalkan' then
    return jsonb_build_object('ok', false, 'reason', 'dibatalkan');
  end if;
  if v_c.status = 'aktif' then
    return jsonb_build_object('ok', false, 'reason', 'sudah_digunakan');
  end if;
  if v_c.access_ends_at is not null and v_c.access_ends_at <= now() then
    return jsonb_build_object('ok', false, 'reason', 'tamat_tempoh');
  end if;

  v_before := entitlements_for(p_uid);
  update access_codes
     set status = 'aktif', redeemed_by = p_uid, redeemed_at = now(), access_starts_at = now()
   where id = v_c.id;
  v_after := entitlements_for(p_uid);

  select coalesce(array_agg(k order by k), '{}') into v_items
  from unnest(v_after) k where k <> all(v_before);

  perform log_audit(p_uid, 'code.redeem', 'access_code', v_c.id::text,
    jsonb_build_object('package_id', v_c.package_id, 'items', to_jsonb(v_items)));
  return jsonb_build_object('ok', true, 'items', to_jsonb(v_items));
end;
$$;

-- ---------- admin actions ----------
create or replace function admin_code_action(p_actor text, p_id uuid, p_action text, p_payload jsonb)
returns access_codes language plpgsql as $$
declare
  v_c      access_codes;
  v_target text;
  v_items  text[];
  v_ends   timestamptz;
begin
  if not ('superadmin' = any(roles_for(p_actor))) then
    raise exception 'tiada_kebenaran';
  end if;
  if p_action is null or p_action not in ('cancel','reactivate','release','transfer','set_entitlements','extend') then
    raise exception 'tindakan_tidak_sah';
  end if;

  select * into v_c from access_codes where id = p_id for update;
  if not found then raise exception 'kod_tidak_wujud'; end if;

  if p_action = 'cancel' then
    update access_codes set status = 'dibatalkan' where id = p_id returning * into v_c;

  elsif p_action = 'reactivate' then
    update access_codes
       set status = case when redeemed_by is null then 'belum_guna' else 'aktif' end
     where id = p_id returning * into v_c;

  elsif p_action = 'release' then
    update access_codes
       set status = 'belum_guna', redeemed_by = null, redeemed_at = null, access_starts_at = null
     where id = p_id returning * into v_c;

  elsif p_action = 'transfer' then
    v_target := nullif(btrim(coalesce(p_payload->>'user_id', '')), '');
    if v_target is null or not exists (select 1 from profiles where id = v_target) then
      raise exception 'pengguna_tidak_wujud';
    end if;
    if v_c.redeemed_by is null then raise exception 'kod_belum_digunakan'; end if;
    update access_codes set redeemed_by = v_target where id = p_id returning * into v_c;

  elsif p_action = 'set_entitlements' then
    if jsonb_typeof(p_payload->'items') is distinct from 'array' then
      raise exception 'item_tidak_sah';
    end if;
    select coalesce(array_agg(distinct x order by x), '{}') into v_items
    from jsonb_array_elements_text(p_payload->'items') x;
    if exists (select 1 from unnest(v_items) k where not exists (select 1 from items where key = k)) then
      raise exception 'item_tidak_sah';
    end if;
    update access_codes set entitlements = v_items where id = p_id returning * into v_c;

  elsif p_action = 'extend' then
    v_ends := nullif(p_payload->>'access_ends_at', '')::timestamptz;
    update access_codes set access_ends_at = v_ends where id = p_id returning * into v_c;
  end if;

  perform log_audit(p_actor, 'code.' || p_action, 'access_code', p_id::text,
    jsonb_build_object('payload', p_payload, 'code', v_c.code));
  return v_c;
end;
$$;
