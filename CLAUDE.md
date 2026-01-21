# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Baba Events is a Vue 3 event ticketing platform with multi-language support (FR, EN, NL, SQ). The frontend connects to a Python backend API (separate repository). The site is deployed on Railway at baba.events.

## Commands

```bash
# Development
npm run dev          # Start dev server on port 5173

# Build & Production
npm run build        # Type-check + production build
npm run build-only   # Vite build without type-check
npm run type-check   # TypeScript validation (vue-tsc)
npm run preview      # Preview production build on port 4173

# Code Quality
npm run lint         # ESLint with auto-fix (cached)
npm run format       # Prettier formatting for src/
```

## Architecture

### Core Stack
- **Vue 3** with Composition API (`<script setup>`)
- **Pinia** for state management
- **Vue Router** with lazy-loaded routes
- **vue-i18n** with dynamic locale loading
- **GSAP + Lenis** for animations and smooth scrolling
- **Vite 7** with Terser minification

### Key Directories
```
src/
├── config/api.ts       # API endpoints and base URL config
├── services/api.ts     # ApiService singleton with auto token refresh
├── stores/             # Pinia stores (auth, data, app, adminData)
├── composables/        # Reusable logic (useToast, useCheckout, useScanner, etc.)
├── types/index.ts      # All TypeScript interfaces (Event, Artist, Order, etc.)
├── i18n/               # Translations with lazy loading per locale
├── views/              # Route components
│   ├── dashboard/      # Admin dashboard views
│   └── legal/          # Legal pages
├── components/
│   ├── ui/             # Base components (BaseButton, BaseCard, etc.)
│   ├── layout/         # AppHeader, AppFooter, GlobalBackground
│   ├── sections/       # Page sections (HeroSection, EventsSection)
│   └── common/         # Shared components (EventCard, DJCard)
└── layouts/            # DashboardLayout
```

### Data Flow
1. **API calls**: `src/services/api.ts` exports `api` singleton, uses `credentials: 'include'` for httpOnly cookie auth
2. **State**: `useDataStore` caches events/artists with 2-min TTL and deduplicates concurrent requests
3. **Auth**: `useAuthStore` manages JWT via httpOnly cookies, auto-refreshes on 401

### Authentication
- Backend sets httpOnly cookies (`access_token`, `refresh_token`)
- Frontend never stores tokens in localStorage
- `wasLoggedIn` localStorage flag enables token refresh on page reload
- Roles: `admin`, `super_admin`, `steward`, `user`

### i18n Pattern
```typescript
// Locales are lazy-loaded from src/i18n/locales/{fr,en,nl,sq}.ts
import { loadLocale } from '@/i18n'
await loadLocale('fr')

// Translation objects support *_translations fields on models
// e.g., event.title_translations?.fr
```

### Path Alias
`@/` maps to `src/` (configured in vite.config.ts and tsconfig)

## Environment Variables
```
VITE_API_BASE_URL  # Backend API URL (default: http://localhost:8000)
```

## Code Patterns

### API Requests with Abort Support
```typescript
const controller = new AbortController()
const events = await api.getEvents(controller.signal)
// Cancel on unmount: controller.abort()
```

### Vue Component Structure
All components use `<script setup lang="ts">` with Composition API. No Options API.

### Styling
- CSS variables defined in `src/assets/styles/variables.css`
- Base styles in `src/assets/styles/base.css`
- Mobile-first with `dvh` for viewport height (iOS address bar handling)
