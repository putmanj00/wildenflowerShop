/**
 * Wildenflower — Product Detail Screen
 * =====================================
 * Shows a product fetched by Shopify handle.
 *
 * Layout:
 * - Full-width swipeable image gallery with dot indicators
 * - Web prev/next arrow buttons always visible on image edges
 * - Product title + maker name
 * - BotanicalDivider
 * - Multi-option variant selector with availability markings (strikethrough on unavailable)
 * - "The Story Behind This Piece" description section
 * - Sticky bottom bar: price + Add to Cart button
 *
 * Note: Uses Screen (not ScrollScreen) because of the sticky bottom bar outside ScrollView.
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, fonts, fontSizes, radii, spacing } from '../../../constants/theme';
import { useProduct } from '../../../hooks/useProduct';
import { useCart } from '../../../context/CartContext';
import { useFavorites } from '../../../context/FavoritesContext';
import type { FavoriteSnapshot } from '../../../context/FavoritesContext';
import type { ShopifyProductVariant } from '../../../types/shopify';
import Screen from '../../../components/layout/Screen';
import BotanicalDivider from '../../../components/BotanicalDivider';
import TopNav from '../../../components/layout/TopNav';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Finds the variant that matches ALL currently selected option name/value pairs.
 * Returns null if no selection has been made or if no matching variant exists.
 */
function findVariant(
  variants: ShopifyProductVariant[],
  selectedOptions: Record<string, string>
): ShopifyProductVariant | null {
  const entries = Object.entries(selectedOptions);
  if (entries.length === 0) return null;
  return (
    variants.find((v) =>
      entries.every(([name, value]) =>
        v.selectedOptions.some((opt) => opt.name === name && opt.value === value)
      )
    ) ?? null
  );
}

/**
 * Returns the set of values for a given option name that have NO available variants.
 * "Global unavailability" simplification (v1) — ignores cross-option combinations.
 * See RESEARCH.md Pitfall 3 for trade-offs.
 */
