# Architecture Patterns: Shopify Integration

**Domain:** React Native Expo e-commerce with Shopify Storefront API
**Researched:** 2026-02-19
**Overall confidence:** HIGH — based on direct codebase inspection of both wildenflowerShop and the working shopSite reference implementation

---

## Context

This is a brownfield migration. The wildenflowerShop app has a working Expo Router structure, React Context cart, and mock-data product types. The shopSite repo provides a proven, working Shopify Storefront API integration (graphql queries, cart mutations, TypeScript types). The goal is to port the Shopify layer into the Expo app without breaking the existing architecture.

The mandate is **Expo Web first**, native second. All architectural decisions must support both platforms.

---

## Existing Architecture (Current State)

```
app/_layout.tsx                  <- Root: CartProvider, fonts, Stack navigator
app/(tabs)/                      <- Tab screens: Home, Browse, Favorites, Cart, Profile
app/product/[id].tsx             <- Product detail (stub)
app/checkout.tsx                 <- Checkout (stub)
context/CartContext.tsx          <- Global state: useReducer + React Context
types/index.ts                   <- Local types: Product, CartItem, Maker, etc.
data/mock-data.ts                <- Static mock products, makers, blog
constants/theme.ts               <- Design tokens (DO NOT CHANGE)
components/                      <- UI-only presentational components
```

The current `CartContext.tsx` uses local `Product` types, has no async operations, and holds no `cartId`. The current `types/index.ts` `Product` type is flat (price as `number`, images as `string[]`) — incompatible with Shopify's nested GraphQL shape.

---

## Target Architecture (Post-Migration)

```
lib/
  shopify-client.ts              <- Shopify API client (ported from shopSite)
  shopify-queries.ts             <- GraphQL queries + mutations (ported directly)
  shopify-helpers.ts             <- getProducts, getProductByHandle, formatMoney, etc.

types/
  index.ts                       <- Keep non-Shopify types (Maker, BlogPost, FAQ, Category, BrandPillar)
  shopify.ts                     <- NEW: ShopifyProduct, ShopifyCart, ShopifyCartLine, etc.

context/
  CartContext.tsx                <- UPGRADED: async mutations, cartId, Shopify-backed cart
  AuthContext.tsx                <- NEW: customer access token, login/logout

hooks/
  useProducts.ts                 <- useEffect wrapper for product list queries
  useProduct.ts                  <- Single product by handle
  useCollections.ts              <- Collection query hook
  useAuth.ts                     <- Customer auth helpers

app/
  _layout.tsx                    <- Add AuthProvider around CartProvider
  (tabs)/index.tsx               <- Replace mock-data imports with useProducts hook
  (tabs)/browse.tsx              <- Replace mock-data with useProducts + filter
  (tabs)/cart.tsx                <- Read from upgraded CartContext
  product/[id].tsx               <- Implement: useProduct(handle), addToCart with variantId
  checkout.tsx                   <- Linking.openURL(cart.checkoutUrl)
  (auth)/
    login.tsx                    <- NEW: Customer login screen
    register.tsx                 <- NEW: Customer register screen
```

---

## Question-by-Question Answers

### Q1: Porting the Shopify Layer from Next.js to React Native

**Verdict: Port is nearly direct. Two changes required.**

The `@shopify/storefront-api-client` package uses the Fetch API under the hood and works in React Native. The `createStorefrontApiClient()` call is identical.

**Changes from shopSite `lib/shopify.ts`:**

