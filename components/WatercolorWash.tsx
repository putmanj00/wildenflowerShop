import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../constants/theme';

interface WatercolorWashProps {
  variant?: 'dustyRose' | 'lavender' | 'sage' | 'gold';
  children?: React.ReactNode;
  style?: ViewStyle;
}

export default function WatercolorWash({
  variant = 'dustyRose',
  children,
  style,
}: WatercolorWashProps) {
  return (
    <View style={[styles.base, styles[variant], style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    padding: 12,
  },
  dustyRose: {
    backgroundColor: colors.roseLight,
  },
  lavender: {
    backgroundColor: colors.lavenderLight,
  },
  sage: {
    backgroundColor: colors.sageLight,
  },
  gold: {
    backgroundColor: colors.goldLight,
  },
});
