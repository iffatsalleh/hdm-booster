# HDM BOOSTER — Peringkat 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** By 01/12/2026, a buyer who pays for Pakej A or B on BCL can register, log in, complete onboarding, and open exactly the ebooks, TDEE calculator and support groups they bought; the owner manages purchases, codes and content from an Admin menu in the same app.

**Architecture:** A Preact SPA (hash routing) is built to one JS + one CSS file, served from jsDelivr (GitHub repo) and loaded by a stripped Blogspot template. Supabase (free) holds auth and all structured data; every entitlement decision lives in Postgres (RLS + `security definer` RPCs). Google Apps Script (one Web App) receives BCL webhooks, polls BCL as a safety net, serves ebook PDFs from Drive after an entitlement check, sends email, and runs backup/keep-alive jobs.

**Tech Stack:** Node 20+, Vite 5, Preact 10 + TypeScript, Tailwind CSS 3, `@supabase/supabase-js` v2, `pdfjs-dist` 4, `@phosphor-icons/web`, Vitest; Supabase CLI (migrations pushed to remote, no Docker); `@google/clasp` for Apps Script (plain JS, V8 runtime).

**Spec:** `docs/superpowers/specs/2026-11-12-hdm-booster-design.md` (+ `PROMPT-SISTEM-HDM-BOOSTER.md` for item catalogue, copy and UI rules). Read both before any task.

## Global Constraints

- Monthly cost RM0: Supabase Free, Apps Script, Drive, Blogspot, GitHub public repo, jsDelivr only. No Supabase Storage, no Edge Functions.
- All UI text Bahasa Melayu Malaysia; currency RM; dates `DD/MM/YYYY`; all day/week logic in `Asia/Kuala_Lumpur`.
- Supabase **service role key, BCL API token, BCL webhook key never in frontend or repo** — Apps Script Script Properties / local `.env.test` (gitignored) only.
- Email confirmation **OFF** in Supabase Auth; custom SMTP = owner's Gmail (app password).
- Registration requires email **and** phone matching a BCL purchase.
- Item keys exactly: `sistem, ebook_strategi, ebook_muscle_mania, ebook_traditional_remedy, ebook_tas, ebook_food_swap, ebook_emergency, ebook_supplement, tdee, graduation, group_hdm, group_muscle_mania`.
- Pakej A `basic` (RM100): `sistem, ebook_strategi, tdee, graduation, group_hdm`. Pakej B `complete` (RM150): all 12. Internal package `upgrade_a_b`: the 7 B-only keys (codes only, never sold on BCL).
- Access code format `HDMB-XXXX-XXXX`, alphabet `ABCDEFGHJKMNPQRSTUVWXYZ23456789`; input normalisation ignores case, spaces, hyphens.
- Mobile-first: works at 375px with no horizontal scroll; tab bar Utama · Rekod · Ebook · Cabaran · Akaun (+ Admin for staff). Colours `#2563eb` / `#f97316` / `#0f172a` / `#16a34a` / `#facc15`; fonts Outfit / Quicksand / Inter 800; Phosphor icons; respects `prefers-reduced-motion`.
- Support WhatsApp `60134417042`. Health note & disclaimer text exactly as MD asal §10.
- Every error shown to a user is a BM sentence that says what to do next (never a raw error code).
- Every admin mutation writes a row to `audit_logs`.
- Apps Script calls from the browser are `POST` with `Content-Type: text/plain` (JSON body) to avoid CORS preflight.

## Review Focus

1. **Phone typed differently at register vs BCL** (`012-345 6789`, `+60123456789`, `60123456789`, `0123456789`) → all match the same purchase. Pinned in Task 2 (`normalizePhone`) and Task 4 (`check_purchase` test).
2. **Email with different case or stray spaces** (`" Ali@Gmail.COM "`) → matches the purchase and logs in. Pinned in Task 4.
3. **Same BCL order arriving more than once** (webhook retry, webhook + 10-min poll racing) → exactly one purchase row, one email. Pinned in Task 7.
4. **Pakej A user calling the ebook endpoint or `my_groups` for a B-only item directly** → refused, no file bytes / no invite URL. Pinned in Task 3 and Task 8.
5. **A squatter account registered with the buyer's email before the buyer** → purchase is NOT auto-claimed by the squatter; it lands in "Perlu semakan". Pinned in Task 4.

---

## File Structure

