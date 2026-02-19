# Coding Conventions

**Analysis Date:** 2026-02-19

## Naming Patterns

**Files:**
- Component files: PascalCase with .tsx extension (`ProductCard.tsx`, `MakerBadge.tsx`)
- Screen files: kebab-case inside route directories (`(tabs)/index.tsx`, `product/[id].tsx`)
- Type files: PascalCase type definitions (`types/index.ts`)
- Context/hook files: PascalCase with descriptive names (`CartContext.tsx`)
- Constants: lowercase with descriptive grouping (`constants/theme.ts`)

**Functions:**
- Component functions: PascalCase for exported components (`export default function HomeScreen()`)
- Arrow functions for handlers: camelCase with prefix (`handleProductPress`, `handleCategoryPress`)
- Helper functions: camelCase descriptive names (e.g., `cartTotal`, `cartCount`)
- Reducer functions: camelCase lowercase (`cartReducer`)

**Variables:**
- State variables: camelCase (`activeCategory`, `fontsLoaded`, `cartCount`)
- Boolean variables: camelCase with semantic prefix (`isActive`, `isFavorite`, `focused`)
- Constants from theme: destructured from `constants/theme.ts` (e.g., `colors.terracotta`)
- Template literals: Used for dynamic strings (e.g., `\`/product/${product.id}\``)

**Types:**
- Interfaces: PascalCase with Suffix convention (e.g., `ProductCardProps`, `CartContextType`, `CartState`)
- Union types: PascalCase (e.g., `CartAction`, `TabRoute`)
- Type parameters: Single letter or semantic (e.g., `React.FC<ProductCardProps>`)

## Code Style

**Formatting:**
- No explicit formatter configured in package.json (no prettier/eslint entries)
- Consistent 2-space indentation throughout
- No trailing semicolons enforced in config, but present in actual code
- Spaces around imports and logical sections (using `// ─── ` dividers)

**Linting:**
- TypeScript strict mode enabled in `tsconfig.json` (`strict: true`)
- Path aliases configured: `@/*` maps to root directory
- No ESLint or Prettier config files at root level

**Code Organization:**
- Files divided into clear sections with visual separators: `// ─── Props ───`, `// ─── Component ───`, `// ─── Styles ───`, `// ─── Actions ───`
- Comments using decorative dividers for visual hierarchy
- JSDoc-style comments for file descriptions at top of each file

## Import Organization

**Order (observed pattern in all files):**
1. React imports (`import React from 'react'`)
2. React Native imports (`import { View, Text, ... } from 'react-native'`)
3. Expo Router imports (`import { useRouter } from 'expo-router'` or `import { Stack } from 'expo-router'`)
4. Expo-specific imports (`import * as SplashScreen from 'expo-splash-screen'`)
5. Font imports (`import { PlayfairDisplay_700Bold, ... } from '@expo-google-fonts/...'`)
6. Internal theme/constants imports (`import { colors, fonts, ... } from '../constants/theme'`)
7. Internal context imports (`import { useCart } from '../context/CartContext'`)
8. Internal data imports (`import { products } from '../data/mock-data'`)
9. Type imports (`import { Product, Maker, ... } from '../types'`)
10. Component imports (`import ProductCard from './ProductCard'`)

**Path Aliases:**
- `@/*` resolves to repository root (configured in `tsconfig.json`)
- Relative imports preferred over aliases in current codebase (no usage of `@/` observed)

## Error Handling

**Context Error Patterns:**
- Custom hook error checking: Throw descriptive error if context not available
  ```typescript
  export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (!context) {
      throw new Error('useCart must be used within a CartProvider');
    }
    return context;
  };
  ```

**Reducer Safe State:**
- Quantity validation before state update: Check `quantity <= 0` to remove from cart
- Default case in switch: Returns unchanged state rather than throwing

**No explicit error boundaries or try-catch blocks observed in current code** - error handling is minimal and type-safe through TypeScript strict mode.

## Logging

**Framework:** `console` (native React Native logging)

**Patterns:**
- No formal logging framework used yet
- Comments used extensively instead of runtime logs
- Brand copy constants centralized in `constants/theme.ts` under `copy` object
- Error messages use human-readable text (e.g., "useCart must be used within a CartProvider")

## Comments

**When to Comment:**
- File-level documentation at top of every file (purpose, layout description)
- Section dividers for logical groupings (`// ─── Props ───────`, etc.)
- Placeholder instructions for asset integration (`{/* ASSET: filename.png — description */}`)
- Accessibility hints and helper clarifications
- Layout structure documentation (especially on screen files)

