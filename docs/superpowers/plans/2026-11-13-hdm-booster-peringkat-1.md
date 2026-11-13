# HDM BOOSTER v2 — Peringkat 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** By 01/12/2026, a buyer who pays for Pakej A or B on BCL can register, log in, complete onboarding, and open exactly the ebooks, TDEE calculator and support groups they bought; the owner manages purchases, codes and content from an Admin menu in the same app.

**Architecture:** A Preact SPA (hash routing) on Blogspot logs users in with Firebase Auth and talks only to one Cloudflare Worker. The Worker verifies the Firebase ID token, takes `uid` from the token only, authorises by role and entitlement, and runs parameterised SQL on HornetHive (Postgres 18) with a server-held `dml` key; transactional logic lives in SQL functions that take `p_uid` first. Apps Script receives BCL webhooks (forwarding purchases to the Worker with HMAC), serves ebook PDFs from Drive against Worker-signed tickets, sends email, and backs up nightly.

**Tech Stack:** Node 26, Vite 5, Preact 10 + TypeScript, Tailwind 3, Vitest 2, `firebase` JS SDK v11 (auth only), Cloudflare Workers + `wrangler` + `hono` 4 + `jose` 5, HornetHive REST `/query` (no SDK required), `pdfjs-dist` 4, `@phosphor-icons/web`, `@google/clasp` (Apps Script V8, plain JS), Superdesign CLI for UI mockups.

**Spec:** `docs/superpowers/specs/2026-11-13-hdm-booster-design.md` (+ `PROMPT-SISTEM-HDM-BOOSTER.md` for item catalogue, copy and UI rules). Read both before any task.

## Global Constraints

- No HornetHive key in the browser, the frontend bundle, or git. `dml` key = Worker secret `HIVE_DML_KEY`; `read` key = Apps Script property `HIVE_READ_KEY`; `ddl` key = local `.env.test` / `.env.prod` only (gitignored).
- Worker takes `uid` from the verified Firebase ID token only; any `uid`/`user_id` in a request body or query is ignored.
- Every SQL call from the Worker is parameterised (`$1…`); no string-built SQL with user input. Table/column names in admin CRUD come from a fixed whitelist.
- Firebase ID token check: JWKS `https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com`, `iss = https://securetoken.google.com/<FIREBASE_PROJECT_ID>`, `aud = <FIREBASE_PROJECT_ID>`, not expired.
- HMAC for Apps Script ↔ Worker: header `X-HDM-Sig: t=<unix seconds>,v1=<hex HMAC-SHA256(secret, "<t>.<raw body>")>`, accepted within ±300 s. Ebook ticket: `base64url(JSON{ebookId,fileId,uid,exp}) + "." + base64url(HMAC-SHA256(TICKET_SECRET, payload))`, `exp` = now + 300 s.
- All UI text Bahasa Melayu Malaysia; RM; dates `DD/MM/YYYY`; all day/week logic in `Asia/Kuala_Lumpur`.
- Every error shown to a user is a BM sentence that says what to do next. Worker error JSON: `{ok:false, reason:'<code>', message:'<BM sentence>'}`; success `{ok:true, data}`.
- Every admin mutation writes one `audit_logs` row.
- Item keys exactly: `sistem, ebook_strategi, ebook_muscle_mania, ebook_traditional_remedy, ebook_tas, ebook_food_swap, ebook_emergency, ebook_supplement, tdee, graduation, group_hdm, group_muscle_mania`. Pakej `basic` (RM100): `sistem, ebook_strategi, tdee, graduation, group_hdm`. `complete` (RM150): all 12. `upgrade_a_b` (`sellable=false`): the 7 B-only keys.
- Access code `HDMB-XXXX-XXXX`, alphabet `ABCDEFGHJKMNPQRSTUVWXYZ23456789`; normalisation ignores case, spaces, hyphens (existing `src/lib/codes.ts`).
- Rate limit: 5 failed attempts / 15 min per subject (IP, and user where known) for `register` and `redeem`.
- One HornetHive call per Worker request where possible: composite reads are one SQL function returning `jsonb`.
- Mobile-first 375px, no horizontal scroll; tab bar Utama · Rekod · Ebook · Cabaran · Akaun (+ Admin for staff); colours `#2563eb` / `#f97316` / `#0f172a` / `#16a34a` / `#facc15`; fonts Outfit / Quicksand / Inter 800; Phosphor icons; respects `prefers-reduced-motion`.
- Support WhatsApp `60134417042`. Health note & disclaimer text exactly as MD asal §10.

## Review Focus

1. **Participant A sends B's id anywhere** (`/api/ebook/:id/progress`, admin-looking routes, body `user_id`) → never reads or writes B's data. Pinned in Task 7 security suite.
2. **Phone/email typed differently at register vs BCL** (`012-345 6789`, `+60123456789`, `" Ali@Gmail.COM "`) → matches the same purchase. Pinned in Task 3 and Task 7.
3. **Same BCL order delivered twice / webhook + poll race** → one purchase row, one email. Pinned in Task 3 (SQL) and Task 9 (lock + known-orders).
4. **Orphan Firebase account with buyer's email** (someone called Firebase sign-up directly) → no access to any `/api/*`; real buyer's `register` deletes the orphan and succeeds. Pinned in Task 8.
5. **Expired / forged ebook ticket or webhook signature replayed after 5 min** → Apps Script / Worker refuse. Pinned in Task 6 (`hmac.ts`) and Task 10.

---

## File Structure

```
db/migrations/0001_core.sql · 0002_purchases.sql · 0003_codes.sql · 0004_content.sql · 0005_admin.sql
db/seed.sql
scripts/sqlsplit.mjs (pure) · scripts/migrate.mjs · scripts/hive.mjs (node HornetHive client for scripts/tests)
worker/ wrangler.toml · src/index.ts (wires real deps) · src/app.ts (createApp(deps))
        src/auth.ts · src/hive.ts · src/hmac.ts · src/guard.ts · src/errors.ts · src/firebaseAdmin.ts
        src/routes/{public,me,ebook,codes,admin,internal}.ts
apps-script/ appsscript.json · .clasp.json · Config.gs.js · Hmac.gs.js · Router.gs.js · BclLogic.gs.js (pure)
             Bcl.gs.js · Worker.gs.js · Mail.gs.js · Ebook.gs.js · Jobs.gs.js
src/ (frontend) lib/{config,firebase,api,gas,errors}.ts (+ existing phone,codes,dates,tdee,csv,wa)
     state/session.ts · router.ts · ui/* · pages/** (as in Tasks 12–16)
tests/unit/* (existing + sqlsplit, hmac) · tests/db/* (SQL vs hdm_dev) · tests/worker/* (app vs hdm_dev, fake token verifier)
tests/gas/{load.ts, bclLogic.test.ts, hmac.test.ts}
design/ (Superdesign canvas links + exported reference PNGs)
blogspot/template.xml · scripts/deploy.mjs · scripts/loadtest.mjs · README.md
.env.prod.example (HIVE_API_BASE, HIVE_DB_ID, HIVE_DDL_KEY, HIVE_DML_KEY) · .env.example (VITE_FIREBASE_*, VITE_API_URL, VITE_GAS_URL)
```

