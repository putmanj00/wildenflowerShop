# Phase 1: Prerequisites - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix three blocking issues so the app boots cleanly on Expo Web before any feature work begins: font loading (Playfair Display and Lora), SafeAreaView imports (react-native-safe-area-context), and web shadow rendering (boxShadow CSS fallbacks). Also establish a reusable Screen component pattern that all future phases will rely on. Validate the full web baseline across all screens.

</domain>

<decisions>
## Implementation Decisions

### Font loading UX
- Hold the Expo splash screen visible until Playfair Display and Lora are fully loaded — no layout flash
- If fonts fail to load: show an on-brand, poetic error screen (e.g., "The flowers are still waking up…") that stays in the Wildenflower voice
- Error screen includes a single retry button — no "continue with system fonts" fallback

### Shadow abstraction
- Add shadow style tokens to `constants/theme.ts` using `Platform.select` — shadows are imported like any other theme token, not written inline per-component
- Researcher should audit existing shadow usage in the codebase and create tokens that match what's already there (don't invent new variants)

### Screen wrapper pattern
- Create two reusable layout components at `components/layout/Screen.tsx`:
  - `Screen` — enforces correct SafeAreaView from `react-native-safe-area-context` + parchment background
  - `ScrollScreen` — same as Screen but with a ScrollView variant for scrollable screens
- Update all existing screens to use Screen or ScrollScreen
- All future phases use these components — SafeAreaView and parchment background are correct by default

### Web validation scope
- Validate ALL screens in the app on Expo Web (`npx expo start --web`), not just tab screens
- Confirmation method: manual check + checklist comment documenting which screens were validated and any issues found

### Claude's Discretion
- Exact wording of the on-brand font error message
- Whether Screen and ScrollScreen accept style overrides or are fixed
- Internal implementation of `Platform.select` shadow tokens (exact CSS boxShadow values)

</decisions>

<specifics>
## Specific Ideas

- The font error screen should feel like a gentle Wildenflower moment, not a technical error — poetic language, on-brand tone
- Screen component is foundational; all future phases depend on it being solid

</specifics>

<deferred>
## Deferred Ideas

- **Animated splash screen** using Google Flow/Veo and Google Whisk — user wants a custom animated splash; this belongs in Phase 9 (Content Screens + Assets) or its own phase
- **Full TDD infrastructure** — unit tests, API tests, and Playwright UI tests; user wants TDD with Playwright for UI testing; this is its own phase, to be inserted after Phase 1 or as Phase 1.1

</deferred>

---

*Phase: 01-prerequisites*
*Context gathered: 2026-02-19*
