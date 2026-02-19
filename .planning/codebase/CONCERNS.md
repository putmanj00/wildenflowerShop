# Codebase Concerns

**Analysis Date:** 2025-02-19

## Incomplete Implementations

**Stub Screens (11 unbuilt):**
- Issue: Core screens have placeholder implementations — these are critical for app functionality
- Files:
  - `app/(tabs)/browse.tsx` — Product listing/filtering (core feature)
  - `app/(tabs)/favorites.tsx` — Saved items (core feature)
  - `app/(tabs)/cart.tsx` — Shopping cart (core feature)
  - `app/(tabs)/profile.tsx` — User profile/settings
  - `app/product/[id].tsx` — Product detail view (essential)
  - `app/blog/index.tsx` — Blog feed
  - `app/blog/[id].tsx` — Blog post detail
  - `app/maker/[id].tsx` — Maker profile view
  - `app/checkout.tsx` — Multi-step checkout flow (critical)
  - `app/about.tsx` — Brand story page
  - `app/faq.tsx` — FAQ/Q&A section
- Impact: App is non-functional. Users cannot browse products, add to cart, checkout, or view details. Core e-commerce flows missing.
- Fix approach: Priority implementation order should be: `product/[id]` → `browse` → `cart` → `checkout` → remaining screens. See CLAUDE.md for full UI specs.

## State Management Gaps

**No Persistence:**
- Issue: Cart and favorites stored only in React Context (in-memory). Data is lost on app restart.
- Files: `context/CartContext.tsx`
- Impact: User loses all cart items and favorites when they close and reopen the app. Critical UX problem for mobile.
- Workaround: None — app behaves correctly but data doesn't persist.
- Fix approach: Implement AsyncStorage persistence. Add `useEffect` in CartProvider to sync state to AsyncStorage on every change. Load from storage on initialization. Consider debouncing to avoid excessive I/O.

**No User Authentication:**
- Issue: No user login/signup system. Profile, addresses, order history, and account management are placeholders.
- Files: `app/(tabs)/profile.tsx`, `types/index.ts` (User interface defined but never instantiated)
- Impact: Cannot implement personalized experiences (saved addresses, order history, wishlists tied to accounts). Profile screen cannot be built.
- Fix approach: Integrate auth provider (Firebase Auth, Supabase, or custom API). Create `context/AuthContext.tsx` for user session management.

**No Backend Integration:**
- Issue: App is hardcoded to mock data. No real product data, no API connectivity.
- Files: `data/mock-data.ts` (282 lines of static data), all product/maker/blog queries pull from this file
- Impact: Cannot fulfill real orders, fetch real product inventory, or serve actual marketplace content.
- Fix approach: Replace mock data queries with API calls. Create services layer (`services/api.ts`) with endpoints for products, makers, blog, FAQ. Implement proper error handling and loading states.

## Data Quality Issues

**Empty Product Images:**
- Issue: All products have `images: []` in mock data. Image placeholders don't load actual assets.
- Files: `data/mock-data.ts` (lines 71, 84, 96, 108, 120, 132, 146, 156, 169, 177)
- Impact: ProductCard displays placeholder text instead of images. Visual appeal severely degraded. App looks unfinished.
- Fix approach: Add sample image URIs to mock data or implement image upload for makers. Create asset upload system once backend exists.

**Empty Blog Content:**
- Issue: Blog posts have empty `content` and `coverImage` fields.
- Files: `data/mock-data.ts` (line 192-193 and throughout)
- Impact: Blog screen cannot display anything. Pull quotes are present but content/images missing.
- Fix approach: Add sample blog post content and cover image URIs. Implement rich text rendering for blog content.

**Incomplete Product Metadata:**
- Issue: Some products missing optional but important fields (story, careInstructions). No ratings or reviews.
- Files: `data/mock-data.ts`, `types/index.ts` (Product interface has optional fields but no review data structure)
- Impact: Product detail views incomplete. "The Story Behind This Piece" section missing for some items.
- Fix approach: Populate mock data with all fields. Add `reviews: Review[]` to Product type if reviews are planned.

## Fragile UI Components

**Asset/Image Placeholders Not Swappable:**
- Issue: Components use placeholder Views with hardcoded colors. Comments mention asset filenames but no structured system for swapping them in.
- Files:
  - `components/ProductCard.tsx` (lines 56-72) — product image, corner assets
  - `components/MakerBadge.tsx` (lines 29-30) — maker avatar
  - `app/(tabs)/index.tsx` (line 55) — botanical header
- Impact: When botanical assets arrive, finding and replacing all placeholders is error-prone. Risk of incomplete asset swap leading to missing images.
- Fix approach: Create `constants/assetRegistry.ts` with centralized asset path mapping. Use `Image source={assetRegistry.productImage}` pattern instead of comments. Ensure compiler catches missing assets.

