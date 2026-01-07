# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Baba Event** is a modern event management and promotion web application (concerts, festivals, weddings, VIP parties) built with Vue 3, TypeScript, and Vite. The application features a premium UI with smooth animations and responsive design, supporting 4 languages (French, English, Dutch, Albanian).

**Tech Stack:**
- Vue 3 (Composition API) + TypeScript
- Vite 7 for build tooling
- Pinia for state management
- Vue Router 4 for routing
- GSAP 3 for animations (lazy-loaded, desktop only)
- Lenis for smooth scrolling (desktop only)
- Vue I18n for internationalization

## Common Commands

```bash
# Development with hot-reload (port 5173)
npm run dev

# Build for production with type-checking
npm run build

# Build without type-checking (faster)
npm run build-only

# Preview production build
npm run preview

# Type-checking only
npm run type-check

# Linting with auto-fix
npm run lint

# Format code
npm run format

# Production server (after build)
npm run start
```

## Architecture & Key Patterns

### 1. Conditional Animation System (CRITICAL)

Animations are **lazy-loaded only on desktop (>1024px)** to optimize mobile performance. This is a core architectural pattern used throughout the app.

**ALWAYS use `useAnimations()` composable** - NEVER import GSAP directly:

```typescript
import { useAnimations } from '@/composables/useAnimations'

const { initialize, createContext, isReady, isEnabled } = useAnimations()

onMounted(async () => {
  await initialize() // Loads GSAP only if desktop

  if (isEnabled.value) {
    const animCtx = createContext(elementRef.value)
    animCtx.context?.add(() => {
      animCtx.gsap!.to('.element', { opacity: 1, duration: 1 })
    })
  }
})

onUnmounted(() => {
  animCtx?.cleanup() // REQUIRED: prevents memory leaks
})
```

**Key behaviors:**
- Desktop (>1024px): GSAP loaded, animations enabled
- Mobile/Tablet (≤1024px): GSAP not loaded, elements visible immediately
- Reduced motion preference: Animations disabled even on desktop
- CSS media queries must align with 1024px breakpoint

### 2. Authentication & Route Protection

**JWT tokens stored in httpOnly cookies** (secure against XSS). All API requests use `credentials: 'include'`.

**Auth Store** (`src/stores/auth.ts`):
- Automatic token refresh via `/api/auth/refresh`
- Navigation guards in `src/router/index.ts`
- Protected routes use `meta: { requiresAuth: true }`
- Admin routes (`/dashboard/*`) require `admin` or `super_admin` role
- Steward role redirects to `/scanner` instead of `/dashboard`

### 3. Internationalization (i18n)

**4 languages supported:** French (default), English, Dutch, Albanian

**Locale loading is dynamic** (lazy-loaded):
```typescript
import { loadLocale } from '@/i18n'
await loadLocale('en') // Only loads when needed
```

**Language detection order:**
1. localStorage `locale` key
2. Browser language (`navigator.language`)
3. Fallback to French

**Content translation pattern** for database entities:
```typescript
interface Event {
  title: string // Default (usually French)
  title_translations?: {
    fr?: string
    en?: string
    nl?: string
    sq?: string
  }
}
```

Translation files: `src/i18n/locales/{fr,en,nl,sq}.ts`

### 4. Data Store & API Pattern

**Pinia store** (`src/stores/data.ts`) with caching and deduplication:
- Uses `shallowRef` for large arrays (performance optimization)
- 2-minute cache TTL for public data
- Shared promises prevent concurrent duplicate API calls
- Automatic fallback to mock data if API unavailable

**API Service** (`src/services/api.ts`):
- Singleton instance exported as `api`
- All requests include `credentials: 'include'` for cookies
- Centralized error handling
- Type-safe responses

**Example usage:**
```typescript
import { useDataStore } from '@/stores/data'
const dataStore = useDataStore()

// Force refresh with force=true
await dataStore.fetchEvents(force: true)

// Access cached data
const events = dataStore.upcomingEvents
```

### 5. Performance Optimizations

**Code splitting** (see `vite.config.ts`):
- `vue-vendor`: Vue core (vue, vue-router, pinia)
- `i18n`: Vue I18n bundle
- `animations`: GSAP (lazy-loaded)

**Build optimizations:**
- Terser minification with console.log/debug/info removal in production
- Automatic image optimization (PNG, JPEG, WebP, SVG)
- Source maps disabled in production
- All routes lazy-loaded

