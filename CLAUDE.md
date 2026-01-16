# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Baba Event Frontend - A Vue 3 + TypeScript event management and ticketing platform for concerts, festivals, weddings, and VIP parties. Features public event pages, a ticket purchasing system with PayPal/Bancontact integration, QR code ticket scanning, and an admin dashboard.

## Commands

```bash
# Development
npm run dev              # Start dev server (port 5173)
npm run build            # Production build with type-checking
npm run build-only       # Production build without type-checking
npm run type-check       # Run vue-tsc type checking only
npm run lint             # ESLint with auto-fix (cached)
npm run format           # Prettier formatting for src/

# Production
npm run preview          # Preview production build locally
npm run start            # Serve built dist/ folder
```

## Architecture

### State Management (Pinia Stores)
- `auth.ts` - JWT authentication with httpOnly cookies, auto-refresh on 401, role-based access (admin, super_admin, steward, user)
- `data.ts` - Public data with client-side cache (2min TTL), deduplicates concurrent API calls via shared promises, uses shallowRef for performance
- `adminData.ts` - Admin dashboard data
- `app.ts` - Global UI state (loading, theme, menu)

### Animation System (Critical Pattern)
GSAP animations are lazy-loaded only on desktop (>1024px) for mobile performance. Always use the centralized composable:

```typescript
import { useAnimations } from '@/composables/useAnimations'

const { initialize, createContext, isEnabled, isReady } = useAnimations()

onMounted(async () => {
  await initialize() // Loads GSAP only on desktop
  if (isEnabled.value) {
    const ctx = createContext(elementRef.value)
    ctx.context?.add(() => { ctx.gsap!.to('.el', { opacity: 1 }) })
  }
})

onUnmounted(() => ctx?.cleanup()) // REQUIRED - prevents memory leaks
```

Never import GSAP directly. Check `isEnabled.value` before animating. Cleanup is mandatory.

### API Service (`src/services/api.ts`)
- Singleton `api` instance with automatic token refresh on 401
- All requests include `credentials: 'include'` for httpOnly cookies
- Supports AbortController for request cancellation
- Endpoints defined in `src/config/api.ts`

### i18n (4 languages)
- Locales: fr (default), en, nl, sq
- Lazy-loaded locale files in `src/i18n/locales/`
- Detection priority: localStorage > browser > 'fr'
- Use `loadLocale()` before switching languages

### Routing
- Public routes: `/`, `/events/:slug`, `/mentions-legales`, `/confidentialite`, `/cgv`, `/payment/complete`
- Protected: `/scanner` (steward+), `/dashboard/*` (admin only)
- Auth check happens via navigation guards with auto-redirect to `/login`

### Component Organization
```
src/components/
  common/     # Reusable: EventCard, DJCard
  layout/     # AppHeader, AppFooter, GlobalBackground
  sections/   # Homepage sections: Hero, Events, Team
  ui/         # BaseButton, LoadingSpinner, Toast
  dashboard/  # Admin-specific components
  cart/       # Shopping cart components
```

### Type Definitions
Core types in `src/types/index.ts`: Event, Artist, Pack, Order, Ticket, ScanResponse, etc.
All entities support `*_translations` objects for multilingual content.

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8000  # Backend API (defaults to localhost:8000)
```

## Key Patterns

1. **Props**: Use `defineProps<Type>()` with TypeScript interfaces
2. **Composition API**: All components use `<script setup lang="ts">`
3. **Logging**: Use `logger` from `@/services/logger` (disabled in production)
4. **Path alias**: `@` maps to `src/`
5. **Build chunks**: vue-vendor, i18n, animations (GSAP lazy-loaded separately)

## Production Build Notes

- Terser removes console.log/debug/info
- Source maps disabled
- Images auto-optimized (PNG, JPEG, WebP, SVG)
- Code splitting via lazy routes
