// lib/shopify-client.ts
// Authenticated Shopify Storefront API client.
// Uses native fetch — no @shopify/storefront-api-client (React Native URL compatibility issues).
// EXPO_PUBLIC_ env vars accessed via static dot notation — bracket notation not inlined by Metro.

import type {
  ShopifyProduct,
  ShopifyCollection,
  ShopifyCollectionWithProducts,
  ShopifyPaginatedResult,
  ShopifyPageInfo,
  ShopifyCart,
  CartLineSnapshot,
  CartUserError,
} from '../types/shopify';
import type { AppProduct } from './shopify-mappers';
import { mapProduct, mapCollection, mapCollectionWithProducts } from './shopify-mappers';
import {
  GET_PRODUCTS_QUERY,
  GET_PRODUCT_BY_HANDLE_QUERY,
  GET_COLLECTIONS_QUERY,
  GET_COLLECTION_BY_HANDLE_QUERY,
  SEARCH_PRODUCTS_QUERY,
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  GET_CART_QUERY,
} from './shopify-queries';

// ─── Constants ────────────────────────────────────────────────────────────────

// Static dot notation required — Expo Metro inlines EXPO_PUBLIC_ vars at bundle time.
// Bracket notation (process.env['EXPO_PUBLIC_X']) is NOT inlined and returns undefined.
const STORE_DOMAIN = process.env.EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN;
const ACCESS_TOKEN = process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const API_VERSION = '2026-01';

// Startup validation — fail fast with a clear message rather than silent undefined
if (!STORE_DOMAIN) {
  throw new Error(
    '[Shopify] EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN is not set. ' +
    'Add it to .env.local and restart the dev server.'
  );
} else if (STORE_DOMAIN === 'your-store.myshopify.com') {
  console.warn('[Shopify] EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN is still the placeholder value. Update .env.local.');
}
if (!ACCESS_TOKEN) {
  throw new Error(
    '[Shopify] EXPO_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN is not set. ' +
    'Add it to .env.local and restart the dev server.'
  );
} else if (ACCESS_TOKEN === 'your-public-storefront-access-token') {
  console.warn('[Shopify] EXPO_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN is still the placeholder value. Update .env.local.');
}

const SHOPIFY_ENDPOINT = `https://${STORE_DOMAIN}/api/${API_VERSION}/graphql.json`;

// Default page size for paginated queries
const DEFAULT_PAGE_SIZE = 20;

// ─── Error Class ──────────────────────────────────────────────────────────────

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

// ─── Fetch Wrapper ────────────────────────────────────────────────────────────

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
      'X-Shopify-Storefront-Access-Token': ACCESS_TOKEN ?? '',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const message = `HTTP ${response.status}`;
    console.error(`[Shopify] ${message} on GraphQL request`);
    throw new ShopifyError(message, response.status, query, STORE_DOMAIN);
  }

  const json: GraphQLResponse<T> = await response.json();

  // GraphQL errors arrive in 200 responses — treat as failure (same path as network errors)
  if (json.errors && json.errors.length > 0) {
    const message = json.errors.map((e) => e.message).join('; ');
    console.error(`[Shopify] GraphQL error: ${message}`);
    throw new ShopifyError(message, 200, query, STORE_DOMAIN);
  }

  return json.data as T;
}

// ─── Pagination Params ────────────────────────────────────────────────────────

interface PaginationParams {
  first?: number;
  after?: string;
}

// ─── Service Functions ────────────────────────────────────────────────────────

export async function getProducts(
  params: PaginationParams = {}
): Promise<ShopifyPaginatedResult<AppProduct>> {
  const { first = DEFAULT_PAGE_SIZE, after } = params;
  const data = await shopifyFetch<{
    products: { nodes: ShopifyProduct[]; pageInfo: ShopifyPageInfo };
  }>(GET_PRODUCTS_QUERY, { first, after });
  return {
    items: data.products.nodes.map(mapProduct),
    pageInfo: data.products.pageInfo,
  };
}

export async function getProductByHandle(handle: string): Promise<AppProduct | null> {
  const data = await shopifyFetch<{ product: ShopifyProduct | null }>(
    GET_PRODUCT_BY_HANDLE_QUERY,
    { handle }
  );
  return data.product ? mapProduct(data.product) : null;
}

export async function getCollections(
  params: PaginationParams = {}
): Promise<ShopifyPaginatedResult<ShopifyCollection>> {
  const { first = DEFAULT_PAGE_SIZE, after } = params;
  const data = await shopifyFetch<{
    collections: { nodes: ShopifyCollection[]; pageInfo: ShopifyPageInfo };
  }>(GET_COLLECTIONS_QUERY, { first, after });
  return {
    items: data.collections.nodes.map(mapCollection),
    pageInfo: data.collections.pageInfo,
  };
}

export async function getCollectionByHandle(
  handle: string,
  params: PaginationParams = {}
): Promise<ReturnType<typeof mapCollectionWithProducts> | null> {
  const { first = DEFAULT_PAGE_SIZE, after } = params;
  const data = await shopifyFetch<{ collection: ShopifyCollectionWithProducts | null }>(
    GET_COLLECTION_BY_HANDLE_QUERY,
    { handle, first, after }
  );
  return data.collection ? mapCollectionWithProducts(data.collection) : null;
}

