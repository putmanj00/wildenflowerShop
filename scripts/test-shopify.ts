// scripts/test-shopify.ts
// Smoke test for the Shopify service layer.
// Run with: npx tsx scripts/test-shopify.ts
//
// Purpose: Verify credentials, data shapes, and collection handle alignment.
// Keep this script permanently — it's useful for onboarding and env var debugging.

// Load .env.local BEFORE any imports that read process.env
// (Metro bundler inlines EXPO_PUBLIC_ vars; Node does not — dotenv bridges the gap)
import { config } from 'dotenv';
config({ path: '.env.local' });

// Import service functions AFTER dotenv loads env vars
import { getProducts, getProductByHandle, getCollections, searchProducts } from '../lib/shopify-client';

// The category handles the Wildenflower app uses for Browse screen filtering.
// These must exist as collection handles in Shopify — update this list as the app evolves.
const APP_EXPECTED_HANDLES = ['earth', 'woven', 'light', 'crafted'];

async function main() {
  console.log('='.repeat(60));
  console.log('Wildenflower — Shopify Service Layer Smoke Test');
  console.log('='.repeat(60));
  console.log('');

  // ── 1. getProducts ──────────────────────────────────────────
  console.log('1. getProducts({ first: 3 })');
  console.log('-'.repeat(40));
  try {
    const result = await getProducts({ first: 3 });
    console.log(`  Total returned: ${result.items.length}`);
    console.log(`  hasNextPage: ${result.pageInfo.hasNextPage}`);
    if (result.items.length > 0) {
      const p = result.items[0];
      console.log('  First product:');
      console.log(`    id:      ${p.id}`);
      console.log(`    title:   ${p.title}`);
      console.log(`    handle:  ${p.handle}`);
      console.log(`    vendor:  ${p.vendor}`);
      console.log(`    price:   ${p.priceRange.minVariantPrice.amount} ${p.priceRange.minVariantPrice.currencyCode}`);
      console.log(`    images:  ${p.images.length} image(s)`);
      console.log(`    variants: ${p.variants.length} variant(s)`);
    } else {
      console.warn('  WARNING: No products returned. Check store has published products.');
    }
  } catch (err) {
    console.error('  ERROR:', err);
  }
  console.log('');

  // ── 2. getProductByHandle ───────────────────────────────────
  console.log('2. getProductByHandle (first product handle from above)');
  console.log('-'.repeat(40));
  try {
    const listResult = await getProducts({ first: 1 });
    if (listResult.items.length > 0) {
      const handle = listResult.items[0].handle;
      const product = await getProductByHandle(handle);
      console.log(`  Handle tested: "${handle}"`);
      console.log(`  Found: ${product ? 'YES' : 'NO — null returned'}`);
      if (product) {
        console.log(`  descriptionHtml present: ${!!product.descriptionHtml}`);
        console.log(`  tags: [${product.tags.join(', ')}]`);
      }
    } else {
      console.warn('  SKIPPED — no products available to test handle lookup');
    }
  } catch (err) {
    console.error('  ERROR:', err);
  }
  console.log('');

  // ── 3. getCollections ───────────────────────────────────────
  console.log('3. getCollections({ first: 20 }) — handle alignment check');
  console.log('-'.repeat(40));
  let shopifyHandles: string[] = [];
  try {
    const result = await getCollections({ first: 20 });
    shopifyHandles = result.items.map((c) => c.handle);
    console.log(`  Total collections: ${result.items.length}`);
    console.log(`  Available handles in Shopify:`);
    result.items.forEach((c) => console.log(`    - ${c.handle}  ("${c.title}")`));
    console.log('');
    console.log(`  App expects these handles: [${APP_EXPECTED_HANDLES.join(', ')}]`);
    const mismatches = APP_EXPECTED_HANDLES.filter((h) => !shopifyHandles.includes(h));
    const extras = shopifyHandles.filter((h) => !APP_EXPECTED_HANDLES.includes(h));
    if (mismatches.length === 0) {
      console.log('  HANDLE CHECK: PASS — all expected handles exist in Shopify');
    } else {
      console.warn(`  HANDLE CHECK: FAIL — missing from Shopify: [${mismatches.join(', ')}]`);
      console.warn('  ACTION REQUIRED: Either add these collections to Shopify or update APP_EXPECTED_HANDLES');
      console.warn('  Document mismatches in STATE.md as a blocker before Phase 5 screen work begins.');
    }
    if (extras.length > 0) {
      console.log(`  Extra Shopify handles not in app expectations: [${extras.join(', ')}]`);
    }
  } catch (err) {
    console.error('  ERROR:', err);
  }
  console.log('');

  // ── 4. searchProducts ───────────────────────────────────────
  console.log('4. searchProducts("handmade", { first: 3 })');
  console.log('-'.repeat(40));
  try {
    const result = await searchProducts('handmade', { first: 3 });
    console.log(`  Total matching: ${result.totalCount}`);
    console.log(`  Returned: ${result.items.length}`);
    if (result.items.length > 0) {
      console.log('  First result:');
      console.log(`    title:  ${result.items[0].title}`);
      console.log(`    handle: ${result.items[0].handle}`);
      console.log(`    vendor: ${result.items[0].vendor}`);
    } else {
      console.warn('  No results for "handmade" — try a different test query for your store');
    }
  } catch (err) {
    console.error('  ERROR:', err);
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('Smoke test complete.');
  console.log('Run again anytime: npx tsx scripts/test-shopify.ts');
  console.log('='.repeat(60));
}

main().catch((err) => {
  console.error('Smoke test failed with unhandled error:', err);
  process.exit(1);
});
