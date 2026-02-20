# Phase 2: Shopify Service Layer - Research

**Researched:** 2026-02-20
**Domain:** Shopify Storefront API (GraphQL), Expo environment variables, TypeScript service architecture
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Error Handling Contract
- Service functions **throw** on failure — callers (screens/hooks) catch and handle
- Errors wrapped in a **custom `ShopifyError` class** with context: which query failed, HTTP status code, store domain
- Service layer **logs errors before re-throwing** (useful during development)
- GraphQL `errors` array in a 200 response → treated as a failure, **throw as ShopifyError** (same path as network errors)

#### Data Transformation
- Service functions return **transformed app types**, not raw Shopify GraphQL shapes
- Types in `types/shopify.ts` are the raw Shopify API types; transformed types may live elsewhere as needed
- **New shapes are acceptable** — no requirement to mirror the existing mock data shapes in `data/mock-data.ts`
- **Flatten connection wrappers only** — remove `edges[].node` boilerplate, but keep variant and image objects structured (don't collapse to primitive arrays)
- Transformation functions live in a **separate `lib/shopify-mappers.ts`** file (separate from fetching concerns)

#### GraphQL Organization
- All GraphQL query strings in a **separate `lib/shopify-queries.ts`** file, imported by the client
- Use **GraphQL fragments** for shared fields (e.g., `ProductFragment`, `ImageFragment`) to reduce repetition
- **Minimal field sets** — fetch only fields currently used by screens; expand later when screens need more
- **Pagination supported from the start**: query functions accept `{ first?: number; after?: string }` params and return `pageInfo` (hasNextPage, endCursor)

#### Smoke Test Approach
- Smoke test lives in **`scripts/test-shopify.ts`** — run from terminal with `npx ts-node scripts/test-shopify.ts`
- **Verbose output**: prints the first result from each service function call so data shape can be visually verified
- **Explicit handle check**: script lists available Shopify collection handles alongside the app's expected category handles — easy to spot mismatches
- **Kept permanently** as a unit smoke test in the repo (useful for onboarding and future env var verification)

### Claude's Discretion
- Exact ShopifyError class structure (fields, message format)
- How to run `scripts/test-shopify.ts` given Expo's module resolution (ts-node config, babel-register, etc.)
- Whether to split `lib/shopify-client.ts` into multiple files if it grows large
- Exact default value for `first` param in paginated queries

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SHOP-01 | App reads Shopify credentials from `EXPO_PUBLIC_` environment variables configured in `app.json` extra | EXPO_PUBLIC_ env var pattern documented; .env.local + process.env.EXPO_PUBLIC_* is the correct approach for Expo SDK 52 |
| SHOP-02 | TypeScript types for all Shopify API shapes exist in `types/shopify.ts` (ShopifyProduct, ShopifyCart, ShopifyCollection, etc.) | All required Shopify API object shapes documented from official API reference |
| SHOP-03 | Product catalog fetched from Shopify Storefront API (getProducts, getProductByHandle) | `products` and `product(handle:)` queries documented with full field lists |
| SHOP-04 | Collections fetched from Shopify Storefront API (getCollections, getCollectionByHandle) | `collections` and `collection(handle:)` queries documented |
| SHOP-05 | Product search executes via Shopify Search API | `search` query documented; accepts query string, supports types filter, cursor-based pagination |
</phase_requirements>

---

## Summary

Phase 2 wires the Shopify Storefront API into the Wildenflower app: environment variables, an authenticated GraphQL client, TypeScript types, and service functions for products, collections, and search. The Storefront API uses a single GraphQL endpoint at `https://{store}.myshopify.com/api/2026-01/graphql.json` authenticated with a public access token in the `X-Shopify-Storefront-Access-Token` header. No third-party GraphQL client library is needed — native `fetch` with a thin wrapper is the recommended pattern for React Native to avoid SDK compatibility issues.

The Shopify Storefront API is stable and well-documented. The main technical risks are: (1) the `@shopify/storefront-api-client` SDK having React Native compatibility issues with URL APIs — avoided by using plain fetch; (2) Expo environment variables requiring `EXPO_PUBLIC_` prefix accessed via `process.env` static dot notation, not dynamic bracket access; and (3) the smoke test runner needing `tsx` (not `ts-node`) since the Expo tsconfig uses `moduleResolution: "node"` and tsx handles this without extra config.

The architecture is three files: `lib/shopify-client.ts` (fetch wrapper + service functions), `lib/shopify-queries.ts` (GraphQL strings with fragments), and `lib/shopify-mappers.ts` (transformation functions from raw API shapes to app types). Raw API shapes go in `types/shopify.ts`; transformed app-facing shapes can live in `types/shopify.ts` or alongside consumers as they are defined in later phases.

**Primary recommendation:** Use native `fetch` directly (no Shopify SDK) for React Native compatibility; authenticate with `X-Shopify-Storefront-Access-Token` header; read credentials from `process.env.EXPO_PUBLIC_*`; use `npx tsx scripts/test-shopify.ts` for the smoke test.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Native `fetch` | Built-in (RN 0.76+) | HTTP requests to Shopify GraphQL endpoint | No SDK compatibility issues; React Native has built-in fetch; avoids `@shopify/storefront-api-client` URL validation errors in React Native |
| TypeScript | ~5.3.0 (already installed) | Type definitions for all API shapes | Already in project; strict mode already on |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `tsx` (devDep) | latest | Run smoke test script without ts-node/babel config | `npx tsx scripts/test-shopify.ts` — zero-config TypeScript execution for Node.js scripts |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native `fetch` | `@shopify/storefront-api-client` | Official SDK is documented but has React Native URL API compatibility issues (URLSearchParams not implemented). Polyfill exists (`react-native-url-polyfill`) but adds complexity. Resolved Feb 2025, but plain fetch is simpler and more future-proof for React Native. |
| Native `fetch` | Apollo Client | Full GraphQL client with caching, subscriptions. Heavy dependency; far more than needed for a service layer with no real-time requirements. |
| `tsx` | `ts-node` | ts-node requires explicit ESM/CJS configuration with Expo's tsconfig; tsx is zero-config and handles mixed module systems automatically. |
| `tsx` | `babel-node` | Requires Babel config; another dependency. tsx is simpler. |

**Installation (new devDependency only):**
```bash
npm install --save-dev tsx
```

---

## Architecture Patterns

### Recommended Project Structure

```
lib/
├── shopify-client.ts    # fetch wrapper + all service functions (getProducts, etc.)
├── shopify-queries.ts   # all GraphQL query/fragment strings
└── shopify-mappers.ts   # transformation: raw Shopify shapes → app types

types/
└── shopify.ts           # raw Shopify API type definitions (ShopifyProduct, etc.)

scripts/
└── test-shopify.ts      # smoke test — permanent, run with: npx tsx scripts/test-shopify.ts

.env.local               # gitignored — EXPO_PUBLIC_ credentials for local dev
```

### Pattern 1: Environment Variable Access

**What:** `EXPO_PUBLIC_` variables are inlined at bundle time by Expo CLI. Must use static dot notation.
**When to use:** Always, for any public credential accessed in app code.

```typescript
// Source: https://docs.expo.dev/guides/environment-variables/
// CORRECT — static dot notation, inlined at bundle time
const storeDomain = process.env.EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN;
const accessToken = process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

// WRONG — bracket notation is NOT inlined and will be undefined at runtime
const storeDomain = process.env['EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN']; // undefined
const { EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN } = process.env; // undefined
```

**File `.env.local` (gitignored):**
```
EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
EXPO_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-public-token
```

**Note:** The requirement says `app.json` extra — but the Expo team's own migration docs recommend using `EXPO_PUBLIC_` + `process.env` directly (not `Constants.expoConfig.extra`) for SDK 49+. The `EXPO_PUBLIC_` approach gives type safety and simpler access. The `app.json` extra approach requires `expo-constants` and loses TypeScript typing. Both satisfy SHOP-01. Use `EXPO_PUBLIC_` + `process.env`.

### Pattern 2: Minimal GraphQL Fetch Wrapper

**What:** A single reusable function that sends authenticated GraphQL requests and throws `ShopifyError` on any failure.
**When to use:** Called by every service function.

```typescript
// Source: Shopify official docs + verified patterns
// lib/shopify-client.ts

const SHOPIFY_ENDPOINT = `https://${process.env.EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2026-01/graphql.json`;
const SHOPIFY_TOKEN = process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; locations?: unknown; path?: unknown }>;
}

