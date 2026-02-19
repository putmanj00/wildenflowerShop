# Project Research Summary

**Project:** Wildenflower — Artisan E-Commerce Mobile App
**Domain:** React Native Expo + Shopify Storefront API, brownfield migration
**Researched:** 2026-02-19
**Confidence:** HIGH

## Executive Summary

Wildenflower is a brownfield Expo SDK 52 project — not a greenfield build. A complete, styled app skeleton exists with mock data, a working React Context cart, tab navigation, and most presentational components already built. The core work is a Shopify integration port: migrating from static mock data to live Shopify Storefront API calls, upgrading CartContext to perform real cart mutations, and wiring all screens to live data. The reference implementation lives in a sibling repo (`shopSite`, a Next.js Shopify storefront) whose `lib/` layer ports to Expo with only environment variable renaming — the `@shopify/storefront-api-client` package is pure JavaScript with no native dependencies.

The recommended approach is a layered migration in dependency order: service layer first (Shopify client + GraphQL queries + types), then CartContext upgrade, then product hooks, then screen implementations, then checkout, then customer auth. This ordering is non-negotiable — the Shopify service layer is a hard prerequisite for every downstream piece. The architecture follows a strict separation: GraphQL calls belong in `lib/`, async state in custom hooks and Context, and components remain purely presentational. Do not introduce Zustand or React Query — the existing Context pattern and custom `useEffect` hooks are sufficient for this scale.

The biggest risks are web-platform-specific. This app targets Expo Web first, and `react-native-web` has documented gaps: shadow props do not render on web, `expo-secure-store` is unavailable on web, `SafeAreaView` from `react-native` (not `react-native-safe-area-context`) provides no protection on mobile browsers, and horizontal scroll carousels are inaccessible to desktop mouse users without explicit navigation controls. These are not surprises — they are known, fixable, and must be addressed systematically in each phase rather than patched at the end. Cart ID expiration (Shopify carts expire after 10 days) and the async nature of AsyncStorage hydration are the two cart-specific risks that must be designed in from the start.

---

## Key Findings

### Recommended Stack

The stack is already installed and correct. Expo SDK 52 + React Native 0.76.9 + Expo Router 4.0 + React Native Reanimated 3.16 + expo-image 2.0 — no changes needed to the core runtime. The only package to add before any Shopify work begins is `@shopify/storefront-api-client` (pure JS, no native modules). Customer auth requires four additional packages: `expo-auth-session`, `expo-crypto`, `expo-web-browser`, and `expo-secure-store`. Everything else is already present.

The environment variable strategy requires care: Expo does not support `NEXT_PUBLIC_*` or bare `process.env.*` in the same way Next.js does. Variables must be prefixed `EXPO_PUBLIC_` in a `.env.local` file to be inlined by Metro at build time. This is the single most common porting error from Next.js to Expo and will cause silent `undefined` failures if missed.

**Core technologies:**
- `@shopify/storefront-api-client` ^1.0.9: Shopify GraphQL client — exact match to shopSite's working implementation, pure JS, compatible with Expo Web
- `expo-auth-session` + `expo-crypto` + `expo-web-browser`: customer OAuth2/PKCE auth — official Expo libraries for the exact flow Shopify Customer Account API requires
- `expo-secure-store`: secure token storage on native — paired with AsyncStorage fallback on web via a `Platform.OS` abstraction layer
- `@react-native-async-storage/async-storage` (already installed): cart ID and favorites persistence — no encryption needed for these non-sensitive values
- React Context (existing CartContext): retain and upgrade in-place — Zustand would add a dependency without benefit at this scale

See `.planning/research/STACK.md` for complete package list, alternatives considered, and Expo Web compatibility matrix.

### Expected Features

Wildenflower's feature strategy is deliberately non-maximizing. The brand rules out entire categories of standard commerce features: no countdown timers, no review stars, no algorithmic recommendations, no push notification harassment, no upsell overlays. Every feature decision must pass the "unhurried and enchanted" test.

**Must have (table stakes):**
- Live Shopify product data on Home, Browse, and Product Detail — mock data is not a shippable state
- Variant selection on Product Detail — Shopify cart mutations require a `variantId`, not a product ID; this is non-negotiable
- Add to Cart via Shopify `cartLinesAdd` mutation — current CartContext is mock-only and must be upgraded
- Cart persistence via AsyncStorage cart ID — users expect their cart to survive closing the app
- Favorites persistence via AsyncStorage — favorites are currently in-memory only and lost on restart
- Checkout redirect via `Linking.openURL(cart.checkoutUrl)` — Shopify handles payment; no custom checkout form needed
- Image carousel on Product Detail — users need to see multiple product photos
- Category filter chips on Browse wired to Shopify collections
- Pagination on Browse (Shopify `pageInfo.hasNextPage` cursor pattern)
- Empty and loading states on every data-fetching screen

