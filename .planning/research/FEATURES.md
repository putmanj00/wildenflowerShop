# Feature Landscape

**Domain:** Artisan / boutique e-commerce — curated handmade goods marketplace
**Project:** Wildenflower
**Researched:** 2026-02-19
**Research confidence:** HIGH — based on direct codebase analysis (shopSite working implementation), existing mock data model, mockup inspection, and Shopify Storefront API 2025-04 GraphQL surface

---

## Preamble: What Makes This Different

Wildenflower is not a feature-maximizing commerce app. It is a curated discovery experience. Every feature decision must pass two tests:

1. Does it serve the "finder" (not customer) in discovering and connecting with makers?
2. Does it preserve the unhurried, enchanted brand energy?

Features that create anxiety, pressure, or generic commerce feel are anti-features here even if they are table stakes elsewhere.

---

## Table Stakes

Features users expect. Missing = product feels incomplete or broken.

### Screen: Home

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Botanical header render (200px illustrated banner) | Entry point visual identity — failing here tanks first impression | Low | Placeholder color View acceptable until assets arrive; component already exists as `BotanicalHeader` |
| Hero card with tagline "Made by hand. Found by heart." | Sets brand tone before any product appears | Low | `HeroCard` component already built |
| Category row — horizontal scroll, 5 categories | Navigation shortcut to product types; visible in mockup | Low | `CategoryRow` component exists; category data in `theme.ts` |
| "Freshly Gathered" product grid — 6 products, 2 columns | Core product surface; users expect products on home screen | Medium | `ProductGrid` exists; needs live Shopify data |
| Tap category → filter browse screen | Core navigation flow | Medium | Requires route param passing to browse |
| Tap product card → product detail | Core navigation; broken nav = broken app | Low | `router.push` to `/product/[id]` |
| Favorite toggle on product card (heart icon) | Expected on any modern commerce home | Low | `CartContext.toggleFavorite` already wired |
| Scroll performance (no jank on 6+ cards) | Users abandon laggy apps immediately | Medium | FlatList vs ScrollView decision matters here |

### Screen: Browse / Product Listing

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Full product catalog display, 2-column grid | Core inventory surface | Medium | Needs Shopify `getProducts` call replacing mock data |
| Category filter chips (horizontal scroll) | Standard pattern; users expect to narrow results | Low | `FilterChipRow` component needed; maps to Shopify collection handles |
| Active filter visual state (dusty rose wash) | Standard filter feedback | Low | Per mockup: active chips get watercolor wash background |
| Tap filter → filtered results | Core catalog navigation | Medium | Shopify collections map to category filters; `GET_COLLECTION_BY_HANDLE_QUERY` exists |
| Pagination / infinite scroll | Essential once catalog exceeds 20 items | High | Shopify `pageInfo.hasNextPage` + `after` cursor pattern is available in existing queries |
| Product card shows: image, name, maker name, price | Minimum scannable data to make discover decisions | Low | `ProductCard` component exists |
| Empty state for filter with no results | Without this, blank screen reads as broken | Low | Brand copy: "We couldn't find that one. Try wandering a different path." |
| Loading state while fetching | Network latency is real; spinners or skeletons prevent abandonment | Medium | Growth/bloom loading animation per animation guidelines |

