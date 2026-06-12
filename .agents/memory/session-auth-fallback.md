---
name: Session Auth Fallback
description: useAuth fallback when Firebase returns null — checks GET /api/auth/user so PostgreSQL-only session users can access AuthGuard-protected pages.
---

## The rule
`useAuth` must check `GET /api/auth/user` (Express session) as a fallback when Firebase `onAuthStateChanged` resolves to null. Without this, email/password users registered outside Firebase (via `/api/auth/register`) get a server 200 on login but `AuthGuard` still blocks them.

**Why:** Firebase and Express have two separate auth surfaces. `POST /api/auth/login` sets a session cookie but never fires `onAuthStateChanged`. Before this fix, `useAuth().isAuthenticated` was permanently `false` for PostgreSQL-session-only users.

**How to apply:**
- In `use-auth.ts` `onAuthStateChanged` null branch: `fetch("/api/auth/user", { credentials: "include" })` — if 200, set user from server response and return early.
- In `Login.tsx` after PostgreSQL fallback login succeeds: use `window.location.href = redirect` (hard reload) instead of wouter `navigate()`. Hard reload causes `useAuth` to re-run and pick up the new session cookie.
- `GET /api/auth/user` is in `server/replit_integrations/auth/routes.ts` (requires `isAuthenticated` middleware which checks `req.session.userId`).
- Do NOT call `clearServerSession()` on every Firebase-null event — only call it when `lastSyncedUid.current !== null` (i.e. a Firebase user just logged out), so PostgreSQL sessions are preserved.
