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

insert into package_items (package_id, item_key)
select 'basic', k from unnest(array['sistem','ebook_strategi','tdee','graduation','group_hdm']) k
on conflict do nothing;

insert into package_items (package_id, item_key)
select 'complete', key from items
on conflict do nothing;

-- upgrade_a_b = the 7 items in complete but not in basic
insert into package_items (package_id, item_key)
select 'upgrade_a_b', key from items
where key not in ('sistem','ebook_strategi','tdee','graduation','group_hdm')
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