**Should have (differentiators):**
- "The Story Behind This Piece" on Product Detail — transforms product into artifact; uses Shopify product metafield
- Maker-first attribution on all product surfaces — maker name visible on cards, tappable to maker profile
- Botanical animation language — fern unfurl accordion (FAQ), watercolor bloom reveals; Reanimated throughout
- ProgressVine checkout step indicator — vine with botanical nodes transforms form into journey
- Favorites "By Maker" grouping view — reinforces maker identity, groups saved items by artist
- Blog feed with static mock data — editorial content; no Shopify Blog API needed in v1

**Defer (v2+):**
- Customer authentication (sign in / order history) — app is fully usable as guest; auth is additive
- Blog CMS / Shopify Blog API integration — explicitly out of scope per PROJECT.md
- Push notifications — explicitly deferred to v2 per PROJECT.md
- Analytics — explicitly deferred to v2 per PROJECT.md
- Shopify metaobjects for rich maker profiles — local maker data mapping is sufficient for v1
- Masonry grid on Favorites — uniform 2-column grid is acceptable fallback for v1

See `.planning/research/FEATURES.md` for complete feature tables, dependency graph, and MVP checklist per screen.

### Architecture Approach

The target architecture has four strict layers that must not be collapsed: (1) a service layer in `lib/` containing the Shopify client, all GraphQL query strings, and helper functions ported from shopSite; (2) state management via upgraded CartContext and a new AuthContext, both in `context/`; (3) thin custom hooks in `hooks/` that wrap service layer calls with loading/error state; (4) screens in `app/` that call hooks and pass data down to components. Components in `components/` remain purely presentational — no API calls, no context access beyond what's passed as props. This matches the shopSite's structure and makes the migration mechanical rather than architectural.

The CartContext upgrade is the most consequential structural change. The current `CartState` uses a local `Product[]` shape; the upgraded version replaces this with `ShopifyCart | null` plus a `cartId: string | null`. Async cart operations (`addToCart`, `removeFromCart`, `updateQuantity`) become methods on the context value that call Shopify mutations and dispatch `SET_CART` on success. The reducer stays synchronous. AsyncStorage persistence of the cart ID happens in a mount-time `useEffect` (restore) and after every mutation (persist).

**Major components:**
1. `lib/shopify-client.ts` + `lib/shopify-queries.ts` + `lib/shopify-helpers.ts` — service layer ported from shopSite; all API calls and GraphQL strings live here
2. `types/shopify.ts` — ShopifyProduct, ShopifyCart, ShopifyCartLine types ported verbatim from shopSite; coexists with `types/index.ts` for non-Shopify types (Maker, BlogPost, FAQ)
3. `context/CartContext.tsx` (upgraded) — async Shopify-backed cart with AsyncStorage cart ID persistence; `addToCart` accepts `variantId`, not product objects
4. `hooks/useProducts.ts` + `hooks/useProduct.ts` + `hooks/useCollections.ts` — thin data-fetching hooks with loading/error state; screens call these, never call service layer directly
5. `lib/auth-storage.ts` — platform-branched storage abstraction: SecureStore on native, AsyncStorage on web; used by AuthContext for token persistence

See `.planning/research/ARCHITECTURE.md` for complete component boundary diagram, migration path (Phases A–E), and anti-patterns with concrete code examples.

### Critical Pitfalls

1. **`EXPO_PUBLIC_` env var prefix required** — shopSite uses `process.env.SHOPIFY_STORE_DOMAIN` (no prefix). In Expo, unprefixed variables are silently `undefined` at runtime. Every Shopify env var must be renamed to `EXPO_PUBLIC_SHOPIFY_*` before any API code runs. This is the single highest-probability failure during porting and must be resolved in Phase 1 before anything else.

2. **Shopify cart expiration returns `null`, not an error** — when a persisted cart ID references an expired cart (10-day inactivity), Shopify mutations return `{ cart: null, userErrors: [] }`. Code that checks only for `userErrors` will silently discard the cart. A `recoverCart` path must be implemented from the start: if a mutation returns null cart, call `cartCreate` with the same lines and persist the new ID.