```
package.json · vite.config.ts · tsconfig.json · tailwind.config.js · postcss.config.js · index.html
.env.example (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_GAS_URL) · .env.test.example (+ SUPABASE_SERVICE_ROLE_KEY)
supabase/config.toml
supabase/migrations/
  20261112000001_core.sql          items, packages, package_items, batches, profiles, user_roles, audit_logs, app_settings, helpers
  20261112000002_entitlements.sql  manual_grants, entitlements_for(), my_entitlements(), has_entitlement()
  20261112000003_purchases.sql     purchases, bcl_form_map, bcl_webhook_log, email_queue, check_purchase(), handle_new_user, auto-claim
  20261112000004_codes.sql         access_codes, redeem_attempts, generate_codes(), redeem_code(), admin_code_action()
  20261112000005_content.sql       ebooks, reading_progress, groups, my_groups(), onboarding columns
  20261112000006_admin.sql         admin_purchase_action(), admin views, staff RLS
supabase/seed.sql                  items, packages, Batch Rejab 1448, 7 placeholder ebooks, 2 groups, WA templates
src/
  main.tsx · app.tsx · router.ts · styles.css
  lib/ supabase.ts · gas.ts · phone.ts · codes.ts · dates.ts · tdee.ts · csv.ts · wa.ts · errors.ts
  state/ session.ts
  ui/ Layout.tsx · TabBar.tsx · Card.tsx · Button.tsx · Field.tsx · LockBadge.tsx · Toast.tsx · Empty.tsx
  pages/ auth/{Login,Register,Forgot,Reset}.tsx · Onboarding.tsx · Home.tsx · Aktif.tsx · Help.tsx
         ebooks/{Library,Reader}.tsx · Tdee.tsx · Groups.tsx · account/{Account,Codes}.tsx
         admin/{AdminHome,Purchases,BclMap,Codes,Participants,Content,Exports,Audit}.tsx
apps-script/
  appsscript.json · .clasp.json
  Config.gs.js · Supabase.gs.js · Auth.gs.js · Router.gs.js · BclLogic.gs.js (pure) · Bcl.gs.js
  Mail.gs.js · Ebook.gs.js · AdminOps.gs.js · Jobs.gs.js
tests/
  unit/ phone.test.ts · codes.test.ts · dates.test.ts · tdee.test.ts · csv.test.ts
  db/   helpers.ts · entitlements.test.ts · registration.test.ts · codes.test.ts · content.test.ts · admin.test.ts
  gas/  load.ts · bclLogic.test.ts
blogspot/template.xml · scripts/deploy.mjs · README.md
```

DB tests (`tests/db`) run with Vitest against a **separate dev Supabase project** using `.env.test`; `helpers.ts` creates/deletes throwaway users with the service role and returns per-user clients.

---

## Prerequisites (owner does these; agent must not create accounts or enter real credentials)

- [ ] Owner creates two Supabase Free projects: `hdm-dev` and `hdm-prod`; gives the agent URL + anon key for both, and puts the dev service role key into `.env.test` themself.
- [ ] Owner creates a GitHub account/repo `hdm-booster` (public) and a Blogspot blog (e.g. `hdmbooster.blogspot.com`).
- [ ] Owner creates a BCL API token ("API Read") and the webhook key; stores them later in Apps Script Script Properties.
- [ ] Owner creates a Gmail app password for Supabase SMTP and enters it in the Supabase dashboard.
- [ ] Node 20+, `npx supabase`, `npx @google/clasp` available.

---

### Task 1: Project scaffold

**Files:** Create `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/main.tsx`, `src/app.tsx`, `src/styles.css`, `.gitignore`, `.env.example`, `.env.test.example`, `vitest.config.ts`.

**Interfaces:**
- Produces: `npm run dev`, `npm run build` (outputs `dist/app.js` + `dist/app.css`, fixed names, no hash), `npm test` (unit + gas), `npm run test:db`.

- [ ] **Step 1:** `git init`, Vite Preact-TS scaffold, add Tailwind with theme colours/fonts from Global Constraints; `vite.config.ts` sets `build.rollupOptions.output.entryFileNames='app.js'`, `assetFileNames='app.[ext]'`, single chunk (`inlineDynamicImports: true`) except pdf.js worker.
- [ ] **Step 2:** `.gitignore` includes `.env`, `.env.test`, `node_modules`, `apps-script/.clasprc.json`. `dist/` is **committed** (jsDelivr serves it).
- [ ] **Step 3:** Run `npm run build` → `dist/app.js` and `dist/app.css` exist. Run `npm test` → "No test files" exits 0 (`passWithNoTests`).
- [ ] **Step 4:** Commit `chore: scaffold HDM BOOSTER app`.

### Task 2: Pure helpers (phone, codes, dates, TDEE, CSV, WhatsApp)

**Files:** Create `src/lib/{phone,codes,dates,tdee,csv,wa}.ts`; Test `tests/unit/*.test.ts`.

**Interfaces — Produces:**
- `normalizePhone(raw: string): string | null` → `"60…"` digits or null if not a Malaysian mobile.
- `normalizeEmail(raw: string): string` → trimmed lowercase.
- `normalizeCode(raw: string): string | null` → `HDMB-XXXX-XXXX` or null.
- `type BatchDates = { programStart: string; programEnd: string; phases: { key: 'rejab'|'syaaban'|'ramadan'; start: string; end: string }[] }` (ISO `YYYY-MM-DD`, MYT).
- `todayMYT(now?: Date): string` (ISO date in MYT); `programWeek(b: BatchDates, today: string): { week: number; total: number } | null` (null before start); `currentPhase(b, today)`; `daysUntil(dateIso, today): number`; `formatDMY(iso): string`.
- `calcTdee(i: { sex:'L'|'P'; age:number; heightCm:number; weightKg:number; activity:1|2|3|4|5 }): { bmr:number; tdee:number; deficits:{label:string;pct:number;kcal:number}[]; proteinG:{min:number;max:number}; macros:{proteinG:number;fatG:number;carbG:number} }` — Mifflin-St Jeor, activity factors `[1.2,1.375,1.55,1.725,1.9]`, deficits −15/−20/−25 %, protein 1.6–2.0 g/kg, fat 25 % of target kcal (−20 %), carbs remainder.
- `toCsv(rows: Record<string, unknown>[]): string` (RFC 4180, UTF-8 BOM prefix for Excel).
- `waLink(phone: string, text: string): string` → `https://wa.me/<60…>?text=<encoded>`; `fillTemplate(tpl: string, vars: Record<string,string>): string` replaces `{nama}`, `{kod}`, `{pautan}` etc.

- [ ] **Step 1: Write failing tests**

