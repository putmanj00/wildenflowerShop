/**
 * Wildenflower — Favorites Screen
 * =================================
 * Displays saved products as a 2-column grid from FavoriteSnapshot objects.
 * Newest-saved products appear first (FavoritesContext prepends on add).
 *
 * States:
 * - Populated: 2-column FavoriteCard grid
 * - Empty: botanical illustration placeholder + warm copy + "Start Discovering" CTA
 *
 * Reference: Phase 8 plan — flat grid, no segment toggle/tabs.
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';

import { colors, fonts, fontSizes, radii, spacing } from '../../constants/theme';
import { useFavorites, FavoriteSnapshot } from '../../context/FavoritesContext';

import Screen from '../../components/layout/Screen';
import BotanicalDivider from '../../components/BotanicalDivider';
import PrimaryButton from '../../components/PrimaryButton';

// ─── FavoriteCard ─────────────────────────────────────────────────────────────
// Screen-local sub-component. Mirrors ProductCard visual language without
// importing the full Shopify Product type.

interface FavoriteCardProps {
  snapshot: FavoriteSnapshot;
  onPress: () => void;
  onRemove: () => void;
}

function FavoriteCard({ snapshot, onPress, onRemove }: FavoriteCardProps) {
  return (
    <TouchableOpacity
      style={cardStyles.card}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={snapshot.title}
    >
      {/* Product image */}
      <View style={cardStyles.imageArea}>
        {snapshot.imageUrl ? (
          <Image
            source={{ uri: snapshot.imageUrl }}
            style={cardStyles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[cardStyles.image, cardStyles.imagePlaceholder]} />
        )}

        {/* Heart remove button — top-right corner */}
        <TouchableOpacity
          style={cardStyles.heartButton}
          onPress={onRemove}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${snapshot.title} from favorites`}
        >
          <Text style={cardStyles.heartIcon}>♥</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={cardStyles.content}>
        <Text style={cardStyles.title} numberOfLines={2}>
          {snapshot.title}
        </Text>
        <Text style={cardStyles.price}>
          ${parseFloat(snapshot.price).toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.parchmentDark,
    borderRadius: radii.card,
    overflow: 'hidden',
    marginBottom: spacing.itemGap,
    // shadows are applied via elevation/shadow — avoid cross-platform issues
    shadowColor: '#3B2F2F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  imageArea: {
    position: 'relative',
    height: 160,
    backgroundColor: colors.parchmentDark,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: colors.parchmentDark,
  },
  heartButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 32,
    height: 32,
    borderRadius: radii.round,
    backgroundColor: 'rgba(245, 237, 214, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIcon: {
    fontSize: 16,
    color: colors.terracotta,
    lineHeight: 20,
  },
  content: {
    padding: spacing.sm,
    gap: 2,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSizes.bodySmall,
    color: colors.earth,
    lineHeight: fontSizes.bodySmall * 1.4,
  },
  price: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSizes.bodySmall,
    color: colors.gold,
  },
});

// ─── Favorites Screen ─────────────────────────────────────────────────────────

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, toggleFavorite } = useFavorites();

  // ─── Empty state ───────────────────────────────────────────────────────────
  if (favorites.length === 0) {
    return (
      <Screen>
        <View style={styles.emptyContainer}>
          {/* Botanical illustration placeholder */}
          <View style={styles.illustrationPlaceholder}>
            {/* ASSET: Replace with <Image source={require('../../assets/images/botanical-heart.png')} /> */}
            <Text style={styles.illustrationEmoji}>🌿</Text>
          </View>

          <Text style={styles.emptyHeading}>Your collection is{'\n'}just beginning.</Text>

          <Text style={styles.emptySubtext}>
            Tap the heart on anything that speaks to you.
          </Text>

          <PrimaryButton
            label="Start Discovering"
            onPress={() => router.push('/(tabs)/browse')}
            variant="gold"
          />
        </View>
      </Screen>
    );
  }

  // ─── Populated state ───────────────────────────────────────────────────────
  return (
    <Screen>
      <FlatList<FavoriteSnapshot>
        data={favorites}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <Text style={styles.screenTitle}>Saved</Text>
            <BotanicalDivider variant="fern-mushroom" />
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <FavoriteCard
              snapshot={item}
              onPress={() => router.push(`/product/${item.handle}`)}
              onRemove={() => toggleFavorite(item)}
            />
          </View>
        )}
        ListFooterComponent={<View style={{ height: spacing.xxl }} />}
      />
    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenPadding,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  illustrationPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: radii.lg,
    backgroundColor: colors.parchmentDark,
    alignItems: 'center',
    justifyContent: 'center',
    // ASSET: Replace View with <Image> when botanical-heart.png is added to assets
  },
  illustrationEmoji: {
    fontSize: 64,
  },
  emptyHeading: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.h2,
    color: colors.terracotta,
    textAlign: 'center',
    lineHeight: fontSizes.h2 * 1.3,
  },
  emptySubtext: {
    fontFamily: fonts.accent,
    fontSize: fontSizes.body,
    color: colors.sage,
    textAlign: 'center',
    lineHeight: fontSizes.body * 1.6,
  },

  // Populated list
  listContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xl,
  },
  columnWrapper: {
    gap: spacing.itemGap,
  },
  cardWrapper: {
    flex: 1,
  },
  screenTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.h2,
    color: colors.terracotta,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    textAlign: 'center',
  },
});
