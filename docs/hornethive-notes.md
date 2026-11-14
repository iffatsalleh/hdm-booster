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
