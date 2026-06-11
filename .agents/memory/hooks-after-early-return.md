---
name: Hooks after conditional early return (#310)
description: React error #310 root cause pattern seen in this app's onboarding/overlay components
---

React minified error #310 ("Rendered more hooks than during the previous render") in this
app was caused by a hook placed AFTER a conditional early return whose condition flips.

**Concrete case:** an overlay component had `if (!isVisible) return null;` and then called
`useReducedMotion()` (a framer-motion hook that internally calls `useState`) on the next line.
First render `isVisible=false` → early return → hook never runs; later render `isVisible=true`
→ hook runs → more hooks than before → crash, caught by ErrorBoundary, blanking the page.

**Why:** all hooks must run unconditionally on every render, in the same order.

**How to apply:** ALL hooks (including framer-motion's `useReducedMotion`, and any custom hook)
must sit above every conditional `return`. When debugging a #310, build unminified
(`vite build` with `build.minify:false` temporarily) to get the real component + hook name in
the stack — production serves `dist/` so minified stacks only show mangled names like `Oc`/`e2`.
vendor-ui chunk = lucide-react + framer-motion; vendor-react = react/react-dom.
