-- 0004_content: ebooks, reading progress, groups, onboarding columns, participant-facing functions.
-- Idempotent: create table if not exists / add column if not exists / create or replace function.
-- No RLS: every function below scopes by the uid it is given.

create table if not exists ebooks (
  id             uuid primary key default gen_random_uuid(),
  item_key       text not null unique references items(key),
  number         int,
  title          text not null,
  description    text,
  cover_url      text,
  file_drive_id  text,
  allow_download boolean not null default false,
  file_updated_at timestamptz,
  sort           int not null default 0
);

create table if not exists reading_progress (
  user_id     text not null,
  ebook_id    uuid not null references ebooks(id) on delete cascade,
  last_page   int not null default 0,
  finished_at timestamptz,
  updated_at  timestamptz not null default now(),
  primary key (user_id, ebook_id)
);

create table if not exists groups (
  id          uuid primary key default gen_random_uuid(),
  item_key    text not null references items(key),
  batch_id    uuid references batches(id),
  name        text not null,
  coach       text,
  description text,
  invite_url  text
);
-- one group per (item, batch); NULL batch_id counts as a single "all batches" slot
create unique index if not exists groups_item_batch_uq on groups (item_key, batch_id) nulls not distinct;

-- ---------- onboarding columns on profiles ----------
alter table profiles add column if not exists sex text check (sex in ('L','P'));
alter table profiles add column if not exists birth_year int;
alter table profiles add column if not exists height_cm numeric;
alter table profiles add column if not exists start_weight_kg numeric;
alter table profiles add column if not exists start_body_fat_pct numeric;
alter table profiles add column if not exists start_waist_cm numeric;
alter table profiles add column if not exists activity_level int check (activity_level between 1 and 5);
alter table profiles add column if not exists target_weight_kg numeric;
alter table profiles add column if not exists protein_target_g int;
alter table profiles add column if not exists health_ack_at timestamptz;
alter table profiles add column if not exists privacy_ack_at timestamptz;
alter table profiles add column if not exists tdee_kcal int;
alter table profiles add column if not exists kcal_target int;

-- ---------- app_bootstrap ----------
create or replace function app_bootstrap(p_uid text)
returns jsonb language plpgsql as $$
declare
  v_prof     profiles;
  v_email    text;
  v_phone    text;
  v_batch_id uuid;
  v_batch    jsonb;
begin
  select * into v_prof from profiles where id = p_uid;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'tiada_profil');
  end if;

  -- self-heal: a purchase may have arrived after registration; claim it when email AND phone match
  v_email := nullif(normalize_email(v_prof.email), '');
  v_phone := normalize_phone(v_prof.phone);
  if v_email is not null and v_phone is not null then
    update purchases set status = 'dituntut', claimed_by = p_uid, claimed_at = now()
    where status = 'belum_dituntut' and email = v_email and phone = v_phone;
  end if;

  -- the user's batch: most recent claimed purchase / active code, else the batch whose sales window is open now
  select b into v_batch_id from (
    select pu.batch_id as b, pu.claimed_at as at from purchases pu
      where pu.claimed_by = p_uid and pu.status = 'dituntut' and pu.batch_id is not null
    union all
    select c.batch_id, c.redeemed_at from access_codes c
      where c.redeemed_by = p_uid and c.status = 'aktif' and c.batch_id is not null
  ) x order by at desc nulls last limit 1;
  if v_batch_id is null then
    select id into v_batch_id from batches
    where sales_open_at <= now() and now() <= sales_close_at
    order by sales_open_at desc limit 1;
  end if;
  if v_batch_id is not null then
    select jsonb_build_object('id', id, 'name', name, 'status', status,
             'sales_open_at', sales_open_at, 'sales_close_at', sales_close_at,
             'program_start', program_start, 'program_end', program_end, 'phases', phases)
      into v_batch from batches where id = v_batch_id;
  end if;

  return jsonb_build_object(
    'ok', true,
    'profile', to_jsonb(v_prof),
    'roles', to_jsonb(roles_for(p_uid)),
    'entitlements', to_jsonb(entitlements_for(p_uid)),
    'batch', v_batch,
    'catalog', jsonb_build_object(
      'items', (select coalesce(jsonb_agg(jsonb_build_object('key', i.key, 'name', i.name, 'kind', i.kind, 'sort', i.sort)
                                          order by i.sort, i.key), '[]'::jsonb)
                from items i where i.active),
      'packages', (select coalesce(jsonb_agg(jsonb_build_object('id', k.id, 'name', k.name, 'price_rm', k.price_rm,
                          'sellable', k.sellable,
                          'items', (select coalesce(jsonb_agg(pi.item_key order by pi.item_key), '[]'::jsonb)
                                    from package_items pi where pi.package_id = k.id)) order by k.id), '[]'::jsonb)
                   from packages k),
      'ebooks', (select coalesce(jsonb_agg(jsonb_build_object('id', e.id, 'item_key', e.item_key, 'number', e.number,
                          'title', e.title, 'description', e.description, 'cover_url', e.cover_url,
                          'allow_download', e.allow_download, 'file_updated_at', e.file_updated_at,
                          'sort', e.sort) order by e.sort, e.number), '[]'::jsonb)
                 from ebooks e),
      'settings', (select coalesce(jsonb_object_agg(s.key, s.value), '{}'::jsonb)
                   from app_settings s where s.public)
    ),
    'reading', (select coalesce(jsonb_agg(to_jsonb(r) order by r.updated_at desc), '[]'::jsonb)
                from reading_progress r where r.user_id = p_uid)
  );
