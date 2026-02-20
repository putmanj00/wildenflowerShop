# Phase 1: Prerequisites - Research

**Researched:** 2026-02-19
**Domain:** Expo SDK 52 / React Native 0.76 web baseline — fonts, safe areas, cross-platform shadows
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **Font loading UX:** Hold the Expo splash screen visible until Playfair Display and Lora are fully loaded — no layout flash. If fonts fail to load: show an on-brand, poetic error screen (e.g., "The flowers are still waking up…") that stays in the Wildenflower voice. Error screen includes a single retry button — no "continue with system fonts" fallback.
- **Shadow abstraction:** Add shadow style tokens to `constants/theme.ts` using `Platform.select` — shadows are imported like any other theme token, not written inline per-component. Researcher should audit existing shadow usage in the codebase and create tokens that match what's already there (don't invent new variants).
- **Screen wrapper pattern:** Create two reusable layout components at `components/layout/Screen.tsx`: `Screen` (enforces correct SafeAreaView from `react-native-safe-area-context` + parchment background) and `ScrollScreen` (same but with ScrollView variant). Update all existing screens to use Screen or ScrollScreen. All future phases use these components — SafeAreaView and parchment background are correct by default.
- **Web validation scope:** Validate ALL screens in the app on Expo Web (`npx expo start --web`), not just tab screens. Confirmation method: manual check + checklist comment documenting which screens were validated and any issues found.

### Claude's Discretion

- Exact wording of the on-brand font error message
- Whether Screen and ScrollScreen accept style overrides or are fixed
- Internal implementation of `Platform.select` shadow tokens (exact CSS boxShadow values)

### Deferred Ideas (OUT OF SCOPE)

- **Animated splash screen** using Google Flow/Veo and Google Whisk — belongs in Phase 9 or its own phase
- **Full TDD infrastructure** — unit tests, API tests, and Playwright UI tests; this is its own phase, to be inserted after Phase 1 or as Phase 1.1
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ASSET-01 | Playfair Display (Regular, Bold, Italic) and Lora (Regular) fonts loaded via expo-font; font error state handled to prevent frozen splash | useFonts returns `[boolean, Error|null]`; splash hold pattern with SplashScreen.preventAutoHideAsync + conditional hideAsync on loaded OR error |
| PLAT-01 | `npx expo start --web` builds and runs without errors; all screens render in browser | Stub screens (plain `<View>`) already render; main risk is SafeAreaView from wrong package + shadow prop deprecation warnings turning into errors |
| PLAT-02 | SafeAreaView imported from `react-native-safe-area-context` (not `react-native`) on all screens | Only `app/(tabs)/index.tsx` currently uses SafeAreaView, and it imports from `react-native` (wrong); all other screens are stub Views; Screen component consolidates this |
</phase_requirements>

---

## Summary

Phase 1 has three technical problems to solve: (1) the font loading in `_layout.tsx` does not handle the error case — if fonts fail, the app freezes on a null return forever; (2) `app/(tabs)/index.tsx` imports `SafeAreaView` from `react-native` instead of `react-native-safe-area-context`, which is deprecated and incorrect on web; all other screens are plain `<View>` stubs with no safe area handling at all; (3) the `shadows` object in `constants/theme.ts` uses React Native shadow props that generate deprecation warnings on react-native-web 0.19+.

All three problems are straightforward to fix. No new packages need to be installed — `expo-font`, `expo-splash-screen`, and `react-native-safe-area-context` are already in `package.json` at the correct versions. The work is: fix `_layout.tsx` font error handling, add `Platform.select` web fallbacks to the shadow tokens in `theme.ts`, create `components/layout/Screen.tsx` and `ScrollScreen.tsx`, then update all screens to use them.

The Screen component is the highest-value deliverable: it encapsulates the correct SafeAreaView import, the parchment background, and (for ScrollScreen) the ScrollView, so every future phase gets these right for free. The font error screen requires a deliberate design decision about UI — per user decision, it must be on-brand (Wildenflower voice, retry button), not a generic error boundary.

