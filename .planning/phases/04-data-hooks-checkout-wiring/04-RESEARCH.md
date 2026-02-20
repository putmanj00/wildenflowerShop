# Phase 4: Data Hooks + Checkout Wiring - Research

**Researched:** 2026-02-20
**Domain:** React hooks (data fetching), React Native Platform API, Linking API, CartContext extension
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Hook options interface:**
- `useProducts(options?)` accepts `{ collection?: string, limit?: number }` — filter by collection handle, optional limit with a sensible default
- `useProduct(handle: string)` — handle only, no ID alternative
- `useCollections()` — Claude's discretion on whether to support options (keep consistent with `useProducts`)

**Checkout URL pre-fetching:**
- `checkoutUrl` is fetched after every cart mutation (add, remove, update quantity)
- `checkoutUrl` lives in CartContext — it's part of cart state, co-located with the cart ID
- On app launch: always re-fetch from Shopify (never persisted to AsyncStorage — URLs can expire)
- Checkout button is **disabled** while `checkoutUrl` is null or loading — no async fallback on tap

**Refresh & re-fetch behavior:**
- Hooks fetch once on mount; no automatic re-fetch on screen focus
- All three hooks expose `refetch()` in their return value (for pull-to-refresh wiring): `{ ..., refetch }`
- No in-memory caching between mounts — always fetch fresh on mount
- `useProduct(handle)` re-fetches when `handle` changes (standard `useEffect` dependency)

**Error & loading conventions:**
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

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SHOP-08 | Checkout initiates by opening Shopify's `cart.checkoutUrl` in browser (web: window.location, native: Linking.openURL) | Platform branching pattern documented; `checkoutUrl` already in CART_LINES_FRAGMENT; CartContext extension approach documented; confirmed `window.location.href` required for popup-block prevention on web |
</phase_requirements>

---

## Summary

This phase introduces three thin data-fetching hooks (`useProducts`, `useCollections`, `useProduct`) and wires up checkout URL pre-fetching into CartContext. The hooks are wrappers around the existing Shopify service layer in `lib/shopify-client.ts` — they add loading/error/refetch state but contain no business logic of their own.

The checkout wiring has one critical cross-platform subtlety: `Linking.openURL` on React Native Web (via `react-native-web`) uses `window.open(url, '_blank', 'noopener')`, which opens Shopify checkout in a **new browser tab** and is subject to popup blockers. The CONTEXT.md decision to use `window.location.href` on web is correct — it navigates the current tab synchronously and cannot be blocked. On native, `Linking.openURL` is the correct API. Both calls must happen synchronously from a user gesture (button tap) using the pre-fetched URL to avoid popup-blocking.

The `checkoutUrl` is already returned by every cart mutation and query in the existing `CART_LINES_FRAGMENT` (the fragment includes `checkoutUrl` on line 2). This means no new Shopify API work is needed — CartContext just needs a `checkoutUrl: string | null` state field that is read from `cart.checkoutUrl` after each mutation and on hydration. The hooks directory is currently empty, giving a clean slate to implement the three hooks.

**Primary recommendation:** Build a shared `useShopifyQuery<T>` base hook that encapsulates the loading/isRefetching/error/refetch state machine, then implement each of the three public hooks as thin wrappers calling the appropriate service function. Wire checkout by extracting `cart.checkoutUrl` inside CartContext wherever `setCart` is called.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.3.1 (installed) | `useState`, `useEffect`, `useCallback` | Already in project; hooks are pure React |
| react-native | 0.76.9 (installed) | `Platform.OS` for platform detection | Already in project; used throughout |
| expo-linking | SDK 52 (installed) | `Linking.openURL` on native | Already in project; Expo standard for opening URLs |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lib/shopify-client.ts | project | `getProducts`, `getCollections`, `getProductByHandle`, `getCollectionByHandle` | Hooks call these; no direct Shopify fetch in hooks |
| types/shopify.ts | project | Return types for hook data | `useProducts` returns `AppProduct[]`, etc. |

### No New Installations Required

All needed libraries are already installed. This phase is pure TypeScript/React — no new `npm install` commands.

---

## Architecture Patterns

### Recommended Project Structure

