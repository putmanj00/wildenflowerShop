# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-19)

**Core value:** Every screen faithfully matches the Weavy mockups with live Shopify data — enchanted artisan shopping experience on web first, then native.
**Current focus:** Phase 1 — Prerequisites

## Current Position

Phase: 1 of 10 (Prerequisites)
Plan: 0 of TBD in current phase
Status: Ready to plan
Last activity: 2026-02-19 — Roadmap created; 10 phases derived from 27 v1 requirements

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: — min
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: —
- Trend: —

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

### Pending Todos

None yet.

### Blockers/Concerns

- [Pre-Phase 2]: Shopify store collection handles must match app's expected values (e.g., `earth`, `woven`) — validate during Phase 2 smoke testing
- [Pre-Phase 3]: Shopify cart expiry null-response shape needs validation with a real test cart (documented as null but unconfirmed)
- [Pre-Phase 6]: `react-native-reanimated-carousel` web compatibility in Reanimated 3.16.x — verify before committing to it in Phase 6; fallback is gesture-handler ScrollView with prev/next buttons

## Session Continuity

Last session: 2026-02-19
Stopped at: Roadmap written; REQUIREMENTS.md traceability updated; STATE.md initialized
Resume file: None
