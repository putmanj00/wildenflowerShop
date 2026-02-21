/**
 * Wildenflower — TabIcon
 * ======================
 * Botanical tab bar icons — real illustrated assets for all 5 tabs.
 * Each route maps to active + inactive PNG illustrations.
 *
 * NOTE: Do NOT use dynamic require() with template literals.
 * Explicit require() calls are required so Metro can bundle the assets.
 */

import React, { memo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { TabRoute } from '../types';

// Botanical tab icon assets — all 10 images (active + inactive) are in assets/images/icons/tabs/
// Note: the file on disk uses "tag-browse*" (not "tab-browse*") — matched explicitly below.
const ACTIVE_ASSETS: Record<TabRoute, ReturnType<typeof require>> = {
  index: require('../assets/images/icons/tabs/tab-home-active.png'),
  browse: require('../assets/images/icons/tabs/tag-browse-active.png'),
  favorites: require('../assets/images/icons/tabs/tab-favorites-active.png'),
  cart: require('../assets/images/icons/tabs/tab-cart-active.png'),
  profile: require('../assets/images/icons/tabs/tab-profile-active.png'),
};

const INACTIVE_ASSETS: Record<TabRoute, ReturnType<typeof require>> = {
  index: require('../assets/images/icons/tabs/tab-home.png'),
  browse: require('../assets/images/icons/tabs/tag-browse.png'),
  favorites: require('../assets/images/icons/tabs/tab-favorites.png'),
  cart: require('../assets/images/icons/tabs/tab-cart.png'),
  profile: require('../assets/images/icons/tabs/tab-profile.png'),
};

interface TabIconProps {
  route: TabRoute;
  focused: boolean;
  size: number;
}

function TabIcon({ route, focused, size }: TabIconProps) {
  const source = focused ? ACTIVE_ASSETS[route] : INACTIVE_ASSETS[route];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={source}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
}

export default memo(TabIcon);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
