---
phase: 06-browse-product-detail
plan: 01
subsystem: ui
tags: [react-native, hooks, shopify, pagination, typescript, cursor]

requires:
  - phase: 04-data-hooks-checkout-wiring
    provides: useShopifyQuery hook pattern, established abstraction boundary (screens never import shopify-client directly)
  - phase: 02-shopify-service-layer
    provides: getProducts and getCollectionByHandle service functions with cursor/after pagination support
provides:
  - useProducts hook with cursor-based pagination, product accumulation, and loadMore API
  - productCategories aligned to confirmed live Shopify collection handles (tie-dye, leather, jewelry, art)
affects:
  - 06-02 (Browse screen — consumes useProducts loadMore and productCategories)
  - 06-03 (Product detail — may consume useProducts for related products)

tech-stack:
  added: []
  patterns:
    - "Pagination accumulation: cursor state + isCursorFetch guard drives append vs replace logic"
    - "Collection reset via separate useEffect watching collection prop — fires synchronously, clears products/cursor before fetch effect runs"
    - "Race-condition safety: cancelled flag in async IIFE inside useEffect"
    - "loadMore is null when no next page — consumer can conditionally render 'Discover more' button without extra logic"

key-files:
  created: []
  modified:
    - hooks/useProducts.ts
    - constants/theme.ts

key-decisions:
  - "useProducts manages its own product/cursor/pageInfo state directly — useShopifyQuery only handles single fetch results and cannot accumulate pages"
  - "products.length omitted from fetch effect deps — only structural triggers (fetchTrigger, collection, limit, cursor) drive fetches; avoids infinite re-fetch when products array grows"
  - "loadMore returned as null (not undefined) when no next page — callers can do simple `loadMore && <Button>` without extra hasNextPage check"
  - "products reset to [] on collection change before re-fetch — shows skeleton immediately when filter changes"

patterns-established:
  - "Cursor accumulation pattern: cursor state + isCursorFetch flag; append on loadMore, replace on fresh fetch"
  - "Dual-effect pattern: separate collection-reset effect fires before fetch effect when collection changes"

requirements-completed: [COMM-02]

duration: 2min
completed: 2026-02-20
---

# Phase 6 Plan 01: useProducts Pagination Upgrade Summary

**useProducts hook upgraded to cursor-based pagination with product accumulation; productCategories corrected to confirmed Shopify handles (tie-dye, leather, jewelry, art)**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-02-20T19:25:32Z
- **Completed:** 2026-02-20T19:27:12Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Rewrote `hooks/useProducts.ts` with full cursor-based pagination: products accumulate across pages, `loadMore` appends next page, collection change resets to page 1 with skeleton state
- Added `pageInfo`, `loadMore`, and `isLoadingMore` to `UseProductsResult` interface; exported `UseProductsOptions` and `UseProductsResult` as named types for consumer use
- Fixed `productCategories` in `constants/theme.ts`: removed `crystals` and `ceramics` (no matching Shopify collections), renamed `artwork` id to `art` (confirmed Shopify handle); 4 entries now match live store exactly

## Task Commits

Each task was committed atomically:

1. **Task 1: Upgrade useProducts with cursor accumulation and pagination API** - `1230700` (feat)
2. **Task 2: Fix productCategories handles to match actual Shopify collections** - `c6aed7c` (fix)

**Plan metadata:** (docs commit pending)

## Files Created/Modified

- `/Users/jamesputman/SRC/wildenflowerShop/hooks/useProducts.ts` - Rewritten: adds cursor state, pageInfo state, isLoadingMore flag, loadMore function, two-effect collection-reset pattern, race-condition cancelled flag
- `/Users/jamesputman/SRC/wildenflowerShop/constants/theme.ts` - productCategories array corrected from 6 entries to 4 confirmed-real Shopify handles

## Decisions Made

- `useProducts` manages its own product/cursor/pageInfo state directly because `useShopifyQuery` only manages a single fetch result and cannot accumulate pages across cursors.
- `products.length` intentionally omitted from fetch effect deps — only structural triggers drive fetches, preventing infinite re-fetch as the products array grows via accumulation.
- `loadMore` is returned as `null` (not `undefined`) when no next page exists — consumers can do `loadMore && <Button />` without a separate `pageInfo.hasNextPage` check.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `useProducts` hook is ready for Browse screen (06-02): `loadMore`, `pageInfo`, `isLoadingMore` all available
- `productCategories` is aligned to live Shopify store — FilterChipRow in Browse will produce correct filtered results
- Pre-Phase 6 collection handle mismatch blocker is resolved

---
*Phase: 06-browse-product-detail*
*Completed: 2026-02-20*

## Self-Check: PASSED

- hooks/useProducts.ts: FOUND
- constants/theme.ts: FOUND
- 06-01-SUMMARY.md: FOUND
- Commit 1230700 (feat: upgrade useProducts): VERIFIED
- Commit c6aed7c (fix: productCategories handles): VERIFIED
