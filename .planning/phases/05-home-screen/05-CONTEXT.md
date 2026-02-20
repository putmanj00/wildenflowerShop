# Phase 5: Home Screen - Context

**Gathered:** 2026-02-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire the existing home screen layout to live Shopify data. The structural layout (BotanicalHeader, HeroCard, CategoryRow, BotanicalDivider, ProductGrid) already exists and matches the mockup. This phase replaces mock data with real Shopify products, connects category taps to Browse navigation with filters, adds loading/error states for async data, and finalises the hero card CTA.

</domain>

<decisions>
## Implementation Decisions

### Featured Products Source
- Fetch featured products from a Shopify collection named **"Featured"**
- Show **6 products** in the ProductGrid (2 columns × 3 rows — matches current layout)
- If the "Featured" collection doesn't exist in Shopify, **fall back to the newest 6 products** from all products
- "See All" navigates to **Browse unfiltered** (full catalog, not just the Featured collection)

### Category → Browse Wiring
- Categories stay **hardcoded in `constants/theme.ts`** — no Shopify fetch for CategoryRow
- Tapping a category chip on Home **navigates to Browse, pre-filtered** to that category (not just highlights it)
- Category filter maps to Shopify: **category `id` matches the Shopify collection handle** (1:1, e.g. `id: "tie-dye"` → collection handle `"tie-dye"`)

### Loading & Error States
- While products load: show **skeleton cards** (parchment-coloured placeholders) in the 6-slot ProductGrid
- On fetch failure: show a **brand-voiced error message** in place of the grid (e.g. "The shop is resting. Try again soon.")
- Home screen supports **pull-to-refresh** — finders can pull down on the ScrollView to reload Shopify products

### Hero Card
- Hero card has a **dedicated button** (e.g. "Explore the Shop") — not a full-card tap target
- Button navigates to **Browse, all products, unfiltered**
- Hero background: **static illustrated botanical image from assets** (uses illustrated asset when available; parchment/forest colour placeholder until then)

### Claude's Discretion
- Skeleton card visual design (exact placeholder colours, shimmer vs static)
- Error message copy (brand voice guidance: warm, unhurried — avoid "Error" or "Failed")
- Pull-to-refresh indicator style
- Exact button label copy (should follow brand vocabulary — "Wander the Shop", "Explore the Shop", etc.)

</decisions>

<specifics>
## Specific Ideas

- The hero card already exists as `components/HeroCard.tsx` — it needs a button added, not a full rebuild
- `CategoryRow` already navigates via `onCategoryPress` callback; the home screen just needs to call `router.push('/(tabs)/browse', { filter: categoryId })` instead of setting local state
- The `useProducts` and `useCollections` hooks from Phase 4 are the data source — no new fetching infrastructure needed

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 05-home-screen*
*Context gathered: 2026-02-20*
