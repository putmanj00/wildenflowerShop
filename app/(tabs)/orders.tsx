import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '../../components/layout/Screen';
import BotanicalHeader from '../../components/BotanicalHeader';
import BotanicalDivider from '../../components/BotanicalDivider';
import { colors, fonts, fontSizes, spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { ShopifyOrder, ShopifyOrderLineItem } from '../../types/shopify';
import TopNav from '../../components/layout/TopNav';

const VINE_ARROW = require('../../assets/images/icons/ui/vine-arrow-right.png');

const OrderItem = ({ item }: { item: ShopifyOrderLineItem }) => (
    <View style={styles.lineItem}>
        <View style={styles.itemImageContainer}>
            {item.variant?.image?.url ? (
                <Image
                    source={{ uri: item.variant.image.url }}
                    style={styles.itemImage}
                    resizeMode="cover"
                />
            ) : (
                <View style={[styles.itemImage, styles.imagePlaceholder]} />
            )}
            <View style={styles.quantityBadge}>
                <Text style={styles.quantityText}>{item.quantity}</Text>
            </View>
        </View>
        <View style={styles.itemInfo}>
            <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
        </View>
    </View>
);

const OrderCard = ({ order }: { order: ShopifyOrder }) => {
    const date = new Date(order.processedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <View>
                    <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
                    <Text style={styles.orderDate}>{date}</Text>
                </View>
                <Text style={styles.orderTotal}>
                    {parseFloat(order.totalPrice.amount).toLocaleString(undefined, {
                        style: 'currency',
                        currency: order.totalPrice.currencyCode,
                    })}
                </Text>
            </View>

            <View style={styles.statusRow}>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusLabel}>Payment:</Text>
                    <Text style={styles.statusValue}>{order.financialStatus}</Text>
                </View>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusLabel}>Shipping:</Text>
                    <Text style={styles.statusValue}>{order.fulfillmentStatus}</Text>
                </View>
            </View>

            <View style={styles.itemsContainer}>
                {order.lineItems.nodes.map((item, index) => (
                    <OrderItem key={`${order.id}-item-${index}`} item={item} />
                ))}
            </View>
        </View>
    );
};

export default function OrdersScreen() {
    const router = useRouter();
    const { customer, isLoading } = useAuth();

    if (isLoading) {
        return (
            <Screen>
                <BotanicalHeader variant="small" />
                <View style={styles.centered}>
                    <Text style={styles.emptyText}>Gathering your history...</Text>
                </View>
            </Screen>
        );
    }

    const orders = customer?.orders?.nodes || [];

    return (
        <Screen>
            <TopNav />
            <BotanicalHeader variant="small" />

            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Image source={VINE_ARROW} style={styles.backIcon} />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Your Collection History</Text>
            </View>

            <BotanicalDivider variant="fern-spiral" />

            {orders.length === 0 ? (
                <View style={styles.centered}>
                    <Text style={styles.emptyTitle}>No Orders Yet</Text>
                    <Text style={styles.emptyText}>Your curated collections will appear here once you've made a purchase.</Text>
                    <TouchableOpacity
                        style={styles.shopButton}
                        onPress={() => router.push('/browse')}
                    >
                        <Text style={styles.shopButtonText}>Explore the Shop</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <OrderCard order={item} />}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </Screen>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: spacing.screenPadding,
        paddingTop: spacing.lg,
        paddingBottom: spacing.sm,
    },
    title: {
        fontFamily: fonts.heading,
        fontSize: fontSizes.h2,
        color: colors.earth,
        marginTop: spacing.sm,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backIcon: {
        width: 20,
        height: 20,
        tintColor: colors.sage,
        transform: [{ rotate: '180deg' }],
        marginRight: 4,
    },
    backText: {
        fontFamily: fonts.body,
        fontSize: fontSizes.body,
        color: colors.sage,
    },
    listContent: {
        paddingHorizontal: spacing.screenPadding,
        paddingTop: spacing.md,
        paddingBottom: spacing.xxl,
    },
    orderCard: {
        backgroundColor: colors.parchment,
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        ...Platform.select({
            web: { boxShadow: '0px 2px 8px rgba(59, 47, 47, 0.05)' },
            default: { elevation: 2, shadowColor: colors.earth, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
        }),
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingBottom: spacing.sm,
        marginBottom: spacing.md,
    },
    orderNumber: {
        fontFamily: fonts.bodyBold,
        fontSize: fontSizes.body,
        color: colors.earth,
    },
    orderDate: {
        fontFamily: fonts.body,
        fontSize: fontSizes.tab,
        color: colors.sage,
        marginTop: 2,
    },
    orderTotal: {
        fontFamily: fonts.accent,
        fontSize: fontSizes.bodyLarge,
        color: colors.terracotta,
    },
    statusRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statusLabel: {
        fontFamily: fonts.body,
        fontSize: fontSizes.tag,
        color: colors.sage,
    },
    statusValue: {
        fontFamily: fonts.bodyBold,
        fontSize: fontSizes.tag,
        color: colors.earth,
        textTransform: 'capitalize',
    },
    itemsContainer: {
        gap: spacing.sm,
    },
    lineItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    itemImageContainer: {
        width: 44,
        height: 44,
        borderRadius: 8,
        overflow: 'hidden',
    },
    itemImage: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        backgroundColor: colors.border,
    },
    quantityBadge: {
        position: 'absolute',
        right: -4,
        top: -4,
        backgroundColor: colors.sage,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.parchment,
    },
    quantityText: {
        color: colors.parchment,
        fontSize: 10,
        fontFamily: fonts.bodyBold,
    },
    itemInfo: {
        flex: 1,
    },
    itemTitle: {
        fontFamily: fonts.body,
        fontSize: fontSizes.body,
        color: colors.earth,
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    emptyTitle: {
        fontFamily: fonts.heading,
        fontSize: fontSizes.h3,
        color: colors.earth,
        marginBottom: spacing.sm,
    },
    emptyText: {
        fontFamily: fonts.body,
        fontSize: fontSizes.body,
        color: colors.sage,
        textAlign: 'center',
        lineHeight: 22,
    },
    shopButton: {
        marginTop: spacing.xl,
        backgroundColor: colors.gold,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: 25,
    },
    shopButtonText: {
        fontFamily: fonts.bodyBold,
        color: colors.parchment,
        fontSize: fontSizes.body,
    }
});