export async function searchProducts(
  query: string,
  params: PaginationParams = {}
): Promise<ShopifyPaginatedResult<AppProduct> & { totalCount: number }> {
  const { first = DEFAULT_PAGE_SIZE, after } = params;
  const data = await shopifyFetch<{
    search: {
      nodes: ShopifyProduct[];
      pageInfo: ShopifyPageInfo;
      totalCount: number;
    };
  }>(SEARCH_PRODUCTS_QUERY, { query, first, after });
  return {
    items: data.search.nodes.map(mapProduct),
    pageInfo: data.search.pageInfo,
    totalCount: data.search.totalCount,
  };
}

// ─── Cart Service Functions ───────────────────────────────────────────────────
// These are the only Shopify cart API surface exposed to CartContext.
// shopifyFetch stays private; only named service functions are exported.

/**
 * Creates a new Shopify cart.
 * Pass lines to pre-populate (used during expired-cart recovery); omit for empty cart.
 * Throws ShopifyError if cartCreate returns userErrors.
 */
export async function createCart(lines: CartLineSnapshot[] = []): Promise<ShopifyCart> {
  const data = await shopifyFetch<{
    cartCreate: { cart: ShopifyCart; userErrors: CartUserError[] };
  }>(CART_CREATE_MUTATION, {
    lines: lines.map((l) => ({ merchandiseId: l.variantId, quantity: l.quantity })),
  });
  if (data.cartCreate.userErrors.length > 0) {
    throw new ShopifyError(
      data.cartCreate.userErrors.map((e) => e.message).join('; '),
      200,
      CART_CREATE_MUTATION,
      STORE_DOMAIN
    );
  }
  return data.cartCreate.cart;
}

/**
 * Fetches the current state of an existing cart.
 * Returns null if the cart is expired or not found — NOT an error; triggers recovery in CartContext.
 */
export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  const data = await shopifyFetch<{ cart: ShopifyCart | null }>(GET_CART_QUERY, { cartId });
  return data.cart;
}

/**
 * Adds one or more lines to an existing cart.
 * Each line: { variantId: gid://shopify/ProductVariant/..., quantity: number }
 * Throws ShopifyError if cartLinesAdd returns userErrors.
 */
export async function addCartLines(
  cartId: string,
  lines: CartLineSnapshot[]
): Promise<ShopifyCart> {
  const data = await shopifyFetch<{
    cartLinesAdd: { cart: ShopifyCart; userErrors: CartUserError[] };
  }>(CART_LINES_ADD_MUTATION, {
    cartId,
    lines: lines.map((l) => ({ merchandiseId: l.variantId, quantity: l.quantity })),
  });
  if (data.cartLinesAdd.userErrors.length > 0) {
    throw new ShopifyError(
      data.cartLinesAdd.userErrors.map((e) => e.message).join('; '),
      200,
      CART_LINES_ADD_MUTATION,
      STORE_DOMAIN
    );
  }
  return data.cartLinesAdd.cart;
}

/**
 * Removes lines from an existing cart.
 * lineIds: CartLine.id values (gid://shopify/CartLine/...) — NOT variantIds.
 * Throws ShopifyError if cartLinesRemove returns userErrors.
 */
export async function removeCartLines(
  cartId: string,
  lineIds: string[]
): Promise<ShopifyCart> {
  const data = await shopifyFetch<{
    cartLinesRemove: { cart: ShopifyCart; userErrors: CartUserError[] };
  }>(CART_LINES_REMOVE_MUTATION, { cartId, lineIds });
  if (data.cartLinesRemove.userErrors.length > 0) {
    throw new ShopifyError(
      data.cartLinesRemove.userErrors.map((e) => e.message).join('; '),
      200,
      CART_LINES_REMOVE_MUTATION,
      STORE_DOMAIN
    );
  }
  return data.cartLinesRemove.cart;
}

/**
 * Updates quantities of existing cart lines.
 * lines: [{ id: CartLine.id, quantity: number }] — NOT variantIds.
 * Do NOT pass quantity: 0 here; call removeCartLines instead to avoid INVALID user error.
 * Throws ShopifyError if cartLinesUpdate returns userErrors.
 */
export async function updateCartLines(
  cartId: string,
  lines: Array<{ id: string; quantity: number }>
): Promise<ShopifyCart> {
  const data = await shopifyFetch<{
    cartLinesUpdate: { cart: ShopifyCart; userErrors: CartUserError[] };
  }>(CART_LINES_UPDATE_MUTATION, { cartId, lines });
  if (data.cartLinesUpdate.userErrors.length > 0) {
    throw new ShopifyError(
      data.cartLinesUpdate.userErrors.map((e) => e.message).join('; '),
      200,
      CART_LINES_UPDATE_MUTATION,
      STORE_DOMAIN
    );
  }
  return data.cartLinesUpdate.cart;
}
