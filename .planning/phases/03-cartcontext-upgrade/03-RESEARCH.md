# Phase 3: CartContext Upgrade - Research

**Researched:** 2026-02-19
**Domain:** Shopify Storefront API cart mutations + React Context + AsyncStorage persistence
**Confidence:** HIGH (all critical claims verified against official Shopify docs and existing project code)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- Extract favorites out of `CartContext` into a new `FavoritesContext` (separate context provider)
- `FavoritesContext` is memory-only during this phase — no AsyncStorage persistence (Phase 8 owns that)
- Break the old `addToCart(product: Product)` API intentionally — new signature is `addToCart(variantId: string, quantity?: number)`. Screens built in later phases will use the new API.
- Expose **both** a top-level `isLoading` (true when any cart operation is in flight) and per-operation flags: `isAddingToCart`, `isRemovingFromCart`, `isUpdatingQuantity`
- Buttons in consuming screens should be disabled while their relevant loading flag is true (prevents double-taps)
- On app start, while hydrating from AsyncStorage and fetching the stored cart from Shopify: `isLoading: true, cart: null` — screens wait for hydration to complete
- Mutations return a `Promise<boolean>` (or throw) so the calling screen can handle errors
- CartContext does **not** expose a persistent error state field — each screen decides how to react to a failure
- No automatic retry — mutations fail immediately on first error; user-initiated retry is the screen's responsibility
- On failure, local cart state rolls back to what it was before the attempted operation (no optimistic updates)
- When the stored cart ID returns null from Shopify, auto-recover silently: create a new cart, re-add the previous lines — user sees no notification
- Recovery is fully blocking: `isLoading: true` throughout the entire recovery process
- AsyncStorage stores **both** the cart ID and a snapshot of line items (`{ variantId: string, quantity: number }[]`)
- If recovery itself fails (can't create new cart), start fresh: clear AsyncStorage, expose an empty cart, no error surfaced to user

### Claude's Discretion

- AsyncStorage key names for cart ID and line item snapshot
- Exact GraphQL mutation shape and error extraction from Shopify response
- `cartTotal` and `cartCount` calculation — whether derived locally from `cart.lines` or from Shopify cart `cost` field
- Whether to use `expo-secure-store` or `@react-native-async-storage/async-storage` (check what's already installed in Phase 2)

### Deferred Ideas (OUT OF SCOPE)

- None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SHOP-06 | Cart created and managed via Shopify cart mutations (create, addLines, updateLines, removeLines) | GraphQL mutation signatures verified against official Shopify Storefront API 2026-01 docs; query strings and TypeScript patterns documented in Code Examples section |
| SHOP-07 | Cart ID persisted to AsyncStorage; app re-hydrates cart on launch; expired carts (null response) handled gracefully with recovery | AsyncStorage already installed at v1.23.1 (confirmed in package.json); recovery pattern documented; null-on-expiry behavior confirmed from multiple community sources |
</phase_requirements>

---

## Summary

Phase 3 replaces the mock `CartContext` (local `useReducer` operating on app-domain `Product` types) with a real Shopify cart backed by four GraphQL mutations: `cartCreate`, `cartLinesAdd`, `cartLinesRemove`, and `cartLinesUpdate`. All mutations are verified against the official Shopify Storefront API 2026-01 documentation. The project already has `ShopifyCart`, `ShopifyCartLine`, and `ShopifyMoneyV2` types in `types/shopify.ts` from Phase 2, and the `shopifyFetch` infrastructure in `lib/shopify-client.ts` can be reused directly for cart mutation execution.

The persistence layer uses `@react-native-async-storage/async-storage` at version 1.23.1, which is already installed in the project (confirmed via `package.json`). `expo-secure-store` is NOT installed and should NOT be used — AsyncStorage is the correct choice here since cart IDs are not sensitive credentials. On app start, the context hydrates from AsyncStorage, fetches the stored cart from Shopify, and handles the null-response expiry case by silently recreating the cart from the stored line item snapshot.

Favorites must be extracted into a new `FavoritesContext` that lives alongside `CartContext` in the provider tree. Both providers are wrapped in `_layout.tsx` — `CartProvider` is already there; `FavoritesProvider` will be added as a sibling wrapper. The `FavoritesContext` is memory-only in this phase (no AsyncStorage) — the locked decision is intentional.

**Primary recommendation:** Add cart mutations to `lib/shopify-client.ts` (following the existing pattern), rewrite `CartContext` using `useState` + async mutation functions (not `useReducer`), add `FavoritesContext` as a new file, and update `_layout.tsx` to wrap both providers.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@react-native-async-storage/async-storage` | 1.23.1 | Persist cart ID + line snapshot across restarts | Already installed; Expo SDK 52 pinned version; web-compatible via localStorage bridge |
| `React Context + useState` | React 18.3.1 (in-project) | Cart and favorites state management | Locked decision; useReducer replaced with useState + async functions for async-first mutations |
| Shopify Storefront API 2026-01 | GraphQL | Cart CRUD mutations | Existing API version used in Phase 2; all four cart mutations verified in this version |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lib/shopify-client.ts` (internal) | — | `shopifyFetch` wrapper for mutations | Reuse directly; do NOT re-implement the fetch layer |
| `types/shopify.ts` (internal) | — | `ShopifyCart`, `ShopifyCartLine` types | Already complete from Phase 2; add `CartLineSnapshot` type only |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| AsyncStorage | `expo-secure-store` | SecureStore is for sensitive tokens (passwords, API keys) — not needed for cart IDs; also NOT installed in the project |
| useState + async functions | useReducer | useReducer is synchronous; dispatching before/after async calls requires two dispatch calls + loading flags per mutation; useState with explicit setters is simpler for this pattern |
| Context | Zustand | Locked decision: Context is sufficient at this scale; Zustand would require adding a new dependency |

**Installation:** Nothing to install — all required libraries are already in the project.

---

## Architecture Patterns

### Recommended Project Structure

```
context/
├── CartContext.tsx        # REWRITE: Shopify cart mutations + AsyncStorage hydration
└── FavoritesContext.tsx   # NEW: Memory-only favorites (extracted from CartContext)

lib/
├── shopify-client.ts      # ADD: cartCreate, cartLinesAdd, cartLinesRemove, cartLinesUpdate
└── shopify-queries.ts     # ADD: CART_FRAGMENT + four mutation strings

types/
└── shopify.ts             # ADD: CartLineSnapshot type (already has ShopifyCart)

app/
└── _layout.tsx            # UPDATE: wrap CartProvider with FavoritesProvider
```

### Pattern 1: AsyncStorage Keys

Recommended key names (Claude's Discretion):

```typescript
const STORAGE_KEY_CART_ID = '@wildenflower/cart_id';
const STORAGE_KEY_CART_SNAPSHOT = '@wildenflower/cart_snapshot';
```

Prefix with `@wildenflower/` to namespace the app and avoid key collisions. Store the cart ID and line snapshot as separate keys so each can be read/written independently.

### Pattern 2: CartContext State Shape

```typescript
// Source: CONTEXT.md (locked decisions) + types/shopify.ts (existing)
interface CartContextType {
  // Data
  cartId: string | null;
  cart: ShopifyCart | null;
  // Loading
  isLoading: boolean;
  isAddingToCart: boolean;
  isRemovingFromCart: boolean;
  isUpdatingQuantity: boolean;
  // Mutations — return Promise<boolean> (true = success, false = recoverable failure)
  addToCart: (variantId: string, quantity?: number) => Promise<boolean>;
  removeFromCart: (lineId: string) => Promise<boolean>;
  updateQuantity: (lineId: string, quantity: number) => Promise<boolean>;
  clearCart: () => Promise<void>;
  // Derived
  cartCount: number;
  cartTotal: number;
}
```

Note: `removeFromCart` takes a **line ID** (the cart line `id`, not `variantId`) — the Shopify `cartLinesRemove` mutation takes `lineIds: [ID!]!`.

### Pattern 3: Startup Hydration Sequence

```
app launch
  └─> CartProvider mounts
        └─> useEffect (once)
              ├─> setIsLoading(true)
              ├─> read AsyncStorage: cart_id + cart_snapshot
              ├─> if no cart_id → setIsLoading(false), done
              └─> call Shopify: cart(id: cartId)
                    ├─> cart returned → setCart(cart), setIsLoading(false)
                    └─> null returned (expired) → RECOVERY:
                          ├─> cartCreate (empty)
                          ├─> cartLinesAdd (snapshot lines)
                          ├─> write new cartId + snapshot to AsyncStorage
                          ├─> setCart(newCart), setIsLoading(false)
                          └─> if recovery fails → clearStorage, setCart(null), setIsLoading(false)
```

### Pattern 4: Mutation Rollback Pattern

No optimistic updates — the locked decision requires rolling back on failure:

```typescript
// Before mutation
const previousCart = cart;
const previousCartId = cartId;
// call Shopify mutation
try {
  const newCart = await callShopifyMutation(/* ... */);
  setCart(newCart);
  await persistSnapshot(newCart);
  return true;
} catch {
  // Rollback: restore previous state (no change to displayed cart)
  setCart(previousCart);
  return false;
}
```

### Pattern 5: FavoritesContext (simple)

```typescript
// context/FavoritesContext.tsx
interface FavoritesContextType {
  favorites: string[];           // variantId or productId strings
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}
```

Memory-only. No useReducer required — `useState<string[]>([])` is sufficient.

### Pattern 6: Provider Nesting in _layout.tsx

```tsx
// FavoritesProvider wraps inside CartProvider (or either order — they are independent)
<CartProvider key={retryKey}>
  <FavoritesProvider>
    <Stack ...>
```

### Anti-Patterns to Avoid

- **Optimistic updates:** The locked decision forbids them. Do not update `cart` state before the Shopify mutation confirms.
- **useReducer for async mutations:** Dispatching `SET_LOADING` before and `SET_CART` after each async call leads to race conditions and verbose code. Use `useState` with per-mutation boolean flags.
- **Exposing `shopifyFetch` from `shopify-client.ts`:** Established in Phase 2 that `shopifyFetch` is internal. Add cart service functions to the same file and export only the named functions.
- **Mixing line snapshot with full ShopifyCart in AsyncStorage:** Store only `{ variantId, quantity }[]` in the snapshot, not the full cart object. Full cart objects are stale immediately and too large; the snapshot is used only for recovery re-add.
- **Querying cart with `edges/node` notation:** The existing `ShopifyCart` type uses `lines: { nodes: ShopifyCartLine[] }`. Use `nodes` shorthand in GraphQL queries to match. The Shopify Storefront API confirms `nodes` is valid shorthand for `edges { node }`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Storage I/O | Custom file-based or cookie storage | `@react-native-async-storage/async-storage` | Already installed; handles iOS Keychain file, Android SQLite, and web localStorage automatically |
| Cart ID persistence | Custom MMKV or SecureStore integration | AsyncStorage (already in project) | Cart IDs are not sensitive; SecureStore is not installed and adds complexity |
| GraphQL fetch | New fetch wrapper | Reuse `shopifyFetch` from `lib/shopify-client.ts` | The Phase 2 wrapper handles auth headers, HTTP errors, and GraphQL error extraction already |
| Error normalization | Custom error parsing per mutation | Query `userErrors { code field message }` in every mutation response | Shopify surfaces validation errors in `userErrors`, not HTTP status codes |

**Key insight:** The entire network and auth layer already exists from Phase 2. This phase is about adding four mutation strings and building the async context on top — not infrastructure.

---

## Common Pitfalls

### Pitfall 1: `removeFromCart` takes a line ID, not a variantId

**What goes wrong:** Developer passes the `variantId` (from the `merchandise.id` field) to `cartLinesRemove`, which expects the cart line's own `id` field.
**Why it happens:** The cart has two different IDs in play: the `CartLine.id` (e.g. `gid://shopify/CartLine/1`) and `CartLine.merchandise.id` (the variant). `cartLinesRemove` requires `lineIds: [CartLine.id]`.
**How to avoid:** The `ShopifyCartLine.id` field is the correct input to `cartLinesRemove`. The context's `removeFromCart(lineId: string)` parameter must be the line ID from `cart.lines.nodes[n].id`.
**Warning signs:** Shopify returns a `CART_LINE_NOT_FOUND` or similar `CartUserError` with a `code` field when the wrong ID type is passed.

### Pitfall 2: Cart query returns null on expiry — not an error

**What goes wrong:** Developer checks for `userErrors` or `errors` to detect an expired cart but sees an empty `userErrors: []`. The expired cart is signaled by `cart: null` in the query response data itself.
**Why it happens:** Shopify returns `data: { cart: null }` with HTTP 200 when the cart ID is unknown or expired. This is a valid successful GraphQL response, not an error.
**How to avoid:** After calling `cart(id: storedId)`, always check `if (data.cart === null)` to trigger recovery — don't rely solely on `userErrors` or `errors`.
**Warning signs:** The pre-Phase 3 concern in STATE.md: "Shopify cart expiry null-response shape needs validation with a real test cart (documented as null but unconfirmed)" — this concern is resolved; community reports and Shopify docs confirm null is the expected response.

### Pitfall 3: `cartLinesUpdate` quantity: 0 does not auto-remove

**What goes wrong:** Calling `cartLinesUpdate` with `quantity: 0` expecting the line to be removed. It may return a user error instead.
**Why it happens:** `CartLineUpdateInput.quantity` is typed as `Int` with no explicit zero behavior documented. The standard contract for removing is `cartLinesRemove`.
**How to avoid:** If `updateQuantity` is called with quantity `<= 0`, call `cartLinesRemove` instead of `cartLinesUpdate`. Handle this in the context layer so consuming screens never need to know.
**Warning signs:** A `CartUserError` with `code: INVALID` when `quantity: 0` is passed to `cartLinesUpdate`.

### Pitfall 4: Expo Metro inlines `EXPO_PUBLIC_` env vars at bundle time

**What goes wrong:** Using bracket notation (`process.env['EXPO_PUBLIC_X']`) returns `undefined` at runtime in Expo apps.
**Why it happens:** Metro bundler inlines `EXPO_PUBLIC_` vars using static string replacement — only static dot notation (`process.env.EXPO_PUBLIC_X`) is detected.
**How to avoid:** This is already established in `lib/shopify-client.ts` from Phase 2. Cart mutations reuse the same `shopifyFetch` function, so no new env var access is needed.
**Warning signs:** `undefined` access token at runtime producing HTTP 401 errors.

### Pitfall 5: AsyncStorage on web uses localStorage (synchronous key removal race)

**What goes wrong:** On web, concurrent AsyncStorage calls (rare but possible during fast retry) can race.
**Why it happens:** The web implementation bridges to `localStorage` which is synchronous, but the AsyncStorage API is async — concurrent awaits are fine in practice but error paths should still use try/catch.
**How to avoid:** Always wrap AsyncStorage calls in try/catch. A failed write on web should be logged but should not crash the app.
**Warning signs:** Silent storage failures on web only, cart not persisting across refreshes.

### Pitfall 6: cart lines pagination — default `first` argument required

**What goes wrong:** Querying `cart { lines { nodes { ... } } }` without a `first: N` argument fails or returns an empty list.
**Why it happens:** Cart lines is a paginated connection that requires the `first` argument, like all Shopify Storefront API connections.
**How to avoid:** Always query `lines(first: 100)` in cart operations. 100 is a safe upper bound for a shopping cart; no real user has 100+ cart lines.
**Warning signs:** Empty `cart.lines.nodes` despite successful mutation response.

---

## Code Examples

Verified patterns from official Shopify Storefront API 2026-01 documentation.

### Cart Fragment (reusable)

```typescript
// Add to lib/shopify-queries.ts
// nodes shorthand matches existing ShopifyCart type (lines: { nodes: ShopifyCartLine[] })
const CART_LINES_FRAGMENT = `
  fragment CartLinesFragment on Cart {
    id
    checkoutUrl
    totalQuantity
    lines(first: 100) {
      nodes {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            price { amount currencyCode }
            product {
              id
              title
              handle
              featuredImage { url altText width height }
            }
            selectedOptions { name value }
          }
        }
        cost {
          totalAmount { amount currencyCode }
        }
      }
    }
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
      totalTaxAmount { amount currencyCode }
    }
  }
