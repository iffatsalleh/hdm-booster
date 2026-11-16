# Peringkat 1 — build ledger (rulings, deferred minors, parked findings)

Copied from the subagent-driven-development ledger on 16/11/2026 when the workspace was removed. Lines marked `Ruling:` are decisions made on the owner's behalf; `minor (deferred)` and `Parked` lines are known follow-ups.

# SDD ledger — plan: docs/superpowers/plans/2026-11-13-hdm-booster-peringkat-1.md
Spec: docs/superpowers/specs/2026-11-13-hdm-booster-design.md (reachable)
Branch: peringkat-1 (base 68d2bf5 on main), in place (no worktree; owner chose subagent-driven, branch isolates main)

## Pre-flight scan
| Pair / Task | Produces vs consumes | Finding |
|---|---|---|
| T1 vs T2–T5 | migrate runner + splitSql → migrations | consistent |
| T1 scripts/hive.mjs vs T6 worker/src/hive.ts | two HornetHive clients (Node script vs Worker) | duplication by runtime; same endpoint from docs/hornethive-notes.md |
| T2 entitlements_for vs T3/T4 | extended by create or replace | consistent |
| T3 rate_* vs T7/T8 | rate_blocked/rate_record kinds redeem/register | consistent |
| T4 redeem_code(p_uid,p_code) vs T7 | Worker normalises code via src/lib/codes.ts | Worker imports from ../src/lib (cross-dir import) |
| T5 app_bootstrap/my_groups/ebook_for_ticket vs T7 | consistent |
| T5 admin_* vs T8 | consistent (admin_codes, admin_audit defined in T5) |
| T6 hmac vs T9 Hmac.gs vs T10 tickets | identical algorithms, cross-checked in tests/gas/hmac.test.ts | consistent |
| T7 ticket carries fileId vs T10 | consistent |
| T8 reprocess → GAS doPost src:'worker' vs T9 Router | consistent |
| T11 design vs T12–T16 | references in design/ | consistent |
| T1 self | Step 5 probe needs HornetHive dev keys (not yet created by owner) | BLOCKER for probe only |
| T2–T5 self | need hdm_dev + .env.test | BLOCKED until owner prerequisites |
| T6 self | foundation tests need a Hive — use in-memory fake in foundation.test; deploy step needs wrangler login | deploy deferred |
| T7–T8 self | tests vs hdm_dev | BLOCKED until DB |
| T9 self | Steps 1–4 pure; Steps 5–6 need clasp login + BCL | partial |
| T10–T17 self | need deployed services / owner | BLOCKED |

Ruling: execute order T1 (steps 1–4 + runner code; probe deferred) → T6 (code + tests with fake Hive/verifier; deploy deferred) → T9 (steps 1–4 pure logic + GAS files; clasp/manual deferred) → stop for owner credentials — the rest needs accounts the agent may not create — cost if wrong: none, order only.
Ruling: worker may import pure helpers from ../src/lib (codes.ts, phone.ts) — one source of truth — cost if wrong: copy two files.
Ruling: package.json scripts: test:db (vitest.db.config.ts, T2), test:worker (vitest.worker.config.ts, T6); `npm test` keeps unit + gas only — cost if wrong: script rename.

