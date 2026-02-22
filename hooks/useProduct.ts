// hooks/useProduct.ts
// Public hook for fetching a single product by Shopify handle.
// Re-fetches automatically when handle changes.
// Screens import this hook — never import from lib/shopify-client directly.

import { useCallback } from 'react';
import { useShopifyQuery } from './useShopifyQuery';
import { getProductByHandle } from '../lib/shopify-client';
import type { AppProduct } from '../lib/shopify-mappers';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseProductResult {
  product: AppProduct | null;
  shop: import('../types/shopify').ShopifyShop | null;
  loading: boolean;
  isRefetching: boolean;
  error: string | null;
  refetch: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Fetches a single product by its Shopify handle.
 * Re-fetches automatically when `handle` changes (dep array forwarded to useShopifyQuery).
 * Race conditions are prevented by the cancelled flag in useShopifyQuery — stale
 * responses from a previous handle are silently discarded.
 */
export function useProduct(handle: string): UseProductResult {
  const queryFn = useCallback(
    () => getProductByHandle(handle),
    [handle]
  );

  const { data, loading, isRefetching, error, refetch } = useShopifyQuery<{ product: AppProduct | null; shop: import('../types/shopify').ShopifyShop | null } | null>(
    queryFn,
    [handle]
  );

  return { product: data?.product ?? null, shop: data?.shop ?? null, loading, isRefetching, error, refetch };
}
