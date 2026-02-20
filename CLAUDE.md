# CLAUDE.md — Wildenflower App

## What This Is

Wildenflower is a curated e-commerce mobile app for handmade artisan goods — tie-dye, jewelry, leather goods, artwork, and crystals made by local artisans. Built with React Native (Expo) targeting iOS and Android.

## Brand Identity — READ THIS FIRST

**This is not a generic e-commerce app.** Every pixel must embody the Wildenflower brand.

**Visual Style:** 1960s psychedelic art nouveau blended with vintage botanical illustration. Victorian naturalist field guide meets 1967 Fillmore concert poster. The interface is framed by hand-drawn ink-and-watercolor mushrooms (red-capped amanitas, golden chanterelles, toadstools), ferns, wildflowers, trailing vines, and moss. Aged parchment backgrounds. Decorative serif typography. The energy is enchanted, earthy, free-spirited, joyfully psychedelic, warm, and unhurried.

**Tagline:** "Made by hand. Found by heart."

**Brand Pillars:**
1. Authenticity Over Perfection — we celebrate the handmade and imperfect
2. Freedom & Joy — vibrant, unscripted, no pressure or manipulation
3. Connection & Community — every purchase is a relationship, not a transaction
4. Intentional Living — curated, thoughtful, slow, anti-disposable

## Critical Design Rules

