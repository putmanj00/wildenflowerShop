# Architecture

**Analysis Date:** 2026-02-19

## Pattern Overview

**Overall:** Layered Mobile App Architecture with Expo Router (File-Based Routing)

**Key Characteristics:**
- React Native + Expo for cross-platform (iOS/Android)
- Expo Router for file-based screen routing and navigation
- React Context for global state management (cart + favorites)
- Component-driven UI with theme tokens as single source of truth
- Separation of concerns: screens → components → types → constants
- Mock data layer (local) with clear path to API integration

## Layers

**Routing / Navigation Layer:**
- Purpose: Define app screens and navigation structure
- Location: `app/` directory
- Contains: Screen files (`.tsx`) organized by route structure
- Depends on: Expo Router, React Native navigation primitives
- Used by: All screens access navigation via `useRouter()` from `expo-router`

**Screen / Container Layer:**
- Purpose: Full-screen views that compose components and manage screen-specific state
- Location: `app/(tabs)/` (tabbed screens), `app/` (full-screen routes)
- Contains: HomeScreen (`index.tsx`), BrowseScreen (`browse.tsx`), ProductDetailScreen (`product/[id].tsx`), etc.
- Depends on: Components, Context (CartContext), Router, Types, Constants
- Used by: Routing layer invokes these as screen components
- Pattern: Each screen imports data from `mock-data.ts`, uses context for global state, and composes presentational components

**Component Layer:**
- Purpose: Reusable, presentational UI components with no business logic
- Location: `components/` directory
- Contains: ProductCard, ProductGrid, BotanicalHeader, CategoryRow, MakerBadge, SectionTitle, etc.
- Depends on: Types, Constants (theme), Context for reading shared state
- Used by: Screens import and compose components into layouts
- Pattern: Components accept data via props, fire callbacks for state changes, always import from `constants/theme` for styling

**State Management Layer:**
- Purpose: Global cart and favorites state
- Location: `context/CartContext.tsx`
- Contains: useReducer hook, CartProvider, useCart hook
- Depends on: React Context, Types
- Used by: Screens and components via `useCart()` hook to read/dispatch cart and favorites actions
- Pattern: Redux-like reducer with typed actions; computed properties (cartTotal, cartCount) from state

**Data / Types Layer:**
- Purpose: Type definitions and mock data
- Location: `types/index.ts` and `data/mock-data.ts`
- Contains: TypeScript interfaces (Product, Maker, BlogPost, FAQItem, CartItem, User, etc.) and sample product/maker/blog data
- Depends on: Nothing (leaf layer)
- Used by: All screens, components, context
- Pattern: Clear data models allow easy swap to real API later

**Constants / Design System Layer:**
- Purpose: Single source of truth for all visual/UX decisions
- Location: `constants/theme.ts`
- Contains: Colors, typography (fonts + sizes), spacing, border radii, shadows, animations, UI copy, brand pillars
- Depends on: Nothing (leaf layer)
- Used by: Every component and screen imports from theme
- Pattern: Never hardcode values—always import tokens

## Data Flow

**Product Browsing Flow:**

1. User taps Home tab → Router loads `app/(tabs)/index.tsx` (HomeScreen)
2. HomeScreen imports products from `data/mock-data.ts`
3. HomeScreen passes products to ProductGrid component
4. ProductGrid splits products into left/right columns, renders ProductCard for each
5. ProductCard displays product info, uses `isFavorite` and `toggleFavorite` from CartContext
6. User taps ProductCard → `handleProductPress()` calls `router.push('/product/{id}')`
7. ProductDetailScreen loads (not yet built, placeholder exists at `app/product/[id].tsx`)

**Cart/Favorites State Flow:**

1. User taps favorite button on ProductCard
2. ProductCard calls `onFavoriteToggle(productId)` callback
3. ProductCard's parent (ProductGrid) passes this to screen's handler, or ProductCard uses `toggleFavorite()` from context directly
4. `toggleFavorite()` dispatch → CartReducer adds/removes productId from `state.favorites[]`
5. CartContext.Provider re-renders subscribers with new state
6. ProductCard receives updated `isFavorite` prop, heart icon updates
7. Tab bar's Cart badge reads `cartCount` from CartContext and updates

