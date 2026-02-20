// types/shopify.ts
// Raw Shopify Storefront API type definitions (2026-01)
// These mirror the GraphQL API response shapes before transformation.
// Transformed/app-facing types are defined in lib/shopify-mappers.ts as needed.

export interface ShopifyMoneyV2 {
  amount: string;       // decimal string, e.g. "38.00"
  currencyCode: string; // e.g. "USD"
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
    id: string;
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

// Generic paginated result wrapper returned by service functions
export interface ShopifyPaginatedResult<T> {
  items: T[];
  pageInfo: ShopifyPageInfo;
}

// Minimal snapshot stored in AsyncStorage for expired-cart recovery.
// Only { variantId, quantity } — never the full ShopifyCart (too large, immediately stale).
export interface CartLineSnapshot {
  variantId: string;   // gid://shopify/ProductVariant/...
  quantity: number;
}

// Shopify mutation user errors — returned in mutation response bodies alongside cart data.
// HTTP status is 200 even when userErrors is non-empty; check this field explicitly.
export interface CartUserError {
  code: string;
  field: string[] | null;
  message: string;
}
