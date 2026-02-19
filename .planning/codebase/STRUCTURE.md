# Codebase Structure

**Analysis Date:** 2026-02-19

## Directory Layout

```
wildenflowerShop/
├── app/                           # Expo Router screens & routing
│   ├── _layout.tsx                # Root layout (fonts, CartProvider wrapper)
│   ├── (tabs)/                    # Tab bar screens (5 main routes)
│   │   ├── _layout.tsx            # Tab bar configuration
│   │   ├── index.tsx              # Home screen
│   │   ├── browse.tsx             # Product listing / Browse
│   │   ├── favorites.tsx          # Saved items / Wishlist
│   │   ├── cart.tsx               # Shopping cart (placeholder)
│   │   └── profile.tsx            # User profile & settings (placeholder)
│   ├── product/[id].tsx           # Product detail (dynamic route, placeholder)
│   ├── blog/
│   │   ├── index.tsx              # Blog feed (placeholder)
│   │   └── [id].tsx               # Blog post detail (placeholder)
│   ├── maker/[id].tsx             # Maker profile (placeholder)
│   ├── checkout.tsx               # Checkout flow (placeholder)
│   ├── about.tsx                  # Our Story page (placeholder)
│   └── faq.tsx                    # Questions & Curiosities (placeholder)
├── components/                    # Reusable UI components
│   ├── BotanicalHeader.tsx        # Full-width banner illustration placeholder
│   ├── BotanicalDivider.tsx       # Horizontal botanical separator
│   ├── CategoryChip.tsx           # Individual filter/category pill
│   ├── CategoryRow.tsx            # Horizontal scroll of category chips
│   ├── HeroCard.tsx               # Featured tagline card
│   ├── MakerBadge.tsx             # Maker avatar + name/location
│   ├── PrimaryButton.tsx          # Styled CTA button
│   ├── ProductCard.tsx            # Individual product card (2-column grid item)
│   ├── ProductGrid.tsx            # 2-column product layout container
│   ├── SectionTitle.tsx           # Section heading with optional action link
│   ├── TabIcon.tsx                # Tab bar icons (active/inactive variants)
│   └── WatercolorWash.tsx         # Watercolor background wrapper
├── constants/
│   ├── theme.ts                   # Design tokens: colors, fonts, spacing, shadows, animations
│   └── asset-manifest.ts          # List of botanical assets (for art team)
├── context/
│   └── CartContext.tsx            # Global cart + favorites state (useReducer)
├── data/
│   └── mock-data.ts               # Sample products, makers, blog posts, FAQ items
├── types/
│   └── index.ts                   # TypeScript interfaces (Product, Maker, BlogPost, CartItem, etc.)
├── hooks/                         # Custom React hooks (currently empty, ready for custom logic)
├── assets/
│   ├── fonts/                     # Playfair Display + Lora font files
│   └── images/                    # Botanical illustrations (directory structure below)
│       ├── headers/               # Full-width botanical banners
│       ├── dividers/              # Horizontal separator botanicals
│       ├── corners/               # Card corner details
│       ├── icons/
│       │   ├── categories/        # Circular category illustrations
│       │   ├── tabs/              # Tab bar icon variants
│       │   └── ui/                # Functional icons (arrows, expand/collapse)
│       ├── empty-states/          # Illustrated empty state graphics
│       ├── splash/                # Splash screen bloom elements
│       ├── about/                 # Cartouche frames, drop caps
│       ├── blog/                  # Pull quote frames
│       ├── checkout/              # Garland, parcel illustrations
│       ├── faq/                   # Contact callout borders
│       └── logo/                  # Wildenflower logo variants
├── CLAUDE.md                      # Project spec: brand identity, tech stack, screen details
├── app.json                       # Expo app configuration
├── package.json                   # Dependencies (Expo, React Native, fonts, Reanimated)
├── tsconfig.json                  # TypeScript configuration
└── .planning/
    └── codebase/                  # GSD codebase analysis documents

```

## Directory Purposes

**`app/`**
- Purpose: Expo Router file-based routing. Each `.tsx` file = a route.
- Contains: Screen components (full-screen views)
- Key structure: `(tabs)` group defines 5-tab navigator; other routes are full-screen overlays/detail pages

**`components/`**
- Purpose: Reusable, stateless (or minimal state) UI building blocks
- Contains: ProductCard, ProductGrid, BotanicalHeader, CategoryChip, MakerBadge, etc.
- Pattern: All styled via `constants/theme.ts`; no hardcoded colors/fonts
- Placeholder strategy: Components accept placeholder Views with asset comments for future image swaps

**`constants/`**
- Purpose: Centralized design system tokens and static data
- Contains: `theme.ts` (all visual tokens), `asset-manifest.ts` (art team reference)
- Import everywhere: Every component imports `colors`, `fonts`, `spacing`, `shadows`, `animation` from theme

**`context/`**
- Purpose: React Context for global state
- Contains: CartContext with useReducer, useCart hook
- State shape: { items: CartItem[], favorites: string[] }
- Computed: cartTotal, cartCount derived from state.items