**Single environment (owner decision 13/11/2026):** there is no dev. One HornetHive DB `hdm_prod`, one Firebase project `hdm-prod`, one Worker `hdm-api`, one Apps Script deployment. All local keys live in `.env.prod` (gitignored); `.env.test*` files are retired. Wherever a task below says "dev", `hdm_dev`, `hdm-dev`, `.env.test` or `--env test`, read prod / `hdm_prod` / `hdm-prod` / `.env.prod` / `--env prod`. Until launch (01/12) the prod DB is empty and DB/Worker integration tests run against it with `test_`-prefixed uids cleaned up after each test; after launch, write-tests never run against prod (spec §3.4).

Test layers: `npm test` = unit + gas (no network). `npm run test:db` and `npm run test:worker` = against **hdm_prod (pre-launch only)** using `.env.prod`. Worker tests call `createApp({verifyToken: fakeVerifier, hive, firebaseAdmin: fake, ...})` — a fake verifier maps `"tok:<uid>"` → `{uid, email}`; production `index.ts` wires the real JWKS verifier. No test-mode flag exists in production code.

---

## Prerequisites (owner does these; agent must not create accounts or enter real credentials)

- [ ] HornetHive **Free** plan; one database `hdm_prod`; `ddl`, `dml` and `read` keys limited to it. Owner writes them into `.env.prod` (from `.env.prod.example`).
- [ ] Firebase project `hdm-prod` (Spark): Authentication → Email/Password ON; authorised domain = the Blogspot domain (+ `localhost`); download the service account JSON (kept local, later `wrangler secret`).
- [ ] Cloudflare account; owner runs `npx wrangler login` once on this PC.
- [ ] GitHub account + public repo `hdm-booster`; Blogspot blog (e.g. `hdmbooster.blogspot.com`).
- [ ] BCL API token + webhook key (later into Apps Script properties); Google account for Apps Script; owner runs `npx @google/clasp login` once.
- [ ] Superdesign: owner logs in when the CLI asks (Task 11).

---

### Task 1: HornetHive platform check, SQL splitter, migration runner

**Files:** Create `scripts/sqlsplit.mjs`, `scripts/hive.mjs`, `scripts/migrate.mjs`, `.env.test.example`, `tests/unit/sqlsplit.test.ts`, `docs/hornethive-notes.md`; modify `package.json` scripts, `.gitignore` (`.env.prod`).

**Interfaces — Produces:**
- `splitSql(text: string): string[]` — splits on `;` at top level, ignoring `;` inside `'…'`, `"…"`, `--` / `/* */` comments, and dollar-quoted blocks (`$$…$$`, `$tag$…$tag$`); trims; drops empties.
- `hiveQuery({base, dbId, key}, sql: string, params?: unknown[]): Promise<Record<string, unknown>[]>` — exact endpoint path/body read from https://hornethive.io/docs/rest-api; throws `Error(message)` with HornetHive's error text on non-2xx.
- `npm run migrate -- --env test|prod` — applies `db/migrations/*.sql` not yet in `schema_migrations(name text pk, applied_at timestamptz)`, each statement via `hiveQuery` with the ddl key, then `db/seed.sql` when `--seed`.

- [ ] **Step 1: Failing tests** in `tests/unit/sqlsplit.test.ts`:

```ts
expect(splitSql('select 1; select 2;')).toEqual(['select 1', 'select 2']);
expect(splitSql("select ';'; select 2")).toEqual(["select ';'", 'select 2']);
expect(splitSql('create function f() returns int language plpgsql as $$ begin return 1; end; $$; select 3'))
  .toEqual(['create function f() returns int language plpgsql as $$ begin return 1; end; $$', 'select 3']);
expect(splitSql('-- a;b\nselect 1 /* x; y */;')).toEqual(['-- a;b\nselect 1 /* x; y */']);
expect(splitSql('do $body$ begin perform 1; end $body$;')).toHaveLength(1);
```

- [ ] **Step 2:** `npm test -- sqlsplit` → FAIL. **Step 3:** implement. **Step 4:** PASS.
- [ ] **Step 5: Platform probe** (against `hdm_dev`, ddl key): run via `hiveQuery` and record results in `docs/hornethive-notes.md`: `select version()`; `create extension if not exists pgcrypto`; `select gen_random_uuid(), gen_random_bytes(4)`; a `language plpgsql` function; a trigger; `insert` then immediate `select` through the same path returns the new row (no cache); whether a usage/quota endpoint exists. **If plpgsql or pgcrypto is refused, stop and report to the controller** (design §3.3 fallback: logic moves to Worker).
- [ ] **Step 6:** Commit `chore: hornethive client, sql splitter, migration runner`.

### Task 2: Core schema, catalogue seed, entitlements

**Files:** Create `db/migrations/0001_core.sql`, `db/seed.sql`, `tests/db/helpers.ts`, `tests/db/entitlements.test.ts`, `vitest.db.config.ts`.