| shopSite (Next.js) | Expo (React Native) |
|--------------------|---------------------|
| `process.env.SHOPIFY_STORE_DOMAIN \|\| process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | `process.env.EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN` |
| `process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN \|\| process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` | `process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` |
| Module-level singleton (`let shopifyClient`) | Same pattern works fine |

**Why:** Expo uses the `EXPO_PUBLIC_` prefix for client-side environment variables (equivalent to Next.js's `NEXT_PUBLIC_`). Private (server-only) env vars are not applicable here — Storefront API tokens are always public (read-only, scoped to storefront only).

**Files to port verbatim (with env var rename only):**
- `lib/shopify.ts` -> `lib/shopify-client.ts` (rename to avoid collision with Shopify's own package name)
- `lib/shopify-queries.ts` -> `lib/shopify-queries.ts` (zero changes needed)
- `lib/shopify-helpers.ts` -> `lib/shopify-helpers.ts` (zero changes needed)

**Confidence: HIGH** — The `@shopify/storefront-api-client` package has no Node.js-only dependencies. The GraphQL queries are pure strings. The helper functions are pure TypeScript with no Next.js-specific imports.

---

### Q2: CartContext — Replace with Zustand or Upgrade In-Place?

**Verdict: Upgrade CartContext in-place. Do not introduce Zustand.**

**Rationale:**

The existing `CartContext.tsx` is already wired into `app/_layout.tsx` as `<CartProvider>`. Every screen and component that needs cart access uses `useCart()`. This is a stable, working integration point.

Zustand's `persist` middleware in shopSite uses `localStorage` under the hood (via the default storage adapter). On React Native, Zustand persist requires explicitly setting `AsyncStorage` as the storage adapter — it is not automatic. This adds a dependency and a configuration step with no benefit over the current Context approach.

React Context + useReducer is the correct pattern for the Wildenflower app because:
1. Cart state is a single global store — no performance concern at this scale
2. The existing reducer structure maps cleanly to async cart actions
3. No additional bundle size or dependency
4. Expo Web compatibility is guaranteed (Context works everywhere)

**What the upgrade looks like:**

Current `CartAction` type adds async actions alongside existing synchronous ones:

```typescript
// context/CartContext.tsx (upgraded shape)

interface CartState {
  cart: ShopifyCart | null;   // replaces items: CartItem[]
  cartId: string | null;      // persisted to AsyncStorage
  favorites: string[];        // product IDs, keep as-is
  isLoading: boolean;         // NEW: async operations in flight
  error: string | null;       // NEW: surface API errors
}

type CartAction =
  | { type: 'SET_CART'; cart: ShopifyCart }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_FAVORITE'; productId: string };

// Async operations become methods on the context value (not dispatch actions)
interface CartContextType {
  cart: ShopifyCart | null;
  favorites: string[];
  isLoading: boolean;
  error: string | null;
  // Async actions (call Shopify mutations, then dispatch SET_CART)
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  removeFromCart: (lineId: string) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  // Favorites (still sync, client-only)
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  // Computed
  cartTotal: number;
  cartCount: number;
  checkoutUrl: string | null;
}
```

The key insight: `ADD_TO_CART` becomes `addToCart(variantId)` — an async function that calls Shopify mutations and then dispatches `SET_CART` with the result. The reducer stays synchronous (handles state transitions only), while the Provider's methods handle async Shopify calls.

**Confidence: HIGH** — This is the standard React Context + async side effects pattern.

---

### Q3: ShopifyProduct Types vs Existing types/index.ts

**Verdict: Parallel coexistence with a mapping layer (adapter pattern).**

The existing `types/index.ts` `Product` type and the ShopifyProduct type are structurally incompatible:

| Field | Local `Product` | `ShopifyProduct` |
|-------|----------------|-----------------|
| `price` | `number` (e.g., `29.99`) | `priceRange.minVariantPrice: { amount: string, currencyCode: string }` |
| `images` | `string[]` (URIs) | `images.edges[].node: { url, altText, width, height }` |
| `name` | `string` | `title` (field name differs) |
| `maker` | embedded `Maker` object | `vendor` (string only) |
| `story` | custom field | Not in Shopify — requires metafields |
| `materials` | `string[]` | Not in Shopify — requires metafields |

**Recommended approach:**

1. Add `types/shopify.ts` — direct port of `shopSite/types/shopify.ts` (verbatim copy, no changes needed).

2. Keep `types/index.ts` for non-Shopify types: `Maker`, `BlogPost`, `FAQItem`, `Category`, `BrandPillar`. These have no Shopify equivalent and remain useful.

3. Add a `normalizeProduct()` helper that maps `ShopifyProduct` to a flat display-ready shape. Components should not need to know GraphQL edge/node structure.

```typescript
// lib/shopify-helpers.ts (addition to ported file)

export interface DisplayProduct {
  id: string;
  handle: string;
  title: string;
  price: string;            // formatted: "$29.99"
  priceAmount: number;      // raw number for sorting/comparison
  images: string[];         // just the URLs
  description: string;
  vendor: string;           // the maker's name (Shopify vendor field)
  tags: string[];
  productType: string;
  availableForSale: boolean;
  firstVariantId: string;   // for addToCart calls
}

