---
phase: 01-prerequisites
plan: 03
subsystem: ui
tags: [react-native, safe-area-context, layout, screens, expo-router]

# Dependency graph
requires:
  - phase: 01-01
    provides: "components/layout/ directory created with FontErrorScreen"
provides:
  - "Screen component — base layout wrapper with SafeAreaView from safe-area-context and parchment background"
  - "ScrollScreen component — scrollable variant with SafeAreaView, ScrollView, and parchment background"
  - "All 12 app screens use Screen or ScrollScreen as root element — safe area and background enforced by default"
affects: [all-phases, ui, screens, phase-02, phase-03, phase-04, phase-05, phase-06, phase-07, phase-08, phase-09, phase-10]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "All screens use Screen or ScrollScreen as root element — never raw View or SafeAreaView from react-native"
    - "SafeAreaView always imported from 'react-native-safe-area-context', never from 'react-native'"
    - "Parchment background enforced at layout level — screens get it for free without per-screen styles"
    - "ScrollScreen provides default paddingBottom: 64 (spacing.huge) for tab bar clearance"
    - "Both components accept optional style and contentContainerStyle overrides for edge cases"

key-files:
  created:
    - components/layout/Screen.tsx
    - components/layout/ScrollScreen.tsx
  modified:
    - app/(tabs)/index.tsx
    - app/(tabs)/browse.tsx
    - app/(tabs)/cart.tsx
    - app/(tabs)/favorites.tsx
    - app/(tabs)/profile.tsx
    - app/product/[id].tsx
    - app/blog/index.tsx
    - app/blog/[id].tsx
    - app/maker/[id].tsx
    - app/checkout.tsx
    - app/about.tsx
    - app/faq.tsx

key-decisions:
  - "Screen wraps SafeAreaView only (no ScrollView) — stub screens and screens with internal scroll managers use Screen"
  - "ScrollScreen wraps SafeAreaView + ScrollView — long-form content screens (home, blog detail, checkout, about, faq) use ScrollScreen"
  - "parchment background set on both SafeAreaView and ScrollView in ScrollScreen — prevents flash of different background on bounce overscroll"
  - "Removed redundant StyleSheet.create container styles from stub screens after switching to Screen wrapper"
  - "Home screen index.tsx had SafeAreaView from react-native (wrong package) — replaced with ScrollScreen, eliminating the deprecated import"

patterns-established:
  - "Screen pattern: import Screen from 'components/layout/Screen' and use as root JSX element"
  - "ScrollScreen pattern: import ScrollScreen from 'components/layout/ScrollScreen' for scrollable content"
  - "Never import SafeAreaView from 'react-native' — always from 'react-native-safe-area-context'"

requirements-completed: [PLAT-02]

# Metrics
duration: 8min
completed: 2026-02-20
---

# Phase 01 Plan 03: Screen Layout Components Summary

**Screen and ScrollScreen layout wrappers created; all 12 app screens migrated to use them — eliminating SafeAreaView from react-native and enforcing parchment background by default**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-02-20
- **Completed:** 2026-02-20
- **Tasks:** 2
- **Files modified:** 14 (2 created, 12 modified)

## Accomplishments
- Created `components/layout/Screen.tsx` — SafeAreaView (safe-area-context) + parchment background, accepts optional style override
- Created `components/layout/ScrollScreen.tsx` — SafeAreaView + ScrollView with parchment on both layers, 64px bottom padding, hides scroll indicator
- Migrated all 12 screens: replaced raw `<View>` stubs and the incorrect `SafeAreaView from 'react-native'` in home screen with Screen or ScrollScreen
- Eliminated the deprecated/broken `SafeAreaView` import from `react-native` in `app/(tabs)/index.tsx`
- All future screens get correct safe area handling and parchment background for free by importing Screen or ScrollScreen

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Screen and ScrollScreen layout components** - (feat commit — pending git access)
2. **Task 2: Update all 12 screens to use Screen or ScrollScreen** - (feat commit — pending git access)

**Plan metadata:** (docs commit — pending git access)

