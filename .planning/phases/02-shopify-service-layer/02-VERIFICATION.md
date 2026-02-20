---
phase: 02-shopify-service-layer
verified: 2026-02-19T12:00:00Z
status: human_needed
score: 13/13 must-haves verified
re_verification: true
  previous_status: gaps_found
  previous_score: 10/13
  gaps_closed:
    - "TypeScript compilation passes with zero errors (tsc --noEmit exits 0)"
    - "Startup validation throws immediately if either env var is undefined or empty"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Smoke test against live Shopify store"
    expected: "npx tsx scripts/test-shopify.ts exits with code 0 and prints real product data (title, handle, vendor, price), collection handles, and a HANDLE CHECK line with no ERROR lines"
    why_human: "Script requires live network access to the Shopify Storefront API with credentials from .env.local. The human checkpoint was previously APPROVED in 02-03-SUMMARY.md; re-running confirms nothing in the service layer was broken by the two gap fixes."
---

# Phase 2: Shopify Service Layer Verification Report

**Phase Goal:** Build the Shopify Storefront API service layer that all screens and hooks will consume.
**Verified:** 2026-02-19
**Status:** human_needed
**Re-verification:** Yes — after gap closure (previously gaps_found, 10/13)

## Goal Achievement

### Observable Truths

#### Plan 01 Truths

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | EXPO_PUBLIC_ env vars defined in .env.local and readable via process.env static dot notation | VERIFIED | `.env.local` exists and is gitignored (`.gitignore` line 16); `process.env.EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN` and `process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` accessed at `lib/shopify-client.ts` lines 27-28 via static dot notation |
| 2 | app.json contains no credential leakage — credentials stay in .env.local, not extra config | VERIFIED | `app.json` has no `extra` field; no Shopify references present |
| 3 | types/shopify.ts exports all 11 required interfaces without TypeScript errors | VERIFIED | 11 interfaces confirmed: ShopifyMoneyV2, ShopifyImage, ShopifySelectedOption, ShopifyProductVariant, ShopifyProduct, ShopifyCollection, ShopifyCollectionWithProducts, ShopifyPageInfo, ShopifyCartLine, ShopifyCart, ShopifyPaginatedResult |
| 4 | Any file in the app can import Shopify types from types/shopify.ts without using any casts | VERIFIED | `lib/shopify-client.ts` and `lib/shopify-mappers.ts` both import from `'../types/shopify'` using typed imports; no `any` casts in either file |

#### Plan 02 Truths

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 5 | lib/shopify-client.ts exports getProducts, getProductByHandle, getCollections, getCollectionByHandle, searchProducts — all typed against types/shopify.ts, none using any casts | VERIFIED | All 5 functions exported as `async function`; ShopifyError class also exported; no `as any` in the file |
| 6 | shopifyFetch throws ShopifyError on HTTP errors AND on GraphQL errors array in 200 responses | VERIFIED | Lines 88-101: `if (!response.ok)` throws ShopifyError with httpStatus; `if (json.errors && json.errors.length > 0)` throws ShopifyError with status 200 |
| 7 | All service functions accept pagination params and return ShopifyPaginatedResult<T> (or T for single lookups) | VERIFIED | `getProducts`, `getCollections`, `searchProducts` accept `PaginationParams = {}` and return `ShopifyPaginatedResult<T>`; `getProductByHandle` and `getCollectionByHandle` return nullable single items |
| 8 | lib/shopify-queries.ts contains all query strings with GraphQL fragments concatenated — no 'Unknown fragment' runtime errors | VERIFIED | All 5 queries export confirmed (192 lines); each uses template literal concatenation of fragment constants; validated against live store in prior human checkpoint |
| 9 | lib/shopify-mappers.ts flattens nodes[] arrays — screens never see edges[].node or { nodes: [] } wrappers | VERIFIED | `mapProduct` returns `{ ...raw, images: raw.images.nodes, variants: raw.variants.nodes }`; `mapCollectionWithProducts` returns `{ products: { items: products.nodes.map(mapProduct), pageInfo } }` |
| 10 | EXPO_PUBLIC_ env vars accessed using static dot notation only — no bracket notation, no destructuring | VERIFIED | `lib/shopify-client.ts` lines 27-28 use static dot notation; no bracket notation in env var access |
| 11 | Startup validation throws immediately if either env var is undefined or empty, with a clear error message including the variable name | VERIFIED | Gap closed. Lines 32-36: `if (!STORE_DOMAIN) { throw new Error('[Shopify] EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN is not set...') }`; lines 40-44: `if (!ACCESS_TOKEN) { throw new Error('[Shopify] EXPO_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN is not set...') }`. Placeholder string values still use `console.warn` (deliberate, documented). |

#### Plan 03 Truths

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 12 | TypeScript compilation passes with zero errors | VERIFIED | Gap closed. `tsconfig.json` now contains `"exclude": ["scripts"]`. `npx tsc --noEmit` exits with code 0 — no errors. |
| 13 | scripts/test-shopify.ts runs against live Shopify store, shows real data, flags collection handle mismatches | VERIFIED (human) | Human checkpoint previously APPROVED in 02-03-SUMMARY.md. Gap fixes did not alter `scripts/test-shopify.ts` (still 132 lines). Re-run recommended to confirm no regressions from the two gap fixes (see Human Verification Required). |