### Screen: Product Detail

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Swipeable image carousel | Expected on any product page; users need to see all angles | High | React Native: `ScrollView` horizontal with paging, or `FlatList` with `pagingEnabled`. Web: needs CSS scroll snapping. Up to 10 images from Shopify |
| Product name (large decorative serif) | Obvious | Low | |
| Price display in gold | Obvious; users scan price immediately | Low | Use `formatMoney()` from shopify-helpers; Shopify returns `{amount, currencyCode}` |
| Maker badge — name + avatar, tappable to maker profile | Differentiator context, but expected once users see it once | Low | `MakerBadge` component exists; Shopify `vendor` field maps to maker name |
| Product description | Copy that sells the piece | Low | Shopify `description` or `descriptionHtml` field |
| Variant selection (if product has variants) | CRITICAL for Shopify — you cannot add to cart without a `variantId`. A product with Size/Color options must show selectors | High | Shopify `variants.edges[].node.selectedOptions`; each variant has `availableForSale`; UI must show which options are sold out |
| "Add to Cart" button — sticky bottom bar | Standard mobile commerce pattern | Medium | Must pass `variantId` (not productId) to Shopify cartLinesAdd. Button disabled when unavailable |
| Materials & care instructions | Expected for handmade goods; informs purchase | Low | Shopify metafields or description field; mock data has `materials` and `careInstructions` |
| "The Story Behind This Piece" section | Brand differentiator, but once present becomes expected | Medium | Shopify metafield `story` or `descriptionHtml` supplemental section; watercolor wash background |
| Related products horizontal scroll | Increases discovery; expected on product pages | Medium | Simple: same collection or same vendor; Shopify collections query |
| Back navigation | Obvious | Low | Expo Router `router.back()` or back arrow |
| Loading state while product fetches | Network latency | Low | |
| 404 / not found state | For bad URLs or deleted products | Low | |

### Screen: Cart

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Cart item list — image, name, variant, quantity, price | Core cart data display | Medium | Shopify `ShopifyCartLine` has all this; includes `merchandise.selectedOptions` for variant display |
| Quantity increment / decrement controls | Standard cart UX; users expect to change quantity | Medium | Calls Shopify `cartLinesUpdate` mutation with new quantity |
| Remove item (swipe or X) | Standard cart UX | Low | Shopify `cartLinesRemove` mutation |
| Subtotal display | Users need to know cost before proceeding | Low | Shopify `cart.cost.subtotalAmount` |
| "Proceed to Checkout" gold button | Core conversion action | Low | Opens `cart.checkoutUrl` via `Linking.openURL` (native) or `window.location.href` (web) |
| Empty state with illustrated botanical | Without this, blank cart screen feels broken | Low | "Nothing here yet — but the best things take time." + botanical illustration |
| Cart persists across app restarts | Users expect cart to survive closing the app | High | Must persist Shopify cart ID to AsyncStorage; on next launch, re-fetch cart with `GET_CART_QUERY` |
| Cart count badge on tab bar icon | Standard mobile commerce; users expect to see item count | Low | `cartCount` already in `CartContext`; tab bar icon needs badge |

### Screen: Checkout

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| ProgressVine step indicator (Cart → Shipping → Payment → Confirmation) | The mockup's multi-step progress is expected for multi-step flows | Medium | Botanical vine with mushroom/fern/flower/sun nodes; per mockup |
| Order summary visible during checkout | Users expect to see what they're paying for | Low | Cart items + subtotal display |
| "Checkout" button that opens Shopify checkout URL | The actual payment — without this, nothing works | Medium | `Linking.openURL(cart.checkoutUrl)` on native; `window.location.href` on web; confirmed approach in PROJECT.md |
| "You're about to make someone's day." tagline | Brand moment; per mockup | Low | In sage italic below checkout button; already in `copy` constants |
| Botanical wreath around checkout button | Per mockup design | Low | Asset or bordered button style |
| Handling loading state during cart fetch | Network lag before checkout | Low | |

**Note on checkout scope:** PROJECT.md confirms checkout redirects to Shopify's hosted checkout. No custom payment form needed. The "Checkout screen" in this app is primarily a pre-checkout order review + the redirect trigger.

