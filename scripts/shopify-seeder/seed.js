import 'dotenv/config';
import { faker } from '@faker-js/faker';

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
const API_VERSION = '2024-01';

if (!SHOPIFY_DOMAIN || !CLIENT_ID || !CLIENT_SECRET) {
    console.error("❌ Missing required environment variables: SHOPIFY_STORE_DOMAIN, SHOPIFY_CLIENT_ID, or SHOPIFY_CLIENT_SECRET.");
    console.error("Please create a .env file or export these variables.");
    process.exit(1);
}

const GRAPHQL_URL = `https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/graphql.json`;
let ACCESS_TOKEN = null;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getAccessToken() {
    if (ACCESS_TOKEN) return ACCESS_TOKEN;

    console.log("🔐 Authenticating with Shopify via Client Credentials Grant...");
    const url = `https://${SHOPIFY_DOMAIN}/admin/oauth/access_token`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'client_credentials'
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error(`❌ Failed to fetch access token: HTTP ${response.status} - ${errText}`);
        process.exit(1);
    }

    const data = await response.json();
    ACCESS_TOKEN = data.access_token;
    console.log("✅ Successfully authenticated!");
    return ACCESS_TOKEN;
}

async function shopifyGraphQL(query, variables = {}, retries = 5, backoff = 1000) {
    try {
        const token = await getAccessToken();

        const response = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': token
            },
            body: JSON.stringify({ query, variables })
        });

        // Handle standard 429 Too Many Requests
        if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            const waitTime = retryAfter ? parseFloat(retryAfter) * 1000 : backoff;
            console.warn(`⏳ Rate limited (429 HTTP). Waiting ${waitTime}ms...`);
            await sleep(waitTime);
            return shopifyGraphQL(query, variables, retries - 1, backoff * 2);
        }

        const json = await response.json();

        // Check for GraphQL throttle errors
        if (json.errors) {
            let isThrottled = false;
            let errorMessage = JSON.stringify(json.errors);

            if (Array.isArray(json.errors)) {
                isThrottled = json.errors.some(e => e?.extensions?.code === 'THROTTLED');
            } else if (typeof json.errors === 'string') {
                isThrottled = json.errors.includes('THROTTLED');
                errorMessage = json.errors;
            }

            if (isThrottled && retries > 0) {
                console.warn(`⏳ GraphQL Throttled. Waiting ${backoff}ms...`);
                await sleep(backoff);
                return shopifyGraphQL(query, variables, retries - 1, backoff * 2);
            }
            throw new Error(`GraphQL Error: ${errorMessage}\nFull Response: ${JSON.stringify(json)}`);
        }

        // Shopify leaky bucket cost mechanism
        if (json.extensions && json.extensions.cost) {
            const { throttleStatus } = json.extensions.cost;
            if (throttleStatus && throttleStatus.currentlyAvailable < 150) {
                console.log(`[RateLimit] Leaky bucket low (${throttleStatus.currentlyAvailable}). Preemptive sleep...`);
                await sleep(1500);
            }
        }

        return json.data;
    } catch (error) {
        if (retries > 0) {
            console.warn(`⚠️ Network err: ${error.message}. Retrying in ${backoff}ms...`);
            await sleep(backoff);
            return shopifyGraphQL(query, variables, retries - 1, backoff * 2);
        }
        throw error;
    }
}

// Product Themes
const THEMES = [
    'Handmade Artwork',
    'Custom Jewelry',
    'Crafted Leatherwork',
    'Tie-Dye Apparel'
];

async function main() {
    console.log(`🚀 Starting Shopify Test Data Seeder on ${SHOPIFY_DOMAIN}...`);

    // 1. Fetch Primary Location for Inventory updates
    console.log("Fetching primary location for inventory updates...");
    const locationData = await shopifyGraphQL(`
        query {
            locations(first: 1) {
                edges { node { id } }
            }
        }
    `);
    const locationId = locationData?.locations?.edges[0]?.node?.id;
    if (!locationId) {
        console.error("❌ Could not find a primary location on this store.");
        process.exit(1);
    }
    console.log(`✅ Using Location: ${locationId}`);

    // 2. Fetch all products (pagination)
    let hasNextPage = true;
    let cursor = null;
    let totalProcessed = 0;

    const GET_PRODUCTS_QUERY = `
        query getProducts($cursor: String) {
            products(first: 10, after: $cursor) {
                pageInfo { hasNextPage endCursor }
                edges {
                    node {
                        id
                        title
                        status
                        options { id name values }
                        variants(first: 10) {
                            edges {
                                node { id title inventoryItem { id } }
                            }
                        }
                    }
                }
            }
        }
    `;

    while (hasNextPage) {
        console.log(`\n📦 Fetching batch of products... cursor: ${cursor || 'start'}`);
        const data = await shopifyGraphQL(GET_PRODUCTS_QUERY, { cursor });
        const edges = data.products.edges;

        for (const edge of edges) {
            await processProduct(edge.node, locationId);
            totalProcessed++;
        }

        hasNextPage = data.products.pageInfo.hasNextPage;
        cursor = data.products.pageInfo.endCursor;
    }

    console.log(`\n🎉 Finished processing ${totalProcessed} products!`);
}

