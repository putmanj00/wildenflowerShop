import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, fonts, fontSizes, spacing, radii, shadows, copy } from '../constants/theme';
import PrimaryButton from './PrimaryButton';

interface HeroCardProps {
  tagline?: string;
  onExplorePress?: () => void;
}

// The right column of the hero card uses the compact botanical header —
// same illustration family as the top banner, cropped into the card.
const HERO_IMAGE = require('../assets/images/headers/botanical-header-small.png');

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
        <Image
          source={HERO_IMAGE}
          style={styles.heroImage}
          resizeMode="cover"
        />
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
    overflow: 'hidden',
  },
  heroImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