```ts
expect(normalizePhone('012-345 6789')).toBe('60123456789');
expect(normalizePhone('+60123456789')).toBe('60123456789');
expect(normalizePhone('0123456789')).toBe('60123456789');
expect(normalizePhone('60 11-2345 6789')).toBe('601123456789');
expect(normalizePhone('12345')).toBeNull();
expect(normalizeEmail('  Ali@Gmail.COM ')).toBe('ali@gmail.com');
expect(normalizeCode('hdmb a7k3-q9xp')).toBe('HDMB-A7K3-Q9XP');
expect(normalizeCode('a7k3q9xp')).toBe('HDMB-A7K3-Q9XP');
expect(normalizeCode('HDMB-A7K3-Q9X0')).toBeNull(); // 0 not in alphabet
const b = { programStart:'2026-12-10', programEnd:'2027-03-10', phases:[
  {key:'rejab',start:'2026-12-10',end:'2027-01-08'},
  {key:'syaaban',start:'2027-01-09',end:'2027-02-07'},
  {key:'ramadan',start:'2027-02-08',end:'2027-03-09'}] };
expect(programWeek(b,'2026-12-09')).toBeNull();
expect(programWeek(b,'2026-12-10')).toEqual({week:1,total:13});
expect(programWeek(b,'2026-12-17')).toEqual({week:2,total:13});
expect(currentPhase(b,'2027-02-08')?.key).toBe('ramadan');
expect(todayMYT(new Date('2026-12-09T16:30:00Z'))).toBe('2026-12-10'); // 00:30 MYT
expect(formatDMY('2026-12-10')).toBe('10/12/2026');
const t = calcTdee({sex:'L',age:30,heightCm:175,weightKg:80,activity:3});
expect(t.bmr).toBeCloseTo(1748.75,1); expect(Math.round(t.tdee)).toBe(2711);
expect(t.proteinG).toEqual({min:128,max:160});
expect(calcTdee({sex:'P',age:30,heightCm:160,weightKg:60,activity:1}).bmr).toBeCloseTo(1289,0);
expect(toCsv([{a:'x,y',b:'"q"'}])).toBe('﻿a,b\r\n"x,y","""q"""\r\n');
expect(waLink('012-3456789','Hai Ali')).toBe('https://wa.me/60123456789?text=Hai%20Ali');
```

- [ ] **Step 2:** `npm test` → FAIL (modules missing).
- [ ] **Step 3:** Implement the six modules with the signatures above.
- [ ] **Step 4:** `npm test` → all PASS.
- [ ] **Step 5:** Commit `feat: pure helpers for phone, codes, dates, tdee, csv, wa`.

### Task 3: Core schema, catalogue seed, entitlements

**Files:** Create `supabase/migrations/20261112000001_core.sql`, `…02_entitlements.sql`, `supabase/seed.sql`; Test `tests/db/helpers.ts`, `tests/db/entitlements.test.ts`.

**Interfaces — Produces (SQL):**
- Tables: `items(key text pk, name, kind text check in ('modul','ebook','tool','group'), sort int, active bool)`, `packages(id text pk, name, price_rm numeric, sellable bool)`, `package_items(package_id, item_key)`, `batches(id uuid pk, name, sales_open_at timestamptz, sales_close_at timestamptz, program_start date, program_end date, phases jsonb, status text)`, `profiles(id uuid pk → auth.users, full_name, email, phone, onboarded_at, created_at)`, `user_roles(user_id, role text check in ('superadmin','coach'))`, `audit_logs(id, actor uuid, action text, target_type, target_id, detail jsonb, at)`, `app_settings(key text pk, value jsonb)`, `manual_grants(id, user_id, item_key, granted_by, reason, revoked_at, created_at)`.
- `is_superadmin() returns bool`, `is_staff() returns bool` (superadmin or coach), `log_audit(action text, target_type text, target_id text, detail jsonb) returns void`.
- `entitlements_for(uid uuid) returns setof text` (security definer; union of claimed purchases' `entitlements`, active non-expired codes' `entitlements`, unrevoked manual grants — later tasks add their sources by `create or replace`), `my_entitlements() returns setof text`, `has_entitlement(key text) returns bool`.
- RLS on every table: `items`, `packages`, `package_items`, `batches`, `app_settings` (non-secret keys) readable by `authenticated`; `profiles` own row read/update (phone/email immutable by user), staff read all; `user_roles`, `audit_logs`, `manual_grants` staff only (participants read own grants).
- Seed: 12 items, packages `basic`, `complete`, `upgrade_a_b` (`sellable=false`), Batch "Batch Rejab 1448" (sales_open 2026-12-01 00:00 MYT, sales_close 2027-01-31, program 2026-12-10→2027-03-10, phases as in Task 2 test).

- [ ] **Step 1: Write failing tests** (`entitlements.test.ts`, using `helpers.createUser()` / `asUser()` / `admin` service client):

```ts
test('no sources → empty', async () => expect(await ents(u)).toEqual([]));
test('manual grant gives key; revoke removes it immediately', ...);  // grant tdee → ['tdee']; set revoked_at → []
test('participant cannot read another profile', ...);               // select by other id → 0 rows
test('participant cannot insert manual_grants', ...);               // RLS error
test('seed: package complete has 12 items, basic has 5', ...);
```

- [ ] **Step 2:** `npx supabase db push` (dev) then `npm run test:db -- entitlements` → FAIL.
- [ ] **Step 3:** Write the two migrations + seed; push; run seed with `psql`/`supabase db execute`.
- [ ] **Step 4:** `npm run test:db -- entitlements` → PASS.
- [ ] **Step 5:** Commit `feat(db): core schema, catalogue, entitlements`.

### Task 4: Purchases & registration

**Files:** Create `supabase/migrations/20261112000003_purchases.sql`; Test `tests/db/registration.test.ts`.

