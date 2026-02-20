---
phase: 05-home-screen
plan: 01
subsystem: ui
tags: [react-native, expo, scrollview, skeleton, loading-state]

requires:
  - phase: 04-data-hooks-checkout-wiring
    provides: useProducts hook and useShopifyQuery base hook built in Phase 4
provides:
  - ScrollScreen accepts and forwards refreshControl prop to inner ScrollView
  - HeroCard renders gold "Wander the Shop" PrimaryButton when onExplorePress prop is provided
  - SkeletonProductCard component: parchment-coloured 160px placeholder matching ProductCard dimensions
affects:
  - 05-02 home-screen-wiring (depends on all three primitives)

tech-stack:
  added: []
  patterns:
    - refreshControl prop forwarding through wrapper components
    - Skeleton loading placeholder using theme tokens only (no animation library)

key-files:
  created:
    - components/SkeletonProductCard.tsx
  modified:
    - components/layout/ScrollScreen.tsx
    - components/HeroCard.tsx

key-decisions:
  - "scrollScreen refreshControl forwarded as React.ReactElement (not specific RefreshControl type) — keeps component generic and avoids react-native import coupling in ScrollScreen"
  - "SkeletonProductCard is static (no shimmer) — plan discretion said shimmer not required; avoids animation library dependency"
  - "HeroCard button label is 'Wander the Shop' — follows brand vocabulary from CLAUDE.md (wandering = discovering)"

requirements-completed: [COMM-01]

duration: 2min
completed: 2026-02-20
---

# Phase 05 Plan 01: Component Primitives Summary

**ScrollScreen pull-to-refresh forwarding + HeroCard explore button + SkeletonProductCard placeholder — three component primitives enabling Plan 02 Home screen wiring**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-20T15:47:52Z
- **Completed:** 2026-02-20T15:49:38Z
- **Tasks:** 3
- **Files modified:** 3 (2 modified, 1 created)

## Accomplishments
- ScrollScreen now forwards `refreshControl?: React.ReactElement` to its inner ScrollView — any screen using ScrollScreen can now add pull-to-refresh without modifying the wrapper
- HeroCard renders a gold "Wander the Shop" PrimaryButton when `onExplorePress` prop is provided; renders identically to current when prop absent (backward compatible)
- SkeletonProductCard created at `components/SkeletonProductCard.tsx` — 160px image area + name/price line placeholders using only theme tokens; no new dependencies

## Task Commits

1. **Task 1: Extend ScrollScreen with refreshControl prop** - `278744a` (feat)
2. **Task 2: Add onExplorePress button to HeroCard** - `ee18c7e` (feat)
3. **Task 3: Create SkeletonProductCard component** - `60d2aa5` (feat)

**Plan metadata:** _(committed with docs commit after this summary)_

## Files Created/Modified
- `components/layout/ScrollScreen.tsx` - Added `refreshControl?: React.ReactElement` to interface, destructure, and forwarded to ScrollView
- `components/HeroCard.tsx` - Added `onExplorePress?: () => void` prop; renders gold PrimaryButton labeled "Wander the Shop" when provided; added `exploreButton` style with `marginTop: spacing.lg`
- `components/SkeletonProductCard.tsx` _(new)_ — Static parchment-coloured card placeholder matching ProductCard: 160px image area (`spacing.productCardImageHeight`), name/price line placeholders, all styled with theme tokens

## Decisions Made
- `refreshControl` typed as `React.ReactElement` (not `React.ReactElement<typeof RefreshControl>`) — keeps ScrollScreen generic; callers pass the full RefreshControl element
- SkeletonProductCard is static (no shimmer animation) — plan explicitly deferred shimmer to Claude's discretion; static is simpler, no animation library needed
- HeroCard button label "Wander the Shop" chosen over "Explore the Shop" — "wandering" is the brand word for discovering (wandering = being unhurried and curious)

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All three component primitives are ready for Plan 02 (Home screen wiring)
- `ScrollScreen` can now accept `<RefreshControl>` from any screen
- `HeroCard` will receive `onExplorePress={handleExplorePress}` from the wired Home screen
- `SkeletonProductCard` will be rendered 6x in `SkeletonGrid` during product fetch

---
*Phase: 05-home-screen*
*Completed: 2026-02-20*
