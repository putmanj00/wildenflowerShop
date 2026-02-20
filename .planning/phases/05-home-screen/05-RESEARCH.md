# Phase 5: Home Screen - Research

**Researched:** 2026-02-20
**Domain:** React Native screen wiring, Expo Router navigation params, AppProduct → Product type bridging, pull-to-refresh, skeleton loading states
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Featured Products Source:**
- Fetch featured products from a Shopify collection named "Featured"
- Show 6 products in the ProductGrid (2 columns × 3 rows — matches current layout)
- If the "Featured" collection doesn't exist in Shopify, fall back to the newest 6 products from all products
- "See All" navigates to Browse unfiltered (full catalog, not just the Featured collection)

**Category → Browse Wiring:**
- Categories stay hardcoded in `constants/theme.ts` — no Shopify fetch for CategoryRow
- Tapping a category chip on Home navigates to Browse, pre-filtered to that category (not just highlights it)
- Category filter maps to Shopify: category `id` matches the Shopify collection handle (1:1, e.g. `id: "tie-dye"` → collection handle `"tie-dye"`)

**Loading & Error States:**
- While products load: show skeleton cards (parchment-coloured placeholders) in the 6-slot ProductGrid
- On fetch failure: show a brand-voiced error message in place of the grid (e.g. "The shop is resting. Try again soon.")
- Home screen supports pull-to-refresh — finders can pull down on the ScrollView to reload Shopify products

**Hero Card:**
- Hero card has a dedicated button (e.g. "Explore the Shop") — not a full-card tap target
- Button navigates to Browse, all products, unfiltered
- Hero background: static illustrated botanical image from assets (uses illustrated asset when available; parchment/forest colour placeholder until then)

### Claude's Discretion

- Skeleton card visual design (exact placeholder colours, shimmer vs static)
- Error message copy (brand voice guidance: warm, unhurried — avoid "Error" or "Failed")
- Pull-to-refresh indicator style
- Exact button label copy (should follow brand vocabulary — "Wander the Shop", "Explore the Shop", etc.)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| COMM-01 | Home screen implemented to match `projectVision/wildenflowerHomeScreen.png` with live featured products from Shopify | Layout components already exist and match mockup; data layer (useProducts, getCollectionByHandle) is ready; type bridging gap identified and solution documented; navigation wiring pattern confirmed |
</phase_requirements>

---

## Summary

Phase 5 is primarily a wiring phase: the structural layout components for the Home screen already exist and match the mockup. The primary technical work is (1) replacing mock data with live Shopify products, (2) bridging the `AppProduct` type from the data layer to the `Product` type expected by existing UI components, (3) adding a button to HeroCard, (4) wiring category taps to navigate to Browse with a filter param, (5) implementing pull-to-refresh on the ScrollView, and (6) implementing skeleton cards and a brand-voiced error state.

The largest technical decision is how to bridge the `AppProduct` → `Product` type gap. `ProductCard` and `ProductGrid` both import `Product` from `types/index.ts` and access fields like `product.name`, `product.price` (as a number), `product.maker`, `product.images[0]` (as a string URI), and `product.category`. But `AppProduct` (Shopify-mapped) uses `title`, `priceRange.minVariantPrice.amount` (as a decimal string), `vendor`, `images[0].url` (as an object with `.url`), and `productType`/`tags`. Rather than rewriting the existing components or their prop types, the cleanest approach is a lightweight mapping function that converts `AppProduct` to `Product` within the Home screen, using `vendor` as a stub `Maker` since no maker lookup is needed on the Home screen. This avoids touching `ProductCard`/`ProductGrid` (which are used correctly by the mock-data-driven screens) until a later phase does a proper cleanup.

Expo Router 4.x (installed as `~4.0.0`) supports passing query params via the `router.push` pathname string or via an object `{ pathname, params }`. The Browse screen currently does not read any params (it is a stub), so the pattern for Phase 5 is to wire the Home screen to push params, and note that Browse (Phase 6) will need to read them via `useLocalSearchParams()`. The existing `useProducts` hook already supports a `collection` option that maps directly to this pattern.