**Interfaces:**
- Consumes: `entitlements_for` (Task 3).
- Produces:
  - `purchases(id uuid, order_ref text unique, batch_id, package_id, entitlements text[], buyer_name, email (normalised), phone (normalised 60…), amount_rm, paid_at, status text check in ('belum_dituntut','dituntut','perlu_semakan','dibatalkan'), review_reason text, claimed_by uuid, claimed_at, source text check in ('bcl','manual'), raw jsonb, created_at)`.
  - `bcl_form_map(id, formable_id text null, amount_rm numeric null, field_value text null, package_id, active bool)`; `bcl_webhook_log(id, order_ref, kind text, ok bool, message, payload jsonb, at)`; `email_queue(id, to_email, subject, body_html, kind, ref_id, status text check in ('pending','sent','failed'), attempts int, last_error, created_at, sent_at)`.
  - `upsert_purchase(p jsonb) returns purchases` — service-role only; insert-or-ignore on `order_ref`; copies `package_items` into `entitlements`; picks `batch_id` where `paid_at` within sales window (none → `perlu_semakan`, reason `"Tiada batch dibuka"`); then **auto-claim** to an existing profile only when both email AND phone match, else stays `belum_dituntut`; enqueues one `email_queue` row (kind `purchase_welcome`) only on first insert. Returns `{row, inserted bool}` as jsonb.
  - `check_purchase(p_email text, p_phone text) returns jsonb` (anon + authenticated) → `{ok:true, packages:['HDM BOOSTER COMPLETE']}` or `{ok:false, reason:'tiada_pembelian'|'sudah_didaftar'|'terlalu_banyak_cubaan'}`; normalises inputs in SQL (`normalize_phone(text)`, `lower(trim())`); rate-limit 5 failures / 15 min per `x-forwarded-for` (logged to `redeem_attempts`, created here, reused by Task 5).
  - Trigger `on_auth_user_created` → inserts `profiles` from `raw_user_meta_data` (`full_name`, `phone` normalised) and claims all `belum_dituntut` purchases where email = new email AND phone = meta phone.

- [ ] **Step 1: Write failing tests**

```ts
test('check_purchase matches across phone formats and email case', async () => {
  await upsert({order_ref:'T1', email:'Ali@Gmail.com', phone:'012-345 6789', package_id:'basic', paid_at:'2026-12-02T10:00:00+08:00'});
  expect(await anon.rpc('check_purchase',{p_email:' ali@gmail.COM ', p_phone:'+60123456789'})).toMatchObject({data:{ok:true}});
});
test('wrong phone → tiada_pembelian', ...);
test('signUp with matching email+phone claims purchase → entitlements = basic 5 keys', ...);
test('upsert same order_ref twice → one row, one email_queue row, inserted=false second time', ...);
test('A buyer later buys B (same email+phone) → auto-claimed, entitlements = 12 keys', ...);
test('squatter signs up with buyer email but other phone → purchase stays belum_dituntut, squatter has no entitlements; check_purchase returns sudah_didaftar', ...);
test('paid_at outside any batch sales window → perlu_semakan', ...);
test('6th failed check_purchase within 15 min → terlalu_banyak_cubaan', ...);
test('participant cannot select purchases of others; can select own', ...);
```

- [ ] **Step 2:** Push, run → FAIL. **Step 3:** Implement migration. **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `feat(db): purchases, registration matching, auto-claim`.

Note on `sudah_didaftar`: when an auth user already exists with that email, `check_purchase` returns `sudah_didaftar` and the UI says "Emel ini sudah ada akaun. Sila log masuk atau guna Lupa Kata Laluan." Squatter cases appear in Admin › Purchases as `belum_dituntut` older than 24 h with an existing account → owner resolves via `admin_purchase_action('assign')`.

### Task 5: Access codes

**Files:** Create `supabase/migrations/20261112000004_codes.sql`; Test `tests/db/codes.test.ts`.

**Interfaces:**
- Produces:
  - `access_codes` with every MD §5.2 column + `batch_id`; status `belum_guna|aktif|dibatalkan`.
  - `generate_codes(p_package_id text, p_count int, p_batch_id uuid, p_label text, p_buyer jsonb default null, p_access_ends_at timestamptz default null) returns setof access_codes` — superadmin only; `p_count` 1–500; cryptographic (`gen_random_bytes`) over the 31-char alphabet; retries on collision.
  - `redeem_code(p_code text) returns jsonb` → `{ok:true, items:[…]}` or `{ok:false, reason:'tidak_sah'|'sudah_digunakan'|'dibatalkan'|'tamat_tempoh'|'terlalu_banyak_cubaan'}`; 5 failures / 15 min per user and per IP.
  - `admin_code_action(p_id uuid, p_action text, p_payload jsonb) returns access_codes` — actions `cancel`, `reactivate`, `release` (→ belum_guna, clears redeemed_by), `transfer` (`{user_id}`), `set_entitlements` (`{items:[]}`), `extend` (`{access_ends_at}`); each writes `audit_logs`.
  - `entitlements_for` extended to include active, non-expired codes.

- [ ] **Step 1: Write failing tests**

```ts
test('generate 3 basic codes → format /^HDMB-[A-HJ-KM-NP-Z2-9]{4}-[…]{4}$/, unique', ...);
test('redeem lowercased/spaced code → ok, entitlements basic', ...);
test('redeem same code by second user → sudah_digunakan', ...);
test('cancel → entitlements drop immediately; redeem cancelled → dibatalkan', ...);
test('upgrade_a_b code on basic user → 12 keys', ...);
test('participant calling generate_codes → permission error', ...);
test('6 bad codes in 15 min → terlalu_banyak_cubaan', ...);
test('transfer moves entitlements to the other user and audit row exists', ...);
```

