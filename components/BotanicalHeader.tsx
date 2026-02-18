import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../constants/theme';

interface BotanicalHeaderProps {
  variant?: 'large' | 'small';
}

export default function BotanicalHeader({ variant = 'large' }: BotanicalHeaderProps) {
  const height = variant === 'large' ? spacing.headerHeight : spacing.headerHeightSmall;
  return (
    <View style={[styles.container, { height }]}>
      {/* ASSET: botanical-header-large.png — Dense mushroom/fern/wildflower panoramic illustration */}
      {/* Replace with: <Image source={require('../assets/images/headers/botanical-header-large.png')} style={{ width: '100%', height }} resizeMode="cover" /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.parchmentDark,
    overflow: 'hidden',
  },
});
