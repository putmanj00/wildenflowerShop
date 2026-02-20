# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-19)

**Core value:** Every screen faithfully matches the Weavy mockups with live Shopify data — enchanted artisan shopping experience on web first, then native.
**Current focus:** Phase 1 — Prerequisites

## Current Position

Phase: 1 of 10 (Prerequisites)
Plan: 2 of TBD in current phase
Status: In Progress
Last activity: 2026-02-20 — Plan 01-02 complete: Platform.select shadow fallbacks for web

Progress: [░░░░░░░░░░] 4%

## Performance Metrics

**Velocity:**
- Total plans completed: 2
- Average duration: 5 min
- Total execution time: 0.15 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-prerequisites P01 | 7 min | 2 tasks | 2 files |
| 01-prerequisites P02 | 2 min | 2 tasks | 2 files |

**Recent Trend:**
- Last 5 plans: 7 min, 2 min
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

### Pending Todos

None yet.

### Blockers/Concerns

- [Pre-Phase 2]: Shopify store collection handles must match app's expected values (e.g., `earth`, `woven`) — validate during Phase 2 smoke testing
- [Pre-Phase 3]: Shopify cart expiry null-response shape needs validation with a real test cart (documented as null but unconfirmed)
- [Pre-Phase 6]: `react-native-reanimated-carousel` web compatibility in Reanimated 3.16.x — verify before committing to it in Phase 6; fallback is gesture-handler ScrollView with prev/next buttons

## Session Continuity

Last session: 2026-02-20
Stopped at: Completed 01-02-PLAN.md — Platform.select shadow fallbacks added to theme.ts and tabs layout
Resume file: None
