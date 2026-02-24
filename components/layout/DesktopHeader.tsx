import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { colors, fonts, fontSizes, spacing } from '../../constants/theme';
import { useCart } from '../../context/CartContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DesktopHeader() {
    const router = useRouter();
    const pathname = usePathname();
    const { cartCount } = useCart();
    const insets = useSafeAreaInsets();

    // Prevent rendering on native mobile platforms entirely for safety
    if (Platform.OS !== 'web') return null;

    const isActive = (route: string) => {
        if (route === '/' && pathname === '/') return true;
        if (route !== '/' && pathname.startsWith(route)) return true;
        return false;
    };

    const NavLink = ({ title, route }: { title: string, route: string }) => (
        <Pressable
            onPress={() => router.push(route)}
            style={({ hovered }: any) => [
                styles.navLink,
                isActive(route) && styles.navLinkActive,
                hovered && !isActive(route) && styles.navLinkHovered
            ] as any}
        >
            <Text style={[
                styles.navLinkText,
                isActive(route) && styles.navLinkTextActive
            ]}>
                {title}
            </Text>
        </Pressable>
    );

    return (
        <View style={[styles.container, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
            <View style={styles.content}>
                {/* Brand / Logo Area */}
                <Pressable onPress={() => router.push('/')} style={styles.brandContainer}>
                    <Text style={styles.brandText}>Wildenflower</Text>
                </Pressable>

                {/* Navigation Links */}
                <View style={styles.navLinksContainer}>
                    <NavLink title="Home" route="/" />
                    <NavLink title="Shop" route="/browse" />
                    <NavLink title="Favorites" route="/favorites" />
                    <NavLink title="Menu" route="/menu" />
                </View>

                {/* Cart Action Area */}
                <Pressable
                    onPress={() => router.push('/cart')}
                    style={({ hovered }: any) => [
                        styles.cartButton,
                        hovered && styles.cartButtonHovered
                    ] as any}
                >
                    <Text style={styles.cartButtonText}>Cart</Text>
                    {cartCount > 0 && (
                        <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>{cartCount}</Text>
                        </View>
                    )}
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: colors.parchment,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        zIndex: 50, // Ensure it sits above scroll content
        // subtle shadow on web
        boxShadow: '0px 2px 8px rgba(59, 47, 47, 0.05)',
    } as any, // as any handles the web-only boxShadow type
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 1200,
        alignSelf: 'center',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
    },
    brandContainer: {
        paddingVertical: spacing.xs,
    },
    brandText: {
        fontFamily: fonts.heading,
        fontSize: fontSizes.h2,
        color: colors.terracotta,
    },
    navLinksContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xl,
    },
    navLink: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xs,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
        transition: 'all 0.2s ease-in-out',
    } as any,
    navLinkActive: {
        borderBottomColor: colors.terracotta,
    },
    navLinkHovered: {
        borderBottomColor: colors.earthLight,
    },
    navLinkText: {
        fontFamily: fonts.body,
        fontSize: fontSizes.body,
        color: colors.earth,
    },
    navLinkTextActive: {
        fontFamily: fonts.bodyBold,
        color: colors.terracotta,
    },
    cartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: 20,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border,
        transition: 'all 0.2s ease',
    } as any,
    cartButtonHovered: {
        backgroundColor: colors.sage + '11',
        borderColor: colors.sage,
    },
    cartButtonText: {
        fontFamily: fonts.body,
        fontSize: fontSizes.body,
        color: colors.earth,
        marginRight: spacing.xs,
    },
    cartBadge: {
        backgroundColor: colors.terracotta,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    cartBadgeText: {
        fontFamily: fonts.bodyBold,
        fontSize: 10,
        color: colors.parchment,
    }
});