**Interfaces — Produces (SQL):**
- Tables: `items(key text pk, name, kind text check in ('modul','ebook','tool','group'), sort int, active bool default true)`, `packages(id text pk, name, price_rm numeric, sellable bool)`, `package_items(package_id, item_key, pk both)`, `batches(id uuid pk default gen_random_uuid(), name, sales_open_at timestamptz, sales_close_at timestamptz, program_start date, program_end date, phases jsonb, status text check in ('akan_datang','berjalan','tamat'))`, `profiles(id text pk /* firebase uid */, full_name, email text unique, phone text, onboarded_at, created_at default now())`, `user_roles(user_id text, role text check in ('superadmin','coach'), pk both)`, `audit_logs(id bigserial, actor text, action text, target_type text, target_id text, detail jsonb, at timestamptz default now())`, `app_settings(key text pk, value jsonb, public bool default false)`, `manual_grants(id uuid pk, user_id text, item_key text, granted_by text, reason text, revoked_at timestamptz, created_at default now())`.
- `log_audit(p_actor text, p_action text, p_target_type text, p_target_id text, p_detail jsonb) returns void`.
- `roles_for(p_uid text) returns text[]`.
- `entitlements_for(p_uid text) returns text[]` — sorted distinct union of sources; later migrations `create or replace` it to add purchases (Task 3) and codes (Task 4).
- Seed: 12 items, 3 packages + package_items, Batch "Batch Rejab 1448" (sales_open `2026-12-01 00:00+08`, sales_close `2027-01-31 23:59+08`, program `2026-12-10`→`2027-03-10`, phases `rejab 2026-12-10..2027-01-08`, `syaaban 2027-01-09..2027-02-07`, `ramadan 2027-02-08..2027-03-09`, status `akan_datang`).
- `tests/db/helpers.ts`: `q(sql, params)` (dml key), `newUid(): string` (random `test_` + 20 chars), `cleanup(uids)`.

- [ ] **Step 1: Failing tests**

```ts
test('no sources → []', async () => expect(await ents(u)).toEqual([]));
test('manual grant tdee → [tdee]; revoked_at set → []', ...);
test('seed: complete has 12 items, basic has exactly sistem,ebook_strategi,tdee,graduation,group_hdm', ...);
test('roles_for returns [] for participant, [superadmin] after insert', ...);
```

- [ ] **Step 2:** `npm run migrate -- --env test --seed` then `npm run test:db -- entitlements` → FAIL. **Step 3:** write migration + seed; migrate. **Step 4:** PASS.
- [ ] **Step 5:** Commit `feat(db): core schema, catalogue, entitlements`.

### Task 3: Purchases, registration matching, rate limit

**Files:** Create `db/migrations/0002_purchases.sql`, `tests/db/purchases.test.ts`.

**Interfaces — Produces:**
- `normalize_phone(text) returns text` (same rules as `src/lib/phone.ts`: result `^601\d{8,9}$` or null), `normalize_email(text)` = `lower(trim())`.
- `purchases(id uuid pk, order_ref text unique, batch_id uuid null, package_id text null, entitlements text[], buyer_name, email, phone, amount_rm numeric, paid_at timestamptz, status text check in ('belum_dituntut','dituntut','perlu_semakan','dibatalkan'), review_reason text, claimed_by text, claimed_at, source text check in ('bcl','manual'), raw jsonb, created_at)`; `bcl_form_map(id uuid pk, formable_id text, amount_rm numeric, field_value text, package_id text, active bool)`; `bcl_webhook_log(id bigserial, order_ref, kind text, ok bool, message text, payload jsonb, at)`; `email_queue(id uuid pk, to_email, subject, body_html, kind, ref_id, status text check in ('pending','sent','failed') default 'pending', attempts int default 0, last_error, created_at, sent_at)`; `rate_attempts(id bigserial, kind text, subject text, ok bool, at timestamptz default now())`.
- `rate_blocked(p_kind text, p_subjects text[]) returns bool` — true when any subject has ≥5 `ok=false` rows of that kind in the last 15 min. `rate_record(p_kind text, p_subjects text[], p_ok bool) returns void`.
- `upsert_purchase(p jsonb) returns jsonb` → `{row: purchases, inserted: bool}`; p keys `order_ref, buyer_name, email, phone, amount_rm, paid_at, package_id (nullable), review_reason (nullable), source, raw`. Insert-or-ignore on `order_ref`; normalises email/phone; copies `package_items` → `entitlements`; `batch_id` = batch whose sales window contains `paid_at` (none → `perlu_semakan`, reason `Tiada batch dibuka`); null `package_id` → `perlu_semakan`; then auto-claim to `profiles` row with same email AND phone (`dituntut`); enqueues one `purchase_welcome` email only when inserted.
- `register_check(p_email text, p_phone text) returns jsonb` → `{ok:true, packages:[names], profile_exists:bool}` or `{ok:false, reason:'tiada_pembelian'}`; matches `belum_dituntut` or `dituntut` rows by normalised email AND phone.
- `register_complete(p_uid text, p_email text, p_phone text, p_name text) returns jsonb` → creates `profiles` (fails `sudah_didaftar` if email exists on another uid), claims all matching `belum_dituntut` purchases, returns `{ok:true, entitlements:[…]}`.
- `entitlements_for` extended with `dituntut` purchases' `entitlements`.

- [ ] **Step 1: Failing tests**

```ts
test('upsert normalises: Ali@Gmail.com/012-345 6789 → ali@gmail.com/60123456789', ...);
test('register_check matches " ali@gmail.COM " + "+60123456789"', ...);
test('register_check wrong phone → tiada_pembelian', ...);
test('register_complete claims purchase → entitlements = basic 5 keys', ...);
test('upsert same order_ref twice → 1 purchase row, 1 email_queue row, inserted=false 2nd', ...);
test('A buyer later buys B (same email+phone) → auto-claimed, 12 keys', ...);
test('paid_at 2026-11-20 (before sales_open) → perlu_semakan "Tiada batch dibuka"', ...);
test('register_complete with email already on another uid → sudah_didaftar', ...);
test('rate: 5 failures then rate_blocked → true; other subject false', ...);
```

- [ ] **Steps 2–4:** migrate → FAIL → implement → PASS. **Step 5:** Commit `feat(db): purchases, registration matching, rate limit`.

### Task 4: Access codes

**Files:** Create `db/migrations/0003_codes.sql`, `tests/db/codes.test.ts`.

**Interfaces — Produces:**
- `access_codes(id uuid pk, code text unique, package_id, entitlements text[], batch_id uuid, batch_label, status text check in ('belum_guna','aktif','dibatalkan'), redeemed_by text, redeemed_at, access_starts_at, access_ends_at, buyer_name, buyer_phone, buyer_email, order_ref, note, created_by, created_at)`.
- `generate_codes(p_actor text, p_package_id text, p_count int, p_batch_id uuid, p_label text, p_buyer jsonb default null, p_access_ends_at timestamptz default null) returns setof access_codes` — `p_count` 1–500 else error `bilangan_tidak_sah`; `gen_random_bytes` over the 31-char alphabet; retry on collision; audit.
- `redeem_code(p_uid text, p_code text) returns jsonb` → `{ok:true, items:[new keys]}` or `{ok:false, reason:'tidak_sah'|'sudah_digunakan'|'dibatalkan'|'tamat_tempoh'}` (rate limit applied by Worker via `rate_*`, kind `redeem`). `p_code` already normalised by Worker.
- `admin_code_action(p_actor text, p_id uuid, p_action text, p_payload jsonb) returns access_codes` — `cancel`, `reactivate`, `release` (→ belum_guna, clears redeemed_by), `transfer` (`{user_id}`), `set_entitlements` (`{items}`), `extend` (`{access_ends_at}`); audit each.
- `entitlements_for` extended with `aktif` codes where `access_ends_at` null or future.

