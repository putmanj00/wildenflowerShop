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
  Image,
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
      accessibilityLabel={`${product.name}, $${product.price.toFixed(2)}`}
    >
      {/* ── Image Area ─────────────────────── */}
      <View style={styles.imageArea}>
        {product.images[0] ? (
          <Image
            source={{ uri: product.images[0] }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.imagePlaceholderLabel}>{product.category}</Text>
        )}

        {/* Decorative Corners */}
        <Image
          source={require('../assets/images/corners/card-corner-topleft.png')}
          style={styles.cornerTopLeft}
        />
        <Image
          source={require('../assets/images/corners/card-corner-bottomright.png')}
          style={styles.cornerBottomRight}
        />

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
    // Disable overflow: 'hidden' to allow the border to "bloom" over the edges
    zIndex: 1,
  },

  // Decorative border overlay
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 48,
    height: 48,
    resizeMode: 'contain',
    zIndex: 15,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 48,
    height: 48,
    resizeMode: 'contain',
    zIndex: 15,
  },

  // Image area
  imageArea: {
    height: spacing.productCardImageHeight,
    backgroundColor: colors.parchmentDark,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    overflow: 'hidden', // Keep image contained
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: { width: '100%', height: spacing.productCardImageHeight, backgroundColor: colors.parchmentDark },
  imagePlaceholderLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.sage,
    textTransform: 'capitalize',
  },

  // Favorite button
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    backgroundColor: 'rgba(250, 245, 238, 0.9)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    ...shadows.sm,
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
    padding: spacing.cardPadding, // Standard padding without overlay clearance
    backgroundColor: colors.parchmentDark,
    borderBottomLeftRadius: radii.card,
    borderBottomRightRadius: radii.card,
  },
  productName: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSizes.body,
    color: colors.earth,
    minHeight: 44,
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
