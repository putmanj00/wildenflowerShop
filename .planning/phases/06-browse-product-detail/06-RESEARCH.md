# Phase 6: Browse + Product Detail — Research

**Researched:** 2026-02-20
**Domain:** React Native screen composition, Shopify cursor-based pagination, swipeable image gallery, variant selection, sticky bottom bar
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Browse filtering:**
- Single-select filters — tapping a chip replaces any active filter (no stacking)
- "All" chip is always first in the row; tapping it returns to unfiltered view
- Active filter chip gets the watercolor wash background per projectVision
- When a filter changes, show skeleton cards while the new collection loads (consistent with Home screen loading pattern)

**Browse pagination:**
- "Discover more" button at the bottom of the grid — explicit tap to load next page
- Button is brand-voiced ("Discover more", not "Load more")
- Only shown when `pageInfo.hasNextPage` is true

**Product image gallery:**
- Full-width hero image (edge-to-edge), swipe left/right to navigate
- Portrait aspect ratio (4:5)
- Dot indicators below image show current position
- No thumbnail strip — swipe gestures + dots only
- On web: prev/next arrow buttons overlaid on the image edges (always visible, not hover-only)

**Variant selector:**
- Pill-shaped button grid for each option dimension (e.g. Size, Color)
- Unavailable combinations: greyed out with a strikethrough line (not hidden)
- No default pre-selection — finder must actively choose; Add to Cart is disabled until a valid variant is selected
- Disabled button label: "Select options to add" (not generic "Add to Cart" greyed out)

**Add to Cart feedback:**
- Inline button state change: button briefly shows "Added!" for ~1.5 seconds, then resets to "Add to Cart"
- Duplicate adds are allowed — tapping again increases cart quantity
- Add to Cart button lives in a sticky bottom bar (always visible while scrolling), alongside the price

### Claude's Discretion
- Exact styling of the sticky bottom bar (height, shadow, separator line)
- Arrow button visual design for web gallery prev/next
- Strikethrough styling on unavailable variant chips
- Empty state copy if a filtered collection has no products
- Error state copy if product detail fails to load

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| COMM-02 | Browse screen implemented to match `projectVision/wildenflowerProductListing.png` with collection-based filtering and Shopify products | FilterChipRow with Shopify collection handles, cursor-based pagination via upgraded useProducts hook, skeleton loading pattern (already validated in Phase 5) |
| COMM-03 | Product detail screen with swipeable image gallery, variant selection (maps selected options to correct variantId), and Add to Cart | ScrollView/FlatList horizontal gallery (no external dependency), client-side variant matching from AppProduct.variants, CartContext.addToCart(variantId) already built |
</phase_requirements>

---

## Summary

Phase 6 builds two screens on top of a fully operational Shopify service layer and CartContext. The data plumbing is essentially done — `useProducts`, `useProduct`, `getCollectionByHandle`, and `addToCart(variantId)` all exist and are tested. The phase is primarily a UI composition task with three genuinely technical sub-problems.

**Sub-problem 1 — Browse pagination:** The current `useProducts` hook does not support cursor-based `after` pagination. It only takes a `limit` parameter. It must be extended to accumulate pages (append-not-replace) and expose `pageInfo` and a `loadMore()` handler. This is the hook's primary upgrade for this phase.

