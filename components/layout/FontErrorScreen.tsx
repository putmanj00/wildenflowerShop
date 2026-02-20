/**
 * Wildenflower — FontErrorScreen
 * ================================
 * Displayed when custom fonts fail to load at app startup.
 *
 * IMPORTANT: This component MUST NOT use any font family values from
 * constants/theme's `fonts` token — those font files are exactly what
 * failed to load. System serif fallbacks are used instead.
 *
 * Design: warm Wildenflower voice, parchment background, gold retry button.
 * No urgency, no technical language, no pure white or black.
 */

import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radii } from '../../constants/theme';

interface FontErrorScreenProps {
  onRetry: () => void;
}

/**
 * System serif font stack — used because custom Playfair Display / Lora
 * fonts are unavailable (they're what failed to load).
 */
const systemSerif = Platform.select({
  web: { fontFamily: 'Georgia, "Times New Roman", serif' },
  default: { fontFamily: undefined as string | undefined }, // system default on native
});

export default function FontErrorScreen({ onRetry }: FontErrorScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.primaryMessage}>
          The flowers are still waking up…
        </Text>

        <Text style={styles.secondaryMessage}>
          Something kept our fonts from blooming. Please give us a moment.
        </Text>

        {Platform.OS !== 'web' && (
          <Text style={styles.nativeHint}>
            Try closing and reopening the app if this persists.
          </Text>
        )}

        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Try loading the app again"
        >
          <Text style={styles.retryLabel}>Try again</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.parchment,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  primaryMessage: {
    ...systemSerif,
    fontSize: 22,
    color: colors.terracotta,
    textAlign: 'center',
    lineHeight: 22 * 1.4,
  },
  secondaryMessage: {
    ...systemSerif,
    fontSize: 15,
    color: colors.earth,
    textAlign: 'center',
    lineHeight: 15 * 1.6,
    paddingHorizontal: spacing.md,
  },
  nativeHint: {
    ...systemSerif,
    fontSize: 13,
    color: colors.earthLight,
    textAlign: 'center',
    lineHeight: 13 * 1.6,
    paddingHorizontal: spacing.md,
  },
  retryButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.gold,
    borderRadius: radii.button,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
  },
  retryLabel: {
    ...systemSerif,
    fontSize: 16,
    fontWeight: '600',
    color: colors.earth,
    textAlign: 'center',
  },
});
