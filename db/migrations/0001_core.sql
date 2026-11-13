-- 0001_core: catalogue, batches, profiles, roles, audit, settings, manual grants, entitlements.
-- User ids are Firebase uids (text). There is no RLS: every function filters by the uid it is given.
create extension if not exists pgcrypto;

create table if not exists items (
  key    text primary key,
  name   text not null,
  kind   text not null check (kind in ('modul','ebook','tool','group')),
  sort   int  not null default 0,
  active boolean not null default true
);

create table if not exists packages (
  id       text primary key,
  name     text not null,
  price_rm numeric not null default 0,
  sellable boolean not null default true
);

create table if not exists package_items (
  package_id text not null references packages(id) on delete cascade,
  item_key   text not null references items(key) on delete cascade,
  primary key (package_id, item_key)
);

create table if not exists batches (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  sales_open_at  timestamptz,
  sales_close_at timestamptz,
  program_start date,
  program_end   date,
  phases        jsonb not null default '[]'::jsonb,
  status        text not null default 'akan_datang' check (status in ('akan_datang','berjalan','tamat'))
);

create table if not exists profiles (
  id          text primary key,            -- firebase uid
  full_name   text,
  email       text unique,
  phone       text,
  onboarded_at timestamptz,
  created_at  timestamptz not null default now()
);

create table if not exists user_roles (
  user_id text not null,
  role    text not null check (role in ('superadmin','coach')),
  primary key (user_id, role)
);

create table if not exists audit_logs (
  id          bigserial primary key,
  actor       text,
  action      text not null,
  target_type text,
  target_id   text,
  detail      jsonb,
  at          timestamptz not null default now()
);
create index if not exists audit_logs_at_idx on audit_logs (at desc);

create table if not exists app_settings (
  key    text primary key,
  value  jsonb,
  public boolean not null default false
);

create table if not exists manual_grants (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null,
  item_key   text not null references items(key),
  granted_by text,
  reason     text,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists manual_grants_user_idx on manual_grants (user_id);

create or replace function log_audit(p_actor text, p_action text, p_target_type text, p_target_id text, p_detail jsonb)
returns void language sql as $$
  insert into audit_logs (actor, action, target_type, target_id, detail)
  values (p_actor, p_action, p_target_type, p_target_id, p_detail);
$$;

create or replace function roles_for(p_uid text)
returns text[] language sql stable as $$
  select coalesce(array_agg(distinct role order by role), '{}'::text[])
  from user_roles where user_id = p_uid;
$$;

-- Sorted distinct item keys the user may access. Task 2: manual grants only;
-- later migrations `create or replace` this to add purchases and access codes.
create or replace function entitlements_for(p_uid text)
returns text[] language sql stable as $$
  select coalesce(array_agg(distinct g.item_key order by g.item_key), '{}'::text[])
  from manual_grants g
  where g.user_id = p_uid and g.revoked_at is null;
$$;
