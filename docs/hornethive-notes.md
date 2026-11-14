# HornetHive notes

## API (source: https://hornethive.io/docs/rest-api)
- `POST https://api.hornethive.io/v1/rest/{dbId}/query`, header `Authorization: Bearer <key>`
- Body `{"query": "... $1", "params": [..]}`; success `{"columns": [...], "rows": [...]}`; error `{"error", code?, details?, hint?}`
- Key scopes: `read` (read-only txn), `dml` (rows only), `ddl` (owner-level). 429 on rate limit.
- No usage/quota endpoint documented.

## REST serialisation and permissions (docs re-read 14/11/2026)
- `/query` runs one statement. A `read` key runs it in a read-only transaction.
- Values come back as follows:
  - `jsonb` and `json`: a **JSON string you must parse**
  - arrays: **Postgres text form** such as `{red,blue}`
  - `numeric`: a **string**
  - timestamps: ISO 8601 strings
  - ints, floats and bools: native JSON types
- Whether `/query` rows are objects or arrays aligned to `columns` is not stated. The client handles both.
- The `dml` key runs as "a role that owns nothing". Postgres refuses it CREATE, ALTER, DROP and TRUNCATE. The `read` and `ddl` keys act as the database owner, so a `read` key can read every table.
- Cache: "Lists are cached for 5 minutes and cleared by any write through the API". This applies to `GET /{table}`. Whether `/query` is cached is not stated, so it must be probed. Writes made over the direct Postgres connection do not clear the cache.
- Errors return `{error, code?, details?, hint?}`:

  | Status | Meaning |
  |---|---|
  | 400 | bad request |
  | 401 | missing or wrong key |
  | 403 | wrong scope, or privilege refused |
  | 404 | not found |
  | 409 | conflict |
  | 429 | rate limit or monthly quota |

- `GET /rest/{db}/openapi.json` exists. No health or usage endpoint is documented.
- **Worker rule:** every Worker query selects exactly one `jsonb` column (e.g. `select app_bootstrap($1) as r`, `select jsonb_build_object(...) as r`), and the client `JSON.parse`s it when it is a string. Do not select raw arrays or numerics.

## Direct Postgres connection (Free plan, confirmed 13/11/2026)
- Database `hdm_prod` was created with a pooled connection string `my-pgsql-1.hornethive.io:6432`, `sslmode=require`. It is stored as `HIVE_PG_URL` in `.env.prod`, which is gitignored.
- The connecting user owns the database (`pg_database.datdba = current_user`).
- Multi-statement transactions (`begin … rollback`) work over this connection. Migrations can therefore run one transaction per file, and no ddl API key is needed.

## Platform probe checklist (run 13/11/2026 against `hdm_prod` over the direct connection)
If plpgsql or pgcrypto is refused, stop and report (design 3.3 fallback: logic moves to Worker).

- [x] `select version()` : PostgreSQL 18.6 (x86_64-pc-linux-musl)
- [x] `create extension if not exists pgcrypto` : OK (available: pgcrypto, plpgsql, uuid-ossp)
- [x] `select gen_random_uuid(), gen_random_bytes(4)` : OK
- [x] `language plpgsql` function create + call : OK, `security definer` also OK
- [x] trigger create + fires : OK (a BEFORE INSERT trigger set a `text[]` column; `pg` returned it as a JS array)
- [ ] `insert` then immediate `select` via REST `/query` returns the new row (no cache) : pending dml key
- [ ] usage/quota endpoint exists? :
- [ ] `/query` row format (objects vs arrays aligned to `columns`) :
- [ ] rate limit values (429) :

## Data path (decided 14/11/2026, Task 6b)
- **Primary:** the Worker reaches Postgres through **Cloudflare Hyperdrive** (Free plan: 100,000 queries/day, about 20 origin connections, 15 s initial connect timeout, 10 min idle timeout).
  - The Hyperdrive origin is the HornetHive **pooled** string (`HIVE_PG_URL`: PgBouncer transaction mode, port 6432, `sslmode=require`).
  - Create the config with query caching **disabled**: `npx wrangler hyperdrive create hdm-db --connection-string="<HIVE_PG_URL>" --caching-disabled`. Put the printed id in `worker/wrangler.toml` `[[hyperdrive]]`.
  - The Worker uses `pg` (node-postgres) with `nodejs_compat`. Each request gets its own lazily-connected `Client` (`worker/src/hivePg.ts`), ended with `ctx.waitUntil` after the response.
  - The `Hive` interface and every route's SQL are unchanged: each query still selects one `jsonb` column `r`.
  - pg returns `jsonb` as an object, REST as a string. `jsonCell()` handles both.
- **Fallback:** when no `HYPERDRIVE` binding exists, the Worker uses the REST `/query` client (`worker/src/hive.ts`). That needs `HIVE_DB_ID` and the `HIVE_DML_KEY` secret.
- **Backup:** Apps Script no longer calls HornetHive. `nightlyBackup` pages through the Worker's HMAC-signed `POST /internal/export {table, offset, limit}`. The Worker holds a fixed table whitelist, each table with its ORDER BY key. No read key is needed.
- **Risk:** HornetHive's docs say the direct Postgres connection is a Pro-plan feature. Our Free database was nevertheless given a working pooled string (confirmed 13/11/2026). If HornetHive restricts it on Free, the Worker must switch to the REST fallback: remove the `[[hyperdrive]]` block and set `HIVE_DML_KEY`. The backup then also needs a read path (`/internal/export` keeps working, since it uses whatever hive the Worker has). Or upgrade to Pro.
- **Security:** the database has no row-level security. The Worker is the only security boundary, and the Hyperdrive connection string acts as the database owner. Never expose it to the browser or Apps Script.
