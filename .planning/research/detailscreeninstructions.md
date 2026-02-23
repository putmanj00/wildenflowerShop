Here is the complete implementation plan for upgrading your Product Detail screen, specifically tailored to the codebase files you provided (`shopify-queries.ts`, `shopify-mappers.ts`, and your type definitions).

You already have an excellent foundation. We just need to expand your existing GraphQL queries to pull in metafields and inventory data, update your mappers, and connect the cart mutation.

### 1. The GraphQL Query (`lib/shopify-queries.ts`)

Here is the updated query structure. We will expand your existing `GET_PRODUCT_BY_HANDLE_QUERY` to include Metafields for reviews/maker info, exact inventory quantities, and store-level shipping/return policies.

```graphql
export const GET_PRODUCT_DETAILS_QUERY = `
  query GetProductDetails($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      vendor
      productType
      availableForSale
      
      # 1. Image Carousel (You already had this, but this is how we fetch it!)
      images(first: 10) {
        nodes { ...ImageFragment }
      }
      
      # 3. Ratings & Reviews (Assuming standard Shopify Reviews metafields)
      rating: metafield(namespace: "reviews", key: "rating") { 
        value 
      }
      reviewCount: metafield(namespace: "reviews", key: "rating_count") { 
        value 
      }
      
      # Custom Maker Info (Example metafield)
      makerName: metafield(namespace: "custom", key: "maker_name") { value }
      
      priceRange {
        minVariantPrice { ...MoneyFragment }
        maxVariantPrice { ...MoneyFragment }
      }
      
      variants(first: 20) {
        nodes { 
          ...ProductVariantFragment
          # 2. Inventory Status (Requires 'unauthenticated_read_product_inventory' scope)
          quantityAvailable 
        }
      }
    }
    
    # 4. Global Shipping & Return Policies
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

```

### 2. Updating Types (`types/shopify.ts` & `types/index.ts`)

You need to update your raw Shopify types to expect these new fields, and then update your frontend `Product` type to hold the mapped data.

**In `types/shopify.ts`:**

```typescript
// Add to ShopifyProductVariant
export interface ShopifyProductVariant {
  // ... existing fields
  quantityAvailable?: number; // Added for inventory tracking
}

// Add to ShopifyProduct
export interface ShopifyProduct {
  // ... existing fields
  rating?: { value: string } | null;
  reviewCount?: { value: string } | null;
  makerName?: { value: string } | null;
}

// Add new Shop interface
export interface ShopifyShop {
  shippingPolicy?: { title: string; body: string } | null;
  refundPolicy?: { title: string; body: string } | null;
}

```

**In `types/index.ts` (Frontend Types):**

```typescript
export interface Product {
  // ... existing fields
  rating?: number;
  reviewCount?: number;
  inventoryQuantity?: number; // To track how many are left
  // Note: Your current 'images' is string[]. Consider changing to a type that holds alt text!
  images: { url: string; altText: string | null; width: number | null; height: number | null }[];
}

```

### 3. Updating the Mappers (`lib/shopify-mappers.ts`)

You need to safely extract the metafield values (which come back as JSON strings) and map the array of images properly.

```typescript
export function mapProductDetails(rawProduct: ShopifyProduct): AppProduct {
  // Parse metafields safely
  const rating = rawProduct.rating ? parseFloat(rawProduct.rating.value) : undefined;
  const reviewCount = rawProduct.reviewCount ? parseInt(rawProduct.reviewCount.value, 10) : 0;
  
  // Get total inventory across all variants (or just use the first variant if items are unique)
  const inventoryQuantity = rawProduct.variants.nodes.reduce(
    (total, variant) => total + (variant.quantityAvailable || 0), 
    0
  );

  return {
    ...rawProduct,
    images: rawProduct.images.nodes, // This now passes the full object with altText for your carousel
    variants: rawProduct.variants.nodes,
    rating,
    reviewCount,
    inventoryQuantity
  };
}

```

### 4. Implementing the Features (Strategy)

* **Image Carousel:** Your `images.nodes` mapping now provides an array of image objects. Pass this to a flatlist or a package like `react-native-reanimated-carousel`. Use the `altText` for accessibility props.
* **Inventory Status:** * *Important Note:* To query `quantityAvailable`, you MUST go into your Shopify Admin -> Headless -> Storefront API permissions and explicitly check the **`unauthenticated_read_product_inventory`** scope.
* UI Logic: `if (product.inventoryQuantity > 0 && product.inventoryQuantity <= 5) return <Text>Only {product.inventoryQuantity} left!</Text>`


* **Ratings & Reviews:** Shopify doesn't have native reviews anymore. If you install Judge.me or Okendo, they automatically sync Metafields to the `reviews` namespace. The GraphQL query above will pull those numbers perfectly to display your `★ 4.8 (24 reviews)`.
* **Shipping & Returns:** Since your app is natural and artisan-focused, pulling the global `shop { refundPolicy }` is usually better than per-product policies. You can render the `policy.body` string inside a `<BottomSheet>` or a collapsible React Native accordion component when the user taps "Shipping & Returns".
* **Cart Quantity Integration:** Your existing `CART_LINES_ADD_MUTATION` is already perfectly set up for this!
* In your Product Screen, create a local state: `const [quantity, setQuantity] = useState(1);`
* Wire up your `- 1 +` stepper UI to update that state.
* When the user taps "Add to Cart", execute the mutation using the state:
```typescript
cartLinesAdd({
  variables: {
    cartId: currentCartId,
    lines: [{
      merchandiseId: selectedVariant.id, // Must be the Variant ID, not Product ID
      quantity: quantity // Pass the state value here
    }]
  }
})

```