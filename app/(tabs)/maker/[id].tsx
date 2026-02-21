/**
 * Wildenflower — Maker Profile Screen
 * =====================================
 * Displays a maker's story: bio, location, specialties, and their live products.
 *
 * Route: /maker/[id] where [id] = URL-encoded Shopify vendor string
 * Example: /maker/Ashley%20Sifford
 *
 * Data sources:
 * - mock-data.ts getMakerByVendor() for bio, location, specialties
 * - useProducts({ vendor: makerName }) for live Shopify products
 *
 * Graceful fallback: if vendor has no mock profile, the screen still works
 * — shows the vendor name as heading and the product grid below.
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { colors, fonts, fontSizes, radii, spacing } from '../../../constants/theme';
import { getMakerByVendor } from '../../../data/mock-data';
import { useProducts } from '../../../hooks/useProducts';
import type { AppProduct } from '../../../lib/shopify-mappers';
import type { Product } from '../../../types';

import Screen from '../../../components/layout/Screen';
import BotanicalDivider from '../../../components/BotanicalDivider';
import ProductGrid from '../../../components/ProductGrid';
import TopNav from '../../../components/layout/TopNav';

// ─── Local Type Adapter ──────────────────────────────────────────────────────
// Same pattern as browse.tsx — bridges AppProduct → Product UI shape.
function mapAppProductToProduct(p: AppProduct): Product {
  return {
    id: p.handle,
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

// ─── Component ───────────────────────────────────────────────────────────────

export default function MakerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const makerName = decodeURIComponent(Array.isArray(id) ? (id[0] ?? '') : (id ?? ''));

  // ─── Data ──────────────────────────────────────────────────────────────────
  const maker = getMakerByVendor(makerName);

  // Load live products for this vendor.
  // useProducts doesn't support vendor filtering natively — load all and filter.
  const { products: rawProducts, loading } = useProducts({ limit: 50 });
  const allProducts = rawProducts.map(mapAppProductToProduct);
  const makerProducts = allProducts.filter(
    (p) => p.maker.name.toLowerCase() === makerName.toLowerCase()
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <Screen>
      <TopNav title={makerName} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* Maker header */}
        <View style={styles.header}>
          {/* Avatar circle — large initial letter */}
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {makerName.charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text style={styles.makerName}>{makerName}</Text>

          {maker?.location ? (
            <Text style={styles.location}>{maker.location}</Text>
          ) : null}

          {maker?.bio ? (
            <Text style={styles.bio}>{maker.bio}</Text>
          ) : (
            <Text style={styles.bio}>
              More about this maker coming soon.
            </Text>
          )}
        </View>

        {/* Specialties chips */}
        {maker?.specialties && maker.specialties.length > 0 ? (
          <View style={styles.specialtiesSection}>
            <BotanicalDivider variant="fern-mushroom" />
            <View style={styles.specialtiesRow}>
              {maker.specialties.map((specialty) => (
                <View key={specialty} style={styles.chip}>
                  <Text style={styles.chipText}>{specialty}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <BotanicalDivider variant="fern-mushroom" />
        )}

        {/* Products section */}
        <View style={styles.productsSection}>
          <Text style={styles.sectionHeading}>Their Work</Text>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.terracotta} />
            </View>
          )}

          {!loading && makerProducts.length > 0 && (
            <ProductGrid
              products={makerProducts}
              onProductPress={(product) =>
                router.push(`/product/${product.id}`)
              }
            />
          )}

          {!loading && makerProducts.length === 0 && (
            <View style={styles.emptyProducts}>
              <Text style={styles.emptyText}>
                {makerName.split(' ')[0]}'s pieces are all one of a kind —{'\n'}check back soon.
              </Text>
            </View>
          )}
        </View>

        {/* Bottom breathing room */}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },

  // Back button
  backButton: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  backText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.body,
    color: colors.sage,
  },

  // Maker header
  header: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.parchmentDark,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    // ASSET: Replace with <Image source={{ uri: maker.avatar }} /> when avatars exist
  },
  avatarInitial: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.h2,
    color: colors.terracotta,
    lineHeight: fontSizes.h2 * 1.2,
  },
  makerName: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.h2,
    color: colors.terracotta,
    textAlign: 'center',
    lineHeight: fontSizes.h2 * 1.3,
  },
  location: {
    fontFamily: fonts.accent,
    fontSize: fontSizes.body,
    color: colors.sage,
    textAlign: 'center',
  },
  bio: {
    fontFamily: fonts.body,
    fontSize: fontSizes.body,
    color: colors.earth,
    textAlign: 'center',
    lineHeight: fontSizes.body * 1.7,
    marginTop: spacing.xs,
    maxWidth: 320,
  },

  // Specialties
  specialtiesSection: {
    paddingBottom: spacing.md,
  },
  specialtiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: 'rgba(208, 139, 122, 0.18)', // dustyRose wash
    borderRadius: radii.chip,
    borderWidth: 1,
    borderColor: colors.terracotta,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySmall,
    color: colors.earth,
  },

  // Products section
  productsSection: {
    paddingTop: spacing.md,
  },
  sectionHeading: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.h3,
    color: colors.terracotta,
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.md,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyProducts: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.xl,
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