**JSDoc/TSDoc:**
- Minimal JSDoc observed
- Interface descriptions in comments above prop interfaces (e.g., "Optional additional styles applied to the outer container.")
- File descriptions use block comment format with title and description

**Asset Placeholders:**
All component files include structured comments for missing botanical assets:
```typescript
{/* ASSET: filename.png — Description of what asset should be */}
{/* Replace with: <Image source={require(...)} style={styles.name} /> */}
```

## Function Design

**Size:** Functions are compact and focused on single responsibilities
- Handler functions: 2-5 lines
- Component bodies: 20-100 lines (screens longer)
- Reducer cases: 5-15 lines each

**Parameters:**
- Props destructured in function signature: `({ product, onPress, isFavorite = false, ...rest })`
- Default parameters used for optional values (`isFavorite = false`, `variant = 'large'`)
- Callback handlers follow naming pattern `on[Event]` (e.g., `onPress`, `onFavoriteToggle`)

**Return Values:**
- Components return JSX with consistent structure (wrapper, content sections, styles)
- Hooks return single value or object with related values
- Context hook returns error if context unavailable
- Reducer returns new state object (never mutates)

**Immutability Pattern:**
- Spread operator used consistently: `{ ...state, items: [...state.items, newItem] }`
- Never direct array mutation; use `.filter()`, `.map()` for array updates
- Product arrays filtered/sliced rather than modified in place

## Module Design

**Exports:**
- Default export for screens and most components (`export default function ComponentName`)
- Named exports for some reusable components that are also used as defaults
  - Example: `ProductCard` exports both named (`export const ProductCard`) and default
- Context hook exported as named export (`export const useCart`)
- Provider exported as named export (`export const CartProvider`)

**Barrel Files:**
- No barrel files (`index.ts` re-exports) observed in current structure
- Direct imports from component files by name (`import ProductCard from './ProductCard'`)

**Component Composition:**
- Higher-order composition pattern: Screen components import and nest smaller components
- Example: `HomeScreen` composes `BotanicalHeader`, `HeroCard`, `SectionTitle`, `CategoryRow`, `ProductGrid`
- Props drilling used for state/callbacks (no complex state management beyond Cart Context)

## React Patterns

**Hooks:**
- `useState` for local component state (e.g., `activeCategory`)
- `useReducer` for cart state management
- `useContext` for consuming CartContext
- `useFonts` from Expo for font loading
- Custom hook `useCart` for context consumption

**Re-render Optimization:**
- `memo` used on TabIcon component for performance: `export default memo(TabIcon)`
- No other memoization observed; not aggressive optimization yet

**Functional Components:**
- All components are functional, no class components
- Types specified as `React.FC<Props>` or just function declarations

## Styling Patterns

**StyleSheet.create:**
- Used in every component for all styles
- Never inline styles except `[styles.base, styles[variant]]` style array combinations
- Styles organized by section: `imageArea`, `favoriteButton`, `contentArea`, `productName`

**Theme Tokens:**
- ALL colors imported from `constants/theme.ts`
- ALL font families imported from `constants/theme.ts`
- ALL spacing values imported from `constants/theme.ts`
- Never hardcode `#FFFFFF` or `#000000` — use theme colors
- Spread operator for compound styles: `{ ...shadows.md }`, `{ ...shadows.glow }`

**Layout System:**
- `flexDirection: 'row'` and `flex: 1` for layouts
- `gap` property for spacing between items
- No margin/padding magic numbers — always use `spacing.*` tokens
- Responsive: `numberOfLines` property on Text for wrapping control

## Type Safety

**TypeScript Strict Mode:**
- Enabled in `tsconfig.json`
- All function parameters typed
- Return types specified for exported functions and components
- Interface props defined for all components
- No implicit `any` types

**Type Usage:**
- Props interfaces inherit exact parameter needs (no extra fields)
- Discriminated unions for action types (e.g., `CartAction` type)
- Optional fields marked with `?` in interfaces
- Read-only data marked where appropriate (though not heavily used)

## Accessibility

**A11y Practices:**
- `accessibilityRole` specified on interactive elements (`'button'`, `'image'`)
- `accessibilityLabel` descriptive on all buttons and icons
- `hitSlop` property on small interactive targets (e.g., favorite button: `8px` on all sides)
- Tab bar accessibility labels include context (e.g., "Cart tab — 3 items")
- `numberOfLines` property prevents text overflow visually and for screen readers

---

*Convention analysis: 2026-02-19*
