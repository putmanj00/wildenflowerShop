// hooks/useCollections.ts
// Public hook for fetching Shopify collections.
// Screens import this hook — never import from lib/shopify-client directly.

import { useCallback } from 'react';
import { useShopifyQuery } from './useShopifyQuery';
import { getCollections } from '../lib/shopify-client';
import type { ShopifyCollection } from '../types/shopify';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseCollectionsOptions {
  /** Max collections to return. Defaults to 20 (consistent with useProducts). */
  limit?: number;
}

interface UseCollectionsResult {
  collections: ShopifyCollection[];
  loading: boolean;
  isRefetching: boolean;
  error: string | null;
  refetch: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCollections(options?: UseCollectionsOptions): UseCollectionsResult {
  // Destructure to primitive before useCallback — avoids object identity churn on re-renders
  const { limit = 20 } = options ?? {};

  const queryFn = useCallback(
    () => getCollections({ first: limit }).then((r) => r.items),
    [limit]
  );

  const { data, loading, isRefetching, error, refetch } = useShopifyQuery<ShopifyCollection[]>(
    queryFn,
    [limit]
  );

  return { collections: data ?? [], loading, isRefetching, error, refetch };
}
