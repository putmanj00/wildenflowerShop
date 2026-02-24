import React from 'react';
import { View, StyleSheet, Image, useWindowDimensions } from 'react-native';
import { colors } from '../constants/theme';

interface BotanicalHeaderProps {
  variant?: 'large' | 'small' | 'faq' | 'blog';
}

const HEADER_ASSETS: Record<string, ReturnType<typeof require>> = {
  large: require('../assets/images/headers/botanical-header-large.png'),
  small: require('../assets/images/headers/botanical-header-small.png'),
  faq: require('../assets/images/headers/botanical-header-faq.png'),
  blog: require('../assets/images/headers/botanical-header-blog.png'),
};

const ASPECT_RATIOS: Record<string, number> = {
  large: 1408 / 768, // ~1.83
  small: 1170 / 360, // 3.25
  faq: 1170 / 400,   // 2.925
  blog: 1170 / 480,  // 2.4375
};

export default function BotanicalHeader({ variant = 'large' }: BotanicalHeaderProps) {
  const { width: windowWidth } = useWindowDimensions();

  // The image scales to fill its container which is max 800px wide.
  const containerWidth = Math.min(windowWidth, 800);
  const ratio = ASPECT_RATIOS[variant] || ASPECT_RATIOS.large;
  const calculatedHeight = containerWidth / ratio;

  return (
    <View style={[styles.container, { height: calculatedHeight }]}>
      <Image
        source={HEADER_ASSETS[variant]}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.parchmentDark,
    overflow: 'hidden',
    alignSelf: 'center',
    maxWidth: 800,
  },
});
