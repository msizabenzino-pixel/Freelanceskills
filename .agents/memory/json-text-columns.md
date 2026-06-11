---
name: jsonText custom Drizzle column type
description: How JSON-array fields (portfolioProjects) are stored/serialized without manual stringify/parse
---

# jsonText custom Drizzle column type

`shared/models/customTypes.ts` defines `jsonText<T>(name)` — a custom Drizzle
pg column whose `dataType()` is `text` but which JSON.stringify on write and
JSON.parse on read. Used for `profiles.portfolioProjects` and
`freelancerProfiles.portfolioProjects` (DB column stays `portfolio_projects_json`).

**Why:** the codebase previously had a chronic mismatch — frontend sent
`portfolioProjects` (array) while the DB property was `portfolioProjectsJson`
(text), forcing manual JSON.stringify/parse at every route + component. The
custom type centralizes that so both ends use the same field name and arrays
flow naturally.

**How to apply:**
- Read: `row.portfolioProjects` is already a parsed array — never JSON.parse it.
- Write: pass the array directly (or `null`); never JSON.stringify.
- Reuse `jsonText<T>()` for any future JSON-array-on-text column instead of
  re-introducing per-endpoint serialization.
- The underlying column remains Postgres `text`, so existing JSON-string data
  reads back fine and no migration is needed. Do NOT run drizzle-kit push to
  "fix" the type — it's intentional.