```
hooks/
├── useShopifyQuery.ts    # Shared base hook (if using base hook approach)
├── useProducts.ts        # useProducts(options?) → { products, loading, isRefetching, error, refetch }
├── useCollections.ts     # useCollections(options?) → { collections, loading, isRefetching, error, refetch }
└── useProduct.ts         # useProduct(handle) → { product, loading, isRefetching, error, refetch }
```

CartContext additions (in `context/CartContext.tsx`):
- New state: `checkoutUrl: string | null`
- New action: `openCheckout()` — reads pre-fetched URL, branches on Platform.OS, opens synchronously

### Pattern 1: Shared Base Hook (`useShopifyQuery`)

**What:** A generic hook that manages the loading/isRefetching/error/refetch state machine for any async Shopify query function. Returns data as typed generic `T | null`.

**When to use:** Recommended — eliminates 15+ lines of identical useState/useEffect boilerplate across three hooks.

**Example:**
```typescript
// hooks/useShopifyQuery.ts
import { useState, useEffect, useCallback } from 'react';

interface UseShopifyQueryResult<T> {
  data: T | null;
  loading: boolean;
  isRefetching: boolean;
  error: string | null;
  refetch: () => void;
}

export function useShopifyQuery<T>(
  queryFn: () => Promise<T>,
  deps: unknown[] = []
): UseShopifyQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = useCallback(() => {
    setError(null);        // optimistic reset per CONTEXT.md
    setRefetchTrigger((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const isFirstLoad = data === null && !error;

    if (isFirstLoad) {
      setLoading(true);
    } else {
      setIsRefetching(true);
    }

    queryFn()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          setError(message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setIsRefetching(false);
        }
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetchTrigger, ...deps]);

  return { data, loading, isRefetching, error, refetch };
}
```

**Note on `isFirstLoad` tracking:** The distinction between `loading` (initial) and `isRefetching` (background) is achieved by checking whether data is null and no error exists on entry. On first mount both are null/false, so `loading=true`. On subsequent refetch calls, data is already populated, so `isRefetching=true` instead.

### Pattern 2: Public Hook Wrappers

**What:** Each public hook calls `useShopifyQuery` with its specific service function, then reshapes the generic `data` into the named return field.

**Example — `useProducts`:**
```typescript
// hooks/useProducts.ts
import { useCallback } from 'react';
import { useShopifyQuery } from './useShopifyQuery';
import { getProducts, getCollectionByHandle } from '../lib/shopify-client';
import type { AppProduct } from '../lib/shopify-mappers';

interface UseProductsOptions {
  collection?: string;   // collection handle filter
  limit?: number;        // defaults to 20 (matches service layer DEFAULT_PAGE_SIZE)
}

interface UseProductsResult {
  products: AppProduct[];
  loading: boolean;
  isRefetching: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProducts(options: UseProductsOptions = {}): UseProductsResult {
  const { collection, limit = 20 } = options;

  const queryFn = useCallback(async () => {
    if (collection) {
      const result = await getCollectionByHandle(collection, { first: limit });
      return result?.products.items ?? [];
    }
    const result = await getProducts({ first: limit });
    return result.items;
  }, [collection, limit]);

  const { data, loading, isRefetching, error, refetch } = useShopifyQuery<AppProduct[]>(
    queryFn,
    [collection, limit]
  );

  return {
    products: data ?? [],
    loading,
    isRefetching,
    error,
    refetch,
  };
}
```

**Example — `useProduct`:**
```typescript
// hooks/useProduct.ts
import { useCallback } from 'react';
import { useShopifyQuery } from './useShopifyQuery';
import { getProductByHandle } from '../lib/shopify-client';
import type { AppProduct } from '../lib/shopify-mappers';

interface UseProductResult {
  product: AppProduct | null;
  loading: boolean;
  isRefetching: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProduct(handle: string): UseProductResult {
  const queryFn = useCallback(
    () => getProductByHandle(handle),
    [handle]
  );

  const { data, loading, isRefetching, error, refetch } = useShopifyQuery<AppProduct | null>(
    queryFn,
    [handle]   // handle change triggers re-fetch per CONTEXT.md
  );

  return { product: data ?? null, loading, isRefetching, error, refetch };
}
```

