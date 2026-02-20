/**
 * Wildenflower — Tab Layout
 * ==========================
 * Bottom tab bar with botanical-styled icons and brand-consistent styling.
 *
 * Tab icons (when botanical assets arrive):
 * - Home:      small mushroom with wildflower
 * - Browse:    magnifying glass with fern leaf
 * - Favorites: heart formed by vine tendrils
 * - Cart:      woven basket with fern
 * - Profile:   circular vine wreath
 *
 * See components/TabIcon.tsx for asset swap instructions.
 */

import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { colors, fonts, fontSizes, spacing, copy } from '../../constants/theme';
import { useCart } from '../../context/CartContext';
import TabIcon from '../../components/TabIcon';

export default function TabLayout() {
  const { cartCount } = useCart();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors.parchment,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: spacing.tabBarHeight,   // 80px
          paddingTop: spacing.sm,         // 8px
          paddingBottom: Platform.OS === 'web' ? spacing.sm : spacing.xl, // 24px clearance for iOS, tighter on web
          ...Platform.select({
            web: {
              boxShadow: '0px -2px 8px rgba(59, 47, 47, 0.08)',
            },
            default: {
              shadowColor: colors.earth,
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 8,
            },
          }),
        },
        tabBarActiveTintColor: colors.terracotta,
        tabBarInactiveTintColor: colors.earthLight,
        tabBarLabelStyle: {
          fontFamily: fonts.body,
          fontSize: fontSizes.tab,
          marginTop: spacing.xs,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: copy.tabHome,
          tabBarIcon: ({ focused, size }) => (
            <TabIcon route="index" focused={focused} size={size} />
          ),
          tabBarAccessibilityLabel: 'Home tab',
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: copy.tabBrowse,
          tabBarIcon: ({ focused, size }) => (
            <TabIcon route="browse" focused={focused} size={size} />
          ),
          tabBarAccessibilityLabel: 'Browse tab — discover products',
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: copy.tabFavorites,
          tabBarIcon: ({ focused, size }) => (
            <TabIcon route="favorites" focused={focused} size={size} />
          ),
          tabBarAccessibilityLabel: 'Favorites tab — your saved items',
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: copy.tabCart,
          tabBarIcon: ({ focused, size }) => (
            <TabIcon route="cart" focused={focused} size={size} />
          ),
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.terracotta,
            color: colors.parchment,
            fontFamily: fonts.bodyBold,
            fontSize: fontSizes.tag,
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            borderWidth: 0,
          },
          tabBarAccessibilityLabel: cartCount > 0
            ? `Cart tab — ${cartCount} item${cartCount === 1 ? '' : 's'}`
            : 'Cart tab — empty',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: copy.tabProfile,
          tabBarIcon: ({ focused, size }) => (
            <TabIcon route="profile" focused={focused} size={size} />
          ),
          tabBarAccessibilityLabel: 'Profile tab',
        }}
      />
    </Tabs>
  );
}
