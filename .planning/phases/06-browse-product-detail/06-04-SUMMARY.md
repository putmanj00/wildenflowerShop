---
phase: 06-browse-product-detail
plan: 04
subsystem: ui
tags: [react-native, expo, shopify, browse, product-detail, verification]

# Dependency graph
requires:
  - phase: 06-browse-product-detail
    provides: Browse screen (FilterChipRow + ProductGrid + pagination) and Product Detail screen (gallery + variant selector + sticky Add to Cart bar) wired to live Shopify data
provides:
  - Phase 6 human-approved: Browse screen brand-faithful, Product Detail browse-to-cart flow verified end-to-end on Expo Web
  - All 20 verification checklist items confirmed passing
  - GET_COLLECTION_BY_HANDLE_QUERY bug found and fixed (ProductFragment shape mismatch)
affects: [07-cart-screen, 08-favorites-screen, 09-checkout-screen]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "ProductFragment must be used in all product-returning queries to match mapProduct field expectations"
    - "Human gate confirms both visual brand fidelity and interactive flows (variant selection, add-to-cart, cart badge update)"

key-files:
  created: []
  modified:
    - lib/shopify-client.ts

key-decisions:
  - "GET_COLLECTION_BY_HANDLE_QUERY was using a minimal inline product shape instead of ...ProductFragment, causing mapProduct to throw at runtime; switched to fragment to match expected field set"

patterns-established:
  - "Fragment reuse: any query that fetches products must spread ...ProductFragment — inline shapes cause silent field mismatches caught only at runtime"

requirements-completed: [COMM-02, COMM-03]

# Metrics
duration: ~5min (verification session)
completed: 2026-02-20
---

# Phase 6 Plan 04: Browse + Product Detail Human Verification Summary

**Human-approved end-to-end browse-to-cart flow on Expo Web: all 20 checklist items passed, ProductFragment bug found and fixed during session**

## Performance

- **Duration:** ~5 min (verification session)
- **Started:** 2026-02-20
- **Completed:** 2026-02-20
- **Tasks:** 1 (checkpoint:human-verify)
- **Files modified:** 1 (lib/shopify-client.ts — bug fix)

## Accomplishments

- All 20 human verification checklist items confirmed passing on Expo Web at localhost:8081
- Browse screen: compact BotanicalHeader, FilterChipRow with active chip visual distinction, skeleton loading on filter change, 2-column ProductGrid with correct products, "Discover more" pagination
- Product Detail screen: image gallery with swipe + prev/next arrows, dot indicators, variant pills, disabled state ("Select options to add"), enabled state ("Add to Cart"), "Added!" feedback, cart badge update
- Brand fidelity confirmed: Playfair Display / Lora serif fonts throughout, parchment (#F5EDD6) background, warm earth-tone colors, no pure white or pure black
- Bug found and fixed: GET_COLLECTION_BY_HANDLE_QUERY was using a minimal inline product shape; switching to ...ProductFragment ensured mapProduct received all required fields
- Phase 6 closed — browse-to-cart path working end-to-end with live Shopify data

## Task Commits

This plan contained a single human-verify checkpoint task. The bug fix commit was recorded before verification approval:

1. **Bug fix: ProductFragment in collection query** — `249743b` (fix)

**Plan metadata:** _(this summary — docs commit below)_

## Files Created/Modified

- `lib/shopify-client.ts` — Replaced minimal inline product shape in GET_COLLECTION_BY_HANDLE_QUERY with `...ProductFragment` spread; resolves mapProduct runtime throw when fetching collection products

## Decisions Made

- `GET_COLLECTION_BY_HANDLE_QUERY` must use `...ProductFragment` — the collection query had been written with a minimal inline shape (`id title handle priceRange { minVariantPrice { amount } }`) which omitted fields that `mapProduct` expects (images, variants with selectedOptions, etc.). Switching to the shared fragment eliminates the mismatch and aligns with how all other product queries are written.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] GET_COLLECTION_BY_HANDLE_QUERY used minimal inline product shape instead of ProductFragment**
- **Found during:** Task 1 (Human verification — Browse filter chip interaction)
- **Issue:** When tapping a FilterChip, the collection query returned products with only id/title/handle/priceRange fields. `mapProduct` in `lib/shopify-client.ts` expected `images.edges`, `variants.edges[].selectedOptions`, and other fields from the shared ProductFragment, causing it to throw at runtime and preventing collection products from rendering.
- **Fix:** Replaced the inline product field set inside GET_COLLECTION_BY_HANDLE_QUERY with `...ProductFragment` spread (same fragment used by all other product queries).
- **Files modified:** `lib/shopify-client.ts`
- **Verification:** After fix, tapping Leather/Tie-Dye/Jewelry/Art filter chips correctly fetched and displayed collection products in the 2-column grid. All 20 verification items passed.
- **Committed in:** `249743b` (fix(06): use ProductFragment in collection query to match mapProduct shape)

---

**Total deviations:** 1 auto-fixed (Rule 1 — Bug)
**Impact on plan:** Bug was a blocking correctness issue discovered during the verification flow. Fix was minimal (one-line change to use existing fragment). No scope creep.

## Issues Encountered

- Filter chip product loading was broken at the start of the verification session due to the ProductFragment mismatch. Fixed before approval was given, so all 20 items could be verified cleanly.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Phase 6 complete and human-approved. Browse-to-cart path verified with live Shopify data.
- Phase 7 (Cart Screen) can begin immediately — CartContext, cart mutations, and navigation from Product Detail are all working.
- No open blockers for Phase 7.
- Carry-forward concern: Shopify cart expiry null-response shape still unvalidated with a real test cart — monitor during Phase 7 Cart Screen work.

---
*Phase: 06-browse-product-detail*
*Completed: 2026-02-20*
