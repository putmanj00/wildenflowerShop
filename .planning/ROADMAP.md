# Roadmap: Wildenflower

## Overview

Wildenflower migrates from a styled app skeleton with mock data to a live Shopify-backed artisan marketplace. The critical path flows strictly in dependency order: fix the foundation prerequisites that block web rendering, port the Shopify service layer that everything else depends on, upgrade CartContext to real mutations, build data hooks, then implement screens from the inside out — home first, then the complete browse-to-checkout commerce flow, then discovery and content, and finally customer auth as an additive layer on top of a complete guest experience.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Prerequisites** - Fix font loading, SafeAreaView imports, and validate Expo Web baseline before any feature work
- [ ] **Phase 2: Shopify Service Layer** - Port Shopify client, GraphQL queries, TypeScript types, and env var configuration from shopSite
- [ ] **Phase 3: CartContext Upgrade** - Replace mock CartContext with Shopify cart mutations and AsyncStorage cart ID persistence
- [ ] **Phase 4: Data Hooks + Checkout Wiring** - Build useProducts/useCollections/useProduct hooks and pre-fetch checkoutUrl into cart state
- [ ] **Phase 5: Home Screen** - Implement Home screen against projectVision mockup with live Shopify featured products
- [ ] **Phase 6: Browse + Product Detail** - Implement Browse screen with collection filtering and Product Detail with variant selection and image carousel
- [ ] **Phase 7: Cart + Checkout** - Implement Cart screen with live Shopify cart lines and checkout redirect to Shopify checkoutUrl
- [ ] **Phase 8: Favorites + Maker Profile** - Implement Favorites screen with AsyncStorage persistence and Maker Profile screen
- [ ] **Phase 9: Content Screens + Assets** - Implement Blog, About, FAQ screens; wire all botanical assets and tab icons; validate deep links and web navigation
- [ ] **Phase 10: Customer Authentication** - Implement sign up, sign in, sign out, and order history via Shopify Classic Customer API

## Phase Details

### Phase 1: Prerequisites
**Goal**: App boots cleanly on Expo Web with correct fonts, safe area insets, and no blocking render errors — validating the web platform baseline before any feature work begins
**Depends on**: Nothing (first phase)
**Requirements**: ASSET-01, PLAT-01, PLAT-02
**Success Criteria** (what must be TRUE):
  1. App loads on Expo Web (`npx expo start --web`) without errors or a frozen splash screen
  2. Playfair Display and Lora fonts render correctly on every screen that displays text; the font-error fallback state is handled so the app never freezes
  3. All screens use `SafeAreaView` from `react-native-safe-area-context` — no screen clips behind a notch or browser chrome on web
  4. Shadows render visibly on web via `Platform.select` with `boxShadow` CSS fallbacks alongside React Native shadow props
**Plans**: 4 plans

Plans:
- [ ] 01-01-PLAN.md — Fix font loading freeze bug + create on-brand FontErrorScreen component
- [ ] 01-02-PLAN.md — Add Platform.select web shadow fallbacks to theme.ts and tab bar layout
- [ ] 01-03-PLAN.md — Create Screen/ScrollScreen layout components; update all 12 screens
- [ ] 01-04-PLAN.md — Human validation of Expo Web baseline across all screens (checkpoint)

### Phase 2: Shopify Service Layer
**Goal**: Live Shopify data is accessible from any file in the app — the service layer exists, environment variables are wired, GraphQL queries work, and TypeScript types are in place
**Depends on**: Phase 1
**Requirements**: SHOP-01, SHOP-02, SHOP-03, SHOP-04, SHOP-05
**Success Criteria** (what must be TRUE):
  1. `EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN` and `EXPO_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` are read from `.env.local` via `app.json` extra and available at runtime — no silent `undefined` values
  2. `lib/shopify-client.ts` creates an authenticated Shopify Storefront API client; a smoke-test call to `getProducts` returns real product data from the store
  3. `types/shopify.ts` contains `ShopifyProduct`, `ShopifyCart`, `ShopifyCollection`, `ShopifyCartLine`, and related types — all screens can import Shopify types without `any` casts
  4. `getCollections` and `getCollectionByHandle` return real Shopify collections; collection handles match the category names used in the app
  5. `searchProducts` returns relevant results for a test search term against the live store
**Plans**: TBD