**Sub-problem 2 — Image gallery web compatibility:** `react-native-reanimated-carousel` has documented, unresolved web compatibility issues (GitHub issue #315 closed as NOT_PLANNED Feb 2025). The confirmed fallback — a `ScrollView` with `horizontal`, `pagingEnabled`, and `scrollEventThrottle`, plus `Platform.select` prev/next arrow buttons for web — is the safe, zero-dependency path. This is already flagged in STATE.md and is now confirmed.

**Sub-problem 3 — Variant selection:** The Shopify Storefront API delivers all variants as `ShopifyProductVariant[]` on `AppProduct.variants`, each with `selectedOptions: [{name, value}]`. Mapping user selections to a `variantId` is pure client-side logic: iterate `variants` to find the one whose `selectedOptions` matches the user's current selections for every option dimension. No additional API call is needed.

**Collection handle mismatch:** STATE.md documents a confirmed blocker — the Shopify store has handles `[frontpage, tie-dye, leather, jewelry, art]` but `productCategories` in `theme.ts` lists `[tie-dye, leather, jewelry, crystals, artwork, ceramics]`. Three of six category chips map to missing handles. This must be resolved before any Browse filter work is wired up. Options and recommendation are in the Architecture section.

**Primary recommendation:** Use the zero-dependency gallery (ScrollView + pagingEnabled), upgrade `useProducts` in-place to support cursor accumulation, and resolve collection handles by updating `productCategories` in `theme.ts` to the actual Shopify handles, then reconfiguring the "All" chip to omit the `collection` argument entirely.

---

## Standard Stack

### Core (already installed — no new installs required)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native ScrollView | (RN 0.76.9) | Swipeable image gallery | Zero new deps; `pagingEnabled` + `horizontal` gives snap-to-page on native; `Platform.select` adds arrow buttons for web |
| expo-router `useLocalSearchParams` | 4.0.x | Read `category` param passed from Home screen | Already used in `product/[id].tsx`; standard Expo Router pattern for tab-to-tab param passing |
| CartContext `addToCart(variantId)` | (local) | Add selected variant to cart | Already built in Phase 3; signature is `addToCart(variantId: string, quantity?: number): Promise<boolean>` |
| react-native-reanimated | 3.16.x | Sticky bottom bar animation, button state transition | Already installed; use for "Added!" button fade only — no carousel use |

### No New Installs

There are no new npm packages to install for this phase. All required libraries are already in `package.json`. Specifically:
- `react-native-gesture-handler` is already installed (used by expo-router navigation)
- `react-native-reanimated` is already installed
- No carousel library is needed or recommended (see "Don't Hand-Roll" table)

---

## Architecture Patterns

### Recommended Project Structure Changes

```
hooks/
├── useProducts.ts         ← UPGRADE: add cursor accumulation + loadMore()
├── useProduct.ts          ← no change
├── useCollections.ts      ← no change
└── useShopifyQuery.ts     ← no change (keep generic base hook)

app/(tabs)/
└── browse.tsx             ← BUILD: full Browse screen

app/product/
└── [id].tsx               ← BUILD: full Product Detail screen

constants/
└── theme.ts               ← EDIT: align productCategories with actual Shopify handles
```

### Pattern 1: useProducts Upgrade — Cursor Accumulation

**What:** Extend `useProducts` to accumulate pages (append new items to existing list) and expose `pageInfo` + `loadMore()`. The current hook resets state on every fetch.

**When to use:** Required for Browse screen's "Discover more" pagination.

**Key design decisions:**
- Add `pageInfo: ShopifyPageInfo | null` and `loadMore: (() => void) | null` to the return type
- Track `cursor: string | null` in local state; `loadMore` sets it to `pageInfo.endCursor`
- On cursor change, the query fn fetches with `after: cursor` and receives the next page
- Accumulate: `setProducts(prev => [...prev, ...newItems])` — never replace
- `loadMore` is `null` when `pageInfo.hasNextPage` is false (hides the "Discover more" button)
- When `collection` or `limit` changes (filter change), reset `cursor` to null and reset `products` to `[]`

```typescript
// Conceptual shape — useProducts extended return type
interface UseProductsResult {
  products: AppProduct[];
  loading: boolean;
  isRefetching: boolean;
  error: string | null;
  refetch: () => void;
  // NEW:
  pageInfo: ShopifyPageInfo | null;
  loadMore: (() => void) | null;  // null when no more pages
  isLoadingMore: boolean;
}
```

**Important:** The base `useShopifyQuery` hook manages state for a single fetch. Cursor accumulation requires local state in `useProducts` itself — do not try to push this into `useShopifyQuery`. The existing base hook stays unchanged.

**Reset condition:** When `collection` changes (filter chip tap), reset `cursor` to `null` and `products` to `[]` before re-fetching. The skeleton loading pattern (show skeletons while `loading === true`) remains unchanged from Phase 5.

### Pattern 2: Collection Handle Resolution

**What:** The "All" chip makes no filter. Each collection chip passes a Shopify collection handle. The handle must exactly match what Shopify returns.

**Confirmed Shopify handles** (from Phase 2 smoke test logged in STATE.md):
`frontpage`, `tie-dye`, `leather`, `jewelry`, `art`

**Current `productCategories` in `theme.ts`:**
`tie-dye`, `leather`, `jewelry`, `crystals`, `artwork`, `ceramics`

**Recommendation:** Update `productCategories` in `theme.ts` to match actual Shopify handles. Specifically:
- `artwork` → `art` (Shopify handle)
- Remove `crystals` and `ceramics` (no matching Shopify collection)
- Add `frontpage` collection if useful, or leave it as "All" (unfiltered)
- The "All" chip is synthetic — it is not a Shopify collection handle; it maps to `collection: undefined` in `useProducts`

This approach is preferred over a mapping layer because it keeps the data source authoritative: Shopify handles are the ground truth, and the UI labels/descriptions can differ from handles.

### Pattern 3: FilterChipRow for Browse

**What:** A horizontal ScrollView of pill chips. The first chip is always "All" (active by default). Tapping a chip sets `activeCollection` state. The active chip gets a `WatercolorWash` background (dustyRose variant — per `projectVision`).

**Implementation:** Build a `FilterChipRow` component (or inline in Browse if narrow scope). Use the existing `WatercolorWash` component for active state background. Filter chips are simpler than `CategoryChip` — they are horizontal pills, not circular icons.

**State flow:**
```typescript
const [activeCollection, setActiveCollection] = useState<string | null>(
  // Initialize from useLocalSearchParams — allows Home screen to pre-select a category
  (params.category as string) ?? null
);
```

When `activeCollection` changes:
1. Pass to `useProducts({ collection: activeCollection ?? undefined })`
2. Show skeleton grid (loading === true) while new collection fetches
3. Products replace (not append) because it's a filter change, not "load more"

### Pattern 4: Image Gallery — ScrollView with pagingEnabled

**What:** A full-width, edge-to-edge horizontal ScrollView showing one image at a time. Dot indicators below. Web gets prev/next buttons.

**Why not react-native-reanimated-carousel:** GitHub issue #315 was closed as NOT_PLANNED in Feb 2025 with no confirmed web solution. The issue is specific to react-native-web module resolution. Given the project's web-first requirement (PLAT-01), using a library with unresolved web incompatibility is too risky. The native ScrollView approach needs zero additional dependencies and works identically on all platforms.

**Pattern:**
```typescript
// Source: React Native docs — ScrollView pagingEnabled
<ScrollView
  horizontal
  pagingEnabled
  showsHorizontalScrollIndicator={false}
  scrollEventThrottle={16}
  onScroll={(e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / imageWidth);
    setCurrentIndex(index);
  }}
>
  {images.map((img, i) => (
    <Image
      key={i}
      source={{ uri: img.url }}
      style={{ width: imageWidth, height: imageHeight }} // 4:5 ratio
    />
  ))}
</ScrollView>
```

**Dot indicators:** A simple `View` row below the ScrollView. Active dot = `colors.terracotta`, inactive = `colors.border`.

**Web prev/next buttons:**
```typescript
// Platform.select to show buttons only on web
{Platform.OS === 'web' && images.length > 1 && (
  <>
    <TouchableOpacity style={styles.prevButton} onPress={handlePrev}>
      <Text style={styles.arrowText}>‹</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
      <Text style={styles.arrowText}>›</Text>
    </TouchableOpacity>
  </>
)}
```

Web buttons need to imperatively scroll the ScrollView using a `ref`. Use `scrollRef.current?.scrollTo({ x: targetIndex * imageWidth, animated: true })`.

**4:5 portrait aspect ratio:** Use `useWindowDimensions().width` for the image width. Height = width * (5/4). Both the ScrollView and each image item use the same calculated dimensions.

### Pattern 5: Variant Selection — Client-Side Matching

**What:** Build a multi-dimensional option selector. Each option dimension (e.g., "Size", "Color") is a row of pill buttons. Selections accumulate in `selectedOptions: Record<string, string>`. When all dimensions have a value, find the matching variant.

**Variant matching logic:**
```typescript
function findVariant(
  variants: ShopifyProductVariant[],
  selectedOptions: Record<string, string>
): ShopifyProductVariant | null {
  return variants.find((v) =>
    v.selectedOptions.every(
      (opt) => selectedOptions[opt.name] === opt.value
    )
  ) ?? null;
}
```

**Availability per chip:** A variant option value (e.g., "Large" for "Size") is unavailable if *no* variant with that value has `availableForSale: true`. Compute this once from `product.variants`:

```typescript
function getUnavailableValues(
  variants: ShopifyProductVariant[],
  optionName: string
): Set<string> {
  const unavailable = new Set<string>();
  // Get all unique values for this option
  const allValues = new Set(
    variants.flatMap((v) =>
      v.selectedOptions.filter((o) => o.name === optionName).map((o) => o.value)
    )
  );
  allValues.forEach((val) => {
    const hasAvailable = variants.some(
      (v) =>
        v.selectedOptions.some((o) => o.name === optionName && o.value === val) &&
        v.availableForSale
    );
    if (!hasAvailable) unavailable.add(val);
  });
  return unavailable;
}
```

**Strikethrough on unavailable:** Use a `View` with `position: absolute`, `height: 1`, `backgroundColor: colors.earth`, `top: '50%'` inside the pill button.

**No API call needed:** All variant data is already fetched via `GET_PRODUCT_BY_HANDLE_QUERY` which includes `variants(first: 20)` with `selectedOptions` and `availableForSale`. The `useProduct(handle)` hook returns this data.

**Note on `useProduct` input:** The Product Detail route is `product/[id].tsx` and currently reads `id` from `useLocalSearchParams`. However `useProduct` takes a **handle** (string slug like `"tie-dye-tee"`), not a Shopify GID. ProductCard's `onPress` currently navigates with `product.id` (the GID). This must be changed to navigate with `product.handle` for the Product Detail hook to work. The product list query returns `handle` on every `AppProduct`.

### Pattern 6: Sticky Bottom Bar

**What:** A bar fixed to the bottom of the screen, above the tab bar, always visible regardless of scroll position. Contains price + Add to Cart button.

**Implementation:** Use `SafeAreaView` (Screen) with `flex: 1`, containing a `ScrollView` for the product content and a separate `View` below it for the sticky bar. The sticky bar is NOT inside the ScrollView.

```
<SafeAreaView flex:1>
  <ScrollView flex:1>
    {/* gallery, title, description, variants, etc. */}
  </ScrollView>
  <View style={styles.stickyBar}>
    {/* price + Add to Cart button */}
  </View>
</SafeAreaView>
```

This pattern works correctly on both native and web — no `position: absolute` needed, no web CSS hacks.

**Button state machine:**
```typescript
const [buttonState, setButtonState] = useState<'idle' | 'adding' | 'added'>('idle');

async function handleAddToCart() {
  if (!selectedVariant) return;
  setButtonState('adding');
  const success = await addToCart(selectedVariant.id);
  if (success) {
    setButtonState('added');
    setTimeout(() => setButtonState('idle'), 1500);
  } else {
    setButtonState('idle');
    // Show inline error (toast or text)
  }
}
```

Button labels: `idle` → "Add to Cart" | `adding` → "Adding..." | `added` → "Added!"

**Product Detail uses Screen (not ScrollScreen):** The Product Detail screen needs a sticky bottom bar. Using `Screen` (which wraps a `SafeAreaView`) and manually placing a `ScrollView` and sticky bar inside is the correct approach — consistent with the established pattern that `ScrollScreen` is only used for fully scrollable screens without sticky chrome.

### Pattern 7: AppProduct Type Adapter for ProductGrid

The existing `ProductGrid` and `ProductCard` components accept `Product` (from `types/index.ts`), not `AppProduct` (from `lib/shopify-mappers.ts`). The Home screen uses a local `mapAppProductToProduct` adapter. Browse screen must use the same adapter pattern.

The adapter is already defined in `app/(tabs)/index.tsx`. For Browse, duplicate the adapter locally in `browse.tsx` — do not move it to a shared location yet. A future phase (likely Phase 9 or type consolidation) should unify these types.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Carousel library | Custom Reanimated gesture carousel | `ScrollView` with `pagingEnabled` | Zero deps, web-compatible, tested |
| Variant-to-ID lookup | Custom GraphQL query for `variantBySelectedOptions` | Client-side match from `AppProduct.variants` | All data already fetched; no additional network call |
| Infinite scroll | onEndReached + complex FlatList | "Discover more" tap button + cursor accumulation | User decision (CONTEXT.md); explicit is better than automatic for this brand |
| Filter chip state | URL-synced search params | Local `useState` in Browse screen | Simpler; Browse is always mounted in tabs, no deep-link requirement for filter state |

**Key insight:** Every complex problem in Phase 6 has a solution already in the codebase or in React Native's standard library. The phase is primarily about connecting existing pieces correctly, not building new infrastructure.

---

## Common Pitfalls

### Pitfall 1: Navigating to Product Detail with GID instead of Handle

**What goes wrong:** `ProductCard.onPress` currently navigates with `product.id` (the Shopify GID, like `gid://shopify/Product/12345`). The route is `/product/[id]`, and `useProduct(handle)` expects a URL-safe handle string like `tie-dye-tee`.

**Why it happens:** The `id` field in `AppProduct` is a GID; the `handle` field is the slug. They are different. The navigation must use `handle`.

**How to avoid:** In ProductCard/ProductGrid onPress handlers in both `browse.tsx` and `index.tsx`, ensure navigation is `router.push(\`/product/${product.handle}\`)` not `product.id`. The `[id].tsx` route reads `const { id } = useLocalSearchParams()` — this is the handle (confusingly named `id` in the route). Confirm and update all nav call sites.

**Warning signs:** Product Detail screen shows "Product not found" error immediately after navigation.

### Pitfall 2: Filter Change Not Resetting Product List

**What goes wrong:** User switches from "Leather" to "Jewelry". Products from Leather collection appear at the top, then Jewelry products are appended instead of replacing.

**Why it happens:** The cursor accumulation in `useProducts` appends to existing products. If the filter (collection) changes, accumulated state must be reset.

**How to avoid:** In the upgraded `useProducts`, use a `useEffect` that resets `cursor` to `null` and `products` to `[]` when `collection` changes. Do this *before* the fetch, not after, so the skeleton loading state appears immediately.

### Pitfall 3: Variant Selector Shows Wrong Availability

**What goes wrong:** A "Size: Large, Color: Blue" combination might be unavailable, but "Size: Large" alone shows as available because Large exists in other colors. The chip incorrectly shows Large as greyed-out.

**Why it happens:** Availability per chip must be computed per-dimension in the context of current other selections. If the user has already picked "Color: Blue", then "Large" is unavailable *for that color* even if "Large" is available overall.

**How to avoid:** Compute availability relative to other current selections. For each option dimension's values, check availability only among variants that match ALL other already-selected dimensions. This is more complex than checking global availability, but produces correct behavior.

**Simpler starting point (acceptable for v1):** Show unavailability globally (across all combinations), not contextually. This may grey out a chip that IS technically available in another combination. Document this limitation. Given the small variant count (usually ≤ 20 per product in a boutique store), the simpler approach is acceptable and the spec does not require contextual availability.

### Pitfall 4: ScrollView pagingEnabled Width on Web

**What goes wrong:** `pagingEnabled` on a horizontal `ScrollView` requires each child to be exactly the same width as the `ScrollView` container. On web, `useWindowDimensions().width` can return a desktop-sized value that makes images enormous.

**Why it happens:** The Browse and Product Detail screens are web-first but also need to look sensible on mobile. On web, full window width for an image gallery could be 1400px.

**How to avoid:** Cap image width at a reasonable max. Use `Math.min(useWindowDimensions().width, 600)` for the gallery container on Product Detail. Or constrain the entire Product Detail content to a max-width column centered on web. The mockup shows a mobile viewport; the spec says "web desktop users" only need the prev/next buttons, not a redesigned layout.

### Pitfall 5: useLocalSearchParams Category Param Is a String Array

**What goes wrong:** `useLocalSearchParams` may return `string | string[]` for any param. If the Home screen navigates with `params: { category: id }`, the Browse screen receives it as a string — but TypeScript types require handling both.

**Why it happens:** Expo Router's `useLocalSearchParams` types return `string | string[]` for every key.

**How to avoid:**
```typescript
const { category } = useLocalSearchParams<{ category?: string | string[] }>();
const initialCategory = Array.isArray(category) ? category[0] : category ?? null;
```

---

## Code Examples

Verified patterns from codebase and official sources:

### Extending useProducts for Cursor Pagination

```typescript
// Pattern: accumulate pages, expose loadMore
// Source: existing hooks/useProducts.ts + Shopify cursor pagination docs

export function useProducts(options?: UseProductsOptions): UseProductsResult {
  const { collection, limit = 20 } = options ?? {};

  // Accumulated products across pages
  const [products, setProducts] = useState<AppProduct[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState<ShopifyPageInfo | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Reset when collection changes
  useEffect(() => {
    setProducts([]);
    setCursor(null);
    setPageInfo(null);
  }, [collection]);

  // Fetch fn uses cursor
  const queryFn = useCallback(async (): Promise<{ items: AppProduct[]; pageInfo: ShopifyPageInfo }> => {
    if (collection) {
      const result = await getCollectionByHandle(collection, { first: limit, after: cursor ?? undefined });
      return { items: result?.products.items ?? [], pageInfo: result?.products.pageInfo ?? { hasNextPage: false, endCursor: null } };
    }
    return await getProducts({ first: limit, after: cursor ?? undefined });
  }, [collection, limit, cursor]);

  // On success, append (not replace) if cursor is set, else replace
  // ... hook body follows the existing useShopifyQuery pattern but with manual accumulation

  const loadMore = pageInfo?.hasNextPage
    ? () => setCursor(pageInfo.endCursor)
    : null;

  return { products, loading, isRefetching, error, refetch, pageInfo, loadMore, isLoadingMore };
}
```

Note: Because cursor-based accumulation requires stateful product list management that useShopifyQuery doesn't support (it only manages a single fetch's result), the upgraded useProducts will manage its own product state directly rather than delegating to useShopifyQuery. Use useShopifyQuery for the per-page fetch if possible, but accumulate in useProducts state.

