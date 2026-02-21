import React from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { spacing } from '../constants/theme';

const HEADER_ASSETS = {
  large: require('../assets/images/headers/botanical-header-large.png'),
  small: require('../assets/images/headers/botanical-header-small.png'),
  faq: require('../assets/images/headers/botanical-header-faq.png'),
  blog: require('../assets/images/headers/botanical-header-blog.png'),
};

interface BotanicalHeaderProps {
  variant?: 'large' | 'small' | 'faq' | 'blog';
}

export default function BotanicalHeader({ variant = 'large' }: BotanicalHeaderProps) {
  let height = spacing.headerHeight;
  if (variant === 'small' || variant === 'faq') {
    height = spacing.headerHeightSmall;
  }
  return (
    <View style={[styles.container, { height }]}>
      <Image
        source={HEADER_ASSETS[variant]}
        style={{ width: '100%', height }}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
});
