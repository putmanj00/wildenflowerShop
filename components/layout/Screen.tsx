/**
 * Screen — Base layout wrapper for all Wildenflower screens.
 *
 * Enforces:
 * - SafeAreaView from react-native-safe-area-context (NOT react-native)
 * - Parchment background (colors.parchment) by default
 *
 * Usage:
 *   import Screen from '../../components/layout/Screen';
 *   export default function MyScreen() {
 *     return <Screen><YourContent /></Screen>;
 *   }
 */
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/theme';

interface ScreenProps {
  children?: React.ReactNode;
  style?: ViewStyle;
}

export default function Screen({ children, style }: ScreenProps) {
  return (
    <SafeAreaView style={[styles.safe, style]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.parchment,
  },
});
