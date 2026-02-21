/**
 * Wildenflower — Profile Screen
 * Phase 10: Customer Authentication — not yet built.
 * Shows a warm holding screen until auth is implemented.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Screen from '../../components/layout/Screen';
import { colors, fonts, fontSizes, spacing } from '../../constants/theme';

export default function ProfileScreen() {
  return (
    <Screen>
      <View style={styles.container}>
        {/* ASSET: Replace with botanical illustrated avatar placeholder */}
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarInitial}>W</Text>
        </View>

        <Text style={styles.heading}>Your Story{'\n'}Is Just Beginning.</Text>

        <Text style={styles.subtext}>
          Sign in to save your details,{'\n'}track your orders, and connect{'\n'}with the makers you love.
        </Text>

        <Text style={styles.comingSoon}>Coming soon</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenPadding,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.parchmentDark,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarInitial: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.h1,
    color: colors.terracotta,
  },
  heading: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.h2,
    color: colors.terracotta,
    textAlign: 'center',
    lineHeight: fontSizes.h2 * 1.35,
  },
  subtext: {
    fontFamily: fonts.accent,
    fontSize: fontSizes.body,
    color: colors.sage,
    textAlign: 'center',
    lineHeight: fontSizes.body * 1.7,
  },
  comingSoon: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySmall,
    color: colors.border,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
  },
});
