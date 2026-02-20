// hooks/useShopifyQuery.ts
// Generic base hook for all Shopify data fetching.
// Manages the loading / isRefetching / error / refetch state machine.
// Used internally by useProducts, useCollections, and useProduct — never imported by screens.

import { useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseShopifyQueryResult<T> {
  data: T | null;
  /** True only on initial fetch (data is null and error is null). */
  loading: boolean;
  /** True on subsequent refetch() calls after the first successful or failed fetch. */
  isRefetching: boolean;
  error: string | null;
  refetch: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Generic hook that runs `queryFn` and manages loading/isRefetching/error state.
 *
 * **queryFn stability contract:** The queryFn argument is NOT included in the
 * useEffect dep array. Public hooks (useProducts, useCollections, useProduct)
 * MUST wrap their queryFn in useCallback with correct primitive deps before
 * passing it here. The base hook trusts the caller to provide a stable reference.
 *
 * **Race condition prevention:** A `cancelled` flag is set in the effect cleanup.
 * When deps change (e.g., handle changes in useProduct), the old effect is cleaned
 * up (cancelled = true) before the new one starts, so stale in-flight responses
 * cannot overwrite state.
 *
 * @param queryFn  - Stable async function (wrapped in useCallback by caller) that returns T.
 * @param deps     - Dependency array forwarded to the inner useEffect. Changes trigger a re-fetch.
 */
export function useShopifyQuery<T>(
  queryFn: () => Promise<T>,
  deps: unknown[] = []
): UseShopifyQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState<number>(0);

  /**
   * Clears the error state optimistically (per CONTEXT.md decision), then
   * increments refetchTrigger to re-run the fetch effect.
   */
  const refetch = useCallback(() => {
    setError(null);
    setRefetchTrigger((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    // Determine fetch mode:
    //   - isFirstLoad: data is null AND error is null → show initial loading spinner
    //   - otherwise: already have data or a prior error → show isRefetching indicator
    const isFirstLoad = data === null && error === null;
    if (isFirstLoad) {
      setLoading(true);
    } else {
      setIsRefetching(true);
    }

    queryFn()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          setError(message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setIsRefetching(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetchTrigger, ...deps]);

  return { data, loading, isRefetching, error, refetch };
}
