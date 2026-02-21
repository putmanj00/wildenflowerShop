/**
 * Wildenflower — Mock Data
 * ========================
 * Sample data for development. Replace with API calls in production.
 */

import { Product, Maker, BlogPost, FAQItem, BrandPillar } from '../types';

// ─── Makers ─────────────────────────────────

export const makers: Maker[] = [
  {
    id: 'maker-ashley',
    name: 'Ashley Sifford',
    bio: 'Hand-crafted with intention in every stitch, stone, and brushstroke. Ashley makes tie-dye, leather goods, jewelry, and original artwork — each piece a small act of devotion to the handmade life.',
    location: 'Wildenflower Studio',
    specialties: ['Artwork', 'Jewelry', 'Leatherwork', 'Tie-Dye'],
    productCount: 0, // live count driven by Shopify
  },
  {
    id: 'maker-1',
    name: 'River Clay Studio',
    bio: 'Hand-thrown ceramics from a sun-filled studio in the hills. Every piece carries the warmth of the kiln and the calm of the river.',
    location: 'Asheville, NC',
    specialties: ['Ceramics', 'Pottery', 'Stoneware'],
    productCount: 24,
  },
  {
    id: 'maker-2',
    name: 'Meadow & Thread',
    bio: 'Natural dyes, hand-woven textiles, and tie-dye made the old way — slowly, with intention, and a lot of love.',
    location: 'Taos, NM',
    specialties: ['Textiles', 'Tie-Dye', 'Weaving'],
    productCount: 18,
  },
  {
    id: 'maker-3',
    name: 'Earth & Ember',
    bio: 'Ethically sourced crystals and minerals. We believe every stone carries a story from deep within the earth.',
    location: 'Sedona, AZ',
    specialties: ['Crystals', 'Minerals', 'Jewelry'],
    productCount: 32,
  },
  {
    id: 'maker-4',
    name: 'Willow & Hide',
    bio: 'Vegetable-tanned leather goods crafted one at a time. Every cut, stitch, and stamp is done by hand.',
    location: 'Portland, OR',
    specialties: ['Leather', 'Journals', 'Bags'],
    productCount: 15,
  },
  {
    id: 'maker-5',
    name: 'Kiln & Spirit',
    bio: 'Raku-fired ceramics with unpredictable glazes. We embrace the beautiful accidents that fire creates.',
    location: 'Santa Fe, NM',
    specialties: ['Raku', 'Ceramics', 'Tea Ware'],
    productCount: 12,
  },
  {
    id: 'maker-6',
    name: 'Crystal Path',
    bio: 'Handcut and polished stones from small family mines. Every crystal is chosen by feel, not just by eye.',
    location: 'Boulder, CO',
    specialties: ['Crystals', 'Healing Stones'],
    productCount: 28,
  },
];

/**
 * Look up a maker profile by their Shopify vendor name (case-insensitive).
 * Returns undefined for unrecognised vendor strings — callers should handle gracefully.
 */
export function getMakerByVendor(vendorName: string): Maker | undefined {
  return makers.find(
    (m) => m.name.toLowerCase() === vendorName.toLowerCase()
  );
}



// ─── Products ───────────────────────────────