- [ ] **Step 1: Failing tests**

```ts
test('generate 3 basic → /^HDMB-[ABCDEFGHJKMNPQRSTUVWXYZ2-9]{4}-[ABCDEFGHJKMNPQRSTUVWXYZ2-9]{4}$/, unique', ...);
test('redeem → ok, entitlements basic; same code by 2nd uid → sudah_digunakan', ...);
test('cancel → entitlements drop immediately; redeem cancelled → dibatalkan', ...);
test('upgrade_a_b on basic user → 12 keys', ...);
test('transfer moves entitlements and writes audit row', ...);
test('p_count 501 → bilangan_tidak_sah', ...);
```

- [ ] **Steps 2–4:** FAIL → implement → PASS. **Step 5:** Commit `feat(db): access codes`.

### Task 5: Content, groups, onboarding, admin SQL

**Files:** Create `db/migrations/0004_content.sql`, `db/migrations/0005_admin.sql`; extend `db/seed.sql`; Test `tests/db/content.test.ts`, `tests/db/admin.test.ts`.

**Interfaces — Produces:**
- `ebooks(id uuid pk, item_key, number int, title, description, cover_url, file_drive_id, allow_download bool default false, file_updated_at timestamptz, sort int)`; `reading_progress(user_id text, ebook_id uuid, last_page int, finished_at, updated_at, pk(user_id, ebook_id))`; `groups(id uuid pk, item_key, batch_id uuid null, name, coach, description, invite_url)`.
- `profiles` onboarding columns: `sex text check in ('L','P')`, `birth_year int`, `height_cm numeric`, `start_weight_kg numeric`, `start_body_fat_pct numeric`, `start_waist_cm numeric`, `activity_level int check 1–5`, `target_weight_kg numeric`, `protein_target_g int`, `health_ack_at`, `privacy_ack_at`, `tdee_kcal int`, `kcal_target int`.
- `app_bootstrap(p_uid text) returns jsonb` → `{profile, roles, entitlements, batch:{…current batch of user, else open batch}, catalog:{items, packages, ebooks:[without file_drive_id], settings:{public app_settings}}, reading:[reading_progress rows]}` — the one call behind `GET /api/me`.
- `my_groups(p_uid text) returns jsonb` → array `{id,item_key,name,coach,description,invite_url|null,locked}`; batch-specific groups only for batches where the user has a claimed purchase or active code; `batch_id` null = all.
- `save_onboarding(p_uid text, p jsonb) returns jsonb`; `save_targets(p_uid text, p jsonb)`; `save_reading(p_uid text, p_ebook_id uuid, p_last_page int, p_finished bool)`; `account_summary(p_uid text) returns jsonb` (purchases + codes with package names).
- `ebook_for_ticket(p_uid text, p_ebook_id uuid) returns jsonb` → `{ok:true, fileId, updatedAt, allowDownload}` or `{ok:false, reason:'tiada_akses'|'tiada_fail'}`.
- Admin (`p_actor` first, caller already role-checked by Worker; functions re-check `roles_for(p_actor)` and raise `tiada_kebenaran`): `admin_summary(p_actor)`, `admin_participants(p_actor, p_q text)`, `admin_participant(p_actor, p_uid)`, `admin_purchases(p_actor, p_filter jsonb)`, `admin_purchase_action(p_actor, p_id uuid, p_action text, p_payload jsonb)` (`assign {user_id}`, `set_package {package_id}`, `cancel`, `restore`), `admin_grant(p_actor, p_uid, p_item_key, p_reason)`, `admin_revoke_grant(p_actor, p_grant_id)`, `admin_codes(p_actor, p_filter jsonb)`, `admin_audit(p_actor, p_limit int)`. Coach allowed only `admin_summary`, `admin_participants`, `admin_participant`.
- Seed: 7 placeholder ebooks (01–07, keys per catalogue), 2 groups (`group_hdm` "Coach Iffat Salleh", `group_muscle_mania` 'Coach Anuar Yusof "Toy"') with placeholder invite URLs; `app_settings` public: `support_wa`=`"60134417042"`, `wa_upgrade_text`, `upgrade_note`; private: `wa_template_purchase`, `wa_template_code`.

- [ ] **Step 1: Failing tests**

```ts
test('basic user my_groups: group_hdm invite_url set; group_muscle_mania locked, invite_url null', ...);
test('app_bootstrap ebooks never contain file_drive_id', ...);
test('ebook_for_ticket basic user + ebook 02 → tiada_akses; complete user → fileId', ...);
test('save_reading only touches p_uid row', ...);
test('coach: admin_participants ok; admin_purchase_action → tiada_kebenaran', ...);
test('set_package basic→complete recopies 12 entitlements and writes audit', ...);
```

- [ ] **Steps 2–4:** FAIL → implement → PASS. **Step 5:** Commit `feat(db): content, groups, onboarding, admin functions`.

### Task 6: Worker foundation (auth, hive, hmac, guards)

**Files:** Create `worker/wrangler.toml`, `worker/src/{index,app,auth,hive,hmac,guard,errors}.ts`, `tests/unit/hmac.test.ts`, `tests/worker/foundation.test.ts`, `vitest.worker.config.ts`; add deps `hono`, `jose`, dev `wrangler`.