`;
```

### cartCreate Mutation

```typescript
// Source: https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart/manage
// Add to lib/shopify-queries.ts
export const CART_CREATE_MUTATION = `
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart { ...CartLinesFragment }
      userErrors { code field message }
    }
  }
  ${CART_LINES_FRAGMENT}
`;
// Variables: { lines: [{ merchandiseId: "gid://...", quantity: 1 }] }
// Empty cart: { lines: [] } — omit lines entirely or pass empty array
```

### cartLinesAdd Mutation

```typescript
// Source: https://shopify.dev/docs/api/storefront/2026-01/mutations/cartLinesAdd
// Add to lib/shopify-queries.ts
export const CART_LINES_ADD_MUTATION = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ...CartLinesFragment }
      userErrors { code field message }
    }
  }
  ${CART_LINES_FRAGMENT}
`;
// Variables: { cartId: "gid://shopify/Cart/...", lines: [{ merchandiseId: "gid://...", quantity: 1 }] }
// CartLineInput: { merchandiseId: ID!, quantity: Int (default: 1), attributes?: [{ key, value }] }
```

### cartLinesRemove Mutation

```typescript
// Source: https://shopify.dev/docs/api/storefront/2026-01/mutations/cartLinesRemove
// Add to lib/shopify-queries.ts
export const CART_LINES_REMOVE_MUTATION = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ...CartLinesFragment }
      userErrors { code field message }
    }
  }
  ${CART_LINES_FRAGMENT}
