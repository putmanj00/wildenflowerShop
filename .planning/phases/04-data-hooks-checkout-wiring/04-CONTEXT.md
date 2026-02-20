# Phase 4: Data Hooks + Checkout Wiring - Context

**Gathered:** 2026-02-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Three thin data hooks (`useProducts`, `useCollections`, `useProduct`) that wrap the Shopify service layer with uniform loading/error state. Plus checkout URL wiring: `checkoutUrl` is pre-fetched and stored in CartContext so checkout can open synchronously on both web (`window.location.href`) and native (`Linking.openURL`). Screens never call the service layer directly.

</domain>

<decisions>
## Implementation Decisions

### Hook options interface
- `useProducts(options?)` accepts `{ collection?: string, limit?: number }` — filter by collection handle, optional limit with a sensible default
- `useProduct(handle: string)` — handle only, no ID alternative
- `useCollections()` — Claude's discretion on whether to support options (keep consistent with `useProducts`)

### Checkout URL pre-fetching
- `checkoutUrl` is fetched after every cart mutation (add, remove, update quantity)
- `checkoutUrl` lives in CartContext — it's part of cart state, co-located with the cart ID
- On app launch: always re-fetch from Shopify (never persisted to AsyncStorage — URLs can expire)
- Checkout button is **disabled** while `checkoutUrl` is null or loading — no async fallback on tap

### Refresh & re-fetch behavior
- Hooks fetch once on mount; no automatic re-fetch on screen focus
- All three hooks expose `refetch()` in their return value (for pull-to-refresh wiring): `{ ..., refetch }`
- No in-memory caching between mounts — always fetch fresh on mount
- `useProduct(handle)` re-fetches when `handle` changes (standard `useEffect` dependency)

### Error & loading conventions
- `error` field type: `string | null` — screens render it directly
- `loading: boolean` covers initial load; `isRefetching: boolean` covers background refetch (distinct)
- Return shape: `{ products/collections/product, loading, isRefetching, error, refetch }`
- Screens own their loading/error UI — hooks just expose the state booleans
- `error` clears to `null` when `refetch()` is called (optimistic reset)

### Claude's Discretion
- `useCollections()` options shape (keep consistent with `useProducts` pattern)
- Default limit value for `useProducts` and `useCollections`
- Exact TypeScript generic typing on the hooks
- Whether to use a shared `useShopifyQuery` base hook internally

</decisions>

<specifics>
## Specific Ideas

- Checkout button disabled state should feel intentional (not broken) — likely a subtle loading indicator near the button while `checkoutUrl` is being fetched after a cart mutation
- The `isRefetching` distinction allows the browse screen to show a lightweight pull-to-refresh spinner rather than a full blank loading state

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-data-hooks-checkout-wiring*
*Context gathered: 2026-02-20*
