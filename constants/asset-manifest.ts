/**
 * Wildenflower Asset Manifest
 * ===========================
 * Every custom illustrated asset the app needs.
 * Use this list to generate or commission all artwork.
 *
 * Generate these using Flux 2 Pro or commission from an illustrator.
 * Style: Vintage botanical ink-and-watercolor, crosshatching,
 * naturalist field guide meets 1967 psychedelic poster.
 *
 * Export all assets as PNG with transparent backgrounds unless noted.
 */

export const assetManifest = {

  // ──────────────────────────────────────
  // HEADERS — Full-width botanical banners
  // ──────────────────────────────────────
  headers: [
    {
      filename: 'botanical-header-large.png',
      dimensions: '1170 x 600px (@3x)',
      description: 'Dense panoramic botanical scene: mushrooms (amanitas, chanterelles, toadstools), ferns, wildflowers, trailing vines, blooming cosmos. Ink crosshatching with watercolor fills. Full palette. Used on Home, Browse, Blog screens.',
      background: 'transparent',
    },
    {
      filename: 'botanical-header-small.png',
      dimensions: '1170 x 360px (@3x)',
      description: 'Simplified horizontal garland: ferns, small mushrooms, wildflower buds, trailing moss. Less dense than large header. Used on Checkout, About, FAQ, Profile screens.',
      background: 'transparent',
    },
    {
      filename: 'botanical-header-blog.png',
      dimensions: '1170 x 480px (@3x)',
      description: 'Dense mushroom forest scene: mushrooms growing from mossy earth, fern fronds unfurling, wildflowers blooming. Panoramic composition. Blog screen header.',
      background: 'transparent',
    },
    {
      filename: 'botanical-header-faq.png',
      dimensions: '1170 x 400px (@3x)',
      description: 'Charming mushroom cluster on mossy mound with fern fronds and tiny wildflowers. Centered composition, more whimsical. FAQ screen header.',
      background: 'transparent',
    },
  ],

  // ──────────────────────────────────────
  // DIVIDERS — Horizontal section breaks
  // ──────────────────────────────────────
  dividers: [
    {
      filename: 'divider-fern-mushroom.png',
      dimensions: '1170 x 96px (@3x)',
      description: 'Horizontal strip: small fern fronds flanking a tiny mushroom cluster. Delicate ink linework.',
    },
    {
      filename: 'divider-wildflower.png',
      dimensions: '1170 x 96px (@3x)',
      description: 'Horizontal strip: scattered wildflower sprigs and buds. Loose, natural arrangement.',
    },
    {
      filename: 'divider-vine-trail.png',
      dimensions: '1170 x 96px (@3x)',
      description: 'Single trailing vine with small leaves and tiny flower buds. Flowing left to right.',
    },
    {
      filename: 'divider-mushroom-cluster.png',
      dimensions: '1170 x 96px (@3x)',
      description: 'Three small mushrooms of different species growing from mossy base. Centered.',
    },
    {
      filename: 'divider-fern-spiral.png',
      dimensions: '1170 x 96px (@3x)',
      description: 'Two fern fiddleheads unfurling toward each other from opposite sides.',
    },
  ],

  // ──────────────────────────────────────
  // CARD CORNERS — Botanical detail overlays
  // ──────────────────────────────────────
  cardCorners: [
    {
      filename: 'card-corner-topleft.png',
      dimensions: '72 x 72px (@3x)',
      description: 'Small fern frond curling into top-left corner. Delicate ink with subtle sage green watercolor.',
    },
    {
      filename: 'card-corner-bottomright.png',
      dimensions: '72 x 72px (@3x)',
      description: 'Tiny mushroom with small fern sprig at bottom-right corner. Ink with terracotta watercolor on cap.',
    },
  ],

  // ──────────────────────────────────────
  // CATEGORY ICONS — Circular botanical art
  // ──────────────────────────────────────
  categoryIcons: [
    {
      filename: 'icon-mushroom.png',
      dimensions: '216 x 216px (@3x)',
      description: 'Single amanita mushroom with small ferns at base. Ink and watercolor. For "From the Earth" category and FAQ "Getting Started".',
    },
    {
      filename: 'icon-vine.png',
      dimensions: '216 x 216px (@3x)',
      description: 'Trailing vine with small leaves forming a loose spiral. Ink and watercolor. For "Worn & Woven" category.',
    },
    {
      filename: 'icon-crystal.png',
      dimensions: '216 x 216px (@3x)',
      description: 'Small crystal cluster (amethyst style) with tiny fern sprig. Ink with lavender watercolor. For "Light & Stone" category and FAQ "Our Makers".',
    },
    {
      filename: 'icon-wildflower.png',
      dimensions: '216 x 216px (@3x)',
      description: 'Single wildflower bloom with curved stem and small leaf. Ink with dusty rose watercolor. For "Color & Dye" and FAQ "Returns & Care".',
    },
    {
      filename: 'icon-fern.png',
      dimensions: '216 x 216px (@3x)',
      description: 'Unfurling fern fiddlehead. Ink with sage green watercolor. For "Hand Crafted" category and FAQ "Shipping".',
    },
    {
      filename: 'icon-sunburst.png',
      dimensions: '216 x 216px (@3x)',
      description: 'Sunburst rays through wildflower silhouettes. Ink with warm gold watercolor. For "Freedom & Joy" brand pillar.',
    },
    {
      filename: 'icon-vines-circle.png',
      dimensions: '216 x 216px (@3x)',
      description: 'Two vine tendrils forming a circle, intertwined. Ink with sage watercolor. For "Connection" brand pillar.',
    },
    {
      filename: 'icon-seedling.png',
      dimensions: '216 x 216px (@3x)',
      description: 'Single small seedling with two leaves, planted in soil. Ink with sage watercolor. For "Intentional Living" brand pillar.',
    },
  ],

  // ──────────────────────────────────────
  // UI ELEMENTS — Functional illustrated pieces
  // ──────────────────────────────────────
  uiElements: [
    {
      filename: 'fern-expand.png',
      dimensions: '72 x 72px (@3x)',
      description: 'Curled fern fiddlehead (closed state). Used as accordion collapse indicator.',
    },
    {
      filename: 'fern-collapse.png',
      dimensions: '72 x 72px (@3x)',
      description: 'Unfurled fern frond (open state). Used as accordion expand indicator.',
    },
    {
      filename: 'vine-arrow-right.png',
      dimensions: '48 x 48px (@3x)',
      description: 'Small vine tendril curling to the right, forming an arrow shape. Used as "next" or navigation indicator on profile menu items.',
    },
    {
      filename: 'vine-back-arrow.png',
      dimensions: '48 x 48px (@3x)',
      description: 'Small vine tendril curling to the left. Used as back navigation arrow.',
    },
    {
      filename: 'button-wreath.png',
      dimensions: '480 x 168px (@3x)',
      description: 'Subtle botanical wreath surround (very delicate, almost invisible). Sits behind primary gold button text. Tiny vines and buds.',
    },
    {
      filename: 'parcel-illustration.png',
      dimensions: '240 x 240px (@3x)',
      description: 'Hand-drawn wrapped parcel with twine and a wildflower tucked into the string. Ink with warm watercolor. Used on checkout screen near order total.',
    },
    {
      filename: 'progress-vine-segment.png',
      dimensions: '96 x 12px (@3x)',
      description: 'Short wavy vine connecting two progress step circles. Hand-drawn. Replaces standard progress bar line. Two versions: active (terracotta) and inactive (muted).',
    },
  ],

  // ──────────────────────────────────────
  // EMPTY STATES & SPECIAL
  // ──────────────────────────────────────
  emptyStates: [
    {
      filename: 'empty-state-botanical.png',
      dimensions: '360 x 360px (@3x)',
      description: 'General empty state: a small mushroom and wildflower growing from bare earth with a tiny fern. Hopeful, beginning-of-something feeling. Muted palette.',
    },
    {
      filename: 'empty-cart.png',
      dimensions: '360 x 360px (@3x)',
      description: 'Empty woven basket sitting in grass with a single fern frond nearby. Waiting-to-be-filled feeling.',
    },
    {
      filename: 'empty-favorites.png',
      dimensions: '360 x 360px (@3x)',
      description: 'Small open journal or cabinet with a single pressed wildflower on the first page. Just beginning to collect.',
    },
    {
      filename: 'empty-search.png',
      dimensions: '360 x 360px (@3x)',
      description: 'A winding path through a small mushroom garden, disappearing around a corner. The thing you\'re looking for might be just out of sight.',
    },
  ],

  // ──────────────────────────────────────
  // LOGO
  // ──────────────────────────────────────
  logo: [
    {
      filename: 'logo-full.png',
      dimensions: '600 x 600px (@3x)',
      description: 'Full Wildenflower logo: circular mark (mushroom, wildflower, fern) with "Wildenflower" wordmark below. Deep earth brown on transparent.',
    },
    {
      filename: 'logo-mark.png',
      dimensions: '300 x 300px (@3x)',
      description: 'Circular mark only (no wordmark). For tab bar, nav bar, favicon. Deep earth brown on transparent.',
    },
    {
      filename: 'logo-mark-cream.png',
      dimensions: '300 x 300px (@3x)',
      description: 'Circular mark only in parchment cream. For use on dark (forest green) backgrounds.',
    },
  ],

  // ──────────────────────────────────────
  // SPLASH SCREEN
  // ──────────────────────────────────────
  splash: [
    {
      filename: 'splash-bloom-elements.png',
      dimensions: '1170 x 1170px (@3x)',
      description: 'Radiating botanical growth elements: thin stems, fern fiddleheads uncurling, leaf buds opening, root tendrils — growing outward from center in all directions. Fading from deep earth brown at center to terracotta and sage green at edges, dissolving into nothing. Transparent background. Layered behind the logo on splash screen.',
    },
  ],

  // ──────────────────────────────────────
  // ABOUT PAGE — Special illustrations
  // ──────────────────────────────────────
  about: [
    {
      filename: 'cartouche-frame.png',
      dimensions: '900 x 720px (@3x)',
      description: 'Ornate oval frame of intertwined mushrooms, ferns, wildflowers, and trailing vines. The oval center is transparent (photo goes behind it). Full palette ink and watercolor.',
    },
    {
      filename: 'drop-cap-A.png',
      dimensions: '180 x 180px (@3x)',
      description: 'Decorative letter "A" filled with tiny mushrooms and ferns. Ink and watercolor. Used as first drop cap on About page.',
    },
    {
      filename: 'divider-fallen-log.png',
      dimensions: '1170 x 180px (@3x)',
      description: 'Full-width illustration: mushrooms growing along a fallen log with ferns and moss. Panoramic, horizontal composition. About page chapter divider.',
    },
  ],

  // ──────────────────────────────────────
  // BLOG — Special illustrations
  // ──────────────────────────────────────
  blog: [
    {
      filename: 'blog-pull-quote-frame.png',
      dimensions: '1050 x 300px (@3x)',
      description: 'Delicate rectangular frame of ink-drawn vines and tiny toadstools. Interior transparent. Used behind pull quotes on blog posts.',
    },
  ],

  // ──────────────────────────────────────
  // CHECKOUT — Special
  // ──────────────────────────────────────
  checkout: [
    {
      filename: 'checkout-garland.png',
      dimensions: '1170 x 120px (@3x)',
      description: 'Single elegant horizontal garland: ink-drawn ferns, small mushrooms, trailing moss, wildflower buds. Muted terracotta and sage green. Simpler than the full header. Used at top of checkout screen.',
    },
    {
      filename: 'fern-border-vertical.png',
      dimensions: '36 x 600px (@3x)',
      description: 'Vertical strip of climbing fern fronds and tiny toadstools. Used as left border on order summary card.',
    },
  ],

  // ──────────────────────────────────────
  // FAQ — Special
  // ──────────────────────────────────────
  faq: [
    {
      filename: 'faq-contact-border.png',
      dimensions: '1050 x 420px (@3x)',
      description: 'Rectangular frame of ferns and wildflowers for the "Still curious?" contact callout card. Interior transparent for sage green background.',
    },
  ],

  // ──────────────────────────────────────
  // TAB BAR ICONS
  // ──────────────────────────────────────
  tabIcons: [
    { filename: 'tab-home.png', dimensions: '72 x 72px (@3x)', description: 'Small mushroom with tiny wildflower. Simple, recognizable silhouette.' },
    { filename: 'tab-home-active.png', dimensions: '72 x 72px (@3x)', description: 'Same as above but with terracotta fill.' },
    { filename: 'tab-browse.png', dimensions: '72 x 72px (@3x)', description: 'Small magnifying glass with a tiny fern leaf inside.' },
    { filename: 'tab-browse-active.png', dimensions: '72 x 72px (@3x)', description: 'Same with terracotta fill.' },
    { filename: 'tab-favorites.png', dimensions: '72 x 72px (@3x)', description: 'Heart shape formed by two curling vine tendrils meeting at the top.' },
    { filename: 'tab-favorites-active.png', dimensions: '72 x 72px (@3x)', description: 'Same with dusty rose fill.' },
    { filename: 'tab-cart.png', dimensions: '72 x 72px (@3x)', description: 'Small woven basket with a tiny fern frond peeking out.' },
    { filename: 'tab-cart-active.png', dimensions: '72 x 72px (@3x)', description: 'Same with warm gold fill.' },
    { filename: 'tab-profile.png', dimensions: '72 x 72px (@3x)', description: 'Simple circular wreath of tiny vines (silhouette).' },
    { filename: 'tab-profile-active.png', dimensions: '72 x 72px (@3x)', description: 'Same with sage green fill.' },
  ],
};
