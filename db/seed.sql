-- Catalogue seed. Safe to re-run (upserts / do nothing).
insert into items (key, name, kind, sort) values
  ('sistem',                  'Sistem HDM Booster',        'modul', 1),
  ('ebook_strategi',          'Ebook Strategi',            'ebook', 2),
  ('ebook_muscle_mania',      'Ebook Muscle Mania',        'ebook', 3),
  ('ebook_traditional_remedy','Ebook Traditional Remedy',  'ebook', 4),
  ('ebook_tas',               'Ebook TAS',                 'ebook', 5),
  ('ebook_food_swap',         'Ebook Food Swap',           'ebook', 6),
  ('ebook_emergency',         'Ebook Emergency',           'ebook', 7),
  ('ebook_supplement',        'Ebook Supplement',          'ebook', 8),
  ('tdee',                    'Kalkulator TDEE',           'tool',  9),
  ('graduation',              'Graduation Report',         'modul', 10),
  ('group_hdm',               'Group HDM',                 'group', 11),
  ('group_muscle_mania',      'Group Muscle Mania',        'group', 12)
on conflict (key) do update set name = excluded.name, kind = excluded.kind, sort = excluded.sort;

insert into packages (id, name, price_rm, sellable) values
  ('basic',       'Pakej Basic',    100, true),
  ('complete',    'Pakej Complete', 150, true),
  ('upgrade_a_b', 'Naik Taraf A ke B', 50, false)
on conflict (id) do update set name = excluded.name, price_rm = excluded.price_rm, sellable = excluded.sellable;

-- Package contents are explicit (never derived from `items`, so stray rows cannot leak in).
-- Re-runs self-repair: any package_items row not in these lists is removed.
create temp table _pkg_items (package_id text, item_key text) on commit drop;
insert into _pkg_items (package_id, item_key)
select 'basic', k from unnest(array['sistem','ebook_strategi','tdee','graduation','group_hdm']) k
union all
select 'complete', k from unnest(array['sistem','ebook_strategi','ebook_muscle_mania','ebook_traditional_remedy',
  'ebook_tas','ebook_food_swap','ebook_emergency','ebook_supplement','tdee','graduation','group_hdm','group_muscle_mania']) k
union all
select 'upgrade_a_b', k from unnest(array['ebook_muscle_mania','ebook_traditional_remedy','ebook_tas','ebook_food_swap',
  'ebook_emergency','ebook_supplement','group_muscle_mania']) k;

delete from package_items pi
where pi.package_id in ('basic','complete','upgrade_a_b')
  and not exists (select 1 from _pkg_items x where x.package_id = pi.package_id and x.item_key = pi.item_key);
insert into package_items (package_id, item_key) select package_id, item_key from _pkg_items
on conflict do nothing;
insert into batches (name, sales_open_at, sales_close_at, program_start, program_end, phases, status)
select 'Batch Rejab 1448',
       timestamptz '2026-12-01 00:00+08', timestamptz '2027-01-31 23:59+08',
       date '2026-12-10', date '2027-03-10',
       '[{"key":"rejab","start":"2026-12-10","end":"2027-01-08"},
         {"key":"syaaban","start":"2027-01-09","end":"2027-02-07"},
         {"key":"ramadan","start":"2027-02-08","end":"2027-03-09"}]'::jsonb,
       'akan_datang'
where not exists (select 1 from batches where name = 'Batch Rejab 1448');

-- ---------- content seed (Task 5) ----------
-- Ebooks: placeholders, file_drive_id stays null until the owner uploads. Re-runs refresh title/number/sort only.
insert into ebooks (item_key, number, title, sort) values
  ('ebook_strategi',           1, 'Ebook Strategi HDM BOOSTER (Updated Version)', 1),
  ('ebook_muscle_mania',       2, 'Ebook MUSCLE MANIA',                           2),
  ('ebook_traditional_remedy', 3, 'Ebook TRADITIONAL REMEDY',                     3),
  ('ebook_tas',                4, 'Ebook TAS',                                    4),
  ('ebook_food_swap',          5, 'Ebook FOOD SWAP MATRIX',                       5),
  ('ebook_emergency',          6, 'Ebook HDM EMERGENCY PROTOCOL',                 6),
  ('ebook_supplement',         7, 'Ebook HDM SUPPLEMENT STACK',                   7)
on conflict (item_key) do update set number = excluded.number, title = excluded.title, sort = excluded.sort;

-- Groups: batch_id null = all batches. Unique (item_key, batch_id) nulls not distinct, so the upsert is stable.
-- invite_url is NOT overwritten on re-run (the owner replaces the placeholder).
insert into groups (item_key, batch_id, name, coach, description, invite_url) values
  ('group_hdm', null, 'Group HDM', 'Coach Iffat Salleh',
   'Group sokongan pemakanan HDM bersama Coach Iffat.', 'https://chat.whatsapp.com/PLACEHOLDER-GROUP-HDM'),
  ('group_muscle_mania', null, 'Group Muscle Mania', 'Coach Anuar Yusof "Toy"',
   'Group sokongan Muscle Mania bersama Coach Toy.', 'https://chat.whatsapp.com/PLACEHOLDER-GROUP-MUSCLE-MANIA')
on conflict (item_key, batch_id) do update set name = excluded.name, coach = excluded.coach, description = excluded.description;

-- Settings: public ones reach every participant via app_bootstrap; private ones are admin/Worker only.
-- Values are not overwritten on re-run (the owner edits them); only the public flag is enforced.
insert into app_settings (key, value, public) values
  ('support_wa', '"60134417042"'::jsonb, true),
  ('wa_upgrade_text', to_jsonb('Salam, saya ingin naik taraf ke Pakej Complete HDM BOOSTER. Emel pendaftaran: {emel}'::text), true),
  ('upgrade_note', to_jsonb('Naik taraf ke Pakej Complete untuk buka Ebook 02-07 dan Group Muscle Mania.'::text), true),
  ('wa_template_purchase', to_jsonb('Salam {nama}, terima kasih atas pembelian HDM BOOSTER. Daftar akaun di {pautan} guna emel dan nombor telefon yang sama semasa pembelian.'::text), false),
  ('wa_template_code', to_jsonb('Salam {nama}, ini kod akses HDM BOOSTER anda: {kod}. Aktifkan di {pautan}.'::text), false)
on conflict (key) do update set public = excluded.public;
