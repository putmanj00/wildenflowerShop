import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { colors, fonts, fontSizes, spacing, radii } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ASSET_BACK_ARROW = require('../../assets/images/icons/ui/vine-arrow-left.png');

interface TopNavProps {
    title?: string;
}

export default function TopNav({ title }: TopNavProps) {
    const router = useRouter();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top || spacing.md }]}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                    if (navigation.canGoBack()) {
                        navigation.goBack();
                    } else {
                        router.back();
                    }
                }}
                accessibilityLabel="Go back"
                accessibilityRole="button"
            >
                <Image source={ASSET_BACK_ARROW} style={styles.backIcon} resizeMode="contain" />
            </TouchableOpacity>

            {title ? (
                <Text style={styles.title} numberOfLines={1}>
                    {title}
                </Text>
            ) : (
                <View style={styles.spacer} />
            )}

            {/* Invisible spacer to balance the layout if title exists */}
            <View style={styles.rightSpacer} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.sm,
        paddingBottom: spacing.sm,
        backgroundColor: colors.parchment,
        zIndex: 10,
    },
    backButton: {
        padding: spacing.sm,
        borderRadius: radii.round,
    },
    backIcon: {
        width: 32,
        height: 32,
    },
    title: {
        fontFamily: fonts.heading,
        fontSize: fontSizes.h3,
        color: colors.terracotta,
        flex: 1,
        textAlign: 'center',
    },
    spacer: {
        flex: 1,
    },
    rightSpacer: {
        width: 48, // Balances the 32px icon + 8px padding * 2
    },
});