**Cart Addition Flow:**

1. User taps "Add to Cart" on ProductDetail screen (not yet built)
2. Component calls `addToCart(product)`
3. CartReducer adds CartItem (product + quantity: 1) to `state.items[]`, or increments quantity if already present
4. CartContext subscribers re-render with new cartTotal and cartCount
5. Tab bar badge updates immediately

**State Management:**

- Global: Cart items, favorites, cart total, item count live in CartContext
- Local: Active category on Home screen (useState), form inputs on screens (useState)
- Computed: cartTotal, cartCount calculated in CartContext from state.items

## Key Abstractions

**Product Entity:**
- Purpose: Represents a handmade item for sale
- Examples: See `types/index.ts` Product interface
- Pattern: Immutable data structure passed through layers; CartItem wraps Product with quantity

**Maker Entity:**
- Purpose: Represents an artisan/creator
- Examples: See `data/mock-data.ts` makers array, referenced by each Product
- Pattern: Embedded in Product; MakerBadge component displays maker info; future: Maker detail screen

**CartItem Abstraction:**
- Purpose: Couples Product with quantity for checkout calculation
- Examples: CartContext maintains CartItem[] in state
- Pattern: Product remains immutable; CartItem adds ephemeral quantity

**Component Patterns:**

**Container Components** (Screens):
- Read data and context
- Pass data/callbacks down to presentational components
- Handle navigation
- Examples: HomeScreen, BrowseScreen

**Presentational Components** (UI Elements):
- Accept data via props
- Fire callbacks for user interaction
- No direct context reads (except ProductGrid for favorites convenience)
- Examples: ProductCard, CategoryChip, BotanicalHeader, SectionTitle

**Utility Components** (Layout/Styling):
- No data dependencies, just styling wrapper
- Examples: BotanicalDivider, BotanicalHeader (with variants), WatercolorWash

## Entry Points

**App Entry:**
- Location: `app/_layout.tsx`
- Triggers: Expo startup
- Responsibilities: Font loading, CartProvider wrapper, Stack navigator setup, splash screen management

**Tab Navigation:**
- Location: `app/(tabs)/_layout.tsx`
- Triggers: App startup or stack navigation to (tabs) group
- Responsibilities: Tabs configuration, tab bar styling, cart badge binding

**Home Screen:**
- Location: `app/(tabs)/index.tsx`
- Triggers: User taps Home tab or app loads
- Responsibilities: Display featured products, category filter (local state), hero content

**Browse Screen:**
- Location: `app/(tabs)/browse.tsx`
- Triggers: User taps Browse tab or "See All" action from Home
- Responsibilities: Product listing with filters (design spec exists in CLAUDE.md)

**Product Detail:**
- Location: `app/product/[id].tsx` (placeholder exists)
- Triggers: User taps ProductCard
- Responsibilities: Image carousel, product story, add to cart, related products (not yet built)

## Error Handling

**Strategy:** Defensive prop handling + optional chaining

**Patterns:**
- Component props have optional types with defaults (e.g., `isFavorite?: boolean = false`)
- CartContext `useCart()` hook throws if called outside CartProvider (prevents silent failures)
- Screens check `useLocalSearchParams()` for route params; handle missing gracefully (ProductDetailScreen uses placeholder pattern)
- No try/catch blocks present (mock data is deterministic; production would need error boundaries)

## Cross-Cutting Concerns

**Logging:** None currently implemented (console available for debugging)

**Validation:** None currently implemented. TypeScript provides compile-time safety. Runtime validation would be added at API integration layer.

**Authentication:** Not yet implemented. Placeholder User type exists in `types/index.ts` for future auth integration.

**Styling:** Centralized in `constants/theme.ts`; all components import and use tokens. No inline hardcoded colors/fonts/spacing.

**Accessibility:** Built-in:
- `accessibilityRole`, `accessibilityLabel` on interactive elements
- Semantic HTML via React Native (Text, TouchableOpacity, etc.)
- Tab bar labels and cart badge aria descriptions

---

*Architecture analysis: 2026-02-19*