### Screen: Favorites

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Grid of saved products | Core favorites display | Medium | Two-column or masonry layout |
| Toggle between "Recently Saved" / "By Maker" views | Per mockup — two sort modes | Medium | Client-side sort of favorites array |
| Remove from favorites (tap heart to toggle) | Standard — users expect to be able to un-favorite | Low | `CartContext.toggleFavorite` already exists |
| Tap product → product detail | Standard navigation | Low | |
| Favorites persist across sessions | Users expect saved items to survive app restart | High | Current `CartContext` is in-memory only — DOES NOT persist. Must add `AsyncStorage` persistence for favorites array. Shopify Storefront API has no native wishlist; this stays local-only |
| Empty state with botanical illustration | Brand requirement | Low | "Your collection is just beginning." |
| Favorite count visible somewhere (tab badge) | Nice-to-have that becomes expected | Low | Low priority vs cart badge |

### Screen: Profile

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| User name display in wreath frame (or guest state) | Per mockup | Low | Guest fallback: "Welcome, Finder" |
| Menu items as parchment cards (Order History, Addresses, Settings) | Standard profile structure | Low | |
| Order history list | Users expect to find past orders | Medium | Shopify `customer.orders` query; requires auth |
| Saved addresses | For repeat checkout convenience | Medium | Shopify `customer.addresses` |
| Sign in / Sign up flow | Gate for order history and saved addresses | High | Shopify Customer Account API; Expo AuthSession + PKCE adaptation from shopSite's Next.js implementation |
| Sign out | Standard | Low | Delete access token via `CUSTOMER_ACCESS_TOKEN_DELETE_MUTATION` + clear AsyncStorage |
| Guest mode (unauthenticated state) | App must be usable without login | Low | Cart and favorites work without auth; only orders/addresses require login |

### Screen: Blog Feed

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Botanical header with mushroom forest scene | Per mockup | Low | `BotanicalHeader` variant |
| Category filter chips (Maker Stories, Behind the Craft, Community) | Per mockup; standard blog nav | Low | Client-side filter on `BlogPost.category` |
| Featured article card (large, with photo + overlaid title) | Per mockup; establishes editorial feel | Medium | First/pinned post gets hero treatment |
| Blog post list cards | Standard blog list | Low | `author`, `publishedAt`, `readingTime`, `excerpt` display |
| Botanical dividers between posts | Per mockup; brand texture | Low | `BotanicalDivider` component |
| Pull quotes in terracotta italic | Per mockup | Low | `WatercolorWash` component |
| Tap post → blog post detail | Navigation | Low | `/blog/[id]` |

**Scope note:** PROJECT.md declares blog CMS deferred — v1 uses static/mock data from `mock-data.ts`. Blog posts are already defined in the data model (`BlogPost` type, `blogPosts` array). No Shopify Blog API integration needed in v1.

### Screen: Blog Post Detail

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Full article text rendering | Core content | Low | Static content from mock data; Wildenflower authors all posts |
| Pull quote callout in WatercolorWash | Per CLAUDE.md spec; brand texture | Low | `pullQuote` field exists in `BlogPost` type |
| Cover image | Visual anchor | Low | `coverImage` field; placeholder if empty |
| Reading time display | Standard editorial UX | Low | `readingTime` field exists |
| Author and date | Standard | Low | |
| Link to featured maker (if maker-stories category) | Brand connection; blog is brand storytelling | Medium | Would link to `/maker/[id]`; requires associating blog posts with maker IDs |
| Related products from mentioned maker | Discovery integration — blog drives commerce | Medium | Requires maker → product relationship; can derive from `maker.id` |
| Back to blog navigation | Standard | Low | |

### Screen: Maker Profile

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Maker name, avatar, bio | Core profile data | Low | Shopify `vendor` field + metafields; mock data has `Maker` type with all fields |
| Maker location | Grounds the "local artisan" story | Low | `Maker.location` in mock data; Shopify metafield in production |
| Maker specialties / craft tags | Lets users understand the maker's range | Low | `Maker.specialties` array |
| All products by this maker — 2-column grid | Core maker profile action — see their work | Medium | Shopify: `getProducts({ query: 'vendor:MakerName' })` |
| Tap product → product detail | Navigation | Low | |
| "Request Custom" option (if maker offers commissions) | Per FAQ — "Many of our makers love custom commissions!" | Medium | Simple CTA with email link or contact form; no custom flow needed in v1 |
| Back navigation | Standard | Low | |