async function processProduct(product, locationId) {
    console.log(`\n--- Processing Product: ${product.title} (${product.id}) ---`);

    const selectedTheme = faker.helpers.arrayElement(THEMES);
    const descriptionHtml = `
      <h2>${selectedTheme} Collection</h2>
      <p>${faker.lorem.paragraphs(2, '</p><p>')}</p>
      <ul>
        <li>${faker.commerce.productAdjective()} Design</li>
        <li>${faker.commerce.productMaterial()} Material</li>
        <li>${faker.word.adjective()} Quality</li>
      </ul>
      <p><em>${faker.company.catchPhrase()}</em></p>
    `;

    // A. Update Product Status & Description
    let newStatus = product.status;
    if (product.status === 'DRAFT' || product.status === 'ARCHIVED') {
        newStatus = 'ACTIVE';
    }

    console.log(`📝 Updating status to ${newStatus} and injecting rich description...`);

    let updateInput = {
        id: product.id,
        status: newStatus,
        descriptionHtml: descriptionHtml
    };

    const UPDATE_PROD_QUERY = `
        mutation productUpdate($input: ProductInput!) {
            productUpdate(input: $input) {
                userErrors { field message }
            }
        }
    `;
    const prodRes = await shopifyGraphQL(UPDATE_PROD_QUERY, { input: updateInput });
    if (prodRes?.productUpdate?.userErrors?.length > 0) {
        console.error(`❌ Error updating product details:`, prodRes.productUpdate.userErrors);
    }

    // C. Update prices and inventory for existing variants
    console.log(`💰 Updating pricing and stock for existing variants...`);
    const variants = product.variants.edges.map(e => e.node);

    let inventoryChanges = [];
    const variantUpdates = variants.map(v => {
        const qty = faker.number.int({ min: 5, max: 100 });
        if (v.inventoryItem) {
            inventoryChanges.push({
                inventoryItemId: v.inventoryItem.id,
                locationId: locationId,
                quantity: qty
            });
        }
        return {
            id: v.id,
            price: faker.commerce.price({ min: 10, max: 200, dec: 2 })
        };
    });

    if (variantUpdates.length > 0) {
        const resPrice = await shopifyGraphQL(`
            mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
                productVariantsBulkUpdate(productId: $productId, variants: $variants) {
                    userErrors { field message }
                }
            }
        `, {
            productId: product.id,
            variants: variantUpdates
        });
        if (resPrice?.productVariantsBulkUpdate?.userErrors?.length > 0) {
            console.error(`❌ Error updating variant prices:`, resPrice.productVariantsBulkUpdate.userErrors);
        }
    }

    // Batch Inventory Updates
    if (inventoryChanges.length > 0) {
        const resInv = await shopifyGraphQL(`
            mutation inventorySetQuantities($input: InventorySetQuantitiesInput!) {
                inventorySetQuantities(input: $input) {
                    userErrors { field message }
                }
            }
        `, {
            input: {
                name: "available",
                reason: "correction",
                ignoreCompareQuantity: true,
                quantities: inventoryChanges
            }
        });
        if (resInv?.inventorySetQuantities?.userErrors?.length > 0) {
            console.error(`❌ Error updating inventory quantities:`, resInv.inventorySetQuantities.userErrors);
        }
    }

    // D. Append 3-4 random placeholder images
    console.log(`🖼️ Injecting 3-4 random placeholder images...`);
    const numImages = faker.number.int({ min: 3, max: 4 });
    const mediaInputs = Array.from({ length: numImages }).map(() => ({
        mediaContentType: "IMAGE",
        // We use picsum.photos for reliable placeholder images. 
        // Generating a random seed prevents caching identical images.
        originalSource: `https://picsum.photos/800/800?random=${faker.number.int({ min: 1, max: 100000 })}`
    }));

    const mediaRes = await shopifyGraphQL(`
         mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
             productCreateMedia(productId: $productId, media: $media) {
                 userErrors { field message }
             }
         }
    `, {
        productId: product.id,
        media: mediaInputs
    });

    if (mediaRes?.productCreateMedia?.userErrors?.length > 0) {
        console.error(`❌ Error adding media:`, mediaRes.productCreateMedia.userErrors);
    } else {
        console.log(`✅ Media successfully added.`);
    }

    console.log(`✨ Product processing complete.`);
}

main().catch(err => {
    console.error("Fatal Error:", err);
    process.exit(1);
});