async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const response = await fetch(SHOPIFY_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN ?? '',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    console.error(`[Shopify] HTTP ${response.status} on query`);
    throw new ShopifyError(`HTTP ${response.status}`, response.status);
  }

  const json: GraphQLResponse<T> = await response.json();

  // GraphQL errors in a 200 response = treated as failure
  if (json.errors && json.errors.length > 0) {
    const message = json.errors.map(e => e.message).join('; ');
    console.error(`[Shopify] GraphQL error: ${message}`);
    throw new ShopifyError(message, 200);
  }

  return json.data as T;
}
```

### Pattern 3: GraphQL Fragments for Reuse

**What:** Define shared field sets once; compose into queries.
**When to use:** Any field set used in multiple queries (e.g., product images, variants, price).

```typescript
// Source: Shopify official docs pattern
// lib/shopify-queries.ts

export const IMAGE_FRAGMENT = `
  fragment ImageFragment on Image {
    url
    altText
    width
    height
  }
`;

export const MONEY_FRAGMENT = `
  fragment MoneyFragment on MoneyV2 {
    amount
    currencyCode
  }
`;

export const PRODUCT_VARIANT_FRAGMENT = `
  fragment ProductVariantFragment on ProductVariant {
    id
    title
    availableForSale
    price { ...MoneyFragment }
    compareAtPrice { ...MoneyFragment }
    selectedOptions { name value }
    image { ...ImageFragment }
  }
  ${MONEY_FRAGMENT}
  ${IMAGE_FRAGMENT}
`;

