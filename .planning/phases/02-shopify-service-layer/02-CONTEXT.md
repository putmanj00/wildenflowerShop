# Phase 2: Shopify Service Layer - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire the Shopify Storefront API into the app: environment variables, authenticated GraphQL client, TypeScript types, and service functions for products, collections, and search. No screen-level integration in this phase — this is the data layer that screens will consume in later phases.

</domain>

<decisions>
## Implementation Decisions

### Error Handling Contract
- Service functions **throw** on failure — callers (screens/hooks) catch and handle
- Errors wrapped in a **custom `ShopifyError` class** with context: which query failed, HTTP status code, store domain
- Service layer **logs errors before re-throwing** (useful during development)
- GraphQL `errors` array in a 200 response → treated as a failure, **throw as ShopifyError** (same path as network errors)

### Data Transformation
- Service functions return **transformed app types**, not raw Shopify GraphQL shapes
- Types in `types/shopify.ts` are the raw Shopify API types; transformed types may live elsewhere as needed
- **New shapes are acceptable** — no requirement to mirror the existing mock data shapes in `data/mock-data.ts`
- **Flatten connection wrappers only** — remove `edges[].node` boilerplate, but keep variant and image objects structured (don't collapse to primitive arrays)
- Transformation functions live in a **separate `lib/shopify-mappers.ts`** file (separate from fetching concerns)

### GraphQL Organization
- All GraphQL query strings in a **separate `lib/shopify-queries.ts`** file, imported by the client
- Use **GraphQL fragments** for shared fields (e.g., `ProductFragment`, `ImageFragment`) to reduce repetition
- **Minimal field sets** — fetch only fields currently used by screens; expand later when screens need more
- **Pagination supported from the start**: query functions accept `{ first?: number; after?: string }` params and return `pageInfo` (hasNextPage, endCursor)

### Smoke Test Approach
- Smoke test lives in **`scripts/test-shopify.ts`** — run from terminal with `npx ts-node scripts/test-shopify.ts`
- **Verbose output**: prints the first result from each service function call so data shape can be visually verified
- **Explicit handle check**: script lists available Shopify collection handles alongside the app's expected category handles — easy to spot mismatches
- **Kept permanently** as a unit smoke test in the repo (useful for onboarding and future env var verification)

### Claude's Discretion
- Exact ShopifyError class structure (fields, message format)
- How to run `scripts/test-shopify.ts` given Expo's module resolution (ts-node config, babel-register, etc.)
- Whether to split `lib/shopify-client.ts` into multiple files if it grows large
- Exact default value for `first` param in paginated queries

</decisions>

<specifics>
## Specific Ideas

- Keep the smoke test around as a permanent integration check — treat it like a "is my setup working?" tool for any dev who clones the repo
- Collection handle validation in the smoke test should print both sides: what Shopify returns AND what the app expects, so mismatches are immediately obvious

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-shopify-service-layer*
*Context gathered: 2026-02-19*