- [ ] **Steps 2–4:** push → FAIL → implement → PASS.
- [ ] **Step 5:** Commit `feat(db): access codes, redemption, admin actions`.

### Task 6: Content tables, groups, onboarding fields, admin RPCs

**Files:** Create `…05_content.sql`, `…06_admin.sql`; extend `seed.sql`; Test `tests/db/content.test.ts`, `tests/db/admin.test.ts`.

**Interfaces — Produces:**
- `ebooks(id, item_key, number int, title, description, cover_url text, file_drive_id text, allow_download bool, file_updated_at, sort)` — `authenticated` may select all columns **except `file_drive_id`** (column privilege revoked; Apps Script reads it with service role).
- `reading_progress(user_id, ebook_id, last_page int, finished_at, updated_at)` own rows only.
- `groups(id, item_key, batch_id uuid null, name, coach, description, invite_url)` — no direct select for participants. `my_groups() returns table(id, item_key, name, coach, description, invite_url text, locked bool)` — `invite_url` null when locked; batch-specific groups only for batches the user has a claimed purchase/code in (null `batch_id` = all batches).
- `profiles` onboarding columns: `sex text check in ('L','P')`, `birth_year int`, `height_cm numeric`, `start_weight_kg numeric`, `start_body_fat_pct numeric null`, `start_waist_cm numeric null`, `activity_level int 1–5`, `target_weight_kg numeric`, `protein_target_g int`, `health_ack_at timestamptz`, `privacy_ack_at timestamptz`, `tdee_kcal int null`, `kcal_target int null`. Before photo is deferred to Peringkat 3a (Drive upload).
- `app_settings` keys seeded: `wa_template_purchase`, `wa_template_code`, `wa_upgrade_text`, `support_wa` = `"60134417042"`, `upgrade_note`.
- `admin_purchase_action(p_id uuid, p_action text, p_payload jsonb) returns purchases` — `assign` (`{user_id}`), `set_package` (`{package_id}` → recopies entitlements), `cancel`, `restore`; audit.
- `admin_grant(p_user_id uuid, p_item_key text, p_reason text)`, `admin_revoke_grant(p_grant_id uuid)`.
- Views for staff (security_invoker, gated by `is_staff()`): `v_admin_summary` (codes generated/redeemed per package, purchases per status per batch, registered users), `v_participants` (profile + entitlement list + package names + purchase order refs).
- Seed: 7 placeholder ebooks (numbers 01–07, keys per catalogue), 2 groups (`group_hdm` Coach Iffat Salleh, `group_muscle_mania` Coach Anuar Yusof "Toy") with placeholder invite URLs.

- [ ] **Step 1: Failing tests**

```ts
test('basic user: my_groups → group_hdm has invite_url, group_muscle_mania locked & invite_url null', ...);
test('participant select ebooks.file_drive_id → permission denied; select title ok', ...);
test('coach can read v_participants but admin_purchase_action as coach → error', ...);
test('set_package basic→complete recopies 12 entitlements and writes audit', ...);
test('participant cannot update own phone/email in profiles', ...);
```

- [ ] **Steps 2–4:** push → FAIL → implement → PASS.
- [ ] **Step 5:** Commit `feat(db): content, groups, onboarding, admin RPCs`.

### Task 7: Apps Script — BCL webhook, polling, email queue

**Files:** Create `apps-script/{appsscript.json,Config.gs.js,Supabase.gs.js,Router.gs.js,BclLogic.gs.js,Bcl.gs.js,Mail.gs.js,Jobs.gs.js}`; Test `tests/gas/load.ts`, `tests/gas/bclLogic.test.ts`.

**Interfaces:**
- Consumes: `upsert_purchase(p jsonb)`, `bcl_form_map`, `bcl_webhook_log`, `email_queue` (Task 4), via PostgREST with service role.
- Produces:
  - Script Properties: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `BCL_API_BASE` (`https://bcl.my/api`), `BCL_API_TOKEN`, `BCL_WEBHOOK_KEY`, `BCL_FIELD_MAP` (JSON: candidate paths for name/email/phone/order/amount/formable_id), `APP_URL` (Blogspot URL), `DRIVE_EBOOK_FOLDER_ID`, `DRIVE_BACKUP_FOLDER_ID`.
  - `BclLogic` (pure, no Google APIs — loaded in Node by `tests/gas/load.ts` via `vm`): `extractOrderRef(body: object): string|null`, `isPaidLive(txn): boolean` (status 3 && is_paid && type/transaction_type ≈ 'live'), `buyerFromTxn(txn, fieldMap): {name,email,phone}`, `matchPackage(txn, mapRows): {packageId: string|null, mapped: boolean}` (formable_id match first, then amount, then field value; `mapped=false` when formable_id appears in no row → ignore), `normalizePhone`, `normalizeEmail` (same rules as Task 2).
  - `doPost(e)` in `Router`: if `e.parameter.src === 'bcl'` → `handleBclWebhook(e)` (reject when `e.parameter.k !== BCL_WEBHOOK_KEY`, logs `bcl_webhook_log`); else JSON app API (Task 8).
  - `handleBclWebhook` → `processOrder(orderRef, source)`: `GET {BCL_API_BASE}/transactions/{order}` with `Authorization: Bearer`, verify `isPaidLive`, `matchPackage`, then `upsert_purchase`. Unmapped form → log `ignored`. Unmatchable HDM form or unpaid → `perlu_semakan` / log.
  - `pollBcl()` (trigger every 10 min): `GET /transactions?per_page=100` (newest), `processOrder` for paid live orders not yet in `purchases`; `LockService` script lock around both paths.
  - `processEmailQueue()` (trigger every 30 min + called right after a new purchase): sends `pending` rows while `MailApp.getRemainingDailyQuota() > 5`; welcome email body BM with `APP_URL#/daftar`, buyer name, package name, support WA; marks `sent`/`failed`.
  - `installTriggers()` one-off function.

