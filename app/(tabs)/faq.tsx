/**
 * Wildenflower — FAQ Screen
 * ==========================
 * Animated accordion FAQ with:
 *   - Category filter chips (All / Getting Started / Shipping / Makers / Returns)
 *   - FaqAccordionItem: Reanimated height expand + fern chevron rotation on open/close
 *   - Alternating parchment/parchmentDark row backgrounds
 *   - faq-contact-border.png framed "Still curious?" section at the bottom
 *
 * Uses react-native-reanimated ~3.16 (already installed).
 */

import React, { useCallback, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { faqItems } from '../../data/mock-data';
import { colors, fonts, fontSizes, spacing } from '../../constants/theme';
import { FAQItem } from '../../types';

import BotanicalHeader from '../../components/BotanicalHeader';
import TopNav from '../../components/layout/TopNav';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

// ─── Assets ─────────────────────────────────
const faqContactBorder = require('../../assets/images/faq/faq-contact-border.png');
const fernExpand = require('../../assets/images/icons/ui/fern-expand.png');
const fernCollapse = require('../../assets/images/icons/ui/fern-collapse.png');

// ─── Category filter config ─────────────────

type FaqCategory = 'all' | 'getting-started' | 'shipping' | 'makers' | 'returns';

const CATEGORY_FILTERS: { key: FaqCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'getting-started', label: 'Getting Started' },
  { key: 'shipping', label: 'Shipping' },
  { key: 'makers', label: 'Makers' },
  { key: 'returns', label: 'Returns' },
];

// ─── Accordion Item ──────────────────────────

const ANIMATION_DURATION = 280;

function FaqAccordionItem({
  item,
  isEven,
}: {
  item: FAQItem;
  isEven: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Reanimated shared values
  const answerHeight = useSharedValue(0);
  const answerOpacity = useSharedValue(0);

  const answerStyle = useAnimatedStyle(() => ({
    height: answerHeight.value,
    opacity: answerOpacity.value,
    overflow: 'hidden',
  }));

  const toggle = useCallback(() => {
    const opening = !isOpen;
    setIsOpen(opening);

    const easing = Easing.out(Easing.cubic);
    if (opening) {
      // We don't know the natural height so animate to a large value and clip
      answerHeight.value = withTiming(400, { duration: ANIMATION_DURATION, easing });
      answerOpacity.value = withTiming(1, { duration: ANIMATION_DURATION, easing });
    } else {
      answerHeight.value = withTiming(0, { duration: ANIMATION_DURATION, easing });
      answerOpacity.value = withTiming(0, { duration: Math.floor(ANIMATION_DURATION * 0.6), easing });
    }
  }, [isOpen, answerHeight, answerOpacity]);

  return (
    <View style={[styles.accordionItem, isEven ? styles.rowEven : styles.rowOdd]}>
      <Pressable
        style={styles.accordionHeader}
        onPress={toggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        accessibilityLabel={item.question}
      >
        <Text style={styles.question}>{item.question}</Text>
        {/* Fern chevron — unfurled when open, curled when closed */}
        <View style={styles.chevron}>
          <Image source={isOpen ? fernCollapse : fernExpand} style={{ width: 24, height: 24, tintColor: colors.earthLight }} resizeMode="contain" />
        </View>
      </Pressable>

      <Animated.View style={answerStyle}>
        <View style={styles.answerInner}>
          <Text style={styles.answerText}>{item.answer}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

// ─── Screen ──────────────────────────────────

export default function FaqScreen() {
  const [activeCategory, setActiveCategory] = useState<FaqCategory>('all');

  const filtered = activeCategory === 'all'
    ? faqItems
    : faqItems.filter(item => item.category === activeCategory);

  return (
    <View style={styles.screen}>
      <TopNav />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <BotanicalHeader variant="small" />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Questions</Text>
          <Text style={styles.headerSubtitle}>
            Everything you might want to know — and a few things you didn't know you needed to.
          </Text>
        </View>

        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          style={styles.filterScroll}
        >
          {CATEGORY_FILTERS.map(({ key, label }) => (
            <Pressable
              key={key}
              style={[styles.filterChip, activeCategory === key && styles.filterChipActive]}
              onPress={() => setActiveCategory(key)}
              accessibilityRole="button"
              accessibilityLabel={`Filter FAQ: ${label}`}
            >
              <Text style={[styles.filterChipLabel, activeCategory === key && styles.filterChipLabelActive]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Accordion Items */}
        <View style={styles.accordionList}>
          {filtered.map((item, index) => (
            <FaqAccordionItem
              key={item.id}
              item={item}
              isEven={index % 2 === 0}
            />
          ))}
          {filtered.length === 0 && (
            <Text style={styles.emptyText}>No questions in this category yet.</Text>
          )}
        </View>

        {/* Contact border — "Still curious?" section */}
        <View style={styles.contactSection}>
          <Image
            source={faqContactBorder}
            style={styles.contactBorderImage}
            resizeMode="stretch"
          />
          <View style={styles.contactContent}>
            <Text style={styles.contactTitle}>Still curious?</Text>
            <Text style={styles.contactBody}>
              We love questions. Reach out at{' '}
              <Text style={styles.contactEmail}>hello@wildenflower.com</Text>
              {' '}and a real member of our team will write back.
            </Text>
          </View>
        </View>

        <View style={styles.bottomPad} />
      </ScrollView >
    </View >
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
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.h1,
    color: colors.earth,
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    fontFamily: fonts.bodyItalic,
    fontSize: fontSizes.body,
    color: colors.earthLight,
    lineHeight: fontSizes.body * 1.6,
  },

  // Filter chips
  filterScroll: {
    flexGrow: 0,
    marginBottom: spacing.lg,
  },
  filterRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.parchment,
  },
  filterChipActive: {
    backgroundColor: colors.terracotta,
    borderColor: colors.terracotta,
  },
  filterChipLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySmall,
    color: colors.earthLight,
  },
  filterChipLabelActive: {
    color: colors.parchment,
  },

  // Accordion list
  accordionList: {
    marginHorizontal: spacing.lg,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  accordionItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowEven: {
    backgroundColor: colors.parchment,
  },
  rowOdd: {
    backgroundColor: colors.parchmentDark,
  },

  // Accordion header (question row)
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  question: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.body,
    color: colors.earth,
    flex: 1,
    lineHeight: fontSizes.body * 1.4,
  },
  chevron: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  chevronText: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSizes.h3,
    color: colors.terracotta,
    lineHeight: fontSizes.h3,
  },

  // Accordion answer
  answerInner: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.xs,
  },
  answerText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.body,
    color: colors.earthLight,
    lineHeight: fontSizes.body * 1.7,
  },

  // Empty state
  emptyText: {
    fontFamily: fonts.bodyItalic,
    fontSize: fontSizes.body,
    color: colors.earthLight,
    textAlign: 'center',
    padding: spacing.xl,
  },

  // Contact section
  contactSection: {
    marginHorizontal: spacing.lg,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactBorderImage: {
    width: '100%',
    aspectRatio: 1050 / 420,
  },
  contactContent: {
    position: 'absolute',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  contactTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.h3,
    color: colors.earth,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  contactBody: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySmall,
    color: colors.earthLight,
    textAlign: 'center',
    lineHeight: fontSizes.bodySmall * 1.6,
  },
  contactEmail: {
    fontFamily: fonts.bodyBold,
    color: colors.terracotta,
  },

  bottomPad: {
    height: spacing.xl,
  },
});