**Primary recommendation:** Write a `mapAppProductToProduct(p: AppProduct): Product` adapter in the Home screen file (not a separate lib file — it is screen-local until the full type consolidation happens in a later phase). Use `useProducts({ collection: 'featured', limit: 6 })` with a fallback to `useProducts({ limit: 6 })` when the collection returns empty. Wire pull-to-refresh by passing `refetch` to the ScrollView's `onRefresh` prop. Add a button to HeroCard via a new optional `onExplorePress` prop.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.3.1 (installed) | `useState`, `useCallback` | Already in project |
| expo-router | ~4.0.0 (installed) | `useRouter`, `router.push` with params | Already in project; all tab navigation uses it |
| hooks/useProducts | project | Fetch AppProduct[] from Shopify | Built in Phase 4; supports `collection` and `limit` options |
| hooks/useShopifyQuery | project | Base hook for loading/error/refetch state | Built in Phase 4; used internally by useProducts |
| components/ScrollScreen | project | Scrollable screen wrapper with parchment background | Already used by Home screen |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-native RefreshControl | bundled | Pull-to-refresh indicator | Required for pull-to-refresh on ScrollView |
| react-native ActivityIndicator | bundled | Optional: pull-to-refresh indicator colour tint | Only if RefreshControl tintColor needs theming |

### No New Installations Required

All needed libraries are already installed. This phase is pure TypeScript/React — no `npm install` commands needed.

---

## Architecture Patterns

### Recommended Project Structure

The changes are confined to existing files and one adapter function:

```
app/(tabs)/index.tsx            ← Primary file: wiring, adapter, loading/error UI
components/HeroCard.tsx         ← Add onExplorePress button prop
components/SkeletonProductCard.tsx  ← New component: parchment placeholder card
```

No new directories needed.

### Pattern 1: AppProduct → Product Adapter (Screen-Local)

**What:** A pure function inside `app/(tabs)/index.tsx` that maps `AppProduct` (Shopify API shape) to `Product` (app UI shape). Defined locally — not exported — because it is a temporary bridge until a later phase consolidates types.

**Why:** `ProductCard` and `ProductGrid` import `Product` from `types/index.ts` and access:
- `product.name` — AppProduct has `product.title`
- `product.price` (number, `.toFixed(2)`) — AppProduct has `product.priceRange.minVariantPrice.amount` (decimal string)
- `product.maker` (Maker type with `.name`) — AppProduct has `product.vendor` (string)
- `product.images[0]` (string URI) — AppProduct has `product.images[0].url` (ShopifyImage object)
- `product.category` — AppProduct has `product.productType` or could use first tag

**Example:**
```typescript
// app/(tabs)/index.tsx — local adapter, not exported
import type { AppProduct } from '../../lib/shopify-mappers';
import type { Product } from '../../types';

function mapAppProductToProduct(p: AppProduct): Product {
  return {
    id: p.id,
    name: p.title,
    price: parseFloat(p.priceRange.minVariantPrice.amount),
    description: p.description,
    images: p.images.map((img) => img.url),
    category: p.productType || (p.tags[0] ?? 'handmade'),
    maker: {
      id: p.vendor.toLowerCase().replace(/\s+/g, '-'),
      name: p.vendor,
    },
    createdAt: new Date().toISOString(), // AppProduct has no createdAt from Storefront API
  };
}
```

**Confidence:** HIGH — field mapping confirmed by comparing `types/index.ts` (Product interface) and `types/shopify.ts` (ShopifyProduct) side-by-side.

### Pattern 2: Featured Collection with Fallback

**What:** Try `useProducts({ collection: 'featured', limit: 6 })` first. When `products.length === 0` after loading completes (collection missing or empty), refetch with `useProducts({ limit: 6 })`.

**Implementation approach:** Two `useProducts` calls — one with `collection: 'featured'`, one without. Conditionally render based on whether the first returned data:

```typescript
// Option A: Two hooks, conditional display (simplest)
const featured = useProducts({ collection: 'featured', limit: 6 });
const allProducts = useProducts({ limit: 6 });

// After loading: if featured.products.length > 0, use those; else fall back to allProducts
const displayProducts = (!featured.loading && featured.products.length > 0)
  ? featured.products
  : allProducts.products;

// Loading: either hook is still loading
const isLoading = featured.loading || (!featured.products.length && allProducts.loading);
```