### Phase 3: CartContext Upgrade
**Goal**: Adding items to cart creates and manages a real Shopify cart; the cart ID survives app restarts and expired carts recover gracefully
**Depends on**: Phase 2
**Requirements**: SHOP-06, SHOP-07
**Success Criteria** (what must be TRUE):
  1. Calling `addToCart` with a Shopify `variantId` calls `cartLinesAdd` mutation and the returned cart reflects the new line item
  2. The cart ID is written to AsyncStorage after every mutation; on app restart, the existing cart is re-hydrated from the stored ID without loss of items
  3. When a persisted cart ID references an expired Shopify cart (null response), the app automatically creates a new cart and re-adds the lines — the user never sees a broken cart state
  4. `removeFromCart` and `updateQuantity` correctly call the corresponding Shopify mutations (`cartLinesRemove`, `cartLinesUpdate`) and update local state
  5. `CartContext` exports `cartId`, `cart` (ShopifyCart or null), `isLoading`, and mutation methods — all typed against `types/shopify.ts`
**Plans**: TBD

### Phase 4: Data Hooks + Checkout Wiring
**Goal**: Screens can fetch Shopify products, collections, and individual products through thin hooks with loading/error state; the checkoutUrl is pre-fetched so checkout can open synchronously without popup-blocking
**Depends on**: Phase 3
**Requirements**: SHOP-08
**Success Criteria** (what must be TRUE):
  1. `useProducts(options?)` returns `{ products, loading, error }` and fetches from the Shopify service layer — screens never call the service layer directly
  2. `useCollections()` and `useProduct(handle)` follow the same pattern; all three hooks are usable from any screen
  3. Checkout opens Shopify's `cart.checkoutUrl` without popup-blocking on web: on `Platform.OS === 'web'`, `window.location.href` is used synchronously; on native, `Linking.openURL` is called synchronously with the pre-fetched URL
  4. Loading and error states are handled uniformly across all hooks — screens can destructure `{ loading, error }` and render appropriate states
**Plans**: TBD

### Phase 5: Home Screen
**Goal**: The Home screen faithfully matches the projectVision mockup and shows live Shopify featured products — a real finder can arrive at the app, see artisan products, and navigate to product detail
**Depends on**: Phase 4
**Requirements**: COMM-01
**Success Criteria** (what must be TRUE):
  1. Home screen matches `projectVision/wildenflowerHomeScreen.png`: BotanicalHeader, hero card with tagline, CategoryRow, BotanicalDivider, and ProductGrid are all present and styled with brand tokens
  2. ProductGrid displays live products fetched from Shopify — not mock data; products update when the Shopify catalog changes
  3. CategoryRow scrolls horizontally; tapping a category navigates to Browse pre-filtered to that collection
  4. Tapping a product card navigates to the correct Product Detail screen
  5. Home screen renders without errors on Expo Web and passes an architect review for brand fidelity
**Plans**: TBD

### Phase 6: Browse + Product Detail
**Goal**: A finder can browse all products filtered by collection, open a product, view multiple images, select a variant, and add it to the Shopify cart — completing the browse-to-cart flow
**Depends on**: Phase 5
**Requirements**: COMM-02, COMM-03
**Success Criteria** (what must be TRUE):
  1. Browse screen matches `projectVision/wildenflowerProductListing.png`: FilterChipRow, 2-column ProductGrid, botanical styling; active filter chip gets watercolor wash background
  2. FilterChips map to Shopify collection handles; selecting a chip re-fetches products from that collection
  3. Browse screen paginates using Shopify cursor-based pagination (`pageInfo.hasNextPage`) — loading more products on scroll or tap
  4. Product Detail shows a swipeable image gallery with at least prev/next button affordance for web desktop users
  5. Variant selector maps selected option combinations to the correct Shopify `variantId`; the Add to Cart button is disabled if no valid variant is selected
  6. Tapping Add to Cart calls `CartContext.addToCart(variantId)` and shows a confirmation state; the cart badge updates
  7. Both screens render without errors on Expo Web
**Plans**: TBD

### Phase 7: Cart + Checkout
**Goal**: A finder can view their cart with live Shopify line items, adjust quantities, and reach Shopify checkout — completing the end-to-end purchase path
**Depends on**: Phase 6
**Requirements**: COMM-04
**Success Criteria** (what must be TRUE):
  1. Cart screen displays all Shopify cart line items: product image, title, variant, quantity controls, line price
  2. Quantity increment/decrement and line item removal call the correct Shopify mutations and update the displayed cart without a full page reload
  3. Order summary shows subtotal calculated from Shopify cart data (not a local computation)
  4. The gold "Proceed to Checkout" button opens Shopify's `cart.checkoutUrl` — on web via `window.location.href`, on native via `Linking.openURL`
  5. Empty cart displays "Nothing here yet — but the best things take time." with botanical illustration placeholder
  6. Cart screen renders correctly on Expo Web with no layout or interaction breakage