`;
// Variables: { cartId: "gid://shopify/Cart/...", lineIds: ["gid://shopify/CartLine/1"] }
// lineIds: the CartLine.id values (NOT merchandiseId / variantId)
```

### cartLinesUpdate Mutation

```typescript
// Source: https://shopify.dev/docs/api/storefront/2026-01/mutations/cartLinesUpdate
// Add to lib/shopify-queries.ts
export const CART_LINES_UPDATE_MUTATION = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ...CartLinesFragment }
      userErrors { code field message }
    }
  }
  ${CART_LINES_FRAGMENT}
`;
// Variables: { cartId: "gid://...", lines: [{ id: "gid://shopify/CartLine/1", quantity: 3 }] }
// CartLineUpdateInput: { id: ID!, quantity?: Int, merchandiseId?: ID, sellingPlanId?: ID }
```

### Cart Query (for hydration)

```typescript
// Source: https://shopify.dev/docs/api/storefront/2026-01/queries/cart
// Add to lib/shopify-queries.ts
export const GET_CART_QUERY = `
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartLinesFragment
    }
  }
  ${CART_LINES_FRAGMENT}
`;
// Returns: { cart: ShopifyCart } or { cart: null } if expired/not found
// null means expired — trigger recovery, not an error
```

### Service Functions in shopify-client.ts

```typescript
// Add to lib/shopify-client.ts — follow existing pattern (typed, named exports only)
import { ShopifyCart } from '../types/shopify';

