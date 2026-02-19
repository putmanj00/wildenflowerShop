# Domain Pitfalls: React Native Expo + Shopify Storefront API

**Domain:** Mobile/web e-commerce — Expo SDK 52 + Shopify Storefront API 2025-04
**Researched:** 2026-02-19
**Confidence:** HIGH (from direct codebase analysis + training data on these exact libraries)
**Source method:** Codebase audit (wildenflowerShop + shopSite) + Expo SDK 52 / RN 0.76 knowledge

---

## Critical Pitfalls

Mistakes that cause rewrites or break entire features.

---

### Pitfall 1: `@shopify/storefront-api-client` requires a `fetch` polyfill check in Expo

**What goes wrong:** `createStorefrontApiClient` from `@shopify/storefront-api-client` uses the global `fetch`. In React Native/Expo, `fetch` is available globally via RN's built-in polyfill, but there are edge cases: the library may attempt to use Node.js-specific `fetch` behaviors (like streaming) or reference `globalThis.fetch`. On Expo Web, `fetch` is the browser's native fetch and works correctly. On native (iOS/Android), RN's `fetch` polyfill may not cover every header behavior the client expects.

**Why it happens:** The `@shopify/storefront-api-client` v1.x was designed for browser and Node.js environments. The shopSite implementation (`lib/shopify.ts`) works in Next.js (Node.js + browser). Porting that exact client initialization to Expo introduces runtime environment differences.

**Consequences:** Silent failures where API calls never resolve, or cryptic errors like "Network request failed" instead of meaningful GraphQL errors.

**Prevention:**
- Keep the same `createStorefrontApiClient` initialization pattern from shopSite but test on each platform early (web first, then iOS simulator)
- Wrap `getShopifyClient()` in a module-level lazy init — identical to shopSite's pattern — so the client is created at call time, not at module import time (already correct in shopSite)
- Add explicit error handling for network-level failures distinct from GraphQL `userErrors`
- Test with `expo start --web` and `expo start --ios` before assuming parity

**Warning signs:** `TypeError: Network request failed`, fetch timing out with no error, `response.data` being undefined when no `response.errors` exist.

**Phase:** Phase 1 (Shopify integration layer port) — validate on day one before building anything on top of it.

