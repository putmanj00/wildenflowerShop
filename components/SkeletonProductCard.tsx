/**
 * SkeletonProductCard — Loading placeholder for ProductCard
 * =========================================================
 * Renders a parchment-coloured card placeholder matching ProductCard dimensions.
 * Shown in the Home screen ProductGrid while Shopify products are fetching.
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, radii, shadows } from '../constants/theme';

interface SkeletonProductCardProps {
    style?: ViewStyle;
}

export default function SkeletonProductCard({ style }: SkeletonProductCardProps) {
    return (
        <View style={[styles.card, style]}>
            <View style={styles.imageArea} />
            <View style={styles.contentArea}>
                <View style={styles.nameLine} />
                <View style={styles.priceLine} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.parchmentDark,
        borderRadius: radii.card,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.borderLight,
        ...shadows.sm,
    },
    imageArea: {
        height: spacing.productCardImageHeight, // 160px — matches ProductCard
        backgroundColor: colors.border,
    },
    contentArea: {
        padding: spacing.cardPadding,
        gap: spacing.sm,
    },
    nameLine: {
        height: 14,
        width: '75%',
        backgroundColor: colors.border,
        borderRadius: radii.sm,
    },
    priceLine: {
        height: 18,
        width: '40%',
        backgroundColor: colors.borderLight,
        borderRadius: radii.sm,
    },
});
