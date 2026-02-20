# Phase 6: Browse + Product Detail - Context

**Gathered:** 2026-02-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Two screens completing the browse-to-cart discovery flow: the Browse screen (filtered product listing with cursor-based pagination) and the Product Detail screen (image gallery, variant selector, add to cart). A finder can browse all products filtered by Shopify collection, open a product, view multiple images, select a variant, and add it to the cart. Cart management and checkout are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Browse filtering
- Single-select filters — tapping a chip replaces any active filter (no stacking)
- "All" chip is always first in the row; tapping it returns to unfiltered view
- Active filter chip gets the watercolor wash background per projectVision
- When a filter changes, show skeleton cards while the new collection loads (consistent with Home screen loading pattern)

### Browse pagination
- "Discover more" button at the bottom of the grid — explicit tap to load next page
- Button is brand-voiced ("Discover more", not "Load more")
- Only shown when `pageInfo.hasNextPage` is true

### Product image gallery
- Full-width hero image (edge-to-edge), swipe left/right to navigate
- Portrait aspect ratio (4:5)
- Dot indicators below image show current position
- No thumbnail strip — swipe gestures + dots only
- On web: prev/next arrow buttons overlaid on the image edges (always visible, not hover-only)

### Variant selector
- Pill-shaped button grid for each option dimension (e.g. Size, Color)
- Unavailable combinations: greyed out with a strikethrough line (not hidden)
- No default pre-selection — finder must actively choose; Add to Cart is disabled until a valid variant is selected
- Disabled button label: "Select options to add" (not generic "Add to Cart" greyed out)

### Add to Cart feedback
- Inline button state change: button briefly shows "Added!" for ~1.5 seconds, then resets to "Add to Cart"
- Duplicate adds are allowed — tapping again increases cart quantity
- Add to Cart button lives in a sticky bottom bar (always visible while scrolling), alongside the price

### Claude's Discretion
- Exact styling of the sticky bottom bar (height, shadow, separator line)
- Arrow button visual design for web gallery prev/next
- Strikethrough styling on unavailable variant chips
- Empty state copy if a filtered collection has no products
- Error state copy if product detail fails to load

</decisions>

<specifics>
## Specific Ideas

- The "Discover more" button should use brand vocabulary (not "Load more" or "See more")
- The disabled variant button label "Select options to add" should be readable at a glance — not hidden or cryptic
- Arrow buttons on web gallery should be clear affordances — finders on desktop must immediately understand they can navigate images

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 06-browse-product-detail*
*Context gathered: 2026-02-20*
