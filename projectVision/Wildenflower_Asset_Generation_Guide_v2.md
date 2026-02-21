# Wildenflower — Asset Generation & Extraction Guide (v2)

Generate every illustrated asset your app and website need using Weavy.ai (Flux 2 Pro), then bring them into Figma to size and export for both React Native (mobile) and web (Shopify / marketing site).

---

## The Workflow

```
Weavy.ai → generate isolated element → remove.bg → Figma → size to frame → export PNG
```

That's it. One asset at a time. Each prompt produces one usable asset (or a small group you can quickly separate). No complex slicing from busy scenes.

**You generate each illustration once, then export it at two sizes in Figma** — one for mobile (@3x for React Native) and one for web (2x for retina desktop). The same source image works for both; you're just cropping and scaling differently in Figma.

---

## Mobile vs. Web — What's Different?

Most assets are **shared between mobile and web** — the same illustrations, same style, same prompts. The only difference is export dimensions.

| | Mobile (React Native) | Web (Shopify / Browser) |
|---|---|---|
| **Base width** | 390pt (iPhone) | 1440px (desktop) |
| **Export multiplier** | @3x (1170px wide) | @2x (2880px wide) |
| **Headers** | 1170×600 max | 2880×800 (full-width hero) |
| **Dividers** | 1170×96 | 2880×96 (stretches wider) |
| **Icons, corners, UI** | Same for both | Same for both |
| **Empty states** | Same for both | Same for both |
| **Screen-specific** | Same for both | Same for both |
| **Tab bar icons** | Mobile only | Not used on web (web uses text nav) |
| **Splash bloom** | Mobile only | Not used on web |

**The key takeaway:** Only **headers** and **dividers** need separate web exports. Everything else works at the mobile dimensions for both platforms — web icons, card corners, empty states, frames, etc. are all small enough that the @3x mobile export is plenty of resolution for web.

---

## Platform Tags

Throughout this guide, each asset is tagged:

- 📱 = Mobile only
- 🖥️ = Web only
- 📱🖥️ = Both (generate once, export at both sizes)

---

## Tools You Need

