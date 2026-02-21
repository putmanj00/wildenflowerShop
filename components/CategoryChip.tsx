import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { colors, fonts, fontSizes, spacing } from '../constants/theme';
import { Category } from '../types';

interface CategoryChipProps {
  category: Category;
  onPress: () => void;
  isActive?: boolean;
}

// Explicit require() calls so Metro can statically bundle each asset.
const CATEGORY_ICONS: Record<string, ReturnType<typeof require>> = {
  mushroom: require('../assets/images/icons/categories/icon-mushroom.png'),
  vine: require('../assets/images/icons/categories/icon-vine.png'),
  crystal: require('../assets/images/icons/categories/icon-crystal.png'),
  wildflower: require('../assets/images/icons/categories/icon-wildflower.png'),
  fern: require('../assets/images/icons/categories/icon-fern.png'),
  sunburst: require('../assets/images/icons/categories/icon-sunburst.png'),
  'vines-circle': require('../assets/images/icons/categories/icon-vines-circle.png'),
  seedling: require('../assets/images/icons/categories/icon-seedling.png'),
};

export default function CategoryChip({ category, onPress, isActive = false }: CategoryChipProps) {
  const iconSource = CATEGORY_ICONS[category.icon];

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.circle, isActive && styles.circleActive]}>
        {iconSource ? (
          <Image source={iconSource} style={styles.icon} resizeMode="contain" />
        ) : (
          <Text style={styles.iconFallback}>{category.icon[0].toUpperCase()}</Text>
        )}
      </View>
      <Text style={[styles.label, isActive && styles.labelActive]} numberOfLines={2}>
        {category.label}
      </Text>
    </TouchableOpacity>
  );
}

const ICON_SIZE = spacing.categoryIconSize * 0.62; // ~45px — comfortable within the 72px circle

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
    backgroundColor: colors.roseLight,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  iconFallback: {
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
