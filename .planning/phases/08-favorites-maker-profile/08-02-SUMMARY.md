# 08-02 Summary — Hearts Wired + Maker Profile Screen

**Date:** 2026-02-20  
**Status:** ✅ Complete

## What was built

### Maker Profile Screen (`app/maker/[id].tsx`)
- Route: `/maker/[id]` where `id` = URL-encoded vendor name
- Avatar circle (72×72) with initial letter — ASSET placeholder
- Maker name in terracotta heading (h2)
- Location in sage italic accent
- Bio in earth body text (centered, max 320px width)
- Specialties chips: dustyRose wash, terracotta border, `radii.chip`
- "Their Work" section heading + live product grid (filtered from `useProducts()` by vendor name)
- Graceful fallback for unknown vendors: shows vendor name + "More about this maker coming soon."
- Back button (`router.back()`)

### Product Detail Screen (`app/product/[id].tsx`)
- **Heart toggle** added next to product title (♡/♥, terracotta color, 40×40 tap area)
- Builds `FavoriteSnapshot` from Shopify product data and calls `toggleFavorite(snapshot)`
- **MakerBadge navigation**: vendor text is now tappable → `router.push('/maker/[encoded-vendor]')` with `›` chevron hint
- `useFavorites` + `FavoriteSnapshot` imported and wired

## Verification
- `npx tsc --noEmit` → **0 errors**