export const products: Product[] = [
  {
    id: 'prod-1',
    name: 'Hand-Thrown Ceramic Mug',
    price: 38.00,
    description: 'A generous, comfortable mug shaped on the wheel over a quiet morning. The glaze pools in unexpected ways — no two are alike.',
    story: 'This mug was thrown on a Tuesday morning when the light was coming through the studio window just right. The glaze — a mix we call "morning fog" — reacts differently in every firing. This one caught a subtle blue that we almost never see.',
    images: [],
    category: 'ceramics',
    maker: makers[0],
    materials: ['Stoneware clay', 'Food-safe glaze'],
    careInstructions: 'Dishwasher safe, but hand washing keeps the glaze beautiful longer.',
    createdAt: '2026-01-15',
  },
  {
    id: 'prod-2',
    name: 'Tie-Dye Silk Scarf',
    price: 52.00,
    description: 'Pure silk, hand-dyed with natural indigo and marigold. The colours shift and deepen with wear.',
    story: 'Each scarf is folded and bound differently before dyeing, so the pattern is always a surprise. This one spent three days in the indigo vat, and the marigold edges came from flowers grown in our garden.',
    images: [],
    category: 'tie-dye',
    maker: makers[1],
    materials: ['100% silk', 'Natural indigo', 'Marigold dye'],
    careInstructions: 'Hand wash cold, lay flat to dry. Colours may continue to evolve gently over time — that\'s part of the beauty.',
    createdAt: '2026-01-20',
  },
  {
    id: 'prod-3',
    name: 'Amethyst Cluster',
    price: 24.00,
    description: 'A small but vivid amethyst cluster with deep purple points. Ethically sourced from a family-run mine.',
    images: [],
    category: 'crystals',
    maker: makers[2],
    materials: ['Natural amethyst'],
    createdAt: '2026-02-01',
  },
  {
    id: 'prod-4',
    name: 'Leather-Bound Journal',
    price: 45.00,
    description: 'Vegetable-tanned leather cover with hand-stitched binding. 120 pages of unlined cotton paper.',
    story: 'The leather for this journal was tanned over six weeks using oak bark — the oldest method there is. The cover will darken and soften with use, becoming more yours with every page you fill.',
    images: [],
    category: 'leather',
    maker: makers[3],
    materials: ['Vegetable-tanned leather', 'Cotton paper', 'Waxed linen thread'],
    careInstructions: 'The leather will develop a beautiful patina over time. If it gets wet, let it dry naturally.',
    createdAt: '2026-01-10',
  },
  {
    id: 'prod-5',
    name: 'Raku Tea Cup',
    price: 35.00,
    description: 'Fired in the raku tradition — pulled from the kiln while glowing and plunged into reduction. Every crack tells a story.',
    images: [],
    category: 'ceramics',
    maker: makers[4],
    materials: ['Raku clay', 'Copper matte glaze'],
    careInstructions: 'Hand wash only. Not microwave safe. The crackle pattern is sealed but delicate — treat it gently.',
    createdAt: '2026-02-05',
  },
  {
    id: 'prod-6',
    name: 'Citrine Point',
    price: 18.00,
    description: 'A naturally formed citrine point with warm golden tones. Said to carry the energy of sunlight.',
    images: [],
    category: 'crystals',
    maker: makers[5],
    materials: ['Natural citrine'],
    createdAt: '2026-01-28',
  },
  {
    id: 'prod-7',
    name: 'Rose Quartz Heart',
    price: 22.00,
    description: 'Hand-carved rose quartz in a soft heart shape. Smooth, cool to the touch, and gently pink.',
    images: [],
    category: 'crystals',
    maker: makers[5],
    materials: ['Natural rose quartz'],
    createdAt: '2026-02-10',
  },
  {
    id: 'prod-8',
    name: 'Stoneware Bowl',
    price: 42.00,
    description: 'A wide, shallow bowl perfect for morning fruit or evening salad. The speckled glaze has depth you can get lost in.',
    images: [],
    category: 'ceramics',
    maker: makers[0],
    materials: ['Stoneware clay', 'Speckled food-safe glaze'],
    careInstructions: 'Dishwasher and microwave safe.',
    createdAt: '2026-02-08',
  },
  {
    id: 'prod-9',
    name: 'Indigo Linen Wrap',
    price: 68.00,
    description: 'Handwoven linen dyed with natural indigo. Large enough to wrap around your shoulders or drape over a chair.',
    images: [],
    category: 'tie-dye',
    maker: makers[1],
    materials: ['100% linen', 'Natural indigo dye'],
    createdAt: '2026-01-22',
  },
  {
    id: 'prod-10',
    name: 'Leather Passport Holder',
    price: 32.00,
    description: 'Slim, hand-stitched passport holder with the Wildenflower maker\'s mark stamped into the back.',
    images: [],
    category: 'leather',
    maker: makers[3],
    materials: ['Vegetable-tanned leather', 'Waxed linen thread'],
    createdAt: '2026-02-12',
  },
];

// Blog cover images — generated botanical illustrations matching the brand visual language
const blogCovers = {
  clay:      require('../assets/images/blog/blog-cover-hands-clay.png'),
  naturalDye: require('../assets/images/blog/blog-cover-natural-dye.png'),
  makerFair: require('../assets/images/blog/blog-cover-maker-fair.png'),
  raku:      require('../assets/images/blog/blog-cover-raku.png'),
};

