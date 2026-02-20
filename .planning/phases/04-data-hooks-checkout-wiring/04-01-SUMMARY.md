---
phase: 04-data-hooks-checkout-wiring
plan: "01"
subsystem: api
tags: [react-hooks, shopify, data-fetching, typescript]

# Dependency graph
requires:
  - phase: 02-shopify-service-layer
    provides: getProducts, getCollectionByHandle, getCollections, getProductByHandle service functions
  - phase: 03-cartcontext-upgrade
    provides: CartContext with Shopify-backed cart state and checkoutUrl type declaration

provides:
  - useShopifyQuery<T> generic base hook with loading/isRefetching/error/refetch state machine
  - useProducts(options?) public hook with collection filter and limit support
  - useCollections(options?) public hook with limit support
  - useProduct(handle) public hook with handle-change re-fetch and race condition prevention
  - checkoutUrl + openCheckout fully wired in CartContext (platform-aware: web href / native Linking)

affects:
  - 04-data-hooks-checkout-wiring (Plan 02+: checkout wiring in cart screen)
  - 05-home-screen (uses useProducts, useCollections)
  - 06-browse-screen (uses useProducts with collection filter)
  - 07-product-detail (uses useProduct)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - useShopifyQuery base hook pattern (cancelled flag for race condition prevention, loading vs isRefetching distinction)
    - Thin public hook wrappers with useCallback-stabilized queryFn
    - Primitive dep destructuring before useCallback (prevents object identity churn)
    - Screens import hooks only — never lib/shopify-client directly

key-files:
  created:
    - hooks/useShopifyQuery.ts
    - hooks/useProducts.ts
    - hooks/useCollections.ts
    - hooks/useProduct.ts
  modified:
    - context/CartContext.tsx

key-decisions:
  - "queryFn excluded from useShopifyQuery useEffect deps — callers must provide stable useCallback reference (documented in JSDoc)"
  - "loading vs isRefetching: loading=true only when data===null AND error===null (initial fetch); isRefetching=true on all subsequent refetch() calls"
  - "error clears optimistically to null when refetch() is called before the new fetch completes (per CONTEXT.md)"
  - "Race condition prevention via cancelled flag: handle changes trigger effect cleanup (cancelled=true) before new effect starts — stale responses discarded"
  - "useProducts destructures options to primitives (collection, limit) before useCallback — prevents object identity churn on every re-render"
  - "openCheckout uses Platform.OS check: web uses window.location.href (full page nav), native uses Linking.openURL"
  - "updateCartState() helper ensures checkoutUrl stays in sync after every cart mutation (addToCart, removeFromCart, updateQuantity)"

patterns-established:
  - "useShopifyQuery pattern: any Shopify data fetch goes through this base hook; public hooks are thin wrappers only"
  - "Primitive dep destructuring: always destructure options objects to primitives before useCallback deps"
  - "Screens never import from lib/shopify-client — hooks are the only access point"

requirements-completed: [SHOP-08]

# Metrics
duration: 3min
completed: 2026-02-20
---

# Phase 4 Plan 01: Data Hooks Summary

**Generic useShopifyQuery<T> base hook with cancelled-flag race condition prevention, plus three thin public hooks (useProducts, useCollections, useProduct) wrapping the Shopify service layer — establishing the screen/service abstraction boundary.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-02-20T00:12:44Z
- **Completed:** 2026-02-20T00:15:37Z
- **Tasks:** 2
- **Files modified:** 5 (4 created, 1 modified)

## Accomplishments
- Created `useShopifyQuery<T>` with proper loading/isRefetching distinction, cancelled flag for race condition prevention, and optimistic error clearing on refetch
- Created `useProducts`, `useCollections`, `useProduct` as thin wrappers with stable useCallback queryFn references and primitive dep arrays
- Fully wired `checkoutUrl` + `openCheckout` into CartContext (fixing pre-existing type mismatch and adding platform-aware checkout navigation)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create useShopifyQuery base hook** - `b027b67` (feat)
2. **Task 2: Create useProducts, useCollections, useProduct public hooks** - `ea2c3f4` (feat)

**Plan metadata:** (docs commit to follow)

## Files Created/Modified
- `hooks/useShopifyQuery.ts` - Generic base hook managing loading/isRefetching/error/refetch state machine with cancelled flag race condition prevention
- `hooks/useProducts.ts` - Public hook; fetches all products or filters by collection handle via getProducts/getCollectionByHandle
- `hooks/useCollections.ts` - Public hook; fetches Shopify collections with optional limit
- `hooks/useProduct.ts` - Public hook; single product by handle, re-fetches on handle change
- `context/CartContext.tsx` - Fixed type contract (checkoutUrl + openCheckout added to Provider value); mutations now use updateCartState() helper

## Decisions Made
- queryFn excluded from useShopifyQuery's useEffect dep array — callers provide stable useCallback reference; documented in JSDoc
- loading vs isRefetching: loading=true only on the very first fetch (data null AND error null); isRefetching=true on all subsequent refetch() calls
- Primitive dep destructuring before useCallback in all public hooks to prevent object identity churn
- openCheckout uses Platform.OS: web uses window.location.href, native uses Linking.openURL (per CONTEXT.md)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed CartContext.tsx TypeScript type contract mismatch**
- **Found during:** Task 1 (verifying TypeScript compilation)
- **Issue:** CartContextType declared `checkoutUrl: string | null` and `openCheckout: () => void` but Provider value object was missing both; TypeScript error TS2739
- **Fix:** Added `openCheckout()` function with Platform.OS-based routing; added `checkoutUrl` and `openCheckout` to Provider value; updated `addToCart`, `removeFromCart`, `updateQuantity` mutations to call `updateCartState()` helper (which syncs checkoutUrl) instead of bare `setCart()`
- **Files modified:** context/CartContext.tsx
- **Verification:** `npx tsc --noEmit` exits 0 with zero errors
- **Committed in:** b027b67 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — pre-existing type contract bug)
**Impact on plan:** Required fix — CartContext.tsx had partial checkout URL work started but was not complete. Fix completes the checkout wiring that CONTEXT.md specifies as Phase 4 scope. No scope creep.

## Issues Encountered
None beyond the auto-fixed CartContext type mismatch.

## Next Phase Readiness
- All four hooks ready for use in screens (Phase 5+ Home, Browse, Product Detail)
- useProducts/useCollections wired and ready for Phase 5 Home screen data integration
- checkoutUrl pre-fetched after every cart mutation and available via useCart() — Cart screen checkout button can be wired in Phase 5 Cart screen work
- No blockers for Phase 4 Plan 02

---
*Phase: 04-data-hooks-checkout-wiring*
*Completed: 2026-02-20*
