import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors, fonts, fontSizes, spacing } from '../constants/theme';
import { Category } from '../types';

interface CategoryChipProps {
  category: Category;
  onPress: () => void;
  isActive?: boolean;
}

export default function CategoryChip({ category, onPress, isActive = false }: CategoryChipProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.circle, isActive && styles.circleActive]}>
        {/* ASSET: icon-{category.icon}.png — Circular botanical category icon */}
        {/* Replace with: <Image source={require(`../assets/images/icons/categories/icon-${category.icon}.png`)} style={styles.icon} /> */}
        <Text style={styles.iconPlaceholder}>{category.icon[0].toUpperCase()}</Text>
      </View>
      <Text style={[styles.label, isActive && styles.labelActive]} numberOfLines={2}>
        {category.label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  circle: {
    width: spacing.categoryIconSize,
    height: spacing.categoryIconSize,
    borderRadius: spacing.categoryIconSize / 2,
    backgroundColor: colors.parchmentDark,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleActive: {
    borderColor: colors.terracotta,
  },
  iconPlaceholder: {
    fontFamily: fonts.bodyBold,
    fontSize: 20,
    color: colors.inkBrown,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: fontSizes.tab,
    color: colors.earth,
    textAlign: 'center',
    maxWidth: 80,
    marginTop: spacing.xs,
  },
  labelActive: {
    color: colors.terracotta,
  },
});
