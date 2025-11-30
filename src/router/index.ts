import { createRouter, createWebHistory } from 'vue-router'
import { watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/events/:id',
      name: 'event-detail',
      component: () => import('@/views/EventDetail.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: {
        hideLayout: true
      }
    },
    {
      path: '/dashboard',
      component: () => import('@/layouts/DashboardLayout.vue'),
      meta: {
        requiresAuth: true,
        hideLayout: true
      },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/dashboard/DashboardView.vue')
        },
        {
          path: 'events',
          name: 'dashboard-events',
          component: () => import('@/views/dashboard/EventsView.vue')
        },
        {
          path: 'artists',
          name: 'dashboard-artists',
          component: () => import('@/views/dashboard/ArtistsView.vue')
        },
        {
          path: 'packs',
          name: 'dashboard-packs',
          component: () => import('@/views/dashboard/PacksView.vue')
        },
        {
          path: 'settings',
          name: 'dashboard-settings',
          // Temporairement redirigé vers le dashboard principal
          // Une page de paramètres dédiée peut être créée ultérieurement
          component: () => import('@/views/dashboard/DashboardView.vue')
        }
      ]
    }
  ],
  scrollBehavior(to, _from, savedPosition) {
    if (to.hash) {
      // Si on vient d'une autre route, ajouter un délai pour laisser le temps au DOM de se charger
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            el: to.hash,
            behavior: 'smooth',
            top: 80
          })
        }, 300)
      })
    }
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0, behavior: 'smooth' }
  }
})

// Navigation guard pour protéger les routes
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const appStore = useAppStore()

  // Vérifier si la route nécessite l'authentification
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  // ✅ OPTIMISATION: Ne pas bloquer les routes publiques
  if (!requiresAuth) {
    // Lancer checkAuth en background pour les routes publiques (non bloquant)
    if (!authStore.isInitialized) {
      authStore.checkAuth().catch(() => {
        // Ignorer les erreurs pour les routes publiques
      })
    }

    // ❌ NE PAS déclencher startLoading() pour les routes publiques
    // Chaque page gère son propre état de loading (EventDetail a son LoadingSpinner)
    // Cela évite de démonter le contenu et de casser les contextes GSAP

    // Redirection si déjà authentifié et va vers login
    if (to.path === '/login' && authStore.isAuthenticated) {
      return next({ path: '/dashboard' })
    }

    // ✅ Laisser passer immédiatement sans attendre
    return next()
  }

  // ✅ Routes protégées - attendre l'auth (mais avec timeout réduit)
  if (!authStore.isInitialized) {
    appStore.startLoading('Vérification...')

    await Promise.race([
      new Promise<void>((resolve) => {
        // Utiliser watch au lieu de watchEffect pour un contrôle plus précis
        const unwatch = watch(
          () => authStore.isInitialized,
          (isInit) => {
            if (isInit) {
              unwatch()
              resolve()
            }
          },
          { immediate: true }
        )
      }),
      new Promise<void>((resolve) => setTimeout(resolve, 3000))
    ])
  }

  // Vérifier l'authentification pour les routes protégées
  if (!authStore.isAuthenticated) {
    return next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }

  // Vérifier les permissions admin
  if (!authStore.isAdmin && to.path.startsWith('/dashboard')) {
    return next({ path: '/' })
  }

  // Authentifié et autorisé
  appStore.startLoading('Chargement...')
  next()
})

router.afterEach((to) => {
  const appStore = useAppStore()

  // Stopper le loading seulement pour les routes protégées (dashboard)
  // Les routes publiques ne déclenchent plus de loading global
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  if (requiresAuth && appStore.isLoading) {
    requestAnimationFrame(() => {
      appStore.stopLoading()
    })
  }
})

export default router
