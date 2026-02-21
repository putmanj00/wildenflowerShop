/**
 * Wildenflower Design System — Theme Tokens
 * ==========================================
 * The single source of truth for all visual decisions in the app.
 * Import this file in every component. Never hardcode colors, fonts, or spacing.
 *
 * Usage:
 *   import { colors, fonts, spacing, radii, shadows } from './theme';
 */

import { Platform } from 'react-native';

// ─────────────────────────────────────────────
// COLORS
// ─────────────────────────────────────────────

export const colors = {
  // Primary palette
  terracotta: '#C8642A',       // Primary brand, CTAs, headings, active states
  crimson: '#8B1A3A',          // Deep accent, emphasis, hover states
  gold: '#C9A642',             // Buttons, highlights, prices, stars
  sage: '#7B8B6F',             // Secondary text, nature elements, prices, tags
  forest: '#1E3B30',           // Dark sections, contrast backgrounds, footer
  dustyRose: '#D08B7A',        // Watercolor washes, soft highlights, active filters
  lavender: '#C4B0CC',         // Watercolor washes, categories, soft accents
  parchment: '#F5EDD6',        // Primary background — used EVERYWHERE
  earth: '#3B2F2F',            // Body text, icons, UI chrome

  // Extended / utility
  parchmentDark: '#EDE4D0',    // Slightly darker parchment for card backgrounds
  parchmentLight: '#FAF5EE',   // Lighter parchment for modal overlays
  goldLight: '#F0E2B0',        // Light gold for subtle button hover states
  sageLight: '#E8EDE5',        // Very light sage for wash backgrounds
  roseLight: '#F5E0DA',        // Very light rose for wash backgrounds
  lavenderLight: '#EDE5F0',    // Very light lavender for wash backgrounds
  earthLight: '#6B5B5B',       // Muted brown for secondary text, captions
  inkBrown: '#5C4033',         // Hand-drawn element color, borders

  // Semantic
  background: '#F5EDD6',
  text: '#3B2F2F',
  textSecondary: '#6B5B5B',
  textMuted: '#8B7D6B',
  border: '#D9D0C5',
  borderLight: '#E8E0D4',
  divider: '#D9D0C5',
  success: '#7A9A6F',          // Use sage-family green
  error: '#C0543B',            // Use terracotta-family
  overlay: 'rgba(59, 47, 47, 0.5)',  // Earth-toned overlay

  // NEVER use these:
  // white: '#FFFFFF'   → use parchment or parchmentLight instead
  // black: '#000000'   → use earth instead
};

// ─────────────────────────────────────────────
// TYPOGRAPHY
// ─────────────────────────────────────────────

export const fonts = {
  // Display / Headings — decorative serif with organic character
  // Playfair Display is the practical substitute for psychedelic serif
  heading: 'PlayfairDisplay_700Bold',
  headingRegular: 'PlayfairDisplay_400Regular',
  headingItalic: 'PlayfairDisplay_700Bold_Italic',

  // Body — warm, readable serif
  body: 'Lora_400Regular',
  bodyBold: 'Lora_700Bold',
  bodyItalic: 'Lora_400Regular_Italic',
  bodyBoldItalic: 'Lora_700Bold_Italic',

  // Accent — for taglines, quotes, special moments
  accent: 'PlayfairDisplay_400Regular_Italic',
};

export const fontSizes = {
  // Headings
  hero: 36,           // Hero / splash screen brand name
  h1: 28,             // Screen titles ("Questions & Curiosities")
  h2: 22,             // Section headings ("Our Values")
  h3: 18,             // Sub-section headings

  // Body
  bodyLarge: 17,      // Featured text, pull quotes
  body: 15,           // Standard body text
  bodySmall: 13,      // Captions, metadata, timestamps

  // UI
  button: 16,         // Button labels
  buttonSmall: 14,    // Secondary button labels
  tab: 11,            // Tab bar labels
  tag: 12,            // Tags, chips, badges
  price: 18,          // Product prices
  priceLarge: 22,     // Product detail price
};

export const lineHeights = {
  tight: 1.2,         // Headings
  normal: 1.6,        // Body text — generous for readability
  relaxed: 1.8,       // Long-form reading (blog, about)
};

// ─────────────────────────────────────────────
// SPACING
// ─────────────────────────────────────────────
// Wildenflower is UNHURRIED. Generous spacing everywhere.
// When in doubt, add more space, not less.

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,

  // Semantic spacing
  screenPadding: 20,          // Horizontal padding on all screens
  cardPadding: 16,            // Internal padding inside cards
  sectionGap: 32,             // Gap between major sections
  itemGap: 12,                // Gap between items in a list/grid
  dividerMargin: 24,          // Vertical margin around botanical dividers
  headerHeight: 200,          // Botanical header banner height
  headerHeightSmall: 120,     // Compact botanical header height
  tabBarHeight: 80,           // Bottom tab bar height
  buttonHeight: 52,           // Standard button height
  inputHeight: 48,            // Form input height
  categoryIconSize: 72,       // Circular category icon size
  productCardImageHeight: 160, // Product card image height in grid
};

// ─────────────────────────────────────────────
// BORDER RADII
// ─────────────────────────────────────────────
// Soft and organic. Never sharp, never perfectly circular on rectangles.

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 999,          // Circular elements (category icons, avatars)

  // Semantic
  card: 16,            // Product cards, content cards
  button: 12,          // Buttons
  input: 10,           // Form fields
  chip: 20,            // Filter chips, tags
  image: 12,           // Image corners
};

