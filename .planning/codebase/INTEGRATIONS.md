# External Integrations

**Analysis Date:** 2026-02-19

## Status

**Current State:** No external integrations implemented. App is client-only with mock data.

All data is currently sourced from `data/mock-data.ts` (products, makers, blog posts, FAQ items). The cart and favorites are managed entirely in-memory via React Context with no backend persistence.

## APIs & External Services

**Not Currently Integrated:**
- No product API integration
- No payment processing (Stripe, Square, etc.)
- No authentication provider (Auth0, Firebase Auth, etc.)
- No analytics (Segment, Mixpanel, Amplitude, etc.)

## Data Storage

**Current State:**
- Mock data only: `data/mock-data.ts` contains hardcoded products, makers, blog posts, FAQ
- No database connection
- No API endpoints

**Planned (for production):**
- Backend API to fetch:
  - `GET /api/products` - Product listing with filters
  - `GET /api/products/:id` - Product detail
  - `GET /api/makers/:id` - Maker profile
  - `GET /api/blog` - Blog posts
  - `GET /api/faq` - FAQ items
  - `POST /api/cart/checkout` - Process orders
  - `POST /api/users/auth` - User authentication

**Client Storage:**
- `@react-native-async-storage/async-storage` 1.23.1 installed but not used yet
- Ready to persist cart/favorites to device when needed
- Location: `context/CartContext.tsx` would need modification to save/restore state

## Authentication & Identity

**Current State:** Not implemented

**Planned Approach:**
- Authentication would be needed for:
  - User profiles and saved addresses (`types/index.ts` has `User` and `Address` interfaces)
  - Order history
  - Saved favorites persistence
  - Checkout (shipping/billing address)

**Future Options:**
- Backend session-based auth (JWT tokens stored in AsyncStorage)
- Firebase Authentication
- Auth0
- Supabase Auth

## Payment Processing

**Current State:** Not implemented

**Checkout Screen Exists:**
- `app/checkout.tsx` file exists (scaffolding)
- Checkout type definitions in `types/index.ts`
- No payment gateway integration

**Required for Production:**
- Payment processor (likely Stripe or Square for mobile)
- Backend endpoint to create payment intent
- PCI compliance considerations

## Monitoring & Observability

**Error Tracking:** None

**Logs:** None (console logging only)

**Future Needs:**
- Error tracking (Sentry, Rollbar, or similar)
- Crash reporting via EAS Crash Report

## CI/CD & Deployment

**Current State:**
- Local development only via `npx expo start`

**Production Path (Expo-managed):**
- Expo Application Services (EAS) for builds
- EAS Submit for app store distribution
- No GitHub Actions or other CI pipeline configured yet

**Build Command (when ready):**
```bash
eas build --platform ios
eas build --platform android
eas submit --platform ios  # Upload to App Store
```

## Image & Asset Hosting

**Current State:** Assets bundled locally in `assets/` directory

**Status:**
- Placeholder structure exists: `assets/images/` with subdirectories for headers, dividers, icons, empty states
- Actual botanical illustrations not yet created
- All asset paths are local requires

**Production Considerations:**
- Product images: Will need remote CDN (e.g., Cloudinary, AWS S3, Bunny CDN) with resize/optimization
- Maker avatars: Remote or bundled
- Blog cover images: Remote or bundled
- Botanical illustrations: Local or remote (currently expected to be generated per design guide in CLAUDE.md)

## Environment Configuration

**Current Configuration:**
- No `.env` file
- All configuration via TypeScript constants in `constants/theme.ts`

**When Integrations Added, You'll Need:**
```
API_BASE_URL=https://api.wildenflower.app
STRIPE_PUBLIC_KEY=pk_live_...
AUTH_PROVIDER_KEY=...
```

**Storage Location (when needed):**
- Use EAS secrets for production
- `.env.local` or `.env.development` for local development (never commit)
- Reference via `process.env.*` in Node context, but handle carefully in React Native

## Webhooks & Callbacks

**Incoming:** None

**Outgoing:** None

**Planned (for production):**
- Payment webhook to update order status
- Could integrate with maker notification system for new orders

## Type Definitions Ready for Integration

The codebase has TypeScript interfaces prepared for future integrations:

**User Management** (`types/index.ts`):
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  favorites: string[];
  addresses: Address[];
}

interface Address {
  id: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
}
```

**Product Data** (`types/index.ts`):
```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  story?: string;
  images: string[];
  category: string;
  maker: Maker;
  materials?: string[];
  careInstructions?: string;
  isFavorite?: boolean;
  createdAt: string;
}
```

## Cart State Management

**Current Implementation** (`context/CartContext.tsx`):
- In-memory only (lost on app reload)
- Uses React Context + useReducer
- No backend persistence
- No payment processing

**Actions Available:**
- `ADD_TO_CART`
- `REMOVE_FROM_CART`
- `UPDATE_QUANTITY`
- `CLEAR_CART`
- `TOGGLE_FAVORITE`

**When Ready to Persist:**
1. Save cart state to AsyncStorage after each action
2. Restore cart on app launch from AsyncStorage
3. Sync with backend order service on checkout

## Notes for Backend Development

**Recommended Backend Stack (suggestion only):**
- Node.js + Express, or
- Python + Django, or
- Supabase PostgreSQL with REST API

**Critical Endpoints Needed:**
- Product catalog (filterable by category)
- Maker profiles
- Blog content management
- FAQ management
- User authentication
- Order processing
- Payment handling (via Stripe webhook)

**Rate Limiting:** Not configured (plan for production)

**CORS:** Not configured (plan for production when connecting to backend)

---

*Integration audit: 2026-02-19*
