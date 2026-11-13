# HornetHive notes

## API (source: https://hornethive.io/docs/rest-api)
- `POST https://api.hornethive.io/v1/rest/{dbId}/query`, header `Authorization: Bearer <key>`
- Body `{"query": "... $1", "params": [..]}`; success `{"columns": [...], "rows": [...]}`; error `{"error", code?, details?, hint?}`
- Key scopes: `read` (read-only txn), `dml` (rows only), `ddl` (owner-level). 429 on rate limit.
- No usage/quota endpoint documented.

## Platform probe checklist (run against `hdm_dev` with the ddl key; record result + date beside each)
If plpgsql or pgcrypto is refused, stop and report (design 3.3 fallback: logic moves to Worker).

- [ ] `select version()` :
- [ ] `create extension if not exists pgcrypto` :
- [ ] `select gen_random_uuid(), gen_random_bytes(4)` :
- [ ] `language plpgsql` function create + call :
- [ ] trigger create + fires :
- [ ] `insert` then immediate `select` via same path returns the new row (no cache) :
- [ ] usage/quota endpoint exists? :
- [ ] `/query` row format (objects vs arrays aligned to `columns`) :
- [ ] rate limit values (429) :