### Screen: About

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Illustrated cartouche (oval botanical frame) with photo | Per mockup; brand identity anchor | Low | Asset or View frame; photo inside |
| Brand story paragraphs with illustrated drop caps | Per mockup; editorial character | Medium | Drop cap is a decorative `Text` component with positioned botanical letter asset |
| Botanical illustration dividers between sections | Per mockup | Low | `BotanicalDivider` variants |
| Brand pillars in 2x2 grid with circular botanical icons | Per mockup; "Our Values" / "What We Believe" | Low | `brandPillars` data in `theme.ts` |
| Static content (no API) | This is brand copy, not dynamic | Low | Hard-coded or from constants |

### Screen: FAQ

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| "Questions & Curiosities" header in decorative serif | Per mockup | Low | |
| Category filter chips | Per mockup; users navigate to their question type | Low | `faqCategories` in `theme.ts` |
| Accordion items — expand/collapse | Standard FAQ pattern | Medium | Animated with Reanimated; fern unfurl animation on expand (450ms per animation guidelines) |
| Alternating watercolor wash backgrounds on answers | Per mockup (rose, lavender, sage rotate) | Low | `WatercolorWash` component |
| "Still curious? We'd love to hear from you" contact callout | Per mockup; brand warmth | Low | Gold button opens email or contact form |
| FAQ items filtered by active category | Per mockup | Low | Client-side filter on `FAQItem.category` |

---

## Differentiators

Features that make Wildenflower feel unlike any other commerce app. Not expected, but valued — and part of the vision.

### "The Story Behind This Piece" Section

**What:** On product detail, a dedicated narrative section where the maker describes this specific item's creation — the morning it was made, the materials, the accident that became beautiful.

**Value proposition:** Transforms a product into an artifact. Etsy has descriptions; Wildenflower has stories. Emotional purchase justification without manipulation.

**Complexity:** Medium

**Implementation:** Shopify product metafield (`story` field). The `Product` type in mock data already has `story?: string`. In production, this is a Shopify product metafield that makers fill in via Shopify Admin.

**Notes:** Watercolor wash background (`WatercolorWash` component). Playfair Display Italic. Visually distinct section break from standard description.

---

### Maker-First Product Cards and Navigation

**What:** Products are always attributed to a named maker. The maker name is visible on product cards (below product name), tappable to go to maker profile. The question "who made this?" is answered before "what does it cost?"

**Value proposition:** Shifts the frame from product marketplace to artist-finder platform. Users build relationships with makers, not just accumulate products.

**Complexity:** Low-Medium

**Implementation:** `MakerBadge` component exists. Product cards show `maker.name`. Maker profile screen at `/maker/[id]`. In Shopify, maker maps to `vendor` field; maker detail data lives in Shopify metafields.

**Notes:** In Shopify, the `vendor` field is a flat string. Rich maker profiles (bio, location, specialties) require either: (a) Shopify metaobjects/metafields, or (b) a local maker database keyed by vendor name. For v1, the mock data maker objects serve as the reference; production will need a mapping strategy.

---

### Botanical Animation Language

**What:** Every interaction has an organic, hand-drawn quality. Accordion items unfurl like ferns. Watercolor washes bloom on reveal. Tap feedback is a soft spreading wash, not a flash.

**Value proposition:** The animations themselves communicate brand values — slowness, nature, craft. Generic spring animations would undermine everything else.

**Complexity:** High

**Implementation:** React Native Reanimated throughout. Specific timings in `animation` constants in `theme.ts` (`fernUnfurl: 450ms`, `bloomReveal: 600ms`). Priority order: FAQ accordion (visible), then product card tap, then page transitions.

