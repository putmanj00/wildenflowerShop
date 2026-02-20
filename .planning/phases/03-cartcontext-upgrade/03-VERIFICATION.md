---
phase: 03-cartcontext-upgrade
verified: 2026-02-20T00:00:00Z
status: passed
score: 20/20 must-haves verified
re_verification: false
gaps: []
human_verification:
  - test: "Add an item to cart on a real device or simulator, kill the app, reopen it"
    expected: "Cart re-hydrates with the same item still present (cart ID loaded from AsyncStorage, Shopify cart fetched successfully)"
    why_human: "AsyncStorage hydration + live Shopify network call cannot be verified statically"
  - test: "Add items, wait for Shopify cart to expire (10 days by default), reopen app"
    expected: "App silently recreates a new cart from the snapshot — no error shown, items appear restored"
    why_human: "Expired-cart recovery path requires a real expired Shopify cart; cannot simulate statically"
  - test: "Attempt addToCart with an invalid variantId (e.g. deleted product)"
    expected: "addToCart returns false; UI shows no crash; cart state unchanged from before the attempt"
    why_human: "Requires a live Shopify API call with a known-bad variant ID to exercise userErrors path"
---

# Phase 3: CartContext Upgrade — Verification Report

**Phase Goal:** Adding items to cart creates and manages a real Shopify cart; the cart ID survives app restarts and expired carts recover gracefully.
**Verified:** 2026-02-20
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|---------|
| 1  | Five named exports exist in lib/shopify-client.ts: createCart, getCart, addCartLines, removeCartLines, updateCartLines | VERIFIED | All five found at lines 197, 218, 228, 254, 278 of lib/shopify-client.ts |
| 2  | Cart mutations and GET_CART_QUERY are exported from lib/shopify-queries.ts | VERIFIED | All five at lines 236, 248, 259, 271, 283; total 10 exports in file |
| 3  | CartLineSnapshot interface is exported from types/shopify.ts | VERIFIED | Lines 112-115 of types/shopify.ts |
| 4  | CartUserError interface is exported from types/shopify.ts | VERIFIED | Lines 119-123 of types/shopify.ts |
| 5  | All cart service functions are typed — no `any` types | VERIFIED | All functions use ShopifyCart, CartLineSnapshot, CartUserError generics; no `any` found |
| 6  | FavoritesContext.tsx exists, exports FavoritesProvider and useFavorites | VERIFIED | Lines 29, 51 of context/FavoritesContext.tsx |
| 7  | useFavorites returns favorites (string[]), toggleFavorite, isFavorite | VERIFIED | FavoritesContextType interface at lines 14-21; all three exposed in provider value |
| 8  | FavoritesProvider wraps CartProvider in app/_layout.tsx (inside CartProvider) | VERIFIED | Lines 85-104 of app/_layout.tsx; `<CartProvider key={retryKey}><FavoritesProvider>...` |
| 9  | key={retryKey} pattern preserved on CartProvider | VERIFIED | Line 85: `<CartProvider key={retryKey}>` |
| 10 | favorites state is memory-only — no AsyncStorage in FavoritesContext | VERIFIED | No AsyncStorage import in context/FavoritesContext.tsx |
| 11 | CartContext exports cartId, cart, isLoading, isAddingToCart, isRemovingFromCart, isUpdatingQuantity, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal | VERIFIED | CartContextType interface lines 27-44; all exposed in provider value lines 237-251 |
| 12 | addToCart(variantId, quantity?) calls cartLinesAdd or cartCreate, returns Promise<boolean> | VERIFIED | Lines 145-171 of CartContext.tsx; branches on cartId presence; returns true/false |
| 13 | removeFromCart(lineId) calls cartLinesRemove with CartLine.id, returns Promise<boolean> | VERIFIED | Lines 173-190; calls removeCartLines(cartId, [lineId]) |
| 14 | updateQuantity(lineId, quantity) routes quantity<=0 to removeCartLines, else cartLinesUpdate | VERIFIED | Lines 192-215; if (quantity <= 0) removeCartLines else updateCartLines |
| 15 | On app start with no stored cart ID, CartContext exposes isLoading: false, cart: null immediately | VERIFIED | Lines 92-96: `if (!storedId) { if (!cancelled) setIsLoading(false); return; }` |
| 16 | On app start with a valid stored cart ID, CartContext re-hydrates from Shopify before setting isLoading: false | VERIFIED | Lines 102-109; getCart called, cart set before finally block sets isLoading false |
| 17 | On app start with expired cart ID (Shopify returns null), CartContext silently creates new cart from snapshot | VERIFIED | Lines 110-127; null branch calls createCart(snapshot), persists, sets new cart |
| 18 | If recovery fails, CartContext clears AsyncStorage and exposes empty cart — no error surfaced | VERIFIED | Lines 119-126; catch block calls multiRemove, sets cartId/cart to null, no throw |
| 19 | CartContext does NOT manage favorites | VERIFIED | No toggleFavorite, isFavorite, or favorites state anywhere in CartContext.tsx |
| 20 | cartTotal from cart.cost.subtotalAmount; cartCount from cart.totalQuantity | VERIFIED | Lines 230-233; exact derivation as specified |

