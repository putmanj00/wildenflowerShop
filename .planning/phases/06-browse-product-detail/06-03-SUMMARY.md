---
phase: 06-browse-product-detail
plan: 03
subsystem: ui
tags: [react-native, expo-router, shopify, product-detail, cart, variants]

# Dependency graph
requires:
  - phase: 06-01
    provides: useProducts pagination + productCategories Shopify handles
  - phase: 04-data-hooks-checkout-wiring
    provides: useProduct hook, CartContext.addToCart(variantId)
  - phase: 03-cartcontext-upgrade
    provides: CartContext with Shopify-backed addToCart returning boolean

provides:
  - "Complete Product Detail screen: swipeable gallery, variant selector, sticky Add to Cart bar"
  - "Home screen navigation fix: product.handle used as route param (not GID)"
  - "COMM-03 requirement: finder can view product images, select a variant, and add to cart"

affects:
  - 06-04-browse-screen
  - future-cart-screen
  - future-maker-profile

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "mapAppProductToProduct maps p.handle to Product.id so route params are URL-safe slugs, not GIDs"
    - "Derive option names from variant.selectedOptions when ShopifyProduct.options not in type"
    - "isSingleVariantProduct shortcut: title === 'Default Title' auto-selects, skips option UI"
    - "buttonState machine: idle -> adding -> added (1.5s) -> idle for Add to Cart feedback"
    - "Gallery: pagingEnabled horizontal ScrollView + onScroll index tracking + web prev/next buttons"

key-files:
  created:
    - "app/product/[id].tsx — Complete Product Detail screen (590 lines)"
  modified:
    - "app/(tabs)/index.tsx — mapAppProductToProduct: p.id -> p.handle; handleProductPress comment"

key-decisions:
  - "BotanicalDivider variant 'fern' (plan spec) -> 'fern-spiral' (auto-fixed: 'fern' not a supported variant)"
  - "spacing.round (plan spec) -> radii.round: 999 (correct token from theme.ts)"
  - "Product options derived from variant.selectedOptions not product.options (ShopifyProduct type has no options field)"
  - "top: '50%' in web arrow buttons cast as unknown as number for TypeScript compatibility with RN StyleSheet"

patterns-established:
  - "Product Detail uses Screen (not ScrollScreen) + internal ScrollView — required for sticky bottom bar outside scroll"
  - "Gallery width capped at 600px for web desktop to prevent stretched images"
  - "4:5 portrait ratio for product gallery images (galleryWidth * 5/4)"

requirements-completed: [COMM-03]

# Metrics
duration: 2min
completed: 2026-02-20
---

# Phase 06 Plan 03: Product Detail Screen Summary

**Complete Product Detail screen with swipeable image gallery, multi-option variant selector with availability markings, and sticky Add to Cart bottom bar — COMM-03 fulfilled**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-02-20T19:30:13Z
- **Completed:** 2026-02-20T19:32:19Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Fixed Home screen navigation: `mapAppProductToProduct` now maps `p.handle` to `Product.id` so `useProduct(handle)` can find products (was using Shopify GID)
- Complete Product Detail screen with full-width swipeable gallery, dot indicators, and web prev/next arrow buttons
- Multi-option variant selector with globally-unavailable value detection (strikethrough) and per-option pill UI
- Sticky bottom bar outside ScrollView: price in gold + Add to Cart with idle/adding/added state machine
- Single-variant products (`Default Title`) auto-selected — button shows "Add to Cart" immediately with no option picker shown

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix Home screen navigation to use product.handle** - `0130a97` (fix)
2. **Task 2: Build Product Detail screen with gallery, variant selector, and sticky bar** - `dfe814c` (feat)

**Plan metadata:** (docs commit — see final commit)

## Files Created/Modified
- `app/product/[id].tsx` — Complete Product Detail screen (590 lines): gallery, variants, sticky bar, loading/error states
- `app/(tabs)/index.tsx` — Navigation fix: `mapAppProductToProduct` maps `p.handle` to `Product.id`; comment on `handleProductPress`

## Decisions Made
- **Option names from variants:** `ShopifyProduct.options` is not in the type definition. Derive option names from `variant.selectedOptions` using `Array.from(new Set(...))`. Preserves insertion order across all variants.
- **Single-variant shortcut:** Products with exactly one variant titled "Default Title" skip the variant selector UI and auto-select. This is the Shopify pattern for non-configurable products.
- **Gallery cap at 600px:** Web desktop could render a 1400px-wide product image. Capped at `Math.min(width, 600)` for better proportions.
- **4:5 portrait ratio:** `galleryHeight = galleryWidth * (5/4)` — standard product photography ratio, matching plan spec.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] BotanicalDivider variant 'fern' does not exist**
- **Found during:** Task 2 (Product Detail screen implementation)
- **Issue:** Plan specifies `<BotanicalDivider variant="fern" />` but the component's TypeScript union type is `'fern-mushroom' | 'wildflower' | 'vine-trail' | 'mushroom-cluster' | 'fern-spiral'`. Using 'fern' would be a TypeScript error.
- **Fix:** Changed to `variant="fern-spiral"` — the closest available variant (fern imagery)
- **Files modified:** `app/product/[id].tsx`
- **Verification:** `npx tsc --noEmit` — zero errors
- **Committed in:** dfe814c (Task 2 commit)

**2. [Rule 1 - Bug] spacing.round does not exist in theme.ts**
- **Found during:** Task 2 (sticky bar and pill styles)
- **Issue:** Plan references `spacing.round (999)` for border radii. The `spacing` object has no `round` key — `round: 999` lives in `radii` object.
- **Fix:** Used `radii.round` throughout pill and button styles
- **Files modified:** `app/product/[id].tsx`
- **Verification:** `npx tsc --noEmit` — zero errors
- **Committed in:** dfe814c (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 - bugs in plan spec)
**Impact on plan:** Both auto-fixes required for TypeScript correctness. No scope creep. Visual intent fully preserved.

## Issues Encountered
- `top: '50%'` in StyleSheet.create requires `as unknown as number` cast for TypeScript compatibility with React Native's StyleSheet type system (expects `number`, but `'50%'` is valid on web). Applied minimal cast to unblock compilation.

## Next Phase Readiness
- Product Detail screen complete: tapping any product from Home or Browse navigates to full detail with live Shopify data
- COMM-03 requirement fulfilled
- Ready for Plan 04 (Browse screen completion) or further cart/checkout work

---
*Phase: 06-browse-product-detail*
*Completed: 2026-02-20*
