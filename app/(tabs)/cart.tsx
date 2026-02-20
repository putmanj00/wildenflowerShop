/**
 * Wildenflower — Cart Screen
 * ==========================
 * Displays live Shopify cart line items with quantity controls,
 * order summary, and Shopify checkout redirect. COMM-04.
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, fontSizes, spacing, radii, shadows } from '../../constants/theme';
import { useCart } from '../../context/CartContext';
import type { ShopifyCartLine } from '../../types/shopify';
import Screen from '../../components/layout/Screen';
import BotanicalDivider from '../../components/BotanicalDivider';

// ─── CartLineRow ──────────────────────────────────────────────────────────────
// Screen-local sub-component — not exported.

interface CartLineRowProps {
  line: ShopifyCartLine;
  onRemove: (lineId: string) => void;
  onDecrement: (lineId: string, currentQty: number) => void;
  onIncrement: (lineId: string, currentQty: number) => void;
  /** Block all controls during any in-flight mutation */
  disabled: boolean;
}

function CartLineRow({ line, onRemove, onDecrement, onIncrement, disabled }: CartLineRowProps) {
  const { product, title: variantTitle, price, selectedOptions } = line.merchandise;
  const linePrice = parseFloat(line.cost.totalAmount.amount).toFixed(2);
  const isAtMinQty = line.quantity <= 1;

  // Build human-readable variant label: skip "Default Title" for single-variant products
  const variantLabel =
    variantTitle === 'Default Title'
      ? null
      : selectedOptions.map((o) => o.value).join(' / ');

  return (
    <View style={rowStyles.container}>
      {/* Thumbnail */}
      {product.featuredImage ? (
        <Image
          source={{ uri: product.featuredImage.url }}
          style={rowStyles.thumbnail}
          resizeMode="cover"
          accessibilityLabel={product.featuredImage.altText ?? product.title}
        />
      ) : (
        <View style={rowStyles.thumbnailPlaceholder}>
          {/* ASSET: product-placeholder-thumb.png — Small botanical placeholder thumbnail */}
        </View>
      )}

      {/* Text column */}
      <View style={rowStyles.textColumn}>
        <Text style={rowStyles.productTitle} numberOfLines={2}>
          {product.title}
        </Text>
        {variantLabel ? (
          <Text style={rowStyles.variantTitle}>{variantLabel}</Text>
        ) : null}
        <Text style={rowStyles.linePrice}>${linePrice}</Text>
      </View>

      {/* Controls column */}
      <View style={rowStyles.controlsColumn}>
        {/* × Remove button */}
        <TouchableOpacity
          onPress={() => onRemove(line.id)}
          disabled={disabled}
          style={rowStyles.removeButton}
          accessibilityLabel="Remove item"
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[rowStyles.removeText, disabled && rowStyles.controlDisabled]}>×</Text>
        </TouchableOpacity>

        {/* Qty stepper: [− qty +] */}
        <View style={rowStyles.stepper}>
          <TouchableOpacity
            onPress={() => onDecrement(line.id, line.quantity)}
            disabled={disabled || isAtMinQty}
            style={rowStyles.stepperButton}
            accessibilityLabel="Decrease quantity"
            accessibilityRole="button"
          >
            <Text
              style={[
                rowStyles.stepperText,
                (disabled || isAtMinQty) && rowStyles.stepperTextDisabled,
              ]}
            >
              −
            </Text>
          </TouchableOpacity>

          <Text style={rowStyles.stepperQty}>{line.quantity}</Text>

          <TouchableOpacity
            onPress={() => onIncrement(line.id, line.quantity)}
            disabled={disabled}
            style={rowStyles.stepperButton}
            accessibilityLabel="Increase quantity"
            accessibilityRole="button"
          >
            <Text style={[rowStyles.stepperText, disabled && rowStyles.stepperTextDisabled]}>
              +
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: radii.sm,
    backgroundColor: colors.parchmentDark,
  },
  thumbnailPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: radii.sm,
    backgroundColor: colors.parchmentDark,
  },
  textColumn: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  productTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.body,
    color: colors.terracotta,
    lineHeight: fontSizes.body * 1.3,
  },
  variantTitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySmall,
    color: colors.sage,
    marginTop: spacing.xs,
  },
  linePrice: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.body,
    color: colors.gold,
    marginTop: spacing.xs,
  },
  controlsColumn: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  removeButton: {
    padding: spacing.xs,
  },
  removeText: {
    fontFamily: fonts.body,
    fontSize: 20,
    color: colors.earthLight,
    lineHeight: 20,
  },
  controlDisabled: {
    opacity: 0.35,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.chip,
    overflow: 'hidden',
  },
  stepperButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  stepperText: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.body,
    color: colors.earth,
    lineHeight: fontSizes.body * 1.2,
  },
  stepperTextDisabled: {
    opacity: 0.3,
  },
  stepperQty: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.body,
    color: colors.earth,
    minWidth: 24,
    textAlign: 'center',
    lineHeight: fontSizes.body * 1.2,
  },
});