export const blogPosts: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'The Hands Behind the Clay',
    excerpt: 'We spent a morning in River Clay Studio watching Sarah shape something from nothing. Here\'s what we learned about patience.',
    content:
      'There is a particular quiet in a pottery studio at seven in the morning. The wheel is still. The kiln is cooling from an overnight firing. Sarah arrives before the light is fully formed, wraps her hands around a mug of tea, and begins.\n\nWatching someone throw clay is watching someone negotiate with the present moment. The clay has opinions. It will tell you when you\'re rushing, when your hands are too tense, when your intentions are wrong. Sarah has been listening to clay for eleven years, and what she hears now is mostly kindness.\n\n\'I made ugly things for three years,\' she tells us, centering a new piece with effortless confidence. \'Then one morning something shifted. I stopped fighting it and started listening. That\'s when it got interesting.\' The mug she\'s shaping now — generous, slightly lopsided in a way that feels intentional — will end up in someone\'s hands every morning for years. It will hold coffee and tea and quiet moments. It already knows this. You can feel it in the clay.',
    coverImage: blogCovers.clay,
    category: 'maker-stories',
    author: 'Wildenflower',
    publishedAt: '2026-02-10',
    readingTime: 6,
    pullQuote: 'Every mug remembers the hands that shaped it.',
  },
  {
    id: 'blog-2',
    title: 'Why Natural Dye Changes Everything',
    excerpt: 'The colours from plants are alive in a way synthetic dyes can never be. Meadow & Thread explains why they\'ll never go back.',
    content:
      'Marcus holds a skein of silk up to the afternoon light. The colour shifts from marigold gold at the surface to a deeper amber in the depths, and neither word quite captures it — which is exactly the point.\n\n\'A synthetic dye is a statement,\' he says. \'It says: this is orange. A natural dye is a conversation. It says: this is what orange looked like when we soaked this silk in this vat on this day in September, with this water, in this light.\' Every batch differs. The same flowers, the same recipe, a week apart — different results. He finds this joyful.\n\nThe process takes days when synthetic equivalents take hours. The marigolds must be harvested at peak bloom, simmered low and slow, the silk mordanted with alum for the colour to hold. \'You can\'t rush it,\' Marcus says. \'And the moment you accept that, the colour becomes something else entirely. It becomes a record of time.\' We\'re wearing time, when we wear his work. That changes how it feels against the skin.',
    coverImage: blogCovers.naturalDye,
    category: 'behind-the-craft',
    author: 'Wildenflower',
    publishedAt: '2026-02-05',
    readingTime: 8,
    pullQuote: 'Chemical dyes are a sentence. Natural dyes are a conversation.',
  },
  {
    id: 'blog-3',
    title: 'Our First Maker Fair',
    excerpt: 'Last weekend we gathered twelve makers, two hundred finders, and one very sunny afternoon. It was everything we hoped it would be.',
    content:
      'We didn\'t know if anyone would come. That\'s the honest version. We\'d sent invitations, posted signs, told everyone we knew — but on the morning of the fair, setting up tables in the meadow while the dew was still on the grass, we genuinely didn\'t know.\n\nThey came. Two hundred of them over the course of an afternoon, drawn by curiosity and the scent of wildflowers and something harder to name — the quiet pull of things made by hand. Children crouched to look at crystals. A woman spent forty minutes talking to a ceramicist about glazes and left with three pieces. A teenager, dragged there by her grandmother, found a leather journal and wrote three pages before they made it to the next table.\n\nTwelve makers. Their stories, standing right there alongside their work. What we learned: the connection is the product. The object is just the excuse to hand something human across a table and say: I made this. I hope it finds you well.',
    coverImage: blogCovers.makerFair,
    category: 'community',
    author: 'Wildenflower',
    publishedAt: '2026-01-28',
    readingTime: 4,
  },
  {
    id: 'blog-4',
    title: 'How Raku Changed My Relationship with Control',
    excerpt: 'Kiln & Spirit\'s founder on why pulling a glowing pot from a kiln and letting fire decide the finish taught her to let go.',
    content:
      'The first time Else pulled a piece from the kiln — orange-glowing, incandescent, impossibly itself — and plunged it into a steel drum of newspaper to smoke and crackle and become whatever the fire wanted it to be, she wept.\n\n\'I had planned it so carefully,\' she says. \'I knew exactly what I wanted. And then I watched the fire override every single decision I\'d made, and what came out was so much more interesting than my plan.\' The dramatic crackle pattern of raku — the unpredictable swirls of copper and crimson, the silvery flash where reduction starved the glaze of oxygen — cannot be controlled. Can only be invited.\n\nShe makes ten pieces knowing that three will crack, two will be surprising, one will be extraordinary, and she won\'t know which is which until the smoke clears. \'I\'ve applied that to everything now,\' she tells us, cradling a finished cup with both hands. \'Design the conditions. Trust the process. Get out of the way.\' The cup is extraordinary. She has no idea why. That\'s exactly right.',
    coverImage: blogCovers.raku,
    category: 'maker-stories',
    author: 'Wildenflower',
    publishedAt: '2026-01-20',
    readingTime: 7,
    pullQuote: 'The kiln doesn\'t care about your plan. That\'s the gift.',
  },
];

