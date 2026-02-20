---
phase: 04-data-hooks-checkout-wiring
verified: 2026-02-20T15:00:00Z
status: passed
score: 12/12 must-haves verified
re_verification: false
gaps: []
human_verification: []
---

# Phase 4: Data Hooks + Checkout Wiring Verification Report

**Phase Goal:** Screens can fetch Shopify products, collections, and individual products through thin hooks with loading/error state; the checkoutUrl is pre-fetched so checkout can open synchronously without popup-blocking.
**Verified:** 2026-02-20T15:00:00Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth                                                                                                       | Status     | Evidence                                                                                                                  |
|----|-------------------------------------------------------------------------------------------------------------|------------|---------------------------------------------------------------------------------------------------------------------------|
| 1  | useProducts() returns { products, loading, isRefetching, error, refetch } and fetches from Shopify service  | VERIFIED   | hooks/useProducts.ts:48 returns all five fields; imports getProducts and getCollectionByHandle from lib/shopify-client    |
| 2  | useCollections() returns { collections, loading, isRefetching, error, refetch }                             | VERIFIED   | hooks/useCollections.ts:41 returns all five fields; imports getCollections from lib/shopify-client                        |
| 3  | useProduct(handle) returns { product, loading, isRefetching, error, refetch } and re-fetches on handle change | VERIFIED | hooks/useProduct.ts:40; passes [handle] as dep array to useShopifyQuery; useCallback dep is [handle]                      |
| 4  | Calling refetch() clears error to null before re-fetching (optimistic reset)                                | VERIFIED   | hooks/useShopifyQuery.ts:52-55 — refetch() calls setError(null) then increments refetchTrigger                           |
| 5  | loading is true only on initial fetch; isRefetching is true on subsequent refetch() calls                   | VERIFIED   | hooks/useShopifyQuery.ts:63-68 — isFirstLoad = data===null && error===null; gates loading vs isRefetching correctly       |
| 6  | Rapid handle changes do not produce race conditions — stale responses are discarded                         | VERIFIED   | hooks/useShopifyQuery.ts:58, 72, 78, 84 — cancelled flag set in cleanup; all state-setting branches guarded by !cancelled |
| 7  | Screens can import hooks without importing from lib/shopify-client directly                                  | VERIFIED   | grep of app/ and components/ returns zero direct shopify-client imports                                                  |
| 8  | CartContext exposes checkoutUrl: string | null — populated after every cart mutation and on hydration       | VERIFIED   | context/CartContext.tsx:46,82,114,122,178 — state declared and set via updateCartState() in all paths                    |
| 9  | CartContext exposes openCheckout() — calling it opens Shopify checkout                                       | VERIFIED   | context/CartContext.tsx:258-268 — synchronous void function, no async/await                                              |
| 10 | On web, openCheckout() uses window.location.href (same-tab, popup-block-proof)                              | VERIFIED   | context/CartContext.tsx:260-262 — Platform.OS === 'web' branch sets (window as any).location.href                        |
| 11 | On native, openCheckout() uses Linking.openURL with the pre-fetched URL (synchronous from gesture)          | VERIFIED   | context/CartContext.tsx:263-266 — else branch calls Linking.openURL(checkoutUrl)                                         |
| 12 | checkoutUrl is never persisted to AsyncStorage — always re-derived from live cart response                  | VERIFIED   | grep of CartContext.tsx shows zero AsyncStorage.setItem calls that include checkoutUrl                                    |

**Score:** 12/12 truths verified

---

### Required Artifacts

| Artifact                      | Expected                                                    | Exists | Lines | Status   | Details                                                                 |
|-------------------------------|-------------------------------------------------------------|--------|-------|----------|-------------------------------------------------------------------------|
| `hooks/useShopifyQuery.ts`    | Generic loading/isRefetching/error/refetch state machine     | yes    | 97    | VERIFIED | Exports useShopifyQuery<T>; imports from 'react' only; no `any` types   |
| `hooks/useProducts.ts`        | Products hook with optional collection filter and limit      | yes    | 49    | VERIFIED | Exports useProducts; imports from useShopifyQuery and shopify-client     |
| `hooks/useCollections.ts`     | Collections hook with optional limit                        | yes    | 42    | VERIFIED | Exports useCollections; imports from useShopifyQuery and shopify-client  |
| `hooks/useProduct.ts`         | Single product hook by handle                               | yes    | 41    | VERIFIED | Exports useProduct; imports from useShopifyQuery and shopify-client      |
| `context/CartContext.tsx`     | Extended CartContext with checkoutUrl + openCheckout        | yes    | 309   | VERIFIED | Exports CartProvider and useCart; all required fields and behaviors wired |

---

### Key Link Verification

