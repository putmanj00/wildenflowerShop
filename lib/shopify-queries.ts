// lib/shopify-queries.ts
// All Shopify Storefront API GraphQL queries and fragments.
// Fragments are concatenated into each query string — required when using plain fetch (no GQL parser).

// ─── Fragments ────────────────────────────────────────────────────────────────

const IMAGE_FRAGMENT = `
  fragment ImageFragment on Image {
    url
    altText
    width
    height
  }
`;

const MONEY_FRAGMENT = `
  fragment MoneyFragment on MoneyV2 {
    amount
    currencyCode
  }
`;

const PRODUCT_VARIANT_FRAGMENT = `
  fragment ProductVariantFragment on ProductVariant {
    id
    title
    availableForSale
    price { ...MoneyFragment }
    compareAtPrice { ...MoneyFragment }
    selectedOptions { name value }
    image { ...ImageFragment }
  }
`;

const PRODUCT_FRAGMENT = `
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
`;

// All dependencies for PRODUCT_FRAGMENT concatenated
const PRODUCT_FRAGMENT_DEPS = PRODUCT_VARIANT_FRAGMENT + IMAGE_FRAGMENT + MONEY_FRAGMENT;

const COLLECTION_FRAGMENT = `
  fragment CollectionFragment on Collection {
    id
    title
    handle
    description
    image { ...ImageFragment }
  }
`;

// ─── Queries ──────────────────────────────────────────────────────────────────

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
  ${PRODUCT_FRAGMENT_DEPS}
`;

export const GET_PRODUCT_BY_HANDLE_QUERY = `
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
  }
  ${PRODUCT_VARIANT_FRAGMENT}
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
`;

export const GET_COLLECTIONS_QUERY = `
  query GetCollections($first: Int!, $after: String) {
    collections(first: $first, after: $after) {
      nodes { ...CollectionFragment }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${COLLECTION_FRAGMENT}
  ${IMAGE_FRAGMENT}
`;

export const GET_COLLECTION_BY_HANDLE_QUERY = `
  query GetCollectionByHandle($handle: String!, $first: Int!, $after: String) {
    collection(handle: $handle) {
      ...CollectionFragment
      products(first: $first, after: $after) {
        nodes {
          id
          title
          handle
          availableForSale
          featuredImage { ...ImageFragment }
          priceRange {
            minVariantPrice { ...MoneyFragment }
          }
          variants(first: 5) {
            nodes {
              id
              availableForSale
              price { ...MoneyFragment }
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
  ${COLLECTION_FRAGMENT}
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
`;

export const SEARCH_PRODUCTS_QUERY = `
  query SearchProducts($query: String!, $first: Int!, $after: String) {
    search(query: $query, first: $first, after: $after, types: [PRODUCT]) {
      nodes {
        ... on Product {
          id
          title
          handle
          availableForSale
          featuredImage { ...ImageFragment }
          priceRange {
            minVariantPrice { ...MoneyFragment }
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
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
`;
