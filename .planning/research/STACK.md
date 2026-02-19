# Technology Stack

**Project:** Wildenflower — React Native Expo e-commerce app with Shopify Storefront API
**Researched:** 2026-02-19
**Research mode:** Brownfield / subsequent milestone (app skeleton exists)

---

## What's Already Installed (Do Not Re-add)

These packages are confirmed installed and correct. The roadmap should treat them as fixed.

| Package | Installed Version | Status |
|---------|------------------|--------|
| `expo` | 52.0.49 | Correct — SDK 52 is current stable |
| `expo-router` | 4.0.22 | Correct — file-based routing |
| `react-native` | 0.76.9 | Correct — bundled with Expo SDK 52 |
| `react-native-web` | 0.19.13 | Correct — Expo Web prerequisite |
| `react-native-reanimated` | 3.16.x | Correct — organic animations |
| `react-native-gesture-handler` | 2.20.x | Correct — required by Reanimated |
| `react-native-screens` | 4.4.x | Correct — navigation prerequisite |
| `react-native-safe-area-context` | 4.12.0 | Correct |
| `expo-font` | 13.0.4 | Correct — font loading |
| `expo-image` | 2.0.7 | Correct — Shopify CDN image handling |
| `expo-splash-screen` | 0.29.x | Correct |
| `expo-asset` | 11.0.5 | Correct |
| `expo-constants` | 17.0.8 | Correct — env var access |
| `expo-status-bar` | 2.0.x | Correct |
| `expo-linking` | installed | Correct — checkout URL redirect |
| `@expo/metro-runtime` | 4.0.1 | Correct — Metro bundler for web |
| `@expo-google-fonts/playfair-display` | 0.4.2 | Correct |
| `@expo-google-fonts/lora` | 0.4.2 | Correct |
| `@react-native-async-storage/async-storage` | 1.23.1 | Correct — Shopify cart ID persistence |
| `typescript` | 5.3.x | Correct |
| `react` | 18.3.1 | Correct — Expo SDK 52 requires React 18 |

**Note:** `@shopify/storefront-api-client` is in the shopSite repo but NOT yet installed in wildenflowerShop. It must be added.

---

## Packages to Add

### Critical — Shopify Integration

| Package | Recommended Version | Purpose | Expo Web |
|---------|--------------------|---------|---------:|
| `@shopify/storefront-api-client` | `^1.0.9` | Shopify Storefront GraphQL client | Compatible — pure JS, no native modules |

**Why this version:** Exact match to shopSite's working integration (`v1.0.9`). Uses `createStorefrontApiClient` with `publicAccessToken`. The `request()` method is Promise-based and works in both RN and browser environments. No native dependencies.

**Why not the Hydrogen/React approach:** `@shopify/hydrogen-react` requires a React 18 server components environment (Next.js/Remix). This is a pure client app.

**Why not raw `graphql-request` or `fetch`:** The `@shopify/storefront-api-client` handles API versioning, error normalization, and retries. The shopSite already has working queries — porting them requires the same client interface.

Installation:
```bash
npx expo install @shopify/storefront-api-client
```

---

### Critical — Customer Authentication

| Package | Recommended Version | Purpose | Expo Web |
|---------|--------------------|---------|---------:|
| `expo-auth-session` | `~6.0.0` | OAuth2 + PKCE browser flow via WebBrowser | Web: uses `window.location`, Native: in-app browser |
| `expo-crypto` | `~14.0.0` | PKCE code verifier/challenge generation | Web: falls back to `window.crypto.subtle` |
| `expo-web-browser` | `~14.0.0` | Opens auth URL in a browser session | Web: opens tab, Native: opens SFSafariViewController/Chrome Custom Tabs |
| `expo-secure-store` | `~14.0.0` | Secure token storage (native) | Web: NOT available — use AsyncStorage fallback |

**Why expo-auth-session:** Shopify's Customer Account API is OAuth2 + PKCE. This is the standard Expo OAuth flow. `expo-auth-session` handles the redirect URI, PKCE generation, and callback parsing across web and native. The shopSite uses Next.js server-side cookies — in Expo this must become a client-side PKCE flow with `AuthSession.startAsync()`.

**Why expo-crypto:** PKCE requires SHA-256 to generate the code challenge. `expo-crypto` provides `Crypto.digestStringAsync()` compatible with both native and web. The shopSite uses Node.js `crypto` — that is not available in Expo; `expo-crypto` is the correct substitute. Confidence: HIGH (official Expo docs pattern for PKCE).

**Why expo-secure-store + AsyncStorage:** The shopSite stores tokens in Next.js HTTP-only cookies. In Expo: (1) on native, use `expo-secure-store` for the access_token and refresh_token (encrypted, backed by Keychain/Keystore); (2) on web, `expo-secure-store` is not available — fall back to `AsyncStorage`. Create an abstraction layer:
```typescript
// lib/token-storage.ts
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function setToken(key: string, value: string) {
  if (Platform.OS === 'web') {
    return AsyncStorage.setItem(key, value);
  }
  return SecureStore.setItemAsync(key, value);
}
```

