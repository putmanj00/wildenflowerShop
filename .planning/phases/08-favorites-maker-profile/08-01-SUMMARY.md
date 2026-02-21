# 08-01 Summary — FavoritesContext Upgrade + mock-data

**Date:** 2026-02-20  
**Status:** ✅ Complete

## What was built
1. **FavoritesContext upgraded** (`context/FavoritesContext.tsx`)
   - New `FavoriteSnapshot` interface: `{ id, handle, title, imageUrl, price, currencyCode, vendor }`
   - `favorites: FavoriteSnapshot[]` replaces `string[]`
   - `toggleFavorite(snapshot)` signature — persists to `AsyncStorage('wildenflower_favorites')`
   - `isFavorite(productId: string): boolean` — unchanged external signature
   - `favoritesCount: number` added
   - Prepend-newest ordering (most recently saved appears first)

2. **ProductGrid updated** (`components/ProductGrid.tsx`)
   - `onFavoriteToggle` prop type updated to `(snapshot: FavoriteSnapshot) => void`
   - Builds `FavoriteSnapshot` internally from `Product` shape via `buildSnapshot()`
   - `browse.tsx` and `index.tsx` no longer need `FavoriteSnapshot` knowledge — they pass `toggleFavorite` directly

3. **mock-data.ts updated** (`data/mock-data.ts`)
   - Ashley Sifford entry added as first maker: bio, location ("Wildenflower Studio"), specialties ("Artwork", "Jewelry", "Leatherwork", "Tie-Dye")
   - `getMakerByVendor(vendorName: string)` helper exported — case-insensitive lookup

## Verification
- `npx tsc --noEmit` → **0 errors**
