import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';
import { colors, fonts, fontSizes, spacing } from '../constants/theme';
import { Category } from '../types';

interface CategoryChipProps {
  category: Category;
  onPress: () => void;
  isActive?: boolean;
}

const CATEGORY_ICONS: Record<string, ReturnType<typeof require>> = {
  mushroom: require('../assets/images/icons/categories/icon-mushroom.png'),
  sunburst: require('../assets/images/icons/categories/icon-sunburst.png'),
  vines: require('../assets/images/icons/categories/icon-vines-circle.png'),
  'vines-circle': require('../assets/images/icons/categories/icon-vines-circle.png'),
  seedling: require('../assets/images/icons/categories/icon-seedling.png'),
  fern: require('../assets/images/icons/categories/icon-fern.png'),
  crystal: require('../assets/images/icons/categories/icon-crystal.png'),
  wildflower: require('../assets/images/icons/categories/icon-wildflower.png'),
  vine: require('../assets/images/icons/categories/icon-vine.png'),
};

export default function CategoryChip({ category, onPress, isActive = false }: CategoryChipProps) {
  const iconSource = CATEGORY_ICONS[category.icon] || CATEGORY_ICONS['seedling'];

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.circle, isActive && styles.circleActive]}>
        {iconSource ? (
          <Image source={iconSource} style={styles.icon} resizeMode="contain" />
        ) : (
          <Text style={styles.iconPlaceholder}>{category.icon[0].toUpperCase()}</Text>
        )}
      </View>
      <Text style={[styles.label, isActive && styles.labelActive]} numberOfLines={2}>
        {category.label}
      </Text>
    </TouchableOpacity>
  );
}

const ICON_SIZE = spacing.categoryIconSize * 0.62;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 80,
  },
  circle: {
    width: spacing.categoryIconSize, // 72px
    height: spacing.categoryIconSize,
    borderRadius: spacing.categoryIconSize / 2,
    backgroundColor: colors.parchment,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  circleActive: {
    borderColor: colors.terracotta,
    backgroundColor: colors.roseLight,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
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
