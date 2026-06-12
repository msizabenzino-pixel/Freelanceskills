---
name: Profile upsert for new users
description: PATCH /api/profile must upsert (INSERT if no row) for users who haven't completed CV upload yet.
---

# Profile Upsert Pattern

New users registered via `POST /api/auth/register` only get a `users` table row — no `profiles` table row until they complete the CV upload wizard. If they navigate directly to `/edit-profile`, a pure `UPDATE` finds no row and returns nothing.

**Why:** The `profiles` table row is created during CV upload. If a user skips CV upload and goes directly to edit-profile, there's no profile row.

**How to apply:** In `PATCH /api/profile` (server/routes.ts), always upsert:
```typescript
const [existing] = await tx.select({ id: profilesTable.id }).from(profilesTable).where(eq(profilesTable.userId, userId));
if (existing) {
  const [updated] = await tx.update(profilesTable).set({ ...data, updatedAt: new Date() }).where(eq(profilesTable.userId, userId)).returning();
  return updated;
} else {
  const [inserted] = await tx.insert(profilesTable).values({ userId, ...data, createdAt: new Date(), updatedAt: new Date() }).returning();
  return inserted;
}
```

Never rely on UPDATE-returns-one-row as proof the profile existed.