**Interfaces — Produces:**
- `type Deps = { verifyToken(tok: string): Promise<{uid: string; email: string} | null>; hive: Hive; firebaseAdmin: FirebaseAdmin; secrets: {internal: string; ticket: string}; gasUrl: string; now(): number }`.
- `createApp(deps: Deps): Hono` — CORS allows `ALLOWED_ORIGINS` (comma list: Blogspot origin, `http://localhost:5173`); JSON errors per Global Constraints; unknown route → 404 `{ok:false, reason:'tiada'}`.
- `interface Hive { q<T>(sql: string, params?: unknown[]): Promise<T[]>; one<T>(sql, params?): Promise<T> }` (`hive.ts`, fetch to HornetHive `/query` per Task 1 notes).
- `firebaseVerifier(projectId: string): Deps['verifyToken']` (`auth.ts`, `jose` remote JWKS, cached).
- `signHmac(secret, t, body): Promise<string>`, `verifySigHeader(secret, header, body, nowSec): Promise<boolean>`, `signTicket(secret, payload, nowSec)`, `verifyTicket(secret, ticket, nowSec): Promise<payload | null>` (`hmac.ts`, Web Crypto; same algorithm reimplemented in `apps-script/Hmac.gs.js`).
- Middleware (`guard.ts`): `requireUser` (sets `c.var.user = {uid, email, roles, hasProfile}` via one call `select roles_for($1), exists(select 1 from profiles where id=$1)`; no profile → 403 `tiada_profil` "Akaun ini belum didaftarkan. Sila daftar di halaman Daftar."), `requireRole(...roles)`, `requireInternal` (HMAC).
- Secrets via `wrangler secret`: `HIVE_DML_KEY`, `INTERNAL_SECRET`, `TICKET_SECRET`, `FIREBASE_SA_JSON`; vars: `HIVE_API_BASE`, `HIVE_DB_ID`, `FIREBASE_PROJECT_ID`, `ALLOWED_ORIGINS`, `GAS_URL`. Two environments in `wrangler.toml`: default = dev (`hdm-api-dev`), `[env.prod]` (`hdm-api`).

- [ ] **Step 1: Failing tests**

```ts
// hmac.test.ts
const t = 1_800_000_000; const h = `t=${t},v1=${await signHmac('s', t, '{"a":1}')}`;
expect(await verifySigHeader('s', h, '{"a":1}', t + 299)).toBe(true);
expect(await verifySigHeader('s', h, '{"a":1}', t + 301)).toBe(false);
expect(await verifySigHeader('s', h, '{"a":2}', t)).toBe(false);
const tk = await signTicket('k', {ebookId:'e', fileId:'f', uid:'u'}, t);
expect(await verifyTicket('k', tk, t + 10)).toMatchObject({ebookId:'e', uid:'u'});
expect(await verifyTicket('k', tk, t + 301)).toBeNull();
expect(await verifyTicket('k', tk.slice(0,-2) + 'xx', t)).toBeNull();
// foundation.test.ts (fake verifier "tok:<uid>")
test('no Authorization → 401 perlu_log_masuk', ...);
test('valid token, no profile → 403 tiada_profil', ...);
test('internal route without/with stale signature → 401', ...);
test('CORS: disallowed origin gets no Access-Control-Allow-Origin', ...);
```

- [ ] **Steps 2–4:** FAIL → implement → PASS. **Step 5:** `npx wrangler deploy` (dev) succeeds; `curl <dev>/api/me` → 401 JSON. **Step 6:** Commit `feat(worker): foundation — auth, hive client, hmac, guards`.

### Task 7: Worker participant routes + security suite

**Files:** Create `worker/src/routes/{me,ebook,codes}.ts`; Test `tests/worker/participant.test.ts`, `tests/worker/security.test.ts`.

**Interfaces — Produces (all `requireUser`):**
- `GET /api/me` → `app_bootstrap(uid)`.
- `PUT /api/me/onboarding` body per Task 5 columns (+ `health_ack:true`, `privacy_ack:true` required) → `save_onboarding`.
- `PUT /api/me/targets` `{tdee_kcal, kcal_target, protein_target_g}` (requires `tdee`) → `save_targets`.
- `PUT /api/me/name` `{full_name}`; `GET /api/me/access` → `account_summary`.
- `GET /api/groups` → `my_groups`.
- `POST /api/codes/redeem` `{code}` → normalise with `src/lib/codes.ts` (null → `tidak_sah`), `rate_blocked('redeem',[ip,uid])` → `terlalu_banyak_cubaan`, `redeem_code`, `rate_record`.
- `POST /api/ebook/:id/ticket` → `ebook_for_ticket`; ok → `{ticket, updatedAt, allowDownload}` (ticket carries `fileId`); else 403 with "Ebook ini tersedia dalam Pakej Complete."
- `PUT /api/ebook/:id/progress` `{last_page, finished}` → `save_reading(uid, …)`.

- [ ] **Step 1: Failing tests** — participant flows (bootstrap shape, onboarding saves, redeem ok + 6th bad → `terlalu_banyak_cubaan`) and `security.test.ts`, table-driven over every participant route:

```ts
test.each(routes)('%s without token → 401', ...);
test('A PUT progress with body user_id=B → only A row changes', ...);
test('A GET /api/me never contains B data even with ?uid=B', ...);
test('basic user ticket for ebook 02 → 403, body has no ticket', ...);
test('basic user /api/groups: muscle mania invite_url null', ...);
test('basic user PUT /api/me/targets without tdee → 403', ...);
test('participant hitting every /api/admin/* route → 403', ...);
```

- [ ] **Steps 2–4:** FAIL → implement → PASS. **Step 5:** Commit `feat(worker): participant routes and security suite`.

### Task 8: Worker register, admin and internal routes; Firebase Admin

**Files:** Create `worker/src/routes/{public,admin,internal}.ts`, `worker/src/firebaseAdmin.ts`; Test `tests/worker/register.test.ts`, `tests/worker/admin.test.ts`, `tests/worker/internal.test.ts`.

**Interfaces — Produces:**
- `interface FirebaseAdmin { getUserByEmail(email): Promise<{uid} | null>; createUser({email, password, displayName}): Promise<{uid}>; deleteUser(uid): Promise<void>; setPassword(uid, password): Promise<void> }` — Identity Toolkit REST with an OAuth token minted from `FIREBASE_SA_JSON` (RS256 JWT via `jose`, scope `https://www.googleapis.com/auth/identitytoolkit`), token cached until expiry.
- `POST /api/register` (public) `{email, phone, name, password(≥8), privacyAck:true}` → rate check kind `register` by IP → `register_check` → if `tiada_pembelian` record failure; if a Firebase user exists for the email: has profile → `sudah_didaftar`, no profile (orphan) → `deleteUser` → `createUser` → `register_complete` (on SQL failure `deleteUser` the new account) → `{ok:true}`.
- `/api/admin/*` — staff: `GET summary`, `GET participants?q=`, `GET participants/:uid`; superadmin: `POST participants/:uid/grant {item_key, reason}`, `POST grants/:id/revoke`, `POST participants/:uid/reset-password` → random 10-char temp password via `setPassword`, returned once, audit; `GET purchases?…`, `POST purchases/:id/action {action, payload}`, `POST purchases/:id/reprocess` (calls Apps Script `doPost` `{src:'worker', action:'reprocessOrder', orderRef}` signed with `INTERNAL_SECRET`), `POST purchases/:id/resend-welcome` (insert `email_queue`); `GET|POST|PUT|DELETE bcl-map[/:id]`; `POST codes/generate`, `GET codes?…`, `POST codes/:id/action`; content CRUD `GET|POST|PUT|DELETE content/:table[/:id]` with `:table` ∈ whitelist `batches, ebooks, groups, packages, package_items, items, app_settings` and column whitelist per table; `GET audit?limit=`.
- `/internal/*` (`requireInternal`): `GET bcl-config` → active `bcl_form_map` rows; `POST known-orders {refs}` → refs already in `purchases`; `POST purchase` → `upsert_purchase`; `POST bcl-log {…}`; `GET email-queue?limit=20` (pending); `POST email-queue/:id {status, error}`.

