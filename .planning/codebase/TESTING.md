# Testing Patterns

**Analysis Date:** 2026-02-19

## Test Framework

**Runner:**
- Not configured (no testing framework installed)

**Assertion Library:**
- Not configured

**Dev Dependencies:**
- Current `devDependencies` in `package.json`:
  - `@types/react` ~18.3.0
  - `typescript` ~5.3.0
- No test runner (Jest, Vitest, etc.)
- No assertion library (Jest matchers, Chai, Vitest, etc.)

**Run Commands:**
- No test scripts defined in `package.json`
- No way to run tests currently

## Current Testing State

**Status:** No automated testing infrastructure in place.

**Test File Organization:**
- Zero test files found in codebase (`*.test.*` or `*.spec.*`)
- No `__tests__` directories

**Coverage:**
- No coverage configuration
- No coverage tooling

## Recommended Testing Strategy (for future implementation)

When testing is added to this project, follow these patterns based on codebase structure:

### Unit Test Structure

**For context/hooks** (example pattern for `CartContext.tsx`):
```typescript
describe('CartContext', () => {
  describe('cartReducer', () => {
    it('ADD_TO_CART: should add new product to empty cart', () => {
      const state = { items: [], favorites: [] };
      const action = { type: 'ADD_TO_CART', product: mockProduct };

      const result = cartReducer(state, action);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].quantity).toBe(1);
    });

    it('ADD_TO_CART: should increment quantity if product exists', () => {
      const state = { items: [{ product: mockProduct, quantity: 1 }], favorites: [] };
      const action = { type: 'ADD_TO_CART', product: mockProduct };

      const result = cartReducer(state, action);

      expect(result.items[0].quantity).toBe(2);
    });
  });
});
```

**For reducer logic:**
- Test each `CartAction` type separately
- Verify immutability (state not mutated)
- Test edge cases (quantity <= 0, product not found, etc.)
- Assert both successful cases and error cases

**For components** (example pattern for `ProductCard.tsx`):
```typescript
describe('ProductCard', () => {
  it('renders product name and price', () => {
    const { getByText } = render(
      <ProductCard
        product={mockProduct}
        onPress={jest.fn()}
      />
    );

    expect(getByText(mockProduct.name)).toBeTruthy();
    expect(getByText(`$${mockProduct.price.toFixed(2)}`)).toBeTruthy();
  });

  it('calls onFavoriteToggle when favorite button pressed', () => {
    const onFavoriteToggle = jest.fn();
    const { getByLabelText } = render(
      <ProductCard
        product={mockProduct}
        onPress={jest.fn()}
        onFavoriteToggle={onFavoriteToggle}
      />
    );

    fireEvent.press(getByLabelText('Add to favorites'));
    expect(onFavoriteToggle).toHaveBeenCalled();
  });
});
```

**For context hooks:**
```typescript
describe('useCart', () => {
  it('should throw error if used outside CartProvider', () => {
    expect(() => {
      renderHook(() => useCart());
    }).toThrow('useCart must be used within a CartProvider');
  });

  it('should add product to cart', () => {
    const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProduct);
    });

    expect(result.current.cartCount).toBe(1);
  });
});
```

### Integration Test Structure

**For screens** (example pattern for `HomeScreen`):
```typescript
describe('HomeScreen', () => {
  it('renders featured products grid', async () => {
    const { getByText } = render(
      <CartProvider>
        <HomeScreen />
      </CartProvider>
    );

    // All featured products should be visible
    expect(getByText(products[0].name)).toBeTruthy();
  });

  it('navigates to product detail on product press', () => {
    const { getByText } = render(
      <CartProvider>
        <HomeScreen />
      </CartProvider>
    );

    fireEvent.press(getByText(products[0].name));
    // Verify navigation occurred
  });
});
```

**For context consumption in components:**
- Test components wrapped in `CartProvider`
- Verify context methods are called correctly
- Test state changes propagate to component

### Test Data (Fixtures)

**Mock objects pattern** (`__mocks__/mockData.ts` or in test files):
```typescript
export const mockProduct: Product = {
  id: 'test-product-1',
  name: 'Test Product',
  price: 29.99,
  description: 'A test product',
  images: ['image.jpg'],
  category: 'earth',
  maker: {
    id: 'maker-1',
    name: 'Test Maker',
    location: 'Test Location',
  },
  createdAt: '2026-01-01',
};

export const mockMaker: Maker = {
  id: 'maker-1',
  name: 'Test Maker',
  bio: 'Test bio',
  location: 'Test Location',
  specialties: ['Test'],
  productCount: 5,
};
```