// ─── Cart Screen ──────────────────────────────────────────────────────────────

export default function CartScreen() {
  const { cart, isLoading, removeFromCart, updateQuantity, openCheckout, cartTotal } = useCart();
  const router = useRouter();

  const lines = cart?.lines.nodes ?? [];
  const hasItems = lines.length > 0;

  // ─── Handlers ───────────────────────────────────────────────────────────────

  function handleRemove(lineId: string) {
    removeFromCart(lineId);
  }

  function handleDecrement(lineId: string, currentQty: number) {
    if (currentQty <= 1) return; // guard — button should already be disabled
    updateQuantity(lineId, currentQty - 1);
  }

  function handleIncrement(lineId: string, currentQty: number) {
    updateQuantity(lineId, currentQty + 1);
  }

  // ─── Loading State ───────────────────────────────────────────────────────────

  if (isLoading && !cart) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.terracotta} />
        </View>
      </Screen>
    );
  }

  // ─── Empty State ─────────────────────────────────────────────────────────────

  if (!hasItems) {
    return (
      <Screen>
        <View style={styles.emptyContainer}>
          {/* ASSET: empty-cart-botanical.png — Watercolor botanical: trailing vines with small wildflowers */}
          <View style={styles.emptyIllustration} />
          <Text style={styles.emptyHeading}>Nothing here yet</Text>
          <Text style={styles.emptySubtext}>
            But the best things take time.
          </Text>
          <TouchableOpacity
            style={styles.discoverButton}
            onPress={() => router.push('/(tabs)/browse')}
            accessibilityLabel="Start Discovering — go to Browse"
            accessibilityRole="button"
          >
            <Text style={styles.discoverButtonText}>Start Discovering</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  // ─── Populated Cart ──────────────────────────────────────────────────────────

  return (
    <Screen>
      {/* Scrollable line items */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Your Cart</Text>
        <BotanicalDivider variant="fern-mushroom" />

        {lines.map((line, index) => (
          <React.Fragment key={line.id}>
            <CartLineRow
              line={line}
              onRemove={handleRemove}
              onDecrement={handleDecrement}
              onIncrement={handleIncrement}
              disabled={isLoading}
            />
            {/* Divider between rows (not after last item) */}
            {index < lines.length - 1 && (
              <View style={styles.rowDivider} />
            )}
          </React.Fragment>
        ))}

        {/* Bottom breathing room above summary bar */}
        <View style={{ height: spacing.xl }} />
      </ScrollView>

      {/* Sticky order summary + checkout — outside ScrollView */}
      <View style={styles.summaryBar}>
        {/* Subtotal row */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${cartTotal.toFixed(2)}</Text>
        </View>

        {/* Shipping note */}
        <Text style={styles.shippingNote}>
          Shipping &amp; taxes calculated at checkout
        </Text>

        {/* Checkout button */}
        <TouchableOpacity
          style={[
            styles.checkoutButton,
            (!cart || !hasItems) && styles.checkoutButtonDisabled,
          ]}
          onPress={openCheckout}
          disabled={!cart || !hasItems}
          accessibilityLabel="Proceed to Checkout"
          accessibilityRole="button"
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>

        {/* Brand caption */}
        <Text style={styles.checkoutCaption}>You're about to make someone's day.</Text>
      </View>
    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Loading / empty
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    gap: spacing.lg,
  },
  emptyIllustration: {
    width: 200,
    height: 200,
    borderRadius: radii.lg,
    backgroundColor: colors.parchmentDark,
    ...shadows.sm,
  },
  emptyHeading: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.h2,
    color: colors.terracotta,
    textAlign: 'center',
  },
  emptySubtext: {
    fontFamily: fonts.accent,
    fontSize: fontSizes.body,
    color: colors.sage,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: -spacing.xs,
  },
  discoverButton: {
    backgroundColor: colors.gold,
    borderRadius: radii.round,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
    ...shadows.md,
  },
  discoverButtonText: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.button,
    color: colors.earth,
  },

  // Populated list
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  screenTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.h2,
    color: colors.terracotta,
    marginBottom: spacing.xs,
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.xs,
  },

  // Summary bar
  summaryBar: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.parchment,
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    ...shadows.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.body,
    color: colors.earth,
  },
  summaryValue: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.h3,
    color: colors.earth,
  },
  shippingNote: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySmall,
    color: colors.sage,
    marginBottom: spacing.md,
  },
  checkoutButton: {
    backgroundColor: colors.gold,
    borderRadius: radii.round,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.xs,
    ...shadows.md,
  },
  checkoutButtonDisabled: {
    opacity: 0.5,
  },
  checkoutButtonText: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.button,
    color: colors.earth,
  },
  checkoutCaption: {
    fontFamily: fonts.accent,
    fontSize: fontSizes.bodySmall,
    color: colors.sage,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
});
