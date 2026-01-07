# Baba Event - Frontend

Application web moderne pour la gestion et la promotion d'événements (concerts, festivals, mariages, soirées VIP). Interface utilisateur premium avec animations fluides et design responsive.

## 🚀 Technologies

- **Framework**: Vue 3 (Composition API) + TypeScript
- **Build Tool**: Vite 7
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **Animations**: GSAP 3 + ScrollTrigger (lazy-loaded, desktop only)
- **Smooth Scroll**: Lenis (desktop only)
- **i18n**: Vue I18n (Français, Anglais, Néerlandais, Albanais)
- **Styling**: CSS moderne avec variables CSS
- **Optimizations**: Image optimization, code splitting, terser minification

## ✨ Fonctionnalités

### Public
- 🎉 **Page d'accueil** avec hero animé, liste d'événements, équipe d'artistes
- 📅 **Détail d'événement** avec countdown, galerie, réservation WhatsApp
- 🌍 **Multilingue** (fr, en, nl, sq) avec détection automatique du navigateur
- 🎨 **Animations premium** (GSAP) sur desktop uniquement (>1024px)
- 📱 **Responsive** avec optimisations mobile (pas d'animations lourdes)
- ⚡ **Performance** - Lazy loading, code splitting, image optimization

### Admin Dashboard
- 🔐 **Authentification** JWT avec protection des routes
- 📊 **Gestion des événements** - CRUD complet
- 🎤 **Gestion des artistes** - Upload d'images, réseaux sociaux
- 💎 **Gestion des packs** - Tarifs et formules (Standard, Premium, VIP)
- 🌐 **Traductions** - Gestion multilingue des contenus

## 📋 Prérequis

- **Node.js** >= 20.0.0
- **npm** ou **yarn**

## 🛠️ Installation

1. **Cloner le repository**
```bash
git clone <repository-url>
cd eventfrontend
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de l'environnement**

Créer un fichier `.env` à la racine :
```bash
# Windows
copy env.example .env

# Linux/Mac
cp env.example .env
```

Éditer le fichier `.env` :
```env
VITE_API_BASE_URL=http://localhost:8000
NODE_ENV=development
```

> **Note**: Si `VITE_API_BASE_URL` n'est pas défini, l'application utilise `http://localhost:8000` par défaut.

## 🚦 Commandes

```bash
# Développement avec hot-reload (port 5173)
npm run dev

# Build de production avec type-checking
npm run build

# Build sans type-checking (plus rapide)
npm run build-only

# Preview du build de production
npm run preview

# Type-checking uniquement
npm run type-check

# Linting avec auto-fix
npm run lint

# Formatage du code
npm run format

# Serveur de production (après build)
npm run start
```

## 📁 Structure du Projet

```
src/
├── assets/           # Images, fonts, styles globaux
├── components/       # Composants Vue
│   ├── common/       # Composants réutilisables (EventCard, DJCard)
│   ├── layout/       # Layout (AppHeader, AppFooter, GlobalBackground)
│   ├── sections/     # Sections homepage (Hero, Events, Team)
│   └── ui/           # Composants UI (BaseButton, LoadingSpinner, etc.)
├── composables/      # Composition functions
│   ├── useAnimations.ts    # Gestion centralisée GSAP
│   ├── useToast.ts         # Notifications
│   ├── useMobile.ts        # Détection mobile
│   └── useLanguage.ts      # i18n helpers
├── config/           # Configuration (API endpoints)
├── constants/        # Constantes (navigation, contacts, etc.)
├── i18n/             # Traductions (fr, en, nl, sq)
├── layouts/          # Layouts (DashboardLayout)
├── router/           # Configuration Vue Router
├── services/         # Services (API, logger, mock data)
├── stores/           # Stores Pinia (auth, app, data)
├── types/            # TypeScript types
├── utils/            # Utilitaires (formatters, helpers, image)
└── views/            # Pages (HomeView, EventDetail, Dashboard/*)
```

## 🎨 Architecture des Animations

### Système d'Animations Conditionnelles

Les animations GSAP sont **lazy-loaded uniquement sur desktop** (>1024px) pour optimiser les performances mobile.

**Composable `useAnimations`** (`src/composables/useAnimations.ts`):
```typescript
const { initialize, createContext, isReady, isEnabled } = useAnimations()

onMounted(async () => {
  await initialize() // Charge GSAP si desktop

  if (isEnabled.value) {
    const animCtx = createContext(elementRef.value)
    animCtx.context?.add(() => {
      animCtx.gsap!.to('.element', { opacity: 1 })
    })
  }
})

onUnmounted(() => {
  animCtx?.cleanup() // IMPORTANT: évite les memory leaks
})
```

**Comportement**:
- **Desktop (>1024px)**: GSAP chargé, animations activées
- **Mobile/Tablet (≤1024px)**: GSAP non chargé, éléments visibles immédiatement
- **Reduced Motion**: Animations désactivées même sur desktop

## 🌐 Internationalisation

L'application supporte 4 langues avec détection automatique:

- 🇫🇷 Français (défaut)
- 🇬🇧 Anglais
- 🇳🇱 Néerlandais
- 🇦🇱 Albanais

**Configuration**: `src/i18n/index.ts`

La langue est:
1. Récupérée depuis localStorage (`locale`)
2. Sinon détectée depuis le navigateur
3. Sinon par défaut: français

## 🔐 Authentification

**Store**: `src/stores/auth.ts`

- **JWT** stocké dans cookies httpOnly (sécurisé contre XSS)
- **Refresh token** automatique via endpoint `/api/auth/refresh`
- **Protection des routes** via navigation guards (`src/router/index.ts`)
- **Vérification automatique** au chargement de l'app
- **Routes admin** (`/dashboard/*`) réservées aux admins

## ⚡ Optimisations de Production

### Build Configuration (`vite.config.ts`)

**Code Splitting**:
- `vue-vendor`: Vue core (vue, vue-router, pinia)
- `i18n`: Vue I18n
- `animations`: GSAP (lazy-loaded)

**Minification**:
- Terser avec suppression des `console.log/debug/info`
- Compression aggressive
- Source maps désactivées

**Images**:
- Optimisation automatique (PNG, JPEG, WebP, SVG)
- Compression avec Sharp

**Performance**:
- Lazy routes (code splitting par page)
- GSAP lazy-loaded (desktop uniquement)
- Lenis smooth scroll (desktop uniquement)

## 🎯 Bonnes Pratiques

### Développement
1. **TypeScript strict** activé
2. **ESLint + Prettier** pour le formatage
3. **Composition API** pour tous les composants
4. **Props typées** avec `defineProps<Type>()`
5. **Nettoyage des animations** dans `onUnmounted()`

### Animations
1. **Toujours utiliser `useAnimations()`** au lieu d'importer GSAP directement
2. **Cleanup obligatoire** pour éviter les memory leaks
3. **Vérifier `isEnabled.value`** avant d'animer
4. **CSS media queries** alignées avec le breakpoint JS (1024px)

### API
1. **Fallback automatique** vers mock data si API indisponible
2. **Logger** pour le debugging (désactivé en production)
3. **Type safety** avec interfaces TypeScript

## 🌍 Variables d'Environnement

```env
# API Backend
VITE_API_BASE_URL=http://localhost:8000

# Environment (development | production)
NODE_ENV=development
```

## 📦 Build de Production

```bash
# Build complet avec type-checking
npm run build

# Les fichiers compilés sont dans /dist
# Servir avec un serveur statique
npm run start
```

## 🔧 IDE Setup Recommandé

**VS Code** avec extensions:
- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (Vue Language Features)
- [TypeScript Vue Plugin](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)
- ESLint
- Prettier

> **Important**: Désactiver Vetur si installé (conflit avec Volar)

**Browser DevTools**:
- [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- Activer "Custom Object Formatters" dans les DevTools

## 📄 Documentation Additionnelle

Pour les développeurs utilisant **Claude Code**, consultez `CLAUDE.md` pour:
- Architecture détaillée du système d'animations
- Patterns de développement
- Commandes communes
- Contraintes techniques

## 🐛 Debugging

**Logger Service** (`src/services/logger.ts`):
- Logs visibles uniquement en développement (`import.meta.env.DEV`)
- Désactivés automatiquement en production
- Utiliser `logger.error()`, `logger.warn()` au lieu de `console.log()`

## 📝 Licence

Privé - Tous droits réservés

---

**Développé avec** ❤️ **et** Vue 3 + TypeScript