- [ ] **Step 1: Failing tests** (fake FirebaseAdmin in memory):

```ts
test('register with matching purchase → createUser called, profile created, entitlements basic', ...);
test('register when orphan Firebase account exists → orphan deleted, new account, ok', ...);
test('register when profile exists → sudah_didaftar, no createUser', ...);
test('register no purchase ×6 from same IP → 6th terlalu_banyak_cubaan', ...);
test('register SQL failure after createUser → deleteUser called (no stray account)', ...);
test('coach: summary/participants 200; grant, codes, content, purchases → 403', ...);
test('content/:table outside whitelist → 404; column outside whitelist ignored', ...);
test('every superadmin mutation adds one audit_logs row', ...);
test('internal purchase twice same order_ref → one row (via upsert_purchase)', ...);
```

- [ ] **Steps 2–4:** FAIL → implement → PASS. **Step 5:** deploy dev; real-Firebase smoke: register a seeded dev purchase via `curl`, then sign in with Firebase REST `signInWithPassword`, call `/api/me` with that token → 200. **Step 6:** Commit `feat(worker): register, admin, internal routes, firebase admin`.

### Task 9: Apps Script — BCL webhook, polling, email queue

**Files:** Create `apps-script/{appsscript.json,.clasp.json,Config.gs.js,Hmac.gs.js,Router.gs.js,BclLogic.gs.js,Bcl.gs.js,Worker.gs.js,Mail.gs.js,Jobs.gs.js}`; Test `tests/gas/load.ts`, `tests/gas/bclLogic.test.ts`, `tests/gas/hmac.test.ts`, fixtures `tests/gas/fixtures/*.json`.

**Interfaces — Produces:**
- Script Properties: `WORKER_URL`, `INTERNAL_SECRET`, `TICKET_SECRET`, `BCL_API_BASE` (`https://bcl.my/api`), `BCL_API_TOKEN`, `BCL_WEBHOOK_KEY`, `BCL_FIELD_MAP` (JSON candidate paths for name/email/phone/order/amount/formable_id), `BCL_FEE_TOLERANCE` (default 3), `APP_URL`, `HIVE_API_BASE`, `HIVE_DB_ID`, `HIVE_READ_KEY`, `DRIVE_BACKUP_FOLDER_ID`.
- `BclLogic` (pure, loaded in Node via `vm`): `extractOrderRef(body)`, `isPaidLive(txn)` (status 3 && is_paid && type ≈ 'live'), `buyerFromTxn(txn, fieldMap) → {name,email,phone}`, `matchPackage(txn, rows) → {packageId|null, mapped}` (formable_id first, then amount within tolerance, then field value; `mapped=false` when formable_id in no row), `normalizePhone`, `normalizeEmail`.
- `Hmac.gs.js`: `gasSign(secret, t, body)`, `gasVerifyTicket(secret, ticket, nowSec)` — byte-identical to Task 6 (`tests/gas/hmac.test.ts` cross-checks against `worker/src/hmac.ts` outputs).
- `Worker.gs.js`: `workerCall(method, path, body)` signs with `INTERNAL_SECRET`.
- `doPost(e)`: `e.parameter.src==='bcl'` → `handleBclWebhook` (reject wrong `k`); JSON body `src:'worker'` with valid signature → `reprocessOrder`; otherwise app API (Task 10).
- `processOrder(orderRef, source)`: BCL `GET /transactions/{order}` (Bearer) → `isPaidLive` → `matchPackage` (unmapped → log `ignored`) → `workerCall('POST','/internal/purchase', …)` → `processEmailQueue()`. `LockService` script lock around webhook and poll.
- `pollBcl()` every 10 min: newest 100 transactions → paid live not in `/internal/known-orders` → `processOrder`.
- `processEmailQueue()` every 30 min: pending rows while `MailApp.getRemainingDailyQuota() > 5`; BM welcome body with `APP_URL#/daftar`, name, package, support WA.
- `installTriggers()`.

- [ ] **Step 1: Failing tests**

```ts
expect(isPaidLive({status:3,is_paid:true,type:'Live'})).toBe(true);
expect(isPaidLive({status:3,is_paid:true,type:'test'})).toBe(false);
expect(matchPackage({formable_id:'77',amount:'100.00'}, rows)).toEqual({packageId:'basic',mapped:true});
expect(matchPackage({formable_id:'77',amount:'102.50'}, rows)).toEqual({packageId:'basic',mapped:true}); // fee ≤ RM3
expect(matchPackage({formable_id:'99',amount:'50.00'}, rows)).toEqual({packageId:null,mapped:false});
expect(matchPackage({formable_id:'77',amount:'80.00'}, rows)).toEqual({packageId:null,mapped:true});
expect(buyerFromTxn(fixture, fieldMap)).toEqual({name:'Ali Bin Abu',email:'ali@gmail.com',phone:'60123456789'});
expect(gasSign('s', 1800000000, '{"a":1}')).toBe(await signHmac('s', 1800000000, '{"a":1}'));
```

- [ ] **Steps 2–4:** FAIL → implement → PASS. **Step 5:** `clasp push` to dev script; deploy Web App (execute as owner, anyone). **Step 6: Manual (with owner):** one BCL test-mode + one smallest live order → `bcl_webhook_log` payload; fix `BCL_FIELD_MAP`; one purchase row, one email. Resend same webhook with `curl` → still one row. Disable webhook, pay, wait ≤10 min → poll creates the row. **Step 7:** Commit `feat(gas): BCL webhook, polling, email queue`.