- [ ] **Step 1: Failing tests** (`bclLogic.test.ts`, fixtures in `tests/gas/fixtures/*.json` shaped from the cave-lms findings):

```ts
expect(isPaidLive({status:3,is_paid:true,type:'Live'})).toBe(true);
expect(isPaidLive({status:1,is_paid:false,type:'live'})).toBe(false);
expect(isPaidLive({status:3,is_paid:true,type:'test'})).toBe(false);
expect(matchPackage({formable_id:'77',amount:'100.00'},[{formable_id:'77',amount_rm:100,package_id:'basic'},{formable_id:'77',amount_rm:150,package_id:'complete'}])).toEqual({packageId:'basic',mapped:true});
expect(matchPackage({formable_id:'99',amount:'50.00'},rows)).toEqual({packageId:null,mapped:false});
expect(matchPackage({formable_id:'77',amount:'80.00'},rows)).toEqual({packageId:null,mapped:true}); // → perlu_semakan
expect(buyerFromTxn(fixture, fieldMap)).toEqual({name:'Ali Bin Abu',email:'ali@gmail.com',phone:'60123456789'});
```

(Amount comparison allows BCL fee: match when `|amount - amount_rm| <= BCL_FEE_TOLERANCE` default RM3; document in README.)

- [ ] **Step 2:** `npm test -- gas` → FAIL. **Step 3:** implement `BclLogic.gs.js`. **Step 4:** PASS.
- [ ] **Step 5:** Implement `Bcl`, `Router`, `Mail`, `Jobs`, `Supabase`; `clasp push` to a dev script project bound to the dev Supabase.
- [ ] **Step 6: Manual verification (with owner):** owner makes one BCL **test-mode** payment and one **live** RM1 test form (or smallest real order) → `bcl_webhook_log` shows payload; adjust `BCL_FIELD_MAP` to real field names; confirm one `purchases` row and one email received. Re-send same webhook via `curl` → still one row. Disable webhook, pay again, wait ≤10 min → poll creates the row.
- [ ] **Step 7:** Commit `feat(gas): BCL webhook, polling, email queue`.

### Task 8: Apps Script — authenticated app API (ebooks, admin ops, backup, keep-alive)

**Files:** Create `apps-script/{Auth.gs.js,Ebook.gs.js,AdminOps.gs.js}`; modify `Router.gs.js`, `Jobs.gs.js`.

**Interfaces:**
- Produces (all `POST text/plain` body `{action, token, ...}` → JSON `{ok:true, data}` | `{ok:false, error:'<bm message>'}`):
  - `verifyUser(token): {id, email} | null` — `GET {SUPABASE_URL}/auth/v1/user` with the user's JWT; cache 5 min in `CacheService` by token hash.
  - `ebook.meta` `{ebookId}` → `{chunks:int, bytes:int, updatedAt}` after `has_entitlement` check for that ebook's `item_key` (RPC `entitlements_for` with service role).
  - `ebook.chunk` `{ebookId, index}` → `{b64}` — 4 MB slices of the Drive file; entitlement re-checked each call.
  - `admin.resetPassword` `{userId}` (superadmin) → `{tempPassword}` via `PUT /auth/v1/admin/users/{id}`; audit.
  - `admin.reprocessOrder` `{orderRef}` (superadmin) → result of `processOrder`.
  - `admin.resendWelcome` `{purchaseId}` (superadmin) → re-enqueue email.
  - `nightlyBackup()` (03:00 MYT trigger): every table via PostgREST (service role, paged) → JSON files in `DRIVE_BACKUP_FOLDER_ID/YYYY-MM-DD/`; delete folders older than 30 days.
  - `keepAlive()` (daily): `select 1`-equivalent REST call.
- Role check in Apps Script = read `user_roles` with service role.

- [ ] **Step 1: Manual test script** `apps-script/Tests.gs.js` (run from editor) asserting: basic user token → `ebook.meta` for `ebook_muscle_mania` returns `ok:false` with "Ebook ini tersedia dalam Pakej Complete"; complete user → `ok:true`; no token → `ok:false` "Sila log masuk semula"; participant calling `admin.resetPassword` → `ok:false`.
- [ ] **Step 2:** Run it → FAIL. **Step 3:** Implement. **Step 4:** Run → all PASS (log shows `PASS x/x`).
- [ ] **Step 5:** Run `nightlyBackup()` manually → dated folder with one JSON per table.
- [ ] **Step 6:** Commit `feat(gas): ebook serving, admin ops, backup, keep-alive`.

### Task 9: App shell, auth pages, session

**Files:** Create `src/router.ts`, `src/state/session.ts`, `src/lib/{supabase,gas,errors}.ts`, `src/ui/*`, `src/pages/auth/*`, `src/pages/Home.tsx`, `src/pages/Help.tsx`.

