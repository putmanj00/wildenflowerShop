import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../constants/theme';

interface BotanicalDividerProps {
  variant?: 'fern-mushroom' | 'wildflower' | 'vine-trail' | 'mushroom-cluster' | 'fern-spiral';
}

export default function BotanicalDivider({ variant = 'fern-mushroom' }: BotanicalDividerProps) {
  return (
    <View style={styles.container}>
      {/* ASSET: divider-{variant}.png — Botanical horizontal divider illustration */}
      {/* Replace with: <Image source={require(`../assets/images/dividers/divider-${variant}.png`)} style={styles.image} resizeMode="contain" /> */}
      <View style={styles.line} />
      <View style={styles.centerDot} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 32,
    marginVertical: spacing.dividerMargin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.divider,
  },
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.parchmentDark,
    borderWidth: 1,
    borderColor: colors.divider,
  },
});
