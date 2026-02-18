import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts, fontSizes, spacing } from '../constants/theme';

interface SectionTitleProps {
  title: string;
  action?: { label: string; onPress: () => void };
}

export default function SectionTitle({ title, action }: SectionTitleProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={action.onPress}>
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
