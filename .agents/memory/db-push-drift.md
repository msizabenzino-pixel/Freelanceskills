---
name: db:push is unsafe in this repo (schema drift)
description: Why `npm run db:push` / drizzle-kit push must NOT be run here, and what to do instead for schema changes.
---

# `drizzle-kit push` is unsafe in this repo — use idempotent SQL DDL

`npm run db:push` (drizzle-kit push) drops into its **interactive rename prompt** in this
project and, with no TTY, aborts on EOF applying **zero** changes — OR risks renaming
existing tables if a choice is auto-picked.

**Why:** The dev DB has long-standing schema drift vs `shared/schema.ts` (e.g. tables in
schema not in DB like `dispute_chats`, and historical columns added by hand). When push
sees "new" schema tables it can't match, it asks "created or renamed from <existing>?" for
each — a destructive minefield. The repo's own build rule already treats schema as
hand-managed.

**How to apply:** For any schema change, (1) edit the Drizzle model so types/`@shared/schema`
stay correct, then (2) apply the change to the DB directly with idempotent SQL via
`psql "$DATABASE_URL"`: `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, `CREATE TABLE IF NOT
EXISTS`, `CREATE INDEX IF NOT EXISTS`. Match Drizzle's column names/types exactly
(`varchar`→character varying, `timestamp` default `now()`, ids `DEFAULT gen_random_uuid()`).
Never run `db:push` to "just sync". For production, use the `database` skill at deploy time.
