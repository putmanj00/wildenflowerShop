/**
 * Wildenflower — Browse / Product Listing Screen
 * ===============================================
 * Finders wander the full shop, filtered by Shopify collection.
 *
 * Layout (top to bottom):
 * 1. BotanicalHeader variant="small" (compact 120px banner)
 * 2. SectionTitle "Wander the Shop"
 * 3. FilterChipRow — horizontal scroll: "All" + one chip per productCategory
 * 4. ProductGrid with live Shopify data (or SkeletonGrid / empty / error state)
 * 5. "Discover more" button — conditional on hasNextPage
 * 6. Bottom breathing room
 *
 * Reference mockup: wildenflowerProductListing.png
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { colors, fonts, fontSizes, productCategories, spacing, radii } from '../../constants/theme';
import { useFavorites } from '../../context/FavoritesContext';
import { useProducts } from '../../hooks/useProducts';
import type { AppProduct } from '../../lib/shopify-mappers';
import type { Product } from '../../types';

import Screen from '../../components/layout/Screen';
import BotanicalHeader from '../../components/BotanicalHeader';
import SectionTitle from '../../components/SectionTitle';
import ProductGrid from '../../components/ProductGrid';
import SkeletonProductCard from '../../components/SkeletonProductCard';
import PrimaryButton from '../../components/PrimaryButton';

// ─── Local Type Adapter ──────────────────────────────────────────────────────
// Bridges AppProduct (Shopify shape) → Product (app UI shape).
// IMPORTANT: id is set to p.handle (not GID) so router.push(`/product/${product.id}`)
// routes to /product/[handle] which useProduct() in [id].tsx expects.
function mapAppProductToProduct(p: AppProduct): Product {
  return {
    id: p.handle, // handle — [id].tsx reads this as the Shopify handle
    name: p.title,
    price: parseFloat(p.priceRange.minVariantPrice.amount),
    description: p.description,
    images: p.images.map((img) => img.url),
    category: p.productType || (p.tags[0] ?? ''),
    maker: {
      id: p.vendor.toLowerCase().replace(/\s+/g, '-'),
      name: p.vendor,
    },
    createdAt: new Date().toISOString(),
  };
}

// ─── Chip Data ────────────────────────────────────────────────────────────────
// "All" chip uses null collection (unfiltered); category chips use their Shopify handle.
const allChips: Array<{ id: string | null; label: string }> = [
  { id: null, label: 'All' },
  ...productCategories.map((c) => ({ id: c.id, label: c.label })),
];

// ─── Skeleton Grid ────────────────────────────────────────────────────────────
// Six placeholder cards matching the ProductGrid two-column layout.
function SkeletonGrid() {
  const left = [0, 2, 4];
  const right = [1, 3, 5];
  return (
    <View style={skeletonStyles.grid}>
      <View style={skeletonStyles.col}>
        {left.map((i) => (
          <SkeletonProductCard key={i} style={skeletonStyles.card} />
        ))}
      </View>
      <View style={skeletonStyles.col}>
        {right.map((i) => (
          <SkeletonProductCard key={i} style={skeletonStyles.card} />
        ))}
      </View>
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenPadding,
    gap: spacing.itemGap,
  },
  col: {
    flex: 1,
  },
  card: {
    marginBottom: spacing.itemGap,
  },
});

// ─── Browse Screen ────────────────────────────────────────────────────────────

export default function BrowseScreen() {
  const router = useRouter();

  // Pre-filter support: Home screen's CategoryRow passes a category param.
  // Per STATE.md: category id matches Shopify collection handle 1:1.
  const { category } = useLocalSearchParams<{ category?: string | string[] }>();
  const initialCategory = Array.isArray(category) ? (category[0] ?? null) : (category ?? null);
  const [activeCollection, setActiveCollection] = useState<string | null>(initialCategory);

  // ─── Data ──────────────────────────────────────────────────────────────────
  const {
    products: rawProducts,
    loading,
    isLoadingMore,
    error,
    loadMore,
    refetch,
  } = useProducts({
    collection: activeCollection ?? undefined,
    limit: 20,
  });

  // ─── Favorites ─────────────────────────────────────────────────────────────
  const { toggleFavorite, isFavorite } = useFavorites();

  // ─── Derived State ─────────────────────────────────────────────────────────
  const displayProducts: Product[] = rawProducts.map(mapAppProductToProduct);
  const favoritedIds = displayProducts.map((p) => p.id).filter((id) => isFavorite(id));

  // Show skeleton only on initial load (loading=true AND no products accumulated yet).
  // When changing filter, collection reset clears products[], so skeleton re-appears.
  const showSkeleton = loading && displayProducts.length === 0;
  const showEmpty = !loading && !error && displayProducts.length === 0;
  const showError = !loading && error !== null && displayProducts.length === 0;
  const showGrid = !showSkeleton && !showError && displayProducts.length > 0;

  // ─── Handlers ──────────────────────────────────────────────────────────────
  function handleProductPress(product: Product) {
    // product.id holds the Shopify handle (see mapAppProductToProduct above)
    router.push(`/product/${product.id}`);
  }

  function handleChipPress(chipId: string | null) {
    setActiveCollection(chipId);
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Compact botanical banner */}
        <BotanicalHeader variant="small" />

        {/* Screen title */}
        <SectionTitle title="Wander the Shop" />

        {/* Filter chip row — single-select collection filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {allChips.map((chip) => {
            const isActive = activeCollection === chip.id;
            return (
              <TouchableOpacity
                key={chip.id ?? '__all__'}
                onPress={() => handleChipPress(chip.id)}
                activeOpacity={0.75}
                style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={`Filter by ${chip.label}`}
              >
                <Text style={[styles.chipText, isActive ? styles.chipTextActive : styles.chipTextInactive]}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Content area: skeleton, error, empty, or product grid */}
        {showSkeleton && <SkeletonGrid />}

        {showError && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>
              The shop is resting.{'\n'}Try again soon.
            </Text>
            <PrimaryButton label="Try Again" onPress={refetch} variant="terracotta" />
          </View>
        )}

        {showEmpty && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>Nothing has wandered here yet.</Text>
          </View>
        )}

        {showGrid && (
          <ProductGrid
            products={displayProducts}
            onProductPress={handleProductPress}
            onFavoriteToggle={toggleFavorite}
            favorites={favoritedIds}
          />
        )}

        {/* Discover more — cursor pagination, only when next page exists */}
        {loadMore !== null && (
          <View style={styles.discoverMore}>
            {isLoadingMore ? (
              <ActivityIndicator color={colors.terracotta} />
            ) : (
              <PrimaryButton label="Discover more" onPress={loadMore} variant="terracotta" />
            )}
          </View>
        )}

        {/* Bottom breathing room */}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollContent: {
    // ScrollView content starts flush with the header
  },

  // Filter chips
  chips: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    borderRadius: radii.chip,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipActive: {
    backgroundColor: 'rgba(208, 139, 122, 0.4)', // dustyRose at ~40% opacity
    borderColor: colors.terracotta,
  },
  chipInactive: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
  },
  chipText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySmall,
  },
  chipTextActive: {
    color: colors.earth,
  },
  chipTextInactive: {
    color: colors.sage,
  },

  // Empty / error states
  stateContainer: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.xl,
  },
  stateText: {
    fontFamily: fonts.accent,
    fontSize: fontSizes.bodyLarge,
    color: colors.sage,
    textAlign: 'center',
    lineHeight: fontSizes.bodyLarge * 1.6,
  },

  // Discover more button
  discoverMore: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.xl,
    alignItems: 'center',
  },
});
