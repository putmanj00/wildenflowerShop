// hooks/useProducts.ts
// Public hook for fetching a list of products with cursor-based pagination.
// Optionally filters by Shopify collection handle.
// Screens import this hook — never import from lib/shopify-client directly.

import { useState, useEffect } from 'react';
import { getProducts, getCollectionByHandle } from '../lib/shopify-client';
import type { AppProduct } from '../lib/shopify-mappers';
import type { ShopifyPageInfo } from '../types/shopify';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseProductsOptions {
  /** Shopify collection handle to filter by; omit to fetch all products. */
  collection?: string;
  /** Max products per page. Defaults to 20 (matches DEFAULT_PAGE_SIZE in service layer). */
  limit?: number;
}

export interface UseProductsResult {
  products: AppProduct[];
  /** True only on initial fetch (products=[] and no error yet). */
  loading: boolean;
  /** True on explicit refetch() calls after initial load. */
  isRefetching: boolean;
  /** True while a loadMore() fetch is in flight. */
  isLoadingMore: boolean;
  error: string | null;
  /** Resets cursor and re-fetches from page 1. */
  refetch: () => void;
  /** Pagination info from the last fetch. */
  pageInfo: ShopifyPageInfo | null;
  /** Call to append the next page; null when no next page exists. */
  loadMore: (() => void) | null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useProducts(options?: UseProductsOptions): UseProductsResult {
  // Destructure to primitives — avoids object identity churn on re-renders
  const { collection, limit = 20 } = options ?? {};

  const [products, setProducts] = useState<AppProduct[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState<ShopifyPageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  // Reset accumulated products and cursor when the collection filter changes.
  // This fires first (synchronous state update), then the fetch effect picks up.
  useEffect(() => {
    setProducts([]);
    setCursor(null);
    setPageInfo(null);
    setLoading(true);
    setError(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection]);

  // Fetch effect — fires on collection change, fetchTrigger increment, or cursor advance.
  useEffect(() => {
    let cancelled = false;
    const isCursorFetch = cursor !== null; // loadMore triggered this

    if (isCursorFetch) {
      setIsLoadingMore(true);
    } else {
      // Initial or explicit refetch — show loading only if no products yet
      if (products.length === 0) {
        setLoading(true);
      } else {
        setIsRefetching(true);
      }
    }

    (async () => {
      try {
        let items: AppProduct[];
        let newPageInfo: ShopifyPageInfo;

        if (collection) {
          const result = await getCollectionByHandle(collection, {
            first: limit,
            after: cursor ?? undefined,
          });
          items = result?.products.items ?? [];
          newPageInfo = result?.products.pageInfo ?? { hasNextPage: false, endCursor: null };
        } else {
          const result = await getProducts({ first: limit, after: cursor ?? undefined });
          items = result.items;
          newPageInfo = result.pageInfo;
        }

        if (!cancelled) {
          setProducts(prev => (isCursorFetch ? [...prev, ...items] : items));
          setPageInfo(newPageInfo);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setIsRefetching(false);
          setIsLoadingMore(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  // products.length intentionally omitted — only structural triggers drive fetches.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTrigger, collection, limit, cursor]);

  // loadMore is non-null only when a next page is available
  const loadMore =
    pageInfo?.hasNextPage && pageInfo.endCursor
      ? () => setCursor(pageInfo.endCursor!)
      : null;

  function refetch() {
    setProducts([]);
    setCursor(null);
    setPageInfo(null);
    setError(null);
    setLoading(true);
    setFetchTrigger(n => n + 1);
  }

  return { products, loading, isRefetching, isLoadingMore, error, refetch, pageInfo, loadMore };
}