// ─────────────────────────────────────────────
// SHADOWS
// ─────────────────────────────────────────────
// Warm, not cold. Think afternoon sunlight, not fluorescent office.

export const shadows = {
  sm: {
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(59, 47, 47, 0.08)',
      },
      default: {
        shadowColor: colors.earth,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  md: {
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 8px rgba(59, 47, 47, 0.10)',
      },
      default: {
        shadowColor: colors.earth,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  lg: {
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 16px rgba(59, 47, 47, 0.12)',
      },
      default: {
        shadowColor: colors.earth,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
  },
  // Special: warm golden glow for highlighted/featured items
  glow: {
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 12px rgba(201, 166, 66, 0.20)',
      },
      default: {
        shadowColor: colors.gold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
      },
    }),
  },
};

// ─────────────────────────────────────────────
// ANIMATION
// ─────────────────────────────────────────────

export const animation = {
  // Durations (ms) — everything is gentle and organic
  fast: 200,
  normal: 350,
  slow: 500,
  pageTransition: 400,
  bloomReveal: 600,       // For watercolor wash reveals
  fernUnfurl: 450,        // For accordion expand (fern unfurling)

  // Easing — organic, never mechanical
  easeOut: [0.25, 0.1, 0.25, 1.0],
  easeInOut: [0.42, 0, 0.58, 1.0],
  gentle: [0.4, 0, 0.2, 1.0],       // Primary easing — soft and natural
  bloom: [0.34, 1.56, 0.64, 1.0],   // Slight overshoot — like a flower opening
};

// ─────────────────────────────────────────────
// UI COPY
// ─────────────────────────────────────────────
// Wildenflower voice: warm, poetic, human. Never corporate.

export const copy = {
  // Navigation
  tabHome: 'Home',
  tabBrowse: 'Browse',
  tabFavorites: 'Favorites',
  tabCart: 'Cart',
  tabMenu: 'Menu',

  // Empty states
  emptyCart: 'Nothing here yet — but the best things take time.',
  emptyFavorites: 'Your collection is just beginning.',
  emptySearch: 'We couldn\'t find that one. Try wandering a different path.',
  emptyBlog: 'New stories are on their way.',

  // Actions
  addToCart: 'Add to Cart',
  checkout: 'Checkout',
  checkoutMessage: 'You\'re about to make someone\'s day.',
  continueBrowsing: 'Keep Wandering',
  viewAll: 'See All',
  contact: 'We\'d love to hear from you',

  // Sections
  featured: 'Freshly Gathered',
  categories: 'Explore',
  makerStories: 'Maker Stories',
  faqTitle: 'Questions & Curiosities',
  aboutTitle: 'Our Story',
  blogTitle: 'Field Notes',
  valuesTitle: 'What We Believe',

  // Search
  searchPlaceholder: 'What are you looking for?',

  // Greeting
  welcome: 'Welcome back',
  tagline: 'Made by hand. Found by heart.',
};

// ─────────────────────────────────────────────
// BRAND PILLARS (for About screen)
// ─────────────────────────────────────────────

export const brandPillars = [
  {
    id: 'authenticity',
    title: 'Authenticity',
    icon: 'mushroom',       // botanical icon asset key
    description: 'We celebrate the handmade, the imperfect, the real.',
  },
  {
    id: 'freedom',
    title: 'Freedom & Joy',
    icon: 'sunburst',
    description: 'Life should be vibrant, unscripted, and free.',
  },
  {
    id: 'connection',
    title: 'Connection',
    icon: 'vines',
    description: 'Every purchase is a relationship, not a transaction.',
  },
  {
    id: 'intention',
    title: 'Intentional Living',
    icon: 'seedling',
    description: 'Where you spend is a quiet form of expression.',
  },
];

// ─────────────────────────────────────────────
// FAQ CATEGORIES
// ─────────────────────────────────────────────

export const faqCategories = [
  { id: 'getting-started', label: 'Getting Started', icon: 'mushroom' },
  { id: 'shipping', label: 'Shipping', icon: 'fern' },
  { id: 'makers', label: 'Our Makers', icon: 'crystal' },
  { id: 'returns', label: 'Returns & Care', icon: 'wildflower' },
];

// ─────────────────────────────────────────────
// PRODUCT CATEGORIES
// ─────────────────────────────────────────────

// Handles confirmed against live Shopify store (smoke test, Phase 2).
// 'frontpage' omitted — treated as "All" (unfiltered) by Browse screen, not a chip.
// 'crystals' and 'ceramics' removed — no matching Shopify collections exist.
// 'artwork' label kept (user-facing); 'art' is the Shopify collection handle (slug).
export const productCategories = [
  { id: 'tie-dye',  label: 'Tie-Dye',  description: 'Color & Light',  icon: 'wildflower' },
  { id: 'leather',  label: 'Leather',  description: 'Hand Crafted',   icon: 'fern'       },
  { id: 'jewelry',  label: 'Jewelry',  description: 'Worn & Found',   icon: 'vine'       },
  { id: 'art',      label: 'Artwork',  description: 'Made by Hand',   icon: 'sunburst'   },
];