**Interfaces:**
- Produces: `useRoute(): {path: string; params: Record<string,string>}`, `navigate(path)`; routes `#/`, `#/masuk`, `#/daftar`, `#/lupa`, `#/reset`, `#/onboarding`, `#/ebook`, `#/ebook/:id`, `#/tdee`, `#/group`, `#/akaun`, `#/akaun/kod`, `#/aktif`, `#/bantuan`, `#/admin/*`; `#/rekod` and `#/cabaran` render "Dibuka 10/12/2026" placeholders.
- `session` store: `{user, profile, roles: string[], entitlements: Set<string>, batch}`; `refreshEntitlements()`; persistent session (`persistSession: true`, `autoRefreshToken: true`).
- `gas.call<T>(action: string, payload: object): Promise<T>` — attaches access token, `text/plain`, 30 s timeout, maps failures to BM errors.
- `errors.bm(e): string` — maps Supabase/RPC reasons to BM copy, e.g. `tiada_pembelian` → "Emel/telefon ini tiada rekod pembelian. Pastikan sama seperti semasa beli di BCL, atau WhatsApp 60134417042."; `sudah_didaftar` → "Emel ini sudah ada akaun. Sila log masuk atau tekan Lupa Kata Laluan."; `Invalid login credentials` → "Emel atau kata laluan salah."; network → "Tiada sambungan internet. Cuba lagi sebentar."
- Guards: not logged in → `#/masuk`; logged in but `onboarded_at` null → `#/onboarding`; `#/admin/*` requires `is_staff`.
- Register flow: `check_purchase` → on ok show "Anda akan dapat akses: …" → `signUp({email,password,options:{data:{full_name, phone}}})` → `refreshEntitlements()` → `#/onboarding`. Privacy notice (PDPA) checkbox required.
- Home (Peringkat 1): greeting, batch name, countdown "Program bermula dalam N hari" (`daysUntil`), shortcut cards (Baca ebook, Kalkulator TDEE, Group support, Bantuan), health note footer.
- Help: FAQ (log masuk, lupa kata laluan, guna emel sama dengan BCL, tambah ke skrin utama Android/iPhone), WhatsApp button.

- [ ] **Step 1:** Implement shell + pages.
- [ ] **Step 2: Browser verification** (`npm run dev` via preview, `mobile` 375×812 and desktop): register with a seeded dev purchase (phone typed `012-345 6789`, email uppercase) → lands on onboarding; log out/in; wrong password shows BM message; forgot-password email arrives via Gmail SMTP; reload keeps session; no horizontal scroll (`document.documentElement.scrollWidth <= innerWidth`); console has no errors.
- [ ] **Step 3:** Commit `feat(app): shell, auth, session, home, help`.

### Task 10: Onboarding & TDEE

**Files:** Create `src/pages/Onboarding.tsx`, `src/pages/Tdee.tsx`.

**Interfaces:** Consumes `calcTdee` (Task 2), profile onboarding columns (Task 6).

- Onboarding fields per spec §6.2 (minus photo); protein target pre-filled `round(1.8 × weight)`, editable; health note text verbatim + required checkbox; saves `onboarded_at`, `health_ack_at`.
- TDEE (requires `tdee` entitlement, else lock card): pre-filled from profile; 5 activity levels with BM descriptions; shows BMR, TDEE, three deficit cards, protein range, macros; "Guna sebagai sasaran saya" saves `tdee_kcal`, `kcal_target`, `protein_target_g`; note "Anggaran sahaja, bukan nasihat perubatan."

- [ ] **Step 1:** Implement. **Step 2: Browser verification:** complete onboarding with 80 kg → protein prefilled 144; TDEE with Task 2 example inputs shows 2711 kcal; save → profile updated (check via Supabase table); user without `tdee` sees lock card. 375px OK.
- [ ] **Step 3:** Commit `feat(app): onboarding and TDEE calculator`.

### Task 11: Ebook library & watermarked reader

**Files:** Create `src/pages/ebooks/{Library,Reader}.tsx`, `src/lib/ebookCache.ts`.

**Interfaces:**
- Consumes `ebooks` select, `reading_progress`, `gas.call('ebook.meta'|'ebook.chunk')`.
- `loadEbook(id: string, updatedAt: string, onProgress:(pct:number)=>void): Promise<ArrayBuffer>` — IndexedDB cache keyed `${id}:${updatedAt}`; falls back to network when IndexedDB throws.
- Library: grid cards (cover, number 01–07, title, description, "Dikemas kini DD/MM/YYYY", status Terbuka/Berkunci); locked → `LockBadge` "Tersedia dalam Pakej Complete" + "Naik taraf" → `waLink(support_wa, wa_upgrade_text)`.
- Reader: pdf.js canvas per page (lazy), overlay watermark `${full_name} · ${phone}` diagonal repeated, opacity ~0.12, drawn into the canvas (not a removable DOM layer); saves `last_page` debounced; "Tandakan selesai dibaca"; download button only if `allow_download`; disable context menu on canvas.

- [ ] **Step 1:** Implement. **Step 2: Browser verification:** upload a real ~10 MB PDF to the dev Drive folder, set `file_drive_id`; complete user opens it, progress bar shows, pages render with watermark, reopen loads from cache instantly and resumes last page; basic user sees ebook 02 locked and direct `#/ebook/<id-of-02>` shows lock (and Network shows `ok:false`).
- [ ] **Step 3:** Commit `feat(app): ebook library and watermarked reader`.

### Task 12: Groups, account, code redemption

**Files:** Create `src/pages/Groups.tsx`, `src/pages/account/{Account,Codes}.tsx`, `src/pages/Aktif.tsx`.

