# Phase 3: CartContext Upgrade - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the mock `CartContext` (local `useReducer` + mock `Product` types) with a real Shopify cart backed by GraphQL mutations (`cartCreate`, `cartLinesAdd`, `cartLinesRemove`, `cartLinesUpdate`). Persist the cart ID and last-known line items in AsyncStorage so the cart survives app restarts, with automatic silent recovery when the persisted cart ID is expired. Favorites state is extracted to a new `FavoritesContext` as part of this phase.

</domain>

<decisions>
## Implementation Decisions

### Favorites handling
- Extract favorites out of `CartContext` into a new `FavoritesContext` (separate context provider)
- `FavoritesContext` is memory-only during this phase — no AsyncStorage persistence (Phase 8 owns that)
- Break the old `addToCart(product: Product)` API intentionally — new signature is `addToCart(variantId: string, quantity?: number)`. Screens built in later phases will use the new API.

### Loading state surface
- Expose **both** a top-level `isLoading` (true when any cart operation is in flight) and per-operation flags: `isAddingToCart`, `isRemovingFromCart`, `isUpdatingQuantity`
- Buttons in consuming screens should be disabled while their relevant loading flag is true (prevents double-taps)
- On app start, while hydrating from AsyncStorage and fetching the stored cart from Shopify: `isLoading: true, cart: null` — screens wait for hydration to complete

### Error handling
- Mutations (`addToCart`, `removeFromCart`, `updateQuantity`) return a `Promise<boolean>` (or throw) so the calling screen can handle errors
- CartContext does **not** expose a persistent error state field — each screen decides how to react to a failure
- No automatic retry — mutations fail immediately on first error; user-initiated retry is the screen's responsibility
- On failure, local cart state rolls back to what it was before the attempted operation (no optimistic updates)

### Expired cart recovery
- When the stored cart ID returns null from Shopify, auto-recover silently: create a new cart, re-add the previous lines — user sees no notification
- Recovery is fully blocking: `isLoading: true` throughout the entire recovery process
- To support recovery, AsyncStorage stores **both** the cart ID and a snapshot of line items (`{ variantId: string, quantity: number }[]`)
- If recovery itself fails (can't create new cart), start fresh: clear AsyncStorage, expose an empty cart, no error surfaced to user

### Claude's Discretion
- AsyncStorage key names for cart ID and line item snapshot
- Exact GraphQL mutation shape and error extraction from Shopify response
- `cartTotal` and `cartCount` calculation — whether derived locally from `cart.lines` or from Shopify cart `cost` field
- Whether to use `expo-secure-store` or `@react-native-async-storage/async-storage` (check what's already installed in Phase 2)

</decisions>

<specifics>
## Specific Ideas

- No specific UI references — this phase is pure infrastructure (context layer)
- The `CartContext` must export: `cartId`, `cart` (ShopifyCart | null), `isLoading`, per-operation flags, and mutation methods — all typed against `types/shopify.ts`

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-cartcontext-upgrade*
*Context gathered: 2026-02-19*