**Plans**: TBD

### Phase 8: Favorites + Maker Profile
**Goal**: Finders can save products they love across sessions, and can visit a maker's profile to see who made what — deepening the human connection the brand is built on
**Depends on**: Phase 7
**Requirements**: COMM-05, CONT-01
**Success Criteria** (what must be TRUE):
  1. Tapping the heart/favorite icon on any product card toggles its saved state; favorite product IDs persist to AsyncStorage and survive app restarts
  2. Favorites screen displays saved products in a grid with toggle pills for "Recently Saved" and "By Maker" views
  3. "By Maker" grouping renders saved products grouped by their Shopify vendor name with a maker header for each group
  4. Maker Profile screen shows maker name, bio, location, and their products — data sourced from mock-data.ts keyed by Shopify vendor name
  5. Tapping a maker badge on a product card or product detail navigates to the correct Maker Profile screen
  6. Both screens render correctly on Expo Web
**Plans**: TBD

### Phase 9: Content Screens + Assets
**Goal**: The full brand experience is complete — Blog, About, and FAQ screens are implemented; all botanical illustrated assets and tab icons are wired in; web deep links and tab navigation work
**Depends on**: Phase 8
**Requirements**: CONT-02, CONT-03, CONT-04, CONT-05, ASSET-02, ASSET-03, PLAT-03, PLAT-04
**Success Criteria** (what must be TRUE):
  1. Blog feed matches `projectVision/wildenflowerBlog.png`: featured article card, stacked blog post cards, category FilterChips, botanical pull-quote styling — all with static mock data
  2. Blog post detail screen renders full article content with Playfair Display Italic pull-quote styling on a watercolor wash
  3. About screen matches `projectVision/wildenflowerAbout.png`: illustrated cartouche placeholder, brand story paragraphs with illustrated drop cap placeholders, brand pillars grid
  4. FAQ screen matches `projectVision/wildenflowerFAQ.png`: accordion items animate with a fern-unfurl motion (Reanimated), answers on alternating watercolor washes, category FilterChips work
  5. All placeholder Views that represent botanical illustrated assets are replaced with `<Image>` sources from `assets/images/` (or confirmed wired where assets exist); tab bar uses botanical icon illustrations from `assets/images/icons/tabs/`
  6. Tab navigation works on Expo Web without broken gestures or native-only API errors
  7. Deep links for `/product/[id]`, `/maker/[id]`, and `/blog/[id]` resolve correctly in a web browser
**Plans**: TBD

### Phase 10: Customer Authentication
**Goal**: Finders can create an account, sign in, and view their order history — auth is an additive layer on a complete guest experience, not a gate
**Depends on**: Phase 9
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04
**Success Criteria** (what must be TRUE):
  1. A new finder can create an account with email and password via Shopify `customerCreate` mutation; validation errors (duplicate email, weak password) are shown inline
  2. A returning finder can sign in with email/password; the access token is stored in `expo-secure-store` on native or AsyncStorage on web via the `lib/auth-storage.ts` abstraction
  3. The access token persists across app restarts — a signed-in finder remains signed in without re-entering credentials
  4. Sign out deletes the token from storage and returns the finder to the unauthenticated state; all screens remain fully functional in guest mode
  5. The Profile screen shows order history fetched from Shopify using the access token when signed in; shows a "Sign In" prompt when unauthenticated
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Prerequisites | 0/4 | Not started | - |
| 2. Shopify Service Layer | 0/TBD | Not started | - |
| 3. CartContext Upgrade | 0/TBD | Not started | - |
| 4. Data Hooks + Checkout Wiring | 0/TBD | Not started | - |
| 5. Home Screen | 0/TBD | Not started | - |
| 6. Browse + Product Detail | 0/TBD | Not started | - |
| 7. Cart + Checkout | 0/TBD | Not started | - |
| 8. Favorites + Maker Profile | 0/TBD | Not started | - |
| 9. Content Screens + Assets | 0/TBD | Not started | - |
| 10. Customer Authentication | 0/TBD | Not started | - |
