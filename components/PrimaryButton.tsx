import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Image } from 'react-native';
import { colors, fonts, fontSizes, spacing, radii, shadows } from '../constants/theme';

const BUTTON_WREATH = require('../assets/images/icons/ui/button-wreath.png');

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'gold' | 'terracotta' | 'wreath';
}

export default function PrimaryButton({
  label,
  onPress,
  variant = 'gold',
}: PrimaryButtonProps) {
  const isWreath = variant === 'wreath';

  return (
    <TouchableOpacity
      style={[
        styles.base,
        isWreath ? styles.wreath : styles[variant],
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {isWreath && (
        <Image
          source={BUTTON_WREATH}
          style={styles.wreathImage}
          resizeMode="contain"
        />
      )}
      <Text
        style={[
          styles.label,
          isWreath ? styles.labelWreath : (variant === 'gold' ? styles.labelGold : styles.labelTerracotta),
        ]}
      >
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
    overflow: 'hidden',
  },
  gold: {
    backgroundColor: colors.gold,
  },
  terracotta: {
    backgroundColor: colors.terracotta,
  },
  wreath: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    height: 64,
  },
  wreathImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSizes.button,
    zIndex: 1,
  },
  labelGold: {
    color: colors.earth,
  },
  labelTerracotta: {
    color: colors.parchment,
  },
  labelWreath: {
    color: colors.parchment,
  },
});