export type CartLineSnapshot = { variantId: string; quantity: number };

export async function createCart(lines: CartLineSnapshot[] = []): Promise<ShopifyCart> {
  const data = await shopifyFetch<{ cartCreate: { cart: ShopifyCart; userErrors: CartUserError[] } }>(
    CART_CREATE_MUTATION,
    { lines: lines.map(l => ({ merchandiseId: l.variantId, quantity: l.quantity })) }
  );
  if (data.cartCreate.userErrors.length > 0) {
    throw new ShopifyError(data.cartCreate.userErrors.map(e => e.message).join('; '), 200);
  }
  return data.cartCreate.cart;
}

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  const data = await shopifyFetch<{ cart: ShopifyCart | null }>(GET_CART_QUERY, { cartId });
  return data.cart; // null = expired
}

export async function addCartLines(cartId: string, lines: CartLineSnapshot[]): Promise<ShopifyCart> { /* ... */ }
export async function removeCartLines(cartId: string, lineIds: string[]): Promise<ShopifyCart> { /* ... */ }
export async function updateCartLines(cartId: string, lines: { id: string; quantity: number }[]): Promise<ShopifyCart> { /* ... */ }
```

### CartLineSnapshot Type

```typescript
// Add to types/shopify.ts
// Minimal snapshot stored in AsyncStorage for expired-cart recovery
export interface CartLineSnapshot {
  variantId: string;   // gid://shopify/ProductVariant/...
  quantity: number;
}
```

### AsyncStorage Keys and Hydration Skeleton

```typescript
// context/CartContext.tsx — hydration useEffect skeleton
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CartLineSnapshot } from '../types/shopify';