**Why NOT using Next.js cookie approach in Expo:** `next/headers` and server-side cookies do not exist in React Native. The auth flow must be purely client-side. The PKCE code verifier can be kept in memory during the redirect flow (not persisted) — only the tokens need persistence.

**Customer Account API endpoint (confirmed from shopSite):**
- Authorization: `https://{storeDomain}/.well-known/openid-configuration` (OpenID Discovery)
- Token exchange: discovered from OpenID config
- Customer GraphQL API: `https://shopify.com/{shopId}/account/customer/api/2025-01/graphql`

Installation:
```bash
npx expo install expo-auth-session expo-crypto expo-web-browser expo-secure-store
```

---

### Critical — Cart State Management

**Decision: React Context + AsyncStorage (no Zustand)**

The shopSite uses Zustand with `persist` middleware. For Expo, the recommended approach is to stay with the existing React Context pattern (already in `context/CartContext.tsx`) but upgrade it to:
1. Call real Shopify cart mutations instead of in-memory state
2. Persist the Shopify `cartId` to `AsyncStorage` so it survives app restarts

**Why not Zustand:** The app already has CartContext. Adding Zustand creates two state systems. Zustand's `persist` middleware requires a storage adapter for React Native (MMKV or AsyncStorage). The complexity is not justified — React Context with `useEffect` + `AsyncStorage` handles the cart ID persistence cleanly.

**Why AsyncStorage (not SecureStore) for cart ID:** The cart ID is not a secret — it is an opaque Shopify ID. `AsyncStorage` is correct here. `SecureStore` is reserved for auth tokens.

**AsyncStorage is already installed** (`@react-native-async-storage/async-storage@1.23.1`). No new packages needed for cart persistence.

**Cart ID persistence pattern:**
```typescript
// On app boot: restore cart ID
const cartId = await AsyncStorage.getItem('shopify_cart_id');
// After cartCreate mutation: persist the new ID
await AsyncStorage.setItem('shopify_cart_id', cart.id);
// On cart expiry (Shopify carts expire after 10 days): clear and recreate
await AsyncStorage.removeItem('shopify_cart_id');
```

---

### Supporting — Environment Variables

| Approach | Package | Version | Expo Web |
|----------|---------|---------|----------|
| `app.json` `extra` block + `expo-constants` | `expo-constants` | Already installed (17.0.8) | Full compatibility |

**Why this approach:** Expo does not support `.env` files natively in the same way Next.js does. The correct pattern is `app.json` `extra` config read via `Constants.expoConfig.extra`. For secrets, use EAS environment variables in production.

**app.json addition required:**
```json
{
  "expo": {
    "extra": {
      "shopifyStoreDomain": "your-store.myshopify.com",
      "shopifyStorefrontAccessToken": "...",
      "shopifyShopId": "...",
      "shopifyCustomerAccountClientId": "..."
    }
  }
}
```

**Access pattern:**
```typescript
import Constants from 'expo-constants';

const { shopifyStoreDomain, shopifyStorefrontAccessToken } =
  Constants.expoConfig?.extra ?? {};
```

**Confidence: HIGH** — `expo-constants` is already installed. This is the documented Expo pattern for non-secret public config. The Storefront API access token is a _public_ token (safe for client exposure). The Customer Account Client ID is also safe to expose. No server secrets are involved.

**What NOT to use:** `process.env.NEXT_PUBLIC_*` — Next.js syntax, does not work in Expo/Metro. `process.env.*` is only available in Metro if explicitly configured via `metro.config.js` `processEnv` — this is fragile and not recommended for Expo SDK 52.

---

### Supporting — Image Handling

`expo-image` is already installed (`v2.0.7`). It handles Shopify CDN URLs correctly.

**Shopify CDN URL patterns:**
```typescript
// Shopify image URLs support size parameters via query string
const imageUrl = `${product.images.edges[0].node.url}&width=400&height=400`;
// Or use Shopify's URL transform syntax:
const imageUrl = url.replace('.jpg', '_400x400.jpg');
```

