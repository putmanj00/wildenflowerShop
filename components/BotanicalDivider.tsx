import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { spacing } from '../constants/theme';

interface BotanicalDividerProps {
  variant?: 'fern-mushroom' | 'wildflower' | 'vine-trail' | 'mushroom-cluster' | 'fern-spiral';
}

const DIVIDER_ASSETS: Record<string, ReturnType<typeof require>> = {
  'fern-mushroom': require('../assets/images/dividers/divider-fern-mushroom.png'),
  'wildflower': require('../assets/images/dividers/divider-wildflower.png'),
  'vine-trail': require('../assets/images/dividers/divider-vine-trail.png'),
  'mushroom-cluster': require('../assets/images/dividers/divider-mushroom-cluster.png'),
  'fern-spiral': require('../assets/images/dividers/divider-fern-spiral.png'),
};

export default function BotanicalDivider({ variant = 'fern-mushroom' }: BotanicalDividerProps) {
  return (
    <View style={styles.container}>
      <Image
        source={DIVIDER_ASSETS[variant]}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 32,
    marginVertical: spacing.dividerMargin,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    maxWidth: 800,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