- Groups: cards from `my_groups()`; "Sertai Group" opens `invite_url`; locked → lock + Naik taraf.
- Account: profile (name editable; email/phone read-only with "hubungi admin untuk tukar"), change password, list of purchases & codes with package names, entitlement list, logout, "Minta padam data" (WhatsApp with templated text — PDPA).
- Codes (`#/akaun/kod`, and `#/aktif` for logged-in users; logged-out `#/aktif` redirects to `#/daftar` with note "Ada kod? Log masuk dahulu"): input → `redeem_code` → success lists new items; BM error per reason.

- [ ] **Step 1:** Implement. **Step 2: Browser verification:** basic user redeems an `upgrade_a_b` code → ebook 02 unlocks without reload of account; reuse same code → "Kod ini telah digunakan"; groups page shows MUSCLE MANIA unlocked after.
- [ ] **Step 3:** Commit `feat(app): groups, account, code redemption`.

### Task 13: Admin menu

**Files:** Create `src/pages/admin/*`.

- **AdminHome:** `v_admin_summary` tiles; recent `bcl_webhook_log` errors; `email_queue` pending/failed count.
- **Purchases:** search (nama/emel/telefon/order), filter status/batch/package; "Perlu semakan" tab; actions via `admin_purchase_action` + `gas.call('admin.reprocessOrder'|'admin.resendWelcome')`; WhatsApp button using `wa_template_purchase` for `belum_dituntut`; badge for `belum_dituntut` > 24 h where an account with that email exists (possible squatter).
- **BclMap:** CRUD `bcl_form_map` (formable_id, amount, field value → package).
- **Codes:** generate bulk (package, count 1–500, batch, label, access end) → CSV download (`kod, pakej, batch`); generate single for buyer → "Hantar via WhatsApp" with `wa_template_code`; list with search/filters; actions cancel/reactivate/release/transfer/set entitlements/extend.
- **Participants:** `v_participants` list + search; detail: profile, entitlements, purchases, codes; actions reset password (`admin.resetPassword`, shows temp password once), manual grant/revoke, WhatsApp.
- **Content** (superadmin): batches (dates & phases), ebooks (title, description, cover URL, Drive file ID, allow download, mark updated), groups (invite URLs per batch), packages & items, `app_settings` templates.
- **Exports:** CSV of participants, purchases, codes (via `toCsv`).
- **Audit:** `audit_logs` list, newest first.
- Coach sees AdminHome + Participants (read-only) only; superadmin-only controls hidden for coach and enforced server-side already.

- [ ] **Step 1:** Implement. **Step 2: Browser verification** as superadmin: generate 3 codes → CSV downloads with 3 rows; cancel one → its redeemer loses items on next refresh; map a form; reprocess an order; reset a test user's password and log in with it. As coach: Codes/Content routes not reachable and RPC calls fail.
- [ ] **Step 3:** Commit `feat(app): admin menu`.

### Task 14: Blogspot delivery, deploy script, README, launch checklist

**Files:** Create `blogspot/template.xml`, `scripts/deploy.mjs`, `README.md`.

**Interfaces:**
- `blogspot/template.xml`: minimal valid Blogger theme (required `b:skin` and one `b:section`, hidden), no Blogger navbar/widgets; `<div id="app">`; loads Google Fonts, Phosphor web CSS, `https://cdn.jsdelivr.net/gh/<owner>/hdm-booster@<version>/dist/app.css` and `app.js`; sets `window.HDM_CONFIG = {supabaseUrl, anonKey, gasUrl}` inline (public values only).
- `scripts/deploy.mjs`: `npm run build` → commit `dist/` → `git tag vYYYYMMDD-N` → push → prints the tag; the template references `@latest-tag` via a tiny loader that fetches `https://data.jsdelivr.com/v1/packages/gh/<owner>/hdm-booster/resolved?specifier=latest` — **or** the owner pastes the new tag (README explains the one-line change). Builder picks whichever proves reliable in testing; document it.
- README (BM): setup Supabase (projects, `db push`, seed, Auth: confirm email OFF, SMTP Gmail, site URL = Blogspot URL, redirect `#/reset`), first superadmin (`insert into user_roles`), Apps Script (clasp, Script Properties list, `installTriggers()`, deploy Web App "Execute as me / Anyone"), BCL webhook URL `…/exec?src=bcl&k=<key>`, form mapping, Blogspot template install, how to issue a manual code, how to start next year's batch.

- [ ] **Step 1:** Implement. **Step 2:** Deploy to a test Blogspot; open on a real phone; full flow works from the Blogspot URL (not localhost).
- [ ] **Step 3: Launch checklist on prod (owner present):**
  - Pakej A account: ebooks 02–07 and Group MUSCLE MANIA refused via UI **and** direct `gas.call`/RPC.
  - Pakej B account: all 12 items open.
  - Code reused → refused; cancelled code → access gone immediately; `upgrade_a_b` code on A account → B items open, same account.
  - Real BCL order (test mode + one live) → purchase row → email → register → ebook opens.
  - Load test: `scripts/loadtest.mjs` — 200 concurrent `check_purchase` + sign-ins against **dev** → 0 errors, p95 < 2 s.
  - 375 px and desktop, no horizontal scroll on every page.
  - `nightlyBackup` and `keepAlive` triggers present; Supabase SMTP set; email confirm OFF.
- [ ] **Step 4:** Commit `chore: blogspot delivery, deploy script, README`.

---

## Deferred to later plans (not in Peringkat 1)
Peringkat 2 (before 10/12): dashboard, daily tracker + offline queue, Cabaran #1, announcements, reminder emails, coach progress views. Peringkat 3: photos to Drive (incl. onboarding "before" photo), Cabaran #2/#3, Ramadan tracker, Graduation Report & certificates. Concurrent-session limit (2 devices) is dropped for now — Supabase Free has no built-in control; revisit in Peringkat 2.