end;
$$;

-- ---------- my_groups ----------
create or replace function my_groups(p_uid text)
returns jsonb language sql stable as $$
  with ent as (select unnest(entitlements_for(p_uid)) as k),
  my_batches as (
    select pu.batch_id from purchases pu
      where pu.claimed_by = p_uid and pu.status = 'dituntut' and pu.batch_id is not null
    union
    select c.batch_id from access_codes c
      where c.redeemed_by = p_uid and c.status = 'aktif' and c.batch_id is not null
        and (c.access_ends_at is null or c.access_ends_at > now())
  )
  select coalesce(jsonb_agg(jsonb_build_object(
      'id', g.id, 'item_key', g.item_key, 'name', g.name, 'coach', g.coach, 'description', g.description,
      'invite_url', case when locked.v then null else g.invite_url end,
      'locked', locked.v) order by it.sort, g.name), '[]'::jsonb)
  from groups g
  join items it on it.key = g.item_key
  cross join lateral (select not exists (select 1 from ent where ent.k = g.item_key) as v) locked
  where g.batch_id is null or g.batch_id in (select batch_id from my_batches);
$$;

-- ---------- onboarding ----------
create or replace function save_onboarding(p_uid text, p jsonb)
returns jsonb language plpgsql as $$
declare
  v_sex   text := p->>'sex';
  v_birth int;
  v_h     numeric;
  v_w     numeric;
  v_bf    numeric;
  v_waist numeric;
  v_act   int;
  v_tw    numeric;
  v_prot  int;
  v_n     int;
begin
  if not exists (select 1 from profiles where id = p_uid) then
    return jsonb_build_object('ok', false, 'reason', 'tiada_profil');
  end if;
  begin
    v_birth := nullif(p->>'birth_year', '')::int;
    v_h     := nullif(p->>'height_cm', '')::numeric;
    v_w     := nullif(p->>'start_weight_kg', '')::numeric;
    v_bf    := nullif(p->>'start_body_fat_pct', '')::numeric;
    v_waist := nullif(p->>'start_waist_cm', '')::numeric;
    v_act   := nullif(p->>'activity_level', '')::int;
    v_tw    := nullif(p->>'target_weight_kg', '')::numeric;
    v_prot  := nullif(p->>'protein_target_g', '')::int;
  exception when others then
    return jsonb_build_object('ok', false, 'reason', 'data_tidak_sah');
  end;

  if v_sex is null or v_sex not in ('L','P')
     or v_act is null or v_act < 1 or v_act > 5
     or v_h is null or v_h <= 0 or v_h > 300
     or v_w is null or v_w <= 0 or v_w > 500
     or (v_birth is not null and (v_birth < 1900 or v_birth > extract(year from now())::int))
     or (v_bf is not null and (v_bf <= 0 or v_bf >= 100))
     or (v_waist is not null and v_waist <= 0)
     or (v_tw is not null and v_tw <= 0)
     or (v_prot is not null and v_prot <= 0)
     or p->'health_ack' is distinct from 'true'::jsonb
     or p->'privacy_ack' is distinct from 'true'::jsonb then
    return jsonb_build_object('ok', false, 'reason', 'data_tidak_sah');
  end if;

  update profiles set
    sex = v_sex, birth_year = v_birth, height_cm = v_h, start_weight_kg = v_w,
    start_body_fat_pct = v_bf, start_waist_cm = v_waist, activity_level = v_act,
    target_weight_kg = v_tw, protein_target_g = v_prot,
    health_ack_at = now(), privacy_ack_at = now(), onboarded_at = now()
  where id = p_uid;
  get diagnostics v_n = row_count;
  return jsonb_build_object('ok', v_n = 1);