**Notes:** This is the hardest feature to get right because it requires Reanimated 2+ worklet-based animations that also work on Expo Web (Reanimated has partial web support as of SDK 52).

---

### "Questions & Curiosities" FAQ with Accordion Animation

**What:** FAQ items animate open with a fern-unfurl motion, answers sit on alternating watercolor wash backgrounds.

**Value proposition:** Even a FAQ page feels enchanted. Demonstrates design philosophy runs through every corner of the app.

**Complexity:** Medium

**Implementation:** Reanimated `useAnimatedStyle` with height interpolation. Need to measure content height before animating.

---

### Blog as Brand Storytelling, Not Marketing

**What:** Blog posts are editorial content written in Wildenflower's voice — maker profiles, craft deep-dives, community events. No product promotion language. Pull quotes in terracotta italic on watercolor wash.

**Value proposition:** Users return to the app to read, not just to buy. Content builds community and brand trust.

**Complexity:** Medium (for layout); Low (for v1 static content)

**Implementation:** Static mock data in v1. `BlogPost.pullQuote` field renders in a `WatercolorWash` callout. Category filtering via `BlogPost.category`.

---

### Favorites Organized "By Maker"

**What:** The Favorites screen has a toggle between "Recently Saved" and "By Maker" views. "By Maker" groups saved items under their maker — you can see everything you've saved from River Clay Studio together.

**Value proposition:** Reinforces maker identity; helps users discover they have a "type" of maker they love.

**Complexity:** Medium

**Implementation:** Client-side grouping of `favorites` (product IDs) by `product.maker.id`. Requires favorites to store full product objects, not just IDs (current `CartContext` stores only IDs — this needs updating).

**Notes:** To implement "By Maker" view, favorites need to persist product objects (or at minimum, maker metadata). Current data model stores only product IDs in `User.favorites` and `CartState.favorites`.

---

### ProgressVine Checkout Step Indicator

**What:** Checkout steps (Cart → Shipping → Payment → Confirmation) are connected by an illustrated vine with botanical nodes: mushroom, fern, flower, sun.

**Value proposition:** Transforms a form into a journey. Removes anxiety from checkout by making progress feel like a natural unfolding.

**Complexity:** Medium-High

**Implementation:** Custom `ProgressVine` component. SVG or asset-based vine connecting step nodes. Active step node is filled/illuminated; completed steps have different botanical illustration.

---

### Masonry Grid on Favorites Screen

**What:** Saved products display in a masonry-style grid (variable height cells, staggered columns) rather than uniform 2-column grid.

**Value proposition:** More editorial, gallery-like feel for a personal collection vs. a catalog grid.

**Complexity:** High on web

**Implementation:** React Native: `FlatList` with manual column management or a masonry library. Web: CSS columns. Challenge — Expo Web CSS grid vs. RN FlatList diverge here. Fallback: uniform 2-column grid is acceptable for v1.

---

### Vine-Tendril Arrows (Profile Screen)

**What:** Menu item right-arrows are illustrated vine tendrils rather than standard chevrons.

**Value proposition:** Brand texture in micro-interactions. Every UI element reinforces the aesthetic world.

**Complexity:** Low

**Implementation:** Asset or an SVG botanical arrow replacing `>` chevron icon.

---

## Anti-Features

Things to deliberately NOT build. Listed because they are tempting, common, or expected in generic commerce apps.

### Countdown Timers and Urgency Indicators

**Anti-feature:** "Sale ends in 2h 30m", "Only 3 left!", "5 people viewing this now"

**Why avoid:** Directly violates brand pillar "Freedom & Joy — no pressure or manipulation." Creates anxiety in an experience designed to feel unhurried. CLAUDE.md explicitly prohibits this.