**`data/`**
- Purpose: Mock/sample data for development
- Contains: makers[], products[], (blog posts, FAQ items would go here)
- Migration: Replace data fetches with API calls; swap `import { products } from '../data/mock-data'` → API client call

**`types/`**
- Purpose: TypeScript interface definitions
- Contains: Product, CartItem, Maker, BlogPost, FAQItem, User, Address, Category, BrandPillar, TabRoute
- Pattern: Central source of truth for data shapes

**`hooks/`**
- Purpose: Custom React hooks (currently unused)
- Ready for: useProductFilter, useBlogFeed, useCheckoutStep (future features)

**`assets/`**
- Purpose: Static media (fonts, botanical illustrations)
- Fonts: Playfair Display (headings), Lora (body)
- Images: Organized by visual component (headers, dividers, icons, empty states, etc.)
- Status: Placeholder Views exist; real images drop in when assets arrive

## Key File Locations

**Entry Points:**
- `app/_layout.tsx`: Root layout (fonts + providers)
- `app/(tabs)/_layout.tsx`: Tab bar navigator
- `app/(tabs)/index.tsx`: Home screen

**Configuration:**
- `constants/theme.ts`: Design tokens (the single source of truth)
- `app.json`: Expo app config (name, version, icon, splash screen, plugins)
- `package.json`: Dependencies and scripts
- `tsconfig.json`: TypeScript compiler options

**Core Logic:**
- `context/CartContext.tsx`: State management (add/remove cart items, toggle favorites)
- `data/mock-data.ts`: Sample product data
- `types/index.ts`: Type definitions

**Testing:**
- No test files present (none found in git status)

## Naming Conventions

**Files:**
- Screens: PascalCase + descriptive (e.g., `HomeScreen.tsx`) or index route name (e.g., `index.tsx` for home)
- Components: PascalCase (e.g., `ProductCard.tsx`)
- Contexts: PascalCase + Context suffix (e.g., `CartContext.tsx`)
- Data/utilities: camelCase (e.g., `mock-data.ts`)
- Types: camelCase filename, PascalCase interfaces (e.g., `types/index.ts` exports `Product`, `CartItem`)
- Constants: camelCase filename (e.g., `theme.ts`) with PascalCase exports for enums/objects (e.g., `colors`, `fonts`)

**Directories:**
- Feature areas: lowercase + singular/plural logical name (e.g., `components/`, `context/`, `assets/images/`)
- Route groups: Parentheses notation for logical grouping (e.g., `(tabs)/` for tabbed screens)
- Dynamic routes: Brackets notation (e.g., `product/[id].tsx`, `blog/[id].tsx`)

**Component Exports:**
- Named export pattern: `export const ComponentName: React.FC<Props> = ...`
- Default export: `export default ComponentName`
- Both patterns used (e.g., ProductCard has both named and default exports)

## Where to Add New Code

**New Feature (e.g., search filtering):**
- Primary code: `app/(tabs)/browse.tsx` (add state) + `components/` (new FilterChip variants)
- Tests: Would go in `__tests__/` directory (not present yet)
- Constants: Add new copy strings to `constants/theme.ts` → `copy` object

**New Screen (e.g., detailed maker profile):**
- Implementation: `app/maker/[id].tsx` (already exists as placeholder)
- Component composition: Import components from `components/` and build layout
- Data access: Import makers from `data/mock-data.ts`
- Navigation: Add route definition in `app/_layout.tsx` (already done)

**New Component:**
- File: Create `components/NewComponent.tsx`
- Structure: Import theme tokens, define props interface, export both named and default
- Styling: Use `StyleSheet.create()` with tokens from `constants/theme.ts`
- Placement: If it's a sub-component, no subdirectory needed (flat `components/` structure)

**Utilities / Hooks:**
- Shared helpers: `hooks/` directory (e.g., `useProductFilter.ts`)
- Data transforms: Could live in `utils/` (not present; create if needed)

**Form/Checkout Features:**
- Validation logic: `checkout.tsx` screen (extends placeholder)
- Form components: New components in `components/` (e.g., FormInput, FormSelect)
- Submission: CartContext handles cart updates; checkout screen handles form state

**State/Context Extension:**
- Add new actions to `CartReducer` in `context/CartContext.tsx`
- Export new selector/action from `useCart()` hook
- Use in screens/components via `const { newAction } = useCart()`

## Special Directories

**`assets/images/`:**
- Purpose: Botanical illustrations (hand-drawn, 1960s psychedelic art nouveau style)
- Generated: No (hand-illustrated, commissioned)
- Committed: Yes (part of app bundle)
- Structure: Organized by visual context (headers, dividers, icons, empty states, etc.)
- Placeholders: Components have comments `{/* ASSET: filename — description */}` showing where images go

**`.planning/codebase/`:**
- Purpose: GSD codebase analysis documents (ARCHITECTURE.md, STRUCTURE.md, etc.)
- Generated: Yes (by GSD mapper)
- Committed: Yes (reference for future implementation)

**`node_modules/`:**
- Generated: Yes (npm/yarn install)
- Committed: No (.gitignore)

---

*Structure analysis: 2026-02-19*