end;
$$;

create or replace function save_targets(p_uid text, p jsonb)
returns jsonb language plpgsql as $$
declare
  v_tdee int;
  v_kcal int;
  v_prot int;
begin
  begin
    v_tdee := (p->>'tdee_kcal')::int;
    v_kcal := (p->>'kcal_target')::int;
    v_prot := (p->>'protein_target_g')::int;
  exception when others then
    return jsonb_build_object('ok', false, 'reason', 'data_tidak_sah');
  end;
  if v_tdee is null or v_tdee <= 0 or v_kcal is null or v_kcal <= 0 or v_prot is null or v_prot <= 0 then
    return jsonb_build_object('ok', false, 'reason', 'data_tidak_sah');
  end if;
  update profiles set tdee_kcal = v_tdee, kcal_target = v_kcal, protein_target_g = v_prot where id = p_uid;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'tiada_profil');
  end if;
  return jsonb_build_object('ok', true);
end;
$$;

-- ---------- reading progress ----------
create or replace function save_reading(p_uid text, p_ebook_id uuid, p_last_page int, p_finished boolean)
returns jsonb language plpgsql as $$
begin
  if p_uid is null or p_uid = '' or p_last_page is null or p_last_page < 0
     or not exists (select 1 from ebooks where id = p_ebook_id) then
    return jsonb_build_object('ok', false, 'reason', 'data_tidak_sah');
  end if;
  insert into reading_progress (user_id, ebook_id, last_page, finished_at, updated_at)
  values (p_uid, p_ebook_id, p_last_page, case when coalesce(p_finished, false) then now() end, now())
  on conflict (user_id, ebook_id) do update
    set last_page = excluded.last_page,
        finished_at = case when coalesce(p_finished, false) then coalesce(reading_progress.finished_at, now())
                           else reading_progress.finished_at end,
        updated_at = now();
  return jsonb_build_object('ok', true);
end;
$$;

-- ---------- account summary ----------
create or replace function account_summary(p_uid text)
returns jsonb language sql stable as $$
  select jsonb_build_object(
    'purchases', (select coalesce(jsonb_agg(jsonb_build_object(
        'id', pu.id, 'order_ref', pu.order_ref, 'package_id', pu.package_id, 'package_name', k.name,
        'status', pu.status, 'amount_rm', pu.amount_rm, 'paid_at', pu.paid_at, 'batch_id', pu.batch_id,
        'entitlements', to_jsonb(pu.entitlements)) order by pu.created_at desc), '[]'::jsonb)
      from purchases pu left join packages k on k.id = pu.package_id
      where pu.claimed_by = p_uid),
    'codes', (select coalesce(jsonb_agg(jsonb_build_object(
        'id', c.id, 'code', c.code, 'package_id', c.package_id, 'package_name', k.name, 'status', c.status,
        'batch_id', c.batch_id, 'redeemed_at', c.redeemed_at, 'access_starts_at', c.access_starts_at,
        'access_ends_at', c.access_ends_at, 'entitlements', to_jsonb(c.entitlements))
        order by c.redeemed_at desc nulls last), '[]'::jsonb)
      from access_codes c left join packages k on k.id = c.package_id
      where c.redeemed_by = p_uid)
  );
$$;

-- ---------- ebook file ticket ----------
create or replace function ebook_for_ticket(p_uid text, p_ebook_id uuid)
returns jsonb language plpgsql stable as $$
declare v_e ebooks;
begin
  select * into v_e from ebooks where id = p_ebook_id;
  if not found or not (v_e.item_key = any(entitlements_for(p_uid))) then
    return jsonb_build_object('ok', false, 'reason', 'tiada_akses');
  end if;
  if v_e.file_drive_id is null or btrim(v_e.file_drive_id) = '' then
    return jsonb_build_object('ok', false, 'reason', 'tiada_fail');
  end if;
  return jsonb_build_object('ok', true, 'fileId', v_e.file_drive_id,
                            'updatedAt', v_e.file_updated_at, 'allowDownload', v_e.allow_download);
end;
$$;