### Task 10: Apps Script — ebook serving, backup

**Files:** Create `apps-script/Ebook.gs.js`; modify `Router.gs.js`, `Jobs.gs.js`; Create `apps-script/Tests.gs.js`.

**Interfaces — Produces** (browser `POST text/plain` JSON `{action, ticket, …}` → `{ok:true, data}` | `{ok:false, message}`):
- `ebook.meta {ticket}` → `{chunks, bytes, updatedAt}`; `ebook.chunk {ticket, index}` → `{b64}` (4 MB slices of Drive file `fileId`). Invalid/expired ticket → `{ok:false, message:'Sesi ebook tamat. Sila buka semula ebook.'}`.
- `nightlyBackup()` 03:00 MYT: each table via `HIVE_READ_KEY` `select … limit/offset` pages → JSON in `DRIVE_BACKUP_FOLDER_ID/YYYY-MM-DD/`; delete folders older than 30 days.

- [ ] **Step 1:** `Tests.gs.js` (run from editor): valid ticket → meta ok; ticket with 1 char changed → refused; ticket `exp` past → refused; no ticket → refused. **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Run → log `PASS 4/4`. **Step 5:** Run `nightlyBackup()` → dated folder, one JSON per table. **Step 6:** Commit `feat(gas): ebook serving and nightly backup`.

### Task 11: UI design on Superdesign (owner review gate)

**Files:** Create `design/README.md` (canvas URL, draft IDs, chosen direction per screen), `design/*.png` (exported references).

- [ ] **Step 1:** Superdesign preflight + login (owner); `superdesign init` on this repo (Preact/Tailwind theme from `tailwind.config.js`).
- [ ] **Step 2:** Create project "HDM BOOSTER" and drafts at 375px for: Daftar, Log Masuk, Utama (countdown + shortcut cards), Onboarding (step form), Library ebook (open/locked cards), Pembaca, TDEE, Group, Akaun + Kod, Admin Ringkasan, Admin Pembelian. Brief: MD asal §11 colours/fonts, BM copy, health note footer, locked-item pattern (mangga + "Tersedia dalam Pakej Complete" + Naik taraf).
- [ ] **Step 3:** Owner picks/iterates on canvas; record chosen draft per screen in `design/README.md`; export PNGs.
- [ ] **Step 4:** Commit `docs(design): approved UI references`.

Tasks 12–16 implement screens to match `design/` references.

### Task 12: App shell, Firebase auth, register, home, help

**Files:** Create `src/lib/{config,firebase,api,gas,errors}.ts`, `src/state/session.ts`, `src/router.ts`, `src/ui/{Layout,TabBar,Card,Button,Field,LockBadge,Toast,Empty}.tsx`, `src/pages/auth/{Login,Register,Forgot}.tsx`, `src/pages/{Home,Help}.tsx`; modify `src/app.tsx`, `.env.example`; add dep `firebase`.

**Interfaces — Produces:**
- `config`: `window.HDM_CONFIG ?? import.meta.env` → `{firebase:{apiKey,authDomain,projectId}, apiUrl, gasUrl}`.
- `api<T>(method, path, body?): Promise<T>` — attaches `await auth.currentUser?.getIdToken()`, 20 s timeout, throws `ApiError(reason, message)`; on 401 forces one token refresh then retries once.
- `gas<T>(action, payload)` — `POST text/plain`, 30 s timeout.
- `errors.bm(e): string` — reasons → BM (`tiada_pembelian`, `sudah_didaftar`, `terlalu_banyak_cubaan`, Firebase `auth/invalid-credential` → "Emel atau kata laluan salah.", network → "Tiada sambungan internet. Cuba lagi sebentar.").
- `session` store: `{user, profile, roles, entitlements:Set<string>, batch, catalog, reading}`; `refresh()` = `GET /api/me`. Firebase `browserLocalPersistence`.
- Routes: `#/`, `#/masuk`, `#/daftar`, `#/lupa`, `#/onboarding`, `#/ebook`, `#/ebook/:id`, `#/tdee`, `#/group`, `#/akaun`, `#/akaun/kod`, `#/aktif`, `#/bantuan`, `#/admin/*`; `#/rekod`, `#/cabaran` → "Dibuka 10/12/2026". Guards: no user → `#/masuk`; `onboarded_at` null → `#/onboarding`; `#/admin/*` needs staff role.
- Register: form → `POST /api/register` → `signInWithEmailAndPassword` → `refresh()` → `#/onboarding`. PDPA checkbox required (notice mentions Firebase/Cloudflare process data outside Malaysia). Forgot: `sendPasswordResetEmail`.
- Home: greeting, batch name, "Program bermula dalam N hari" (`daysUntil`), shortcut cards, health note footer. Help: FAQ + "Tambah ke Skrin Utama" Android/iPhone + WhatsApp.

- [ ] **Step 1:** Implement. **Step 2: Browser verification** (preview, 375×812 + desktop) against dev Worker/Firebase: register seeded purchase typing `012-345 6789` and uppercase email → onboarding; logout/login; wrong password BM message; reset email arrives; reload keeps session; `document.documentElement.scrollWidth <= innerWidth`; console clean. **Step 3:** Commit `feat(app): shell, firebase auth, register, home, help`.

### Task 13: Onboarding & TDEE

**Files:** Create `src/pages/Onboarding.tsx`, `src/pages/Tdee.tsx`.

- Onboarding: fields per Task 5 columns; protein target prefilled `round(1.8 × weight)` editable; health note verbatim + required checkbox → `PUT /api/me/onboarding`.
- TDEE (needs `tdee`, else lock card): prefilled from profile; 5 activity levels with BM descriptions; BMR, TDEE, 3 deficit cards, protein range, macros (`calcTdee`); "Guna sebagai sasaran saya" → `PUT /api/me/targets`; note "Anggaran sahaja, bukan nasihat perubatan."

- [ ] **Step 1:** Implement. **Step 2: Browser verification:** 80 kg → protein 144 prefilled; TDEE L/30/175/80/level 3 shows 2711 kcal; save → `GET /api/me` reflects targets; user without `tdee` sees lock. **Step 3:** Commit `feat(app): onboarding and TDEE`.

### Task 14: Ebook library & watermarked reader

**Files:** Create `src/pages/ebooks/{Library,Reader}.tsx`, `src/lib/ebookCache.ts`; modify `vite.config.ts` (pdf.js worker).