**expo-image specific:**
- Use `contentFit="cover"` (not `resizeMode` — that's React Native Image, not expo-image)
- Use `transition` prop for gentle fade-in (brand-appropriate)
- Use `cachePolicy="memory-disk"` for product images (reduces network calls)
- Expo Web: `expo-image` renders as `<img>` tag — full compatibility

**Why expo-image over React Native's built-in Image:** `expo-image` has a significantly better cache, progressive loading, and web support. Already installed — no action needed.

---

### Supporting — Font Loading

`expo-font` (13.0.4) and both `@expo-google-fonts` packages are already installed. The `expo-font` plugin is already in `app.json` plugins.

**Pattern confirmed from theme.ts:**
```typescript
// theme.ts already defines the correct font family names:
heading: 'PlayfairDisplay_700Bold',
body: 'Lora_400Regular',
accent: 'PlayfairDisplay_400Regular_Italic',
```

**Loading pattern (use in root _layout.tsx):**
```typescript
import { useFonts } from 'expo-font';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_700Bold_Italic,
} from '@expo-google-fonts/playfair-display';
import {
  Lora_400Regular,
  Lora_700Bold,
  Lora_400Regular_Italic,
  Lora_700Bold_Italic,
} from '@expo-google-fonts/lora';
```

**Expo Web:** `@expo-google-fonts` on web loads fonts via CSS `@font-face` injected by the Metro web bundler. Compatible. One caveat: flash of unstyled text (FOUT) on first web load — use `SplashScreen.preventAutoHideAsync()` until fonts load (already pattern established in Expo SDK 52).

**No additional packages needed for fonts.**

---

### Optional — Checkout Flow

No new packages needed. The checkout approach is `Linking.openURL(cart.checkoutUrl)`:

```typescript
import * as Linking from 'expo-linking';
// expo-linking is already installed

await Linking.openURL(cart.checkoutUrl);
// On web: window.location.href equivalent
// On native: opens system browser
```

This is the correct pattern for Shopify checkout — Shopify handles PCI compliance, payment processing, and order confirmation. The `checkoutUrl` is returned from all cart mutations.

---

### Optional but Recommended — Error Boundaries

No new package needed. Use React's built-in `ErrorBoundary` class component or Expo Router's built-in error boundary (`app/+error.tsx`).

---

## Complete "Add to Project" Installation Command

```bash
# Shopify client (exact match to shopSite)
npx expo install @shopify/storefront-api-client

# Customer auth stack
npx expo install expo-auth-session expo-crypto expo-web-browser expo-secure-store
```

That is the complete list of new packages. Everything else is already installed.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Shopify client | `@shopify/storefront-api-client` | Raw `fetch` + `graphql-request` | shopSite has working queries that use this client's API; porting would require rewriting all query callsites |
| Shopify client | `@shopify/storefront-api-client` | `@shopify/hydrogen-react` | Hydrogen React requires RSC/Next.js server environment; not compatible with pure-client Expo |
| Auth | `expo-auth-session` | React Native App Auth | `expo-auth-session` is the official Expo OAuth library; integrates with Expo Router redirect scheme; no extra configuration for PKCE |
| Auth token storage | `expo-secure-store` + `AsyncStorage` | MMKV (`react-native-mmkv`) | MMKV requires native build steps (not compatible with Expo Go); SecureStore + AsyncStorage is sufficient and works in Expo Go |
| State management | React Context (existing) | Zustand | Zustand adds dependency without benefit — existing CartContext pattern is sufficient; avoids two competing state systems |
| Env vars | `expo-constants` + `app.json extra` | `dotenv` / `process.env` | `dotenv` is a Node.js tool; Metro does not process `.env` files by default in Expo SDK 52; `expo-constants` is the documented solution |
| Image | `expo-image` (existing) | React Native built-in `Image` | `expo-image` has superior cache, web compatibility, and performance; already installed |
| Fonts | `@expo-google-fonts` (existing) | Self-hosted font files | Google Fonts packages are already installed and correct; self-hosting adds bundle complexity without benefit |

---

## Expo Web Compatibility Matrix

| Package | Web Compatible | Notes |
|---------|---------------|-------|
| `@shopify/storefront-api-client` | Yes | Pure JS — works in any fetch-capable environment |
| `expo-auth-session` | Yes | On web, uses `window.location`-based redirect; on native, uses in-app browser |
| `expo-crypto` | Yes | Falls back to `window.crypto.subtle` on web |
| `expo-web-browser` | Yes (limited) | On web, `openBrowserAsync` opens a new tab; `openAuthSessionAsync` uses `window.location` redirect |
| `expo-secure-store` | No | Only works on native. Requires `Platform.OS === 'web'` check and AsyncStorage fallback |
| `@react-native-async-storage/async-storage` | Yes | Uses `localStorage` on web |
| `expo-image` | Yes | Renders as native `<img>` on web |
| `expo-font` / `@expo-google-fonts/*` | Yes | Uses CSS @font-face injection on web |
| `expo-linking` | Yes | Uses `window.location.href` on web |
| `expo-constants` | Yes | Reads from `app.json` extra in all environments |
| `react-native-reanimated` | Yes (v3.16+) | Full web support in Reanimated 3; use `useAnimatedStyle`, not Animated API |
| `react-native-gesture-handler` | Yes | Requires wrapping root in `GestureHandlerRootView` |
| `react-native-screens` | Yes | Renders as DOM elements on web |

---

## Key Shopify API Facts (Verified from shopSite)

- **Storefront API version in use:** `2025-04`
- **Client pattern:** `createStorefrontApiClient({ storeDomain, apiVersion: '2025-04', publicAccessToken })`
- **Cart mutation pattern:** `cartCreate` → `cartLinesAdd` / `cartLinesUpdate` / `cartLinesRemove`
- **Checkout:** `cart.checkoutUrl` — redirect via `Linking.openURL()`
- **Customer Account API version:** `2025-01` (separate from Storefront API)
- **Customer Account API base URL:** `https://shopify.com/{shopId}/account/customer/api/{version}/graphql`
- **Auth discovery:** `https://{storeDomain}/.well-known/openid-configuration`
- **Required env vars:**
  - `SHOPIFY_STORE_DOMAIN` — e.g., `your-store.myshopify.com`
  - `SHOPIFY_STOREFRONT_ACCESS_TOKEN` — public token, safe in app
  - `SHOPIFY_SHOP_ID` — numeric shop ID
  - `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` — OAuth client ID

---

## Shopify Integration Architecture (Expo vs Next.js)

The shopSite's Shopify integration was built for a server-rendered Next.js context. The Expo port requires these specific adaptations:

| shopSite (Next.js) | Expo Adaptation | Reason |
|--------------------|----------------|--------|
| `process.env.*` env vars | `Constants.expoConfig.extra.*` | Metro does not process `.env`; Expo uses `app.json` |
| `cookies()` from `next/headers` | `AsyncStorage` (cart ID) + `SecureStore` (auth tokens) | No server-side cookie jar in React Native |
| `crypto` from Node.js | `expo-crypto` | Node.js built-ins not available in Hermes JS engine |
| `window.location.href = authUrl` | `AuthSession.startAsync()` / `expo-web-browser` | Expo Router handles redirect scheme; auth needs in-app browser on native |
| Zustand `persist` middleware | React Context + `AsyncStorage.setItem` | Simpler, no extra dependency, uses existing CartContext |
| Server API routes (`/api/auth/*`) | Direct client PKCE flow | No server in Expo; PKCE makes server unnecessary for public OAuth clients |

---

## Confidence Assessment

| Area | Confidence | Basis |
|------|------------|-------|
| Core stack (already installed) | HIGH | Confirmed from `package.json` and `node_modules/` |
| `@shopify/storefront-api-client` in RN | HIGH | Pure JS library; no native modules; shopSite has working implementation |
| `expo-auth-session` for PKCE | HIGH | Official Expo OAuth library; documented for exactly this use case; training knowledge through Aug 2025 |
| `expo-crypto` replacing Node.js `crypto` | HIGH | Official Expo polyfill for `SubtleCrypto`; standard PKCE pattern |
| `expo-secure-store` for tokens | HIGH | Official Expo secure storage; standard pattern |
| Web compat of `expo-secure-store` | HIGH | Documented limitation: not available on web; `Platform.OS === 'web'` check is well-known pattern |
| `expo-constants` for env vars | HIGH | Already installed; official Expo env var pattern |
| Shopify cart ID lifetime | MEDIUM | Shopify carts expire after 10 days of inactivity; application needs to handle 404 on stale cartId and recreate (verified from Shopify docs pattern, not confirmed from shopSite code) |
| Customer Account API OpenID discovery URL format | MEDIUM | Pattern confirmed from `shopSite/lib/customer-account.ts`; exact URL structure is `{storeDomain}/.well-known/openid-configuration` — confirmed working in production |

---

## Sources

- Confirmed from codebase: `/Users/jamesputman/SRC/wildenflowerShop/package.json` — installed packages
- Confirmed from codebase: `/Users/jamesputman/SRC/shopSite/lib/shopify.ts` — `@shopify/storefront-api-client` usage pattern
- Confirmed from codebase: `/Users/jamesputman/SRC/shopSite/lib/customer-account.ts` — OAuth2/PKCE flow, OpenID discovery endpoint
- Confirmed from codebase: `/Users/jamesputman/SRC/shopSite/lib/cart-store.ts` — Shopify cart mutation pattern (cartCreate, cartLinesAdd)
- Confirmed from codebase: `/Users/jamesputman/SRC/shopSite/.env.example` — required environment variables
- Confirmed from codebase: `/Users/jamesputman/SRC/wildenflowerShop/app.json` — Expo plugin list, URI scheme `wildenflower`
- Training knowledge (Aug 2025): Expo SDK 52 compatibility for auth-session, crypto, secure-store, web-browser
- Training knowledge (Aug 2025): `expo-constants` as the standard env var approach in Expo
- Training knowledge (Aug 2025): `expo-secure-store` web unavailability and AsyncStorage fallback pattern
