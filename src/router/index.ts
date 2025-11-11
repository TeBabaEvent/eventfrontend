import { createRouter, createWebHistory } from 'vue-router'
import { watchEffect } from 'vue'
import HomeView from '@/views/HomeView.vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
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
  scrollBehavior(to, from, savedPosition) {
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
    
    // Show loading seulement pour les transitions de pages (si pas déjà démarré)
    if (from.name && to.name !== from.name && !appStore.isLoading) {
      appStore.startLoading('Chargement...')
    }
  
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
      // Attendre que isInitialized devienne true
      new Promise<void>((resolve) => {
        const stop = watchEffect(() => {
          if (authStore.isInitialized) {
            stop()
          resolve()
        }
    })
      }),
      // ✅ Timeout réduit à 3 secondes au lieu de 5
      new Promise<void>((resolve) => setTimeout(resolve, 3000))
    ])
  }
  
  // Vérifier l'authentification pour les routes protégées
    if (!authStore.isAuthenticated) {
      // Non authentifié -> rediriger vers login
      return next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
    
  // Vérifier les permissions admin
    if (!authStore.isAdmin && to.path.startsWith('/dashboard')) {
      // Non admin essaie d'accéder au dashboard -> home
      return next({ path: '/' })
    }
    
    // Authentifié et autorisé
  appStore.startLoading('Chargement...')
  next()
})

router.afterEach((to) => {
  const appStore = useAppStore()
  
  // ✅ Toujours stopper le loading après navigation
  // Les composants peuvent redémarrer leur propre loading si nécessaire
  requestAnimationFrame(() => {
    appStore.stopLoading()
  })
})

export default router
