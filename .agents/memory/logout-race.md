---
name: Logout race condition
description: clearServerSession() must run BEFORE logoutFirebaseUser() — reverse order causes re-auth via onAuthStateChanged.
---

# Logout Race Condition

## The Bug
Calling `logoutFirebaseUser()` (Firebase `signOut`) BEFORE `clearServerSession()` causes this race:

1. `signOut()` fires immediately
2. `onAuthStateChanged(null)` fires
3. The handler calls `GET /api/auth/user` — session is **still alive**
4. Server returns the user — `setUser(user)` re-authenticates!
5. `clearServerSession()` destroys the session (too late)
6. `setUser(null)` — user is cleared
7. Page reload → `GET /api/auth/user` → 401 ✅ (looks fine after reload)

The symptom: click logout → redirect to home → still logged in (avatar visible) until a second full reload.

## The Fix (use-auth.ts)

```typescript
// 1. Destroy server session FIRST
await clearServerSession();   // POST /api/auth/logout → session.destroy() + clearCookie

// 2. Then sign out from Firebase
await logoutFirebaseUser();   // onAuthStateChanged fires — but session is already gone
```

Also add a `loggingOutRef = useRef(false)` guard:
- Set to `true` at start of `logout()`
- In `onAuthStateChanged(null)` handler: skip `GET /api/auth/user` if `loggingOutRef.current`
- Reset to `false` in `finally` block

## Backend (routes.ts)

Both `/api/auth/logout` and `/api/auth/clear-session` must:
- Call `res.clearCookie("connect.sid", { path: "/" })` even when `session.destroy()` errors
- Never return 500 and leave the cookie alive

**Why:** If the server returns 500 on destroy error, the cookie stays in the browser and the session (possibly zombie) stays accessible.

## Non-Firebase fallback (isFirebaseConfigured = false)

When Firebase is not configured, the `onAuthStateChanged` listener is never registered. The hook must call `GET /api/auth/user` directly on init (in the early-return branch) to hydrate user state from the PostgreSQL session.
