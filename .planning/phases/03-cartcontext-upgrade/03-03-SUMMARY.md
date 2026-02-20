---
phase: 03-cartcontext-upgrade
plan: "03"
subsystem: cart
tags: [shopify, cart, graphql, asyncstorage, react-context, typescript]
dependency_graph:
  requires:
    - phase: 03-01
      provides: five cart service functions (createCart, getCart, addCartLines, removeCartLines, updateCartLines) and CartLineSnapshot/ShopifyCart types
    - phase: 03-02
      provides: FavoritesContext extracted from CartContext — favorites now in useFavorites()
  provides:
    - Shopify-backed CartContext with AsyncStorage hydration and expired-cart recovery
    - addToCart(variantId, quantity?) — new public API (old Product-based API removed)
    - Per-operation loading flags (isAddingToCart, isRemovingFromCart, isUpdatingQuantity)
    - Mutation rollback on failure (no optimistic updates)
    - cartCount and cartTotal derived from live ShopifyCart
  affects:
    - app/(tabs)/cart.tsx (will consume useCart when built in Phase 5)
    - app/product/[id].tsx (will call addToCart when built in Phase 6)
    - app/checkout.tsx (will use cart and checkoutUrl in Phase 7)
tech-stack:
  added: []
  patterns:
    - AsyncStorage hydration with cancellable useEffect (cancelled flag pattern)
    - Silent expired-cart recovery via createCart(snapshot) — no error surfaced to user
    - Rollback pattern — save previousCart before mutation, restore on catch
    - Mutation returns Promise<boolean> — no throw from context layer, screens handle errors
    - isLoading true during hydration AND all in-flight mutations
key-files:
  created: []
  modified:
    - context/CartContext.tsx
    - app/(tabs)/index.tsx
    - components/ProductGrid.tsx
key-decisions:
  - "CartContext rewritten from useReducer/mock to Shopify-backed useState with AsyncStorage persistence"
  - "addToCart(variantId, quantity?) is the new public API — old addToCart(product: Product) removed intentionally"
  - "No persistent error state on CartContext — mutations return boolean; screens own error handling"
  - "No optimistic updates — state updates only after confirmed Shopify response"
  - "updateQuantity routes quantity <= 0 to removeCartLines (avoids Shopify INVALID user error on cartLinesUpdate with 0)"
patterns-established:
  - "cancelled flag pattern: let cancelled = false in useEffect, set true in cleanup — prevents setState after unmount during async hydration"
  - "persistCart helper: always called after every successful mutation to keep AsyncStorage in sync"
  - "buildSnapshot helper: extracts CartLineSnapshot[] from live ShopifyCart for AsyncStorage serialization"
requirements-completed:
  - SHOP-06
  - SHOP-07
duration: ~10min
completed: 2026-02-20
---

# Phase 3 Plan 3: CartContext Rewrite Summary

**Shopify-backed CartContext with AsyncStorage hydration, expired-cart silent recovery, and rollback-on-failure — old useReducer/Product API fully replaced**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-02-20
- **Completed:** 2026-02-20
- **Tasks:** 1 (plus 2 auto-fix deviations)
- **Files modified:** 3

## Accomplishments

- CartContext fully rewritten from mock useReducer to live Shopify cart mutations
- AsyncStorage persistence of cart ID and line snapshot across sessions
- Expired-cart silent recovery: on startup, if stored cart ID returns null from Shopify, CartContext silently calls createCart(snapshot) to rebuild the cart
- Per-operation loading flags (isAddingToCart, isRemovingFromCart, isUpdatingQuantity) plus top-level isLoading
- Mutation failure rollback: all mutations save previousCart and restore on catch (no optimistic state)
- Favorites entirely removed from CartContext — screens updated to use FavoritesContext

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite CartContext with Shopify mutations and AsyncStorage hydration** - (pending commit — see note below)
2. **[Deviation] Fix index.tsx: use useFavorites() instead of useCart() for favorites** - (included in task commit)
3. **[Deviation] Fix ProductGrid.tsx: use useFavorites() instead of useCart() for favorites** - (included in task commit)

**Plan metadata:** (pending commit)

_Note: Bash access was unavailable during execution. Files have been written and are ready for commit. Run: `git add context/CartContext.tsx app/(tabs)/index.tsx components/ProductGrid.tsx && git commit -m "feat(03-03): rewrite CartContext with Shopify mutations and AsyncStorage hydration"`_

## Files Created/Modified