export function normalizeProduct(p: ShopifyProduct): DisplayProduct {
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    price: formatMoney(p.priceRange.minVariantPrice),
    priceAmount: parseFloat(p.priceRange.minVariantPrice.amount),
    images: p.images.edges.map(e => e.node.url),
    description: p.description,
    vendor: p.vendor,
    tags: p.tags,
    productType: p.productType,
    availableForSale: p.availableForSale,
    firstVariantId: p.variants.edges[0]?.node.id ?? '',
  };
}
```

**Component migration:** `ProductCard` and `ProductGrid` props change from `product: Product` to `product: DisplayProduct`. The field changes are mechanical: `.name` becomes `.title`, `.price` is now a formatted string (remove the existing price formatting logic from the component).

**Maker data:** Shopify's `vendor` field is a plain string. There is no Shopify-native maker profile (bio, avatar, location). For v1, use `vendor` as the display name and match against `Maker` profiles in `data/mock-data.ts` by vendor name. True maker profiles via Shopify metafields are a v2 concern.

**Confidence: HIGH** — Based on direct inspection of both type files.

---

### Q4: Where Should Shopify API Calls Live?

**Verdict: Dedicated service layer (lib/) + thin custom hooks (hooks/). Never in screens.**

```
Shopify Storefront API (GraphQL / HTTPS)
         |
SERVICE LAYER (lib/)
  shopify-client.ts    -- createStorefrontApiClient, shopifyFetch
  shopify-queries.ts   -- All query/mutation strings
  shopify-helpers.ts   -- getProducts, getProductByHandle, normalizeProduct, formatMoney
         |
         +---------------------------+------------------+
         |                          |                  |
HOOKS (hooks/)              CartContext           AuthContext
  useProducts.ts             (context/)            (context/)
  useProduct.ts              cartId ->             accessToken ->
  useCollections.ts          AsyncStorage          SecureStore
         |                          |                  |
SCREEN LAYER (app/)
  (tabs)/index.tsx        -- useProducts()
  (tabs)/browse.tsx       -- useProducts({ query, sort })
  (tabs)/cart.tsx         -- useCart()
  (tabs)/favorites.tsx    -- useCart() (favorites[])
  (tabs)/profile.tsx      -- useAuth()
  product/[id].tsx        -- useProduct(handle)
  checkout.tsx            -- useCart() -> cart.checkoutUrl
  (auth)/login.tsx        -- useAuth()
         |
COMPONENT LAYER (components/)
  ProductCard, ProductGrid, BotanicalHeader, MakerBadge, etc.
  -- Pure presentational, props in, callbacks out --
         |
FOUNDATION (constants/, types/)
  theme.ts          -- Design tokens (DO NOT TOUCH)
  types/shopify.ts  -- ShopifyProduct, ShopifyCart, etc.
  types/index.ts    -- Maker, BlogPost, FAQItem, Category
```

**Why not screen-level fetches:** Screens become difficult to test and reuse. Moving between screens does not deduplicate in-flight requests.

**Why not pure context for products:** Product data is read-only and screen-specific (browse has pagination, product detail has a single product). Context is appropriate for shared mutable state (cart, auth). Product fetches are better as local hook state per screen.

**Why not React Query or SWR:** These are excellent libraries but add bundle size. For this data access pattern (simple fetches, no real-time), a custom `useEffect`-based hook is sufficient and introduces no new dependencies. React Query can be added later without changing the service layer if caching becomes a concern.

**Confidence: HIGH** — This is standard layered architecture, matching how shopSite is structured.

---

### Q5: Cart Persistence with AsyncStorage

**Verdict: Persist only the cartId (not the full cart object).**

The Shopify cart lives on Shopify's servers. On app resume, fetch the existing cart by ID. Do not serialize and re-store the full `ShopifyCart` object — it goes stale and bloats storage.

```typescript
// context/CartContext.tsx (Provider implementation pattern)

import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_ID_KEY = 'wildenflower:cartId';