**Interfaces:** `loadEbook(id, updatedAt, getTicket: () => Promise<string>, onProgress): Promise<ArrayBuffer>` — IndexedDB cache key `${id}:${updatedAt}` (falls back to network if IndexedDB throws); fetches a fresh ticket if a chunk call reports expiry.
- Library: cards (cover, 01–07, title, description, "Dikemas kini DD/MM/YYYY", Terbuka/Berkunci); locked → `LockBadge` + Naik taraf → `waLink(support_wa, wa_upgrade_text)`.
- Reader: pdf.js canvas per page (lazy), watermark `${full_name} · ${phone}` diagonal repeated at ~0.12 opacity drawn into the canvas; `PUT /api/ebook/:id/progress` debounced; "Tandakan selesai dibaca"; download only if `allowDownload`; no context menu on canvas.

- [ ] **Step 1:** Implement. **Step 2: Browser verification:** real ~10 MB PDF in dev Drive, `file_drive_id` set via Admin content; complete user opens it with progress bar and watermark; reopen loads from cache and resumes page; basic user: ebook 02 locked, direct `#/ebook/<02>` shows lock and network shows ticket 403. **Step 3:** Commit `feat(app): ebook library and reader`.

### Task 15: Groups, account, code redemption

**Files:** Create `src/pages/Groups.tsx`, `src/pages/account/{Account,Codes}.tsx`, `src/pages/Aktif.tsx`.

- Groups: `GET /api/groups`; "Sertai Group" opens `invite_url`; locked → lock + Naik taraf.
- Account: name editable (`PUT /api/me/name`); email/phone read-only "hubungi admin untuk tukar"; change password (Firebase `updatePassword` after re-auth); purchases & codes (`GET /api/me/access`); entitlements; logout; "Minta padam data" WhatsApp (PDPA).
- Codes (`#/akaun/kod`; `#/aktif` logged-in; logged-out `#/aktif` → `#/masuk` note "Ada kod? Log masuk dahulu"): `POST /api/codes/redeem` → new items; BM per reason.

- [ ] **Step 1:** Implement. **Step 2: Browser verification:** basic user redeems `upgrade_a_b` → ebook 02 unlocks after `refresh()` without re-login; reuse → "Kod ini telah digunakan"; MUSCLE MANIA group unlocked. **Step 3:** Commit `feat(app): groups, account, codes`.

### Task 16: Admin menu

**Files:** Create `src/pages/admin/{AdminHome,Purchases,BclMap,Codes,Participants,Content,Exports,Audit}.tsx`.

- AdminHome: `summary` tiles, recent webhook errors, email queue pending/failed, HornetHive usage (or dashboard link per Task 1 notes).
- Purchases: search/filters, "Perlu semakan" tab, actions, reprocess, resend welcome, WhatsApp (`wa_template_purchase`) for `belum_dituntut`.
- BclMap CRUD. Codes: bulk generate → CSV (`kod, pakej, batch`) via `toCsv`; single for buyer → "Hantar via WhatsApp" (`wa_template_code`); list/filter; actions.
- Participants: list/search; detail (profile, entitlements, purchases, codes); reset password (shows temp password once); grant/revoke; WhatsApp.
- Content: batches & phases, ebooks (title, description, cover URL, Drive file ID, allow download, mark updated), groups (invite URLs per batch), packages & items, templates.
- Exports: participants, purchases, codes CSV. Audit: newest first.
- Coach sees AdminHome + Participants (read-only) only.

- [ ] **Step 1:** Implement. **Step 2: Browser verification** as superadmin: generate 3 codes → CSV 3 rows; cancel one → its redeemer loses items on refresh; map a form; reprocess an order; reset a test user's password and log in with it. As coach: Codes/Content routes hidden and direct API calls 403. **Step 3:** Commit `feat(app): admin menu`.

### Task 17: Blogspot delivery, deploy, README, launch checklist

**Files:** Create `blogspot/template.xml`, `scripts/deploy.mjs`, `scripts/loadtest.mjs`, `README.md`.

- `template.xml`: minimal valid Blogger theme (`b:skin`, one hidden `b:section`), no navbar/widgets; `<div id="app">`; Google Fonts, Phosphor CSS, jsDelivr `gh/<owner>/hdm-booster@<tag>/dist/app.css|app.js` (`type="module"`); inline `window.HDM_CONFIG` (public values only).
- `deploy.mjs`: `npm test` → `npm run build` → commit `dist/` → tag `vYYYYMMDD-N` → push → `wrangler deploy --env prod` (optional flag) → prints the tag and the one line to change in the template.
- `loadtest.mjs`: 200 concurrent `GET /api/me` + `POST /api/register` (bad data) against **dev** Worker → report error count and p95.
- README (BM): HornetHive (DBs, keys, `npm run migrate -- --env prod --seed`), Firebase (Email/Password, authorised domain, BM email templates, sign-up restriction if available), Cloudflare (`wrangler secret put …`, deploy), Apps Script (clasp, properties, `installTriggers()`, Web App deploy), BCL webhook URL `…/exec?src=bcl&k=<key>`, form mapping, Blogspot template, first superadmin (`insert into user_roles`), issuing a manual code, starting next year's batch, upgrading HornetHive plan.

- [ ] **Step 1:** Implement. **Step 2:** Deploy to test Blogspot; real phone full flow from Blogspot URL.
- [ ] **Step 3: Launch checklist on prod (owner present):** Pakej A refused ebooks 02–07 and MUSCLE MANIA via UI **and** direct Worker calls; Pakej B all 12; code reuse refused; cancelled code removes access immediately; `upgrade_a_b` on A account opens B items; real BCL order (test + live) → purchase → email → register → ebook opens; load test 0 errors, p95 < 2 s; 375px + desktop no horizontal scroll on every page; `npm run test:worker` security suite green against prod-like dev; backup trigger present; no HornetHive key in `dist/` (`grep`).
- [ ] **Step 4:** Commit `chore: blogspot delivery, deploy script, README`.

---

## Parallelism
After Task 6: Task 9 (Apps Script) and Task 11 (design, owner-paced) can run alongside Tasks 7–8. Tasks 12–16 need Tasks 7–8 deployed to dev and Task 11 approved.

## Deferred to later plans
Peringkat 2 (before 10/12): dashboard, daily tracker + offline queue, Cabaran #1, announcements, reminder emails, coach progress views. Peringkat 3: photos (ticket pattern), Cabaran #2/#3, Ramadan tracker, Graduation Report & certificates, `/api/sijil/:no`. Two-device session limit dropped (spec §12.7).