## Files Created/Modified
- `components/layout/Screen.tsx` — Base layout wrapper: SafeAreaView from react-native-safe-area-context, parchment background, optional style prop
- `components/layout/ScrollScreen.tsx` — Scrollable layout wrapper: SafeAreaView + ScrollView, parchment on both, 64px bottom padding, no scroll indicator
- `app/(tabs)/index.tsx` — Replaced SafeAreaView (wrong pkg) + ScrollView with ScrollScreen; removed unused StyleSheet
- `app/(tabs)/browse.tsx` — Replaced View+StyleSheet stub with Screen
- `app/(tabs)/cart.tsx` — Replaced View+StyleSheet stub with Screen
- `app/(tabs)/favorites.tsx` — Replaced View+StyleSheet stub with Screen
- `app/(tabs)/profile.tsx` — Replaced View+StyleSheet stub with Screen
- `app/product/[id].tsx` — Replaced View+StyleSheet stub with Screen
- `app/blog/index.tsx` — Replaced View+StyleSheet stub with Screen
- `app/blog/[id].tsx` — Replaced View+StyleSheet stub with ScrollScreen (long-form article content)
- `app/maker/[id].tsx` — Replaced View+StyleSheet stub with Screen
- `app/checkout.tsx` — Replaced View+StyleSheet stub with ScrollScreen (multi-step form)
- `app/about.tsx` — Replaced View+StyleSheet stub with ScrollScreen (long-form brand story)
- `app/faq.tsx` — Replaced View+StyleSheet stub with ScrollScreen (accordion list)

## Decisions Made
- Screen (not ScrollScreen) for stub screens that will manage their own internal scroll in future phases — avoids double-wrapping ScrollView
- ScrollScreen for home, blog detail, checkout, about, and faq — these are definitively long-form scrollable content based on design specs
- Parchment background applied to both SafeAreaView and ScrollView in ScrollScreen — prevents color flash on iOS overscroll bounce
- Removed StyleSheet imports and container styles from stub screens entirely when they became empty after migration

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed unused `colors` import from index.tsx after removing StyleSheet**
- **Found during:** Task 2 (index.tsx migration)
- **Issue:** After removing the StyleSheet that used `colors.parchment`, the `colors` named import from constants/theme became unused — TypeScript would flag this
- **Fix:** Removed `colors` from the destructured import: `import { copy, productCategories } from '../../constants/theme'`
- **Files modified:** `app/(tabs)/index.tsx`
- **Verification:** Import line reviewed — only used identifiers remain

---

**Total deviations:** 1 auto-fixed (Rule 1 — unused import cleanup)
**Impact on plan:** Minimal cleanup necessary for TypeScript correctness. No scope creep.

## Issues Encountered
- Bash tool unavailable during this session — git commits and TypeScript verification (`npx tsc --noEmit`) could not be run automatically. All file creation and editing was verified by re-reading files with the Read tool. Commits need to be made manually or when Bash access is restored.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- Screen and ScrollScreen components are available for all future phases — import and use as root element
- All 12 existing screens are correctly wrapped
- Phase 01 Plan 04 can proceed

---
*Phase: 01-prerequisites*
*Completed: 2026-02-20*

## Self-Check: PARTIAL

Files verified by Read tool:
- components/layout/Screen.tsx: FOUND — imports SafeAreaView from 'react-native-safe-area-context', applies colors.parchment
- components/layout/ScrollScreen.tsx: FOUND — imports SafeAreaView from 'react-native-safe-area-context', applies colors.parchment on both layers
- app/(tabs)/index.tsx: FOUND — uses ScrollScreen, no SafeAreaView from react-native
- app/(tabs)/browse.tsx: FOUND — uses Screen
- app/(tabs)/cart.tsx: FOUND — uses Screen
- app/(tabs)/favorites.tsx: FOUND — uses Screen
- app/(tabs)/profile.tsx: FOUND — uses Screen
- app/product/[id].tsx: FOUND — uses Screen
- app/blog/index.tsx: FOUND — uses Screen
- app/blog/[id].tsx: FOUND — uses ScrollScreen
- app/maker/[id].tsx: FOUND — uses Screen
- app/checkout.tsx: FOUND — uses ScrollScreen
- app/about.tsx: FOUND — uses ScrollScreen
- app/faq.tsx: FOUND — uses ScrollScreen

Git commits: PENDING — Bash tool unavailable; commits must be made with Bash access
TypeScript check: PENDING — npx tsc --noEmit could not be run without Bash