**Fixtures location (recommended):**
- `__mocks__/mockData.ts` — centralized test fixtures
- OR co-locate fixtures with test files (`ProductCard.test.tsx` with `ProductCard.mock.ts`)

## Testing Priorities (What to Test First)

### High Priority (Core Business Logic)

1. **CartContext Reducer** (`context/CartContext.tsx`):
   - ADD_TO_CART with new and existing products
   - REMOVE_FROM_CART
   - UPDATE_QUANTITY with edge cases (0, negative, etc.)
   - TOGGLE_FAVORITE
   - Immutability verification

2. **useCart Hook**:
   - Context not available error
   - All context methods callable
   - Computed values (cartTotal, cartCount)

### Medium Priority (UI Components)

3. **ProductCard** (`components/ProductCard.tsx`):
   - Renders product data
   - Favorite toggle works
   - onPress callback fires
   - Accessibility labels present

4. **CategoryChip** (`components/CategoryChip.tsx`):
   - Renders category label
   - Active/inactive states
   - onPress callback fires

5. **MakerBadge** (`components/MakerBadge.tsx`):
   - Renders maker name and location
   - Optional location handling
   - onPress callback if provided

### Lower Priority (Layout/Presentational)

6. **BotanicalHeader, BotanicalDivider, WatercolorWash** — mostly layout, low logic
7. **Screen components** — test after component unit tests pass

## Mocking Strategy

**What to Mock:**
- React Router navigation (`useRouter`)
- Context state (in unit tests; integrate in integration tests)
- External APIs (when implemented)
- Image assets (placeholder rendering is fine)

**What NOT to Mock:**
- CartContext reducer logic — test the real implementation
- Theme constants — test with real theme values
- Type definitions — don't mock types
- Component composition — test real component tree in integration tests

**Mocking pattern (Redux-style):**
```typescript
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
}));

jest.mock('../context/CartContext', () => ({
  useCart: jest.fn(() => ({
    state: { items: [], favorites: [] },
    addToCart: jest.fn(),
    // ... other methods
  })),
}));
```

## Async Testing

**Patterns for async operations:**
```typescript
it('should load fonts and hide splash screen', async () => {
  const { result } = renderHook(() => {
    const [fontsLoaded] = useFonts({...fonts});
    useEffect(() => {
      if (fontsLoaded) {
        SplashScreen.hideAsync();
      }
    }, [fontsLoaded]);
    return fontsLoaded;
  });

  await waitFor(() => {
    expect(result.current).toBe(true);
  });

  expect(SplashScreen.hideAsync).toHaveBeenCalled();
});
```

**For state updates in hooks:**
```typescript
const { result } = renderHook(() => useCart(), { wrapper: CartProvider });

act(() => {
  result.current.addToCart(mockProduct);
});

expect(result.current.cartCount).toBe(1);
```

## Error Testing

**Pattern for error cases:**
```typescript
it('should throw error if useCart called outside CartProvider', () => {
  const { result } = renderHook(() => useCart());

  expect(result.error).toEqual(
    new Error('useCart must be used within a CartProvider')
  );
});

it('should handle invalid quantity', () => {
  const state = { items: [{product: mockProduct, quantity: 1}], favorites: [] };
  const action = { type: 'UPDATE_QUANTITY', productId: mockProduct.id, quantity: -5 };

  const result = cartReducer(state, action);

  // Product should be removed when quantity goes negative
  expect(result.items).toHaveLength(0);
});
```

## Recommended Testing Stack

When implementing tests, use:
- **Framework:** Vitest or Jest (Vitest recommended for React Native + TypeScript)
- **Assertions:** Vitest built-in or Chai
- **Component Testing:** React Native Testing Library
- **Mocking:** Vitest/Jest built-in mocking
- **Coverage:** Vitest coverage reporter

**Installation example:**
```bash
npm install --save-dev vitest @testing-library/react-native @testing-library/jest-native @vitest/ui
```

## Configuration (When Adding Tests)

**Recommended `vitest.config.ts`:**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node', // or 'jsdom' for component tests
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
  },
});
```

---

*Testing analysis: 2026-02-19*

**Note:** This codebase currently has no test infrastructure. These patterns represent recommended approaches based on code structure and React Native best practices. Tests should be added before adding major new features or refactoring existing code.