**Alternative — Option B: Single hook with callback** — More complex, not recommended for this phase. Option A (two hooks) is simpler and sufficient.

**Confidence:** HIGH — `useProducts` API confirmed from source; the two-hook pattern is standard React.

### Pattern 3: Expo Router Navigation with Params

**What:** `router.push` accepts both a plain pathname string and an object `{ pathname, params }`. To pass a category filter to Browse:

```typescript
// In app/(tabs)/index.tsx
function handleCategoryPress(id: string) {
  router.push({
    pathname: '/(tabs)/browse',
    params: { category: id },
  });
}
```

Browse screen (Phase 6 work) will read this with `useLocalSearchParams<{ category?: string }>()`.

**Important note:** The current `browse.tsx` is a stub — it does NOT yet read params. Phase 5 only sends the params; Phase 6 wires up the receiving side. This is intentional and correct.

**Confidence:** HIGH — `useLocalSearchParams` is already used in `app/product/[id].tsx`, `app/blog/[id].tsx`, and `app/maker/[id].tsx`. The object-form of `router.push` is the standard Expo Router 4.x pattern for passing params to non-dynamic routes.

### Pattern 4: Pull-to-Refresh on ScrollScreen

**What:** `ScrollScreen` wraps a `ScrollView` from React Native. `ScrollView` supports a `refreshControl` prop that accepts a `RefreshControl` component.

**Problem:** `ScrollScreen` is a wrapper component that does not currently expose the `refreshControl` prop. Two options:

1. **Add `refreshControl` prop to ScrollScreen** — cleanest, reusable for other screens
2. **Use ScrollScreen's `contentContainerStyle` and manually pass via scroll props** — ScrollScreen does not forward arbitrary ScrollView props

**Recommended approach:** Add a `refreshControl?: React.ReactElement` prop to `ScrollScreen`, forwarded directly to the inner `ScrollView`. This is a one-line change to `ScrollScreen.tsx` and follows the component's existing prop-forwarding pattern.

```typescript
// components/layout/ScrollScreen.tsx — updated interface
interface ScrollScreenProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  refreshControl?: React.ReactElement;  // ← add this
}

// In the render:
<ScrollView
  style={styles.scroll}
  contentContainerStyle={[styles.content, contentContainerStyle]}
  showsVerticalScrollIndicator={false}
  refreshControl={refreshControl}  // ← pass through
>
```

**In the Home screen:**
```typescript
import { RefreshControl } from 'react-native';
import { colors } from '../../constants/theme';

// In HomeScreen:
const isRefreshing = featured.isRefetching || allProducts.isRefetching;
const handleRefresh = () => {
  featured.refetch();
  allProducts.refetch();
};

<ScrollScreen
  refreshControl={
    <RefreshControl
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
      tintColor={colors.terracotta}
      colors={[colors.terracotta]}  // Android
    />
  }
>
```

**Confidence:** HIGH — `RefreshControl` is a core React Native component; `ScrollView.refreshControl` prop is well-established.

### Pattern 5: Skeleton Cards