export const PRODUCT_FRAGMENT = `
  fragment ProductFragment on Product {
    id
    title
    handle
    description
    vendor
    productType
    tags
    availableForSale
    featuredImage { ...ImageFragment }
    images(first: 10) {
      nodes { ...ImageFragment }
    }
    priceRange {
      minVariantPrice { ...MoneyFragment }
      maxVariantPrice { ...MoneyFragment }
    }
    variants(first: 20) {
      nodes { ...ProductVariantFragment }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
`;
```

### Pattern 4: Pagination Parameters

**What:** All list-returning service functions accept optional pagination params and return `pageInfo`.
**When to use:** `getProducts`, `getCollections`, `searchProducts`, and `getCollectionByHandle` (for products within a collection).

```typescript
// Source: Shopify Storefront API docs (paginating-results-with-graphql)
interface PaginationParams {
  first?: number;   // default: 20 (choose during implementation)
  after?: string;   // cursor from previous pageInfo.endCursor
}

interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

// Query pattern:
export const GET_PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      nodes { ...ProductFragment }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`;
```

### Pattern 5: Mapper Functions (Separate File)

**What:** Pure functions that convert raw Shopify API shapes to app-friendly types.
**When to use:** Called at the boundary between `shopifyFetch` and service function return values.

```typescript
// lib/shopify-mappers.ts
// Flatten edges[].node / nodes[] — keep nested objects structured
function mapProduct(raw: ShopifyProduct): AppProduct {
  return {
    id: raw.id,
    title: raw.title,
    handle: raw.handle,
    description: raw.description,
    vendor: raw.vendor,
    images: raw.images.nodes,            // keep as ImageObject[], not string[]
    featuredImage: raw.featuredImage,
    priceRange: raw.priceRange,
    variants: raw.variants.nodes,        // keep as VariantObject[], not flat
    availableForSale: raw.availableForSale,
  };
}
```

