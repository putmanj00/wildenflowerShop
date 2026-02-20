---
phase: 05-home-screen
plan: 02
subsystem: ui
tags: [react-native, expo, shopify, useProducts, type-adapter, skeleton, refresh-control, navigation]

requires:
  - phase: 04-data-hooks-checkout-wiring
    provides: useProducts hook (AppProduct[], loading, isRefetching, error, refetch)
  - phase: 05-01
    provides: ScrollScreen refreshControl forwarding, HeroCard onExplorePress, SkeletonProductCard
provides:
  - Home screen fully wired to live Shopify products (no mock data)
  - AppProduct→Product type adapter (screen-local mapAppProductToProduct)
  - Featured-collection-with-fallback data pattern
  - Skeleton loading, brand-voiced error, pull-to-refresh, category navigation
affects:
  - 05-03 human-verify (visual verification of this screen)
  - 06-browse-screen (receives category param via router.push)

tech-stack:
  added: []
  patterns:
    - AppProduct→Product screen-local type adapter (temporary bridge until type consolidation)
    - Two-hook featured-with-fallback pattern: featuredHook first, allHook if empty
    - Two-hook loading state: isLoading considers only the active hook's initial fetch

key-files:
  created: []
  modified:
    - app/(tabs)/index.tsx

key-decisions:
  - "mapAppProductToProduct is screen-local (not exported) — temporary bridge; future phase consolidates types"
  - "Two plain-object useProducts calls (not useCallback) — hook stabilises queryFn internally on primitives"
  - "isLoading: featured.loading || (!featured.loading && featured.products.length === 0 && allHook.loading) — prevents skeleton flash when featured returns empty and fallback loads"
  - "createdAt stubbed as new Date().toISOString() — field not displayed on home screen; avoids touching types/index.ts"
  - "activeCategory={null} always on Home — category press navigates to Browse, no local highlighting"
  - "empty-store guard: displayProducts.length === 0 shows warm empty state instead of blank grid"

requirements-completed: [COMM-01]

duration: 1min
completed: 2026-02-20
---

# Phase 05 Plan 02: Home Screen Wiring Summary

**Home screen fully wired to live Shopify products: featured-collection-with-fallback via two useProducts hooks, AppProduct→Product adapter, skeleton loading, brand-voiced error, pull-to-refresh, and Browse navigation with category params**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-20T16:10:37Z
- **Completed:** 2026-02-20T16:11:51Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- `app/(tabs)/index.tsx` completely rewritten — mock data removed, live Shopify products via `useProducts` hooks
- `mapAppProductToProduct` adapter bridges `AppProduct` (Shopify Storefront shape) to `Product` (UI component shape) — screen-local, not exported
- Featured-with-fallback pattern: `useProducts({ collection: 'featured', limit: 6 })` primary; `useProducts({ limit: 6 })` fallback when featured is empty/missing (current Shopify store has no `featured` handle, so fallback is the live path)
- Loading state: `SkeletonGrid` renders 6 parchment-coloured placeholders in 2-column layout during initial fetch
- Error state: brand-voiced "The shop is resting. Try again soon." with terracotta "Try Again" button
- Pull-to-refresh: terracotta `RefreshControl` calls both hooks' `refetch()` on swipe-down
- Category press navigates to `/(tabs)/browse` with `{ category: id }` param (Phase 6 Browse will read via `useLocalSearchParams`)
- HeroCard "Wander the Shop" button + "See All" both navigate to Browse unfiltered

## Task Commits

1. **Task 1: Wire Home screen to live Shopify data** - `3fdcc86` (feat)

**Plan metadata:** _(committed with docs commit after this summary)_

## Files Created/Modified
- `app/(tabs)/index.tsx` — Fully rewritten: removed mock-data import, useState for activeCategory; added useProducts hooks, mapAppProductToProduct adapter, SkeletonGrid component, error/empty states, RefreshControl, category navigation with params, HeroCard onExplorePress prop

## Decisions Made
- Two plain-object `useProducts` calls — the hook destructures to primitives internally and `useCallback`s its queryFn; no need for `useCallback` on the screen side
- `isLoading` logic avoids skeleton re-flash: only shows skeleton during active hook's initial fetch, not when the fallback hook fires after featured resolves empty
- `createdAt` stubbed with `new Date().toISOString()` — `Product` type requires it; not displayed on Home screen; avoids touching type definitions this phase
- Empty-store guard added (not in plan) — shows warm "Nothing here yet" message if both hooks resolve with 0 products; prevents blank grid (pre-emptive Rule 2 fix)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Empty store guard added**
- **Found during:** Task 1 (Home screen wiring)
- **Issue:** Plan's render logic only handled `isLoading` and `hasError`, but not the case where both hooks succeed with 0 products (e.g. empty Shopify store or all products unpublished). This would render a blank grid with no feedback.
- **Fix:** Added a third conditional: `{!isLoading && !hasError && displayProducts.length === 0 && <EmptyState />}` with brand-voiced "Nothing here yet — but the best things take time."
- **Files modified:** `app/(tabs)/index.tsx`
- **Verification:** Covers the 0-product case alongside the documented isLoading and hasError paths
- **Committed in:** `3fdcc86` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Minor additive fix; no scope creep. Empty-store guard is essential UX completeness — blank grid with no feedback is not acceptable for a production screen.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Plan 03 (05-03) is a human visual verification checkpoint — start the dev server (`npx expo start --web`) and review the Home screen at http://localhost:8081
- Live Shopify products should appear after a brief skeleton loading flash
- The current Shopify store (`bgh9hd-rq.myshopify.com`) has no `featured` collection handle — the fallback to all products is the live path; this is expected and correct
- Pre-Phase 6 blocker: collection handle mismatch for Browse FilterChips remains (not blocking Phase 5)

---
*Phase: 05-home-screen*
*Completed: 2026-02-20*
