---
phase: 03-cartcontext-upgrade
plan: "01"
subsystem: shopify-service-layer
tags: [shopify, cart, graphql, typescript, service-layer]
dependency_graph:
  requires: []
  provides: [cart-service-functions, cart-types]
  affects: [context/CartContext.tsx]
tech_stack:
  added: []
  patterns: [shopify-fetch-wrapper, user-errors-check, null-returns-for-expired-resources]
key_files:
  created: []
  modified:
    - types/shopify.ts
    - lib/shopify-queries.ts
    - lib/shopify-client.ts
decisions:
  - "CartLineSnapshot stores only variantId+quantity — full ShopifyCart too large and stale for AsyncStorage"
  - "getCart returns null for expired carts (not ShopifyError) — null is the Shopify API contract for missing carts"
  - "CART_LINES_FRAGMENT is private (not exported) — embedded via template literal interpolation in each query/mutation"
  - "Cart service functions throw ShopifyError on userErrors — HTTP 200 mutations can still contain errors"
  - "shopifyFetch remains private — five named cart service functions are the only public API surface"
metrics:
  duration: "~2 minutes"
  completed: "2026-02-20"
  tasks: 3
  files: 3
---

# Phase 3 Plan 1: Shopify Cart Service Layer Summary

Cart service layer added — five typed async functions bridge raw Shopify cart GraphQL to CartContext with zero `any` types and explicit userErrors handling.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add CartLineSnapshot and CartUserError types | 2fcd801 | types/shopify.ts |
| 2 | Add cart mutations and GET_CART_QUERY | e9406dd | lib/shopify-queries.ts |
| 3 | Add cart service functions | b08c27d | lib/shopify-client.ts |

## What Was Built

### types/shopify.ts
Two new exported interfaces appended after `ShopifyPaginatedResult`:

- `CartLineSnapshot` — minimal `{ variantId, quantity }` snapshot for AsyncStorage expired-cart recovery. Intentionally excludes full cart data (too large, immediately stale after cart creation).
- `CartUserError` — Shopify mutation user error shape `{ code, field, message }`. Required because Shopify cart mutations return HTTP 200 even when errors occur; callers must check `userErrors` explicitly.

### lib/shopify-queries.ts
Private `CART_LINES_FRAGMENT` and five exported query/mutation strings:

- `CART_CREATE_MUTATION` — creates a new cart, optionally pre-populated with lines
- `CART_LINES_ADD_MUTATION` — adds lines to an existing cart
- `CART_LINES_REMOVE_MUTATION` — removes lines by CartLine.id (not variantId)
- `CART_LINES_UPDATE_MUTATION` — updates quantities; callers must not pass quantity 0 (use remove instead)
- `GET_CART_QUERY` — fetches current cart state; returns `null` when cart is expired/not found

Fragment uses `lines(first: 100)` upper bound — required because remove/update operations need CartLine.id values that only come from fetching the full lines list.

### lib/shopify-client.ts
Five new exported async service functions following the existing pattern:

- `createCart(lines?)` — creates cart, throws ShopifyError on userErrors
- `getCart(cartId)` — returns `ShopifyCart | null`; null signals expired cart to CartContext
- `addCartLines(cartId, lines)` — throws ShopifyError on userErrors
- `removeCartLines(cartId, lineIds)` — takes CartLine.id array (gid://shopify/CartLine/...), throws on userErrors
- `updateCartLines(cartId, lines)` — takes `{ id, quantity }` array, throws on userErrors

Imports updated: `ShopifyCart`, `CartLineSnapshot`, `CartUserError` added to types import; five cart query strings added to queries import. `shopifyFetch` remains private.

## Verification Results

- `npx tsc --noEmit` — zero errors after each task
- `grep -c "export" lib/shopify-queries.ts` → 10 (5 existing + 5 new)
- `grep -c "export async function" lib/shopify-client.ts` → 10 (5 existing + 5 new)
- `grep "CartLineSnapshot\|CartUserError" types/shopify.ts` — both defined and exported

## Deviations from Plan

None — plan executed exactly as written.

## Decisions Made

1. `CartLineSnapshot` stores only `variantId` + `quantity` — the full `ShopifyCart` is too large for AsyncStorage and is immediately stale; the snapshot is the minimum needed to recreate cart lines on recovery.

2. `getCart` returns `null` rather than throwing — Shopify's API returns `{ cart: null }` (HTTP 200) for expired or unknown cart IDs. This is the documented contract, not an error condition. CartContext will detect null and trigger recovery.

3. `CART_LINES_FRAGMENT` is not exported — it is a private implementation detail embedded via template literal interpolation. Each mutation/query is self-contained when sent over the wire.

4. All four mutating functions check `userErrors` and throw `ShopifyError` — Shopify cart mutations return HTTP 200 even when the operation fails; userErrors must be checked explicitly rather than relying on HTTP status.

## Self-Check: PASSED

All files verified on disk:
- FOUND: types/shopify.ts
- FOUND: lib/shopify-queries.ts
- FOUND: lib/shopify-client.ts

All commits verified in git log:
- FOUND: 2fcd801 (Task 1 — CartLineSnapshot/CartUserError types)
- FOUND: e9406dd (Task 2 — cart mutations and GET_CART_QUERY)
- FOUND: b08c27d (Task 3 — cart service functions)