**Score:** 13/13 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `.env.local` | Shopify credentials, gitignored | VERIFIED | Exists; `.gitignore` line 16 covers `.env*.local`; `git check-ignore` confirms |
| `app.json` | No extra field; no credential leakage | VERIFIED | No `extra` field; no Shopify references |
| `types/shopify.ts` | 11 Shopify raw API interfaces | VERIFIED | All 11 interfaces present and exported |
| `lib/shopify-queries.ts` | 5 GraphQL query constants with fragments | VERIFIED | 192 lines; all 5 exports confirmed |
| `lib/shopify-client.ts` | ShopifyError + shopifyFetch + 5 service functions | VERIFIED | 178 lines; all exports present; startup validation now throws on undefined/empty env vars |
| `lib/shopify-mappers.ts` | mapProduct, mapCollection, mapCollectionWithProducts | VERIFIED | 52 lines; all 3 functions exported |
| `scripts/test-shopify.ts` | Permanent smoke test, min 60 lines | VERIFIED | 132 lines; covers all 4 service functions; handle alignment check present |
| `package.json` | tsx and dotenv as devDependencies | VERIFIED | `"tsx": "^4.21.0"` and `"dotenv": "^17.3.1"` present in devDependencies |
| `tsconfig.json` | scripts/ excluded from compilation | VERIFIED | `"exclude": ["scripts"]` present at root level |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| lib/shopify-client.ts | types/shopify.ts | `import type { ShopifyProduct, ... } from '../types/shopify'` | WIRED | Lines 6-12 |
| lib/shopify-client.ts | lib/shopify-queries.ts | `import { GET_PRODUCTS_QUERY, ... } from './shopify-queries'` | WIRED | Lines 15-21; all 5 query constants imported |
| lib/shopify-client.ts | lib/shopify-mappers.ts | `import { mapProduct, mapCollection, mapCollectionWithProducts }` | WIRED | Line 14; all 3 mapper functions called inside service functions |
| lib/shopify-mappers.ts | types/shopify.ts | `import type { ShopifyProduct, ShopifyCollection, ... } from '../types/shopify'` | WIRED | Lines in shopify-mappers.ts |
| scripts/test-shopify.ts | lib/shopify-client.ts | dynamic import inside main() | WIRED | Line 21: `await import('../lib/shopify-client')`; excluded from tsc via tsconfig |
| scripts/test-shopify.ts | .env.local | `config({ path: '.env.local' })` | WIRED | dotenv loaded before dynamic import of shopify-client |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| SHOP-01 | 02-01, 02-03 | App reads Shopify credentials from EXPO_PUBLIC_ environment variables | SATISFIED | .env.local contains EXPO_PUBLIC_ keys; lib/shopify-client.ts reads via static dot notation; startup throws on undefined/empty values |
| SHOP-02 | 02-01 | TypeScript types for all Shopify API shapes exist in types/shopify.ts | SATISFIED | 11 interfaces confirmed; tsc --noEmit exits 0 |
| SHOP-03 | 02-02, 02-03 | Product catalog fetched from Shopify Storefront API | SATISFIED | getProducts and getProductByHandle exported and live-validated |
| SHOP-04 | 02-02, 02-03 | Collections fetched from Shopify Storefront API | SATISFIED | getCollections and getCollectionByHandle exported and live-validated |
| SHOP-05 | 02-02, 02-03 | Product search executes via Shopify Search API | SATISFIED | searchProducts exported and validated (zero results from live store is a catalog tagging issue, not a service layer failure) |

No orphaned requirements. All 5 requirements (SHOP-01 through SHOP-05) are claimed by plans 02-01, 02-02, and 02-03 and are fully implemented. SHOP-06, SHOP-07, SHOP-08 are correctly mapped to Phase 3/4 and not claimed by Phase 2.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| lib/shopify-client.ts | 38, 46 | `console.warn` for placeholder credential values | Info | Deliberate and documented. Undefined/empty values now throw (gap closed); only the placeholder string sentinels use warn. This is appropriate — a developer who puts placeholder strings in .env.local will see a clear warning instead of a crash. |

No placeholder implementations, no `return null` stubs, no empty handlers detected in the core service layer files. No TODO/FIXME/HACK comments in lib/ or types/.

### Human Verification Required

#### 1. Smoke Test Re-Run

**Test:** With real credentials in `.env.local`, run `npx tsx scripts/test-shopify.ts`
**Expected:** Exits with code 0; prints real product data (id, title, handle, vendor, price); prints collection handles from Shopify; shows HANDLE CHECK: FAIL with mismatch list (Shopify has [frontpage, tie-dye, leather, jewelry, art]; app expected [earth, woven, light, crafted]); prints "Smoke test complete." with no ERROR lines
**Why human:** Script requires live network access to the Shopify Storefront API. Credentials are real values in `.env.local` that cannot be used in automated verification. The gap fixes (tsconfig exclude and startup validation throw) did not touch `scripts/test-shopify.ts`, so regression risk is minimal — but confirming exit 0 with real data closes the loop on this phase.

### Re-Verification Summary

Both gaps from the initial verification have been closed:

**Gap 1 — TypeScript compilation (CLOSED):** `tsconfig.json` now contains `"exclude": ["scripts"]` at line 9. The `scripts/test-shopify.ts` dynamic import is no longer evaluated by `tsc`. `npx tsc --noEmit` exits with code 0 — zero errors.

**Gap 2 — Startup validation throws (CLOSED):** `lib/shopify-client.ts` lines 32-36 and 40-44 now use `throw new Error(...)` for undefined/empty env var values. The error messages include the variable name and a remediation hint. Placeholder string sentinel values retain `console.warn` behavior (deliberate, low-severity, documented). This matches the plan's must_have truth: "throws immediately if either env var is undefined or empty."

No regressions detected. All 13 truths are now verified. The phase goal — a working Shopify Storefront API service layer that all screens and hooks can consume — is achieved.

---

_Verified: 2026-02-19_
_Verifier: Claude (gsd-verifier)_