3. **`expo-secure-store` is unavailable on Expo Web** — calling `SecureStore.setItemAsync()` on web crashes silently or throws. All auth token storage must go through a `lib/auth-storage.ts` abstraction that branches on `Platform.OS === 'web'`, falling back to AsyncStorage. This is a known Expo Web limitation with a well-established fix — but it must be applied consistently from the first auth-related line of code.

4. **`Linking.openURL()` is popup-blocked on web after `await`** — checkout opens `cart.checkoutUrl` via `Linking.openURL`. On web, browsers block `window.open()` calls that occur after an async gap since the user tap. The `checkoutUrl` must be pre-fetched and stored in cart state so the checkout handler can call `Linking.openURL` synchronously. On web, prefer `window.location.href` via a `Platform.OS === 'web'` guard.

5. **`SafeAreaView` from `react-native` does nothing on mobile web** — the existing HomeScreen imports `SafeAreaView` from `react-native` rather than `react-native-safe-area-context`. On Expo Web, the `react-native` version renders as a plain View with no insets. This must be fixed in the root layout before the first web review.

6. **Shadows are invisible on Expo Web** — `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`, and `elevation` from React Native's style system do not render on web via react-native-web. Every shadow must use `Platform.select` to provide a `boxShadow` CSS string for web alongside the RN shadow props for native.

See `.planning/research/PITFALLS.md` for 18 pitfalls with prevention code, warning signs, and phase assignments.

---

## Implications for Roadmap

Based on the dependency graph from ARCHITECTURE.md and the feature priority analysis from FEATURES.md, four phases are recommended. The critical path is: `lib/` service layer → `types/shopify.ts` → CartContext upgrade → product hooks → screen implementations → checkout → content screens → customer auth.

### Phase 1: Shopify Foundation

**Rationale:** Everything else is blocked until the Shopify service layer exists and is validated. No screen work is possible without GraphQL queries returning live data and CartContext accepting real variant IDs. This phase has the highest density of pitfalls and must be completed before any feature work begins.

**Delivers:** Working Shopify API client, live product data accessible from any screen, CartContext upgraded to Shopify-backed mutations with AsyncStorage persistence, `types/shopify.ts` in place, `.env.local` configured.

**Addresses:** Product data wiring (Home, Browse), cart mutations (Add to Cart, Remove, Update Quantity), cart ID persistence, favorites persistence.

**Avoids:** `EXPO_PUBLIC_` env var failure (Pitfall 7), cart expiry null-cart problem (Pitfall 2), AsyncStorage hydration flash (Pitfall 10), `SafeAreaView` wrong import (Pitfall 5), font error-state freeze (Pitfall 8).

**Research flag:** Standard patterns. The shopSite provides a complete working reference — this is mechanical porting, not architectural invention. No additional research phase needed. Validate on web (`expo start --web`) and iOS simulator on day one before proceeding.

### Phase 2: Commerce Screens

**Rationale:** With the Shopify layer and CartContext in place, all commerce screens can be implemented in parallel. Browse, Product Detail, Cart, and Checkout form a coherent user flow and should ship together — a browse screen without a working cart is a dead end.

**Delivers:** Full purchasable product catalog. Users can browse by category, view product detail with image carousel and variant selection, add items to cart, manage cart quantities, and reach Shopify checkout. This is the minimum viable commerce experience.

**Addresses:** Browse with category filter chips and pagination, Product Detail with variant selector and sticky Add-to-Cart CTA, Cart with Shopify cart lines and checkout button, Checkout screen with ProgressVine and `checkoutUrl` redirect.

**Avoids:** Variant ID requirement for cartLinesAdd (Pitfall — must pass variantId not productId), `Linking.openURL` popup-block on web (Pitfall 16), horizontal carousel inaccessibility on desktop web (Pitfall 14), shadow rendering on web (Pitfall 4).

**Research flag:** Standard patterns for Browse and Cart. Product Detail image carousel has a web-specific decision point: use `react-native-reanimated-carousel` (already in Reanimated stack) or gesture-handler ScrollView. No formal research phase needed — evaluate during implementation and add prev/next buttons for web affordance.

### Phase 3: Discovery and Content Screens

**Rationale:** Maker profiles, blog, about, and FAQ round out the brand experience and require no Shopify mutations — they are read-only or static. These screens can be built after commerce is working because they do not block the purchase path. The Favorites screen ships in this phase because it needs AsyncStorage persistence (established in Phase 1) and the "By Maker" grouping requires maker data wiring.

