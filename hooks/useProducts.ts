// hooks/useProducts.ts
// Public hook for fetching a list of products.
// Optionally filters by Shopify collection handle.
// Screens import this hook — never import from lib/shopify-client directly.

import { useCallback } from 'react';
import { useShopifyQuery } from './useShopifyQuery';
import { getProducts, getCollectionByHandle } from '../lib/shopify-client';
import type { AppProduct } from '../lib/shopify-mappers';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseProductsOptions {
  /** Shopify collection handle to filter by; omit to fetch all products. */
  collection?: string;
  /** Max products to return. Defaults to 20 (matches DEFAULT_PAGE_SIZE in service layer). */
  limit?: number;
}

interface UseProductsResult {
  products: AppProduct[];
  loading: boolean;
  isRefetching: boolean;
  error: string | null;
  refetch: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useProducts(options?: UseProductsOptions): UseProductsResult {
  // Destructure to primitives before useCallback — avoids object identity churn on re-renders
  const { collection, limit = 20 } = options ?? {};

  const queryFn = useCallback(async (): Promise<AppProduct[]> => {
    if (collection) {
      const result = await getCollectionByHandle(collection, { first: limit });
      return result?.products.items ?? [];
    }
    const result = await getProducts({ first: limit });
    return result.items;
  }, [collection, limit]);

  const { data, loading, isRefetching, error, refetch } = useShopifyQuery<AppProduct[]>(
    queryFn,
    [collection, limit]
  );

  return { products: data ?? [], loading, isRefetching, error, refetch };
}