| From                          | To                              | Via                                              | Status   | Details                                                                     |
|-------------------------------|---------------------------------|--------------------------------------------------|----------|-----------------------------------------------------------------------------|
| hooks/useProducts.ts          | lib/shopify-client.ts           | import getProducts, getCollectionByHandle         | WIRED    | Line 8: `import { getProducts, getCollectionByHandle } from '../lib/shopify-client'` |
| hooks/useCollections.ts       | lib/shopify-client.ts           | import getCollections                             | WIRED    | Line 7: `import { getCollections } from '../lib/shopify-client'`             |
| hooks/useProduct.ts           | lib/shopify-client.ts           | import getProductByHandle                         | WIRED    | Line 8: `import { getProductByHandle } from '../lib/shopify-client'`         |
| hooks/useProducts.ts          | hooks/useShopifyQuery.ts        | import useShopifyQuery                            | WIRED    | Line 7: `import { useShopifyQuery } from './useShopifyQuery'`                |
| hooks/useCollections.ts       | hooks/useShopifyQuery.ts        | import useShopifyQuery                            | WIRED    | Line 6: `import { useShopifyQuery } from './useShopifyQuery'`                |
| hooks/useProduct.ts           | hooks/useShopifyQuery.ts        | import useShopifyQuery                            | WIRED    | Line 6: `import { useShopifyQuery } from './useShopifyQuery'`                |
| context/CartContext.tsx        | ShopifyCart.checkoutUrl         | updateCartState() calls setCheckoutUrl(newCart.checkoutUrl) | WIRED | Line 158: `setCheckoutUrl(newCart.checkoutUrl)` inside updateCartState()   |
| context/CartContext.tsx        | Platform.OS                     | openCheckout() branch                             | WIRED    | Line 260: `if (Platform.OS === 'web')`                                       |
| context/CartContext.tsx        | Linking.openURL                 | native branch of openCheckout()                  | WIRED    | Line 264: `Linking.openURL(checkoutUrl)`                                     |

---

### Requirements Coverage

| Requirement | Source Plan   | Description                                                                          | Status    | Evidence                                                                                          |
|-------------|---------------|--------------------------------------------------------------------------------------|-----------|---------------------------------------------------------------------------------------------------|
| SHOP-08     | 04-01, 04-02  | Checkout initiates by opening Shopify's cart.checkoutUrl in browser (web: window.location, native: Linking.openURL) | SATISFIED | CartContext.tsx openCheckout() branches on Platform.OS — web uses window.location.href, native uses Linking.openURL; checkoutUrl pre-fetched from every cart mutation response |

No orphaned requirements found: REQUIREMENTS.md traceability table maps only SHOP-08 to Phase 4, and both plans claim SHOP-08.

---

### Anti-Patterns Found

None. No TODO/FIXME/HACK comments, no placeholder returns (return null / return {} / return []), no empty handlers, no console.log-only implementations found in any of the five files verified.

Note: `console.error` is present in CartContext.tsx line 265 inside the Linking.openURL error catch — this is a legitimate error log for the native URL-open failure path, not a stub.

---

### TypeScript Compilation

`npx tsc --noEmit` exits 0 with zero errors across all hook files and CartContext.tsx.

---

### Commit Verification

All documented commits exist in git history:

| Commit   | Message                                                               |
|----------|-----------------------------------------------------------------------|
| b027b67  | feat(04-01): create useShopifyQuery base hook with loading/isRefetching/error state machine |
| ea2c3f4  | feat(04-01): create useProducts, useCollections, useProduct public hooks |
| 7c456e1  | feat(04-02): extend CartContext with checkoutUrl state and openCheckout action |

---

### Rollback Parity Analysis

All bare `setCart()` calls in CartContext.tsx are correctly paired with `setCheckoutUrl()`:

- Lines 129, 139 — null paths in hydration error handling: `setCart(null)` paired with `setCheckoutUrl(null)` on adjacent line.
- Lines 157, 158 — inside `updateCartState()` itself: `setCart(newCart)` then `setCheckoutUrl(newCart.checkoutUrl)` (this IS the update helper).
- Lines 183-184 — addToCart rollback: `setCart(previousCart)` paired with `setCheckoutUrl(previousCart?.checkoutUrl ?? null)`.
- Lines 203-204 — removeFromCart rollback: same pattern.
- Lines 229-230 — updateQuantity rollback: same pattern.
- Lines 243-244 — clearCart: `setCart(null)` paired with `setCheckoutUrl(null)`.

No bare `setCart(newCart)` calls exist that bypass `updateCartState()`. Rollback parity is correct throughout.

---

### Human Verification Required

None. All goal behaviors are verifiable programmatically from the source code.

---

### Summary

Phase 4 goal is fully achieved. The four hooks (`useShopifyQuery`, `useProducts`, `useCollections`, `useProduct`) implement the correct abstraction layer between screens and the Shopify service layer. The state machine in `useShopifyQuery` correctly distinguishes initial loading from subsequent re-fetching, prevents race conditions via cancelled flags, and clears errors optimistically on refetch. CartContext correctly pre-fetches `checkoutUrl` from every cart mutation response and exposes `openCheckout()` as a synchronous function with platform-correct branching. No screens or components bypass the hook layer to import directly from `lib/shopify-client`. TypeScript compiles clean. SHOP-08 is satisfied.

---

_Verified: 2026-02-20T15:00:00Z_
_Verifier: Claude (gsd-verifier)_
