/**
 * Wildenflower — ProductCard
 * ===========================
 * A 2-column grid card displaying a product image, name, price,
 * botanical corner accents, a favorite toggle, and a MakerBadge.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import {
  colors,
  fonts,
  fontSizes,
  spacing,
  radii,
  shadows,
} from '../constants/theme';
import { Product } from '../types';
import MakerBadge from './MakerBadge';

// ─── Props ───────────────────────────────────

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  style?: ViewStyle;
}

// ─── Component ───────────────────────────────

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  isFavorite = false,
  onFavoriteToggle,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, $${product.price.toFixed(2)}`}
    >
      {/* ── Image Area ─────────────────────── */}
      <View style={styles.imageArea}>
        {/* ASSET: product image — product.images[0], full-width crop */}
        {/* Replace with:
          <Image
            source={{ uri: product.images[0] }}
            style={styles.productImage}
            resizeMode="cover"
          />
        */}
        <Text style={styles.imagePlaceholderLabel}>{product.category}</Text>

        {/* Corner overlays — botanical decoration */}
        <View style={styles.cornerTopLeft} pointerEvents="none">
          {/* ASSET: card-corner-topleft.png — small botanical vine/fern corner detail */}
        </View>
        <View style={styles.cornerBottomRight} pointerEvents="none">
          {/* ASSET: card-corner-bottomright.png — small botanical mushroom/flower corner detail */}
        </View>

        {/* Favorite button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={onFavoriteToggle}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.heartIcon, isFavorite && styles.heartIconActive]}>
            {isFavorite ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Content Area ───────────────────── */}
      <View style={styles.contentArea}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        <MakerBadge maker={product.maker} style={styles.makerBadge} />
      </View>
    </TouchableOpacity>
  );
};

// ─── Styles ──────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.parchmentDark,
    borderRadius: radii.card,
    ...shadows.md,
    overflow: 'hidden',
  },

  // Image area
  imageArea: {
    height: spacing.productCardImageHeight,
    backgroundColor: colors.parchmentDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Uncomment when real images are available:
  // productImage: { width: '100%', height: spacing.productCardImageHeight },
  imagePlaceholderLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.sage,
    textTransform: 'capitalize',
  },

  // Botanical corner accents
  cornerTopLeft: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    backgroundColor: colors.sage,
    borderRadius: 12,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    backgroundColor: colors.terracotta,
    borderRadius: 12,
  },

  // Favorite button
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    backgroundColor: `${colors.parchmentLight}E6`, // 0.9 opacity via hex alpha
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIcon: {
    fontSize: 16,
    color: colors.border,
    lineHeight: 20,
  },
  heartIconActive: {
    color: colors.dustyRose,
  },

  // Content area
  contentArea: {
    padding: spacing.cardPadding,
  },
  productName: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSizes.body,
    color: colors.earth,
  },
  price: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSizes.price,
    color: colors.gold,
    marginTop: spacing.xs,
  },
  makerBadge: {
    marginTop: spacing.sm,
  },
});

export default ProductCard;