### Colors — ALWAYS use these exact values from constants/theme.ts
- `colors.terracotta` (#C8642A) — primary brand, CTAs, headings
- `colors.crimson` (#8B1A3A) — deep accent, emphasis
- `colors.gold` (#C9A642) — buttons, highlights, prices
- `colors.sage` (#7B8B6F) — secondary text, nature elements
- `colors.forest` (#1E3B30) — dark sections, contrast backgrounds
- `colors.dustyRose` (#D08B7A) — watercolor washes, soft highlights
- `colors.lavender` (#C4B0CC) — watercolor washes, categories
- `colors.parchment` (#F5EDD6) — PRIMARY BACKGROUND ON ALL SCREENS
- `colors.earth` (#3B2F2F) — body text, icons

### NEVER:
- Use `#FFFFFF` (pure white) → use `colors.parchment` or `colors.parchmentLight`
- Use `#000000` (pure black) → use `colors.earth`
- Use sans-serif fonts → this is a serif-first brand
- Use system default styling → everything is custom
- Create urgency (no countdown timers, no "only X left!")
- Use dark patterns or manipulative UX

### ALWAYS:
- Import from `constants/theme.ts` — never hardcode values
- Use components from `components/` — don't recreate existing ones
- Use generous spacing — the app should feel unhurried
- Use warm earth-toned shadows (shadowColor: colors.earth), not gray
- Background of every screen: `colors.parchment` (#F5EDD6)

### Typography
- Headings: Playfair Display (Bold) — decorative serif
- Body: Lora (Regular) — warm readable serif
- Accent/quotes: Playfair Display Italic
- Never use Inter, Roboto, Arial, or any sans-serif

### UI Vocabulary
- Users are "finders," not "customers"
- Sellers are "makers," not "vendors"  
- Shopping is "discovering" or "wandering"
- "Explore" not "Shop" / "Discover" not "Browse"
- Empty cart: "Nothing here yet — but the best things take time."
- Checkout: "You're about to make someone's day."

## Tech Stack
- React Native with Expo SDK 52+
- Expo Router (file-based routing)
- TypeScript everywhere
- StyleSheet.create for styling (using theme tokens)
- React Context for cart/favorites state (context/CartContext.tsx)
- React Native Reanimated for animations

## Project Structure
```
wildenflower-app/
├── CLAUDE.md                    ← You are here
├── app/                         ← Expo Router screens
│   ├── _layout.tsx              ← Root layout (CartProvider wrapper)
│   ├── (tabs)/                  ← Tab navigator screens
│   │   ├── _layout.tsx          ← Tab bar configuration
│   │   ├── index.tsx            ← Home screen
│   │   ├── browse.tsx           ← Product listing / Browse
│   │   ├── favorites.tsx        ← Saved / wishlisted items
│   │   ├── cart.tsx             ← Shopping cart
│   │   └── profile.tsx          ← User profile & settings
│   ├── product/[id].tsx         ← Product detail
│   ├── blog/
│   │   ├── index.tsx            ← Blog feed
│   │   └── [id].tsx             ← Blog post detail
│   ├── maker/[id].tsx           ← Maker profile
│   ├── checkout.tsx             ← Checkout flow
│   ├── about.tsx                ← Our Story
│   └── faq.tsx                  ← Questions & Curiosities
├── assets/
│   ├── fonts/                   ← Playfair Display + Lora font files
│   └── images/                  ← All illustrated botanical assets
│       ├── headers/             ← Full-width botanical banner illustrations
│       ├── dividers/            ← Horizontal botanical divider strips
│       ├── corners/             ← Card corner botanical details
│       ├── icons/
│       │   ├── categories/      ← Circular category illustrations
│       │   ├── tabs/            ← Tab bar icons (active + inactive)
│       │   └── ui/              ← Functional icons (arrows, expand/collapse)
│       ├── empty-states/        ← Illustrated empty state graphics
│       ├── splash/              ← Splash screen bloom elements
│       ├── about/               ← Cartouche frame, drop caps, dividers
│       ├── blog/                ← Pull quote frame
│       ├── checkout/            ← Garland, parcel illustration
│       └── faq/                 ← Contact callout border
├── components/                  ← Reusable UI components
│   └── (see components/ directory for full list)
├── constants/
│   ├── theme.ts                 ← ALL design tokens — the source of truth
│   └── asset-manifest.ts        ← List of all illustrated assets needed
├── context/
│   └── CartContext.tsx           ← Cart & favorites state management
├── data/
│   └── mock-data.ts             ← Sample products, makers, blog posts, FAQ
├── hooks/                       ← Custom React hooks
└── types/
    └── index.ts                 ← TypeScript type definitions
```

## Screen Descriptions (Reference Mockup Images)

### Home Screen (tabs/index.tsx)
- BotanicalHeader: full-width illustrated banner (200px tall)
- Hero card: featured image with tagline overlay
- CategoryRow: horizontal scroll of circular botanical category icons
- BotanicalDivider between sections
- ProductGrid: 2-column grid of product cards with botanical corners
- Bottom tab bar

### Browse / Product Listing (tabs/browse.tsx)
- Compact BotanicalHeader
- Page title in terracotta decorative serif
- FilterChipRow: horizontal scroll of filter pills with botanical icons
- Active filters get watercolor wash background (dusty rose)
- 2-column ProductGrid
- Botanical dividers between product rows

### Product Detail (product/[id].tsx)
- Image carousel (swipeable)
- Product name in large decorative serif
- Price in warm gold
- MakerBadge with avatar
- Description text
- "The Story Behind This Piece" in WatercolorWash
- Materials & care
- Sticky bottom bar with gold "Add to Cart" button
- Related products horizontal scroll

### Checkout (checkout.tsx)
- ProgressVine: mushroom → fern → flower → sun steps connected by vine
- Multi-step form (Cart → Shipping → Payment → Confirmation)
- FormInputs with vine-tendril borders
- Order summary card with fern border on left edge
- Parcel illustration near total
- Gold checkout button with botanical wreath
- "You're about to make someone's day" in sage italic

### Blog (blog/index.tsx)
- BotanicalHeader with mushroom forest scene
- FilterChipRow for categories (Maker Stories, Behind the Craft, Community)
- Featured article card with photo and overlaid title
- Stacked blog post cards
- Botanical dividers between posts (varying)
- Pull quotes in terracotta italic on watercolor wash

### About (about.tsx)
- Illustrated cartouche (oval botanical frame) with photo inside
- Brand story in generous paragraphs with illustrated drop caps
- Botanical illustration dividers between sections
- Brand pillars in 2x2 grid with circular botanical icons

### FAQ (faq.tsx)
- Illustrated mushroom cluster header
- "Questions & Curiosities" in psychedelic serif
- FilterChipRow for categories
- BotanicalAccordion items: fern unfurls on expand, curls on collapse
- Answers on alternating watercolor washes (rose, lavender, sage)
- "Still curious?" contact callout with gold button

### Cart (tabs/cart.tsx)
- Cart item cards with quantity controls
- Order summary with botanical styling
- Gold "Proceed to Checkout" button
- Empty state: botanical illustration + "Nothing here yet..."

### Favorites (tabs/favorites.tsx)
- Masonry-style grid of saved products
- Toggle pills: "Recently Saved" / "By Maker"
- Empty state: "Your collection is just beginning."

### Profile (tabs/profile.tsx)
- Botanical header with user name in wreath frame
- Menu items as parchment cards with botanical icons
- Vine-tendril right arrows instead of chevrons

## Botanical Assets — Placeholder Strategy

Custom illustrated assets are NOT in the project yet. When building components that need them:

1. Use `View` with background color as placeholder, sized correctly
2. Add a comment: `{/* ASSET: filename.png — description */}`
3. Reference `constants/asset-manifest.ts` for exact dimensions and descriptions
4. Structure the layout so assets can be dropped in as `<Image source={require(...)} />` later

Example:
```tsx
{/* ASSET: botanical-header-large.png — Dense mushroom/fern/wildflower panoramic illustration */}
<View style={{ width: '100%', height: 200, backgroundColor: colors.parchmentDark }}>
  {/* Replace with: <Image source={require('../assets/images/headers/botanical-header-large.png')} /> */}
</View>
```

## Animation Guidelines
- Screen transitions: gentle page-turn feeling (400ms, ease-in-out)
- Loading states: growth/blooming motions (unfurling fern, opening flower)
- Accordion expand: fern unfurling (450ms)
- Watercolor wash reveals: soft bloom effect (600ms)
- Tap feedback: soft watercolor wash spreading
- Never bouncy, mechanical, or harsh — everything is organic and gentle
- Use React Native Reanimated for all animations

## Commands
```bash
npx expo start          # Start dev server
npx expo start --ios    # iOS simulator
npx expo start --android # Android emulator
```