const STORAGE_CART_ID = '@wildenflower/cart_id';
const STORAGE_CART_SNAPSHOT = '@wildenflower/cart_snapshot';

// On mount:
useEffect(() => {
  let cancelled = false;
  async function hydrate() {
    setIsLoading(true);
    try {
      const [storedId, storedSnapshotRaw] = await Promise.all([
        AsyncStorage.getItem(STORAGE_CART_ID),
        AsyncStorage.getItem(STORAGE_CART_SNAPSHOT),
      ]);
      if (!storedId) { setIsLoading(false); return; }
      const snapshot: CartLineSnapshot[] = storedSnapshotRaw ? JSON.parse(storedSnapshotRaw) : [];
      const existingCart = await getCart(storedId);
      if (cancelled) return;
      if (existingCart) {
        setCartId(existingCart.id);
        setCart(existingCart);
      } else {
        // RECOVERY: cart expired — recreate silently
        try {
          const newCart = await createCart(snapshot);
          await AsyncStorage.setItem(STORAGE_CART_ID, newCart.id);
          // snapshot stays same
          if (!cancelled) { setCartId(newCart.id); setCart(newCart); }
        } catch {
          // Recovery failed — start fresh
          await AsyncStorage.multiRemove([STORAGE_CART_ID, STORAGE_CART_SNAPSHOT]);
          if (!cancelled) { setCartId(null); setCart(null); }
        }
      }
    } catch {
      // AsyncStorage read failed — start fresh, don't crash
    } finally {
      if (!cancelled) setIsLoading(false);
    }
  }
  hydrate();
  return () => { cancelled = true; };
}, []);
```

### Persisting Snapshot After Mutation

```typescript
// Helper: call after every successful mutation
async function persistCart(newCart: ShopifyCart): Promise<void> {
  const snapshot: CartLineSnapshot[] = newCart.lines.nodes.map(line => ({
    variantId: line.merchandise.id,
    quantity: line.quantity,
  }));
  await Promise.all([
    AsyncStorage.setItem(STORAGE_CART_ID, newCart.id),
    AsyncStorage.setItem(STORAGE_CART_SNAPSHOT, JSON.stringify(snapshot)),
  ]);
  setCartId(newCart.id);
  setCart(newCart);
}
```

### cartTotal and cartCount (Claude's Discretion)

Use the Shopify `cart.cost.subtotalAmount` field for `cartTotal` (accurate, reflects discounts) and `cart.totalQuantity` for `cartCount` (provided directly by Shopify):

```typescript
const cartTotal = cart?.cost?.subtotalAmount
  ? parseFloat(cart.cost.subtotalAmount.amount)
  : 0;

