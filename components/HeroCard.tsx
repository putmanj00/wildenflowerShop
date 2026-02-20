import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, fontSizes, spacing, radii, shadows, copy } from '../constants/theme';
import PrimaryButton from './PrimaryButton';

interface HeroCardProps {
  tagline?: string;
  onExplorePress?: () => void;
}

export default function HeroCard({ tagline = copy.tagline, onExplorePress }: HeroCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.textCol}>
        <Text style={styles.tagline}>{tagline}</Text>
        {onExplorePress && (
          <View style={styles.exploreButton}>
            <PrimaryButton
              label="Wander the Shop"
              onPress={onExplorePress}
              variant="gold"
            />
          </View>
        )}
      </View>
      <View style={styles.imageCol}>
        {/* ASSET: featured product hero image */}
        {/* Replace with: <Image source={...} style={styles.heroImage} resizeMode="cover" /> */}
        <View style={styles.imagePlaceholder} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.forest,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.inkBrown,
    marginHorizontal: spacing.screenPadding,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    minHeight: 140,
    ...shadows.lg,
  },
  textCol: {
    flex: 55,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  tagline: {
    fontFamily: fonts.accent,
    fontSize: fontSizes.h2,
    color: colors.parchment,
    lineHeight: fontSizes.h2 * 1.4,
  },
  exploreButton: {
    marginTop: spacing.lg,
  },
  imageCol: {
    flex: 45,
    padding: spacing.md,
    justifyContent: 'center',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: colors.parchmentDark,
    borderRadius: radii.image,
    borderWidth: 1,
    borderColor: colors.gold,
    minHeight: 100,
  },
});
