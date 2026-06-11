---
name: DB schema drift — never use drizzle-kit push
description: The live Postgres DB has drifted from the Drizzle schema; drizzle-kit push proposes DESTRUCTIVE renames. Reconcile with additive ALTER TABLE instead.
---

# DB schema drift & the drizzle-kit push trap

The live Postgres database has drifted significantly from the Drizzle schema in
`shared/models/*`. Multiple tables are missing columns that the schema defines, so
any Drizzle `select *` (e.g. `getProfileById`) throws `column "..." does not exist`
until the column is added to the DB.

Known drift seen (additively reconciled):
- `profiles` was missing the entire 3-tier trust badge column set
  (`identity_verified`, `skills_verified`, `top_performer`, their `*_at` timestamps,
  `on_time_delivery_rate`, `work_history_json`) plus the verification-tier columns.
- `disputes` is an OLD shape: it has `booking_id, initiator_id, respondent_id,
  admin_id, description, resolution, chat_log_export` but is MISSING ~13 columns the
  Drizzle schema declares (`order_id, client_id, freelancer_id, closed_at, priority,
  updated_at`, etc.). The dispute enum types (`dispute_priority`, `dispute_reason`,
  `dispute_status`) also do NOT exist in the DB.

**Rule: NEVER run `npm run db:push` / `drizzle-kit push` on this repo.**
**Why:** push cannot match the new `dispute_chats` table to anything, so it offers
~30 existing tables (kyc_records, risk_scores, support_agents, …) as "rename"
candidates. With `--force` it will attempt DESTRUCTIVE table renames. Verified: a
push run left the schema unchanged AND did not create the intended columns.

**How to apply:** add new columns with idempotent additive SQL instead:
`ALTER TABLE <t> ADD COLUMN IF NOT EXISTS <col> <type> [DEFAULT ...];`
Match the Drizzle column type exactly (snake_case names). Empty tables tolerate
`NOT NULL` without a default; non-empty tables need a default or a backfill.
After adding columns, restart is not required for an already-running build — the
columns are read at query time.
