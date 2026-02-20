# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-19)

**Core value:** Every screen faithfully matches the Weavy mockups with live Shopify data — enchanted artisan shopping experience on web first, then native.
**Current focus:** Phase 3 — CartContext Upgrade (Phase 2 complete)

## Current Position

Phase: 3 of 10 (CartContext Upgrade)
Plan: 2 of 3 in current phase
Status: In Progress
Last activity: 2026-02-20 — Plan 03-02 complete: FavoritesContext extracted from CartContext into memory-only standalone context; FavoritesProvider wired into root layout

Progress: [████░░░░░░] 26%

## Performance Metrics

**Velocity:**
- Total plans completed: 6
- Average duration: 9.8 min
- Total execution time: 0.98 hours

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

**Recent Trend:**
- Last 5 plans: 8 min, ~10 min, 2 min, ~10 min, 2 min
- Trend: Fast

*Updated after each plan completion*

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
- [Phase 03-cartcontext-upgrade P02]: FavoritesProvider nested inside CartProvider — either order works since they are independent; this matches CONTEXT.md research pattern
- [Phase 03-cartcontext-upgrade P02]: favorites stored as string[] not Set — consistent with existing CartContext.favorites shape, simpler for AsyncStorage serialization in Phase 8
- [Phase 03-cartcontext-upgrade P02]: No AsyncStorage in FavoritesContext — memory-only clean receptacle; Phase 8 adds persistence

### Pending Todos

None yet.

### Blockers/Concerns

- [Pre-Phase 6 — CONFIRMED BLOCKER]: Shopify collection handle mismatch — smoke test confirmed Shopify store bgh9hd-rq.myshopify.com has handles [frontpage, tie-dye, leather, jewelry, art]; app's Browse FilterChips expect [earth, woven, light, crafted]; all 4 expected handles are missing. Must resolve before Phase 6 Browse screen work. Options: (1) add collections in Shopify Admin matching expected handles, (2) update app FilterChips to use actual Shopify handles, (3) add a mapping layer in service layer. Decision required pre-Phase 6.
- [Pre-Phase 3]: Shopify cart expiry null-response shape needs validation with a real test cart (documented as null but unconfirmed)
- [Pre-Phase 6]: `react-native-reanimated-carousel` web compatibility in Reanimated 3.16.x — verify before committing to it in Phase 6; fallback is gesture-handler ScrollView with prev/next buttons

## Session Continuity

Last session: 2026-02-20
Stopped at: Completed 03-02-PLAN.md — FavoritesContext extracted from CartContext; FavoritesProvider wired into root layout; Plan 03-03 (CartContext rewrite to use Shopify cart API) is next
Resume file: None