**Score:** 20/20 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `types/shopify.ts` | CartLineSnapshot and CartUserError types | VERIFIED | Both exported; substantive (typed fields); referenced by shopify-client.ts |
| `lib/shopify-queries.ts` | CART_CREATE_MUTATION, CART_LINES_ADD_MUTATION, CART_LINES_REMOVE_MUTATION, CART_LINES_UPDATE_MUTATION, GET_CART_QUERY | VERIFIED | All five present at lines 236-290; 293 total lines; substantive GraphQL strings with CART_LINES_FRAGMENT |
| `lib/shopify-client.ts` | createCart, getCart, addCartLines, removeCartLines, updateCartLines | VERIFIED | All five at lines 197-294; 10 total export async functions; no `any` types |
| `context/FavoritesContext.tsx` | FavoritesProvider and useFavorites exports | VERIFIED | 57 lines; substantive; imported and wired in app/_layout.tsx |
| `app/_layout.tsx` | FavoritesProvider import and nesting | VERIFIED | Import at line 35; JSX at lines 86-103 |
| `context/CartContext.tsx` | CartProvider and useCart, Shopify-backed, AsyncStorage-persisted | VERIFIED | 265 lines (exceeds 150 min); only two exports; fully substantive implementation |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| lib/shopify-client.ts | lib/shopify-queries.ts | Named imports of cart mutation strings | VERIFIED | Lines 24-28: CART_CREATE_MUTATION, CART_LINES_ADD_MUTATION, CART_LINES_REMOVE_MUTATION, CART_LINES_UPDATE_MUTATION, GET_CART_QUERY |
| lib/shopify-client.ts | types/shopify.ts | ShopifyCart, CartLineSnapshot, CartUserError type imports | VERIFIED | Lines 12-14: `import type { ..., ShopifyCart, CartLineSnapshot, CartUserError }` |
| lib/shopify-client.ts | shopifyFetch (internal) | Direct calls with generics | VERIFIED | Lines 198, 219, 232, 258, 282; shopifyFetch not exported (private) |
| app/_layout.tsx | context/FavoritesContext.tsx | import FavoritesProvider | VERIFIED | Line 35: `import { FavoritesProvider } from '../context/FavoritesContext'` |
| context/FavoritesContext.tsx | React | createContext, useState, useContext | VERIFIED | Line 10: `import React, { createContext, useContext, useState, ReactNode }` |
| context/CartContext.tsx | lib/shopify-client.ts | import createCart, getCart, addCartLines, removeCartLines, updateCartLines | VERIFIED | Lines 12-18: all five imported |
| context/CartContext.tsx | @react-native-async-storage/async-storage | AsyncStorage.getItem / setItem / multiRemove | VERIFIED | Line 10: import; usage at lines 64-65, 88-89, 121, 220 |
| context/CartContext.tsx | types/shopify.ts | ShopifyCart, CartLineSnapshot types | VERIFIED | Line 11: `import type { ShopifyCart, CartLineSnapshot }` |
| app/(tabs)/index.tsx | context/FavoritesContext.tsx | useFavorites() instead of old useCart() favorites | VERIFIED | Line 21: `import { useFavorites }` — no CartContext favorites refs |
| components/ProductGrid.tsx | context/FavoritesContext.tsx | useFavorites() instead of old useCart() favorites | VERIFIED | Line 14: `import { useFavorites }` — no CartContext favorites refs |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| SHOP-06 | 03-01, 03-02, 03-03 | Cart created and managed via Shopify cart mutations (create, addLines, updateLines, removeLines) | SATISFIED | All four mutation functions exist in shopify-client.ts; CartContext wires them into addToCart, removeFromCart, updateQuantity; FavoritesContext extraction (03-02) is prerequisite cleanup |
| SHOP-07 | 03-03 | Cart ID persisted to AsyncStorage; app re-hydrates cart on launch; expired carts (null response) handled gracefully with recovery | SATISFIED | STORAGE_CART_ID + STORAGE_CART_SNAPSHOT in AsyncStorage; hydrate() in useEffect; null branch triggers createCart(snapshot) recovery |