// On mount: restore cartId, then fetch cart from Shopify
useEffect(() => {
  const restoreCart = async () => {
    const storedCartId = await AsyncStorage.getItem(CART_ID_KEY);
    if (storedCartId) {
      const cart = await fetchCartById(storedCartId); // calls GET_CART_QUERY
      if (cart) {
        dispatch({ type: 'SET_CART', cart });
      } else {
        // Cart expired (10 days) or was completed -- clear stored ID
        await AsyncStorage.removeItem(CART_ID_KEY);
      }
    }
  };
  restoreCart();
}, []);

// After any cart mutation: persist the new cartId
const persistCartId = async (cartId: string) => {
  await AsyncStorage.setItem(CART_ID_KEY, cartId);
};
```

`@react-native-async-storage/async-storage` v1.23.1 is already installed in `package.json`. No new dependency needed.

**Shopify cart expiry:** Shopify cart objects expire after 10 days of inactivity. The `fetchCartById` call may return null for an expired cart — handle this by clearing the stored ID and treating it as a fresh session.

**Expo Web:** AsyncStorage on web uses `localStorage` as its backing store transparently. The same code works on both platforms.

**Confidence: HIGH** — AsyncStorage is already a project dependency. Persisting only the ID is the correct approach for any server-side cart.

---

### Q6: Customer Auth Architecture

**Verdict: Use Shopify's classic Customer API (email/password) with SecureStore on native and AsyncStorage on web. Defer OAuth2/PKCE Customer Account API to v2.**

**Two Shopify auth systems exist:**

| System | shopSite approach | Expo approach |
|--------|------------------|---------------|
| Classic Customer API | Email/password -> `customerAccessTokenCreate` | RECOMMENDED for v1 |
| Customer Account API | OAuth2 + PKCE, Next.js cookies | Complex; defer to v2 |

**Why defer OAuth2 (Customer Account API):**
shopSite's auth uses Next.js cookies — a server-side mechanism. In Expo, the equivalent is `expo-auth-session` which handles the OAuth2 PKCE flow, but it requires a registered redirect URL, callback handling, and SecureStore for tokens. `expo-secure-store` is unavailable on web, creating an asymmetric implementation. The classic Customer API avoids all of this.

The classic Customer API (`customerAccessTokenCreate` mutation) works via direct HTTP with no redirect flow:
1. User enters email + password
2. Call `CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION`
3. Receive `{ accessToken, expiresAt }`
4. Store token in `expo-secure-store` (native) or `AsyncStorage` (web fallback)

**Token storage implementation:**

```typescript
// lib/auth-storage.ts

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const AUTH_TOKEN_KEY = 'wildenflower:customerAccessToken';
const AUTH_EXPIRES_KEY = 'wildenflower:customerTokenExpiry';

// SecureStore is not available on Expo Web -- use AsyncStorage as fallback
export async function saveAuthToken(token: string, expiresAt: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    await AsyncStorage.setItem(AUTH_EXPIRES_KEY, expiresAt);
  } else {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    await SecureStore.setItemAsync(AUTH_EXPIRES_KEY, expiresAt);
  }
}

export async function getAuthToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } else {
    return SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  }
}

export async function clearAuthToken(): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_EXPIRES_KEY]);
  } else {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(AUTH_EXPIRES_KEY);
  }
}
```

**Why SecureStore on native:** iOS Keychain / Android Keystore encryption. Auth tokens must not live in plaintext AsyncStorage on native devices.

**Why AsyncStorage fallback on web:** `expo-secure-store` calls native APIs unavailable on web. localStorage (via AsyncStorage) is the standard fallback for Expo Web. This is an accepted tradeoff.

**New dependency needed:** `expo-secure-store` (not currently in `package.json`).

**AuthContext structure:**

```typescript
// context/AuthContext.tsx