**What to do instead:** Show availability status calmly: "Available" or a quiet "Sold Out" badge with no drama. For handmade goods, low stock is a feature (scarcity is authentic), not a manipulation tool — but don't weaponize it.

---

### Ratings and Review Stars

**Anti-feature:** 4.7 stars, 143 reviews, star ratings on product cards

**Why avoid:** Artisan goods are not reviewed like commodities. "This mug got 3.2 stars" undermines the maker relationship. Generic review systems homogenize and commodify.

**What to do instead:** Maker bio and story serve as qualitative trust signals. Customer testimonials, if added later, should be curated quotes in the maker's voice — not aggregated star ratings.

---

### Recommended For You / Algorithmic Feed

**Anti-feature:** "Because you viewed X, you might like Y" recommendation engine

**Why avoid:** Surveillance-y, extractive, and antithetical to "wandering" and discovery. Wildenflower's value is curated discovery, not algorithmic optimization.

**What to do instead:** Related products = same maker or same collection. That connection is human-curated, not algorithmic.

---

### Guest Checkout Friction

**Anti-feature:** Forcing account creation before checkout

**Why avoid:** Dark pattern. Cart and checkout must work without an account. Shopify's hosted checkout handles guest checkout natively — don't add friction in front of it.

**What to do instead:** Unauthenticated users can cart and checkout. Account benefits (order history, saved addresses) are offered gently, not demanded.

---

### Push Notification Badgering

**Anti-feature:** "Your cart is waiting!", "Don't forget your items!", notification permission walls

**Why avoid:** Manipulative. Interrupts the unhurried experience outside the app. PROJECT.md already defers push notifications to v2.

**What to do instead:** Nothing. Cart persistence via AsyncStorage means items are there when the user returns naturally.

---

### Infinite Upsell / Cross-Sell Overlays

**Anti-feature:** "Add X to your order before checkout" modals, "Complete the look" pop-ups at cart review

**Why avoid:** Pushy. Undermines "no pressure" brand pillar. Dark pattern dressed up as helpfulness.

**What to do instead:** Related products on product detail page are discovery, not upsell — the framing is "you might love this maker's other work," not "buy more."

---

### Price Drop Alerts / Wishlist Notifications

**Anti-feature:** "This item in your favorites just dropped in price!"

**Why avoid:** Price anchoring and urgency creation. Treats the transaction as the goal, not the connection.

**What to do instead:** Favorites are a personal collection, not a price-tracking watchlist.

---

## Feature Dependencies

```
Shopify CartContext (cartId, variantId)
  ↓ required by
Cart screen (display Shopify cart)
  ↓ required by
Checkout (cart.checkoutUrl)

Variant selection (product detail)
  ↓ required by
Add to Cart (must pass variantId, not productId)

AsyncStorage cart ID persistence
  ↓ required by
Cart survives app restart

AsyncStorage favorites persistence
  ↓ required by
Favorites screen (shows saved products)
  ↓ required by
Favorites "By Maker" view (groups by maker)

Shopify `vendor` field mapping
  ↓ required by
Maker profile (who is this maker?)
  ↓ required by
"View all from this maker" on maker profile
  ↓ required by
Maker attribution on product cards (tappable)

Customer auth (Shopify Customer Account API)
  ↓ required by
Order history (profile screen)
  ↓ required by
Saved addresses
```

---

## Minimum Viable Screen Interactions — Per Screen Checklist

### Home
- [x] Render botanical header placeholder (done in Home screen)
- [x] Render hero card (done)
- [x] Render category row with tap (done)
- [x] Render product grid (done with mock data)
- [ ] Connect product grid to live Shopify data
- [ ] Category tap navigates to filtered browse screen

### Browse / Product Listing
- [ ] Fetch all products from Shopify
- [ ] Render 2-column product grid
- [ ] Category filter chips wired to Shopify collections
- [ ] Pagination / load more
- [ ] Empty state