**Runtime optimizations:**
- GSAP lazy-loaded only on desktop
- Lenis smooth scroll only on desktop
- i18n messages loaded on-demand per locale
- Shared promises to deduplicate concurrent API calls

### 6. Component Organization

```
src/components/
├── common/         # Reusable components (EventCard, DJCard)
├── dashboard/      # Admin dashboard components
├── layout/         # Layout components (AppHeader, AppFooter)
├── sections/       # Homepage sections (Hero, Events, Team)
└── ui/             # Base UI components (buttons, spinners, etc.)
```

**Component patterns:**
- Always use Composition API (`<script setup lang="ts">`)
- Type props with `defineProps<Type>()`
- Always cleanup animations in `onUnmounted()`
- Use `shallowRef` for large arrays/objects that don't need deep reactivity

### 7. Environment Variables

```env
# API Backend URL
VITE_API_BASE_URL=http://localhost:8000

# Environment
NODE_ENV=development
```

If `VITE_API_BASE_URL` is not set, defaults to `http://localhost:8000`.

## Development Constraints

### Must Follow

1. **Animation Cleanup**: Always call `animCtx?.cleanup()` in `onUnmounted()` to prevent memory leaks
2. **Use useAnimations()**: Never import GSAP directly - always use the composable
3. **Cookie-based Auth**: All API calls must include `credentials: 'include'`
4. **TypeScript Strict Mode**: Enabled - all code must be type-safe
5. **Composition API Only**: No Options API components
6. **i18n Pattern**: Use translation keys, not hardcoded strings

### Avoid

1. **Direct GSAP imports** - breaks mobile optimization
2. **Deep reactivity for large arrays** - use `shallowRef` instead
3. **Hardcoded strings** - use i18n translation keys
4. **Console.log in production code** - use logger service instead
5. **Options API** - project uses Composition API exclusively

## API Endpoints Reference

All endpoints defined in `src/config/api.ts`:

**Auth:**
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout (clears cookies)
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

**Events:**
- `GET /api/events` - All events
- `GET /api/events/upcoming` - Upcoming events (filtered, sorted by date)
- `GET /api/events/past?limit=12&offset=0` - Past events (paginated)
- `GET /api/events/:id` - Event by ID

**Artists:**
- `GET /api/artists` - All artists
- `GET /api/artists/:id` - Artist by ID

**Checkout & Payments:**
- `POST /api/checkout/create-session` - Create single-pack checkout
- `POST /api/checkout/create-cart-session` - Create multi-pack checkout
- `GET /api/checkout/order/:orderNumber` - Get order by number

**Scanner (Steward):**
- `POST /api/scan/validate` - Validate ticket QR code
- `GET /api/scan/stats/:eventId` - Get scan statistics
- `GET /api/scan/history?event_id=&limit=` - Get scan history

**Admin:**
- `GET /api/admin/orders` - List orders (paginated, filtered)
- `GET /api/admin/orders/:id` - Order details
- `POST /api/admin/orders/:id/refund` - Refund order
- `POST /api/admin/orders/:id/resend-email` - Resend confirmation email
- `GET /api/admin/stats` - Global statistics
- `GET /api/admin/stats/:eventId` - Event statistics
- `GET /api/admin/users` - List users
- `GET /api/admin/users/:id` - User details

## Logger Service

**Use logger instead of console** (`src/services/logger.ts`):
```typescript
import { logger } from '@/services/logger'

logger.log('Info message')
logger.warn('Warning message')
logger.error('Error message')
```

Logs are automatically disabled in production (via `import.meta.env.DEV`).

## Deployment

**Production server**: Caddy (configured in `Caddyfile`)
- GZIP/Zstd compression
- Immutable caching for hashed assets (`/assets/*`)
- 1-week cache for static images
- Security headers (CSP, XSS protection, X-Frame-Options)
- SPA routing support (redirects to `index.html`)

**Build artifacts**: Output to `dist/` directory

## Key Files to Reference

- `src/composables/useAnimations.ts` - Animation system implementation
- `src/router/index.ts` - Route protection logic
- `src/stores/auth.ts` - Authentication state management
- `src/stores/data.ts` - Data caching and API orchestration
- `src/config/api.ts` - API endpoint configuration
- `vite.config.ts` - Build optimizations and code splitting
- `src/types/index.ts` - TypeScript type definitions
