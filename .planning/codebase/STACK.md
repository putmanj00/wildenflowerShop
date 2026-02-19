# Technology Stack

**Analysis Date:** 2026-02-19

## Languages

**Primary:**
- JavaScript/TypeScript 5.3 - All source code
- JSX/TSX - UI components in React Native

**Secondary:**
- JSON - Configuration and data structures

## Runtime

**Environment:**
- Node.js (version from `.nvmrc` not specified, inferred npm v10+ from lockfileVersion 3)

**Package Manager:**
- npm (lockfileVersion 3 indicates npm 10.0.0 or later)
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 18.3.1 - UI library
- React Native 0.76.9 - Mobile cross-platform framework
- Expo SDK 52.0.0 - Mobile app platform and tooling
- Expo Router 4.0.0 - File-based routing (Expo Router v4)

**UI & Styling:**
- React Native built-in `StyleSheet.create()` - All styling (no CSS framework)

**Fonts:**
- @expo-google-fonts/playfair-display 0.4.2 - Heading serif font (Playfair Display)
- @expo-google-fonts/lora 0.4.2 - Body serif font (Lora)

**Animation:**
- react-native-reanimated 3.16.0 - Complex gesture-driven animations

**Navigation & Routing:**
- expo-router 4.0.0 - File-based navigation
- react-native-screens 4.4.0 - Native stack navigator
- react-native-gesture-handler 2.20.0 - Gesture handling for navigation
- react-native-safe-area-context 4.12.0 - Safe area view management

**State Management:**
- React Context API - Global cart and favorites state (no Redux)
- useReducer hook - Cart state reducer in `context/CartContext.tsx`

**Asset Management:**
- expo-asset 11.0.5 - Asset bundling
- expo-font 13.0.0 - Font loading and caching
- expo-image 2.0.0 - Image component with caching
- expo-splash-screen 0.29.0 - Native splash screen control

**Platform Support:**
- react-native-web 0.19.13 - Web support (optional)
- @expo/metro-runtime 4.0.1 - Metro bundler runtime

## Key Dependencies

**Critical:**
- expo 52.0.0 - Core platform providing Expo SDK, Expo Go, and build services
- react-native 0.76.9 - JavaScript bridge to native iOS/Android APIs
- expo-router 4.0.0 - Routing and navigation (uses file-based conventions)
- react-native-reanimated 3.16.0 - High-performance animations required for brand experience

**Local State Persistence:**
- @react-native-async-storage/async-storage 1.23.1 - Local device storage for cart/favorites (not yet integrated)

**Infrastructure:**
- None - No backend framework (this is client-only)

## Configuration

**Environment:**
- No `.env` file setup yet (see INTEGRATIONS.md for future API needs)
- All configuration via `constants/theme.ts` (design system tokens)
- Expo configuration via `app.json`:
  - App name: "Wildenflower"
  - Slug: "wildenflower"
  - Version: 1.0.0
  - Orientation: portrait only
  - Light mode UI style

**Build:**
- `app.json` - Expo configuration (ios/android package identifiers, plugins)
- `tsconfig.json` - TypeScript configuration
  - Extends: expo/tsconfig.base
  - Strict mode: enabled
  - Path aliases: `@/*` maps to project root

**Plugins:**
- expo-router - File-based routing
- expo-font - Font loading
- expo-asset - Asset optimization

## Platform Requirements

**Development:**
- Expo CLI (via `npx expo start`)
- iOS development: Xcode simulator or physical device + Expo Go app
- Android development: Android Studio emulator or physical device + Expo Go app
- No native code setup required (managed Expo environment)

**Production:**
- Expo Application Services (EAS) for building iOS/Android binaries
- Bundle identifier: `com.wildenflower.app` (iOS)
- Package name: `com.wildenflower.app` (Android)
- Supports iPhone with adaptive layout
- Supports Android devices with adaptive icon

## Project Structure

```
wildenflower-app/
├── app/                        # Expo Router screens
│   ├── _layout.tsx            # Root layout with providers
│   ├── (tabs)/                # Tab-based navigation
│   │   ├── _layout.tsx        # Tab bar configuration
│   │   ├── index.tsx          # Home screen
│   │   ├── browse.tsx         # Product listing
│   │   ├── favorites.tsx      # Wishlist
│   │   ├── cart.tsx           # Shopping cart
│   │   └── profile.tsx        # User profile
│   ├── product/[id].tsx       # Product detail (dynamic)
│   ├── blog/                  # Blog screens
│   ├── maker/[id].tsx         # Maker profile (dynamic)
│   ├── checkout.tsx           # Checkout flow
│   ├── about.tsx              # Brand story
│   └── faq.tsx                # FAQ
├── components/                # Reusable UI components
├── constants/                 # Design tokens and theme
│   ├── theme.ts              # Single source of truth for colors, fonts, spacing
│   └── asset-manifest.ts     # Asset inventory
├── context/                   # React Context providers
│   └── CartContext.tsx       # Global cart state
├── data/                      # Mock data (replace with API calls)
├── types/                     # TypeScript definitions
├── hooks/                     # Custom React hooks (empty, for future)
├── assets/                    # Images and fonts
│   ├── fonts/                # Font files
│   └── images/               # Illustrated assets
├── app.json                   # Expo configuration
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
└── CLAUDE.md                 # Brand guidelines
```

## Scripts

```bash
npm start              # Start Expo dev server (web prompt)
npm run ios           # Start Expo for iOS simulator
npm run android       # Start Expo for Android emulator
npm run web           # Start web version
```

## Development Philosophy

- **No backend integration yet** - App uses mock data from `data/mock-data.ts`
- **Client-side state only** - React Context for cart/favorites, no persistence to backend
- **Design-system-first** - All visual tokens centralized in `constants/theme.ts`
- **TypeScript strict mode** - Full type safety throughout
- **Managed Expo** - No native code, no Xcode/Android Studio setup required

---

*Stack analysis: 2026-02-19*
