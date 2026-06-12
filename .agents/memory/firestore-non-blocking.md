---
name: Firestore sync non-blocking
description: saveFreelancerProfile() in mutations must be fire-and-forget; awaiting it causes silent failures for PostgreSQL-only users with no Firebase account.
---

# Firestore Sync Must Be Non-Blocking

`saveFreelancerProfile()` syncs profile data to Firestore for real-time features. For users authenticated via PostgreSQL (email/password without Firebase), this call fails because there's no Firebase account.

**Why:** If `await saveFreelancerProfile(...)` throws inside a TanStack Query `mutationFn`, the entire mutation fails and `onError` fires — showing an error toast even though the PostgreSQL save succeeded.

**How to apply:**
```typescript
// ✅ Non-blocking — PostgreSQL save always succeeds, Firestore sync is best-effort
saveFreelancerProfile({ ... }).catch((e) => {
  console.warn("[EditProfile] Firestore sync failed (non-critical):", e);
});
return updated; // return the PostgreSQL result immediately

// ❌ Blocking — Firebase error kills the entire save
await saveFreelancerProfile({ ... });
```

Apply this pattern everywhere `saveFreelancerProfile` is called inside a mutation function: CVUpload, EditProfile, FreelancerOnboarding, etc.