### Variant Matching

```typescript
// Source: client-side logic derived from ShopifyProductVariant shape
// AppProduct.variants: ShopifyProductVariant[] — all variants with selectedOptions and availableForSale

function findVariant(
  variants: ShopifyProductVariant[],
  selectedOptions: Record<string, string>
): ShopifyProductVariant | null {
  const entries = Object.entries(selectedOptions);
  if (entries.length === 0) return null;
  return variants.find((v) =>
    entries.every(([name, value]) =>
      v.selectedOptions.some((opt) => opt.name === name && opt.value === value)
    )
  ) ?? null;
}
```

### Sticky Bottom Bar Layout

```typescript
// Source: React Native layout — SafeAreaView + flex column

return (
  <Screen>  {/* SafeAreaView, flex:1 */}
    <ScrollView flex:1 showsVerticalScrollIndicator={false}>
      {/* gallery, info, variants, story, materials */}
    </ScrollView>

    {/* Sticky bar — outside ScrollView, always visible */}
    <View style={styles.stickyBar}>
      <Text style={styles.stickyPrice}>${price}</Text>
      <TouchableOpacity
        style={[styles.addButton, !selectedVariant && styles.addButtonDisabled]}
        onPress={handleAddToCart}
        disabled={!selectedVariant || buttonState === 'adding'}
      >
        <Text style={styles.addButtonText}>
          {buttonState === 'added' ? 'Added!' :
           buttonState === 'adding' ? 'Adding...' :
           selectedVariant ? 'Add to Cart' : 'Select options to add'}
        </Text>
      </TouchableOpacity>
    </View>
  </Screen>
);
```