- **Weavy.ai** (Flux 2 Pro) — where you generate everything
- **Figma** (free plan works) — for sizing, positioning, and exporting at correct dimensions
- **remove.bg** (https://remove.bg, free) — for making backgrounds transparent
- A folder on your computer matching the project's `assets/images/` structure

---

## Set Up Your Figma File First

### Step 1: Create a new Figma file called "Wildenflower Asset Factory"

### Step 2: Create these pages (tabs at the top left of Figma):
1. `Imports` — drag generated images here first
2. `Headers`
3. `Dividers`
4. `Icons`
5. `UI Elements`
6. `Screen-Specific`
7. `Empty States`
8. `Logo & Splash`

### Step 3: On each page, pre-create sized frames

These are your "cookie cutters." Create empty frames at the exact export dimensions so you can drop elements in, position them, and export cleanly.

Press **F** to create a frame, then set the dimensions in the right sidebar.

**Headers page — create these frames:**
| Frame Name | Mobile (px) | Web (px) | Platform | Used For |
|---|---|---|---|---|
| `botanical-header-large` | 1170 × 600 | 2880 × 800 | 📱🖥️ | Home, Browse, Blog — main hero banner |
| `botanical-header-small` | 1170 × 360 | 2880 × 480 | 📱🖥️ | Checkout, About, FAQ, Profile — compact header |
| `botanical-header-blog` | 1170 × 480 | 2880 × 640 | 📱🖥️ | Blog detail — article header |
| `botanical-header-faq` | 1170 × 400 | 2880 × 540 | 📱🖥️ | FAQ — whimsical centered header |

> Create **two frames per header** in Figma — one at mobile dimensions, one at web. Paste the same generated image into both and scale/position to fit each frame. Name them `botanical-header-large-mobile` and `botanical-header-large-web` to keep exports separate.

**Dividers page:**
| Frame Name | Mobile (px) | Web (px) | Platform | Used For |
|---|---|---|---|---|
| `divider-fern-mushroom` | 1170 × 96 | 2880 × 96 | 📱🖥️ | Primary section divider — most screens |
| `divider-wildflower` | 1170 × 96 | 2880 × 96 | 📱🖥️ | Alternate section divider |
| `divider-vine-trail` | 1170 × 96 | 2880 × 96 | 📱🖥️ | Alternate section divider |
| `divider-mushroom-cluster` | 1170 × 96 | 2880 × 96 | 📱🖥️ | Alternate section divider |
| `divider-fern-spiral` | 1170 × 96 | 2880 × 96 | 📱🖥️ | Alternate section divider |

> Same approach as headers — create two frames per divider. For web, the divider stretches wider but stays the same height. You may need to generate a wider source image for web dividers (see prompts below).

**Icons page:**
| Frame Name | Size (px) | Platform | Used For |
|---|---|---|---|
| `icon-mushroom` | 216 × 216 | 📱🖥️ | "Ceramics" category icon |
| `icon-vine` | 216 × 216 | 📱🖥️ | "Jewelry" category icon |
| `icon-crystal` | 216 × 216 | 📱🖥️ | "Crystals" category icon |
| `icon-wildflower` | 216 × 216 | 📱🖥️ | "Tie-Dye" category icon |
| `icon-fern` | 216 × 216 | 📱🖥️ | "Leather" category icon |
| `icon-sunburst` | 216 × 216 | 📱🖥️ | "Artwork" category icon |
| `icon-vines-circle` | 216 × 216 | 📱🖥️ | "Connection" brand pillar (About) |
| `icon-seedling` | 216 × 216 | 📱🖥️ | "Intentional Living" brand pillar (About) |
| `card-corner-topleft` | 72 × 72 | 📱🖥️ | Top-left corner of product cards |
| `card-corner-bottomright` | 72 × 72 | 📱🖥️ | Bottom-right corner of product cards |
| `tab-home` | 72 × 72 | 📱 | Bottom tab bar — Home (inactive) |
| `tab-browse` | 72 × 72 | 📱 | Bottom tab bar — Browse (inactive) |
| `tab-favorites` | 72 × 72 | 📱 | Bottom tab bar — Favorites (inactive) |
| `tab-cart` | 72 × 72 | 📱 | Bottom tab bar — Cart (inactive) |
| `tab-profile` | 72 × 72 | 📱 | Bottom tab bar — Profile (inactive) |

**UI Elements page:**
| Frame Name | Size (px) | Platform | Used For |
|---|---|---|---|
| `fern-expand` | 72 × 72 | 📱🖥️ | FAQ accordion — collapsed indicator |
| `fern-collapse` | 72 × 72 | 📱🖥️ | FAQ accordion — expanded indicator |
| `vine-arrow-right` | 48 × 48 | 📱 | Profile menu — "next" indicator |
| `vine-back-arrow` | 48 × 48 | 📱 | Screen headers — back arrow |
| `button-wreath` | 480 × 168 | 📱🖥️ | Behind primary CTA button text |
| `parcel-illustration` | 240 × 240 | 📱🖥️ | Checkout — illustration near order total |
| `progress-vine-segment` | 96 × 12 | 📱🖥️ | Checkout progress bar — vine between steps |

**Screen-Specific page:**
| Frame Name | Size (px) | Platform | Used For |
|---|---|---|---|
| `checkout-garland` | 1170 × 120 | 📱🖥️ | Checkout — delicate garland at top |
| `fern-border-vertical` | 36 × 600 | 📱🖥️ | Checkout — left border on order summary |
| `cartouche-frame` | 900 × 720 | 📱🖥️ | About — ornate oval frame around photo |
| `drop-cap-A` | 180 × 180 | 📱🖥️ | About — decorative first letter |
| `divider-fallen-log` | 1170 × 180 | 📱🖥️ | About — chapter divider |
| `blog-pull-quote-frame` | 1050 × 300 | 📱🖥️ | Blog detail — frame behind pull quotes |
| `faq-contact-border` | 1050 × 420 | 📱🖥️ | FAQ — frame around contact card |

> **Note on extreme aspect ratios:** The `checkout-garland` (1170×120), `fern-border-vertical` (36×600), and `progress-vine-segment` (96×12) frames are unusually proportioned. Weavy's minimum generation size is 256×256, so you can't generate images that directly match these dimensions. Instead, generate at a normal aspect ratio with the content positioned strategically (centered band for the garland and vine segment, left edge for the fern border), then use Figma's **Slice tool** to cut out just the portion you need. See the prompts for those assets for detailed instructions.

**Empty States page:**
| Frame Name | Size (px) | Platform | Used For |
|---|---|---|---|
| `empty-state-botanical` | 360 × 360 | 📱🖥️ | General empty state — no content loaded |
| `empty-cart` | 360 × 360 | 📱🖥️ | Cart — empty cart |
| `empty-favorites` | 360 × 360 | 📱🖥️ | Favorites — no saved items |
| `empty-search` | 360 × 360 | 📱🖥️ | Search — no results |

**Logo & Splash page:**
| Frame Name | Size (px) | Platform | Used For |
|---|---|---|---|
| `logo-full` | 600 × 600 | 📱🖥️ | About, marketing — full logo with wordmark |
| `logo-mark` | 300 × 300 | 📱🖥️ | Nav bar, favicon — circular mark only |
| `logo-mark-cream` | 300 × 300 | 📱🖥️ | Dark backgrounds — cream version of mark |
| `splash-bloom-elements` | 1170 × 1170 | 📱 | App splash/loading screen only |

### Step 4: On every frame, set up the export
1. Select the frame
2. In the right sidebar, scroll to **Export**
3. Click the **+** to add an export setting
4. Set format to **PNG**, scale to **1x**
5. In the fill section, **uncheck "Show in exports"** if the frame has a white fill — this ensures transparent background

You're now ready to drop in assets as you generate them.

---

## Style Anchoring Prompt

Add this to the **beginning of every Weavy prompt** to keep the style consistent across all assets. Copy-paste it as a prefix:

```
Hand-drawn botanical illustration in the style of a vintage naturalist field guide, with fine ink crosshatching and delicate watercolor fills on aged parchment cream background (#F5EDD6). Victorian apothecary meets 1960s psychedelic art nouveau. Colors: terracotta orange (#C8642A), deep crimson (#8B1A3A), warm gold (#C9A642), sage green (#7B8B6F), forest green (#1E3B30), dusty rose (#D08B7A), muted lavender (#C4B0CC). Not photorealistic, not 3D rendered, not cartoon, not clipart, not digital art. No text, no words, no labels, no numbers, no watermarks. No metallic or glossy surfaces. No neon colors. No smooth gradients.
```

This is your "style anchor." Every prompt below starts with this, then adds the specific subject.

> **Note:** Flux 2 Pro does not support negative prompts or guidance scale settings. That's why the "don'ts" are baked directly into the style anchor above. You only need to set the **prompt** and the **Image Size** dropdown in Weavy.

---

## Weavy Settings Quick Reference

Every asset uses one of these Weavy **Image Size** dropdown values. Tape this to your monitor.

| Weavy Image Size | Use For |
|---|---|
| **Landscape 16 9** | All headers, all dividers, checkout garland*, fallen log divider, blog pull quote frame, button wreath |
| **Landscape 4 3** | FAQ header, cartouche frame (about page), FAQ contact border |
| **Square** | All category icons, all tab icons, card corners, fern indicators, vine arrows, parcel, empty states, drop cap, brand pillar icons |
| **Square HD** | Splash bloom elements (needs extra resolution) |
| **Portrait 16 9** | Vertical fern border* (checkout order summary) |

*\*These assets have extreme aspect ratios that don't match any Weavy preset. Generate at the listed size, then use Figma's Slice tool to crop tightly. See the individual prompt notes for details.*

> **All three extreme-ratio assets:** `checkout-garland` (1170×120), `fern-border-vertical` (36×600), and `progress-vine-segment` (96×12) use the same approach — generate at a normal aspect ratio with content positioned strategically, then Slice in Figma.

**Seed:** Leave on `Random`. If you get a generation you love and want to make slight variations, uncheck Random and reuse the seed number with a tweaked prompt.

**Leave everything else at defaults.** No other settings need changing.

---

## Priority 1 — Home Screen Assets (Build These First)

These are the minimum assets to see the Home Screen come alive.

### 1.1 — Large Botanical Header Banner

**Filename:** `botanical-header-large.png`
**Used on:** Home screen, Browse screen, Blog index — the main hero banner at the top of the page
**Weavy prompt:**
```
[STYLE ANCHOR] Wide panoramic scene of mushrooms growing from mossy earth — red-capped amanitas with white spots, golden chanterelles, brown speckled toadstools — surrounded by unfurling fern fronds, trailing vines, wildflowers in bloom, cosmos flowers, and curling vine tendrils. The scene flows horizontally from left to right across the full width. Dense and lush but with rhythm and flow. Botanical illustration quality. Isolated on the parchment background with no border or frame.
```
- **Weavy Image Size:** `Landscape 16 9`
- **Generate 3-4 times**, pick the best
- **Figma:** Drag into the `botanical-header-large` frame (1170×600), scale to fill, export PNG @1x

### 1.2 — Botanical Divider (Primary)

**Filename:** `divider-fern-mushroom.png`
**Used on:** All screens — horizontal section break between content areas (e.g., between category row and product grid on Home)
**Weavy prompt:**
```
[STYLE ANCHOR] A single thin horizontal botanical divider: two small fern fronds flanking a tiny mushroom cluster in the center. Very minimal — just a few delicate elements spaced along a horizontal line. Lots of empty space above and below. The arrangement is centered and symmetrical. Delicate and airy, not dense.
```
- **Weavy Image Size:** `Landscape 16 9` (you'll crop the height down in Figma)
- **Figma:** Drag into `divider-fern-mushroom` frame (1170×96), center the element, export

### 1.3 — Category Icon: Mushroom

**Filename:** `icon-mushroom.png`
**Used on:** Home screen category row and Browse filter chips — represents the "Ceramics" category. Also used on FAQ "Getting Started" section.
**Weavy prompt:**
```
[STYLE ANCHOR] A single red-capped amanita mushroom with white spots, growing from a small patch of moss with two tiny fern fronds at its base. Isolated specimen centered on the background. Simple, clean composition with generous empty space around it. Contained within an implied circular composition. Medium detail — readable at small sizes.
```
- **Weavy Image Size:** `Square`
- **Post-process:** Run through remove.bg → drag transparent PNG into Figma `icon-mushroom` frame (216×216) → center → export

### 1.4 — Category Icon: Vine

**Filename:** `icon-vine.png`
**Used on:** Home screen category row and Browse filter chips — represents the "Jewelry" category
**Weavy prompt:**
```
[STYLE ANCHOR] A single trailing vine with small leaves forming a loose spiral shape. Isolated specimen centered on the background. Simple, clean, readable at small sizes. Circular composition. Sage green and forest green watercolor.
```
- **Same process as 1.3**

### 1.5 — Category Icon: Crystal

**Filename:** `icon-crystal.png`
**Used on:** Home screen category row and Browse filter chips — represents the "Crystals" category. Also used on FAQ "Our Makers" section.
**Weavy prompt:**
```
[STYLE ANCHOR] A small cluster of amethyst crystals — three or four pointed crystal formations — with a tiny fern sprig beside them. Isolated specimen centered on the background. Muted lavender and sage green watercolor. Simple, clean, readable at small sizes.
```
- **Same process as 1.3**

### 1.6 — Category Icon: Wildflower

**Filename:** `icon-wildflower.png`
**Used on:** Home screen category row and Browse filter chips — represents the "Tie-Dye" category. Also used on FAQ "Returns & Care" section.
**Weavy prompt:**
```
[STYLE ANCHOR] A single wildflower bloom with a curved stem and one small leaf. The flower has open petals in dusty rose with a warm gold center. Isolated specimen centered on the background. Simple, clean, readable at small sizes.
```
- **Same process as 1.3**

### 1.7 — Category Icon: Fern

**Filename:** `icon-fern.png`
**Used on:** Home screen category row and Browse filter chips — represents the "Leather" category. Also used on FAQ "Shipping" section.
**Weavy prompt:**
```
[STYLE ANCHOR] A single fern fiddlehead unfurling — the classic spiral shape of a young fern frond. Sage green and forest green watercolor. Isolated specimen centered on the background. Simple, clean, readable at small sizes.
```
- **Same process as 1.3**

### 1.8 — Card Corner: Top Left

**Filename:** `card-corner-topleft.png`
**Used on:** Every product card in the app — small decorative fern overlay on the top-left corner of card images
**Weavy prompt:**
```
[STYLE ANCHOR] A very small, delicate fern frond curling into the top-left corner of the image. The fern enters from the top-left and curls inward. Only the fern and nothing else. Very minimal — just a single small botanical accent for a corner decoration. Sage green watercolor. Mostly empty space.
```
- **Weavy Image Size:** `Square`
- **Post-process:** remove.bg → Figma frame `card-corner-topleft` (72×72) → export

### 1.9 — Card Corner: Bottom Right

**Filename:** `card-corner-bottomright.png`
**Used on:** Every product card in the app — small decorative mushroom overlay on the bottom-right corner of card images
**Weavy prompt:**
```
[STYLE ANCHOR] A very small, delicate tiny mushroom with a small fern sprig positioned in the bottom-right corner of the image. The elements sit at the bottom-right. Only the mushroom, fern, and nothing else. Very minimal — a single small botanical accent for a corner decoration. Terracotta cap, sage green fern. Mostly empty space.
```
- **Same process as 1.8**

### 1.10 — Tab Bar Icons (generate as a batch)

**Used on:** Bottom tab bar — visible on every screen. These are the 5 navigation icons at the bottom of the app. Each has an inactive (earth brown) and active (colored) state.

For tab icons, you need **very simple silhouettes** — these render at only 24×24 points on screen.

**Tab Home — Filename:** `tab-home.png`
```
[STYLE ANCHOR] Extremely simple silhouette of a small mushroom with a tiny wildflower beside it. Bold, clean shapes with no interior detail. Solid deep earth brown (#3B2F2F) ink only, no watercolor fills. Icon style — readable at very small sizes. Isolated on parchment background. Minimal.
```

**Tab Browse — Filename:** `tab-browse.png`
```
[STYLE ANCHOR] Extremely simple silhouette of a magnifying glass with a tiny fern leaf visible inside the lens. Bold, clean shapes with no interior detail. Solid deep earth brown (#3B2F2F) ink only. Icon style — readable at very small sizes. Isolated on parchment background. Minimal.
```

**Tab Favorites — Filename:** `tab-favorites.png`
```
[STYLE ANCHOR] Extremely simple silhouette of a heart shape formed by two curling vine tendrils meeting at the top. Bold, clean shapes with no interior detail. Solid deep earth brown (#3B2F2F) ink only. Icon style — readable at very small sizes. Isolated on parchment background. Minimal.
```

**Tab Cart — Filename:** `tab-cart.png`
```
[STYLE ANCHOR] Extremely simple silhouette of a small woven basket with a tiny fern frond peeking out the top. Bold, clean shapes with no interior detail. Solid deep earth brown (#3B2F2F) ink only. Icon style — readable at very small sizes. Isolated on parchment background. Minimal.
```

**Tab Profile — Filename:** `tab-profile.png`
```
[STYLE ANCHOR] Extremely simple silhouette of a circular wreath made of tiny vine tendrils. Bold, clean shapes with no interior detail. Solid deep earth brown (#3B2F2F) ink only. Icon style — readable at very small sizes. Isolated on parchment background. Minimal.
```

- **Weavy Image Size:** `Square` for all
- **Post-process:** remove.bg → Figma frame (72×72) → export
- **For active versions:** Duplicate the Figma frame, select the image, and use Figma's **Hue/Saturation** adjustment or overlay a color fill with a blend mode to shift from earth brown to the active color (terracotta for home, terracotta for browse, dusty rose for favorites, warm gold for cart, sage green for profile)

---

## Priority 2 — Additional Dividers & Headers

### 2.1 — Compact Header Garland

**Filename:** `botanical-header-small.png`
**Used on:** Checkout, About, FAQ, Profile screens — a lighter, airier header for secondary pages
**Weavy prompt:**
```
[STYLE ANCHOR] A single elegant horizontal garland: trailing fern fronds, two small mushrooms (one amanita, one chanterelle), wildflower buds, tiny moss patches, and curling vine tendrils flowing gently from left to right. Airy and refined — much less dense than a full botanical scene. Breathing room between each element. A delicate ribbon of nature across the width of the image.
```
- **Weavy Image Size:** `Landscape 16 9`
- **Figma:** `botanical-header-small` frame (1170×360)

### 2.2 — Blog Header

**Filename:** `botanical-header-blog.png`
**Used on:** Blog detail screen — immersive header at top of individual blog posts
**Weavy prompt:**
```
[STYLE ANCHOR] Dense mushroom forest floor scene: multiple mushrooms of different species growing from rich mossy earth, fern fronds unfurling upward, wildflowers blooming between them, trailing vines connecting the scene. Panoramic horizontal composition — like looking at a cross-section of a forest floor. Rich and immersive.
```
- **Weavy Image Size:** `Landscape 16 9`
- **Figma:** `botanical-header-blog` frame (1170×480)

### 2.3 — FAQ Header

**Filename:** `botanical-header-faq.png`
**Used on:** FAQ screen — whimsical centered mushroom cluster header
**Weavy prompt:**
```
[STYLE ANCHOR] A charming cluster of three mushrooms growing from a small mossy mound — one red-capped amanita with white spots, one golden chanterelle, one brown toadstool. Fern fiddleheads unfurl on either side. Tiny wildflowers sprout from the moss. Centered composition, whimsical and inviting. Generous empty space around the cluster.
```
- **Weavy Image Size:** `Landscape 4 3`
- **Figma:** `botanical-header-faq` frame (1170×400)

### 2.4 — Remaining Dividers

**Used on:** All screens — rotated between sections for visual variety. The app picks different dividers for different section breaks so it doesn't feel repetitive.

Use the same format as Divider 1.2 above, replacing the subject:

**`divider-wildflower.png`:**
**Used on:** Alternate section divider — rotated with other dividers for variety across screens.
```
[STYLE ANCHOR] A single thin horizontal botanical divider: scattered wildflower sprigs and small buds arranged loosely along a horizontal line. Very minimal and airy. Lots of empty space above and below. Centered.
```

**`divider-vine-trail.png`:**
**Used on:** Alternate section divider — rotated with other dividers for variety across screens.
```
[STYLE ANCHOR] A single thin horizontal botanical divider: one trailing vine with small leaves and tiny flower buds flowing gently from left to right across the width. Very minimal. A single delicate line of nature.
```

**`divider-mushroom-cluster.png`:**
**Used on:** Alternate section divider — rotated with other dividers for variety across screens.
```
[STYLE ANCHOR] A single thin horizontal botanical divider: three small mushrooms of different species growing from a thin mossy base, centered in the image. Very minimal. Lots of empty space above and below.
```

**`divider-fern-spiral.png`:**
**Used on:** Alternate section divider — rotated with other dividers for variety across screens.
```
[STYLE ANCHOR] A single thin horizontal botanical divider: two fern fiddleheads unfurling toward each other from opposite sides, nearly meeting in the center. Symmetrical. Very minimal and delicate.
```

- **All:** Weavy Image Size `Landscape 16 9`, Figma frame 1170×96 (crop the height down in Figma)

---

## Priority 3 — UI Elements

### 3.1 — Fern Accordion Indicators

**Used on:** FAQ screen — replaces standard chevron arrows on expandable/collapsible FAQ items. Closed = curled fiddlehead, Open = unfurled frond.

**`fern-expand.png` (closed/collapsed state):**
```
[STYLE ANCHOR] A single tightly curled fern fiddlehead — the compact spiral shape of a young fern before it unfurls. Very small, simple, isolated on the background. Sage green ink and watercolor. Minimal.
```

**`fern-collapse.png` (open/expanded state):**
```
[STYLE ANCHOR] A single fully unfurled fern frond — open and extended, showing the delicate leaflets. Very small, simple, isolated on the background. Sage green ink and watercolor. Minimal.
```
- **Both:** Weavy Image Size `Square`, remove.bg → 72×72 frame

### 3.2 — Vine Navigation Arrows

**Used on:** Right arrow appears on Profile menu items as a "next" indicator. Left arrow appears in screen headers as a back button. Replaces standard chevron/arrow icons.

**`vine-arrow-right.png`:**
```
[STYLE ANCHOR] A single small vine tendril curling to the right, forming a natural arrow or chevron shape pointing right. Very simple — just one curving vine. Earth brown ink. Minimal. Isolated.
```

**`vine-back-arrow.png`:**
```
[STYLE ANCHOR] A single small vine tendril curling to the left, forming a natural arrow shape pointing left. Very simple — just one curving vine. Earth brown ink. Minimal. Isolated.
```
- **Both:** Weavy Image Size `Square`, remove.bg → 48×48 frame

### 3.3 — Wrapped Parcel (Checkout)

**Used on:** Checkout screen — decorative illustration displayed near the order total, reinforcing the handmade gift-giving feeling.

**`parcel-illustration.png`:**
```
[STYLE ANCHOR] A hand-drawn wrapped parcel or package tied with twine, with a single wildflower tucked into the string on top. Warm, charming, gift-like. Isolated on the background. The parcel has kraft brown paper texture rendered in ink crosshatching. The flower adds a pop of dusty rose color.
```
- **Weavy Image Size:** `Square`, remove.bg → 240×240 frame

### 3.4 — Button Wreath

**Used on:** Behind primary CTA buttons (e.g., "Add to Cabinet," "Complete Order") — a nearly invisible botanical frame that sits behind the button text, adding a whisper of handmade detail.

**`button-wreath.png`:**
```
[STYLE ANCHOR] A very subtle, delicate horizontal wreath or garland of tiny botanical elements — miniature vine tendrils, three tiny buds, two small leaves. Extremely minimal and light. The elements form a loose oval or elongated wreath shape, wider than it is tall. The center is empty (text goes here). Almost invisible — just a whisper of botanical detail. Ink only, very faint, no heavy watercolor.
```
- **Weavy Image Size:** `Landscape 16 9` (widest option, closest to the elongated wreath shape), remove.bg → 480×168 frame

### 3.5 — Progress Vine Segment (Checkout)

**Used on:** Checkout screen progress bar — replaces the standard straight line between step circles (Cart → Shipping → Payment → Confirm) with an organic hand-drawn vine.

**`progress-vine-segment.png`:**
```
[STYLE ANCHOR] A single short wavy vine tendril growing horizontally from left to right across the center of the image, like a small connecting segment between two points. The vine has two or three tiny leaves along its length. Very simple, very minimal — just one short vine segment. All botanical elements stay tightly grouped in a thin horizontal line across the middle of the image. The top half and bottom half are completely empty parchment. Terracotta ink with subtle sage green leaves. Delicate linework.
```
- **Weavy Image Size:** `Landscape 16 9`
- **Figma:** Use the Slice tool (press **S**) to draw a thin horizontal slice across just the vine. Make the slice 96px wide × 12px tall, centered on the vine. Export the slice as PNG.
- **You'll also need a muted/inactive version:** After exporting the active version, duplicate it in Figma and reduce the opacity or desaturate it to create `progress-vine-segment-inactive.png`.
- **Why this is tricky:** At 96×12, this is the most extreme aspect ratio in the whole project. The Slice tool is essential here. If the vine is too thick to fit in 12px, scale the image down in Figma before slicing.

---

## Priority 4 — Empty States

These illustrations appear centered on screen with a gentle message below them when there's nothing to show yet. They set the emotional tone — hopeful, not sad.

**`empty-state-botanical.png`:**
**Used on:** General fallback empty state — any screen/list that has no content loaded yet
```
[STYLE ANCHOR] A small mushroom and wildflower growing together from bare earth with a tiny unfurling fern beside them. Hopeful, beginning-of-something feeling. Slightly muted, softer palette than usual — as if the watercolors were diluted. Isolated, centered, generous empty space around it. Quiet and tender.
```

**`empty-cart.png`:**
**Used on:** Cart screen — shown when the cart has no items, with message like "Your basket is waiting"
```
[STYLE ANCHOR] An empty woven basket sitting in a small patch of grass with a single fern frond leaning against it. Waiting-to-be-filled feeling. Warm, inviting, not sad. The basket is rendered in ink crosshatching with warm brown and gold tones. Isolated, centered, generous empty space.
```

**`empty-favorites.png`:**
**Used on:** Favorites screen — shown when no items have been saved yet, with message like "Your cabinet of curiosities awaits"
```
[STYLE ANCHOR] A small open leather-bound journal lying flat with a single pressed wildflower on the first page. Just beginning to collect. The journal has warm brown leather tones, the flower is dusty rose. Isolated, centered, generous empty space.
```

**`empty-search.png`:**
**Used on:** Browse/Search screen — shown when a search query returns no results, with message like "The path winds on — try a different trail"
```
[STYLE ANCHOR] A winding dirt path through a tiny mushroom garden — two or three small mushrooms on either side of the path, a fern, the path curving away and disappearing. The thing you're looking for might be just around the bend. Whimsical, gentle. Isolated, centered, generous empty space.
```
- **All:** Weavy Image Size `Square`, remove.bg → 360×360 frame

---

## Priority 5 — Screen-Specific Assets

### Checkout Screen

**`checkout-garland.png`:**
**Used on:** Checkout screen — delicate botanical garland running across the top of the page, below the nav bar. Lighter and simpler than the full headers.
```
[STYLE ANCHOR] A single elegant horizontal garland centered vertically in the middle of the image, like a thin ribbon of nature crossing the page. Small ink-drawn fern fronds, two small mushrooms, trailing moss, and a few wildflower buds flowing left to right in a single narrow horizontal band across the center. Everything sits on one thin horizontal line. The top half and bottom half of the image are completely empty parchment. Muted terracotta and sage green only. Delicate and calming. Very airy. All botanical elements stay tightly grouped in a narrow horizontal strip.
```
- **Weavy Image Size:** `Landscape 16 9`
- **Figma:** Drag into Figma, then use the Slice tool (press **S**) to draw a thin horizontal slice across just the garland strip. Make the slice 1170px wide × 120px tall, centered on the botanical elements. Export the slice as PNG.
- **Why this works:** The prompt forces all the content into a narrow horizontal band in the center of the image, so when you crop tightly around it, you get a clean garland strip.

**`fern-border-vertical.png`:**
**Used on:** Checkout screen — decorative left border running down the side of the order summary card, like ferns climbing a page margin.
```
[STYLE ANCHOR] A single narrow vertical column of climbing botanical elements growing upward along the left edge of the image only, like plants climbing a wall or page margin. Small fern fronds and tiny toadstools growing from bottom to top in a single narrow vertical line. The right three-quarters of the image is completely empty parchment. All elements are confined to a thin strip along the left edge. Sage green and earth brown. Delicate linework. The climbing elements form one continuous vertical vine-like arrangement.
```
- **Weavy Image Size:** `Portrait 16 9`
- **Figma:** Drag into Figma, then use the Slice tool (press **S**) to draw a tall narrow slice along just the left edge where the fern elements are. Make the slice 36px wide × 600px tall. Export the slice as PNG.
- **Why this works:** The prompt pushes all content to the left edge, so when you slice a narrow vertical strip from that side, you capture just the border elements.
- **Alternative:** If the generation isn't narrow enough, generate at `Portrait 4 3` instead and crop even tighter. Or generate at `Square`, describe the climbing elements along the left edge, and slice a tall narrow strip from the left side.

### About Screen

**`cartouche-frame.png`:**
**Used on:** About screen — ornate oval botanical frame around the founder's photo. The photo sits behind the frame; the empty center shows through.
```
[STYLE ANCHOR] An ornate oval frame made of intertwined mushrooms (amanitas, chanterelles, toadstools), ferns, wildflowers, and trailing vines. The oval center is completely empty — nothing inside the frame. The botanical elements form the border of the oval only. Full palette with rich watercolor fills. Decorative and beautiful, like a Victorian book plate frame.
```
- **Weavy Image Size:** `Landscape 4 3` → Figma frame 900×720
- **Important:** The empty center is where a photo will show through in the app

**`drop-cap-A.png`:**
**Used on:** About screen — decorative illuminated first letter of the opening paragraph, like a medieval manuscript.
```
[STYLE ANCHOR] A large decorative capital letter "A" in serif font style, filled with and surrounded by tiny mushrooms, fern fronds, and small wildflowers growing within and around the letter. The letter itself is deep earth brown (#3B2F2F). The botanicals grow from and intertwine with the letter's strokes. Illuminated manuscript style meets vintage naturalist.
```
- **Weavy Image Size:** `Square` → Figma frame 180×180

**`divider-fallen-log.png`:**
**Used on:** About screen — rich chapter divider between the story sections (wider and more detailed than the standard dividers).
```
[STYLE ANCHOR] Wide panoramic illustration of mushrooms growing along a fallen log lying horizontally. Ferns and moss cover the log. Small wildflowers grow beside it. The log stretches across the full width of the image. Horizontal composition — wider than it is tall. A natural chapter divider.
```
- **Weavy Image Size:** `Landscape 16 9` → crop in Figma to 1170×180 frame

### Blog Screen

**`blog-pull-quote-frame.png`:**
**Used on:** Blog detail screen — decorative botanical frame behind pull quotes / highlighted text in blog articles. The quote text appears inside the frame.
```
[STYLE ANCHOR] A delicate rectangular frame made of ink-drawn vines and tiny toadstools. The interior is completely empty — nothing inside the frame. The botanical elements form only the border — thin vines along the edges with small mushrooms and leaves at the corners. Very delicate linework, not heavy. The frame is wider than it is tall.
```
- **Weavy Image Size:** `Landscape 16 9` → crop in Figma to 1050×300 frame

### FAQ Screen

**`faq-contact-border.png`:**
**Used on:** FAQ screen — decorative botanical frame around the "Still curious? Get in touch" contact callout card at the bottom of the FAQ page.
```
[STYLE ANCHOR] A rectangular frame made of ferns and wildflowers. The interior is completely empty. Fern fronds line the sides, wildflower blooms cluster at the corners and top. The frame is wider than it is tall. Delicate but visible. Full palette watercolor in the botanical elements.
```
- **Weavy Image Size:** `Landscape 4 3` → Figma frame 1050×420

---

## Priority 6 — Splash Screen & Brand Pillar Icons

### Splash

**`splash-bloom-elements.png`:**
**Used on:** App splash/loading screen — radiating botanical growth elements that sit behind the centered Wildenflower logo while the app loads. Creates the feeling of nature blooming from the brand.
```
[STYLE ANCHOR] Radiating botanical growth elements spreading outward from a central empty point in all directions, like a time-lapse of nature growing from a single seed. Thin stems reaching outward, fern fiddleheads uncurling, leaf buds opening, tiny root tendrils spreading. The elements are dense near the center and fade, thin, and dissolve toward the edges. Deep earth brown (#3B2F2F) ink near the center, transitioning to terracotta and sage green at the tips. The very center is empty (logo goes here). Radially symmetrical. Centered.
```
- **Weavy Image Size:** `Square HD` (use HD for the extra resolution on this large asset)
- **Figma:** 1170×1170 frame
- **Critical:** remove.bg so the bloom floats on the parchment splash background

### Brand Pillar Icons

These appear on the About screen alongside the brand's three core values. Also note that `icon-sunburst` doubles as the "Artwork" category icon.

**`icon-sunburst.png`:**
**Used on:** "Artwork" category icon (Home, Browse). Also "Freedom & Joy" brand pillar (About screen).
```
[STYLE ANCHOR] Sunburst rays radiating outward through wildflower silhouettes. Warm gold watercolor with ink lines. Simple, iconic, readable at small sizes. Circular composition. Isolated, centered.
```

**`icon-vines-circle.png`:**
**Used on:** About screen — "Connection" brand pillar icon.
```
[STYLE ANCHOR] Two vine tendrils growing from opposite sides, curving toward each other and intertwining to form a complete circle. Sage green watercolor. Simple, iconic. Circular composition. Isolated, centered.
```

**`icon-seedling.png`:**
**Used on:** About screen — "Intentional Living" brand pillar icon.
```
[STYLE ANCHOR] A single small seedling with two leaves and a short stem, planted in a tiny mound of soil. Simple, hopeful, minimal. Sage green watercolor leaves, earth brown stem and soil. Isolated, centered.
```
- **All:** Weavy Image Size `Square`, remove.bg → 216×216 frame

---

## The Figma Workflow (Same for Every Asset)

Once you have a generated image from Weavy, the process is always the same:

### Step 1: Remove the Background
1. Go to **https://remove.bg**
2. Upload the generated image
3. Download the transparent PNG
4. Save it somewhere easy to find

**Skip this step for headers and dividers** — they sit on the parchment background in the app, so the parchment background in the generated image actually matches. Only remove backgrounds for elements that float on top of other content (icons, corners, empty states, frames, splash bloom).

### Step 2: Import into Figma
1. Open your **Wildenflower Asset Factory** file
2. Go to the correct page (e.g., Icons page for category icons)
3. Drag the PNG from your computer onto the Figma canvas near the pre-made frame

### Step 3: Place into the Sized Frame
1. Select the imported image
2. **Copy** it (Cmd+C / Ctrl+C)
3. **Double-click** the target frame to enter it
4. **Paste** (Cmd+V / Ctrl+V) — the image pastes inside the frame
5. Scale and position the image within the frame until it looks right
   - Hold **Shift** while scaling to maintain proportions
   - The frame acts as a mask — anything outside it is cropped
6. Make sure the frame itself has **no fill** (or if it does, uncheck **"Show in exports"** in the fill section)

### Step 4: Export
1. Select the frame (click the frame name in the left panel)
2. In the right sidebar, scroll to **Export**
3. You should already have a PNG @1x export setting from setup
4. Click the **Export [frame name]** button
5. Save to the correct folder in your project

### Batch Export (when you have many assets ready)
1. Press **Shift + Cmd + E** (Mac) or **Shift + Ctrl + E** (Windows)
2. The export panel shows all frames with export settings
3. Check the ones you want
4. Click **Export** — Figma saves them all at once, named after the frames

---

## Active Tab Icon Variants

For the active versions of tab icons, don't regenerate — just color-shift in Figma:

1. Duplicate the inactive tab icon frame
2. Rename it (e.g., `tab-home` → `tab-home-active`)
3. Select the image inside the duplicated frame
4. In the right sidebar, click the image fill thumbnail to open image settings
5. Use **Exposure**, **Contrast**, **Saturation**, and **Temperature** sliders to warm the tone
6. OR: Add a new fill layer on top set to the active color with blend mode **Color** or **Multiply**
   - Home active: terracotta (#C8642A)
   - Browse active: terracotta (#C8642A)
   - Favorites active: dusty rose (#D08B7A)
   - Cart active: warm gold (#C9A642)
   - Profile active: sage green (#7B8B6F)
7. Export the active frame as a separate PNG

---

## File Organization

### Mobile (React Native)

```
assets/images/
├── headers/
│   ├── botanical-header-large.png
│   ├── botanical-header-small.png
│   ├── botanical-header-blog.png
│   └── botanical-header-faq.png
├── dividers/
│   ├── divider-fern-mushroom.png
│   ├── divider-wildflower.png
│   ├── divider-vine-trail.png
│   ├── divider-mushroom-cluster.png
│   └── divider-fern-spiral.png
├── corners/
│   ├── card-corner-topleft.png
│   └── card-corner-bottomright.png
├── icons/
│   ├── categories/
│   │   ├── icon-mushroom.png
│   │   ├── icon-vine.png
│   │   ├── icon-crystal.png
│   │   ├── icon-wildflower.png
│   │   ├── icon-fern.png
│   │   ├── icon-sunburst.png
│   │   ├── icon-vines-circle.png
│   │   └── icon-seedling.png
│   ├── tabs/
│   │   ├── tab-home.png
│   │   ├── tab-home-active.png
│   │   ├── tab-browse.png
│   │   ├── tab-browse-active.png
│   │   ├── tab-favorites.png
│   │   ├── tab-favorites-active.png
│   │   ├── tab-cart.png
│   │   ├── tab-cart-active.png
│   │   ├── tab-profile.png
│   │   └── tab-profile-active.png
│   └── ui/
│       ├── fern-expand.png
│       ├── fern-collapse.png
│       ├── vine-arrow-right.png
│       ├── vine-back-arrow.png
│       ├── button-wreath.png
│       ├── progress-vine-segment.png
│       └── progress-vine-segment-inactive.png
├── empty-states/
│   ├── empty-state-botanical.png
│   ├── empty-cart.png
│   ├── empty-favorites.png
│   └── empty-search.png
├── logo/
│   ├── logo-full.png
│   ├── logo-mark.png
│   └── logo-mark-cream.png
├── splash/
│   └── splash-bloom-elements.png
├── about/
│   ├── cartouche-frame.png
│   ├── drop-cap-A.png
│   └── divider-fallen-log.png
├── blog/
│   └── blog-pull-quote-frame.png
├── checkout/
│   ├── checkout-garland.png
│   ├── fern-border-vertical.png
│   └── parcel-illustration.png
└── faq/
    └── faq-contact-border.png
```

### Web (Shopify / Marketing Site)

The web folder mirrors mobile but with key differences: no tab icons or splash, and headers/dividers are exported at wider dimensions for desktop viewports.

```
assets/web/
├── headers/
│   ├── botanical-header-large.png      ← 2880×800  (wider than mobile)
│   ├── botanical-header-small.png      ← 2880×480
│   ├── botanical-header-blog.png       ← 2880×640
│   └── botanical-header-faq.png        ← 2880×540
├── dividers/
│   ├── divider-fern-mushroom.png       ← 2880×96   (wider than mobile)
│   ├── divider-wildflower.png          ← 2880×96
│   ├── divider-vine-trail.png          ← 2880×96
│   ├── divider-mushroom-cluster.png    ← 2880×96
│   └── divider-fern-spiral.png         ← 2880×96
├── corners/
│   ├── card-corner-topleft.png         ← same as mobile
│   └── card-corner-bottomright.png
├── icons/
│   └── categories/                     ← same as mobile (no tabs folder)
│       ├── icon-mushroom.png
│       ├── icon-vine.png
│       ├── icon-crystal.png
│       ├── icon-wildflower.png
│       ├── icon-fern.png
│       ├── icon-sunburst.png
│       ├── icon-vines-circle.png
│       └── icon-seedling.png
├── ui/
│   ├── fern-expand.png                 ← same as mobile
│   ├── fern-collapse.png
│   ├── button-wreath.png
│   ├── parcel-illustration.png
│   ├── progress-vine-segment.png
│   └── progress-vine-segment-inactive.png
├── empty-states/                       ← same as mobile
│   ├── empty-state-botanical.png
│   ├── empty-cart.png
│   ├── empty-favorites.png
│   └── empty-search.png
├── logo/                               ← same as mobile
│   ├── logo-full.png
│   ├── logo-mark.png
│   └── logo-mark-cream.png
├── about/                              ← same as mobile
│   ├── cartouche-frame.png
│   ├── drop-cap-A.png
│   └── divider-fallen-log.png
├── blog/
│   └── blog-pull-quote-frame.png
├── checkout/
│   ├── checkout-garland.png
│   ├── fern-border-vertical.png
│   └── parcel-illustration.png
└── faq/
    └── faq-contact-border.png
```

> **Shortcut:** For all shared assets (icons, corners, empty states, UI elements, screen-specific, logo), just copy the mobile exports into the web folder. They're already high-resolution enough. You only need to re-export headers and dividers at the wider web dimensions.

Since you're exporting at the pixel dimensions already (@3x equivalent for mobile), React Native will use them directly. For web, the @2x retina dimensions ensure crisp rendering on high-DPI desktop and laptop screens.

---

## Web Exports — Headers & Dividers at Desktop Width

For web, you need wider versions of headers and dividers. You have two options:

### Option A: Scale Up the Mobile Generation (Quick & Easy)

If your mobile header generation looks good and has enough detail:
1. In Figma, create the web-sized frame (e.g., 2880×800 for `botanical-header-large`)
2. Paste the same generated image you used for mobile
3. Scale it up to fill the wider frame — Figma will stretch it proportionally
4. If it looks soft or pixelated, use Option B instead

This works well for **dividers** (since they're simple and thin) but may look soft for **headers** (since you're scaling a 1170px image up to 2880px).

### Option B: Regenerate at Higher Resolution (Best Quality)

Use the exact same Weavy prompts from the guide, but generate at a higher resolution:

**For web headers:**
- Use Weavy Image Size: `Landscape 16 9` (same as mobile)
- If Weavy's output is large enough (1920px+ wide), it will scale cleanly to 2880px in Figma
- If Weavy's output is too small, try generating with `Square HD` and cropping the top/bottom in Figma to get a wider landscape from a higher-res source

**For web dividers:**
- The mobile generation at Landscape 16:9 is usually wide enough — just create the wider 2880×96 frame in Figma and center/stretch the botanical elements
- Dividers are thin and simple, so slight upscaling looks fine

### Web-Specific Figma Frames to Create

Add these to your Figma file alongside the mobile frames:

| Frame Name | Width | Height |
|---|---|---|
| `botanical-header-large-web` | 2880 | 800 |
| `botanical-header-small-web` | 2880 | 480 |
| `botanical-header-blog-web` | 2880 | 640 |
| `botanical-header-faq-web` | 2880 | 540 |
| `divider-fern-mushroom-web` | 2880 | 96 |
| `divider-wildflower-web` | 2880 | 96 |
| `divider-vine-trail-web` | 2880 | 96 |
| `divider-mushroom-cluster-web` | 2880 | 96 |
| `divider-fern-spiral-web` | 2880 | 96 |

---

## Checklist — Track Your Progress

### Priority 1 — Home Screen (do these first)
- [ ] `botanical-header-large.png`
- [ ] `divider-fern-mushroom.png`
- [ ] `icon-mushroom.png`
- [ ] `icon-vine.png`
- [ ] `icon-crystal.png`
- [ ] `icon-wildflower.png`
- [ ] `icon-fern.png`
- [ ] `card-corner-topleft.png`
- [ ] `card-corner-bottomright.png`
- [ ] `tab-home.png` + `tab-home-active.png`
- [ ] `tab-browse.png` + `tab-browse-active.png`
- [ ] `tab-favorites.png` + `tab-favorites-active.png`
- [ ] `tab-cart.png` + `tab-cart-active.png`
- [ ] `tab-profile.png` + `tab-profile-active.png`

### Priority 2 — More Headers & Dividers
- [ ] `botanical-header-small.png`
- [ ] `botanical-header-blog.png`
- [ ] `botanical-header-faq.png`
- [ ] `divider-wildflower.png`
- [ ] `divider-vine-trail.png`
- [ ] `divider-mushroom-cluster.png`
- [ ] `divider-fern-spiral.png`

### Priority 3 — UI Elements
- [ ] `fern-expand.png`
- [ ] `fern-collapse.png`
- [ ] `vine-arrow-right.png`
- [ ] `vine-back-arrow.png`
- [ ] `parcel-illustration.png`
- [ ] `button-wreath.png`
- [ ] `progress-vine-segment.png` + `progress-vine-segment-inactive.png`

### Priority 4 — Empty States
- [ ] `empty-state-botanical.png`
- [ ] `empty-cart.png`
- [ ] `empty-favorites.png`
- [ ] `empty-search.png`

### Priority 5 — Screen-Specific
- [ ] `checkout-garland.png`
- [ ] `fern-border-vertical.png`
- [ ] `cartouche-frame.png`
- [ ] `drop-cap-A.png`
- [ ] `divider-fallen-log.png`
- [ ] `blog-pull-quote-frame.png`
- [ ] `faq-contact-border.png`

### Priority 6 — Splash & Brand Pillars
- [ ] `splash-bloom-elements.png` 📱
- [ ] `icon-sunburst.png` 📱🖥️
- [ ] `icon-vines-circle.png` 📱🖥️
- [ ] `icon-seedling.png` 📱🖥️

### Priority 8 — Web Exports (do after mobile assets are complete)
- [ ] `botanical-header-large-web.png` 🖥️
- [ ] `botanical-header-small-web.png` 🖥️
- [ ] `botanical-header-blog-web.png` 🖥️
- [ ] `botanical-header-faq-web.png` 🖥️
- [ ] `divider-fern-mushroom-web.png` 🖥️
- [ ] `divider-wildflower-web.png` 🖥️
- [ ] `divider-vine-trail-web.png` 🖥️
- [ ] `divider-mushroom-cluster-web.png` 🖥️
- [ ] `divider-fern-spiral-web.png` 🖥️
- [ ] Copy all shared assets (icons, corners, UI, empty states, screen-specific, logo) from mobile exports into `assets/web/`

### Priority 7 — Logo (you may already have these from earlier)

If you already generated your Wildenflower logo in earlier sessions, you can skip these and just export what you have at the correct sizes through Figma. If you need to generate fresh:

**`logo-full.png`:**
**Used on:** About screen hero, marketing materials — full logo with circular mark and "Wildenflower" wordmark below.
```
[STYLE ANCHOR] A circular emblem containing a mushroom, a wildflower, and a fern frond arranged harmoniously within the circle. Below the circular emblem, the word "Wildenflower" in an elegant decorative serif font. The emblem and text are rendered in deep earth brown (#3B2F2F) ink with subtle watercolor accents in terracotta and sage green. Centered composition on the parchment background. Logo design quality — clean, balanced, and iconic.
```
- **Weavy Image Size:** `Square`
- **Post-process:** remove.bg → Figma frame `logo-full` (600×600) → export

**`logo-mark.png`:**
**Used on:** Nav bar, tab bar center, app icon, favicon — compact circular mark without the wordmark. Shows up anywhere space is tight.
```
[STYLE ANCHOR] A circular emblem containing a mushroom, a wildflower, and a fern frond arranged harmoniously within the circle. No text, no words — just the circular mark by itself. Rendered in deep earth brown (#3B2F2F) ink with subtle watercolor accents in terracotta and sage green. Centered on the parchment background. Clean, balanced, iconic.
```
- **Weavy Image Size:** `Square`
- **Post-process:** remove.bg → Figma frame `logo-mark` (300×300) → export

**`logo-mark-cream.png`:**
**Used on:** Dark background sections (forest green footer, dark hero overlays) — same mark but in cream/parchment for visibility on dark surfaces.
- **Don't regenerate.** Duplicate the `logo-mark` frame in Figma.
- Invert or recolor the image to cream/parchment tones (#F5EDD6) for use on dark backgrounds (forest green sections).
- In Figma: select the image → add a fill layer on top set to parchment cream (#F5EDD6) with blend mode **Color** → export as `logo-mark-cream`.

- [ ] `logo-full.png`
- [ ] `logo-mark.png`
- [ ] `logo-mark-cream.png`

---

## Tips

**1. Generate 2-3 variations of each and pick the best.** Flux produces different results each time. Don't settle for the first output.

**2. Test icons at real phone size.** In Figma, create a 390×844 frame (iPhone 14) and place your icons at their actual display size (24pt for tab icons, 72pt for category icons). If they're illegible, simplify.

**3. Test headers at desktop width too.** Create a 1440×900 frame in Figma and place your web headers at full width. Make sure the botanical elements don't look sparse or stretched at that scale.

**4. Headers don't need background removal.** The parchment background in the generation matches the app background (#F5EDD6). Just drop them straight into the sized frame. This applies to both mobile and web.

**5. For frames with empty centers** (cartouche, pull quote frame, FAQ border), make sure remove.bg strips the background from the center too. If it doesn't, use Figma's pen tool to manually cut out the center area.

**6. Color consistency.** If a generated asset's colors feel slightly off, select the image in Figma → adjust with the image settings (Exposure, Saturation, Temperature, Tint) in the right sidebar. Small adjustments go a long way.

**7. You can also extract from your existing mockups.** If there's a botanical element in your Weavy mockups that you love, import the mockup into Figma, use the Slice tool (press S) to draw a rectangle around that specific element, and export it. This works great for headers especially.

**8. Do mobile first, web second.** Complete all mobile assets first — that's your app launch priority. Web exports for headers and dividers can come later since most assets are shared. When you're ready for web, you'll already have 90% of the assets done.