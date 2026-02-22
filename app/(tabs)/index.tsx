/**
 * Wildenflower — Home Screen
 * ==========================
 * The first screen finders see. Warm, wandering, unhurried.
 *
 * Layout (top to bottom):
 * 1. BotanicalHeader (full-width, 200px illustrated banner)
 * 2. HeroCard — tagline "Made by hand. Found by heart." + "Wander the Shop" button
 * 3. SectionTitle "Explore" → CategoryRow (horizontal category scroll)
 * 4. BotanicalDivider (fern-mushroom)
 * 5. SectionTitle "Freshly Gathered" + "See All" → ProductGrid (6 items, live from Shopify)
 * 6. Bottom breathing room
 *
 * Reference: wildenflowerHomeScreen.png
 */

import React from 'react';
import { View, Text, RefreshControl, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';

import { colors, copy, fonts, fontSizes, productCategories, spacing } from '../../constants/theme';
import { useFavorites } from '../../context/FavoritesContext';
import { useProducts } from '../../hooks/useProducts';
import type { AppProduct } from '../../lib/shopify-mappers';
import type { Product } from '../../types';

import ScrollScreen from '../../components/layout/ScrollScreen';
import BotanicalHeader from '../../components/BotanicalHeader';
import HeroCard from '../../components/HeroCard';
import SectionTitle from '../../components/SectionTitle';
import CategoryRow from '../../components/CategoryRow';
import BotanicalDivider from '../../components/BotanicalDivider';
import ProductGrid from '../../components/ProductGrid';
import SkeletonProductCard from '../../components/SkeletonProductCard';
import PrimaryButton from '../../components/PrimaryButton';

// ─── Local Type Adapter ──────────────────────────────────────────────────────
// Bridges AppProduct (Shopify shape) to Product (app UI shape).
// Screen-local until a future phase consolidates types.
function mapAppProductToProduct(p: AppProduct): Product {
  return {
    id: p.handle,  // handle used as route param; useProduct(handle) expects this
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

// ─── Skeleton Grid ───────────────────────────────────────────────────────────
// Six placeholder cards matching ProductGrid two-column layout.
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

// ─── Home Screen ─────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const { toggleFavorite, isFavorite } = useFavorites();

  // ─── Data ─────────────────────────────────────────────────────────────────
  // Try featured collection first; fall back to newest 6 if empty/missing.
  // Per CONTEXT.md: "Featured" collection handle; fallback to all products.
  // useProducts takes a plain options object — the hook stabilises the query fn internally.
  const featuredHook = useProducts({ collection: 'featured', limit: 6 });
  const allHook = useProducts({ limit: 6 });

  // ─── Derived state ─────────────────────────────────────────────────────────
  // Show skeleton only during the active hook's initial load.
  // Once featuredHook resolves: if empty, allHook becomes the data source.
  const useFeatured = !featuredHook.loading && featuredHook.products.length > 0;
  const activeHook = useFeatured ? featuredHook : allHook;
  const isLoading =
    featuredHook.loading ||
    (!featuredHook.loading && featuredHook.products.length === 0 && allHook.loading);
  const isRefreshing = featuredHook.isRefetching || allHook.isRefetching;
  const hasError = !isLoading && activeHook.error !== null;
  const displayProducts: Product[] = activeHook.products.map(mapAppProductToProduct);
  const favoritedIds = displayProducts.map((p) => p.id).filter((id) => isFavorite(id));

  // ─── Handlers ──────────────────────────────────────────────────────────────
  function handleProductPress(product: Product) {
    // product.id holds the Shopify handle (set in mapAppProductToProduct above).
    // The [id] route param is named "id" but useProduct() treats it as a handle.
    router.push(`/product/${product.id}`);
  }

  function handleCategoryPress(id: string) {
    // Navigate to Browse pre-filtered to the selected category.
    // Per CONTEXT.md: category id matches Shopify collection handle 1:1.
    // Browse (Phase 6) reads the param via useLocalSearchParams().
    router.push({
      pathname: '/(tabs)/browse',
      params: { category: id },
    });
  }

  function handleExplorePress() {
    router.push('/(tabs)/browse');
  }

  function handleRefresh() {
    featuredHook.refetch();
    allHook.refetch();
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <ScrollScreen
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={colors.terracotta}
          colors={[colors.terracotta]}
        />
      }
    >
      <BotanicalHeader variant="large" />

      <HeroCard onExplorePress={handleExplorePress} />

      <SectionTitle
        title={copy.categories}
        action={Platform.OS === 'web' ? { label: 'Refresh', onPress: handleRefresh } : undefined}
      />
      <CategoryRow
        categories={productCategories}
        activeCategory={null}
        onCategoryPress={handleCategoryPress}
      />

      <BotanicalDivider variant="fern-mushroom" />

      <SectionTitle
        title={copy.featured}
        action={{
          label: copy.viewAll,
          onPress: handleExplorePress,
        }}
      />

      {isLoading && <SkeletonGrid />}

      {hasError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            The shop is resting.{'\n'}Try again soon.
          </Text>
          <PrimaryButton
            label="Try Again"
            onPress={handleRefresh}
            variant="terracotta"
          />
        </View>
      )}

      {!isLoading && !hasError && displayProducts.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Nothing here yet — but the best things take time.
          </Text>
        </View>
      )}

      {!isLoading && !hasError && displayProducts.length > 0 && (
        <ProductGrid
          products={displayProducts}
          onProductPress={handleProductPress}
          onFavoriteToggle={toggleFavorite}
          favorites={favoritedIds}
        />
      )}

    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.xl,
  },
  errorText: {
    fontFamily: fonts.accent,
    fontSize: fontSizes.bodyLarge,
    color: colors.sage,
    textAlign: 'center',
    lineHeight: fontSizes.bodyLarge * 1.6,
  },
  emptyContainer: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.accent,
    fontSize: fontSizes.bodyLarge,
    color: colors.sage,
    textAlign: 'center',
    lineHeight: fontSizes.bodyLarge * 1.6,
  },
});