**Primary recommendation:** Fix `_layout.tsx` font error handling first (highest risk — could freeze app); create Screen/ScrollScreen next (foundational for all other tasks); then fix shadow tokens (low-risk, eliminates console warnings on web).

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `expo-font` | ~13.0.0 (SDK 52) | Font loading via `useFonts` hook | Already installed; official Expo font solution |
| `expo-splash-screen` | ~0.29.0 (SDK 52) | Splash screen hold until fonts ready | Already installed; official API |
| `react-native-safe-area-context` | 4.12.0 | Safe area insets/SafeAreaView on all platforms including web | Already installed; required by Expo Router |
| `react-native-web` | ~0.19.13 | Web rendering layer for React Native | Already installed; powers Expo Web |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `Platform` (from `react-native`) | built-in | Conditional style application per platform | For shadow tokens: `Platform.select({ web: ..., default: ... })` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `Platform.select` shadow tokens | React Native 0.76 native `boxShadow` prop | RN 0.76 `boxShadow` is New Architecture-only; there are open Expo SDK 52 issues with it in dev builds (#32748); `Platform.select` is safer |
| `useFonts` hook | Config plugin (native) | Config plugin requires dev build; useFonts works with Expo Go and web — correct for this project |
| `SafeAreaView` from `react-native-safe-area-context` | `useSafeAreaInsets()` hook + manual padding | Both work; SafeAreaView is simpler wrapper for Screen component; hook is preferred when fine-grained control needed inside components |

**Installation:** No new packages needed. All required libraries are already installed.

---

## Architecture Patterns

### Recommended Project Structure (additions)

```
components/
└── layout/
    ├── Screen.tsx        ← SafeAreaView + parchment bg + optional style override
    └── ScrollScreen.tsx  ← Screen + ScrollView variant
```

### Pattern 1: Font Error Handling in Root Layout

**What:** `useFonts` returns `[boolean, Error | null]`. The current `_layout.tsx` only watches `fontsLoaded` — if loading fails, `fontsLoaded` stays false forever and `SplashScreen.hideAsync()` is never called. The splash screen freezes.

**How to fix:** Destructure the error, call `SplashScreen.hideAsync()` when either `loaded` OR `error` is truthy. When `error` is set, render the on-brand FontErrorScreen instead of returning null.

**Example:**
```tsx
// Source: https://docs.expo.dev/develop/user-interface/fonts/
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular_Italic,
    PlayfairDisplay_700Bold_Italic,
    Lora_400Regular,
    Lora_700Bold,
    Lora_400Regular_Italic,
    Lora_700Bold_Italic,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null; // splash still visible — waiting
  }

  if (fontError) {
    return <FontErrorScreen onRetry={() => { /* reload app */ }} />;
  }

  return (
    <CartProvider>
      <Stack screenOptions={{ ... }} />
    </CartProvider>
  );
}
```

### Pattern 2: Screen Component (SafeAreaView wrapper)

**What:** A reusable layout component at `components/layout/Screen.tsx` that always uses `SafeAreaView` from `react-native-safe-area-context` and applies `colors.parchment` background.

**Why needed:** `app/(tabs)/index.tsx` currently imports `SafeAreaView` from `react-native` (wrong package — deprecated, broken on web). All other screens are stub Views with no safe area handling. The Screen component makes the correct behavior the default path.

**Expo Router and SafeAreaProvider:** Expo Router injects `SafeAreaProvider` automatically as part of its initialization — it is a peer dependency of expo-router. The `react-native-safe-area-context` documentation confirms: for web, `SafeAreaProvider` must be present. Since Expo Router provides it, `SafeAreaView` from `react-native-safe-area-context` will work correctly in all screen components without manually adding `SafeAreaProvider` to `_layout.tsx`. (Note: the existing `_layout.tsx` does NOT manually add SafeAreaProvider — it relies on Expo Router's injection, which is correct behavior for SDK 52.)

**Example:**
```tsx
// components/layout/Screen.tsx
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/theme';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function Screen({ children, style }: ScreenProps) {
  return (
    <SafeAreaView style={[styles.safe, style]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.parchment,
  },
});
```

```tsx
// components/layout/ScrollScreen.tsx
import React from 'react';
import { ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../constants/theme';

interface ScrollScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export default function ScrollScreen({ children, style, contentContainerStyle }: ScrollScreenProps) {
  return (
    <SafeAreaView style={[styles.safe, style]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.parchment },
  scroll: { flex: 1, backgroundColor: colors.parchment },
  content: { paddingBottom: spacing.huge },
});
```

### Pattern 3: Platform.select Shadow Tokens

**What:** Extend the existing `shadows` object in `constants/theme.ts` so each shadow variant includes a `web` key via `Platform.select`. The web value uses a CSS `boxShadow` string. Native (iOS/Android) keeps existing `shadowColor` / `elevation` props.

**Current state:** `theme.ts` already defines `shadows.sm`, `shadows.md`, `shadows.lg`, and `shadows.glow`. Components spread these with `...shadows.md`. No `boxShadow` fallback exists, generating deprecation warnings on react-native-web 0.19+.

**Audit findings — where shadows are used:**
- `components/ProductCard.tsx` — `...shadows.md` on card
- `components/HeroCard.tsx` — `...shadows.lg` on card
- `components/PrimaryButton.tsx` — `...shadows.md` on button
- `app/(tabs)/_layout.tsx` — inline shadow on tabBarStyle (upward shadow: `shadowOffset: { width: 0, height: -2 }`)

**The tab bar shadow is inline, not from theme.ts.** The decision is to add shadow tokens to `theme.ts`, but the tab bar style is passed into Expo Router's `Tabs` component `screenOptions.tabBarStyle` — this is a navigation prop object, not a StyleSheet. It will need its own `Platform.select` inline there.

**Pattern for theme.ts shadow tokens:**
```typescript
// Source: react-navigation/react-navigation#11730 + necolas/react-native-web#2620
import { Platform } from 'react-native';

export const shadows = {
  sm: {
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(59, 47, 47, 0.08)', // colors.earth at 8% opacity
      },
      default: {
        shadowColor: colors.earth,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  md: {
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 8px rgba(59, 47, 47, 0.10)',
      },
      default: {
        shadowColor: colors.earth,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  lg: {
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 16px rgba(59, 47, 47, 0.12)',
      },
      default: {
        shadowColor: colors.earth,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
  },
  glow: {
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 12px rgba(201, 166, 66, 0.20)', // colors.gold at 20% opacity
      },
      default: {
        shadowColor: colors.gold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
      },
    }),
  },
};
```

**Tab bar inline shadow fix** (in `app/(tabs)/_layout.tsx`):
```typescript
tabBarStyle: {
  ...Platform.select({
    web: { boxShadow: '0px -2px 8px rgba(59, 47, 47, 0.08)' },
    default: {
      shadowColor: colors.earth,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 8,
    },
  }),
  // ...rest of tabBarStyle
}
```

### Pattern 4: FontErrorScreen Component

**What:** An on-brand error screen rendered by `_layout.tsx` when `fontError` is truthy. Must be styled without custom fonts (since they failed to load). Must follow Wildenflower voice.

**Constraint:** Cannot use `fonts.heading` etc. — fonts are unavailable. Use system serif fallback (`fontFamily: 'Georgia, serif'` for web or platform serif via `fontFamily: undefined` + `fontStyle`).

**Example structure:**
```tsx
// components/layout/FontErrorScreen.tsx
// No custom fonts — uses system fallback
function FontErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Wildenflower voice: poetic, warm, not technical */}
      <Text style={styles.message}>
        The flowers are still waking up...
      </Text>
      <Text style={styles.subMessage}>
        Something kept our fonts from blooming.
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryLabel}>Try again</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
```

**Retry mechanism:** Expo does not provide a built-in "reload app" API that works cross-platform. On web, `window.location.reload()` works. On native, the recommended approach is `Updates.reloadAsync()` from `expo-updates`, OR simply re-mounting the font load by resetting state. Since `expo-updates` is not in `package.json`, use a conditional: `Platform.OS === 'web' ? window.location.reload() : null`. Alternatively, a simpler approach: wrap the entire app in a key-based component that increments on retry, forcing remount of RootLayout and re-attempt of useFonts.

### Anti-Patterns to Avoid

- **Importing SafeAreaView from `react-native`:** Deprecated; does not respect web chrome. Always import from `react-native-safe-area-context`.
- **Returning `null` on fontError:** Freezes the splash screen permanently — the app becomes a white/parchment rectangle with no escape.
- **Continuing with system fonts on font error:** User explicitly rejected this. The error screen is the only allowed path — no silent degradation.
- **Hardcoding shadow props inline per-component on web:** Generates deprecation warnings in react-native-web 0.19+. All shadows flow through theme tokens.
- **Using React Native 0.76's native `boxShadow` prop directly:** There are known issues in Expo SDK 52 dev builds (GitHub issue #32748). The `Platform.select` pattern with CSS `boxShadow` string in the `web` key is the safe, verified approach.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Font loading | Custom fetch/cache | `useFonts` from `expo-font` | Handles caching, error states, integration with SplashScreen |
| Safe area insets | Manual padding per device | `SafeAreaView` from `react-native-safe-area-context` | Handles notches, browser chrome, dynamic bars on all platforms |
| Cross-platform shadow | Custom render per platform | `Platform.select` in theme token | Simple, co-located with other tokens, no library overhead |

**Key insight:** Every problem in Phase 1 is solved by existing installed packages. No new dependencies needed. The work is correct usage of what's already there.

---

## Common Pitfalls

### Pitfall 1: Font Load Freeze (CRITICAL — exists in current code)

**What goes wrong:** `_layout.tsx` calls `useFonts(...)` and returns `null` if fonts haven't loaded. If loading fails (network error, missing file), `fontsLoaded` is always false, `SplashScreen.hideAsync()` is never called, and the app appears frozen.

**Why it happens:** The current implementation only checks `fontsLoaded`, not `fontError`. The official docs show the correct pattern: `if (loaded || error) { SplashScreen.hideAsync(); }`.

**How to avoid:** Destructure both values: `const [fontsLoaded, fontError] = useFonts(...)`. Call `hideAsync()` in the effect when either is truthy. Render the FontErrorScreen when `fontError` is set.

**Warning signs:** Splash screen never disappears during development when fonts fail to download.

### Pitfall 2: Wrong SafeAreaView Package

**What goes wrong:** `SafeAreaView` from `react-native` is deprecated and does not handle browser chrome (URL bar, navigation chrome) on Expo Web. Content clips behind the address bar.

**Why it happens:** `react-native`'s own `SafeAreaView` was deprecated in favor of the community library. Many tutorials still show the `react-native` import.

**How to avoid:** All SafeAreaView usage must be: `import { SafeAreaView } from 'react-native-safe-area-context';`. The Screen component enforces this — once all screens use Screen/ScrollScreen, the wrong import is eliminated.

**Warning signs:** Content visible behind browser navigation bar on `npx expo start --web`.

### Pitfall 3: Shadow Deprecation Warnings Becoming Noise

**What goes wrong:** react-native-web 0.19+ logs a console warning for every component using `shadowColor`, `shadowOpacity`, `shadowRadius`, `shadowOffset` on web. With ProductCard, HeroCard, PrimaryButton, and the tab bar all using spread shadow tokens, this is many warnings per render.

**Why it happens:** react-native-web deprecated these props in 0.19.6 in favor of `boxShadow` CSS string.

**How to avoid:** Update `shadows` in `theme.ts` to use `Platform.select`. Fix the inline tab bar shadow in `_layout.tsx` as well. After this change, no shadow warnings on web.

**Warning signs:** Console shows "shadow* style props are deprecated. Use boxShadow" repeatedly during `npx expo start --web`.

### Pitfall 4: FontErrorScreen Uses Custom Fonts

**What goes wrong:** If the FontErrorScreen component uses `fontFamily: fonts.heading` (Playfair Display), and fonts failed to load, the error screen itself will fail to render correctly — text may not display.

**Why it happens:** Natural instinct to apply brand fonts everywhere. But this screen is specifically shown when those fonts are unavailable.

**How to avoid:** FontErrorScreen must use `fontFamily` values that are guaranteed available: `'Georgia'` or `'serif'` for web, `undefined` (system default) for native. Use `Platform.select` for font family in this one component only.

### Pitfall 5: Screen Component opacity/overflow Clipping SafeAreaView

**What goes wrong:** If `Screen` passes `overflow: 'hidden'` or incorrect flex configuration, safe area insets may not render correctly or content may clip.

**Why it happens:** SafeAreaView from react-native-safe-area-context must have `flex: 1` to fill the screen. Adding `overflow: 'hidden'` on it or its parent can clip safe area padding rendering.

**How to avoid:** Screen component style: `flex: 1, backgroundColor: colors.parchment`. No `overflow: 'hidden'`. Child components can use overflow as needed.

---

## Code Examples

### Current Codebase State (audit results)

**Screens that need updating to use Screen/ScrollScreen:**

| Screen file | Current state | Needed |
|-------------|--------------|--------|
| `app/(tabs)/index.tsx` | SafeAreaView from `react-native` + ScrollView | `ScrollScreen` |
| `app/(tabs)/browse.tsx` | Plain `<View>` stub | `Screen` |
| `app/(tabs)/cart.tsx` | Plain `<View>` stub | `Screen` |
| `app/(tabs)/favorites.tsx` | Plain `<View>` stub | `Screen` |
| `app/(tabs)/profile.tsx` | Plain `<View>` stub | `Screen` |
| `app/product/[id].tsx` | Plain `<View>` stub | `Screen` |
| `app/blog/index.tsx` | Plain `<View>` stub | `Screen` |
| `app/blog/[id].tsx` | Plain `<View>` stub | `Screen` |
| `app/maker/[id].tsx` | Plain `<View>` stub | `Screen` |
| `app/checkout.tsx` | Plain `<View>` stub | `Screen` |
| `app/about.tsx` | Plain `<View>` stub | `Screen` |
| `app/faq.tsx` | Plain `<View>` stub | `Screen` |

**Components using shadows (all via `...shadows.X` spread):**
- `components/ProductCard.tsx` — `...shadows.md`
- `components/HeroCard.tsx` — `...shadows.lg`
- `components/PrimaryButton.tsx` — `...shadows.md`
- `app/(tabs)/_layout.tsx` — inline upward shadow (not from theme.ts)

No new shadow variants are needed. The four existing variants (sm, md, lg, glow) plus the tab bar inline cover all current usage.

### useFonts Correct Pattern
```tsx
// Source: https://docs.expo.dev/develop/user-interface/fonts/
const [fontsLoaded, fontError] = useFonts({ ... });

useEffect(() => {
  if (fontsLoaded || fontError) {
    SplashScreen.hideAsync();
  }
}, [fontsLoaded, fontError]);

if (!fontsLoaded && !fontError) return null;
if (fontError) return <FontErrorScreen onRetry={handleRetry} />;
```

### Platform.select Shadow Token Pattern
```typescript
// Source: https://github.com/react-navigation/react-navigation/issues/11730
// Source: https://github.com/necolas/react-native-web/issues/2620
import { Platform } from 'react-native';

export const shadows = {
  md: {
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 8px rgba(59, 47, 47, 0.10)',
      },
      default: {
        shadowColor: '#3B2F2F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
};
```

### CSS boxShadow String Format
```
'offsetX offsetY blurRadius spreadRadius color'
// Example: '0px 4px 8px 0px rgba(59, 47, 47, 0.10)'
// spreadRadius is optional — can omit: '0px 4px 8px rgba(59, 47, 47, 0.10)'
```

Converting existing native shadow props to CSS boxShadow:
- `shadowOffset: { width: 0, height: 4 }` → `0px 4px`
- `shadowRadius: 8` → `8px` (blur)
- `shadowOpacity: 0.1` with `shadowColor: '#3B2F2F'` → `rgba(59, 47, 47, 0.10)`
- `elevation` has no CSS equivalent — omit from web token

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `SafeAreaView` from `react-native` | `SafeAreaView` from `react-native-safe-area-context` | RN ~0.64 | `react-native`'s own was deprecated; community library is the standard |
| `useFonts` returns `[boolean]` | `useFonts` returns `[boolean, Error\|null]` | expo-font v11+ | Error state must be handled to prevent splash freeze |
| `shadow*` props on web | `boxShadow` CSS string | react-native-web 0.19.6 | `shadow*` props deprecated on web; emit console warnings |
| Native `boxShadow` prop (RN 0.76) | Not recommended for SDK 52 | RN 0.76 / Oct 2024 | New Architecture only; known SDK 52 dev build issues (#32748) |

**Deprecated/outdated in this codebase right now:**
- `import { SafeAreaView } from 'react-native'` in `app/(tabs)/index.tsx` — must change to `react-native-safe-area-context`
- `useFonts` without `fontError` in `_layout.tsx` — must destructure and handle error
- All `shadows.*` spread usage — generates web deprecation warnings; must add `Platform.select`

---

## Open Questions

1. **FontErrorScreen retry mechanism**
   - What we know: `expo-updates` is not installed. `window.location.reload()` works on web. Native reload without expo-updates requires a workaround.
   - What's unclear: Whether a key-reset pattern (incrementing a state key that wraps RootLayout) actually re-triggers useFonts or if Expo caches the failed attempt.
   - Recommendation: Implement as `Platform.OS === 'web'` → `window.location.reload()`, native → key-reset pattern. Test on iOS simulator during implementation.

2. **ScrollScreen paddingBottom**
   - What we know: `app/(tabs)/index.tsx` currently hardcodes `paddingBottom: spacing.huge` in its `content` style.
   - What's unclear: Whether all scrollable screens want the same bottom padding, or if some need less/more.
   - Recommendation: Make `contentContainerStyle` an override prop on ScrollScreen (already shown in Pattern 2). Default to `spacing.huge`. Individual screens can override.

3. **Expo Router's SafeAreaProvider injection on web**
   - What we know: Expo Router is documented to inject SafeAreaProvider automatically. The Expo docs say for web, SafeAreaProvider must be present.
   - What's unclear: Whether Expo Router's automatic injection is sufficient for web, or if `_layout.tsx` needs an explicit `<SafeAreaProvider>` wrapper.
   - Recommendation: Trust Expo Router's injection (it's the documented behavior for SDK 52). If web testing shows SafeAreaView not working, add explicit SafeAreaProvider wrapper in `_layout.tsx` as a fallback. Test empirically during implementation.

---

## Sources

### Primary (HIGH confidence)
- [Expo Font docs](https://docs.expo.dev/develop/user-interface/fonts/) — useFonts return signature, error handling pattern, splash screen integration
- [Expo Font API reference](https://docs.expo.dev/versions/latest/sdk/font/) — confirmed `[boolean, Error|null]` return
- [Expo Splash Screen docs](https://docs.expo.dev/versions/latest/sdk/splash-screen/) — `preventAutoHideAsync` / `hideAsync` APIs, SDK 52 notes
- [Expo Safe Areas docs](https://docs.expo.dev/develop/user-interface/safe-areas/) — SafeAreaProvider setup, Expo Router integration
- [Expo Safe Area Context API](https://docs.expo.dev/versions/latest/sdk/safe-area-context/) — web requirement for SafeAreaProvider
- Codebase audit — direct read of all 14 screen files, `constants/theme.ts`, `components/ProductCard.tsx`, `components/HeroCard.tsx`, `components/PrimaryButton.tsx`

### Secondary (MEDIUM confidence)
- [react-navigation/issues/11730](https://github.com/react-navigation/react-navigation/issues/11730) — shadow* deprecation warning on web; boxShadow string format verified with react-native-web source
- [necolas/react-native-web/issues/2620](https://github.com/necolas/react-native-web/issues/2620) — shadow props deprecation confirmed in react-native-web 0.19.6
- [expo/expo/issues/28818](https://github.com/expo/expo/issues/28818) — SafeAreaProvider auto-injection by Expo Router; documentation inconsistency documented
- [React Native 0.76 release blog](https://reactnative.dev/blog/2024/10/23/release-0.76-new-architecture) — confirmed native boxShadow is New Architecture-only

### Tertiary (LOW confidence — verify during implementation)
- Expo Router v4 SafeAreaProvider automatic injection on web — multiple sources confirm it works, but the web platform edge case should be validated empirically during Phase 1 testing

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages already installed at correct versions; no new decisions
- Architecture: HIGH — patterns verified against official Expo docs; code examples directly match current codebase structure
- Pitfalls: HIGH — "font freeze" and "wrong SafeAreaView import" are confirmed bugs in the current code; shadow deprecation confirmed in react-native-web changelog
- SafeAreaProvider web behavior: MEDIUM — Expo Router injection is documented but web-specific behavior has contradictory community reports

**Research date:** 2026-02-19
**Valid until:** 2026-04-19 (stable APIs — Expo SDK 52 is pinned in package.json)