### Product Detail
- [ ] Fetch product by handle (or ID) from Shopify
- [ ] Swipeable image carousel
- [ ] Variant selector (size, color if applicable)
- [ ] Add to Cart triggers Shopify cart mutation
- [ ] "The Story Behind This Piece" section
- [ ] Related products
- [ ] Sticky bottom CTA bar

### Cart
- [ ] Display Shopify cart (fetch by persisted cart ID)
- [ ] Quantity controls → Shopify update mutation
- [ ] Remove item → Shopify remove mutation
- [ ] Proceed to Checkout opens checkoutUrl
- [ ] Empty state

### Checkout
- [ ] Order summary display
- [ ] ProgressVine step indicator (visual only for redirect flow)
- [ ] "Checkout" button → opens Shopify checkoutUrl
- [ ] Loading state

### Favorites
- [ ] Display favorited products from persisted local storage
- [ ] Recently Saved / By Maker toggle
- [ ] Remove from favorites
- [ ] Empty state

### Profile
- [ ] Guest state (unauthenticated)
- [ ] Sign in / Sign up (Shopify Customer Account API)
- [ ] Order history (authenticated)
- [ ] Sign out

### Blog Feed
- [ ] Display blog posts from mock data
- [ ] Category filter chips
- [ ] Featured post hero
- [ ] Navigate to post detail

### Blog Post Detail
- [ ] Full article render
- [ ] Pull quote callout
- [ ] Reading time, date, author

### Maker Profile
- [ ] Display maker bio, location, specialties
- [ ] All products by this maker grid
- [ ] "Request Custom" contact CTA

### About
- [ ] Brand story paragraphs
- [ ] Brand pillars 2x2 grid
- [ ] Static content only

### FAQ
- [ ] Accordion items with fern animation
- [ ] Category filter chips
- [ ] Alternating watercolor wash backgrounds
- [ ] "Still curious?" contact callout

---

## MVP Recommendation

Given "web first" and "pixel-perfect mockups + live Shopify data" as the goal, prioritize:

**Must work before anything else (commerce core):**
1. Shopify data layer — port `lib/shopify.ts` + `lib/shopify-queries.ts` from shopSite; set up env vars
2. CartContext migration — replace mock Product types with ShopifyCartLine; persist cart ID to AsyncStorage
3. Favorites persistence — AsyncStorage, local-only (no auth required)
4. Browse screen — product listing with Shopify data
5. Product detail — image carousel + variant selection + Add to Cart
6. Cart screen — display Shopify cart + quantity controls + checkout button

**Second tier (content + discovery):**
7. Maker profile — bio + products from this maker
8. Blog feed + post detail (static mock data)
9. About + FAQ screens

**Third tier (auth + polish):**
10. Customer auth — sign in/up, order history
11. ProgressVine checkout step indicator
12. Botanical animations (Reanimated)
13. Masonry favorites grid

**Defer:**
- Custom commissions request flow — FAQ mentions it but it's just an email CTA in v1
- Blog CMS / Shopify blog API integration — explicitly out of scope per PROJECT.md
- Push notifications — explicitly deferred to v2
- Analytics — explicitly deferred to v2

---

## Shopify-Specific Technical Notes

### Variant Selection is Non-Negotiable

Shopify cart mutations require a `variantId` (a `ProductVariant.id` in the format `gid://shopify/ProductVariant/123`). You cannot add a product to cart without selecting a variant. Even "simple" products with no user-facing options have exactly one default variant.

Implementation for products WITH variants (Size, Color, etc.):
- Display `selectedOptions` as segmented controls or pills
- Disable the "Add to Cart" button until a valid combination is selected
- Gray out (do not hide) sold-out variant combinations: `variant.availableForSale === false`
- Show variant-specific price (variants can have different prices)
- Show variant-specific image if `variant.image` is non-null

Implementation for products with ONE default variant:
- No UI needed — auto-select the single variant
- `getFirstAvailableVariant()` helper exists in shopify-helpers.ts