### Web-Only Prev/Next Gallery Buttons

```typescript
// Source: Platform.select pattern established in Phase 1 (existing codebase)
// scrollRef.current?.scrollTo for imperative control

const scrollRef = useRef<ScrollView>(null);

function handlePrev() {
  if (currentIndex === 0) return;
  const newIndex = currentIndex - 1;
  scrollRef.current?.scrollTo({ x: newIndex * galleryWidth, animated: true });
  setCurrentIndex(newIndex);
}

// In render:
{Platform.OS === 'web' && images.length > 1 && currentIndex > 0 && (
  <TouchableOpacity style={styles.prevButton} onPress={handlePrev}>
    <Text style={styles.arrowText}>‹</Text>
  </TouchableOpacity>
)}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-native-snap-carousel (deprecated) | ScrollView pagingEnabled or reanimated-carousel | 2022-2023 | Don't install react-native-snap-carousel |
| Shopify page-based REST pagination | Cursor-based GraphQL pagination (after/endCursor) | 2020+ | Must use `after` cursor, not page numbers |
| Shopify `variantBySelectedOptions` API call | Client-side variant matching from pre-fetched variants | N/A (both valid) | Prefer client-side — no extra network call; all data already in AppProduct |

**Deprecated/outdated:**
- `react-native-snap-carousel`: Archived/unmaintained — never use
- `react-native-gallery-swiper`: Old, limited maintenance — never use

---

## Open Questions

1. **Collection handle `frontpage` on Browse screen**
   - What we know: Shopify store has `frontpage` collection (confirmed in Phase 2 smoke test)
   - What's unclear: Should `frontpage` appear as a filter chip in Browse, or should it be treated as the default "all products" view?
   - Recommendation: Omit `frontpage` from filter chips; the "All" chip = unfiltered `getProducts`. Update `productCategories` in `theme.ts` to only list collections with matching Shopify handles: `tie-dye`, `leather`, `jewelry`, `art`. Add `artwork` as a label alias for handle `art`.

2. **ProductCard and ProductGrid type migration**
   - What we know: Both components accept `Product` from `types/index.ts`, which has `name` (not `title`), `price: number` (not `priceRange`), `images: string[]` (not `ShopifyImage[]`), `maker: Maker` (not `vendor: string`)
   - What's unclear: Phase 6 will need a `mapAppProductToProduct` adapter in Browse (same as Home). Is it time to consolidate types?
   - Recommendation: Do NOT consolidate types in Phase 6. Copy the local adapter from `index.tsx` into `browse.tsx`. Type consolidation is a Phase 9 or later concern — premature refactoring would block this phase.

3. **Product Detail route uses `id` param but hook takes `handle`**
   - What we know: `app/product/[id].tsx` reads `const { id } = useLocalSearchParams()`. `useProduct(handle)` takes a handle string. Navigation in Home screen does `router.push(\`/product/${product.id}\`)` using the GID.
   - Recommendation: Update `product/[id].tsx` to read `handle` from params (rename param in navigation call sites to `handle`, or rename the route file to `[handle].tsx`). The simplest fix: keep the route as `[id].tsx` but pass `product.handle` when navigating, and treat the `id` param as the handle. This is already how `product/[id].tsx` names its param — it just needs nav call sites to pass `handle` not GID.

---

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `/Users/jamesputman/SRC/wildenflowerShop/hooks/useProducts.ts` — current hook shape and limitations
- Codebase analysis: `/Users/jamesputman/SRC/wildenflowerShop/lib/shopify-mappers.ts` — AppProduct type with full variants array
- Codebase analysis: `/Users/jamesputman/SRC/wildenflowerShop/lib/shopify-queries.ts` — confirmed pageInfo/endCursor in GET_PRODUCTS_QUERY and GET_COLLECTION_BY_HANDLE_QUERY
- Codebase analysis: `/Users/jamesputman/SRC/wildenflowerShop/context/CartContext.tsx` — confirmed `addToCart(variantId: string, quantity?: number): Promise<boolean>` signature
- Codebase analysis: `/Users/jamesputman/SRC/wildenflowerShop/types/shopify.ts` — confirmed `ShopifyProductVariant.selectedOptions`, `availableForSale`, `id`
- Codebase analysis: `.planning/STATE.md` — confirmed collection handle mismatch and carousel web compatibility as known blockers
- React Native docs: `ScrollView` `pagingEnabled` + `horizontal` — standard pattern for image carousel

### Secondary (MEDIUM confidence)
- GitHub issue #315 (react-native-reanimated-carousel, closed NOT_PLANNED Feb 2025) — web incompatibility confirmed unresolved
- Shopify developer docs: Cursor-based pagination with `after`/`endCursor` — confirmed pattern
- Expo Router docs: `useLocalSearchParams<{ category?: string }>()` — confirmed usage pattern for tab-to-tab param passing
- rn-carousel.dev: Official carousel docs claim web support but do not provide a validated setup path for react-native-web

### Tertiary (LOW confidence)
- Contextual variant availability (grey-out per-selection context): Not verified from official source; behavior described as standard e-commerce pattern but no Shopify-specific documentation found

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed, patterns verified in codebase
- Architecture: HIGH — hook upgrade pattern, variant matching, sticky bar layout all derived from existing codebase patterns
- Pitfalls: HIGH for handles/GID mismatch and filter reset (derived from code), MEDIUM for web gallery width (common RN-web gotcha), LOW for contextual variant availability (no authoritative source)
- Collection handle mismatch resolution: HIGH — smoke test data in STATE.md is authoritative

**Research date:** 2026-02-20
**Valid until:** 2026-03-20 (stable domain; Shopify API version 2026-01 is current)