// ─── FAQ Items ──────────────────────────────

export const faqItems: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How does Wildenflower choose its makers?',
    answer: 'Every maker on Wildenflower is personally invited after we\'ve visited their studio, seen their process, and heard their story. We look for craft, intention, and heart — not volume or trend. If it\'s not made by hand with genuine care, it\'s not on Wildenflower.',
    category: 'getting-started',
  },
  {
    id: 'faq-2',
    question: 'Are all items truly handmade?',
    answer: 'Every single item on Wildenflower is made by hand by a real person. We visit each maker\'s studio, watch them work, and hear their story before they join our community. No mass production, no factory shortcuts — just human hands and honest craft.',
    category: 'getting-started',
  },
  {
    id: 'faq-3',
    question: 'How long does shipping take?',
    answer: 'Because every item is handmade, some pieces may need a few days to be carefully prepared and packed. Most orders ship within 3-5 business days and arrive within 7-10 days. We\'ll send you a thoughtful update at every step — no anxious tracking refreshes needed.',
    category: 'shipping',
  },
  {
    id: 'faq-4',
    question: 'Can I request a custom piece from a maker?',
    answer: 'Many of our makers love custom commissions! You\'ll find a "Request Custom" option on maker profiles where it\'s available. Custom pieces take longer — usually 2-4 weeks — but the wait is part of the magic. You\'re watching something be made just for you.',
    category: 'makers',
  },
  {
    id: 'faq-5',
    question: 'What is your return policy?',
    answer: 'We want every purchase to feel right. If something arrives damaged or isn\'t what you expected, reach out within 14 days and we\'ll make it right — whether that\'s a replacement, exchange, or refund. Because these are handmade pieces, slight variations from photos are part of their character, not a flaw.',
    category: 'returns',
  },
  {
    id: 'faq-6',
    question: 'How are items packaged?',
    answer: 'With love and care. Our makers use sustainable, minimal packaging — recycled paper, cloth wraps, and biodegradable materials. Many include a small handwritten note. Receiving a Wildenflower parcel should feel like getting a gift from a friend, not a delivery from a warehouse.',
    category: 'shipping',
  },
  {
    id: 'faq-7',
    question: 'How do I care for handmade items?',
    answer: 'Each product listing includes specific care instructions from the maker. In general: handmade pieces reward gentle treatment. Hand wash ceramics, keep leather out of direct sun, store crystals with intention. These items were made slowly — they deserve to be cared for slowly too.',
    category: 'returns',
  },
];
// ─── Brand Pillars ───────────────────────────
// Used on the About screen to show Wildenflower's core values.

export const brandPillars: BrandPillar[] = [
  {
    id: 'pillar-1',
    title: 'Made by Hand',
    icon: 'icon-mushroom',
    description: 'Every piece on Wildenflower was shaped, stitched, thrown, or carved by a real person. No factories. No shortcuts.',
  },
  {
    id: 'pillar-2',
    title: 'Found by Heart',
    icon: 'icon-wildflower',
    description: 'We built Wildenflower for the finders — the people who look for things that mean something. You know the feeling.',
  },
  {
    id: 'pillar-3',
    title: 'Stories in Every Stitch',
    icon: 'icon-vine',
    description: 'Behind each piece is a studio, a maker, and a practice built over years. We tell those stories so they travel with the work.',
  },
  {
    id: 'pillar-4',
    title: 'Community First',
    icon: 'icon-fern',
    description: 'Makers and finders are family here. We take care of both — because a marketplace is only as good as the relationships inside it.',
  },
];
