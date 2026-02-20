# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-19)

**Core value:** Every screen faithfully matches the Weavy mockups with live Shopify data — enchanted artisan shopping experience on web first, then native.
**Current focus:** Phase 7 — Cart + Checkout (COMPLETE) — Beginning Phase 8 planning

## Current Position

Phase: 7 of 10 (Cart + Checkout) — COMPLETE
Plan: 2 of 2 in current phase — COMPLETE
Status: Phase 7 Complete — Cart screen human-verified; COMM-04 satisfied; end-to-end browse-to-checkout flow confirmed
Last activity: 2026-02-20 — 07-02: Phase 7 closed — Cart screen human-verified on Expo Web



Progress: [██████░░░░] 60%

## Performance Metrics

**Velocity:**
- Total plans completed: 9
- Average duration: 9.0 min
- Total execution time: 1.35 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-prerequisites P01 | 7 min | 2 tasks | 2 files |
| 01-prerequisites P02 | 2 min | 2 tasks | 2 files |
| 01-prerequisites P03 | 8 min | 2 tasks | 14 files |
| 01-prerequisites P04 | ~10 min | 1 task (checkpoint) | 1 file |
| 02-shopify-service-layer P01 | 2 min | 2 tasks | 3 files |
| 02-shopify-service-layer P02 | ~2 min | 2 tasks | 3 files |
| 02-shopify-service-layer P03 | ~30 min | 2 tasks | 2 files |
| 03-cartcontext-upgrade P01 | ~10 min | 4 tasks | 3 files |
| 03-cartcontext-upgrade P02 | 2 min | 2 tasks | 2 files |
| 03-cartcontext-upgrade P03 | ~10 min | 1 task + 2 deviations | 3 files |
| 04-data-hooks-checkout-wiring P01 | ~3 min | 2 tasks | 5 files |
| 04-data-hooks-checkout-wiring P02 | ~4 min | 1 task | 1 file |
| 05-home-screen P01 | 2 min | 3 tasks | 3 files |
| 05-home-screen P02 | 1 min | 1 task | 1 file |
| 05-home-screen P03 | ~10 min | 1 checkpoint + 1 fix | 2 files |

- Total plans completed: 10
- Average duration: 8.7 min
- Total execution time: ~1.45 hours

**Recent Trend:**
- Last 5 plans: ~10 min, 2 min, ~10 min, 2 min, ~10 min
- Trend: Fast