interface AuthContextType {
  customer: ShopifyCustomer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
}
```

**GraphQL queries already exist** in `shopSite/lib/shopify-queries.ts` and port verbatim:
- `CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION` — login
- `CUSTOMER_ACCESS_TOKEN_DELETE_MUTATION` — logout
- `CUSTOMER_CREATE_MUTATION` — register
- `GET_CUSTOMER_QUERY` — fetch customer profile

**Confidence: HIGH for Classic API approach. MEDIUM for SecureStore/web fallback pattern** — the `Platform.OS === 'web'` branching is standard Expo Web practice but introduces platform-specific code paths that must be tested on both platforms.

---

### Q7: Data Layer for Expo Web Compatibility

**Verdict: The `@shopify/storefront-api-client` is Fetch-based and works on web. No special handling needed for the API layer. Expo Web concerns are limited to storage and routing.**

**Compatibility matrix:**

| Concern | Native | Web | Notes |
|---------|--------|-----|-------|
| `@shopify/storefront-api-client` | Works | Works | Fetch API available on both |
| `AsyncStorage` | Works | Works (localStorage) | Already installed |
| `expo-secure-store` | Works | DOES NOT WORK | Must use AsyncStorage fallback |
| `Linking.openURL()` for checkout | Works | Works | Expo maps to window.open on web |
| `expo-router` deep links | Works | Works (URL-based on web) | Already configured |
| `react-native-reanimated` v3 | Works | Works | Web support present in v3 |
| `react-native-gesture-handler` | Works | Works (partial) | Scroll gestures work; drag differs |
| `expo-image` v2 | Works | Works | Image caching for Shopify CDN URLs |

**Checkout redirect on web:**

```typescript
// app/checkout.tsx
import { Linking } from 'react-native';

const handleCheckout = async () => {
  const url = cart?.checkoutUrl;
  if (url) {
    await Linking.openURL(url); // opens in browser tab on web; Safari/Chrome on native
  }
};
```

`Linking.openURL` works correctly on both platforms — on web it maps to `window.open` or `window.location.href`.

**Environment variables on web:** Expo Web bundles with Metro. `EXPO_PUBLIC_*` variables are inlined at build time. Use a `.env.local` file locally (never commit):

```
EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
EXPO_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_token
```

**Confidence: HIGH** — Based on Expo SDK 52 patterns and Expo Web's stated feature set.

---

## Complete Component Boundaries

```
+-------------------------------------------------------------+
|  Shopify Storefront API (GraphQL / HTTPS)                   |
+-------------------------------------------------------------+
                         |
+-------------------------------------------------------------+
|  SERVICE LAYER  (lib/)                                      |
|  shopify-client.ts    -- createStorefrontApiClient          |
|  shopify-queries.ts   -- GraphQL strings                    |
|  shopify-helpers.ts   -- getProducts, getProductByHandle,   |
|                           formatMoney, normalizeProduct      |
+-------------------------------------------------------------+
                         |
         +---------------+-----------------+
         |               |                 |
+----------------+ +-----------+   +---------------+
|  HOOKS (hooks/)| |CartContext |   | AuthContext   |
|  useProducts   | | (context/)|   | (context/)    |
|  useProduct    | | cartId -> |   | accessToken-> |
|  useCollections| | AsyncStore|   | SecureStore   |
+----------------+ +-----------+   +---------------+
         |               |                 |
+-------------------------------------------------------------+
|  SCREEN LAYER  (app/)                                       |
|  (tabs)/index.tsx         -- useProducts()                  |
|  (tabs)/browse.tsx        -- useProducts({ query, sort })   |
|  (tabs)/cart.tsx          -- useCart()                      |
|  (tabs)/favorites.tsx     -- useCart() (favorites[])        |
|  (tabs)/profile.tsx       -- useAuth()                      |
|  product/[id].tsx         -- useProduct(handle)             |
|  checkout.tsx             -- useCart() -> cart.checkoutUrl  |
|  (auth)/login.tsx         -- useAuth()                      |
+-------------------------------------------------------------+
                         |
+-------------------------------------------------------------+
|  COMPONENT LAYER  (components/)                             |
|  ProductCard, ProductGrid, BotanicalHeader, MakerBadge,     |
|  CategoryRow, HeroCard, BotanicalDivider, WatercolorWash    |
|  -- Pure presentational, props in, callbacks out --         |
+-------------------------------------------------------------+
                         |