**Delivers:** Complete content layer. Maker profiles with product grids, blog feed and post detail (static mock data), About page, FAQ with animated accordion, Favorites screen with "Recently Saved" / "By Maker" toggle.

**Addresses:** Botanical animation language (FAQ fern unfurl, watercolor reveals via Reanimated), Maker-first navigation (maker profile screen at `/maker/[id]`), Blog as brand storytelling (static mock data, no CMS), Favorites persistence and "By Maker" grouping.

**Avoids:** Masonry grid complexity — ship uniform 2-column grid for v1; masonry is a differentiator that can be added later without structural changes.

**Research flag:** Standard patterns. Reanimated accordion animation is well-documented. Blog static rendering is trivial. No research phase needed.

### Phase 4: Customer Authentication

**Rationale:** Auth is deliberately last. Cart, checkout, and all content work without authentication. Auth gates only order history and saved addresses — valuable but not launch-blocking. Implementing auth last avoids the OAuth complexity contaminating earlier phases and means the auth flow is built on a stable foundation.

**Delivers:** Customer sign in / sign up via Shopify Classic Customer API (email/password — simpler than OAuth2/PKCE for v1), order history on Profile screen, saved addresses, sign out. Guest mode remains fully functional.

**Addresses:** `customerAccessTokenCreate` and `customerAccessTokenDelete` mutations ported from shopSite, `expo-secure-store` + AsyncStorage fallback for token storage, AuthContext with `isAuthenticated` state, login/register screens.

**Avoids:** `next/headers` non-portability (Pitfall 6) — deliberately using Classic Customer API which has no OAuth redirect, avoiding the PKCE complexity. SecureStore web unavailability handled by `lib/auth-storage.ts` abstraction (Pitfall 15).

