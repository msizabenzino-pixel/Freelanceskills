---
name: Category taxonomy gap (frontend slugs vs stored gig categories)
description: Why category_browsed tracking and the Recommended feed can mismatch, and how matching is made best-effort.
---

# Category taxonomy gap

The frontend category taxonomy uses descriptive slugs (e.g. `skilled-trades`,
`graphics-design`, `programming-tech`) but `service_packages.category` stores
short lowercase tokens (e.g. `trades`, `tech`, `creative`, `cleaning`,
`moving`). These two taxonomies do NOT line up, so an exact string match between
a browsed category and a gig category almost never succeeds.

**Rule:** when logging `category_browsed`, log the human-readable display name
(de-slugged), never the raw URL slug. Fire it from ONE place per browse
(CategoryDetail / SearchResults), not also from the Categories list page, to
avoid duplicate `category_views` rows for a single browse.

**Why:** the Recommended feed (`getRecommended` in `server/homeFeed.ts`) keys
off recent `category_views`. Logging slugs guarantees zero matches and silently
degrades the signal; the feed then always falls back to top-rated gigs.

**How to apply:** `getRecommended` matches browsed categories with an exact
`inArray` (strong signal) PLUS a per-word ILIKE (>=4-char tokens) against
category/title/description, so "Skilled Trades" → token "trades" can still hit.
If the taxonomies are ever unified (Phase 4+), the token-ILIKE fallback can be
simplified back to exact match.