## Progress
Task 1: dispatched (base 68d2bf5, implementer sonnet; Step 5 probe deferred — no HornetHive keys)
Task 1: endpoint used: POST {base}/rest/{dbId}/query, Bearer key, body {query, params}, resp {columns, rows}; no quota endpoint documented
Task 1: minor (deferred): splitSql no E'' strings; comment-only trailing fragment emitted; thin edge tests; parseEnv untested
Task 1: minor (carry to T2–T5): migrations not atomic → write idempotent DDL (if not exists / create or replace); seed re-runs → on conflict do nothing
Task 1: minor (deferred): hive.mjs treats 200 with error body as success; stray blank line package.json
Task 1: complete (commits 68d2bf5..87307ef, review clean) — Step 5 probe still pending owner keys
Task 6: dispatched (base 87307ef, implementer sonnet; deploy deferred, fake hive/verifier in tests)
Task 6: implementer DONE_WITH_CONCERNS (dad765a): Deps.allowedOrigins added; npm blocked esbuild/workerd postinstall (wrangler dev/deploy may need `npm install-scripts approve`); wrangler.toml REPLACE_* placeholders; header named X-Signature (plan says X-HDM-Sig); smoke routes /api/me,/api/admin/ping,/internal/ping. Review dispatched (opus).
Task 6: review Needs fixes — Important: (1) header X-Signature ≠ plan X-HDM-Sig; (2) ticket uses iat+hex MAC ≠ plan exp(now+300)+base64url MAC. Security core judged sound (no bypass).
Ruling: findings 1–2 follow the plan (Global Constraints) — Apps Script tasks are written against the plan — cost if wrong: none.
Ruling (owner, 13/11): single environment prod only. wrangler.toml one env (worker name hdm-api); `.env.test.example` → `.env.prod.example`; scripts/tests read `.env.prod`; DB/worker integration tests run on prod pre-launch only with test_ uids — carried into Task 6 fix round 1 — cost if wrong: re-add an env.
Task 6: minor (deferred): BM messages tiada_kebenaran/tiada lack "what to do next"; internal HMAC failure reuses perlu_log_masuk (want tandatangan_tidak_sah); untested t−301, CORS on error/404, hive throw→500; comment should say lowercase hex; caret ranges hono/jose/wrangler; npm install-scripts approval needed for wrangler deploy; smoke routes /internal/ping,/api/admin/ping to remove or keep intentionally; ⚠️ verify HornetHive text[] serialisation (roles_for) in probe.
Task 6: fix round 1 implemented (d0b0b71, also carries controller spec/plan single-env edits); scoped re-review dispatched (sonnet)
Task 6: fix round 1/5 (2 addressed, 0 open — X-HDM-Sig, exp/base64url tickets; commits dad765a..d0b0b71)
Task 6: minor (deferred): ALLOWED_ORIGINS includes http://localhost:5173 in the only (prod) Worker — remove at Task 17 launch checklist
Task 6: complete (commits 87307ef..d0b0b71, review clean after 1 fix round) — deploy (Step 5) still pending Cloudflare login
Task 9: dispatched (base d0b0b71, implementer sonnet; Steps 1–4,7 only; clasp/BCL live steps deferred)
Task 9: implementer DONE (3861446), 60/60 tests. Concerns are contract choices:
Ruling: Worker→GAS calls carry the signature in the body `{src:'worker', t, sig, payload:'<json string>'}`, sig = signHmac(INTERNAL_SECRET, t, payload) — Apps Script doPost cannot read request headers — carry into Task 8 — cost if wrong: small change both sides.
Ruling: the /internal/* request/response shapes as implemented in apps-script/Worker.gs.js + Bcl.gs.js (see task-9-report.md) are the contract Task 8 must implement — cost if wrong: adjust GAS files.
Task 9: review Needs fixes — Important: (1) unmapped orders re-processed every poll; (2) missing formable_id falls through to amount-only across all forms; (3) email queue: unchecked status write, unlocked trigger run → duplicates, status-call throw aborts loop.
Ruling (finding 1): /internal/known-orders returns refs present in purchases OR logged in bcl_webhook_log with kind 'ignored' — GAS stays stateless — Task 8 contract — cost if wrong: add a GAS cache.
Ruling (finding 3): trigger entry `processEmailQueueTrigger()` takes the script lock and calls an unlocked inner `processEmailQueue_()`; processOrder (already locked) calls the inner one — cost if wrong: small refactor.
Task 9: minor (deferred): webhook key compare not constant-time (use _safeEqual); reprocessOrder/pollBcl top-level errors not logged to bcl-log; amount tolerance inclusive + first-match not closest, no RM3.00/3.01 boundary tests; invalid BCL_FIELD_MAP silently defaults; Mail payload may arrive as JSON string; garbled Router comment; BOM in Hmac.gs.js/BclLogic.gs.js + clasp fileExtension check.
Task 9: fix round 1 implemented (5cb962f); unpaid orders now logged kind 'skipped' (Task 8: only 'ignored' counts as known); re-review dispatched (sonnet)
Task 9: fix round 1/5 (3 addressed, 0 open — ignored orders known via Worker, formable_id required, locked email queue; commits 3861446..5cb962f)
Task 9: minor (deferred → Task 8): /internal/bcl-log must accept both `kind` and `status` keys; known-orders counts only kind 'ignored' (not 'skipped'); ignored orders never auto-retried → Admin "Proses semula order" is the recovery path (README must say so).
Task 9: complete (commits d0b0b71..5cb962f, review clean after 1 fix round) — Steps 5–6 (clasp push, live BCL) pending owner accounts
PAUSED: remaining tasks need owner accounts (HornetHive keys in .env.prod for T1 probe/T2–T5/T7–T8; Cloudflare login for deploy; Google/clasp + BCL for T9–T10 live; Superdesign login for T11). Resume at Task 1 Step 5 probe once .env.prod is filled.
RESUMED 13/11: owner created hdm_prod (Free plan) and got a direct pooled connection string (HIVE_PG_URL in .env.prod). Controller probe passed: PG 18.6, owner role, pgcrypto, plpgsql, security definer, triggers, transactions all OK (docs/hornethive-notes.md). API keys not yet found by owner.
Ruling: migrations run over HIVE_PG_URL with `pg` (one transaction per file, no statement splitting needed); ddl API key dropped. splitSql stays as a tested utility. The Worker still uses REST /query with the dml key; Apps Script backup uses the read key. DB tests (tests/db) also connect over HIVE_PG_URL — owner role, cleaner than REST — and need no API key. Cost if wrong: switch the migrate transport back to /query.
Task 2: dispatched (base 88079a2, implementer sonnet; migrate switched to pg over HIVE_PG_URL; tests on empty prod with test_ uids)
Task 2: implementer DONE (4a7a0be); migration+seed applied to hdm_prod. Item kinds/names chosen per MD asal §4 table; upgrade_a_b RM50 matches MD asal §5.4 — accepted.
Task 2: note (carry to T3–T5): tests/db/helpers.ts USER_TABLES is explicit — each later task adds its user-data tables.
Task 2: minor (deferred): no @types/pg (tsc over tests/ may fail); .env.prod.example lacks HIVE_PG_URL=; seed derives complete/upgrade_a_b from items table (prefer explicit lists); entitlements_for ignores items.active; migrate has no advisory lock / rollback test; sort relies on collation.
Task 2: complete (commits 88079a2..4a7a0be, review clean)
Task 3: dispatched (base 4a7a0be, implementer sonnet)
Task 3: implementer DONE (65afb0d), 27 db tests; concerns: rate_attempts never pruned (later job); FK purchases.batch_id; unknown package → perlu_semakan 'Pakej tidak dikenali'. Review dispatched (opus).
Task 3: review Approved (opus), no Critical/Important.
Task 3: minor (deferred): same-uid re-complete with different email → misleading sudah_didaftar; profile phone not updated on re-complete; bad paid_at/amount casts raise instead of perlu_semakan; normalize_email btrim spaces only; weak email-normalisation assertion; rate_attempts never pruned.
Ruling (Task 3 minor #1 race: purchase upserted during an uncommitted register_complete stays belum_dituntut): Task 5's app_bootstrap(p_uid) first re-claims belum_dituntut purchases matching the profile's email AND phone — cheap self-heal on every app load — carry into Task 5 — cost if wrong: an admin list instead.
Carry to Task 7/8: Worker must drop null subjects before rate_record/rate_blocked (subject not null); register_complete gets the email of the Firebase account the Worker created, never a body email for another uid; check-purchase/register rate-limited by IP.
Task 3: complete (commits 4a7a0be..65afb0d, review clean)
Task 4: dispatched (base 65afb0d, implementer sonnet)
Task 4: implementer DONE (0c7a8c7), db 42/42; extra error codes pakej_tidak_wujud, tindakan_tidak_sah, kod_tidak_wujud, item_tidak_sah, kod_belum_digunakan; redeem audits code.redeem. Review dispatched (sonnet).
Task 4: minor (deferred): `extend` with missing access_ends_at clears expiry (should require key); release revives dibatalkan codes (undocumented); reactivate on aktif unclear; collision-retry untested; set_entitlements allows [].
Task 4: complete (commits 65afb0d..0c7a8c7, review clean)
Task 5: dispatched (base 0c7a8c7, implementer sonnet; carries app_bootstrap self-heal ruling)
Task 5: implementer DONE (d28077b), db 74/74. Incident: aborted RED run leaked test_ items, then seed polluted 'complete' (14) — implementer cleaned. Controller read-only check 14/11: items 12 (0 test), basic 5 / complete 12 / upgrade_a_b 7, 0 profiles/purchases/codes, 7 ebooks, 2 groups, migrations 0001–0005. Note: pooled connection can take >15 s to connect (cold) — use connectionTimeoutMillis ≥ 45 s.
HornetHive REST docs re-read 14/11 (docs/hornethive-notes.md): jsonb returned as JSON string, arrays as Postgres text '{a,b}', numeric as string; dml key = role owning nothing; read key acts as owner; /query caching unstated.
Ruling: Worker queries always select ONE jsonb column and hive client parses string jsonb; Task 7 dispatch fixes Task 6's requireUser query (`select jsonb_build_object('roles', to_jsonb(roles_for($1)), 'has_profile', exists(select 1 from profiles where id=$1)) as r`) and hive.ts gains `json<T>(sql, params)` — cost if wrong: small client change.
Ruling: once the dml key exists, probe (a) dml key can EXECUTE our functions and touch tables created over the direct connection, (b) /query not cached. If (a) fails → migration 0006 makes Worker-called functions SECURITY DEFINER with `set search_path = public, pg_temp` — cost: one migration.
Task 5: review Needs fixes (opus) — Important: seed builds complete/upgrade_a_b from all items while tests insert transient items into prod → pollution copies into purchases/codes entitlements. Security boundary otherwise solid.
Task 5: minor (deferred): uuid cast in DECLARE before admin_guard; restore not limited to dibatalkan (perlu_semakan→belum_dituntut skips review); NaN/Infinity accepted for waist/target weight; self-heal writes no audit row; expired aktif codes counted for batch but not groups; save_reading not gated; phone search format; content afterAll single chain; seed overwrites ebook title/group text.
Task 5: fix round 1/5 (1 addressed + cleanup hardening, 0 open — explicit package lists, try/catch afterAll; commits d28077b..2375570). Prod verified basic 5 / complete 12 / upgrade 7, 0 test items.
Task 5: minor (deferred): one unexplained test:db failure on a cold 43 s run (rerun 74/74) — possible flake, watch; seed temp table needs single-transaction runner; manual_grants cleanup unverified.
Task 5: complete (commits 0c7a8c7..2375570, review clean after 1 fix round)
Ruling: Worker DB-backed tests use a test-only pg Hive adapter (tests/worker/pgHive.ts over HIVE_PG_URL) because API keys don't exist yet; REST-specific behaviour (serialisation, dml privileges, caching) verified by a smoke probe once the dml key exists — cost if wrong: re-run suite against REST.
Task 7: dispatched (base 2375570, implementer opus — security boundary, multi-file; carries jsonb-only query rule + requireUser fix)
Task 7: implementer DONE (8d59cd8): worker 77/77, db 74/74 (one 21 s network timeout flake on first run). Carry to Task 8: extend ADMIN_ROUTES/ROUTES tables in tests/worker/security.test.ts; /api/admin/* guard is superadmin-only — Task 8 must deliberately allow coach on summary/participants routes. Review dispatched (opus).
Task 7: review Approved (opus), no Critical/Important.
Task 7: minor (deferred): ticket uid test should decode ticket; participant 404 tiada_fail check skippable; redeem = 4 HornetHive calls (optional DB wrapper); null r → 500 TypeError; locked-ebook message fixed text even for non-Complete items; test 'Test Ebook' briefly visible in prod catalog during runs.
Ruling: carry into Task 8 — Hono bodyLimit 16 KB on /api/* and /internal/*; security test auto-asserts every /api route (from app.routes) is in ROUTES/ADMIN_ROUTES/explicit public list — Task 8 adds public + admin routes, so it owns the coverage check — cost: small.
Task 7: complete (commits 2375570..8d59cd8, review clean)
Task 8: dispatched (base 0de31a6, implementer opus; GAS contract wins; coach allowed on 3 admin GETs; bodyLimit + route-coverage test; real Firebase smoke deferred)
Task 8: implementer DONE (635b0e4), worker 192/192. GAS-overrides: reprocess payload {action:'reprocess', order_ref}; /internal/purchase maps name/amount → buyer_name/amount_rm; bcl-config rows carry `amount`.
Ruling (correctness concern, pre-review): GAS never sends paid_at → late/polled orders judged by receipt time may fall outside the sales window. Fix: Bcl.gs.js sends `paid_at` from the BCL txn (configurable path in BCL_FIELD_MAP, ISO); Worker uses a valid body paid_at else receipt time. Also /internal/* bodyLimit 256 KB (full BCL txn in raw/payload); /api/* stays 16 KB — cost: small.
Task 8: pre-review fix done (7ba38b2): paidAtFromTxn (paid_at → payment_date → updated_at, overridable), internal 256 KB; gas 38/38, npm test 67/67, worker 194/194. Verify at first live order: paid_at field names, tz-less timestamps = +08:00. Review dispatched (opus).
Task 8: review Needs fixes (opus) — Important: concurrent register (double submit) can delete an in-progress account as "orphan" → profile points at deleted Firebase uid, buyer locked out. Fix: orphan only if Firebase createdAt older than 10 min grace, else sudah_didaftar-style retry message; test.
Task 8: minor (deferred): rate limit check-then-record TOCTOU (register + redeem); reset-password setPassword before audit + USER_NOT_FOUND → 500; reprocess transport failure not audited; some BM messages lack next step (terlalu_besar, Emel tidak sah, *_tidak_wujud, >128 char password message); failed emails never retried (resend-welcome only); HMAC doesn't bind method/path (plan-mandated, low risk); paid_at fallback updated_at may drift; test name overclaims coach HEAD.
Task 8: fix round 1/5 (1 addressed, 0 open — orphan 10-min grace + sedang_didaftar; commits 7ba38b2..d560555)
Task 8: minor (deferred): null createdAt orphan never cleaned; real orphan <10 min waits; cosmetic formatting slips in register.test.ts/errors.ts/public.ts.
Task 8: complete (commits 0de31a6..d560555, review clean after 1 fix round) — real Firebase smoke + deploy pending owner accounts
Task 10: dispatched (base d560555, implementer sonnet; in-editor steps deferred, Node tests for pure parts; backup via REST read key to_jsonb)
Task 10: implementer DONE_WITH_CONCERNS (f531dce), npm test 85/85; added Backup.gs.js; concerns observational (runtime unrun, /query row shape, blob per call memory ~50 MB). Review dispatched (sonnet).
Task 10: review Needs fixes — Important: (1) readChunk loads whole Drive file per chunk call (memory/time); (2) retention purges old backups even when the run failed; (3) no 6-min time-budget guard → silent kill.
Ruling (1): Drive v3 `files/{id}?alt=media` via UrlFetchApp with `Authorization: Bearer ScriptApp.getOAuthToken()` and `Range: bytes=start-end`; stat via DriveApp getSize/getLastUpdated or Drive v3 metadata — cost if wrong: switch back with a size cap.
Task 10: fix round 1/5 (3 addressed, 0 open — ranged Drive reads, retention only on full success, 5-min budget; commits f531dce..1b98849)
Task 10: complete (commits d560555..1b98849, review clean after 1 fix round) — in-editor runs pending Google account
RESUMED 14/11 (owner: "jangan tersangkut di dml & read api key", finish all code, check all logic, then step-by-step guides):
Ruling (Task 11 replaced): Superdesign dropped by owner — UI references are hand-written static mockups in design/mockups/*.html + hdm.css (commit f596f21), colours/fonts from https://mestijadi.bcl.my/form/hdmbooster. Tasks 12–16 implement to match them.
Ruling (data path, Task 6b): Worker talks to Postgres via Cloudflare Hyperdrive (Free: 100k queries/day, ~20 origin conns) over the pooled HornetHive string (port 6432, PgBouncer transaction mode, sslmode=require), using `pg` ≥ 8.16.3 with a new Client per request, caching DISABLED (--caching-disabled). Hive interface unchanged (json<T> one jsonb column). REST /query client kept as fallback selected when no HYPERDRIVE binding (if HornetHive restricts direct on Free → dml key or Pro). Docs say direct connection = Pro only though Free DB got a working string — owner must be told. Cost if wrong: switch env to REST.
Ruling (backup): Apps Script nightlyBackup pulls pages from Worker `POST /internal/export {table, offset, limit}` (HMAC, fixed table whitelist, to_jsonb rows) — no read key. Cost: small.
Task 6b: implementer DONE (dca9daf): hivePg.ts, REST fallback, /internal/export, GAS backup via Worker; npm test 90/90, worker 210/210, wrangler dry-run 432 KiB. Review dispatched (opus).
Task 6b: review Approved (opus), no Critical/Important.
Task 6b: minor (deferred → fold into Task 17): pg Client has no 'error' listener (add c.on('error')); wrangler dev needs localConnectionString once [[hyperdrive]] exists (document); OFFSET paging can skip/dup rows on random-uuid tables during backup; Hyperdrive+PgBouncer needs post-deploy smoke (ping, export, one write); backup time budget only between tables.
Task 6b: complete (commits f596f21..dca9daf, review clean)
Ruling (frontend styling): the app reuses the mockup stylesheet — copy design/mockups/hdm.css to src/ui/hdm.css and use its classes in Preact components (exact visual match, no re-translation to Tailwind); Tailwind kept only for small utilities — cost if wrong: refactor CSS later.
Ruling (frontend verification without accounts): `src/lib/api.ts` + `firebase.ts` support a dev-only mock mode (`VITE_MOCK=1`, fixtures in src/mock/) so screens can be verified in the browser now; mock code must be excluded from the production bundle (guarded by import.meta.env.VITE_MOCK, verified by grepping dist). Real Firebase/Worker smoke happens after owner setup.
Task 12: dispatched (base dca9daf, implementer opus)
Task 12: implementer DONE (bf53126) + pre-review fixes (c67e880): tsc clean (lib ES2022), public routes not onboarding-gated, single daysLeft(), neutral login pill. npm test 134, worker 210. Mock server launch config "hdm-mock" :5174/app.html. Review dispatched (opus).
Ruling: Tasks 13 + 15 batched into one dispatch (both small form/list pages sharing router + api client) — Task 14 (pdf reader) next on its own; implementers run sequentially (shared router file) — cost: larger review.
Task 13+15: dispatched (base c67e880, implementer opus)
Task 12: review Needs fixes (opus) — Important: no Admin tab for staff in TabBar (global constraint).
Ruling (Task 12 minor #1): staff (superadmin/coach) are exempt from the onboarding redirect for #/admin/* (staff may not be participants); participant routes still require onboarding.
Ruling: Task 12 fix round 1 waits until Task 13+15 implementer finishes (both touch router.ts/TabBar) — then resume Task 12 implementer with: Admin tab + staff onboarding exemption + Minor #2 (switch to Minggu when countdown done, 1 s clock).
Task 13+15: implementer DONE (d35ad03), npm test 155, tsc clean, mock checks OK. Review dispatched (opus). Task 12 fix round 1 dispatched to original implementer (after d35ad03).
Task 13+15: review Approved (opus), no Critical/Important.
Task 13+15: minor (deferred): TDEE save overwrites custom protein with 1.8 g/kg; misleading TDEE hint text; editing onboarding resets onboarded_at + start weight (Peringkat 2 must add update RPC keeping start data); next=aktif lost for non-onboarded; onboarding validation message mismatches (age out of range, body fat wording); Codes dmy() can throw on bad ts; "Kod ini telah digunakan." lacks next step; refresh() failure shows full-screen error; untested coachInitials/dmy.
Task 13+15: complete (commits c67e880..d35ad03, review clean)
Task 12: fix round 1/5 implemented (bc5e69a): Admin tab via tabsFor(), staff onboarding exemption, heroMode switch; npm test 163. Re-review dispatched (sonnet).
Task 12: fix round 1/5 (1 addressed + 2 rulings, 0 open — admin tab, staff exemption, countdown switch; commits d35ad03..bc5e69a)
Task 12: complete (commits dca9daf..bc5e69a incl. Task 13+15 interleave, review clean after 1 fix round)
Task 14: dispatched (base bc5e69a, implementer opus)
Task 14: implementer DONE (205940a), npm test 188; app.js 221 kB / 57 kB gz.
Ruling: accept pdf.js from jsDelivr at exact version 4.10.38 (legacy build) instead of bundling (app.js 632→221 kB) — Blogspot template must allow it; cost if wrong: one-line revert in src/lib/pdf.ts.
Task 14: review Approved (opus), no Critical/Important.
Task 14: minor (deferred → MUST fix in final fix wave per reviewer): (1) Reader leaks pdf.js doc when leaving during open (destroy if !live); (2) only InvalidPDFException clears cache → forgetEbook on any openPdf failure. Others: 2× memory peak + no chunks sanity check; IndexedDB connections not closed; !octx leaves page state; flush PUT without keepalive; revoked mid-download shows error not lock; sequential getPage for sizes; pdf.js from CDN without SRI / future CSP must allow jsdelivr + blob workers; unwatermarked PDF in IndexedDB (deterrent, not DRM).
Task 14: complete (commits bc5e69a..205940a, review clean)
Task 16: implementer DONE (3618084), npm test 212. Gaps reported: no API for webhook errors/email queue, no squatter flag, list endpoints capped 200.
Ruling: gaps are spec requirements → same implementer adds migration 0006 (admin_summary webhook_errors (staff-only rows) + email_queue counts; admin_purchases squatter_suspect; offset paging + total on purchases/participants/codes), Worker offset passthrough, frontend cards/badge/full exports — before review. Cost: one more migration.
Task 16: gap closure DONE (ba3c617): migration 0006 applied to prod; npm test 216, db 77, worker 212. Review dispatched (opus) on 205940a..ba3c617.
Task 16: review Needs fixes (opus) — Important: CSV formula injection in exports (csv.ts cell()). Fix round 1 sent to implementer.
Task 16: minor (deferred): "Perlu semakan (n)" capped at 200 (use listTotal); offset paging skip/dup during export; squatter exists() no functional index; purchase assign / code transfer lack confirm; WhatsApp button shown when buyer_phone empty; redeemed_by name map from first 200 only; coach sees aggregate code/purchase counts; squatter badge wording may hit real buyer.
Task 16: fix round 1/5 (1 addressed, 0 open — CSV formula escaping; commit 93f7822)
Task 16: minor (deferred → final fix wave): literal invisible BOM in src/lib/csv.ts:11 and new tests — revert to '﻿' escape.
Task 16: complete (commits 205940a..93f7822, review clean after 1 fix round)
Task 17: implementer DONE (b6d066a): npm test 237, worker 213, live wrangler dev + Hyperdrive-local → real DB smoke 5/5 (pg via PgBouncer works).
Task 17: review Needs fixes (opus) — Important: deploy.mjs git commit breaks on Windows (shell:true unquoted args). Fix round 1 sent.
Ruling (Task 17 minor #4): keep the documented REST-key fallback (README §10.1, .env.prod.example) as an explicit contingency only — it never becomes the default path — cost if wrong: delete two doc blocks.
Task 17: minor (deferred → final wave): deploy has no dirty-tree guard; README §3.8 check before GAS_URL → expected FAIL note; README §2.2 "(jika pilihan ini ada)"; setup 23505 mapping brittle; --rotate also rotates BCL_WEBHOOK_KEY (mention BCL); script superadmin onboarded_at null (staff exempt for admin; mention); tag sort lexicographic; unverified: hyperdrive create with ?sslmode=require, Blogger theme without navbar.
Task 17: fix round 1/5 (1 addressed, 0 open — spawnPlan, git without shell; commit f795f8e). Task 17: complete (commits ba3c617..f795f8e, review clean after 1 fix round)
FINAL REVIEW (opus, 68d2bf5..f795f8e): With fixes — C1 no recovery for unmatched buyers (ignored orders, reprocess no-op, invalid phone/email, manual buyers); I1 welcome email for perlu_semakan/dituntut; I2 batch never set after insert; I3 global GAS lock serialises webhooks + poll only newest 100; I4 Task 14 Reader leak + cache eviction; I5 security suite not enforced before deploy. Must-fix minors: admin phone search normalisation; README rotate→update BCL webhook; README never run test:db/test:worker after launch + pre-launch test_ row count; csv literal BOM; deploy dirty-tree guard; webhook error card shows skipped/ignored; GAS webhook key constant-time.
Final fix wave: dispatched (base f795f8e, opus, one fixer with complete list)
Final fix wave: DONE (f795f8e..0042323, 8 commits), migration 0007 applied (amended once, re-applied via create or replace); npm test 390 (incl. no-DB security suite), db 99, worker 228; removed 4 stale test_ip_ rate_attempts rows. Pending owner: clasp push + new Web App version; BCL list page= param unverified. Scoped re-review dispatched (opus).
Final re-review: all findings addressed, no new Critical/Important.
Parked — set_buyer correction can be overwritten by a later webhook/reprocess with BCL's well-formed original value — Ruling: real, deferred; owner workflow is "fix buyer then it becomes registrable"; revisit if it bites — cost: one SQL guard.
Parked — reprocessing an old ignored order without BCL paid time uses reprocess time for batch — Ruling: real, deferred; admin can set batch explicitly in dialogs — cost: wrong batch until corrected.
Parked — set_buyer email change leaves pending welcome to old address — Ruling: deferred, harmless duplicate email — cost: one extra email.
Parked — BCL ignoring &page= makes poll re-read page 1 up to 5× — Ruling: bounded + idempotent; verify at first live poll — cost: wasted UrlFetch calls.
Task 17: dispatched (base ba3c617, implementer opus; folds Task 6b deferred minors)
Task 14: review dispatched (opus). Task 16: dispatched (base 205940a, implementer opus; Hyperdrive info card instead of HornetHive usage).
Task 12: minor (deferred): Cuba lagi no loading state; settled() may return stale uid state; timeout excludes body/getIdToken; Rekod no post-start state; group card generic wording.
PAUSED (2): backend tasks 1–10 done except owner-gated live steps. Next = Task 11 (Superdesign, owner login) then 12–16 frontend (need Firebase project + wrangler dev). Owner list: HornetHive dml+read keys; Superdesign login; Firebase hdm-prod + SA JSON; Cloudflare login; Google/clasp login; GitHub repo + Blogspot; BCL token + webhook key.
Task 10: minor (deferred): 3 BM messages lack next step; stat before index validation; base64 per-chunk padding must be documented (frontend decodes each chunk separately); backup email may quote response fragment; create-then-trash ordering; Tests.gs.js comment; slow 5 MB test array; handleAppApi lives in Ebook.gs.js (future actions).
Task 5: escalates Task 2 minor #3 (seed derives complete/upgrade_a_b from items) — real pollution observed; review dispatched (opus).
Task 9: note: BCL list endpoint `/transactions?per_page=100&sort=-id` and envelopes are guesses — verify at live step (Step 6).