function getUnavailableValues(
  variants: ShopifyProductVariant[],
  optionName: string
): Set<string> {
  const unavailable = new Set<string>();
  const allValues = new Set(
    variants.flatMap((v) =>
      v.selectedOptions
        .filter((o) => o.name === optionName)
        .map((o) => o.value)
    )
  );
  allValues.forEach((val) => {
    const hasAvailable = variants.some(
      (v) =>
        v.selectedOptions.some((o) => o.name === optionName && o.value === val) &&
        v.availableForSale
    );
    if (!hasAvailable) unavailable.add(val);
  });
  return unavailable;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProductDetailScreen() {
  const { id: handle } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // ─── Gallery state ────────────────────────────────────────────────────────
  const { width } = useWindowDimensions();
  const galleryWidth = Math.min(width, 600); // cap at 600px for web desktop
  const galleryHeight = galleryWidth * (5 / 4); // 4:5 portrait ratio
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  // ─── Variant state ────────────────────────────────────────────────────────
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [buttonState, setButtonState] = useState<'idle' | 'adding' | 'added'>('idle');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  // ─── Derived variant data ─────────────────────────────────────────────────
  const { product, shop, loading, error } = useProduct(
    Array.isArray(handle) ? handle[0] : handle ?? ''
  );

  // Dropdown states for policies
  const [shippingOpen, setShippingOpen] = useState(false);
  const [returnsOpen, setReturnsOpen] = useState(false);

  // ─── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.terracotta} />
        </View>
      </Screen>
    );
  }

  // ─── Error / not found state ──────────────────────────────────────────────
  if (error || !product) {
    return (
      <Screen>
        <View style={styles.centered}>
          <Text style={styles.errorText}>
            This piece has wandered off.{'\n'}Try finding it again.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  const variants = product?.variants ?? [];
  const images = product?.images ?? [];

  // Derive option names from variants since ShopifyProduct.options is not in our type.
  // Preserves original insertion order across all variants.
  const optionNames = variants.length > 0
    ? Array.from(new Set(variants.flatMap((v) => v.selectedOptions.map((o) => o.name))))
    : [];

  const allOptionsSelected =
    optionNames.length > 0 && optionNames.every((name) => selectedOptions[name]);

  // Single-variant shortcut: Shopify default variant has title "Default Title".
  // Auto-select it silently so "Add to Cart" is immediately available.
  const isSingleVariantProduct =
    variants.length === 1 && variants[0].title === 'Default Title';

  const selectedVariant = isSingleVariantProduct
    ? variants[0]
    : allOptionsSelected
      ? findVariant(variants, selectedOptions)
      : null;

  // ─── Gallery navigation (web) ─────────────────────────────────────────────
  function handlePrev() {
    if (currentIndex === 0) return;
    const newIndex = currentIndex - 1;
    scrollRef.current?.scrollTo({ x: newIndex * galleryWidth, animated: true });
    setCurrentIndex(newIndex);
  }

  function handleNext() {
    if (currentIndex === images.length - 1) return;
    const newIndex = currentIndex + 1;
    scrollRef.current?.scrollTo({ x: newIndex * galleryWidth, animated: true });
    setCurrentIndex(newIndex);
  }

  // ─── Add to cart ──────────────────────────────────────────────────────────
  async function handleAddToCart() {
    if (!selectedVariant || buttonState !== 'idle') return;
    setButtonState('adding');
    const success = await addToCart(selectedVariant.id, quantity);
    if (success) {
      setButtonState('added');
      setTimeout(() => {
        setButtonState('idle');
        setQuantity(1); // Reset quantity
      }, 1500);
    } else {
      setButtonState('idle');
      // No persistent error state — CartContext returns boolean; screen shows nothing on failure
    }
  }

  // ─── Button label ─────────────────────────────────────────────────────────
  let buttonLabel = 'Select options to add';
  if (buttonState === 'adding') buttonLabel = 'Adding...';
  else if (buttonState === 'added') buttonLabel = 'Added!';
  else if (selectedVariant) buttonLabel = 'Add to Cart';

  const isButtonDisabled = !selectedVariant || buttonState !== 'idle';

  // ─── Price display ────────────────────────────────────────────────────────
  const displayPrice = `$${parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}`;

  // ─── Favorite toggle handler ──────────────────────────────────────────────
  function handleFavoriteToggle() {
    if (!product) return;
    const snapshot: FavoriteSnapshot = {
      id: product.id,
      handle: Array.isArray(handle) ? (handle[0] ?? '') : (handle ?? ''),
      title: product.title,
      imageUrl: product.images[0]?.url ?? null,
      price: product.priceRange.minVariantPrice.amount,
      currencyCode: product.priceRange.minVariantPrice.currencyCode,
      vendor: product.vendor,
    };
    toggleFavorite(snapshot);
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Screen>
      <TopNav />
      {/* Scrollable content */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Image gallery */}
        <View style={styles.galleryContainer}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / galleryWidth);
              setCurrentIndex(idx);
            }}
            style={{ width: galleryWidth, height: galleryHeight }}
          >
            {images.length > 0 ? (
              images.map((img, i) => (
                <Image
                  key={i}
                  source={{ uri: img.url }}
                  style={{ width: galleryWidth, height: galleryHeight }}
                  resizeMode="cover"
                />
              ))
            ) : (
              /* ASSET: product-placeholder.png — Placeholder for products with no images */
              <View
                style={[styles.imagePlaceholder, { width: galleryWidth, height: galleryHeight }]}
              />
            )}
          </ScrollView>

          {/* Web prev/next buttons — always visible on web when multiple images */}
          {Platform.OS === 'web' && images.length > 1 && (
            <>
              {currentIndex > 0 && (
                <TouchableOpacity style={styles.prevButton} onPress={handlePrev}>
                  <Text style={styles.arrowText}>&#8249;</Text>
                </TouchableOpacity>
              )}
              {currentIndex < images.length - 1 && (
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                  <Text style={styles.arrowText}>&#8250;</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* Dot indicators */}
        {images.length > 1 && (
          <View style={styles.dots}>
            {images.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === currentIndex && styles.dotActive]}
              />
            ))}
          </View>
        )}

        {/* Product info */}
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={[styles.productTitle, styles.titleFlex]} numberOfLines={3}>
              {product.title}
            </Text>
            {/* Favorite heart */}
            <TouchableOpacity
              style={styles.heartButton}
              onPress={handleFavoriteToggle}
              accessibilityRole="button"
              accessibilityLabel={
                isFavorite(product.id) ? 'Remove from favorites' : 'Add to favorites'
              }
            >
              <Text style={styles.heartIcon}>
                {isFavorite(product.id) ? '♥' : '♡'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Ratings & Maker */}
          <View style={styles.metaRow}>
            {product.vendor || product.makerName ? (
              <TouchableOpacity
                onPress={() => {
                  const maker = product.vendor || product.makerName;
                  if (maker) {
                    router.push(`/maker/${encodeURIComponent(maker)}` as `/${string}`);
                  }
                }}
                accessibilityRole="button"
                accessibilityLabel={`View maker profile`}
              >
                <Text style={[styles.makerName, styles.makerNameTappable]}>
                  by {product.vendor || product.makerName} ›
                </Text>
              </TouchableOpacity>
            ) : null}

            {product.rating !== undefined && product.reviewCount !== undefined && (
              <View style={styles.reviewBadge}>
                <Text style={styles.starIcon}>★</Text>
                <Text style={styles.reviewText}>
                  {product.rating.toFixed(1)} ({product.reviewCount})
                </Text>
              </View>
            )}
          </View>

          {/* Inventory Status */}
          {product.inventoryQuantity !== undefined && product.inventoryQuantity > 0 && product.inventoryQuantity <= 5 && (
            <Text style={styles.lowInventoryText}>
              Only {product.inventoryQuantity} left!
            </Text>
          )}
        </View>

        <BotanicalDivider variant="fern-spiral" />

        {/* Variant selector — hidden for single-variant (Default Title) products */}
        {!isSingleVariantProduct &&
          optionNames.map((optionName) => {
            const unavailable = getUnavailableValues(variants, optionName);
            const values = Array.from(
              new Set(
                variants.flatMap((v) =>
                  v.selectedOptions
                    .filter((o) => o.name === optionName)
                    .map((o) => o.value)
                )
              )
            );
            return (
              <View key={optionName} style={styles.optionGroup}>
                <Text style={styles.optionLabel}>{optionName}</Text>
                <View style={styles.optionPills}>
                  {values.map((value) => {
                    const isUnavailable = unavailable.has(value);
                    const isSelected = selectedOptions[optionName] === value;
                    return (
                      <TouchableOpacity
                        key={value}
                        style={[
                          styles.pill,
                          isSelected && styles.pillSelected,
                          isUnavailable && styles.pillUnavailable,
                        ]}
                        onPress={() => {
                          if (!isUnavailable) {
                            setSelectedOptions((prev) => ({ ...prev, [optionName]: value }));
                          }
                        }}
                        disabled={isUnavailable}
                      >
                        <Text
                          style={[
                            styles.pillText,
                            isSelected && styles.pillTextSelected,
                            isUnavailable && styles.pillTextUnavailable,
                          ]}
                        >
                          {value}
                        </Text>
                        {/* Strikethrough line on unavailable options */}
                        {isUnavailable && <View style={styles.strikethrough} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionLabel}>The Story Behind This Piece</Text>
          {product.description ? (
            <Text style={styles.descriptionText}>{product.description}</Text>
          ) : (
            <Text style={styles.descriptionText}>
              Handcrafted with care by {product.vendor || 'a local artisan'}.
            </Text>
          )}
        </View>

        {/* Shop Policies (Accordion style) */}
        {shop && (
          <View style={styles.policiesSection}>
            <BotanicalDivider variant="fern-spiral" />

            {/* Shipping */}
            {shop.shippingPolicy && (
              <View style={styles.policyItem}>
                <TouchableOpacity
                  style={styles.policyHeader}
                  onPress={() => setShippingOpen(!shippingOpen)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: shippingOpen }}
                >
                  <Text style={styles.policyTitle}>{shop.shippingPolicy.title || 'Shipping'}</Text>
                  <Text style={styles.policyIcon}>{shippingOpen ? '−' : '+'}</Text>
                </TouchableOpacity>
                {shippingOpen && (
                  <Text style={styles.policyBody}>{shop.shippingPolicy.body}</Text>
                )}
              </View>
            )}

            {/* Returns */}
            {shop.refundPolicy && (
              <View style={styles.policyItem}>
                <TouchableOpacity
                  style={styles.policyHeader}
                  onPress={() => setReturnsOpen(!returnsOpen)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: returnsOpen }}
                >
                  <Text style={styles.policyTitle}>{shop.refundPolicy.title || 'Returns'}</Text>
                  <Text style={styles.policyIcon}>{returnsOpen ? '−' : '+'}</Text>
                </TouchableOpacity>
                {returnsOpen && (
                  <Text style={styles.policyBody}>{shop.refundPolicy.body}</Text>
                )}
              </View>
            )}
          </View>
        )}

        {/* Bottom breathing room — ensures content scrolls above sticky bar */}
        <View style={{ height: spacing.xxxl }} />
      </ScrollView>

      {/* Sticky bottom bar — lives outside ScrollView */}
      <View style={styles.stickyBar}>
        <View style={styles.stickyBarLeft}>
          <Text style={styles.stickyPrice}>{displayPrice}</Text>
          <View style={styles.quantityStepper}>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Text style={[styles.stepperButtonText, quantity <= 1 && styles.stepperButtonTextDisabled]}>−</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => setQuantity(quantity + 1)}
              disabled={product.inventoryQuantity ? quantity >= product.inventoryQuantity : false}
            >
              <Text style={[styles.stepperButtonText, (product.inventoryQuantity ? quantity >= product.inventoryQuantity : false) && styles.stepperButtonTextDisabled]}>+</Text>
            </TouchableOpacity>
          </View>
          {product.inventoryQuantity && product.inventoryQuantity > 1 && quantity >= product.inventoryQuantity && (
            <Text style={styles.stockWarningText}>Last one in stock!</Text>
          )}
          {product.inventoryQuantity === 1 && (
            <Text style={styles.stockWarningText}>Only 1 available!</Text>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.addButton,
            isButtonDisabled && styles.addButtonDisabled,
          ]}
          onPress={handleAddToCart}
          disabled={isButtonDisabled}
        >
          <Text style={styles.addButtonText}>{buttonLabel}</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Loading / error states
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenPadding,
    gap: spacing.xl,
    backgroundColor: colors.parchment,
  },
  errorText: {
    fontFamily: fonts.accent,
    fontSize: fontSizes.bodyLarge,
    color: colors.sage,
    textAlign: 'center',
    lineHeight: fontSizes.bodyLarge * 1.6,
  },
  backButton: {
    backgroundColor: colors.terracotta,
    borderRadius: radii.button,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  backButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSizes.button,
    color: colors.parchment,
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Gallery
  galleryContainer: {
    position: 'relative',
    backgroundColor: colors.parchmentDark,
  },
  imagePlaceholder: {
    backgroundColor: colors.parchmentDark,
  },

  // Web prev/next navigation buttons
  prevButton: {
    position: 'absolute',
    left: spacing.sm,
    top: '50%' as unknown as number,
    transform: [{ translateY: -24 }],
    backgroundColor: 'rgba(245, 237, 214, 0.85)',
    borderRadius: radii.round,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    position: 'absolute',
    right: spacing.sm,
    top: '50%' as unknown as number,
    transform: [{ translateY: -24 }],
    backgroundColor: 'rgba(245, 237, 214, 0.85)',
    borderRadius: radii.round,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontFamily: fonts.heading,
    fontSize: 32,
    color: colors.earth,
    lineHeight: 36,
    textAlign: 'center',
  },

  // Dot indicators
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.terracotta,
  },

  // Product info
  info: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  productTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.h2,
    color: colors.terracotta,
    lineHeight: fontSizes.h2 * 1.3,
    marginBottom: spacing.xs,
  },
  makerName: {
    fontFamily: fonts.accent,
    fontSize: fontSizes.body,
    color: colors.sage,
  },
  makerNameTappable: {
    color: colors.terracotta,
    textDecorationLine: 'underline' as const,
  },

  // Title row (title + heart button side by side)
  titleRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: spacing.sm,
  },
  titleFlex: {
    flex: 1,
  },
  heartButton: {
    width: 40,
    height: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: radii.round,
    backgroundColor: 'rgba(245, 237, 214, 0.0)', // transparent; tappable hit area
    marginTop: 2,
  },
  heartIcon: {
    fontSize: 26,
    color: colors.terracotta,
    lineHeight: 30,
  },


  // Variant selector
  optionGroup: {
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.lg,
  },
  optionLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSizes.bodySmall,
    color: colors.earth,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  optionPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.round,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    position: 'relative',
    overflow: 'hidden',
  },
  pillSelected: {
    borderColor: colors.terracotta,
    backgroundColor: 'rgba(208, 139, 122, 0.18)', // dustyRose at low opacity
  },
  pillUnavailable: {
    borderColor: colors.borderLight,
    opacity: 0.5,
  },
  pillText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.body,
    color: colors.earth,
  },
  pillTextSelected: {
    color: colors.terracotta,
    fontFamily: fonts.bodyBold,
  },
  pillTextUnavailable: {
    color: colors.textMuted,
  },
  strikethrough: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.earth,
    top: '50%' as unknown as number,
  },

  // Description
  descriptionSection: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xl,
  },
  descriptionLabel: {
    fontFamily: fonts.headingItalic,
    fontSize: fontSizes.h3,
    color: colors.terracotta,
    marginBottom: spacing.md,
  },
  descriptionText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.body,
    color: colors.earth,
    lineHeight: fontSizes.body * 1.7,
  },

  // Rating & Meta Row
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.xs,
  },
  reviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(208, 139, 122, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.round,
  },
  starIcon: {
    color: colors.gold,
    fontSize: fontSizes.bodySmall,
  },
  reviewText: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSizes.bodySmall,
    color: colors.earth,
  },

  // Inventory
  lowInventoryText: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSizes.bodySmall,
    color: colors.terracotta,
    marginTop: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Policies
  policiesSection: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xl,
  },
  policyItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingVertical: spacing.md,
  },
  policyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  policyTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSizes.body,
    color: colors.earth,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  policyIcon: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.h3,
    color: colors.terracotta,
  },
  policyBody: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySmall,
    color: colors.sage,
    lineHeight: fontSizes.bodySmall * 1.6,
    marginTop: spacing.sm,
    paddingRight: spacing.lg,
  },

  // Sticky bottom bar
  stickyBar: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.parchment,
  },
  stickyBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  stickyPrice: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.priceLarge,
    color: colors.gold,
  },
  quantityStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.parchmentDark,
    borderRadius: radii.button,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  stepperButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.round,
    backgroundColor: colors.parchmentLight,
  },
  stepperButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSizes.body,
    color: colors.earth,
  },
  quantityText: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSizes.body,
    color: colors.earth,
    minWidth: 16,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: colors.gold,
    borderRadius: radii.round,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    minWidth: 160,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: colors.border,
    opacity: 0.6,
  },
  addButtonText: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.button,
    color: colors.earth,
  },
});
