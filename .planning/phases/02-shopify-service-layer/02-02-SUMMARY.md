---
phase: 02-shopify-service-layer
plan: 02
subsystem: api
tags: [shopify, graphql, typescript, service-layer, fetch, mappers]

# Dependency graph
requires:
  - phase: 02-shopify-service-layer
    plan: 01
    provides: "types/shopify.ts with all raw Shopify API type definitions"
provides:
  - "lib/shopify-queries.ts: 5 GraphQL query string constants with fragments concatenated"
  - "lib/shopify-mappers.ts: pure transformation functions from raw Shopify shapes to flattened app types"
  - "lib/shopify-client.ts: ShopifyError class, shopifyFetch wrapper, 5 typed service functions"
affects:
  - 02-shopify-service-layer Plan 03 (smoke testing against real store)
  - 03-cart-integration (imports getProducts, getProductByHandle)
  - all-phases-screens (all data fetching routes through these service functions)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "GraphQL fragment concatenation into query strings — no GQL parser; fragments must be literal substrings of the request body"
    - "ShopifyError extends Error with httpStatus, query, storeDomain properties for structured error handling"
    - "shopifyFetch generic wrapper catches both HTTP errors (non-2xx) and GraphQL errors (errors[] in 200 response)"
    - "nodes[] arrays flattened to plain arrays in mappers; screens never see connection wrapper shapes"
    - "PaginationParams { first?, after? } uniform interface across all list-returning service functions"

key-files:
  created:
    - "lib/shopify-queries.ts"
    - "lib/shopify-mappers.ts"
    - "lib/shopify-client.ts"
  modified: []

key-decisions:
  - "AppCollectionWithProducts uses plain interface extending ShopifyCollection (not conditional type) — simpler and TypeScript-compatible without as-any casts"
  - "shopifyFetch is not exported — only the service functions are public API; internal implementation detail"
  - "startup validation uses console.warn not throw — allows app to load in dev without crashing on placeholder credentials"

patterns-established:
  - "All screen data access goes through service functions in lib/shopify-client.ts — never raw fetch in screen files"
  - "mapProduct and mapCollection are the only transformation boundary — raw Shopify shapes are not passed to components"
  - "ShopifyError is the single error type; callers check instanceof ShopifyError for structured handling"

requirements-completed: [SHOP-03, SHOP-04, SHOP-05]

# Metrics
duration: ~2min
completed: 2026-02-20
---

# Phase 02 Plan 02: Shopify Service Layer — Queries, Mappers, and Client Summary

**Three-file Shopify service layer: GraphQL query strings with fragment concatenation, pure data transformation mappers, and authenticated fetch client with ShopifyError and five typed service functions**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-02-20T02:52:38Z
- **Completed:** 2026-02-20T02:54:xx Z
- **Tasks:** 2
- **Files modified:** 3 (all created)

## Accomplishments

- Created lib/shopify-queries.ts with 5 exported GraphQL query string constants; IMAGE_FRAGMENT, MONEY_FRAGMENT, PRODUCT_VARIANT_FRAGMENT, PRODUCT_FRAGMENT, and COLLECTION_FRAGMENT defined as private constants and concatenated into each query string to prevent "Unknown fragment" runtime errors
- Created lib/shopify-mappers.ts with AppProduct and AppCollectionWithProducts interfaces and three pure transformation functions (mapProduct, mapCollection, mapCollectionWithProducts) that flatten nodes[] arrays into plain arrays so screens never see Shopify connection wrapper shapes
- Created lib/shopify-client.ts with ShopifyError class, internal shopifyFetch wrapper (throws on HTTP errors and on GraphQL errors[] in 200 responses), and five async service functions with uniform PaginationParams interface
- TypeScript compiles with zero errors across the full project

## Task Commits

Each task was committed atomically:

1. **Task 1: Create lib/shopify-queries.ts** - `703c5f5` (feat)
2. **Task 2: Create lib/shopify-mappers.ts and lib/shopify-client.ts** - `d762138` (feat)

## Files Created/Modified

- `lib/shopify-queries.ts` - 5 query string constants: GET_PRODUCTS_QUERY, GET_PRODUCT_BY_HANDLE_QUERY, GET_COLLECTIONS_QUERY, GET_COLLECTION_BY_HANDLE_QUERY, SEARCH_PRODUCTS_QUERY; each includes all required fragment definitions concatenated
- `lib/shopify-mappers.ts` - AppProduct (extends ShopifyProduct with flattened images/variants), AppCollectionWithProducts (extends ShopifyCollection with flattened products), mapProduct, mapCollection, mapCollectionWithProducts
- `lib/shopify-client.ts` - ShopifyError (httpStatus, query, storeDomain), shopifyFetch (internal), getProducts, getProductByHandle, getCollections, getCollectionByHandle, searchProducts; EXPO_PUBLIC_ env vars via static dot notation; startup validation warns on placeholder values

## Decisions Made

- Used plain interface for AppCollectionWithProducts extending ShopifyCollection rather than the conditional type shown in the plan — same correctness, zero compiler friction, no as-any required at the mapper boundary
- shopifyFetch intentionally not exported — the five service functions are the public API; the fetch wrapper is an implementation detail
- Startup validation uses console.warn (not throw) — allows the dev app to load and display a clear message without crashing, which is more useful during local development when credentials aren't set yet

## Deviations from Plan

None — plan executed exactly as written. The plan anticipated potential TypeScript complexity with AppCollectionWithProducts and pre-authorized the simplified interface approach; that approach was used from the start and compiled cleanly.

## Issues Encountered

None — both tasks executed cleanly with zero TypeScript errors.

## Next Phase Readiness

- Plan 03 (smoke testing) can start immediately — all service functions are available for integration testing against the real Shopify Storefront API
- Smoke testing requires real Shopify credentials populated in .env.local (see Plan 01 SUMMARY for setup instructions)
- Downstream phases (03-cart-integration and all screen phases) have clean import paths: `import { getProducts } from 'lib/shopify-client'`

---
*Phase: 02-shopify-service-layer*
*Completed: 2026-02-20*