**Magic String Product IDs:**
- Issue: Product lookups use string IDs that must match exactly. No type safety on ID format.
- Files: `app/(tabs)/index.tsx` (line 41), `components/ProductCard.tsx` (line 37), `context/CartContext.tsx` (line 58)
- Impact: Easy to pass wrong product ID causing data not found errors. No validation or error handling.
- Fix approach: Consider UUID or enum for product IDs. Add type guard functions for ID validation.

**Dynamic Route Parameters Not Validated:**
- Issue: Routes like `product/[id]` and `blog/[id]` accept any string ID but don't validate against available data.
- Files: `app/product/[id].tsx` (line 11), `app/blog/[id].tsx` (line 11), `app/maker/[id].tsx` (line 11)
- Impact: Navigating to `/product/invalid-id` returns blank screen with no error message. Bad UX.
- Fix approach: Add ID validation in route handlers. Implement proper error screens for invalid IDs.

## Missing Error Handling

**No Try/Catch in Cart Operations:**
- Issue: CartContext reducer doesn't validate data before mutations. Quantity can become negative or non-integer.
- Files: `context/CartContext.tsx` (lines 61-77 UPDATE_QUANTITY handles <= 0 but no type validation)
- Impact: Edge cases could corrupt cart state. No handling for malformed product objects.
- Fix approach: Add validation to all reducer actions. Check for invalid product shapes, negative quantities, etc.

**No Error Boundaries:**
- Issue: No error boundary component wrapping app. Component crashes unhandled.
- Files: None (not implemented)
- Impact: App crashes silently on component errors with no user feedback.
- Fix approach: Implement error boundary in `app/_layout.tsx` or create `components/ErrorBoundary.tsx`.

**Network Failure Not Considered:**
- Issue: No loading states, error states, or retry logic. App assumes mock data always available and future API calls always succeed.
- Files: Entire screen implementations missing these patterns
- Impact: Future API integration will fail without proper error handling. Users see blank screens on network errors.
- Fix approach: Add loading/error states to all async operations. Implement retry logic with exponential backoff.

## Scaling Concerns

**Mock Data Hardcoded:**
- Issue: All product data embedded in app. Adding more products increases bundle size and initial load.
- Files: `data/mock-data.ts` (282 lines, will grow linearly with products)
- Impact: App grows unnecessarily. No lazy loading or pagination strategy.
- Fix approach: Implement server-side pagination. Fetch data on demand, not all at once.

**No Caching Strategy:**
- Issue: Context state not cached. Every app restart loses data. Future API calls have no caching.
- Files: `context/CartContext.tsx`, entire app
- Impact: Excessive data refetching. Poor offline experience.
- Fix approach: Implement cache layer. Use AsyncStorage or realm for local cache with TTL. Support offline mode.

**Category Filtering Not Implemented:**
- Issue: CategoryRow component exists, categories defined, but filtering logic not built into Browse screen.
- Files: `app/(tabs)/index.tsx` (lines 36, 44-46 show state but no actual filtering), `app/(tabs)/browse.tsx` (not implemented)
- Impact: Users cannot filter products by category. Core UX feature missing.
- Fix approach: Implement category filter in Browse screen. Wire category state to product grid filtering.

## Type Safety Gaps

**Loose Route Typing:**
- Issue: Routes are strings. Easy to typo navigation paths. No compile-time checking.
- Files: `app/(tabs)/index.tsx` (line 72 `router.push('/(tabs)/browse')`), ProductCard, HomeScreen
- Impact: Navigation bugs only caught at runtime.
- Fix approach: Create typed route constants. Use `as const` pattern for route names.

**Product Category Strings Not Enumerated:**
- Issue: Categories stored as arbitrary strings: `'earth'`, `'woven'`, `'light'`, etc. No validation.
- Files: `data/mock-data.ts` (lines 72, 85, 97, etc.), `types/index.ts` (Product.category is string)
- Impact: Typos in category names cause orphaned products. No validation when creating products.
- Fix approach: Create `categories.ts` with enum or const union type. Use throughout app.

## Performance Concerns

**ProductGrid Renders All Items:**
- Issue: ProductGrid on home screen calls `products.slice(0, 6)` — fine for 6 items, but Browse screen will render all products in single grid.
- Files: `components/ProductGrid.tsx` (lines not shown but likely no pagination), `app/(tabs)/index.tsx` (line 38)
- Impact: If product count grows large, Browse screen becomes slow/laggy. No pagination or virtualization.
- Fix approach: Implement FlatList or FlashList with pagination. Add "Load More" button.

**Favorite Lookups O(n):**
- Issue: isFavorite checks favorites array with `.includes()` — linear search.
- Files: `context/CartContext.tsx` (line 130)
- Impact: With many favorites, lookups become slow. Should be O(1).
- Fix approach: Change `favorites: string[]` to `favorites: Set<string>` or use a Map for O(1) lookups.

## Asset Management

