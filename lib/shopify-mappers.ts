// lib/shopify-mappers.ts
// Pure functions: raw Shopify API shapes → app-friendly types.
// Rule: flatten nodes[] arrays; keep nested objects (images, variants, priceRange) structured.
// Screens never see edges[].node or { nodes: [] } connection wrappers.

import type {
  ShopifyProduct,
  ShopifyCollection,
  ShopifyCollectionWithProducts,
  ShopifyPaginatedResult,
  ShopifyPageInfo,
} from '../types/shopify';

// Flattened app product type — no connection wrappers
export interface AppProduct extends Omit<ShopifyProduct, 'images' | 'variants'> {
  images: ShopifyProduct['images']['nodes'];
  variants: ShopifyProduct['variants']['nodes'];
}

// Flattened app collection-with-products type
export interface AppCollectionWithProducts extends ShopifyCollection {
  products: {
    items: AppProduct[];
    pageInfo: ShopifyPageInfo;
  };
}

export function mapProduct(raw: ShopifyProduct): AppProduct {
  return {
    ...raw,
    images: raw.images.nodes,
    variants: raw.variants.nodes,
  };
}

export function mapCollection(raw: ShopifyCollection): ShopifyCollection {
  // Collections have no connection wrappers to flatten at this level
  return raw;
}

export function mapCollectionWithProducts(
  raw: ShopifyCollectionWithProducts
): { collection: ShopifyCollection; products: ShopifyPaginatedResult<AppProduct> } {
  const { products, ...collectionFields } = raw;
  return {
    collection: collectionFields,
    products: {
      items: products.nodes.map(mapProduct),
      pageInfo: products.pageInfo,
    },
  };
}
