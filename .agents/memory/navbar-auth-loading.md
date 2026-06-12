---
name: Navbar authLoading skeleton
description: Navbar must show a neutral skeleton while useAuth isLoading is true, not "Log In" buttons, to avoid auth flash for authenticated users.
---

# Navbar Auth Loading State

`useAuth()` returns `isLoading: boolean` which is `true` during the initial Firebase `onAuthStateChanged` + server `GET /api/auth/user` resolution. During this window (~100–500ms), `user` is null and `isAuthenticated` is false.

**Why:** If the Navbar renders `{isAuthenticated ? <UserMenu> : <LogInButton>}`, authenticated users always see a brief "Log In" flash before auth resolves. For PostgreSQL-only users, the server round-trip adds extra delay.

**How to apply:**
```tsx
const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();

// Desktop nav
{authLoading ? (
  <div className="hidden md:flex w-8 h-8 rounded-full bg-muted/40 animate-pulse" aria-hidden="true" />
) : isAuthenticated ? (
  <UserMenu />
) : (
  <><LogInButton /><JoinFreeButton /></>
)}

// Mobile menu
{authLoading ? null : isAuthenticated ? <MobileUserMenu /> : <MobileAuthButtons />}
```

The skeleton is invisible to screen readers (`aria-hidden`) and disappears in < 500ms for most users.
