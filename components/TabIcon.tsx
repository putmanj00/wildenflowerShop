/**
 * Wildenflower — TabIcon
 * ======================
 * Per-route tab bar icon with botanical asset placeholder strategy.
 * Each route has its own active tint color matching its personality.
 *
 * Swap placeholder Views for real assets when illustrations are ready:
 * Replace the inner View placeholder with:
 *   <Image
 *     source={focused ? ACTIVE_ASSETS[route] : INACTIVE_ASSETS[route]}
 *     style={{ width: size, height: size }}
 *     resizeMode="contain"
 *   />
 *
 * NOTE: Do NOT use dynamic require() with template literals.
 * Use the explicit asset lookup objects defined below.
 */

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';
import { TabRoute } from '../types';

// Per-route active tint colors — each tab has its own personality
const ACTIVE_TINTS: Record<TabRoute, string> = {
  index:     colors.terracotta,   // Home — warm terracotta
  browse:    colors.terracotta,   // Browse — warm terracotta
  favorites: colors.dustyRose,    // Favorites — soft rose
  cart:      colors.gold,         // Cart — golden
  profile:   colors.sage,         // Profile — earthy sage
};

// When real assets are ready, wire up explicit require() calls here:
// const ACTIVE_ASSETS: Record<TabRoute, ReturnType<typeof require>> = {
//   index:     require('../assets/images/icons/tabs/tab-home-active.png'),
//   browse:    require('../assets/images/icons/tabs/tab-browse-active.png'),
//   favorites: require('../assets/images/icons/tabs/tab-favorites-active.png'),
//   cart:      require('../assets/images/icons/tabs/tab-cart-active.png'),
//   profile:   require('../assets/images/icons/tabs/tab-profile-active.png'),
// };
// const INACTIVE_ASSETS: Record<TabRoute, ReturnType<typeof require>> = {
//   index:     require('../assets/images/icons/tabs/tab-home.png'),
//   browse:    require('../assets/images/icons/tabs/tab-browse.png'),
//   favorites: require('../assets/images/icons/tabs/tab-favorites.png'),
//   cart:      require('../assets/images/icons/tabs/tab-cart.png'),
//   profile:   require('../assets/images/icons/tabs/tab-profile.png'),
// };

interface TabIconProps {
  route: TabRoute;
  focused: boolean;
  size: number;
}

function TabIcon({ route, focused, size }: TabIconProps) {
  const iconColor = focused
    ? ACTIVE_TINTS[route]
    : 'rgba(59, 47, 47, 0.4)'; // colors.earth at 40% opacity

  const placeholderSize = size * 0.75;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* ASSET: tab-{route}.png / tab-{route}-active.png
          Dimensions: 72×72px @3x source (renders at 24pt)
          Replace this View with the Image element from the comment above. */}
      <View
        style={[
          styles.placeholder,
          {
            width: placeholderSize,
            height: placeholderSize,
            backgroundColor: iconColor,
            borderRadius: placeholderSize / 4,
          },
        ]}
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
  placeholder: {
    // size and color applied dynamically above
  },
});
