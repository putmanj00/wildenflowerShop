/**
 * Wildenflower — Blog Post Detail
 * ================================
 * Full article view with:
 *   - Cover image (full-width, generous height)
 *   - Category chip + serif title + author + reading time
 *   - Body content in warm earth body text (lineHeight 1.8)
 *   - Pull-quote block: blog-pull-quote-frame.png with quote text overlaid
 *   - Back navigation (← Back to Stories)
 *
 * Deep link: /blog/blog-1 etc.
 */

import React from 'react';
import {
  ImageBackground,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { blogPosts } from '../../../data/mock-data';
import { colors, fonts, fontSizes, spacing } from '../../../constants/theme';
import TopNav from '../../../components/layout/TopNav';

// ─── Pull-quote frame asset ──────────────────
const pullQuoteFrame = require('../../../assets/images/blog/blog-pull-quote-frame.png');

// ─── Category label map ──────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  'maker-stories': 'Maker Stories',
  'behind-the-craft': 'Behind the Craft',
  'community': 'Community',
};

export default function BlogDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const post = blogPosts.find(p => p.id === id);

  if (!post) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Story not found.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>← Back to Stories</Text>
        </Pressable>
      </View>
    );
  }

  // Split content into paragraphs for rendering
  const paragraphs = post.content.split('\n\n').filter(Boolean);

  // After the first paragraph, insert the pull-quote (if it exists)
  const pullQuoteInsertAfter = 1;

  return (
    <View style={styles.screen}>
      <TopNav />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* Cover Image */}
        {post.coverImage ? (
          <Image
            source={typeof post.coverImage === 'string' ? { uri: post.coverImage } : post.coverImage}
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.coverImage, styles.coverImagePlaceholder]} />
        )}

        {/* Article header */}
        <View style={styles.articleHeader}>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryChipLabel}>
              {CATEGORY_LABELS[post.category] ?? post.category}
            </Text>
          </View>
          <Text style={styles.title}>{post.title}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{post.author}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{post.readingTime} min read</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{post.publishedAt}</Text>
          </View>
        </View>

        {/* Article body with optional pull-quote injection */}
        <View style={styles.articleBody}>
          {paragraphs.map((para, index) => (
            <React.Fragment key={index}>
              <Text style={styles.bodyText}>{para}</Text>
              {/* Inject pull-quote after the specified paragraph */}
              {index === pullQuoteInsertAfter && post.pullQuote && (
                <View style={styles.pullQuoteContainer}>
                  <ImageBackground
                    source={pullQuoteFrame}
                    style={styles.pullQuoteFrame}
                    resizeMode="stretch"
                  >
                    <Text style={styles.pullQuoteText}>"{post.pullQuote}"</Text>
                  </ImageBackground>
                </View>
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Bottom divider */}
        <View style={styles.bottomDivider} />

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Written with love by the{'\n'}Wildenflower team.
          </Text>
          <Pressable
            style={styles.backButtonFooter}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Back to Stories"
          >
            <Text style={styles.backLinkFooter}>← Explore more stories</Text>
          </Pressable>
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
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

  // Not found
  notFound: {
    flex: 1,
    backgroundColor: colors.parchment,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  notFoundText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodyLarge,
    color: colors.earthLight,
    marginBottom: spacing.lg,
  },

  // Back button
  backButton: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.md,
  },
  backLink: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSizes.bodySmall,
    color: colors.terracotta,
  },

  // Cover image
  coverImage: {
    width: '100%',
    height: 240,
  },
  coverImagePlaceholder: {
    backgroundColor: colors.parchmentDark,
  },

  // Article header
  articleHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.sage + '22',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: spacing.sm,
  },
  categoryChipLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.tag,
    color: colors.sage,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.h2,
    color: colors.earth,
    lineHeight: fontSizes.h2 * 1.25,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.tag,
    color: colors.earthLight,
  },
  metaDot: {
    fontFamily: fonts.body,
    fontSize: fontSizes.tag,
    color: colors.earthLight,
    marginHorizontal: spacing.xs,
  },

  // Article body
  articleBody: {
    paddingHorizontal: spacing.lg,
  },
  bodyText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.body,
    color: colors.earth,
    lineHeight: fontSizes.body * 1.8,
    marginBottom: spacing.lg,
  },

  // Pull-quote
  pullQuoteContainer: {
    marginVertical: spacing.lg,
    marginHorizontal: -spacing.md,
  },
  pullQuoteFrame: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  pullQuoteText: {
    fontFamily: fonts.accent,
    fontSize: fontSizes.bodyLarge,
    color: colors.earth,
    textAlign: 'center',
    lineHeight: fontSizes.bodyLarge * 1.5,
  },

  // Footer
  bottomDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: fonts.bodyItalic,
    fontSize: fontSizes.bodySmall,
    color: colors.earthLight,
    textAlign: 'center',
    lineHeight: fontSizes.bodySmall * 1.7,
    marginBottom: spacing.md,
  },
  backButtonFooter: {
    paddingVertical: spacing.sm,
  },
  backLinkFooter: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSizes.bodySmall,
    color: colors.terracotta,
  },
  bottomPad: {
    height: spacing.xl,
  },
});