+-------------------------------------------------------------+
|  FOUNDATION  (constants/, types/)                           |
|  theme.ts          -- Design tokens (DO NOT TOUCH)          |
|  types/shopify.ts  -- ShopifyProduct, ShopifyCart, etc.     |
|  types/index.ts    -- Maker, BlogPost, FAQItem, Category    |
+-------------------------------------------------------------+
```

---

## Migration Path: Mock Data to Live Shopify Data

### Phase A: Foundation (do first — everything else is blocked on this)

1. Create `.env.local` with `EXPO_PUBLIC_SHOPIFY_*` variables
2. Create `lib/shopify-client.ts` (port from shopSite, rename env vars only)
3. Create `lib/shopify-queries.ts` (verbatim copy from shopSite)
4. Create `types/shopify.ts` (verbatim copy from shopSite)
5. Create `lib/shopify-helpers.ts` (port from shopSite, add `normalizeProduct` + `DisplayProduct`)
6. Smoke test: call `getProducts()` from a screen, confirm live data returns

### Phase B: Cart Upgrade (depends on Phase A)

7. Upgrade `context/CartContext.tsx`:
   - State: replace `items: CartItem[]` with `cart: ShopifyCart | null` + `cartId: string | null`
   - Add `isLoading`, `error` fields to state
   - Add async `addToCart(variantId)`, `removeFromCart(lineId)`, `updateQuantity(lineId, qty)`
   - Add AsyncStorage persistence of `cartId` on mount (restore) and after mutations
   - Keep `favorites: string[]` and `toggleFavorite` unchanged
8. Update `app/(tabs)/cart.tsx` to render from `cart.lines.edges` instead of `items`
9. Smoke test: cart round-trips (add item, close app, reopen, cartId restores)

### Phase C: Product Screens (depends on Phase A, runs parallel to Phase B)

10. Create `hooks/useProducts.ts` (useEffect + loading/error state)
11. Create `hooks/useProduct.ts` (single product by handle)
12. Update `app/(tabs)/index.tsx` — replace `mock-data` import with `useProducts()`
13. Update `app/(tabs)/browse.tsx` — replace `mock-data` with `useProducts({ query, sortKey })`
14. Implement `app/product/[id].tsx` — `useProduct(handle)`, wire "Add to Cart" to `addToCart(variantId)`
15. Update `ProductCard` component props from `product: Product` to `product: DisplayProduct`

### Phase D: Checkout (depends on Phase B)

16. Implement `app/checkout.tsx` — read `cart.checkoutUrl`, render order summary from `cart.lines.edges`, `Linking.openURL(checkoutUrl)` on confirm

### Phase E: Auth (depends on Phase A — can run parallel to B/C/D)

17. Install `expo-secure-store`
18. Create `lib/auth-storage.ts` (platform-branched SecureStore / AsyncStorage)
19. Create `context/AuthContext.tsx`
20. Add `<AuthProvider>` to `app/_layout.tsx` wrapping `<CartProvider>`
21. Create `app/(auth)/login.tsx` and `app/(auth)/register.tsx`
22. Wire auth token into `app/(tabs)/profile.tsx`

---

## Build Order Implications for Roadmap

| Step | What | Why |
|------|------|-----|
| 1 | Service layer (lib/) | All other work blocked until API calls work |
| 2 | Types (types/shopify.ts) | Cart and hooks TypeScript depends on Shopify types |
| 3 | CartContext upgrade | Cart screens cannot be implemented without live cart |
| 4 | Product hooks | Browse and detail screens need hooks |
| 5 | Home + Browse + Detail screens | All require hooks to exist |
| 6 | Checkout screen | Requires live cart with checkoutUrl |
| 7 | Auth (login/register) | Profile features depend on auth; cart works without auth |
| 8 | Auth-gated features (order history) | Requires auth to be complete |

**Critical path:** `lib/` -> `types/shopify.ts` -> `CartContext` -> product hooks -> screens -> checkout -> auth

**Milestone boundary suggestion:**
- Milestone 1: Service layer + CartContext + product hooks (Phases A + B + C)
- Milestone 2: Full screen implementations + checkout (Phase D)
- Milestone 3: Auth + profile (Phase E)

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Storing full ShopifyCart in AsyncStorage
**What goes wrong:** Serializing the entire `ShopifyCart` object to AsyncStorage on every update
**Why it happens:** Natural to "save state" the way Redux Persist does
**Consequences:** Cart state goes stale (inventory changes, prices change, cart expires). Stored JSON grows large. Deserialization adds startup latency.
**Prevention:** Store only the `cartId` string. Refetch from Shopify on restore.
**Detection:** Cart shows old prices or out-of-stock items after app reopen

### Anti-Pattern 2: API calls in screen components
**What goes wrong:** `useEffect(() => { shopifyFetch(...) }, [])` directly inside screen files
**Why it happens:** Fastest path to getting data on screen
**Consequences:** Duplicates error handling, loading state, abort controller setup across screens. Untestable.
**Prevention:** Put fetches in `hooks/useProducts.ts`. Screens call the hook.
**Detection:** Multiple screens with near-identical fetch useEffect blocks

### Anti-Pattern 3: Passing mock Product objects to addToCart
**What goes wrong:** Calling `addToCart(mockProduct)` with a local `Product` object that has no `variantId`
**Why it happens:** Existing `addToCart` takes a full `Product` — easy to keep using it
**Consequences:** Shopify's `cartLinesAdd` mutation requires a `merchandiseId` (variant GID). Fails silently or throws GraphQL error.
**Prevention:** After Phase A, all `addToCart` calls must pass a Shopify variant ID (`gid://shopify/ProductVariant/...`). The new `addToCart(variantId: string)` signature enforces this at the type level.
**Detection:** TypeScript error if signature changes correctly; runtime GraphQL error if not

