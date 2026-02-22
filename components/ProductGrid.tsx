/**
 * Wildenflower — ProductGrid
 * ===========================
 * A static 2-column product grid intended to be embedded inside a parent
 * ScrollView. Uses a split-column approach so both columns grow naturally
 * without the reflow issues of `flexWrap`.
 *
 * Do NOT wrap this in a FlatList — it renders its own layout.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '../constants/theme';
import { useFavorites, FavoriteSnapshot } from '../context/FavoritesContext';
import { Product } from '../types';
import ProductCard from './ProductCard';

// ─── Props ───────────────────────────────────

interface ProductGridProps {
  products: Product[];
  onProductPress: (product: Product) => void;
  /** Called when the favorite heart is tapped; receives a full FavoriteSnapshot. */
  onFavoriteToggle?: (snapshot: FavoriteSnapshot) => void;
  /** If provided, the grid uses this list instead of the FavoritesContext. */
  favorites?: string[];
}

// ─── Component ───────────────────────────────

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onProductPress,
  onFavoriteToggle,
  favorites,
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();

  // Split into left (even indices) and right (odd indices) columns so each
  // column can be a simple vertical stack — no flexWrap edge cases.
  const leftProducts = products.filter((_, i) => i % 2 === 0);
  const rightProducts = products.filter((_, i) => i % 2 === 1);

  const renderCard = (product: Product) => {
    const favored = favorites
      ? favorites.includes(product.id)
      : isFavorite(product.id);

    // Build a FavoriteSnapshot from the Product shape for context persistence.
    const buildSnapshot = (): FavoriteSnapshot => ({
      id: product.id,
      handle: product.handle,
      title: product.name,
      imageUrl: product.images[0] ?? null,
      price: product.price.toFixed(2),
      currencyCode: 'USD',
      vendor: product.maker.name,
    });

    const handleFavoriteToggle = () => {
      if (onFavoriteToggle) {
        onFavoriteToggle(buildSnapshot());
      } else {
        toggleFavorite(buildSnapshot());
      }
    };

    return (
      <ProductCard
        key={product.id}
        product={product}
        onPress={() => onProductPress(product)}
        isFavorite={favored}
        onFavoriteToggle={handleFavoriteToggle}
        style={styles.card}
      />
    );
  };

  return (
    <View style={styles.grid}>
      {/* Left column */}
      <View style={styles.column}>
        {leftProducts.map(renderCard)}
      </View>

      {/* Right column */}
      <View style={styles.column}>
        {rightProducts.map(renderCard)}
      </View>
    </View>
  );
};

// ─── Styles ──────────────────────────────────

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenPadding,
    gap: spacing.itemGap,
  },
  column: {
    flex: 1,
  },
  card: {
    marginBottom: spacing.itemGap,
  },
});

export default ProductGrid;