### Pattern 6: Smoke Test Script

**What:** A Node.js TypeScript script that calls every service function and prints results.
**When to use:** After Phase 2 is implemented; run once to verify credentials and data shapes.

```typescript
// scripts/test-shopify.ts
// Run with: npx tsx scripts/test-shopify.ts

// Manually load .env.local since we're outside Expo bundler
import { config } from 'dotenv'; // OR manually set process.env before running

async function main() {
  console.log('Testing Shopify connection...\n');

  const products = await getProducts({ first: 3 });
  console.log('getProducts — first result:');
  console.log(JSON.stringify(products.items[0], null, 2));

  const collections = await getCollections({ first: 20 });
  console.log('\ngetCollections — available handles:');
  collections.items.forEach(c => console.log(' -', c.handle));

  // Handle validation
  const APP_EXPECTED_HANDLES = ['earth', 'woven', 'light', 'crafted'];
  const shopifyHandles = collections.items.map(c => c.handle);
  console.log('\nApp expects handles:', APP_EXPECTED_HANDLES);
  console.log('Shopify has handles:', shopifyHandles);
  const mismatches = APP_EXPECTED_HANDLES.filter(h => !shopifyHandles.includes(h));
  if (mismatches.length > 0) {
    console.warn('MISMATCH — these handles are missing from Shopify:', mismatches);
  } else {
    console.log('All expected handles found in Shopify.');
  }

  const searchResults = await searchProducts('ceramic', { first: 3 });
  console.log('\nsearchProducts("ceramic") — first result:');
  console.log(JSON.stringify(searchResults.items[0], null, 2));
}

main().catch(console.error);
```

**Note on env loading for smoke test:** The smoke test runs outside the Expo bundler, so `EXPO_PUBLIC_` variables won't be auto-loaded from `.env.local`. Two options:
1. Install `dotenv` as devDep and call `config({ path: '.env.local' })` at top of script (recommended — matches the variable names exactly)
2. Pass vars inline: `EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN=x npx tsx scripts/test-shopify.ts`

`dotenv` is simpler for a permanent smoke test. Install as devDep: `npm install --save-dev dotenv`.

### Anti-Patterns to Avoid

- **Using `@shopify/storefront-api-client` in React Native without polyfill:** Will throw "URL is not implemented" error because the SDK uses the browser `URL` constructor internally. Use plain fetch instead.
- **Bracket notation for env vars:** `process.env['EXPO_PUBLIC_X']` is NOT inlined by Expo's Metro bundler and returns `undefined` at runtime.
- **Destructuring env vars:** `const { EXPO_PUBLIC_X } = process.env` also returns `undefined`.
- **Using `edges[].node` in production code:** Flatten these in mappers; screens should never see the GraphQL connection wrapper shape.
- **Fetching all product fields on every query:** Shopify Storefront API has query complexity limits. Only fetch fields currently needed.
- **ts-node for the smoke test:** Expo's tsconfig base sets `"moduleResolution": "node"` with no `"module"` key, making ts-node require extra config. Use `tsx` instead.
- **Storing the Storefront access token as a secret:** The public Storefront access token is designed to be client-facing and visible in bundles. Do NOT use the private Storefront token in the app.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Running TS scripts in Node | Custom babel/ts config for smoke test | `npx tsx` | Zero-config; handles Expo's tsconfig without modification |
| .env loading in scripts | Manual env file parsing | `dotenv` (devDep) | Handles edge cases (quotes, comments, multi-line values) correctly |
| GraphQL error detection | Custom response parsing | Standard pattern: check `json.errors` array on every response | Shopify sends GraphQL errors in 200 responses; this is always required |
| Pagination | Custom offset-based pagination | Shopify's cursor-based `after`/`endCursor` pattern | Shopify only supports cursor-based pagination; offset not available |

**Key insight:** The Shopify Storefront API is well-defined and stable. The only "hand-rolling" needed is the thin fetch wrapper — everything else is declarative GraphQL queries and pure transformation functions.

