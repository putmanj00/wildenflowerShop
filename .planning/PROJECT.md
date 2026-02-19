# Wildenflower

## What This Is

Wildenflower is a curated e-commerce mobile/web app for handmade artisan goods — tie-dye, jewelry, leather goods, artwork, and crystals made by local artisans. Built with React Native (Expo), targeting Expo Web first, then iOS and Android. Shopify Storefront API (GraphQL) powers the full commerce backend: product catalog, cart, and checkout.

## Core Value

Every screen must faithfully match the Weavy mockups and deliver live Shopify data — the enchanted, unhurried artisan experience on the web before native.

## Requirements

### Validated

- ✓ Expo Router file structure — existing
- ✓ Design token system in constants/theme.ts — existing
- ✓ Core UI components (BotanicalHeader, ProductCard, ProductGrid, CategoryRow, etc.) — existing
- ✓ Botanical illustrated assets in assets/images/ — existing
- ✓ Screen stubs for all major routes — existing
- ✓ CartContext with reducer (mock-data based) — existing
- ✓ Mock product/maker/blog data in data/mock-data.ts — existing
- ✓ Custom agents (architect, builder, reviewer) in .claude/agents/ — existing
- ✓ Shopify Storefront API client + GraphQL queries (in shopSite repo, to be ported) — existing

### Active

- [ ] All screens implemented to match projectVision/ mockups
- [ ] Shopify Storefront API integration (products, collections, cart, checkout)
- [ ] CartContext upgraded from mock data to live Shopify cart mutations
- [ ] Customer authentication via Shopify Customer Account API
- [ ] Expo Web build ships and works in browser
- [ ] Botanical assets and fonts wired into all screens
- [ ] Tab navigation and deep linking work on web

### Out of Scope

- iOS/Android native builds — web first; native polish deferred to v2
- Custom payment processing — Shopify handles via checkoutUrl redirect
- Blog CMS — static/mock blog content in v1; Shopify blog API deferred
- Backend admin for products — Shopify Admin handles all product management
- Push notifications — deferred to v2
- Analytics beyond basic setup — deferred to v2

## Context

**Existing Shopify integration (shopSite repo at ~/SRC/shopSite):**
- `lib/shopify.ts` — `getShopifyClient()` + `shopifyFetch()` using `@shopify/storefront-api-client` v1.0.9, API version 2025-04
- `lib/shopify-queries.ts` — Full GraphQL query/mutation set: products, collections, cart CRUD, customer auth
- `lib/shopify-helpers.ts` — `getProducts`, `getProductByHandle`, `getCollections`, `searchProducts`, `formatMoney`
- `lib/cart-store.ts` — Zustand cart store with full Shopify cart mutations (create/add/update/remove)
- `types/shopify.ts` — TypeScript types: ShopifyProduct, ShopifyCart, ShopifyCollection, etc.
- `.env.example` — env var template: SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_ACCESS_TOKEN, SHOPIFY_SHOP_ID, etc.
- Customer auth uses OAuth2 + PKCE (Next.js cookies implementation — will need Expo adaptation)

**Wildenflower current CartContext.tsx** uses mock `Product` types and in-memory state. Needs to be replaced/extended to call real Shopify mutations and persist cart ID.

**Mockup reference files in projectVision/:**
- wildenflowerHomeScreen.png, wildenflowerProductListing.png, wildenflowerCheckout.png
- wildenflowerBlog.png, wildenflowerAbout.png, wildenflowerFAQ.png
- wildenflower-mobileHome.png, wildenflower-mobileProductListing.png, etc.

**Checkout approach:** Redirect to Shopify's `cart.checkoutUrl` (Linking.openURL on native, window.location.href on web). No custom payment UI needed.

## Constraints

- **Tech stack**: React Native + Expo SDK 52+, Expo Router, TypeScript — no changes
- **Styling**: StyleSheet.create with theme.ts tokens, Playfair Display + Lora fonts — no Tailwind, no inline styles
- **Shopify API**: Storefront API version 2025-04 with `@shopify/storefront-api-client` — matches shopSite
- **Platform priority**: Expo Web must work; native gesture patterns should not break web
- **Brand**: CLAUDE.md brand rules are hard constraints — every screen must pass architect review

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Port Shopify layer from shopSite | Proven, working queries + mutations. Avoid reinventing. | — Pending |
| CartContext → Shopify-backed | Current CartContext uses mock data; needs variantId + cartId + Shopify mutations | — Pending |
| Checkout via checkoutUrl redirect | Simpler than custom checkout; Shopify handles PCI compliance | — Pending |
| Web first, native second | Broader reach first; validates UI before native polish | — Pending |
| Customer auth: Expo adaptation | shopSite uses Next.js cookies; Expo needs AsyncStorage/SecureStore + Expo AuthSession | — Pending |

---
*Last updated: 2026-02-19 after initialization*
