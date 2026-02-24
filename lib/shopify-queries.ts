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
    quantityAvailable
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
    rating: metafield(namespace: "reviews", key: "rating") { value }
    reviewCount: metafield(namespace: "reviews", key: "rating_count") { value }
    makerName: metafield(namespace: "custom", key: "maker_name") { value }
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
      rating: metafield(namespace: "reviews", key: "rating") { value }
      reviewCount: metafield(namespace: "reviews", key: "rating_count") { value }
      makerName: metafield(namespace: "custom", key: "maker_name") { value }
      priceRange {
        minVariantPrice { ...MoneyFragment }
        maxVariantPrice { ...MoneyFragment }
      }
      variants(first: 20) {
        nodes { ...ProductVariantFragment }
      }
    }
    shop {
      shippingPolicy {
        title
        body
      }
      refundPolicy {
        title
        body
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
        nodes { ...ProductFragment }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
  ${COLLECTION_FRAGMENT}
  ${PRODUCT_FRAGMENT}
  ${PRODUCT_FRAGMENT_DEPS}
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

// ─── Cart ─────────────────────────────────────────────────────────────────────
// Reusable fragment for all cart operations.
// nodes shorthand matches ShopifyCart type (lines: { nodes: ShopifyCartLine[] }).
// lines(first: 100) — safe upper bound; cartLinesRemove/Update require lineIds which
// come from the cart lines, so the entire list must be fetched.

const CART_LINES_FRAGMENT = `
  fragment CartLinesFragment on Cart {
    id
    checkoutUrl
    totalQuantity
    lines(first: 100) {
      nodes {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            price { amount currencyCode }
            product {
              id
              title
              handle
              featuredImage { url altText width height }
            }
            selectedOptions { name value }
            quantityAvailable
          }
        }
        cost {
          totalAmount { amount currencyCode }
        }
      }
    }
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
      totalTaxAmount { amount currencyCode }
    }
  }
`;

export const CART_CREATE_MUTATION = `
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart { ...CartLinesFragment }
      userErrors { code field message }
    }
  }
  ${CART_LINES_FRAGMENT}
`;
// Variables: { lines: [{ merchandiseId: string, quantity: number }] }
// Empty cart: pass lines: [] or omit lines entirely

export const CART_LINES_ADD_MUTATION = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ...CartLinesFragment }
      userErrors { code field message }
    }
  }
  ${CART_LINES_FRAGMENT}
`;
// Variables: { cartId: string, lines: [{ merchandiseId: string, quantity: number }] }

export const CART_LINES_REMOVE_MUTATION = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ...CartLinesFragment }
      userErrors { code field message }
    }
  }
  ${CART_LINES_FRAGMENT}
`;
// Variables: { cartId: string, lineIds: [CartLine.id, ...] }
// IMPORTANT: lineIds is CartLine.id (gid://shopify/CartLine/...) NOT merchandise.id (variantId)

export const CART_LINES_UPDATE_MUTATION = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ...CartLinesFragment }
      userErrors { code field message }
    }
  }
  ${CART_LINES_FRAGMENT}
`;
// Variables: { cartId: string, lines: [{ id: CartLine.id, quantity: number }] }
// Do NOT call with quantity: 0 — call cartLinesRemove instead (cartLinesUpdate may error)

export const GET_CART_QUERY = `
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartLinesFragment
    }
  }
  ${CART_LINES_FRAGMENT}
`;
// Returns: { cart: ShopifyCart } or { cart: null } when cart is expired/not found.
// null is NOT a GraphQL error — check data.cart === null to trigger recovery.

// ─── Customer Authentication ──────────────────────────────────────────────────

export const CUSTOMER_CREATE_MUTATION = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        firstName
        lastName
        email
        phone
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

export const CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

export const CUSTOMER_ACCESS_TOKEN_DELETE_MUTATION = `
  mutation customerAccessTokenDelete($customerAccessToken: String!) {
    customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
      deletedAccessToken
      deletedCustomerAccessTokenId
      userErrors {
        field
        message
      }
    }
  }
`;

export const GET_CUSTOMER_QUERY = `
  query getCustomer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      firstName
      lastName
      email
      phone
      orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          orderNumber
          processedAt
          financialStatus
          fulfillmentStatus
          totalPrice {
            amount
            currencyCode
          }
          lineItems(first: 10) {
            nodes {
              title
              quantity
              variant {
                image {
                  url
                  altText
                  width
                  height
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const CUSTOMER_RECOVER_MUTATION = `
  mutation customerRecover($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;