---

## Common Pitfalls

### Pitfall 1: EXPO_PUBLIC_ Variables Return undefined at Runtime

**What goes wrong:** Environment variables are `undefined` when accessed, causing silent failures in the client.
**Why it happens:** Expo inlines `EXPO_PUBLIC_` variables at bundle time using static analysis. Bracket notation or destructuring prevents Metro from finding and inlining the reference.
**How to avoid:**
- Always use `process.env.EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN` (dot notation, literal key)
- Add a startup validation: if either env var is undefined/empty, throw immediately with a helpful error message
- In smoke test, load `.env.local` with `dotenv` before calling any service functions
**Warning signs:** API calls return "Unauthorized" or network errors with no domain; console shows `undefined` for the store domain.

### Pitfall 2: GraphQL Errors in 200 Responses Not Detected

**What goes wrong:** Shopify returns HTTP 200 with `{ errors: [...] }` instead of `{ data: ... }`. Code that only checks `response.ok` misses these as errors and tries to use `undefined` data.
**Why it happens:** GraphQL convention — HTTP status only reflects transport-level errors, not query-level errors.
**How to avoid:** Always check `json.errors` after checking `response.ok`. Treat any non-empty `errors` array as a failure and throw `ShopifyError`.
**Warning signs:** Service functions return `undefined` or throw on data access; no explicit error logged.

### Pitfall 3: Shopify Collection Handles May Not Match App Category Handles

