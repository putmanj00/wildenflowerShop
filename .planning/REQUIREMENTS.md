# Requirements: Wildenflower

**Defined:** 2026-02-19
**Core Value:** Every screen faithfully matches the Weavy mockups with live Shopify data — enchanted artisan shopping experience on web first, then native.

## v1 Requirements

### Shopify Integration

- [x] **SHOP-01**: App reads Shopify credentials from `EXPO_PUBLIC_` environment variables configured in `app.json` extra
- [x] **SHOP-02**: TypeScript types for all Shopify API shapes exist in `types/shopify.ts` (ShopifyProduct, ShopifyCart, ShopifyCollection, etc.)
- [x] **SHOP-03**: Product catalog fetched from Shopify Storefront API (getProducts, getProductByHandle)
- [x] **SHOP-04**: Collections fetched from Shopify Storefront API (getCollections, getCollectionByHandle)
- [x] **SHOP-05**: Product search executes via Shopify Search API
- [x] **SHOP-06**: Cart created and managed via Shopify cart mutations (create, addLines, updateLines, removeLines)
- [x] **SHOP-07**: Cart ID persisted to AsyncStorage; app re-hydrates cart on launch; expired carts (null response) handled gracefully with recovery
- [x] **SHOP-08**: Checkout initiates by opening Shopify's `cart.checkoutUrl` in browser (web: window.location, native: Linking.openURL)

### Screens — Commerce Flow

- [x] **COMM-01**: Home screen implemented to match `projectVision/wildenflowerHomeScreen.png` with live featured products from Shopify
- [x] **COMM-02**: Browse screen implemented to match `projectVision/wildenflowerProductListing.png` with collection-based filtering and Shopify products
- [ ] **COMM-03**: Product detail screen with swipeable image gallery, variant selection (maps selected options to correct variantId), and Add to Cart
- [ ] **COMM-04**: Cart screen with line items, quantity controls, order summary, and gold "Proceed to Checkout" button that opens Shopify checkout
- [ ] **COMM-05**: Favorites screen with product grid; favorites persisted to AsyncStorage across sessions

### Screens — Content & Discovery

- [ ] **CONT-01**: Maker profile screen showing maker info (name, bio, location from mock data keyed by Shopify vendor) and their products
- [ ] **CONT-02**: Blog feed screen implemented to match `projectVision/wildenflowerBlog.png` with article cards and category filters
- [ ] **CONT-03**: Blog post detail screen with full article content, botanical pull-quote styling
- [ ] **CONT-04**: About screen implemented to match `projectVision/wildenflowerAbout.png` with brand story, illustrated cartouche, brand pillars
- [ ] **CONT-05**: FAQ screen implemented to match `projectVision/wildenflowerFAQ.png` with accordion items and category filters

### Customer Authentication

- [ ] **AUTH-01**: Customer can create an account with email and password (Shopify Classic Customer API `customerCreate`)
- [ ] **AUTH-02**: Customer can log in with email/password and remain logged in across app restarts (access token stored in SecureStore on native, AsyncStorage on web)
- [ ] **AUTH-03**: Customer can log out (token deleted from storage)
- [ ] **AUTH-04**: Logged-in customer can view their order history in the Profile screen

### Assets & Fonts

- [x] **ASSET-01**: Playfair Display (Regular, Bold, Italic) and Lora (Regular) fonts loaded via expo-font; font error state handled to prevent frozen splash
- [ ] **ASSET-02**: All botanical illustrated assets wired into screens (replacing placeholder Views with `<Image>` sources from `assets/images/`)
- [ ] **ASSET-03**: Tab bar uses botanical icon illustrations from `assets/images/icons/tabs/`

### Platform & Navigation

- [x] **PLAT-01**: `npx expo start --web` builds and runs without errors; all screens render in browser
- [x] **PLAT-02**: SafeAreaView imported from `react-native-safe-area-context` (not `react-native`) on all screens
- [ ] **PLAT-03**: Tab navigation works on Expo Web (no broken gestures or native-only APIs)
- [ ] **PLAT-04**: Product, maker, and blog deep links resolve correctly in web browser

## v2 Requirements

### Enhanced Auth

- **AUTH-V2-01**: OAuth2/PKCE authentication via Shopify Customer Account API (replaces Classic Customer API)
- **AUTH-V2-02**: Social login (Google, Apple)
- **AUTH-V2-03**: Guest cart association on login

### Native Polish

- **NATIVE-01**: iOS-specific gesture polish (swipe back, haptics)
- **NATIVE-02**: Android-specific adaptations
- **NATIVE-03**: Push notifications for order updates

### Analytics & Operations

- **OPS-01**: Analytics event tracking
- **OPS-02**: Error tracking / crash reporting
- **OPS-03**: Maker profiles backed by Shopify metaobjects (not mock data)

### Discovery

- **DISC-01**: Personalized recommendations based on browse history
- **DISC-02**: Maker follow / notification system

## Out of Scope

| Feature | Reason |
|---------|--------|
| Custom payment UI | Shopify handles payment via checkoutUrl; no PCI scope needed |
| Blog CMS | Static/mock blog content for v1; Shopify Blog API deferred |
| Product inventory management | Shopify Admin handles all inventory |
| iOS/Android native builds in v1 | Web first; native polish deferred to v2 |
| Real-time stock/availability updates | WebSocket/polling complexity; static check at add-to-cart is sufficient |
| Countdown timers / urgency indicators | Explicitly against brand pillars |
| Ratings and reviews | Anti-feature per brand — deferred |
| Algorithmic recommendations | Anti-feature per brand — deferred |
| Upsell overlays | Anti-feature per brand — never |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ASSET-01 | Phase 1 | Complete |
| PLAT-01 | Phase 1 | Complete |
| PLAT-02 | Phase 1 | Complete |
| SHOP-01 | Phase 2 | Complete |
| SHOP-02 | Phase 2 | Complete |
| SHOP-03 | Phase 2 | Complete |
| SHOP-04 | Phase 2 | Complete |
| SHOP-05 | Phase 2 | Complete |
| SHOP-06 | Phase 3 | Complete |
| SHOP-07 | Phase 3 | Complete |
| SHOP-08 | Phase 4 | Complete |
| COMM-01 | Phase 5 | Complete |
| COMM-02 | Phase 6 | Complete |
| COMM-03 | Phase 6 | Pending |
| COMM-04 | Phase 7 | Pending |
| COMM-05 | Phase 8 | Pending |
| CONT-01 | Phase 8 | Pending |
| CONT-02 | Phase 9 | Pending |
| CONT-03 | Phase 9 | Pending |
| CONT-04 | Phase 9 | Pending |
| CONT-05 | Phase 9 | Pending |
| ASSET-02 | Phase 9 | Pending |
| ASSET-03 | Phase 9 | Pending |
| PLAT-03 | Phase 9 | Pending |
| PLAT-04 | Phase 9 | Pending |
| AUTH-01 | Phase 10 | Pending |
| AUTH-02 | Phase 10 | Pending |
| AUTH-03 | Phase 10 | Pending |
| AUTH-04 | Phase 10 | Pending |

**Coverage:**
- v1 requirements: 27 total
- Mapped to phases: 27
- Unmapped: 0

---
*Requirements defined: 2026-02-19*
*Last updated: 2026-02-19 — traceability updated to 10-phase comprehensive roadmap*
