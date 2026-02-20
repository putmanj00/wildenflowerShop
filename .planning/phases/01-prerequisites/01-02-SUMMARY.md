---
phase: 01-prerequisites
plan: 02
subsystem: ui
tags: [react-native-web, platform-select, shadows, expo, cross-platform]

# Dependency graph
requires: []
provides:
  - Shadow tokens with Platform.select web fallbacks (CSS boxShadow) in constants/theme.ts
  - Tab bar inline shadow with web boxShadow fallback in app/(tabs)/_layout.tsx
affects:
  - All components that spread shadow tokens (ProductCard, HeroCard, PrimaryButton)
  - Web rendering of any screen with the bottom tab bar

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Platform.select with web/default keys for cross-platform style tokens"
    - "CSS rgba color strings baked into boxShadow for web (opacity not separate)"

key-files:
  created: []
  modified:
    - constants/theme.ts
    - app/(tabs)/_layout.tsx

key-decisions:
  - "Use Platform.select with web/default keys rather than RN 0.76 native boxShadow prop (known Expo SDK 52 dev build issues with native boxShadow)"
  - "Bake opacity into rgba strings for CSS boxShadow (CSS has no separate opacity property on shadows)"

patterns-established:
  - "Platform.select spread pattern: ...Platform.select({ web: { boxShadow: '...' }, default: { shadowColor, shadowOffset, ... } }) applies everywhere shadows are needed"

requirements-completed:
  - PLAT-01

# Metrics
duration: 2min
completed: 2026-02-20
---

# Phase 1 Plan 02: Web Shadow Fallbacks Summary

**Platform.select web fallbacks added to all four shadow tokens and the tab bar inline shadow, eliminating react-native-web deprecation warnings**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-20T01:15:56Z
- **Completed:** 2026-02-20T01:17:59Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Updated all four shadow variants (sm, md, lg, glow) in `constants/theme.ts` to use `Platform.select` with CSS `boxShadow` for web and native shadow props for iOS/Android
- Added `Platform` import to `constants/theme.ts`
- Replaced five inline native shadow props in `app/(tabs)/_layout.tsx` `tabBarStyle` with `Platform.select` spread including upward shadow CSS string for web
- Added `Platform` import to `app/(tabs)/_layout.tsx`
- TypeScript check passes (no new errors introduced)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Platform.select web fallbacks to shadow tokens in theme.ts** - `b6d9b65` (feat)
2. **Task 2: Fix inline tab bar shadow in tabs layout** - `5613bea` (feat)

**Plan metadata:** _(pending final commit)_

## Files Created/Modified
- `constants/theme.ts` - Added Platform import; replaced shadows export with Platform.select variants for all four shadow tokens (sm, md, lg, glow)
- `app/(tabs)/_layout.tsx` - Added Platform import; replaced five native shadow props in tabBarStyle with Platform.select spread

## Decisions Made
- Used `Platform.select` with `web`/`default` keys instead of React Native 0.76's native `boxShadow` prop — there are known Expo SDK 52 issues with native `boxShadow` in dev builds
- Baked opacity into rgba color strings for CSS `boxShadow` (e.g., `rgba(59, 47, 47, 0.08)`) since CSS `boxShadow` has no separate opacity property
- Kept the same visual appearance across platforms — shadow sizes/intensities are matched between CSS and native values

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing TypeScript error in `app/_layout.tsx` for missing `FontErrorScreen` component — out of scope for this plan, logged for future reference. Not introduced by this plan's changes.

## Next Phase Readiness
- Shadow tokens are now cross-platform safe — components spreading `...shadows.sm`, `...shadows.md`, `...shadows.lg`, `...shadows.glow` will render correctly on web without deprecation warnings
- Tab bar shadow renders correctly on web with upward `boxShadow`
- Native behavior unchanged — iOS and Android still use existing `shadowColor`/`elevation` props

---
*Phase: 01-prerequisites*
*Completed: 2026-02-20*