**Confidence:** MEDIUM (training data; Expo's fetch polyfill covers the standard path but edge cases exist)

---

### Pitfall 2: Shopify cart ID expiration — the silent corrupt-state problem

**What goes wrong:** Shopify Storefront API carts expire after approximately 10 days of inactivity. When a user returns to the app with a persisted `cartId` (stored in AsyncStorage), any cart mutation (`cartLinesAdd`, `cartLinesUpdate`, `cartLinesRemove`) will return `null` for `cart` in the response — not a `userErrors` entry, but a literal `null` cart. The existing shopSite cart-store (which this app will port) checks `response.data?.cartLinesAdd.cart` but if the cart is expired, that path returns `null` silently rather than throwing. The code then calls `set({ cart: null })`, wiping local cart state without explaining why to the user.

**Why it happens:** Shopify treats an expired cart as a non-existent resource. The Storefront API returns `{ cartLinesAdd: { cart: null, userErrors: [] } }` — no error, just null. Code that treats null-cart as "mutation succeeded" will silently discard the local cart reference.

**Consequences:** User sees their cart mysteriously empty. If the app then tries to call `checkoutUrl` on a null cart, it crashes. The cart badge count reverts to 0 without explanation.

**Prevention:**
```typescript
// After any cart mutation, validate cart is non-null before updating state
const resultCart = response.data?.cartLinesAdd?.cart;
if (!resultCart) {
  // Cart expired — create a new one and re-add the item
  await createCartAndAddItem(variantId, quantity);
  return;
}
set({ cart: resultCart });
```
- Always implement a `recoverCart` path: if a mutation returns `null` cart, call `cartCreate` with the same lines and persist the new cartId
- On app startup, if a cartId exists in AsyncStorage, call `getCart(cartId)` first and check for null before assuming the cart is valid
- Store cart creation timestamp alongside cartId; treat carts older than 9 days as potentially expired and re-validate on next open

**Warning signs:** Cart items disappearing after a day or more without user action; `checkoutUrl` throwing because `cart` is null; AsyncStorage has a cartId but `getCart` returns null.

**Phase:** Phase 1 (CartContext → Shopify migration). This must be designed in from the start, not patched later.

**Confidence:** HIGH (documented Shopify behavior; confirmed by cart-store pattern in shopSite)

---

### Pitfall 3: Variant `availableForSale` vs `quantityAvailable` mismatch causing confusing UX

**What goes wrong:** The shopSite queries fetch `availableForSale` on `ProductVariant` but do NOT fetch `quantityAvailable`. A product can be `availableForSale: true` but have 0 units if inventory is not properly tracked by Shopify (continues selling mode). Conversely, `availableForSale: false` does not distinguish between "sold out" and "discontinued." Calling `cartLinesAdd` with an unavailable variant does not always return a `userErrors` entry — it may add the line to cart (Shopify allows oversell depending on inventory policy) or return `Invalid merchandise ID` depending on variant configuration.

**Why it happens:** Handmade/artisan products (this exact use case) frequently use Shopify's "Allow overselling" setting or "Continue selling when out of stock." The variant state in the API does not cleanly map to a binary available/unavailable.

**Consequences:** Users add a sold-out item to cart, proceed to checkout, and Shopify blocks the checkout on their end — leaving the user confused with no in-app feedback. Or the reverse: UI shows "Sold Out" on a variant that's actually purchasable.

**Prevention:**
- Request `quantityAvailable` in the VARIANT_FRAGMENT (already defined in shopSite's queries — just add this field)
- Treat `availableForSale: false` as definitively unavailable in UI
- Treat `availableForSale: true` but `quantityAvailable: 0` as "show as available, let Shopify decide at checkout"
- After `cartLinesAdd`, check if the returned cart's line has `merchandise.availableForSale: false` and show a soft warning ("This item may have limited availability")

**Warning signs:** Users reporting checkout failures for items they could add to cart; Shopify admin showing inventory at 0 for items in active carts.

**Phase:** Phase 1 (product detail and cart mutations). Include `quantityAvailable` in the variant fragment from day one.

**Confidence:** MEDIUM (Shopify inventory policies vary by merchant; specific behavior depends on store settings)

---

### Pitfall 4: `position: 'absolute'` and `overflow: 'hidden'` behave differently on Expo Web

**What goes wrong:** React Native's `overflow: 'hidden'` on a container clips absolutely-positioned children on native. On the web via `react-native-web`, `overflow: 'hidden'` maps to CSS `overflow: hidden` but `position: absolute` children use CSS stacking context rules — not identical to RN's layout engine. The existing `ProductCard` uses `position: absolute` for corner accents AND the favorite button, all within an `overflow: 'hidden'` card. On web, this renders correctly for simple cases, but complex nested absolute positioning (like the botanical corner overlays and favorite button both absolute inside an overflow-hidden card) can produce z-index conflicts or clipping that doesn't match native.

**Specific web gaps in react-native-web (confirmed via RN Web docs, Expo Web docs):**
- `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius` → only partially mapped; use CSS `box-shadow` via web-specific style overrides for consistent shadow rendering
- `elevation` → not rendered on web at all (Android-only concept)
- `fontVariant` → limited support
- `textShadow` → not supported in RN, but available via CSS on web
- `pointerEvents` as a prop on `View` → works on web but not on all RN versions

**Why it happens:** react-native-web translates RN StyleSheet props to CSS but the mapping is not 1:1. The layout engines (Yoga vs CSS flexbox) differ in edge cases.

**Consequences:** ProductCard corners render differently on web vs native; shadow appears on iOS/Android but not in the browser version; tab bar shadow (`shadowColor: colors.earth`) is invisible on web.

**Prevention:**
- Use the `Platform.select` pattern for shadow styles, providing both RN shadow props (for native) and `boxShadow` (web-compatible via style override):
  ```typescript
  const shadow = Platform.select({
    web: { boxShadow: '0px 4px 8px rgba(59, 47, 47, 0.10)' },
    default: shadows.md,
  });
  ```
- Test every screen in `expo start --web` early in each phase, not just at the end
- For `overflow: 'hidden'` + absolute positioning combos, manually verify web rendering in Chrome DevTools

**Warning signs:** Shadows missing in browser version; corner accents overflowing card bounds on web; z-index oddities with overlapping absolutely-positioned elements.

**Phase:** Affects every screen. Address shadow strategy in Phase 1 (core component pass), test all screens on web before calling a phase done.

**Confidence:** HIGH (well-documented react-native-web limitation; confirmed by expo-web guides)

---

### Pitfall 5: Expo Web + `SafeAreaView` — wrong safe area insets

**What goes wrong:** `SafeAreaView` from `react-native` uses native device safe area information. On the web (via `react-native-web`), `SafeAreaView` renders as a plain `View` with no safe area applied — which is correct for desktop browsers but incorrect for mobile browsers (Safari on iPhone has a bottom bar that can overlap content). The existing `HomeScreen` wraps content in `SafeAreaView`. On web, this adds no padding, so content can sit behind the mobile browser chrome.

**Prevention:**
- Use `SafeAreaView` from `react-native-safe-area-context` (already in `package.json` as `react-native-safe-area-context: 4.12.0`) instead of from `react-native`
- Wrap the entire app (in `app/_layout.tsx`) with `<SafeAreaProvider>` from `react-native-safe-area-context`
- The HomeScreen currently imports `SafeAreaView` from `react-native` — this needs to change before first web test

**Warning signs:** Content hidden behind browser address bar on mobile web; bottom tab bar overlapping content on iPhone Safari.

**Phase:** Phase 0/1 (root layout). Fix in `_layout.tsx` before any screen work.

**Confidence:** HIGH (confirmed by Expo docs and react-native-safe-area-context docs)

---

### Pitfall 6: OAuth2/PKCE (Customer Account API) in Expo — `next/headers` is not portable

**What goes wrong:** The shopSite `customer-account.ts` uses `import { cookies } from 'next/headers'` throughout for storing OAuth state and tokens. This cannot be ported to Expo. The entire cookie-based auth session management must be rebuilt with Expo equivalents. The `crypto` module used for PKCE code generation (`crypto.randomBytes`, `crypto.createHash`) is also Node.js-specific and unavailable in React Native's JavaScript runtime.

**Specific blockers in the shopSite implementation:**
- `import { cookies } from 'next/headers'` — Next.js server-only API, not available in Expo
- `import crypto from 'crypto'` — Node.js built-in, not available in React Native
- Cookie-based storage (`httpOnly`, `secure`, `sameSite`) — browser/server pattern; Expo needs AsyncStorage or SecureStore
- Route-based OAuth callback (`/api/auth/customer/callback`) — Next.js API routes pattern; Expo needs deep linking
- `Buffer.from(...)` for base64 encoding — Node.js Buffer, not available in React Native

**Required Expo replacements:**
- `crypto.randomBytes(32)` → Use `expo-crypto` (`Crypto.getRandomBytesAsync(32)`) or `expo-random`
- `crypto.createHash('sha256')` → Use `expo-crypto` (`Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, verifier)`)
- `cookies()` → Use `expo-secure-store` for tokens; use in-memory state for OAuth PKCE state/verifier during the flow
- OAuth flow → Use `expo-auth-session` which handles PKCE natively, manages the browser flow, and handles the deep link callback
- Redirect URI → Must be a deep link: `wildenflower://auth/callback` (app scheme set in `app.json` as `"scheme": "wildenflower"`)
- On web → Redirect URI must be an HTTP URL: `http://localhost:8081/auth/callback`

**Consequences:** Attempting to port `customer-account.ts` directly will crash immediately on import. OAuth state stored in memory only (no fallback) means users must re-auth on every app restart if SecureStore is not implemented.

**Prevention:**
- Write a brand-new `lib/shopify-auth.ts` for Expo — do not port `customer-account.ts` line-by-line
- Use `expo-auth-session` for the full PKCE flow (library is purpose-built for this, handles all edge cases)
- Store tokens in `expo-secure-store`, not AsyncStorage (tokens are sensitive credentials)
- Register `wildenflower://auth/callback` as an allowed redirect URI in Shopify's Customer Account app settings
- For web, register `http://localhost:8081/auth/callback` (dev) and `https://yourdomain.com/auth/callback` (prod)
- Use `Platform.OS` to return the correct redirect URI

**Warning signs:** `Module not found: 'next/headers'`; `ReferenceError: Buffer is not defined`; `ReferenceError: crypto is not defined`; OAuth flow opens browser but never redirects back to app.

**Phase:** Customer auth phase (deferred from v1 per PROJECT.md, but the lib file must be clean from the start to avoid confusion).

**Confidence:** HIGH — `next/headers` and Node.js `crypto` are definitively unavailable in React Native.

---

### Pitfall 7: Environment variables — `process.env` behavior differs between Expo Web and native

**What goes wrong:** The shopSite uses `process.env.SHOPIFY_STORE_DOMAIN` and `process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`. In Expo, `process.env` is partially available via Metro bundler's static replacement, but the mechanism is different from Next.js.

**How Expo handles env vars:**
- `app.json` `extra` field: values in `expo.extra` are available via `expo-constants` (`Constants.expoConfig.extra.shopifyStoreDomain`)
- `.env` files: Expo SDK 49+ supports `.env` files via Metro, but only variables prefixed with `EXPO_PUBLIC_` are inlined into the client bundle at build time
- Variables WITHOUT `EXPO_PUBLIC_` prefix are NOT available in the client bundle — they are silently `undefined` at runtime

**What breaks:** The shopSite's `getShopifyClient()` reads `process.env.SHOPIFY_STORE_DOMAIN` (no prefix). In Expo, this will be `undefined` at runtime, causing the function to throw `'SHOPIFY_STORE_DOMAIN environment variable is required'`.

**Prevention:**
- Rename env vars to use `EXPO_PUBLIC_` prefix: `EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN`, `EXPO_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN`
- Create `.env.local` (gitignored) with these variables
- Update the `getShopifyClient()` ported function to read `process.env.EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN`
- NEVER use `app.json` `extra` for secrets — it's included in the app bundle unencrypted
- The Storefront API public access token is safe to expose (it's designed for client-side use); NEVER include Admin API tokens in Expo

**Warning signs:** `'SHOPIFY_STORE_DOMAIN environment variable is required'` error on startup; `undefined` values when reading `process.env` at runtime; all Shopify API calls failing immediately without network activity.

**Phase:** Phase 1 (Shopify integration layer). Set up `.env` correctly before porting any API code.

**Confidence:** HIGH (Expo SDK 49+ EXPO_PUBLIC_ behavior is documented and well-established)

---

## Moderate Pitfalls

### Pitfall 8: `useFonts` returns `false` during font load — `null` return in root layout blocks content

**What goes wrong:** The existing `_layout.tsx` correctly gates render on font load with `if (!fontsLoaded) { return null; }`. This is the right pattern and prevents the font flash. However, there are two related failure modes:

1. **On Expo Web:** Font loading is slower because fonts load from the network (via `@expo-google-fonts/playfair-display` and `@expo-google-fonts/lora`). On web, if `SplashScreen.preventAutoHideAsync()` is not properly cleared, the app can hang on the splash indefinitely. The `useEffect` that calls `SplashScreen.hideAsync()` must be correctly wired to `fontsLoaded`.

2. **Error state not handled:** `useFonts` returns `[fontsLoaded, error]` — the existing code only destructures `[fontsLoaded]` and ignores the error. If font loading fails (network unavailable, bad asset path), `fontsLoaded` stays `false` forever, the splash never hides, and the user sees a frozen splash screen.

**Prevention:**
```typescript
const [fontsLoaded, fontError] = useFonts({ ... });

useEffect(() => {
  if (fontsLoaded || fontError) {
    SplashScreen.hideAsync();
  }
}, [fontsLoaded, fontError]);

if (!fontsLoaded && !fontError) {
  return null;
}
// Proceed — fonts loaded or we're degrading gracefully
```
- The current `_layout.tsx` needs to add `fontError` to the destructure and the `useEffect` condition

**Warning signs:** Frozen splash screen with no error in console; app works in development but hangs in production builds; `console.warn` from expo-splash-screen about async hide not called.

**Phase:** Already implemented in `_layout.tsx` but needs error-state fix before first web test.

**Confidence:** HIGH (documented `useFonts` API from expo-font)

---

### Pitfall 9: FlatList horizontal scroll does not show scrollbar on web — navigation arrows needed

**What goes wrong:** The `CategoryRow` component uses a horizontal `ScrollView` with `showsHorizontalScrollIndicator={false}`. On native, touch-scroll is natural and discoverable. On web, users scroll horizontally with mouse wheel (shift+scroll) or trackpad, which is non-obvious and not expected by mouse users. This is not a crash — it's a UX failure. On desktop web, if the category row has items that overflow, they're completely inaccessible to mouse-only users.

**Why it happens:** `showsHorizontalScrollIndicator={false}` removes the scrollbar CSS on web. Horizontal scrolling with a mouse wheel requires shift modifier. This is a web UX expectation mismatch.

**Prevention:**
- On web, either: (a) show the scrollbar (`showsHorizontalScrollIndicator={Platform.OS === 'web'}`), or (b) add left/right arrow buttons that scroll the `ScrollView` programmatically using a `ref` and `scrollTo`
- Product description uses `expo-image` — check the carousel implementation for similar issues (see Pitfall 14)

**Warning signs:** User testing on desktop web finds category chips/filter chips inaccessible; content is cut off at the right edge with no scroll affordance.

**Phase:** Phase 2 (Browse/filter screens). Design for web scrollability from the start.

**Confidence:** HIGH (CSS overflow behavior is deterministic)

---

### Pitfall 10: Cart state lost on web page refresh — AsyncStorage not initialized synchronously

**What goes wrong:** On Expo Web, `@react-native-async-storage/async-storage` (v1.23.1, in `package.json`) uses `localStorage` under the hood. However, reading from AsyncStorage is always async — even on web. The current `CartContext` uses in-memory `useReducer` with no persistence. When the Shopify-backed CartContext is implemented and the cartId is stored in AsyncStorage, a page refresh (web) or app restart (native) will show an empty cart until AsyncStorage is read, creating a visible "flash" of empty-cart state.

**Additional issue:** On Expo Web, if the user clears browser data, the cartId in AsyncStorage is gone, but there may still be an abandoned cart in Shopify's system.

**Prevention:**
- Implement a `cartLoading` state in CartContext that starts as `true`
- On mount, read cartId from AsyncStorage; only set `cartLoading: false` after the read completes (even if the value is null)
- Show a loading skeleton in the Cart screen and cart badge while `cartLoading: true`
- Do not show the cart count badge until cart is hydrated
- Consider whether to use AsyncStorage (cartId) vs rebuilding cart from Shopify on each session (simpler, no stale state)

**Warning signs:** Cart count shows 0, then jumps to correct count 100-500ms after app open; cart screen flashes empty state then populates.

**Phase:** Phase 1 (CartContext migration). Build the hydration pattern before any UI that reads cart state.

**Confidence:** HIGH (AsyncStorage async behavior is well-documented)

---

### Pitfall 11: `expo-image` vs React Native `Image` — different props, critical for Shopify CDN images

**What goes wrong:** The project has `expo-image` (v2.0.0) in `package.json` but the existing components use placeholder `View`s where images will go. When image wiring begins, there's a risk of mixing `expo-image` (`<Image>` from `expo-image`) with RN's built-in `Image` (`<Image>` from `react-native`). The two have very different prop APIs:
- RN `Image`: `source={{ uri: url }}`, `resizeMode="cover"`
- expo-image `Image`: `source={url}` (string directly), `contentFit="cover"` (not `resizeMode`)

Shopify CDN image URLs use a query-parameter-based resize API: `image.url?width=400&height=400&crop=center`. If the wrong resize params are passed or images are loaded at full resolution (sometimes 2-5MB for product photography), the app will be slow and memory-heavy.

**Prevention:**
- Pick ONE image component and use it everywhere: use `expo-image` (it's in the project's `package.json` and has better caching + web support than RN's `Image`)
- Use Shopify's image URL transform for responsive loading:
  ```typescript
  function shopifyImageUrl(url: string, width: number): string {
    return `${url}&width=${width}`;
  }
  // Usage: shopifyImageUrl(product.images[0].url, 400)
  ```
- Preload the first product image in detail view

**Warning signs:** TypeScript errors mixing `resizeMode` and `contentFit`; images loading slowly or never; memory warnings on devices.

**Phase:** Phase 1/2 (image wiring). Establish a `ShopifyImage` component that wraps expo-image with the URL transform helper.

**Confidence:** HIGH (expo-image API is documented; Shopify CDN URL params are documented)

---

### Pitfall 12: Expo Router web navigation — `router.push('/(tabs)/browse')` syntax inconsistency

**What goes wrong:** On native, Expo Router handles parenthetical group segments (`(tabs)`) transparently. On web, the URL in the browser bar shows `/browse` (the segment is stripped). However, `router.push('/(tabs)/browse')` from JavaScript also works on web. The issue is with deep links and browser navigation:
- Browser "Back" button triggers the native stack navigator's `goBack()` behavior, which may be different from expected browser history behavior
- Directly navigating to `http://localhost:8081/(tabs)/browse` in the browser may or may not work depending on Expo Router's web server configuration
- The `tabBarHideOnKeyboard: true` setting in Tab layout does not apply on web (there is no software keyboard state on desktop)

**Prevention:**
- Use `router.push('/browse')` (without the group prefix) for links that appear in web contexts, since the group prefix is an implementation detail
- Test all `router.push` calls in `expo start --web` to confirm correct URL resolution
- The `animation: 'fade'` in `Stack.screenOptions` is ignored on web — this is expected and acceptable

**Warning signs:** `router.push()` calls that work on native but produce 404 on web; browser back button not matching expected navigation state.

**Phase:** Phase 1 (navigation wiring). Test navigation on web before wiring all screens.

**Confidence:** MEDIUM (Expo Router web behavior from training data; specific URL resolution behavior may differ in Expo Router 4.x)

---

### Pitfall 13: `StyleSheet.create` `gap` property — limited support in older Expo/RN versions

**What goes wrong:** The `ProductGrid` component uses `gap: spacing.itemGap` in its StyleSheet. The `gap` CSS property in React Native StyleSheet was added in React Native 0.71+. The project uses RN 0.76.9 (Expo SDK 52), which supports `gap` for flex containers. However, on Expo Web via react-native-web, `gap` on flex containers requires `react-native-web` 0.18+. The project has `react-native-web: ~0.19.13`, so this is fine.

**The actual risk is `rowGap` and `columnGap`:** These are also supported in RN 0.71+ and web 0.19+, but engineers accustomed to older RN may use `marginBottom` on individual items instead, leading to inconsistent spacing in the 2-column grid layout.

**Prevention:**
- `gap` in `StyleSheet.create` is safe with the current package versions
- Do not mix `gap` and `margin` on grid items — pick one approach consistently
- When adding new list/grid components, use `gap` rather than margins on individual children

**Phase:** Low risk with current versions. Monitor only.

**Confidence:** HIGH (verified against RN 0.76 and react-native-web 0.19 changelogs from training data)

---

### Pitfall 14: Product image carousel (swipeable) on Expo Web — FlatList horizontal scroll does not respond to mouse drag

**What goes wrong:** The product detail screen spec requires a swipeable image carousel. The typical React Native implementation uses a horizontal `FlatList` with `pagingEnabled={true}`. On Expo Web, this renders as a horizontally scrollable div, but:
- Mouse drag (click-and-drag to swipe) does not work — only trackpad two-finger swipe or shift+mouse wheel
- `pagingEnabled` behavior on web is inconsistent (may or may not snap to page boundaries)
- Touch events on mobile web (Safari iOS) work correctly, but desktop mouse users cannot interact

**Prevention:**
- Use `react-native-gesture-handler` (already in `package.json` as `~2.20.0`) `ScrollView` with `horizontal` and `pagingEnabled` — it has better web support than the built-in `FlatList` for this use case
- Or: use CSS scroll snap via a web-only style override on Expo Web
- Implement explicit previous/next arrow buttons that appear on web (`Platform.OS === 'web'`), so mouse users always have an interaction path regardless of scroll behavior
- Test in Chrome DevTools mobile device simulation AND on desktop mouse

**Warning signs:** Image carousel works in iOS simulator but appears stuck on first image in browser on desktop.

**Phase:** Phase 2/3 (Product detail screen). Design the carousel with web affordances from the start.

**Confidence:** MEDIUM (react-native-gesture-handler web support is documented but version-specific; RNGV2 has improved this)

---

## Minor Pitfalls

### Pitfall 15: `AsyncStorage` vs `SecureStore` — using the wrong one for the wrong data

**What goes wrong:** The project already has `@react-native-async-storage/async-storage` installed. `expo-secure-store` is NOT in `package.json`. There is a risk of using AsyncStorage for auth tokens (wrong — not encrypted) or SecureStore for non-sensitive data like the cartId (overkill, and SecureStore has smaller size limits).

**Correct allocation:**
| Data | Storage | Reason |
|------|---------|--------|
| Shopify cartId | AsyncStorage | Not sensitive; large carts can exceed SecureStore limits |
| Customer access token | SecureStore | Sensitive credential |
| Customer refresh token | SecureStore | Long-lived sensitive credential |
| OAuth PKCE code verifier | In-memory only | Ephemeral; should not persist past auth flow |
| Favorites (if local) | AsyncStorage | Not sensitive |
| User preferences | AsyncStorage | Not sensitive |

**Prevention:**
- Add `expo-secure-store` to `package.json` before auth work begins
- Create a typed `storage.ts` utility that enforces the correct storage for each data type
- Note: `expo-secure-store` is unavailable on Expo Web — implement a fallback (`sessionStorage` or encrypted `localStorage`) for web

**Warning signs:** Using `AsyncStorage.setItem('access_token', token)` anywhere in auth code; SecureStore size errors (>2048 bytes) from storing large tokens.

**Phase:** Phase 1 (cartId storage); Auth phase (token storage).

**Confidence:** HIGH (SecureStore vs AsyncStorage boundaries are documented in Expo docs)

---

### Pitfall 16: `Linking.openURL` for checkout redirect — different behavior web vs native

**What goes wrong:** PROJECT.md specifies checkout via `Linking.openURL(cart.checkoutUrl)`. On native, this opens the system browser (Safari/Chrome) externally. On Expo Web, `Linking.openURL` calls `window.open(url)` which modern browsers block as a popup unless called directly in a user event handler. If `openURL` is called after an `await` (async gap between tap and call), the browser blocks it.

**Prevention:**
```typescript
// WRONG — async gap causes popup block:
const handleCheckout = async () => {
  const checkoutUrl = await getCheckoutUrl(); // async gap here
  Linking.openURL(checkoutUrl); // blocked on web
};

// RIGHT — have the URL ready before the tap:
// Pre-fetch the checkoutUrl when cart state changes, store it
// Then in the handler:
const handleCheckout = () => {
  if (cart?.checkoutUrl) {
    Linking.openURL(cart.checkoutUrl); // synchronous call, not blocked
  }
};
```
- On Expo Web, prefer `window.location.href = cart.checkoutUrl` (via `Platform.OS === 'web'` check) which does not popup-block
- The `cart.checkoutUrl` comes back from Shopify with every cart mutation — store it in cart state so it's always available synchronously

**Warning signs:** "Popup blocked" browser notification on web checkout button; checkout button silently does nothing on web.

**Phase:** Phase 1/2 (cart and checkout). Design the handler correctly before wiring.

**Confidence:** HIGH (browser popup blocking behavior for window.open after async is deterministic)

---

### Pitfall 17: Expo Router `web` build — tab bar renders as a web nav bar, not a bottom bar

**What goes wrong:** On Expo Web, the Tab navigator from `expo-router` renders the tab bar at the BOTTOM of the screen using CSS `position: fixed; bottom: 0`. This is correct and matches the design. However, `paddingBottom: spacing.xl` (24px) in the existing tab bar style is meant to account for the iOS home indicator. On web, this produces unnecessary bottom padding in the tab bar that can look odd and make the bar taller than expected.

**Additionally:** `tabBarHideOnKeyboard: true` is a no-op on web. `elevation: 8` is Android-only and does nothing on web. The `shadowColor: colors.earth` shadow props are only partially rendered on web (partial react-native-web mapping).

**Prevention:**
- Use `Platform.select` for `paddingBottom` in tab bar: 24 on iOS, 8 on web/Android
- Use `Platform.OS !== 'web'` guards for `elevation`
- Add a CSS `box-shadow` override for web tab bar shadow via a web-specific stylesheet approach

**Warning signs:** Tab bar on web appears taller than designed; no shadow on tab bar in browser.

**Phase:** Phase 1 (tab layout, already built). Fix before first web review.

**Confidence:** HIGH (well-known react-native-web gap; elevation and shadow props documented)

---

### Pitfall 18: Shopify GraphQL `userErrors` vs top-level `errors` — two different error types require separate handling

**What goes wrong:** The shopSite `shopifyFetch` function handles `response.errors` (network-level GraphQL errors, like bad query syntax or auth failures) but the cart mutations return `userErrors` inside the mutation payload (business logic errors like invalid variant, quantity too low, etc.). The existing code checks both separately, but the error messages from `userErrors` are meant for end users while `response.errors` are developer-level.

**What this means for UX:** A `userErrors` message like "Merchandise is not available" should be displayed to the user. A `response.errors` message like "Field 'xxx' doesn't exist on type 'CartLinesAddPayload'" is a developer bug — it should be logged but never shown to users.

**Prevention:**
- Define a clear error handling layer:
  ```typescript
  type ShopifyResult<T> =
    | { success: true; data: T }
    | { success: false; userError: string }  // Show to user
    | { success: false; systemError: string }; // Log only, show generic message
  ```
- Map `userErrors[].message` → user-facing toast/alert
- Map `response.errors` → console.error + generic "Something went wrong. Please try again." message

**Warning signs:** GraphQL error details like field names appearing in user-facing error UI; no error feedback to users when mutations fail silently.

**Phase:** Phase 1 (Shopify integration layer). Build the error taxonomy before any UI work.

**Confidence:** HIGH (Shopify API structure is documented; this is the correct interpretation)

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Shopify client port | process.env not available without EXPO_PUBLIC_ prefix | Set up .env with correct prefix before first API call |
| Cart context migration | Cart expiry returns null cart, not an error | Implement recoverCart() with re-create logic |
| Root layout | useFonts ignores error state; SafeAreaView wrong import | Fix both before any screen work |
| Web shadow/styling | elevation and shadowColor not rendered on web | Use Platform.select shadow strategy throughout |
| Customer auth | next/headers and Node.js crypto non-portable | Write new Expo auth module using expo-auth-session + expo-crypto |
| Product carousel | FlatList paging unusable by mouse on web | Add previous/next buttons conditionally on web |
| Checkout redirect | Linking.openURL popup-blocked on web after async | Store checkoutUrl in state; call synchronously |
| Image wiring | expo-image vs RN Image API mismatch | Wrap in ShopifyImage component; use expo-image exclusively |
| Tab bar web | Excess paddingBottom for iOS home indicator on web | Platform.select paddingBottom |
| Cart persistence | AsyncStorage async read causes empty-cart flash | Show loading state until AsyncStorage hydration completes |

---

## Sources

- Direct codebase analysis: `/wildenflowerShop/` (components, context, layout, app.json, package.json)
- Direct codebase analysis: `/shopSite/lib/customer-account.ts` (Next.js OAuth implementation, confirmed non-portable)
- Direct codebase analysis: `/shopSite/lib/cart-store.ts` (cart mutation patterns and error handling gaps)
- Training data: Expo SDK 52 / React Native 0.76.9 / react-native-web 0.19 known gaps
- Training data: Shopify Storefront API cart behavior (expiry, null responses, userErrors structure)
- Training data: `expo-auth-session` PKCE implementation for Customer Account API
- Training data: `EXPO_PUBLIC_` env var prefix requirement (Expo SDK 49+)
- Training data: `expo-secure-store` web unavailability and size limits
- Training data: Browser popup blocking behavior for `window.open` after async gaps