*Updated after each plan completion*
| Phase 05-home-screen P03 | ~10 min | 1 checkpoint + 1 fix | 2 files |
| Phase 06-browse-product-detail P01 | 2 | 2 tasks | 2 files |
| Phase 06-browse-product-detail P02 | 2 min | 1 task | 1 file |
| Phase 06-browse-product-detail P03 | 2 min | 2 tasks | 2 files |
| Phase 06-browse-product-detail P04 | 5 | 1 tasks | 1 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: Shopify service layer is a hard prerequisite — no screen work starts until Phase 2 is complete and smoke-tested
- [Roadmap]: CartContext upgraded in-place (Phase 3) rather than replaced with Zustand — existing Context pattern is sufficient at this scale
- [Roadmap]: Customer auth deliberately deferred to Phase 10 — app must be fully usable as guest before auth is added
- [Roadmap]: Classic Customer API (email/password) used for v1 auth; OAuth2/PKCE deferred to v2
- [Roadmap]: `EXPO_PUBLIC_` prefix required for all Shopify env vars — highest-probability porting failure, must be resolved in Phase 2
- [Phase 01-prerequisites P01]: Native retry uses key-reset (retryKey state) on CartProvider — expo-updates not installed; best-effort remount approach
- [Phase 01-prerequisites P01]: FontErrorScreen uses system serif fallbacks only — fonts.* tokens unavailable when custom fonts fail to load
- [Phase 01-prerequisites P02]: Use Platform.select with web/default keys rather than RN 0.76 native boxShadow prop (known Expo SDK 52 dev build issues)
- [Phase 01-prerequisites P02]: Bake opacity into rgba strings for CSS boxShadow — CSS has no separate shadow opacity property
- [Phase 01-prerequisites P03]: Screen (not ScrollScreen) for stub screens — avoids double-wrapping ScrollView when screens add their own scroll in future phases
- [Phase 01-prerequisites P03]: Parchment applied to both SafeAreaView and ScrollView in ScrollScreen — prevents color flash on iOS overscroll bounce
- [Phase 01-prerequisites P03]: blog/[id], checkout, about, faq use ScrollScreen — definitively long-form scrollable content per design specs
- [Phase 01-prerequisites P04]: pointerEvents must be in style prop not View prop — react-native-web deprecation; fix applied to ProductCard
- [Phase 01-prerequisites P04]: Remove accessibilityRole="button" from outer TouchableOpacity card containers — renders nested <button> elements on web (HTML validity violation)
- [Phase 02-shopify-service-layer]: EXPO_PUBLIC_ + process.env pattern over Constants.expoConfig.extra — no extra dependency, TypeScript-typed, Expo SDK 49+ standard
- [Phase 02-shopify-service-layer]: types/shopify.ts separate from types/index.ts — raw Shopify API shapes never mixed with app-domain types
- [Phase 02-shopify-service-layer P02]: AppCollectionWithProducts uses plain interface extending ShopifyCollection (not conditional type) — simpler and TypeScript-compatible without as-any casts
- [Phase 02-shopify-service-layer P02]: shopifyFetch not exported — only the five service functions are the public API; internal implementation detail
- [Phase 02-shopify-service-layer P02]: Startup validation uses console.warn (not throw) — allows dev app to load and show clear message without crashing on placeholder credentials
- [Phase 02-shopify-service-layer P03]: Dynamic import used for shopify-client in smoke test — static import caused dotenv race condition; dynamic import guarantees env vars are set before module evaluation
- [Phase 02-shopify-service-layer P03]: Collection handle mismatch flagged as pre-Phase 6 blocker (not Phase 5): Browse FilterChips map to Shopify collection handles; Home screen does not use collection filtering
- [Phase 03-cartcontext-upgrade P01]: CartLineSnapshot stores only variantId+quantity — full ShopifyCart too large and immediately stale for AsyncStorage recovery
- [Phase 03-cartcontext-upgrade P01]: getCart returns null for expired carts (not ShopifyError) — null is Shopify's documented contract for missing cart IDs, not an error
- [Phase 03-cartcontext-upgrade P01]: CART_LINES_FRAGMENT is private (not exported) — embedded via template literal interpolation; each mutation is self-contained over the wire
- [Phase 03-cartcontext-upgrade P01]: Cart service functions throw ShopifyError on userErrors — HTTP 200 cart mutations can still contain errors; callers must not rely on HTTP status alone
- [Phase 03-cartcontext-upgrade P02]: FavoritesProvider nested inside CartProvider — either order works since they are independent; this matches CONTEXT.md research pattern
- [Phase 03-cartcontext-upgrade P02]: favorites stored as string[] not Set — consistent with existing CartContext.favorites shape, simpler for AsyncStorage serialization in Phase 8
- [Phase 03-cartcontext-upgrade P02]: No AsyncStorage in FavoritesContext — memory-only clean receptacle; Phase 8 adds persistence
- [Phase 03-cartcontext-upgrade P03]: CartContext rewritten from useReducer/mock to Shopify-backed useState with AsyncStorage persistence — core Phase 3 deliverable
- [Phase 03-cartcontext-upgrade P03]: addToCart(variantId, quantity?) is the new public API — old addToCart(product: Product) removed intentionally
- [Phase 03-cartcontext-upgrade P03]: No persistent error state on CartContext — mutations return boolean; screens own error handling
- [Phase 03-cartcontext-upgrade P03]: No optimistic updates — state updates only after confirmed Shopify response; rollback on failure
- [Phase 03-cartcontext-upgrade P03]: updateQuantity routes quantity <= 0 to removeCartLines — avoids Shopify INVALID user error on cartLinesUpdate with quantity 0
- [Phase 03-cartcontext-upgrade P03]: index.tsx and ProductGrid.tsx updated to use useFavorites() — auto-fix required because CartContext no longer exposes toggleFavorite/isFavorite
- [Phase 04-data-hooks-checkout-wiring P01]: queryFn excluded from useShopifyQuery useEffect deps — callers must provide stable useCallback reference (documented in JSDoc)
- [Phase 04-data-hooks-checkout-wiring P01]: loading vs isRefetching: loading=true only when data===null AND error===null (initial fetch); isRefetching=true on all subsequent refetch() calls
- [Phase 04-data-hooks-checkout-wiring P01]: Screens import hooks only — never lib/shopify-client directly (established abstraction boundary)
- [Phase 04-data-hooks-checkout-wiring P01]: openCheckout uses Platform.OS check: web uses window.location.href, native uses Linking.openURL
- [Phase 04-data-hooks-checkout-wiring P01]: updateCartState() helper ensures checkoutUrl stays in sync after every cart mutation
- [Phase 04-data-hooks-checkout-wiring P02]: checkoutUrl never persisted to AsyncStorage — Shopify checkout URLs expire; always re-derived from live cart response
- [Phase 04-data-hooks-checkout-wiring P02]: openCheckout() is synchronous void — critical for web popup-blocker compliance; no async/await
- [Phase 04-data-hooks-checkout-wiring P02]: Rollback parity — every setCart(previousCart) rollback paired with setCheckoutUrl(previousCart?.checkoutUrl ?? null)
- [Phase 06-browse-product-detail]: useProducts manages its own product/cursor/pageInfo state directly — useShopifyQuery only handles single fetch results and cannot accumulate pages
- [Phase 06-browse-product-detail]: productCategories corrected to 4 confirmed Shopify handles (tie-dye, leather, jewelry, art); crystals/ceramics removed, artwork renamed to art; resolves pre-Phase 6 collection handle mismatch blocker
- [Phase 06-browse-product-detail]: loadMore returned as null (not undefined) when no next page; consumers use loadMore and Button pattern without extra hasNextPage check
- [Phase 06-browse-product-detail P02]: BotanicalHeader variant='small' used for Browse compact header — component only accepts 'large'|'small', not 'compact'
- [Phase 06-browse-product-detail P02]: mapAppProductToProduct stores handle in id field for correct /product/[handle] routing (Browse); home screen index.tsx still uses GID — plan 03 will align
- [Phase 06-browse-product-detail P02]: FilterChipRow is inline in browse.tsx with rgba(208,139,122,0.4) active chip background (dustyRose at 40% opacity)
- [Phase 06-browse-product-detail P03]: mapAppProductToProduct maps p.handle (not p.id) to Product.id — both Home and Browse now consistently use handle for /product/ routing
- [Phase 06-browse-product-detail P03]: Product options derived from variant.selectedOptions since ShopifyProduct type has no options field
- [Phase 06-browse-product-detail P03]: Single-variant products (title==='Default Title') auto-select and skip option picker UI — standard Shopify pattern for non-configurable products
- [Phase 06-browse-product-detail P03]: Product Detail uses Screen + internal ScrollView (not ScrollScreen) to allow sticky bottom bar outside scroll area
- [Phase 06-browse-product-detail P04]: GET_COLLECTION_BY_HANDLE_QUERY must use ...ProductFragment — minimal inline product shape caused mapProduct to throw at runtime; all product-fetching queries must spread the shared fragment
- [Phase 06-browse-product-detail]: GET_COLLECTION_BY_HANDLE_QUERY must use ...ProductFragment — minimal inline product shape caused mapProduct to throw at runtime; all product-fetching queries must spread the shared fragment

### Pending Todos

None yet.

### Blockers/Concerns

- [Pre-Phase 6 — RESOLVED in 06-01]: Shopify collection handle mismatch — resolved by updating productCategories to use confirmed handles (tie-dye, leather, jewelry, art). Option 2 chosen: app updated to use actual Shopify handles.
- [Pre-Phase 3 — CARRY FORWARD]: Shopify cart expiry null-response shape needs validation with a real test cart (documented as null but unconfirmed) — CartContext recovery logic depends on this; monitor in Phase 5 Cart Screen work.
- [Pre-Phase 6]: `react-native-reanimated-carousel` web compatibility in Reanimated 3.16.x — verify before committing to it in Phase 6; fallback is gesture-handler ScrollView with prev/next buttons

## Session Continuity

Last session: 2026-02-20
Stopped at: Completed 06-04-PLAN.md — Phase 6 human verification approved; all 20 checklist items passed; ProductFragment bug fix committed (249743b). Phase 6 complete. Next: Phase 7 — Cart Screen.
Resume file: None