**Example — `useCollections`:**
```typescript
// hooks/useCollections.ts
import { useCallback } from 'react';
import { useShopifyQuery } from './useShopifyQuery';
import { getCollections } from '../lib/shopify-client';
import type { ShopifyCollection } from '../types/shopify';

interface UseCollectionsOptions {
  limit?: number;
}

interface UseCollectionsResult {
  collections: ShopifyCollection[];
  loading: boolean;
  isRefetching: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCollections(options: UseCollectionsOptions = {}): UseCollectionsResult {
  const { limit = 20 } = options;

  const queryFn = useCallback(
    () => getCollections({ first: limit }).then((r) => r.items),
    [limit]
  );

  const { data, loading, isRefetching, error, refetch } = useShopifyQuery<ShopifyCollection[]>(
    queryFn,
    [limit]
  );

  return {
    collections: data ?? [],
    loading,
    isRefetching,
    error,
    refetch,
  };
}
```

### Pattern 3: CartContext `checkoutUrl` Extension

**What:** Add `checkoutUrl: string | null` state to CartContext. Extract it from `cart.checkoutUrl` wherever `setCart` is called. Add `openCheckout()` action with platform branching.

**Key fact confirmed from source code:** `checkoutUrl` is already in `CART_LINES_FRAGMENT` and therefore already present on every `ShopifyCart` object returned by the service layer. `ShopifyCart.checkoutUrl` is typed as `string` (non-nullable, line 94 of `types/shopify.ts`). CartContext just needs to read it.

**Additions to CartContext:**

```typescript
// New state (in CartProvider body)
const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

// Helper: sync checkoutUrl whenever cart changes
// Called wherever setCart(newCart) is called
function updateCartState(newCart: ShopifyCart) {
  setCart(newCart);
  setCheckoutUrl(newCart.checkoutUrl);
}

// New action added to context value
const openCheckout = (): void => {
  if (!checkoutUrl) return; // button should be disabled, but guard anyway
  if (Platform.OS === 'web') {
    // window.location.href: same-tab navigation, cannot be popup-blocked
    // Linking.openURL on web uses window.open(..., '_blank') which opens new tab
    // and is subject to popup blockers when not directly in a user gesture handler.
    window.location.href = checkoutUrl;
  } else {
    // Native: Linking.openURL opens browser with pre-fetched URL synchronously
    Linking.openURL(checkoutUrl).catch(() => {
      // If native URL open fails, silently no-op (rare edge case)
    });
  }
};
```

**New CartContextType fields:**
```typescript
checkoutUrl: string | null;
isCheckoutLoading: boolean;  // true while initial hydration is loading (checkoutUrl not yet known)
openCheckout: () => void;
```

**Hydration:** On startup, after `getCart(storedId)` returns an existing cart, `setCheckoutUrl(existingCart.checkoutUrl)`. After `createCart(snapshot)` recovery, `setCheckoutUrl(newCart.checkoutUrl)`. The `checkoutUrl` is never persisted to AsyncStorage (per CONTEXT.md locked decision — URLs expire).

