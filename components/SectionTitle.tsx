import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts, fontSizes, spacing } from '../constants/theme';

interface SectionTitleProps {
  title: string;
  action?: { label: string; onPress: () => void };
  centered?: boolean;
}

export default function SectionTitle({ title, action, centered }: SectionTitleProps) {
  return (
    <View style={[styles.container, centered && styles.containerCentered]}>
      <Text style={styles.title}>{title}</Text>
      {action && (
        <TouchableOpacity
          onPress={action.onPress}
          accessibilityRole="button"
          accessibilityLabel={action.label}
        >
          <Text style={styles.action}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.screenPadding,
    marginBottom: spacing.lg,
  },
  containerCentered: {
    justifyContent: 'center',
    marginHorizontal: 0,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.h2,
    color: colors.terracotta,
  },
  action: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySmall,
    color: colors.sage,
  },
});