**What:** Six parchment-coloured placeholder cards that fill the ProductGrid while products load. These are static (no shimmer animation — shimmer is in Claude's discretion and is de-scoped to keep the plan simple).

**Implementation:** A new `SkeletonProductCard` component that renders a `View` matching the dimensions of `ProductCard` with parchment/border styling. The Home screen renders 6 of these in place of the ProductGrid when `isLoading === true`.

```typescript
// components/SkeletonProductCard.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing, radii, shadows } from '../constants/theme';

export default function SkeletonProductCard({ style }: { style?: object }) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.imageArea} />
      <View style={styles.contentArea}>
        <View style={styles.nameLine} />
        <View style={styles.priceLine} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.parchmentDark,
    borderRadius: radii.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  imageArea: {
    height: spacing.productCardImageHeight,  // 160px — matches ProductCard
    backgroundColor: colors.border,
  },
  contentArea: {
    padding: spacing.cardPadding,
    gap: spacing.sm,
  },
  nameLine: {
    height: 14,
    width: '75%',
    backgroundColor: colors.border,
    borderRadius: radii.sm,
  },
  priceLine: {
    height: 18,
    width: '40%',
    backgroundColor: colors.borderLight,
    borderRadius: radii.sm,
  },
});
```

The Home screen renders a skeleton grid (using the same two-column split-column layout as ProductGrid, to avoid layout shift on load completion):

```typescript
// app/(tabs)/index.tsx — skeleton grid
function SkeletonGrid() {
  const left = [0, 2, 4];
  const right = [1, 3, 5];
  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: spacing.screenPadding, gap: spacing.itemGap }}>
      <View style={{ flex: 1 }}>
        {left.map((i) => <SkeletonProductCard key={i} style={{ marginBottom: spacing.itemGap }} />)}
      </View>
      <View style={{ flex: 1 }}>
        {right.map((i) => <SkeletonProductCard key={i} style={{ marginBottom: spacing.itemGap }} />)}
      </View>
    </View>
  );
}
```

**Confidence:** HIGH — pure React Native layout with no new dependencies.

### Pattern 6: HeroCard Button Addition

**What:** HeroCard currently renders only the tagline and an image placeholder. A button needs to be added. The button should be an internal element (not a full-card tap), using `PrimaryButton` (already exists at `components/PrimaryButton.tsx`) or an inline `TouchableOpacity`.

**Approach:** Add an optional `onExplorePress?: () => void` prop to `HeroCard`. When provided, render a `PrimaryButton` (variant `'gold'`) below the tagline inside the left text column.

```typescript
// components/HeroCard.tsx — updated
interface HeroCardProps {
  tagline?: string;
  onExplorePress?: () => void;  // ← add
}

// In render (inside textCol, below tagline):
{onExplorePress && (
  <PrimaryButton
    label="Explore the Shop"  // or "Wander the Shop" — Claude's discretion
    onPress={onExplorePress}
    variant="gold"
  />
)}
```

**Confidence:** HIGH — `PrimaryButton` exists at `components/PrimaryButton.tsx` with `variant: 'gold' | 'terracotta'` API confirmed.

### Anti-Patterns to Avoid

- **Importing from `lib/shopify-client` directly in the Home screen:** Use `useProducts` hook only. The abstraction boundary (screens import hooks, hooks import service layer) was established in Phase 4.
- **Using `product.name` on AppProduct without mapping:** `AppProduct` has `title`, not `name`. TypeScript will catch this, but only if the Home screen types its products as `AppProduct` correctly.
- **Parsing `priceRange.minVariantPrice.amount` without `parseFloat`:** It is a decimal string like `"38.00"`. ProductCard calls `.toFixed(2)` on a number.
- **Setting `activeCategory` local state on category press:** The CONTEXT.md decision is to navigate to Browse — not to highlight locally. Remove the `useState<string | null>(null)` for `activeCategory` from the Home screen (or repurpose it only for visual highlight before navigating, if desired).
- **Making the full HeroCard a tap target:** CONTEXT.md locks this as a dedicated button, not full-card press.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Data fetching with loading/error | Custom fetch logic | `useProducts` hook (already built Phase 4) | Complete with cancel-on-unmount, isRefetching, refetch() |
| Pull-to-refresh | Custom gesture handler | `RefreshControl` from react-native + `ScrollView.refreshControl` | Native component, handles iOS/Android differences |
| Navigation with params | URL string concatenation | `router.push({ pathname, params })` | Expo Router 4.x object-form handles encoding |
| Skeleton layout | Complex animation library | Static `View` components matching ProductCard dimensions | No animation needed per CONTEXT.md discretion (shimmer not required) |
| Type conversion | Rewriting ProductCard/ProductGrid | Local `mapAppProductToProduct` adapter | Components work correctly; only the data source changes |

**Key insight:** The service layer, hooks, and UI components are all complete. Phase 5 is almost entirely wiring — the new code written is the type adapter, the skeleton, and the navigation callbacks.

---

## Common Pitfalls

### Pitfall 1: Type Mismatch Between AppProduct and Product

**What goes wrong:** TypeScript error: `Property 'name' does not exist on type 'AppProduct'` or runtime issue where `product.name` is `undefined` and the card renders blank.
**Why it happens:** `useProducts` returns `AppProduct[]` (Shopify shape) but `ProductGrid`/`ProductCard` expect `Product[]` (app shape). Different field names.
**How to avoid:** The `mapAppProductToProduct` adapter must be applied before passing products to `ProductGrid`. Never pass raw `AppProduct[]` to components expecting `Product[]`.
**Warning signs:** Product cards render with blank names and $NaN prices.

### Pitfall 2: Featured Collection Returns Empty (Handle Case Sensitivity or Missing)

**What goes wrong:** `useProducts({ collection: 'featured', limit: 6 })` returns `[]` even though the Featured collection exists.
**Why it happens:** Shopify collection handles are case-sensitive and lowercase. If the collection was created with handle `Featured` instead of `featured`, the API returns null.
**How to avoid:** The fallback to `useProducts({ limit: 6 })` handles this. Additionally, the smoke test already confirmed the store has `frontpage`, `tie-dye`, `leather`, `jewelry`, `art` — none of which is `featured`. The fallback is the primary path for the current Shopify store.
**Warning signs:** Home screen always shows fallback products even after creating a "Featured" collection.

### Pitfall 3: ScrollScreen Does Not Forward refreshControl Prop

**What goes wrong:** Pull-to-refresh does not work because `ScrollScreen` does not pass `refreshControl` through to its inner `ScrollView`.
**Why it happens:** `ScrollScreen` currently accepts only `children`, `style`, and `contentContainerStyle`. The `refreshControl` prop must be explicitly added and forwarded.
**How to avoid:** Add the prop to `ScrollScreen.tsx` first before wiring pull-to-refresh in `index.tsx`.
**Warning signs:** Pulling down on the Home screen has no visual indicator and does not trigger a refetch.

### Pitfall 4: Two-Hook Loading State Logic

**What goes wrong:** `isLoading` flickering — the Home screen shows skeleton, then products, then skeleton again as the second hook loads.
**Why it happens:** Using `featured.loading || allProducts.loading` means the skeleton reappears when the fallback hook fires after the featured hook returns empty.
**How to avoid:** Only show skeleton during the initial load of whichever hook is active. Once `featured.loading` is false: if `featured.products.length > 0`, the featured hook is the data source — `allProducts` loading doesn't matter. If `featured.products.length === 0`, then show skeleton until `allProducts.loading` is also false.

```typescript
const isLoading =
  featured.loading ||
  (!featured.loading && featured.products.length === 0 && allProducts.loading);
```

**Warning signs:** Users see skeleton cards flash in briefly after featured products were already visible.

### Pitfall 5: Category Navigation Clobbers Current Tab State

**What goes wrong:** `router.push('/(tabs)/browse')` pushes a new Browse screen on the stack, but if Browse is already the active tab, this creates unexpected back-navigation behaviour.
**Why it happens:** Tab screens can be pushed as stack entries in Expo Router when navigated to via `router.push` from another tab.
**How to avoid:** Use `router.navigate('/(tabs)/browse', { params: ... })` for tab navigation instead of `router.push`. In Expo Router 4.x, `router.navigate` to a tab route will switch to that tab without pushing a new stack entry. However, from the Home tab, `router.push` to Browse is the correct pattern (it switches tabs, not stacks). The existing code already uses `router.push('/(tabs)/browse')` for "See All" — this works correctly. Use the same pattern with params.
**Warning signs:** Pressing Back on the Browse screen returns to Home instead of staying on Browse (unexpected stack push).

### Pitfall 6: `createdAt` Missing from AppProduct

**What goes wrong:** TypeScript error because `Product` type requires `createdAt: string` but `AppProduct` (from Storefront API) does not include a `createdAt` field.
**Why it happens:** The Shopify Storefront GraphQL query for products does not include `createdAt` in the current `GET_PRODUCTS_QUERY`. The `Product` type in `types/index.ts` requires it.
**How to avoid:** The adapter can use `new Date().toISOString()` as a stub value since `createdAt` is not displayed on the Home screen. Alternatively, the `Product.createdAt` field could be made optional (`createdAt?: string`). The stub approach is recommended to avoid touching `types/index.ts` during this phase.
**Warning signs:** TypeScript compilation error: `Property 'createdAt' is missing in type...`.

---

## Code Examples

### Complete AppProduct → Product Adapter

```typescript
// Confirmed field mapping from types/index.ts and types/shopify.ts
import type { AppProduct } from '../../lib/shopify-mappers';
import type { Product } from '../../types';

function mapAppProductToProduct(p: AppProduct): Product {
  return {
    id: p.id,
    name: p.title,
    price: parseFloat(p.priceRange.minVariantPrice.amount),
    description: p.description,
    images: p.images.map((img) => img.url),
    category: p.productType || (p.tags[0] ?? ''),
    maker: {
      id: p.vendor.toLowerCase().replace(/\s+/g, '-'),
      name: p.vendor,
    },
    createdAt: new Date().toISOString(), // stub — not displayed on home screen
  };
}
```

### Router Navigation with Params (Expo Router 4.x)

```typescript
// Confirmed from existing patterns in product/[id].tsx, blog/[id].tsx, maker/[id].tsx
import { useRouter } from 'expo-router';
const router = useRouter();

// Navigate to Browse with a category filter param
router.push({
  pathname: '/(tabs)/browse',
  params: { category: 'tie-dye' },
});

// Navigate to Browse unfiltered (existing pattern — no change)
router.push('/(tabs)/browse');
```

### RefreshControl Integration

```typescript
import { RefreshControl } from 'react-native';
import { colors } from '../../constants/theme';

// In HomeScreen render:
<ScrollScreen
  refreshControl={
    <RefreshControl
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
      tintColor={colors.terracotta}    // iOS spinner color
      colors={[colors.terracotta]}     // Android spinner colors array
    />
  }
>
  {/* screen content */}
</ScrollScreen>
```

### Brand-Voiced Error State

```typescript
// In HomeScreen, when error is non-null after loading completes:
{error && !isLoading && (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>
      The shop is resting. Try again soon.
    </Text>
    <PrimaryButton
      label="Try Again"
      onPress={handleRefresh}
      variant="terracotta"
    />
  </View>
)}
```

---

## State of the Art

| Old Approach | Current Approach (After Phase 5) | Impact |
|--------------|----------------------------------|--------|
| Mock data from `data/mock-data.ts` | Live Shopify products via `useProducts` hook | Real artisan products visible to finders |
| `handleCategoryPress` sets local `activeCategory` state | `handleCategoryPress` navigates to Browse with category param | Category chips are functional navigation, not decoration |
| HeroCard has no interactive element | HeroCard has "Explore the Shop" button → Browse unfiltered | Finder has clear entry point to full catalog |
| No loading state — products appear instantly from mock | Skeleton cards during Shopify fetch | Graceful async experience |
| No error handling | Brand-voiced error + retry button | Resilient to Shopify outages |
| No pull-to-refresh | Pull-to-refresh triggers `refetch()` on both hooks | Finders can manually refresh without app restart |

**What is NOT changed in Phase 5:**
- `ProductCard`, `ProductGrid` component internals — they stay on `Product` type
- `CategoryRow` — still reads from `productCategories` in theme.ts
- `BotanicalHeader`, `BotanicalDivider`, `SectionTitle` — no changes
- `useProducts`, `useShopifyQuery` hooks — already complete from Phase 4
- Browse screen — stub remains; Phase 6 wires it up

---

## Open Questions

1. **"Featured" collection handle in the actual Shopify store**
   - What we know: Smoke test confirmed store handles are `[frontpage, tie-dye, leather, jewelry, art]` — no `featured` handle exists
   - What's unclear: Whether the project owner will create a "Featured" collection in Shopify Admin before Phase 5 is executed, or whether the fallback path (newest 6 products) should be treated as the primary for now
   - Recommendation: Implement both the featured-collection fetch AND the fallback. The current store will hit the fallback path, which is acceptable. Document in the plan that the finder-visible result depends on which products exist in the Shopify store. No blocker.

2. **`Product.createdAt` field — optional or stubbed**
   - What we know: `types/index.ts` declares `createdAt: string` (required). `AppProduct` has no `createdAt` from the Storefront API GET_PRODUCTS_QUERY.
   - What's unclear: Whether the planner should make `createdAt` optional in `types/index.ts` (cleaner) or stub it in the adapter (safe, no type changes)
   - Recommendation: Stub it in the adapter with `new Date().toISOString()`. Avoids touching the type definition file, keeps the Phase 5 diff minimal.

3. **Category chips: navigate immediately or highlight then navigate**
   - What we know: CONTEXT.md locks that tapping navigates to Browse with filter (not just highlights). It does NOT prohibit a brief visual highlight before navigating.
   - What's unclear: Whether the UX should highlight the chip for 150–200ms before navigating (feels more responsive) or navigate immediately
   - Recommendation: Navigate immediately (simpler code, less animation state to manage). The tab switch is fast enough that no feedback delay is needed.

---

## Sources

### Primary (HIGH confidence)

- Project source: `app/(tabs)/index.tsx` — confirmed current Home screen structure, mock-data usage, `handleCategoryPress` setting local state, existing `router.push('/(tabs)/browse')`
- Project source: `hooks/useProducts.ts` — confirmed `{ collection?, limit? }` options API and `AppProduct[]` return type
- Project source: `hooks/useShopifyQuery.ts` — confirmed `{ loading, isRefetching, error, refetch }` return shape
- Project source: `components/ProductCard.tsx` — confirmed `product.name`, `product.price.toFixed(2)`, `product.maker`, `product.images[0]`, `product.category` field accesses
- Project source: `components/ProductGrid.tsx` — confirmed `Product[]` prop type
- Project source: `types/index.ts` — confirmed full `Product` interface fields required
- Project source: `types/shopify.ts` — confirmed `ShopifyProduct` fields (`title`, `vendor`, `priceRange`, `images: { nodes }`, `productType`)
- Project source: `lib/shopify-mappers.ts` — confirmed `AppProduct` extends `ShopifyProduct` with flattened `images` and `variants`
- Project source: `components/HeroCard.tsx` — confirmed current props and render structure; no button exists
- Project source: `components/PrimaryButton.tsx` — confirmed `{ label, onPress, variant: 'gold' | 'terracotta' }` API
- Project source: `components/layout/ScrollScreen.tsx` — confirmed does NOT currently forward `refreshControl`
- Project source: `app/product/[id].tsx` — confirmed `useLocalSearchParams` pattern for params in Expo Router 4.x
- Project source: `projectVision/wildenflower-mobileHome.png` — confirmed mockup shows botanical header, hero card with button, horizontal category row, 2-column product grid
- Project source: `.planning/STATE.md` — confirmed smoke test results: `featured` collection handle does not exist in Shopify store; fallback to all products is the live path
- Project source: `constants/theme.ts` — confirmed `productCategories` ids match Shopify store handles (`tie-dye`, `leather`, `jewelry`) and `colors.terracotta` for RefreshControl tint

### Secondary (MEDIUM confidence)

- Expo Router 4.x docs: `router.push({ pathname, params })` object form for passing query params to non-dynamic routes (consistent with how `useLocalSearchParams` works in existing screens)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries installed; no new dependencies
- Type bridging (AppProduct → Product): HIGH — confirmed by reading both type files and all field accesses in ProductCard
- Architecture patterns: HIGH — confirmed from existing codebase patterns; no speculation
- Expo Router params: HIGH — existing `useLocalSearchParams` usage in 3 screens confirms the pattern works
- Fallback logic: HIGH — two-hook pattern is standard React; live store confirmed `featured` handle is absent
- Pitfalls: HIGH — derived from direct codebase analysis (ScrollScreen missing prop, type mismatch, loading state logic)

**Research date:** 2026-02-20
**Valid until:** 2026-03-20 (stable React/RN/Expo Router 4.x patterns; Shopify Storefront API field names are stable)