**isCheckoutLoading signal for disabled button:** The checkout button should be disabled when `checkoutUrl === null`. The `isLoading` flag already covers the hydration period (it's true until hydration completes). Screens can derive the disabled state as: `disabled={!checkoutUrl || isLoading}`. No separate `isCheckoutLoading` boolean is needed in practice — `isLoading` covers the same window. However, if the planner wants a cleaner API, `isCheckoutLoading` can be added as an alias.

### Pattern 4: Platform Branching for Checkout

**What:** The web-vs-native branch must happen synchronously inside a user gesture (button `onPress`) to avoid popup-blocking. The pre-fetched URL makes this possible.

**Why `window.location.href` not `Linking.openURL` on web:**

Confirmed from `react-native-web` source (version 0.19.13 installed):
```javascript
// react-native-web/src/exports/Linking/index.js
openURL(url, target) {
  if (arguments.length === 1) {
    target = '_blank';   // default: NEW TAB
  }
  window.open(urlToOpen, target, 'noopener');
}
```

`window.open` with `_blank` opens a new tab and is subject to popup blockers when called in async context (even from a button tap that then awaits something). Using `window.location.href` synchronously from the `onPress` handler avoids both concerns.

**Implementation in `openCheckout`:**
```typescript
// This runs synchronously from onPress — no async, no popup risk
const openCheckout = (): void => {
  if (!checkoutUrl) return;
  if (Platform.OS === 'web') {
    window.location.href = checkoutUrl;  // same tab, no popup block
  } else {
    Linking.openURL(checkoutUrl).catch(() => {});  // native browser
  }
};
```

**TypeScript note:** `window` is available in the web bundle but not typed in React Native's `tsconfig`. The `Platform.OS === 'web'` guard is sufficient for runtime safety. For TypeScript, the pattern used elsewhere in this project for web-only APIs is `(window as any).location.href` or narrowing with a type assertion, or simply adding `/// <reference lib="dom" />` if tsconfig allows it. The project uses `tsx` for scripts, so the DOM types may be available in `tsconfig.json`.

### Anti-Patterns to Avoid

- **Calling service functions directly from screens:** Screens must use the hooks. Direct imports of `getProducts` etc. from `lib/shopify-client` in screen files violate the abstraction layer this phase establishes.
- **Persisting `checkoutUrl` to AsyncStorage:** URLs expire; CONTEXT.md locks this as out of scope.
- **Calling `openCheckout` asynchronously:** Any await before the `window.location.href` or `Linking.openURL` call breaks the synchronous-gesture requirement and risks popup blocking.
- **Re-fetching on screen focus:** CONTEXT.md locks "fetch once on mount" — no `useFocusEffect` or navigation listener.
- **Throwing from hooks:** Hooks catch all errors and put them in `error: string | null`. No unhandled rejections bubbling to screens.
- **Using `useShopifyQuery` deps array incorrectly:** The spread deps pattern in useEffect is non-standard and can cause lint warnings. Consider whether to inline the dependency check inside the hook or document the eslint-disable comment.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cross-platform URL opening | Custom platform detection utilities | `Platform.OS` + `window.location.href` + `Linking.openURL` | These are the correct React Native primitives for this; no library needed |
| Loading/error state machine | Ad-hoc booleans in each hook | Shared `useShopifyQuery` base hook | Eliminates duplicated state management across 3 hooks |
| Data caching / SWR | Custom cache Map, TTL logic | Do not build; CONTEXT.md locks "always fetch fresh on mount" | Phase scope deliberately excludes caching |
| React Query / SWR / Apollo | Third-party data fetching libraries | Custom hooks calling existing service layer | Service layer already exists; these libraries would be over-engineering at this scale |

**Key insight:** The service layer from Phase 2 already handles all network concerns (auth headers, error parsing, TypeScript types). Hooks are thin state wrappers only — they should contain no network logic.

---

## Common Pitfalls

### Pitfall 1: Stale Closure in `useShopifyQuery` deps

**What goes wrong:** `queryFn` changes identity on every render if defined inline, causing the useEffect to re-run infinitely.
**Why it happens:** Arrow functions in React render bodies are new references each render.
**How to avoid:** Public hooks must wrap their `queryFn` in `useCallback` with appropriate deps. The base hook receives a stable function reference. OR: the base hook accepts explicit `deps` array and uses a stable inline function pattern.
**Warning signs:** Network tab shows repeated identical API calls in rapid succession.

### Pitfall 2: Race Condition on `useProduct(handle)` Handle Change

**What goes wrong:** User navigates from product A to product B quickly. Request for A resolves after B, overwriting B's data with A's.
**Why it happens:** Two in-flight requests, different completion order.
**How to avoid:** The `cancelled` flag pattern in `useShopifyQuery`'s useEffect cleanup prevents setting state after a stale effect is cleaned up. When `handle` changes, the old effect runs its cleanup (`cancelled = true`) before the new effect starts.
**Warning signs:** Product detail screen briefly shows wrong product data then corrects.

### Pitfall 3: `window` Not Defined on Native

**What goes wrong:** TypeScript or runtime error when `Platform.OS === 'web'` branch is not guarded and `window.location` is accessed on native.
**Why it happens:** `window` is undefined in React Native's JS environment.
**How to avoid:** The `Platform.OS === 'web'` guard is sufficient at runtime. For TypeScript type safety, use a type assertion or check `typeof window !== 'undefined'` as an additional guard if the TypeScript compiler complains.
**Warning signs:** `ReferenceError: window is not defined` crash on iOS/Android.

### Pitfall 4: `checkoutUrl` Missing After Cart Mutation

**What goes wrong:** After `addToCart`, `checkoutUrl` stays null because the mutation response's `cart.checkoutUrl` wasn't extracted.
**Why it happens:** CartContext currently calls `setCart(newCart)` in multiple places; forgetting to also call `setCheckoutUrl(newCart.checkoutUrl)` in even one mutation leaves the URL stale.
**How to avoid:** Create a single `updateCartState(newCart)` helper that calls both `setCart` and `setCheckoutUrl` together. Use it everywhere `setCart` is currently called.
**Warning signs:** Checkout button remains disabled (or stale URL) after adding items to cart.

### Pitfall 5: Hydration Race — `checkoutUrl` Not Set on App Launch

**What goes wrong:** Cart hydrates successfully but `checkoutUrl` stays null because only `cart.id` was extracted.
**Why it happens:** Forgetting to extract `checkoutUrl` from the hydrated cart.
**How to avoid:** In the hydration `useEffect`, after both `getCart` and `createCart` recovery paths, use `updateCartState(existingCart)` instead of bare `setCartId`/`setCart` calls.
**Warning signs:** Checkout button is always disabled until the user performs a cart mutation.

### Pitfall 6: `useCallback` Dep Array Mismatch in Public Hooks

**What goes wrong:** `useProducts({ collection: 'tie-dye', limit: 10 })` refetches on every render even when options haven't changed.
**Why it happens:** Options object is created inline as a literal at the call site, creating a new object reference each render. But since `useProducts` destructures `{ collection, limit }` before passing to `useCallback`, this is avoided.
**How to avoid:** Always destructure options into primitive values before passing to `useCallback`. Never pass an options object directly as a `useCallback` dependency.
**Warning signs:** Network tab shows repeated identical API calls on every render.

---

## Code Examples

### Verified: `checkoutUrl` Already in Cart Fragment

```typescript
// lib/shopify-queries.ts — CART_LINES_FRAGMENT (already in project)
const CART_LINES_FRAGMENT = `
  fragment CartLinesFragment on Cart {
    id
    checkoutUrl   // ← already fetched in every cart mutation and GET_CART_QUERY
    totalQuantity
    lines(first: 100) { ... }
    cost { ... }
  }
`;
```

This means `ShopifyCart.checkoutUrl` is already populated on every mutation response. CartContext only needs to read it.

### Verified: `ShopifyCart` Type Already Includes `checkoutUrl`

```typescript
// types/shopify.ts (already in project)
export interface ShopifyCart {
  id: string;
  checkoutUrl: string;  // ← non-nullable string; always present
  totalQuantity: number;
  lines: { nodes: ShopifyCartLine[] };
  cost: { ... };
}
```

### Verified: `Linking.openURL` Opens New Tab on Web

```javascript
// Source: node_modules/react-native-web/src/exports/Linking/index.js
openURL(url, target) {
  if (arguments.length === 1) {
    target = '_blank';  // hard-coded new tab default
  }
  window.open(urlToOpen, target, 'noopener');
}
```

This confirms: for same-tab navigation on web, use `window.location.href` directly. `Linking.openURL` is correct only for native.

### Verified: `Platform.OS` Pattern (established in project)

```typescript
// Existing usage in app//(tabs)/_layout.tsx and app//_layout.tsx
import { Platform } from 'react-native';
// Platform.OS === 'web' | 'ios' | 'android'
```

### Verified: `useCallback` Prevents queryFn Identity Churn

```typescript
// Correct pattern for stable queryFn reference
const queryFn = useCallback(
  () => getProductByHandle(handle),
  [handle]  // only recreates when handle changes
);
const { data } = useShopifyQuery(queryFn, [handle]);
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Direct service calls from screens | Screens call hooks; hooks call services | Phase 4 (this phase) | Screens are decoupled from Shopify API shape |
| No checkout URL in CartContext | `checkoutUrl` in CartContext state, pre-fetched | Phase 4 (this phase) | Checkout button can open synchronously |
| `window.open('url', '_blank')` | `window.location.href` for web checkout | Phase 4 (this phase) | Same-tab navigation, popup-block-proof |

**What already exists (don't rebuild):**
- `getProducts`, `getCollections`, `getProductByHandle`, `getCollectionByHandle` in `lib/shopify-client.ts` — fully functional
- `checkoutUrl` in `CART_LINES_FRAGMENT` — already fetched on every cart call
- `ShopifyCart.checkoutUrl: string` type — already defined
- `CartProvider` with `setCart` call sites — just need `setCheckoutUrl` added alongside

---

## Open Questions

1. **TypeScript `window.location.href` on native TypeScript target**
   - What we know: `window` is not in React Native's type environment; `platform.OS === 'web'` guard makes it safe at runtime
   - What's unclear: Whether the tsconfig's `lib` setting includes DOM types; if not, TypeScript will error on `window.location.href` even inside a Platform.OS guard
   - Recommendation: Check `tsconfig.json` `lib` field. If DOM types are absent, use `(window as Window & typeof globalThis).location.href` or add a module-level `declare const window: Window & typeof globalThis` in the CartContext file. The planner should add a verification step to confirm TypeScript compiles clean.

2. **Default limit for hooks**
   - What we know: Service layer uses `DEFAULT_PAGE_SIZE = 20`; CONTEXT.md marks default limit as Claude's discretion
   - What's unclear: Nothing — 20 is consistent with the service layer's default
   - Recommendation: Use 20 as the default for both `useProducts` and `useCollections`. Document it as matching `DEFAULT_PAGE_SIZE` in `shopify-client.ts`.

3. **`useCollections` options shape**
   - What we know: CONTEXT.md marks this as Claude's discretion; `getCollections` accepts `{ first, after }`
   - Recommendation: Give `useCollections` the same `{ limit?: number }` options shape as `useProducts` for consistency. Omit `collection` filter (collections are not filtered by other collections). The planner can implement this without further decision.

---

## Sources

### Primary (HIGH confidence)

- Project source: `lib/shopify-client.ts` — confirmed service function signatures (`getProducts`, `getCollections`, `getProductByHandle`, `getCollectionByHandle`)
- Project source: `lib/shopify-queries.ts` — confirmed `checkoutUrl` is in `CART_LINES_FRAGMENT` (line ~201)
- Project source: `types/shopify.ts` — confirmed `ShopifyCart.checkoutUrl: string` (non-nullable)
- Project source: `context/CartContext.tsx` — confirmed mutation structure and all `setCart` call sites
- Installed package source: `node_modules/react-native-web/src/exports/Linking/index.js` — confirmed `openURL` uses `window.open(url, '_blank', 'noopener')` by default

### Secondary (MEDIUM confidence)

- https://github.com/necolas/react-native-web/issues/1544 — Issue thread confirming `Linking.openURL` hard-codes `_blank` (resolved Feb 2021, still present in 0.19.13)
- Shopify community threads — confirmed `window.location.href` is the correct approach for same-tab checkout navigation without popup blocking
- Expo Linking docs: https://docs.expo.dev/versions/latest/sdk/linking/ — confirmed `openURL` is supported on web/Android/iOS/tvOS

### Tertiary (LOW confidence)

- WebSearch results on React hook data-fetching patterns — standard `useEffect` + `useState` + cleanup pattern is well-established; no single authoritative source needed

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries are already installed and used in the project; no new dependencies
- Architecture patterns: HIGH — service layer signatures confirmed from source; CartContext extension straightforward
- `window.location.href` requirement: HIGH — confirmed from react-native-web source code in the project's node_modules
- `checkoutUrl` availability: HIGH — confirmed in CART_LINES_FRAGMENT and ShopifyCart type
- Pitfalls: HIGH — stale closure, race condition, and hydration issues are standard React patterns with well-documented solutions

**Research date:** 2026-02-20
**Valid until:** 2026-03-20 (stable React/RN patterns; Linking.openURL web behavior is unlikely to change)