**Research flag:** The OAuth2/PKCE Customer Account API (shopSite's approach) is deferred to v2. The Classic Customer API (`customerAccessTokenCreate` mutation) is simpler but lacks SSO and some account features. If the product owner requires the full Shopify account experience at launch, this decision needs revisiting before Phase 4 begins.

### Phase Ordering Rationale

- Phase 1 before all others: `lib/shopify-client.ts` is the root dependency for every data-fetching operation in the app. CartContext cannot be upgraded without `types/shopify.ts`. Hooks cannot be written without CartContext. Screens cannot be implemented without hooks.
- Phase 2 before Phase 3: Commerce screens form a complete user flow (browse → product → cart → checkout). Content screens are enrichment, not the core loop. Shipping Phase 2 first delivers a testable end-to-end purchase experience.
- Phase 3 before Phase 4: Content screens have no auth dependency. Building auth last means the auth implementation only needs to wire into a stable, complete UI — it does not need to be designed around half-built screens.
- Auth deferred: The Classic Customer API approach is specifically chosen to keep Phase 4 implementable without deep OAuth infrastructure. If OAuth2/PKCE is needed, it becomes a v2 item that can be swapped in behind the existing AuthContext interface without changing screens.

### Research Flags

Phases with standard patterns (skip research-phase):
- **Phase 1 (Shopify Foundation):** shopSite is a complete working reference. Port is mechanical.
- **Phase 2 (Commerce Screens):** Shopify cart mutation patterns are fully documented in shopSite and ARCHITECTURE.md.
- **Phase 3 (Discovery and Content):** Static content rendering and Reanimated accordion patterns are standard.
- **Phase 4 (Customer Auth):** Classic Customer API queries exist in shopSite. Auth-storage abstraction is clearly specified.

Phases that may benefit from targeted investigation during planning:
- **Phase 2 (image carousel):** Confirm `react-native-reanimated-carousel` web compatibility before committing. If it adds bundle weight without reliable web support, fall back to gesture-handler ScrollView with explicit prev/next controls.
- **Phase 4 (auth upgrade path):** If OAuth2/PKCE Customer Account API is required before v2, revisit before starting Phase 4. The `expo-auth-session` PKCE flow is more complex than Classic API but is fully supported by official Expo libraries.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All installed packages confirmed from `package.json`; shopSite provides working reference for the one package to add |
| Features | HIGH | Based on direct codebase analysis, mockup inspection, and shopSite production code; Shopify API surface is verified |
| Architecture | HIGH | Both codebases inspected directly; migration path is mechanical porting with known adaptations |
| Pitfalls | HIGH (most) / MEDIUM (some) | Critical pitfalls are documented Expo/Shopify behaviors; a few platform-specific edge cases are training-knowledge based |

**Overall confidence:** HIGH

### Gaps to Address

- **Shopify store configuration:** Category filter chips map to Shopify collection handles (e.g., `earth`, `woven`, `light`, `color`, `crafted`). These collection handles must be configured in the actual Shopify Admin to match the app's expected values. Validate during Phase 1 smoke testing.
- **Maker metafield strategy:** Rich maker profiles (bio, avatar, location) require either Shopify metaobjects or a local vendor-name-keyed mapping. The local mapping approach (mock-data.ts) is correct for v1 but requires that Shopify vendor names exactly match maker names in mock data. Validate during Phase 2/3 maker profile implementation.
- **Shopify inventory policy for artisan products:** Handmade goods may use "continue selling when out of stock." The interaction between `availableForSale` and `quantityAvailable` varies by per-product settings. Test with real Shopify data during Phase 2 variant selection implementation.
- **Cart expiry behavior:** Shopify's documented 10-day cart expiry is the stated behavior, but the exact API response shape (`null` cart vs `userErrors`) for an expired cart should be validated with a real test cart during Phase 1.
- **`react-native-reanimated-carousel` web support:** Training data indicates web support via Reanimated 3, but this should be verified against the actual installed Reanimated version (3.16.x) during Phase 2 carousel implementation.

---

## Sources

### Primary (HIGH confidence — direct codebase inspection)
- `/Users/jamesputman/SRC/wildenflowerShop/package.json` — installed packages, versions
- `/Users/jamesputman/SRC/wildenflowerShop/app/_layout.tsx` — root layout, CartProvider, font loading
- `/Users/jamesputman/SRC/wildenflowerShop/context/CartContext.tsx` — existing state shape
- `/Users/jamesputman/SRC/wildenflowerShop/types/index.ts` — local types (incompatible with Shopify types)
- `/Users/jamesputman/SRC/shopSite/lib/shopify.ts` — working Shopify client initialization
- `/Users/jamesputman/SRC/shopSite/lib/shopify-queries.ts` — all GraphQL queries and mutations
- `/Users/jamesputman/SRC/shopSite/lib/shopify-helpers.ts` — `getProducts`, `formatMoney`, helper functions
- `/Users/jamesputman/SRC/shopSite/lib/cart-store.ts` — cart mutation patterns and error handling
- `/Users/jamesputman/SRC/shopSite/lib/customer-account.ts` — OAuth2/PKCE implementation (confirmed non-portable)
- `/Users/jamesputman/SRC/shopSite/types/shopify.ts` — Shopify TypeScript types (port verbatim)
- `/Users/jamesputman/SRC/shopSite/.env.example` — required environment variables
- `/Users/jamesputman/SRC/wildenflowerShop/.planning/PROJECT.md` — scope decisions (blog CMS deferred, push notifications deferred)
- `/Users/jamesputman/SRC/wildenflowerShop/CLAUDE.md` — brand rules and UI vocabulary (authoritative)
- `/Users/jamesputman/SRC/wildenflowerShop/projectVision/` — mockup PNG files (primary design spec)
- `/Users/jamesputman/SRC/wildenflowerShop/data/mock-data.ts` — existing data model and types
- `/Users/jamesputman/SRC/wildenflowerShop/constants/theme.ts` — design tokens, copy constants

### Secondary (HIGH confidence — official library documentation via training knowledge Aug 2025)
- Expo SDK 52 documentation — SafeAreaView, useFonts, expo-constants, EXPO_PUBLIC_ env vars
- `react-native-web` 0.19 — shadow property mapping, overflow/absolute positioning behavior
- `expo-secure-store` — web unavailability, AsyncStorage fallback pattern
- `expo-auth-session` — PKCE flow for Shopify Customer Account API
- Shopify Storefront API 2025-04 — cart mutation behavior, cart expiry, variant availability

### Tertiary (MEDIUM confidence — behavior requires real-data validation)
- Shopify cart expiry null-response shape — documented behavior, validate with live test cart
- `react-native-reanimated-carousel` Expo Web compatibility in Reanimated 3.16.x — validate during Phase 2
- Shopify inventory policy behavior for artisan-store `availableForSale` edge cases — validate with real store data

---

*Research completed: 2026-02-19*
*Ready for roadmap: yes*
