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
export interface AppProduct extends Omit<ShopifyProduct, 'images' | 'variants' | 'rating' | 'reviewCount' | 'makerName'> {
  images: ShopifyProduct['images']['nodes'];
  variants: ShopifyProduct['variants']['nodes'];
  rating?: number;
  reviewCount?: number;
  inventoryQuantity?: number;
  makerName?: string;
}

// Flattened app collection-with-products type
export interface AppCollectionWithProducts extends ShopifyCollection {
  products: {
    items: AppProduct[];
    pageInfo: ShopifyPageInfo;
  };
}

export function mapProduct(raw: ShopifyProduct): AppProduct {
  const rating = raw.rating ? parseFloat(raw.rating.value) : undefined;
  const reviewCount = raw.reviewCount ? parseInt(raw.reviewCount.value, 10) : 0;
  const makerName = raw.makerName ? raw.makerName.value : undefined;
  
  const inventoryQuantity = raw.variants.nodes.reduce(
    (total, variant) => total + (variant.quantityAvailable || 0), 
    0
  );

  return {
    ...raw,
    images: raw.images.nodes,
    variants: raw.variants.nodes,
    rating,
    reviewCount,
    inventoryQuantity,
    makerName,
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