const cartCount = cart?.totalQuantity ?? 0;
```

This is preferred over local derivation because Shopify applies discount codes and variant pricing server-side; local derivation from line `cost.totalAmount` would be less accurate.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Shopify `checkoutCreate` mutation (Checkout API) | Shopify `cartCreate` mutation (Cart API) | ~2021; Cart API stable by 2022 | Cart API is the current standard for headless; Checkout API is deprecated for new builds |
| `edges { node { ... } }` notation | `nodes { ... }` shorthand | Supported since 2021, widely documented | Shorter queries; already matches `ShopifyCart` type in this project |
| `useReducer` for cart | `useState` + async functions | N/A (pattern choice) | Async-first design with per-mutation loading flags is cleaner than dispatching LOADING_START/LOADING_END actions |

**Deprecated/outdated:**
- `shopify-buy` JS SDK: deprecated for Storefront API usage in React Native; raw `fetch` is the established pattern in this project (from Phase 2)
- `@shopify/storefront-api-client`: not used in this project — React Native URL compatibility issues documented in `shopify-client.ts`

---

## Open Questions

1. **Exact null shape when cart expires**
   - What we know: Community reports and Shopify docs confirm `data: { cart: null }` is returned for unknown/expired cart IDs. `userErrors` is empty. HTTP status is 200.
   - What's unclear: Whether `null` is also returned when a cart has been converted to a completed order (post-checkout) — this should also be treated as expired. The behavior is most likely the same null response.
   - Recommendation: The STATE.md concern ("needs validation with a real test cart") should be resolved during task execution by verifying with the live store. The recovery code should handle null regardless of the reason.

2. **Cart expiry window**
   - What we know: Community sources cite 10–30 days depending on store settings. Shopify has been extending this (Winter 2025 notes mention longer expiry). The project has no server-side session so cart expiry is the main edge case.
   - What's unclear: The exact expiry for the specific store (`bgh9hd-rq.myshopify.com`).
   - Recommendation: The recovery code handles any expiry gracefully — the exact duration is irrelevant for implementation.

3. **AsyncStorage v1.23.1 on web**
   - What we know: Version 1.23.1 is pinned by Expo SDK 52. The Expo docs list web as a supported platform. Community reports mention some web issues with earlier versions; Expo's documentation confirms web support.
   - What's unclear: Whether there are any residual web-specific issues at 1.23.1 that would affect this app.
   - Recommendation: Wrap all AsyncStorage calls in try/catch. If web storage fails silently, the app starts with an empty cart — acceptable fallback.

---

## Sources

### Primary (HIGH confidence)
- `https://shopify.dev/docs/api/storefront/2026-01/mutations/cartCreate` — cartCreate input types and return shape
- `https://shopify.dev/docs/api/storefront/2026-01/mutations/cartLinesAdd` — cartLinesAdd signature; CartLineInput fields (merchandiseId, quantity, attributes)
- `https://shopify.dev/docs/api/storefront/2026-01/mutations/cartLinesRemove` — cartLinesRemove signature; lineIds parameter
- `https://shopify.dev/docs/api/storefront/2026-01/mutations/cartLinesUpdate` — cartLinesUpdate signature; CartLineUpdateInput fields
- `https://shopify.dev/docs/api/storefront/2026-01/input-objects/CartLineInput` — confirmed: `merchandiseId: ID!`, `quantity: Int (default 1)`, `attributes`, `sellingPlanId`
- `https://shopify.dev/docs/api/storefront/2026-01/input-objects/CartLineUpdateInput` — confirmed: `id: ID!`, `quantity: Int`, `merchandiseId: ID`
- `https://shopify.dev/docs/api/storefront/2026-01/objects/CartUserError` — confirmed: `code`, `field`, `message` fields
- `https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart/manage` — full cartCreate and cartLinesUpdate GraphQL examples; cart query example
- `package.json` (in-project) — confirmed: `@react-native-async-storage/async-storage` at `1.23.1`; `expo-secure-store` NOT present
- `types/shopify.ts` (in-project) — `ShopifyCart`, `ShopifyCartLine` already complete; `nodes` shorthand already used
- `lib/shopify-client.ts` (in-project) — `shopifyFetch` pattern; `ShopifyError` class; service function conventions to follow
- `context/CartContext.tsx` (in-project) — current mock implementation to be replaced
- `app/_layout.tsx` (in-project) — `CartProvider` wrapping location; `FavoritesProvider` insertion point