### Cart ID Persistence Pattern

```
On first addToCart:
  → Call cartCreate mutation
  → Receive ShopifyCart with cart.id and cart.checkoutUrl
  → Persist cart.id to AsyncStorage('wildenflower-cart-id')

On app launch:
  → Read AsyncStorage('wildenflower-cart-id')
  → If exists: call GET_CART_QUERY to hydrate
  → If cart returns null (expired): clear storage, start fresh

Cart expiry: Shopify carts expire after ~10 days of inactivity. Handle gracefully.
```

### Favorites Persistence (No Shopify Involvement)

Shopify Storefront API has no native wishlist/favorites feature. Favorites stay client-local.

```
Strategy:
  → Persist favorites as array of product IDs in AsyncStorage
  → Full product data is re-fetched from Shopify when favorites screen loads
  → OR: persist full ShopifyProduct objects in AsyncStorage (simpler, larger payload)

Recommendation: Persist full ShopifyProduct objects.
  → Favorites screen works offline
  → No need to re-fetch per favorite ID
  → ShopifyProduct type from shopSite types/shopify.ts is well-defined
  → Stale data acceptable (prices can drift, but warn if price changed)
```

### Search Pattern

The shopSite `searchProducts()` function uses Shopify's Predictive Search API (the `search` query field). This has better typo tolerance and relevance than filtering `getProducts`. Use `SEARCH_PRODUCTS_QUERY` for the search bar.

The Browse screen category filtering uses `GET_COLLECTION_BY_HANDLE_QUERY` — each product category (`earth`, `woven`, `light`, `color`, `crafted`) should map to a Shopify collection handle configured in Shopify Admin.

### Maker Profile Data Strategy

Shopify's `vendor` field is a flat string (the maker's name). Rich maker profiles need one of:
- **Shopify metaobjects** (recommended for production): Create a "Maker" metaobject type in Shopify Admin with bio, location, avatar, specialties fields. Query via `metaobjects` query.
- **Local mapping** (acceptable for v1): `data/mock-data.ts` makers keyed by `vendor` name string. Simple but requires manual sync with Shopify Admin vendor names.

For v1, the local mapping approach is faster and avoids metaobject complexity. The `Maker` type and `makers` array in `mock-data.ts` already has all needed fields.

### Image Carousel — Web Compatibility

React Native's `ScrollView` with `horizontal` and `pagingEnabled` works on iOS/Android but has inconsistent behavior on Expo Web. Options:
- `FlatList` with `pagingEnabled` and `horizontal` — better web support
- Wrap with a platform check and use `<View style={{overflow: 'scroll'}}>` on web
- Community library: `react-native-reanimated-carousel` (supports web via Reanimated)

Recommendation: Use `react-native-reanimated-carousel` — it works across platforms, has web support, and uses Reanimated (already in the stack) for animations.

---

## Sources

- Direct codebase analysis: `/Users/jamesputman/SRC/wildenflowerShop/` (HIGH confidence)
- shopSite reference implementation: `/Users/jamesputman/SRC/shopSite/lib/` (HIGH confidence — working production code)
- Shopify Storefront API types: `/Users/jamesputman/SRC/shopSite/types/shopify.ts` (HIGH confidence — current API version 2025-04)
- Mockup inspection: `projectVision/` PNG files — mobile home, product listing, checkout, blog, about, FAQ (HIGH confidence — primary design spec)
- CLAUDE.md brand rules (HIGH confidence — authoritative project document)
- PROJECT.md requirements (HIGH confidence — authoritative project document)
- `data/mock-data.ts` data model (HIGH confidence — existing schema)
- `types/index.ts` type definitions (HIGH confidence — existing schema)
- `context/CartContext.tsx` existing state management (HIGH confidence)
- `constants/theme.ts` design tokens and copy (HIGH confidence)
