/**
 * Wildenflower — Blog Feed
 * ========================
 * Three-section layout:
 *   1. Featured Article — large cover, serif title, excerpt + reading time
 *   2. Category Filter Chips — All / Maker Stories / Behind the Craft / Community
 *   3. Stacked Blog Cards — compact horizontal thumbnail + text rows
 *
 * All data from mock-data.blogPosts (static, no network call).
 * Deep link: /blog/[id] → BlogDetailScreen
 */

import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { blogPosts } from '../../data/mock-data';
import { colors, fonts, fontSizes, spacing } from '../../constants/theme';
import { BlogPost } from '../../types';

// ─── Category filter config ─────────────────

type BlogCategory = 'all' | 'maker-stories' | 'behind-the-craft' | 'community';

const CATEGORY_FILTERS: { key: BlogCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'maker-stories', label: 'Maker Stories' },
  { key: 'behind-the-craft', label: 'Behind the Craft' },
  { key: 'community', label: 'Community' },
];

// ─── Category chip labels for display ───────

const CATEGORY_LABELS: Record<string, string> = {
  'maker-stories': 'Maker Stories',
  'behind-the-craft': 'Behind the Craft',
  'community': 'Community',
};

// ─── Featured Article Card ───────────────────

function FeaturedCard({ post }: { post: BlogPost }) {
  const router = useRouter();
  return (
    <Pressable
      style={styles.featuredCard}
      onPress={() => router.push(`/blog/${post.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`Read featured article: ${post.title}`}
    >
      {post.coverImage ? (
        <Image
          source={typeof post.coverImage === 'string' ? { uri: post.coverImage } : post.coverImage}
          style={styles.featuredImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.featuredImage, styles.featuredImagePlaceholder]} />
      )}
      <View style={styles.featuredBody}>
        <View style={styles.categoryChip}>
          <Text style={styles.categoryChipLabel}>
            {CATEGORY_LABELS[post.category] ?? post.category}
          </Text>
        </View>
        <Text style={styles.featuredTitle}>{post.title}</Text>
        <Text style={styles.featuredExcerpt} numberOfLines={3}>
          {post.excerpt}
        </Text>
        <View style={styles.featuredMeta}>
          <Text style={styles.metaText}>{post.readingTime} min read</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{post.author}</Text>
        </View>
        <Text style={styles.readMoreLink}>Read More ›</Text>
      </View>
    </Pressable>
  );
}

// ─── Blog Post Card (compact) ────────────────

function BlogPostCard({ post }: { post: BlogPost }) {
  const router = useRouter();
  return (
    <Pressable
      style={styles.postCard}
      onPress={() => router.push(`/blog/${post.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`Read article: ${post.title}`}
    >
      {post.coverImage ? (
        <Image
          source={typeof post.coverImage === 'string' ? { uri: post.coverImage } : post.coverImage}
          style={styles.postThumbnail}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.postThumbnail, styles.postThumbnailPlaceholder]} />
      )}
      <View style={styles.postBody}>
        <View style={styles.categoryChip}>
          <Text style={styles.categoryChipLabel}>
            {CATEGORY_LABELS[post.category] ?? post.category}
          </Text>
        </View>
        <Text style={styles.postTitle} numberOfLines={2}>{post.title}</Text>
        <Text style={styles.postExcerpt} numberOfLines={2}>{post.excerpt}</Text>
        <Text style={styles.metaText}>{post.readingTime} min read</Text>
      </View>
    </Pressable>
  );
}

// ─── Screen ──────────────────────────────────

export default function BlogScreen() {
  const [activeCategory, setActiveCategory] = useState<BlogCategory>('all');

  const filtered = activeCategory === 'all'
    ? blogPosts
    : blogPosts.filter(p => p.category === activeCategory);

  const [featured, ...rest] = filtered;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Stories</Text>
        <Text style={styles.headerSubtitle}>From the makers, for the finders.</Text>
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
            accessibilityLabel={`Filter: ${label}`}
          >
            <Text style={[styles.filterChipLabel, activeCategory === key && styles.filterChipLabelActive]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Featured Article */}
      {featured && <FeaturedCard post={featured} />}

      {/* Divider */}
      {rest.length > 0 && <View style={styles.divider} />}

      {/* Remaining Posts */}
      {rest.map(post => (
        <BlogPostCard key={post.id} post={post} />
      ))}

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
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.h1,
    color: colors.earth,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontFamily: fonts.bodyItalic,
    fontSize: fontSizes.body,
    color: colors.earthLight,
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

  // Featured card
  featuredCard: {
    marginHorizontal: spacing.lg,
    borderRadius: 12,
    backgroundColor: colors.parchmentDark,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  featuredImage: {
    width: '100%',
    height: 200,
  },
  featuredImagePlaceholder: {
    backgroundColor: colors.border,
  },
  featuredBody: {
    padding: spacing.lg,
  },
  featuredTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.h3,
    color: colors.earth,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    lineHeight: fontSizes.h3 * 1.3,
  },
  featuredExcerpt: {
    fontFamily: fonts.body,
    fontSize: fontSizes.body,
    color: colors.earthLight,
    lineHeight: fontSizes.body * 1.6,
    marginBottom: spacing.md,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  readMoreLink: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSizes.bodySmall,
    color: colors.terracotta,
    marginTop: spacing.xs,
  },

  // Post card
  postCard: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 10,
    backgroundColor: colors.parchmentDark,
    overflow: 'hidden',
  },
  postThumbnail: {
    width: 110,
    height: 110,
  },
  postThumbnailPlaceholder: {
    backgroundColor: colors.border,
  },
  postBody: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  postTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.body,
    color: colors.earth,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    lineHeight: fontSizes.body * 1.35,
  },
  postExcerpt: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySmall,
    color: colors.earthLight,
    lineHeight: fontSizes.bodySmall * 1.5,
    marginBottom: spacing.xs,
  },

  // Shared
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.sage + '22',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryChipLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.tag,
    color: colors.sage,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
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
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  bottomPad: {
    height: spacing.xl,
  },
});
