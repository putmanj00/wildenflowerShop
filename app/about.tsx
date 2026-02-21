/**
 * Wildenflower — About Screen
 * ============================
 * Brand story screen with:
 *   - Cartouche oval frame (decorative Victorian botanical frame)
 *   - Drop cap "A" (botanical illustrated letter)  
 *   - Three brand story paragraphs in warm body text
 *   - Fallen log divider
 *   - Brand pillars 2×2 grid
 *
 * All assets: assets/images/about/
 */

import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { brandPillars } from '../data/mock-data';
import { colors, fonts, fontSizes, spacing } from '../constants/theme';
import { BrandPillar } from '../types';

// ─── Assets ─────────────────────────────────
const cartoucheFrame = require('../assets/images/about/cartouche-frame.png');
const dropCapA = require('../assets/images/about/drop-cap-A.png');
const fallenLog = require('../assets/images/about/divider-fallen-log.png');

// ─── Brand Pillar Card ───────────────────────

function PillarCard({ pillar }: { pillar: BrandPillar }) {
  return (
    <View style={styles.pillarCard}>
      <Text style={styles.pillarTitle}>{pillar.title}</Text>
      <Text style={styles.pillarDescription}>{pillar.description}</Text>
    </View>
  );
}

// ─── Screen ──────────────────────────────────

export default function AboutScreen() {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Our Story</Text>
      </View>

      {/* Cartouche frame */}
      <View style={styles.cartoucheContainer}>
        <Image
          source={cartoucheFrame}
          style={styles.cartoucheImage}
          resizeMode="contain"
        />
        {/* Oval placeholder — shown through the empty center of the frame */}
        <View style={styles.cartouchePlaceholder}>
          <Text style={styles.cartouchePlaceholderText}>Wildenflower</Text>
        </View>
      </View>

      {/* Brand Story Section */}
      <View style={styles.storySection}>

        {/* Drop cap + opening paragraph */}
        <View style={styles.openingParagraph}>
          <Image
            source={dropCapA}
            style={styles.dropCap}
            resizeMode="contain"
          />
          <Text style={styles.bodyText}>
            t Wildenflower, we believe the most beautiful things are made by hand — slowly, with care, by real people who have spent years learning to listen to their materials. We started with a simple question: what if finding handmade things felt as good as the things themselves?
          </Text>
        </View>

        <Text style={styles.bodyText}>
          Every maker on Wildenflower was personally invited after we'd visited their studio, seen their process, and heard the story behind their work. We look for craft, intention, and heart — not volume or trend. If it's not made by a real person with genuine care, it's not on Wildenflower.
        </Text>

        <Text style={styles.bodyText}>
          This is a marketplace built on relationships — between makers and the people who find their work, between the handmade object and the life it's about to enter. We take that seriously. A piece of pottery, a length of natural-dyed cloth, a hand-stitched journal — these things carry something with them. We want to make sure they find the right hands.
        </Text>
      </View>

      {/* Fallen Log Divider */}
      <Image
        source={fallenLog}
        style={styles.fallenLogDivider}
        resizeMode="cover"
      />

      {/* Brand Pillars */}
      <View style={styles.pillarsSection}>
        <Text style={styles.pillarsTitle}>What We Stand For</Text>
        <View style={styles.pillarsGrid}>
          {brandPillars.map(pillar => (
            <PillarCard key={pillar.id} pillar={pillar} />
          ))}
        </View>
      </View>

      {/* Footer quote */}
      <View style={styles.footer}>
        <Text style={styles.footerQuote}>
          "Made slowly.{'\n'}Found with intention."
        </Text>
      </View>

      <View style={styles.bottomPad} />
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.parchment,
  },
  content: {
    paddingBottom: spacing.xxl,
  },

  // Header
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.h1,
    color: colors.earth,
  },

  // Cartouche
  cartoucheContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  cartoucheImage: {
    width: '85%',
    aspectRatio: 900 / 720,
  },
  cartouchePlaceholder: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  cartouchePlaceholderText: {
    fontFamily: fonts.accent,
    fontSize: fontSizes.h3,
    color: colors.earthLight,
    textAlign: 'center',
  },

  // Story section
  storySection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  openingParagraph: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  dropCap: {
    width: 56,
    height: 56,
    marginTop: 4,
    flexShrink: 0,
  },
  bodyText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.body,
    color: colors.earth,
    lineHeight: fontSizes.body * 1.8,
    marginBottom: spacing.lg,
    flex: 1,
  },

  // Fallen log divider
  fallenLogDivider: {
    width: '100%',
    height: 80,
    marginBottom: spacing.xl,
  },

  // Brand pillars
  pillarsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  pillarsTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.h2,
    color: colors.earth,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  pillarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  pillarCard: {
    width: '47%',
    backgroundColor: colors.parchmentDark,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillarTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.body,
    color: colors.earth,
    marginBottom: spacing.sm,
  },
  pillarDescription: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySmall,
    color: colors.earthLight,
    lineHeight: fontSizes.bodySmall * 1.6,
  },

  // Footer
  footer: {
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  footerQuote: {
    fontFamily: fonts.accent,
    fontSize: fontSizes.bodyLarge,
    color: colors.terracotta,
    textAlign: 'center',
    lineHeight: fontSizes.bodyLarge * 1.5,
  },
  bottomPad: {
    height: spacing.xl,
  },
});
