---
name: service_packages schema/DB drift
description: service_packages table can be missing is_promoted/promoted_bid columns that the Drizzle schema defines, 500-ing every full-row select.
---

The Drizzle schema `servicePackages` (shared/models/services.ts) defines `is_promoted` (boolean) and `promoted_bid` (integer). A real database may lack these columns (drift).

**Symptom:** Any `db.select().from(servicePackages)` (no explicit column list) generates SQL referencing the missing columns and throws → endpoints like `GET /api/freelancers/:id/packages`, `getAllPackages`, `getActiveServicePackages` return HTTP 500. Endpoints that select explicit columns (e.g. `/api/services/search`, `/api/services/:id`) keep working, which masks the drift.

**Fix (idempotent, non-destructive):**
```sql
ALTER TABLE service_packages ADD COLUMN IF NOT EXISTS is_promoted boolean NOT NULL DEFAULT false;
ALTER TABLE service_packages ADD COLUMN IF NOT EXISTS promoted_bid integer DEFAULT 0;
```

**Why:** Dev DB was reconciled this way (June 2026). The production / freshly-merged-main database likely still lacks these columns — apply the same ALTER (or `drizzle-kit push`) there, or the package-tabs feature on the gig detail page and any package-listing endpoint will 500 in production.

**How to apply:** When a `service_packages` query 500s with a column-does-not-exist error, run the ALTER above instead of rewriting the storage method. Prefer aligning the DB to the schema over selecting explicit columns.
