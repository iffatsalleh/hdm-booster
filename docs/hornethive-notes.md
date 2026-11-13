# HornetHive notes

## API (source: https://hornethive.io/docs/rest-api)
- `POST https://api.hornethive.io/v1/rest/{dbId}/query`, header `Authorization: Bearer <key>`
- Body `{"query": "... $1", "params": [..]}`; success `{"columns": [...], "rows": [...]}`; error `{"error", code?, details?, hint?}`
- Key scopes: `read` (read-only txn), `dml` (rows only), `ddl` (owner-level). 429 on rate limit.
- No usage/quota endpoint documented.

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