### Secondary (MEDIUM confidence)
- `https://docs.expo.dev/versions/latest/sdk/async-storage/` — AsyncStorage listed as web-supported in Expo SDK; no known breaking issues documented
- Shopify developer community forums confirming `cart: null` response for expired/unknown cart IDs (multiple independent reports)
- Shopify Storefront API docs confirming `nodes` is valid shorthand for `edges { node }` across all connections

### Tertiary (LOW confidence)
- Community reports on cart expiry window (10–30 days range) — exact value for this store is unknown; implementation is expiry-duration-agnostic

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries confirmed in `package.json`; no new dependencies needed
- GraphQL mutations: HIGH — all four mutation signatures verified against Shopify Storefront API 2026-01 official docs
- Architecture patterns: HIGH — follows established Phase 2 conventions; context shape locked by CONTEXT.md decisions
- AsyncStorage: HIGH — library present and web-supported; usage pattern is straightforward
- Pitfalls: HIGH — pitfalls derived from official API types and documented community issues
- Expired cart null response: MEDIUM — behavior documented by community but not spelled out in official API docs; confirmed by multiple independent sources

**Research date:** 2026-02-19
**Valid until:** 2026-03-19 (30 days; Shopify Cart API is stable; no breaking changes expected in 2026-01 version)
