import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, fonts, fontSizes, spacing, radii, shadows } from '../constants/theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'gold' | 'terracotta';
}

export default function PrimaryButton({
  label,
  onPress,
  variant = 'gold',
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.base, styles[variant]]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[styles.label, variant === 'gold' ? styles.labelGold : styles.labelTerracotta]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: spacing.buttonHeight,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    ...shadows.md,
  },
  gold: {
    backgroundColor: colors.gold,
  },
  terracotta: {
    backgroundColor: colors.terracotta,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSizes.button,
  },
  labelGold: {
    color: colors.earth,
  },
  labelTerracotta: {
    color: colors.parchment,
  },
});