Both requirement IDs from PLAN frontmatter accounted for. No orphaned requirements detected (REQUIREMENTS.md maps SHOP-06 and SHOP-07 to Phase 3).

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| lib/shopify-client.ts | 46, 54 | `console.warn` for placeholder env var values | Info | Development-time warning only; expected behavior; does not affect correctness |

No TODO/FIXME/PLACEHOLDER comments. No return null stubs. No empty implementations. No old Product-based API remnants. No useReducer or mock data in CartContext. Old `toggleFavorite`/`isFavorite` correctly absent from CartContext; correctly present in FavoritesContext consumers.

---

### Human Verification Required

Three scenarios require a live device or simulator to verify:

**1. Cart persistence across restarts**

**Test:** Add one or more items to cart using a product detail screen, kill the app completely, reopen it.
**Expected:** Cart re-hydrates with the same items visible in the cart tab. The cartCount badge on the tab bar reflects the correct item count.
**Why human:** AsyncStorage hydration runs via useEffect at startup; the live Shopify network call to getCart cannot be simulated statically. Requires real environment variables and a live Shopify store.

**2. Expired cart silent recovery**

**Test:** Add items to cart, then force-expire the cart on Shopify (or wait the 10-day TTL), reopen the app.
**Expected:** No error is shown to the user. The cart appears to contain the previous items (recreated via createCart(snapshot)). The new cart ID is stored in AsyncStorage.
**Why human:** Requires a real expired Shopify cart. The code path exists and is substantive, but cannot be exercised without a live expired cart ID.

**3. Mutation failure rollback**

**Test:** With network intercepted or using a known-invalid variantId, attempt addToCart.
**Expected:** addToCart returns false; cart state is identical to before the attempt; no crash; screen can display an error from the boolean return value.
**Why human:** Requires live Shopify API to generate a userErrors response. The rollback code (save previousCart, restore on catch) is substantive and correct, but the path cannot be triggered without a real API error.

---

### Gaps Summary

No gaps. All 20 must-have truths are verified by direct file inspection. All six required artifacts exist, are substantive, and are correctly wired. Both SHOP-06 and SHOP-07 are satisfied. Three items are flagged for human verification (live Shopify behavior) but these do not block the phase — the implementation is architecturally complete and correct.

---

_Verified: 2026-02-20_
_Verifier: Claude (gsd-verifier)_
