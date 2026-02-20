/**
 * ScrollScreen — Scrollable layout wrapper for Wildenflower screens.
 *
 * Enforces:
 * - SafeAreaView from react-native-safe-area-context (NOT react-native)
 * - Parchment background on both SafeAreaView and ScrollView
 * - showsVerticalScrollIndicator: false (clean look)
 * - Default bottom padding (spacing.huge = 64) for tab bar clearance
 *
 * Usage:
 *   import ScrollScreen from '../../components/layout/ScrollScreen';
 *   export default function MyScreen() {
 *     return <ScrollScreen><YourContent /></ScrollScreen>;
 *   }
 */
import React from 'react';
import { ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../constants/theme';

interface ScrollScreenProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  refreshControl?: React.ReactElement;
}

export default function ScrollScreen({
  children,
  style,
  contentContainerStyle,
  refreshControl,
}: ScrollScreenProps) {
  return (
    <SafeAreaView style={[styles.safe, style]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.parchment,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.parchment,
  },
  content: {
    paddingBottom: spacing.huge, // 64px — clears tab bar
  },
});
