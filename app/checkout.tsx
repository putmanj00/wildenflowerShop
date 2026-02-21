/**
 * Wildenflower — Checkout Screen
 * See CLAUDE.md for full spec.
 * Reference mockup: wildenflowerCheckout.png
 */
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { spacing, fontSizes, fonts, colors, radii, shadows } from '../constants/theme';
import ScrollScreen from '../components/layout/ScrollScreen';
import TopNav from '../components/layout/TopNav';

const ASSET_GARLAND = require('../assets/images/checkout/checkout-garland.png');
const ASSET_FERN_BORDER = require('../assets/images/checkout/fern-border-vertical.png');
const ASSET_PARCEL = require('../assets/images/checkout/parcel-illustration.png');

export default function CheckoutScreen() {
  const router = useRouter();

  return (
    <ScrollScreen>
      <TopNav />
      <View style={styles.header}>
        <Image source={ASSET_GARLAND} style={styles.garlandImage} resizeMode="contain" />
        <Text style={styles.title}>Checkout</Text>
      </View>

      <View style={styles.container}>
        {/* Progress Vine Placeholder */}
        <View style={styles.progressPlaceholder}>
          <Text style={styles.progressText}>[Progress Vine: mushroom → fern → flower → sun]</Text>
        </View>

        {/* Form Inputs Placeholder */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Delivery</Text>
          <View style={styles.inputBorder}>
            <TextInput style={styles.input} placeholder="Email" placeholderTextColor={colors.sage} />
          </View>
          <View style={styles.inputBorder}>
            <TextInput style={styles.input} placeholder="Shipping Address" placeholderTextColor={colors.sage} />
          </View>
        </View>

        {/* Order Summary with Fern Border */}
        <View style={styles.summaryCard}>
          <Image source={ASSET_FERN_BORDER} style={styles.fernBorder} resizeMode="cover" />
          <View style={styles.summaryContent}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Items (mock)</Text>
              <Text style={styles.summaryText}>$0.00</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Shipping</Text>
              <Text style={styles.summaryText}>$0.00</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalText}>Total</Text>
              <Text style={styles.totalText}>$0.00</Text>
            </View>
          </View>
        </View>

        {/* Parcel Illustration */}
        <View style={styles.parcelContainer}>
          <Image source={ASSET_PARCEL} style={styles.parcelImage} resizeMode="contain" />
          <Text style={styles.parcelCaption}>You're about to make someone's day.</Text>
        </View>

        {/* Checkout Button */}
        <TouchableOpacity style={styles.checkoutButton} onPress={() => { }}>
          <Text style={styles.checkoutButtonText}>Confirm Purchase</Text>
          <Text style={styles.wreathPlaceholder}>[ botanical wreath ]</Text>
        </TouchableOpacity>
      </View>
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  garlandImage: {
    width: '100%',
    height: 120, // From guide
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.h1,
    color: colors.terracotta,
  },
  container: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xxl,
  },
  progressPlaceholder: {
    padding: spacing.md,
    backgroundColor: colors.parchmentLight,
    borderRadius: radii.md,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  progressText: {
    fontFamily: fonts.accent,
    color: colors.sage,
  },
  formSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.h3,
    color: colors.forest,
    marginBottom: spacing.md,
  },
  inputBorder: {
    borderWidth: 1,
    borderColor: colors.sage,
    borderRadius: radii.sm,
    marginBottom: spacing.md,
    backgroundColor: colors.parchmentLight,
  },
  input: {
    fontFamily: fonts.body,
    fontSize: fontSizes.body,
    color: colors.earth,
    padding: spacing.md,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: colors.parchmentLight,
    borderRadius: radii.md,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  fernBorder: {
    width: 36, // From guide
    height: '100%',
  },
  summaryContent: {
    flex: 1,
    padding: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryText: {
    fontFamily: fonts.body,
    color: colors.earth,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
  },
  totalText: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.h3,
    color: colors.terracotta,
  },
  parcelContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  parcelImage: {
    width: 240, // From guide
    height: 240,
  },
  parcelCaption: {
    fontFamily: fonts.accent,
    fontSize: fontSizes.body,
    fontStyle: 'italic',
    color: colors.sage,
    marginTop: spacing.md,
  },
  checkoutButton: {
    backgroundColor: colors.gold,
    borderRadius: radii.round,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  checkoutButtonText: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.button,
    color: colors.earth,
  },
  wreathPlaceholder: {
    fontFamily: fonts.accent,
    fontSize: fontSizes.bodySmall,
    color: colors.earth,
    opacity: 0.6,
    marginTop: spacing.xs,
  },
});