**Botanical Assets Completely Missing:**
- Issue: All illustrated assets referenced in component comments but no files exist. App is visual brand that needs visuals.
- Files: All components have `{/* ASSET: ... */}` placeholders
- Impact: App looks unfinished. Brand identity not communicated through visuals. App cannot launch.
- Fix approach: Implement placeholder system (colored boxes with labels) for development. Create asset manifest in `constants/asset-manifest.ts` (file exists, check contents). When assets arrive, replace placeholders systematically.

**No Asset Optimization:**
- Issue: No image optimization, no WebP or variant sizes. No lazy loading strategy.
- Files: None (future concern)
- Impact: When real images added, app could be slow on slow networks. Bundle size could explode.
- Fix approach: Use Expo's Image component with placeholder prop. Optimize images before adding.

## Code Organization Issues

**Components Directory Flat:**
- Issue: All 12 components at root level. No organization by feature/feature area.
- Files: `components/` (no subdirectories)
- Impact: As component count grows, directory becomes hard to navigate. Coupling between unrelated components unclear.
- Fix approach: Organize by feature: `components/product/`, `components/layout/`, `components/common/`, etc.

**Theme File Too Large:**
- Issue: theme.ts is 306 lines. Contains colors, fonts, spacing, animations, UI copy, categories, brand pillars, FAQ categories — all mixed.
- Files: `constants/theme.ts`
- Impact: Hard to find specific tokens. Mixing concerns (design tokens vs content copy). Difficult to maintain.
- Fix approach: Split into: `constants/colors.ts`, `constants/typography.ts`, `constants/spacing.ts`, `constants/copy.ts`, `constants/categories.ts`, `constants/animation.ts`.

**No Hooks Directory:**
- Issue: CLAUDE.md mentions `hooks/` but none exist yet. Custom hooks should have dedicated space.
- Files: No `hooks/` directory
- Impact: As custom hooks added, unclear where to put them. May end up scattered.
- Fix approach: Create `hooks/` directory now (even if empty). Add `useCart.ts` wrapper if needed.

## Security Concerns

**No Input Validation:**
- Issue: No validation on user-facing inputs. Quantity picker, search, form fields accept anything.
- Files: All incomplete screens (not yet implemented)
- Impact: Future API implementation vulnerable to injection attacks or malformed data.
- Fix approach: Implement validation layer. Use library like `zod` or `yup` for schema validation.

**No Environment Configuration:**
- Issue: No `.env` file structure for API endpoints, keys, etc.
- Files: None
- Impact: API keys/endpoints will be hardcoded when backend added. Risk of leaking credentials.
- Fix approach: Create `.env.example` with required variables. Load config from environment in production.

**Cart Total Computed Every Render:**
- Issue: `cartTotal` computed on every context update without caching.
- Files: `context/CartContext.tsx` (lines 132-135)
- Impact: Minor performance issue now, but indicates lack of memoization patterns. Future calculations could be expensive.
- Fix approach: Usememo for computed values like `cartTotal` and `cartCount`.

## Testing Gaps

**No Tests Exist:**
- Issue: Zero test files. No jest.config.js or test setup.
- Files: None
- Impact: Cannot verify behavior. Refactoring risky. No safety net for complex logic.
- Fix approach: Add Jest/Vitest config. Start with critical path: CartContext reducer tests, navigation tests, ProductCard component tests.

## Accessibility Concerns

**Partial a11y Implementation:**
- Issue: Some components have accessibility attributes (ProductCard, MakerBadge have accessibilityRole/Label), but many don't. Inconsistent approach.
- Files: ProductCard (yes), MakerBadge (yes), CategoryChip (check), others incomplete
- Impact: Partially accessible but not consistently. Screen reader support incomplete.
- Fix approach: Audit all components for a11y. Add missing labels and roles. Test with screen readers.

---

## Priority Summary

### Critical (Blocks Launch)
1. **Stub screens** — Core e-commerce flows missing
2. **Product images** — Visual brand degraded without them
3. **Botanical assets** — Brand identity requires visuals
4. **No authentication** — Cannot support users/personalization
5. **No backend** — Cannot fulfill real orders

### High (Before MVP)
1. **State persistence** — Cart lost on restart
2. **Error handling** — Crashes unhandled
3. **Input validation** — Security risk
4. **Product filtering** — Core UX feature
5. **Route validation** — Navigation errors

### Medium (Quality/Scaling)
1. **Caching strategy** — Performance and offline support
2. **Virtualization** — Scaling to many products
3. **Code organization** — Maintainability
4. **Environment config** — Secret management
5. **Tests** — Confidence in changes

### Low (Polish)
1. **Accessibility audit** — Legal/ethical requirement
2. **Performance optimization** — Image optimization, bundle size
3. **Theme refactoring** — Code organization
4. **Asset registry** — Swapping images when ready

---

*Concerns audit: 2025-02-19*