**What goes wrong:** The app expects categories with handles `earth`, `woven`, `light`, `crafted` (from mock data), but the actual Shopify store may have collections with different handles.
**Why it happens:** Collection handles in Shopify are generated from titles and can be customized. There is no enforcement that they match the app's expected values.
**How to avoid:** The smoke test explicitly prints both sides — what Shopify returns and what the app expects. Any mismatch must be resolved before screen integration (either update Shopify collection handles or update the app's expected handles).
**Warning signs:** `getCollectionByHandle('earth')` returns null; Browse screen shows no products.

### Pitfall 4: Cursor-Based Pagination Only (No Offset)

**What goes wrong:** Attempting to implement "page 3" style offset pagination or skip N records.
**Why it happens:** Shopify's GraphQL API uses cursor-based (Relay) pagination exclusively. There is no `skip` or `offset` argument.
**How to avoid:** Always use `first` + `after` (cursor from previous `pageInfo.endCursor`) for forward pagination. The smoke test and initial service functions only need `first`; `after` is designed in from the start but used in later phases.
**Warning signs:** Query returns error about invalid argument `offset` or `skip`.

### Pitfall 5: Fragments Must Be Concatenated Into Query String

**What goes wrong:** GraphQL fragment definitions in separate variables cause "Unknown fragment" errors at runtime.
**Why it happens:** When using plain strings (not a tagged template literal with a parser), fragments must be concatenated into the same query string sent to the server.
**How to avoid:** Use template literal concatenation: `query = PRODUCT_QUERY + PRODUCT_FRAGMENT + IMAGE_FRAGMENT + MONEY_FRAGMENT`. Each fragment string must appear exactly once per request.
**Warning signs:** Shopify returns `"Unknown fragment 'ProductFragment'"` in the GraphQL errors array.

### Pitfall 6: Smoke Test Needs dotenv — Expo CLI Won't Inline Vars Outside Bundle

**What goes wrong:** `process.env.EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN` is `undefined` when running `npx tsx scripts/test-shopify.ts` from the terminal.
**Why it happens:** Expo's Metro bundler handles the `EXPO_PUBLIC_` prefix inlining — but only during bundling. A raw Node.js script run via tsx bypasses Metro entirely.
**How to avoid:** Add `import 'dotenv/config'` or `config({ path: '.env.local' })` from `dotenv` at the top of `scripts/test-shopify.ts`. The variable names in `.env.local` should match exactly what Metro would inline (same `EXPO_PUBLIC_` names), so app code and smoke test both work from the same `.env.local` file.
**Warning signs:** Smoke test logs "undefined" for store domain; connection refused or 401 from Shopify.

---

## Code Examples

Verified patterns from official sources:

### Authentication Header Format

```typescript
// Source: https://shopify.dev/docs/api/usage/authentication#access-tokens-for-the-storefront-api
// Public access token (safe to include in client-side/mobile apps)
headers: {
  'Content-Type': 'application/json',
  'X-Shopify-Storefront-Access-Token': publicToken,
}

// API endpoint format
// Source: https://shopify.dev/docs/api/storefront
const endpoint = `https://${storeDomain}/api/2026-01/graphql.json`;
```

### Get Products (Paginated)

```typescript
// Source: https://shopify.dev/docs/api/storefront/2026-01/queries/products
const GET_PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      nodes {
        id
        title
        handle
        description
        vendor
        availableForSale
        featuredImage { url altText width height }
        priceRange {
          minVariantPrice { amount currencyCode }
        }
        variants(first: 20) {
          nodes {
            id
            title
            availableForSale
            price { amount currencyCode }
            selectedOptions { name value }
            image { url altText }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
```

### Get Product by Handle

```typescript
// Source: https://shopify.dev/docs/api/storefront/2026-01/queries/product
const GET_PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      vendor
      productType
      tags
      availableForSale
      featuredImage { url altText width height }
      images(first: 10) {
        nodes { url altText width height }
      }
      priceRange {
        minVariantPrice { amount currencyCode }
        maxVariantPrice { amount currencyCode }
      }
      variants(first: 20) {
        nodes {
          id
          title
          availableForSale
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
          selectedOptions { name value }
          image { url altText }
        }
      }
    }
  }
`;
```

### Get Collections

```typescript
// Source: https://shopify.dev/docs/api/storefront/2026-01/queries/collections
const GET_COLLECTIONS_QUERY = `
  query GetCollections($first: Int!, $after: String) {
    collections(first: $first, after: $after) {
      nodes {
        id
        title
        handle
        description
        image { url altText }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
```

### Get Collection by Handle (with Products)

```typescript
// Source: https://shopify.dev/docs/api/storefront/2026-01/queries/collection
const GET_COLLECTION_BY_HANDLE_QUERY = `
  query GetCollectionByHandle($handle: String!, $first: Int!, $after: String) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      image { url altText }
      products(first: $first, after: $after) {
        nodes {
          id
          title
          handle
          availableForSale
          featuredImage { url altText }
          priceRange {
            minVariantPrice { amount currencyCode }
          }
          variants(first: 5) {
            nodes {
              id
              availableForSale
              price { amount currencyCode }
              selectedOptions { name value }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;
```

### Search Products

```typescript
// Source: https://shopify.dev/docs/api/storefront/2026-01/queries/search
const SEARCH_PRODUCTS_QUERY = `
  query SearchProducts($query: String!, $first: Int!, $after: String) {
    search(query: $query, first: $first, after: $after, types: [PRODUCT]) {
      nodes {
        ... on Product {
          id
          title
          handle
          availableForSale
          featuredImage { url altText }
          priceRange {
            minVariantPrice { amount currencyCode }
          }
          vendor
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;
```

### TypeScript Types for types/shopify.ts

```typescript
// Raw Shopify API shapes (before transformation)
// Source: Shopify Storefront API 2026-01 object reference

export interface ShopifyMoneyV2 {
  amount: string;          // decimal string e.g. "38.00"
  currencyCode: string;    // e.g. "USD"
}

export interface ShopifyImage {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
}

export interface ShopifySelectedOption {
  name: string;
  value: string;
}

export interface ShopifyProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: ShopifyMoneyV2;
  compareAtPrice: ShopifyMoneyV2 | null;
  selectedOptions: ShopifySelectedOption[];
  image: ShopifyImage | null;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml?: string;
  vendor: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  featuredImage: ShopifyImage | null;
  images: { nodes: ShopifyImage[] };
  priceRange: {
    minVariantPrice: ShopifyMoneyV2;
    maxVariantPrice: ShopifyMoneyV2;
  };
  variants: { nodes: ShopifyProductVariant[] };
}

export interface ShopifyCollection {
  id: string;
  title: string;
  handle: string;
  description: string;
  image: ShopifyImage | null;
}

export interface ShopifyCollectionWithProducts extends ShopifyCollection {
  products: {
    nodes: ShopifyProduct[];
    pageInfo: ShopifyPageInfo;
  };
}

export interface ShopifyPageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;           // ProductVariant id
    title: string;
    price: ShopifyMoneyV2;
    product: {
      id: string;
      title: string;
      handle: string;
      featuredImage: ShopifyImage | null;
    };
    selectedOptions: ShopifySelectedOption[];
  };
  cost: {
    totalAmount: ShopifyMoneyV2;
  };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: { nodes: ShopifyCartLine[] };
  cost: {
    subtotalAmount: ShopifyMoneyV2;
    totalAmount: ShopifyMoneyV2;
    totalTaxAmount: ShopifyMoneyV2 | null;
  };
}

// Paginated response wrapper (used by service functions)
export interface ShopifyPaginatedResult<T> {
  items: T[];
  pageInfo: ShopifyPageInfo;
}
```

### ShopifyError Class

```typescript
// lib/shopify-client.ts
// Exact fields at Claude's discretion — this is the recommended structure

export class ShopifyError extends Error {
  constructor(
    message: string,
    public readonly httpStatus: number,
    public readonly query?: string,
    public readonly storeDomain?: string,
  ) {
    super(`[Shopify${storeDomain ? ` (${storeDomain})` : ''}] ${message}`);
    this.name = 'ShopifyError';
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `shopify-buy` JS Buy SDK | `@shopify/storefront-api-client` or plain fetch | Jan 2025 (SDK deprecated) | `shopify-buy` is deprecated and unmaintained; do not use |
| `Constants.expoConfig.extra` for credentials | `process.env.EXPO_PUBLIC_*` with `.env.local` | Expo SDK 49+ | Simpler, typed, no `expo-constants` import needed |
| `src` field on Shopify Image | `url` field | API 2024+ | `src`, `originalSrc`, `transformedSrc` are deprecated; use `url` |
| `edges[].node` pattern | `nodes[]` shorthand | Available since ~2022 | Both work; `nodes[]` is simpler to map; fragments can use either |
| `ts-node` for TypeScript scripts | `tsx` | 2023+ | `tsx` is zero-config; `ts-node` needs ESM/CJS configuration |
| Storefront API 2023-10 | 2026-01 | Ongoing | Always target latest stable API version |

**Deprecated/outdated — do not use:**
- `shopify-buy` npm package: deprecated January 2025, no longer maintained
- `Image.src`, `Image.originalSrc`, `Image.transformedSrc`: deprecated, use `Image.url`
- `Constants.expoConfig.extra`: works but verbose; `process.env.EXPO_PUBLIC_*` is the current standard
- `@shopify/storefront-api-client` in React Native without polyfill: known URL compatibility issue

---

## Open Questions

1. **Exact Shopify collection handles in the live store**
   - What we know: The app's mock data uses `earth`, `woven`, `light`, `crafted` as category handles (from `data/mock-data.ts` product `category` field)
   - What's unclear: Whether the actual Shopify store has collections with these exact handles
   - Recommendation: The smoke test explicitly surfaces this — run it after credentials are set up and reconcile handles before Phase 5+ screen work begins. If handles don't match, update either the Shopify store or the app's expected handles; document the decision.

2. **API version pinning strategy**
   - What we know: 2026-01 is the current latest; Shopify releases quarterly (YYYY-MM format); old versions are supported ~1 year
   - What's unclear: Whether to hardcode `2026-01` or make it a constant
   - Recommendation: Hardcode `2026-01` as a constant in `lib/shopify-client.ts`. Update to a new version only when Shopify deprecates 2026-01 or a needed feature requires it.

3. **Cart type completeness for SHOP-02**
   - What we know: `ShopifyCart` type is required (SHOP-02) but cart mutations are implemented in Phase 3 (SHOP-06/07)
   - What's unclear: Exact `CartCost` field names (subtotalAmount vs subtotal, etc.)
   - Recommendation: Define `ShopifyCart` with the most likely field names based on API patterns. Phase 3 will validate and correct against actual mutation responses.

---

## Sources

### Primary (HIGH confidence)
- `https://shopify.dev/docs/api/storefront` — Current API version (2026-01), endpoint format, overview
- `https://shopify.dev/docs/api/usage/authentication#access-tokens-for-the-storefront-api` — Exact header name `X-Shopify-Storefront-Access-Token`, public vs private token distinction
- `https://shopify.dev/docs/api/storefront/2026-01/queries/products` — Products query args, pagination, filter syntax
- `https://shopify.dev/docs/api/storefront/2026-01/queries/product` — Single product by handle, field list
- `https://shopify.dev/docs/api/storefront/2026-01/queries/collections` — Collections query
- `https://shopify.dev/docs/api/storefront/2026-01/queries/collection` — Collection by handle with products example
- `https://shopify.dev/docs/api/storefront/2026-01/queries/search` — Search query args and return structure
- `https://shopify.dev/docs/api/storefront/2026-01/objects/Product` — Product field reference
- `https://shopify.dev/docs/api/storefront/2026-01/objects/ProductVariant` — Variant fields, MoneyV2 structure
- `https://shopify.dev/docs/api/storefront/2026-01/objects/Image` — Image fields: `url` (not `src`), `altText`, `width`, `height`; deprecated fields
- `https://shopify.dev/docs/api/usage/pagination-graphql` — PageInfo fields: `hasNextPage`, `endCursor`, `hasPreviousPage`, `startCursor`; forward pagination with `first`+`after`
- `https://docs.expo.dev/guides/environment-variables/` — `EXPO_PUBLIC_` prefix behavior, static dot notation requirement, `.env.local` file support

### Secondary (MEDIUM confidence)
- `https://github.com/Shopify/shopify-app-js/issues/766` — React Native URL compatibility issue with `@shopify/storefront-api-client`; resolved Feb 2025 with polyfill; recommends plain fetch as simpler alternative (verified via multiple community sources)
- WebSearch: `@shopify/storefront-api-client` React Native incompatibility — URL constructor not available; confirmed by npm package page warning and GitHub issue
- WebSearch: `shopify-buy` deprecation January 2025 — confirmed by multiple sources including npm page
- WebSearch: `tsx` vs `ts-node` for scripts — `tsx` is zero-config; verified by tsx official docs at `https://tsx.is`
- WebSearch: Expo `process.env` vs `Constants.expoConfig.extra` — `EXPO_PUBLIC_` + `process.env` is current recommendation per Expo migration docs

### Tertiary (LOW confidence)
- Exact CartCost field names (`subtotalAmount`, `totalTaxAmount`) — inferred from Shopify naming patterns; must be validated during Phase 3 implementation against actual cart mutation responses
- Default value for `first` parameter in paginated queries — Claude's discretion per CONTEXT.md; 20 is a reasonable default but not verified against store size

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — plain fetch is verified React Native-safe; `tsx` is verified zero-config; Shopify endpoint/auth format verified from official docs
- Architecture: HIGH — three-file split (client/queries/mappers) matches the locked decisions in CONTEXT.md; patterns verified against official Shopify examples
- Pitfalls: HIGH for documented pitfalls (env var bracket notation, GraphQL errors in 200, URL polyfill issue); MEDIUM for collection handle mismatch (real risk but magnitude depends on specific store)
- TypeScript types: MEDIUM-HIGH — field names verified from API reference; Cart type has LOW confidence on exact field names (Phase 3 validates)

**Research date:** 2026-02-20
**Valid until:** 2026-05-20 (stable API; 2026-01 API version supported until ~early 2027; review if Shopify releases breaking changes)
