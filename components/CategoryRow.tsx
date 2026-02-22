import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { spacing } from '../constants/theme';
import { Category } from '../types';
import CategoryChip from './CategoryChip';

interface CategoryRowProps {
  categories: Category[];
  activeCategory?: string | null;
  onCategoryPress: (id: string) => void;
}

export default function CategoryRow({ categories, activeCategory, onCategoryPress }: CategoryRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={true}
      contentContainerStyle={styles.content}
    >
      {categories.map((category, index) => (
        <View key={category.id} style={index < categories.length - 1 ? styles.chipMargin : undefined}>
          <CategoryChip
            category={category}
            onPress={() => onCategoryPress(category.id)}
            isActive={category.id === activeCategory}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
  },
  chipMargin: {
    marginRight: spacing.xl,
  },
});