- `context/CartContext.tsx` — Fully rewritten: Shopify-backed, AsyncStorage-persisted, typed against types/shopify.ts, favorites removed. CartProvider and useCart are the only exports.
- `app/(tabs)/index.tsx` — Updated to import `useFavorites` from FavoritesContext instead of `toggleFavorite`/`isFavorite` from useCart (which no longer exist in CartContext).
- `components/ProductGrid.tsx` — Updated to import `useFavorites` from FavoritesContext instead of `isFavorite`/`toggleFavorite` from useCart.

## Decisions Made

- CartContext rewritten from useReducer/mock to Shopify-backed useState with AsyncStorage persistence — this is the core Phase 3 deliverable
- addToCart(variantId, quantity?) is the new public API — old addToCart(product: Product) removed intentionally per plan
- No persistent error state on CartContext — mutations return boolean; screens own error handling
- No optimistic updates — state updates only after confirmed Shopify response
- updateQuantity routes quantity <= 0 to removeCartLines (avoids Shopify INVALID user error on cartLinesUpdate with quantity 0)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Updated app/(tabs)/index.tsx to use useFavorites() instead of useCart()**
- **Found during:** Task 1 (CartContext rewrite)
- **Issue:** After removing toggleFavorite/isFavorite from CartContext, index.tsx still imported them from useCart(). TypeScript would fail compilation.
- **Fix:** Updated import from `useCart` (CartContext) to `useFavorites` (FavoritesContext); updated destructuring to use `useFavorites()`.
- **Files modified:** `app/(tabs)/index.tsx`
- **Verification:** File confirmed updated via Read tool; no CartContext favorites references remain.
- **Committed in:** Task 1 commit (included)

**2. [Rule 2 - Missing Critical] Updated components/ProductGrid.tsx to use useFavorites() instead of useCart()**
- **Found during:** Task 1 (CartContext rewrite — grep of all useCart call sites)
- **Issue:** ProductGrid.tsx used `isFavorite` and `toggleFavorite` from `useCart()` as fallbacks when no `onFavoriteToggle` prop is provided. After the rewrite, those fields no longer exist in CartContextType.
- **Fix:** Updated import from `useCart` (CartContext) to `useFavorites` (FavoritesContext); updated destructuring to use `useFavorites()`.
- **Files modified:** `components/ProductGrid.tsx`
- **Verification:** File confirmed updated via Read tool; no CartContext favorites references remain.
- **Committed in:** Task 1 commit (included)

---

**Total deviations:** 2 auto-fixed (2x Rule 2 — missing critical functionality, call sites using removed API)
**Impact on plan:** Both auto-fixes required for TypeScript compilation and correct app behavior. No scope creep — both files were already known useCart consumers, just not listed in the plan's file manifest.

## Issues Encountered

- Bash terminal access was unavailable during execution, preventing `npx tsc --noEmit` TypeScript verification and git commits from being run. All file changes were applied and verified via Read/Grep tools. TypeScript correctness was verified structurally (types match, imports match, API signatures match).

## User Setup Required

None - no external service configuration required. All changes are code-only.

## Self-Check

**Files written:**
- FOUND: context/CartContext.tsx (rewritten — 265 lines)
- FOUND: app/(tabs)/index.tsx (updated — useFavorites import)
- FOUND: components/ProductGrid.tsx (updated — useFavorites import)

**Key verification checks (via Grep):**
- Old API (`product: Product`, `state: CartState`, `toggleFavorite`, `isFavorite`, `useReducer`) — ABSENT from CartContext: PASSED
- Loading flags (isAddingToCart, isRemovingFromCart, isUpdatingQuantity) — ALL PRESENT: PASSED
- Storage keys (STORAGE_CART_ID, STORAGE_CART_SNAPSHOT) — BOTH DEFINED: PASSED
- Exports — only CartProvider and useCart: PASSED
- Types — ShopifyCart and CartLineSnapshot imported from types/shopify: PASSED
- Service functions — all five (createCart, getCart, addCartLines, removeCartLines, updateCartLines) imported: PASSED
- index.tsx — uses useFavorites() not useCart() for favorites: PASSED
- ProductGrid.tsx — uses useFavorites() not useCart() for favorites: PASSED

**Commits:** Cannot verify — Bash unavailable. Files ready to commit.

## Self-Check: PASSED (structural verification via file tools)

## Next Phase Readiness

- CartContext is ready for Phase 5 (Cart Screen) — useCart() provides cartId, cart, cartCount, cartTotal, removeFromCart, updateQuantity
- CartContext is ready for Phase 6 (Product Detail) — addToCart(variantId, quantity?) API is live
- CartContext is ready for Phase 7 (Checkout) — cart.checkoutUrl is available on ShopifyCart
- Phase 3 complete: CartContext Upgrade (Plans 01, 02, 03 all complete)

---
*Phase: 03-cartcontext-upgrade*
*Completed: 2026-02-20*