### Anti-Pattern 4: Using SecureStore on web without Platform check
**What goes wrong:** Calling `SecureStore.setItemAsync()` in code that runs on Expo Web
**Why it happens:** Copy/paste from native-only example
**Consequences:** `expo-secure-store` throws on web because native Keychain/Keystore APIs are unavailable. Crashes Expo Web build.
**Prevention:** Always use the `lib/auth-storage.ts` abstraction that branches on `Platform.OS === 'web'`.
**Detection:** Web build crashes on login attempt

### Anti-Pattern 5: Hardcoding Next.js env var names
**What goes wrong:** Copying shopSite's env var reading logic verbatim (`process.env.NEXT_PUBLIC_SHOPIFY_*`)
**Why it happens:** Straightforward copy from shopSite reference
**Consequences:** `NEXT_PUBLIC_*` prefixed vars are undefined at Expo runtime — Shopify client initialization throws, all API calls fail
**Prevention:** Rename to `EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN` and `EXPO_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` in `lib/shopify-client.ts`
**Detection:** Shopify client throws "SHOPIFY_STORE_DOMAIN environment variable is required" on startup

---

## Scalability Notes

This architecture is designed for the current scale (single artisan shop, one Shopify store, web-first).

| Concern | At current scale | If scaling |
|---------|-----------------|-----------|
| Product fetching | useEffect + local hook state | Add React Query for cache + background refresh |
| Cart sync | Single device, AsyncStorage cartId | Associate cart with customer on login (`cartBuyerIdentityUpdate` mutation) |
| Auth | Classic Customer API (email/password) | Upgrade to Customer Account API (OAuth2) for SSO and more features |
| Images | Direct Shopify CDN URLs | `expo-image` (already installed) handles caching automatically |
| Pagination | `first: 20` query param | Add cursor-based pagination using `pageInfo.hasNextPage` and `after` cursor |

`expo-image` v2.0.0 is already installed and should be used for all product images. It handles caching and progressive loading for remote URLs (Shopify CDN) out of the box.

---

## Sources

- Direct inspection of `/Users/jamesputman/SRC/wildenflowerShop/context/CartContext.tsx`
- Direct inspection of `/Users/jamesputman/SRC/wildenflowerShop/types/index.ts`
- Direct inspection of `/Users/jamesputman/SRC/wildenflowerShop/package.json`
- Direct inspection of `/Users/jamesputman/SRC/wildenflowerShop/app/_layout.tsx`
- Direct inspection of `/Users/jamesputman/SRC/shopSite/lib/shopify.ts`
- Direct inspection of `/Users/jamesputman/SRC/shopSite/lib/cart-store.ts`
- Direct inspection of `/Users/jamesputman/SRC/shopSite/lib/shopify-queries.ts`
- Direct inspection of `/Users/jamesputman/SRC/shopSite/lib/shopify-helpers.ts`
- Direct inspection of `/Users/jamesputman/SRC/shopSite/types/shopify.ts`
- Direct inspection of `/Users/jamesputman/SRC/shopSite/.env.example`
- `/Users/jamesputman/SRC/wildenflowerShop/.planning/PROJECT.md`
- `/Users/jamesputman/SRC/wildenflowerShop/.planning/codebase/ARCHITECTURE.md`
- `/Users/jamesputman/SRC/wildenflowerShop/.planning/codebase/INTEGRATIONS.md`
