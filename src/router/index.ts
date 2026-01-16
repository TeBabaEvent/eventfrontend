import { createRouter, createWebHistory } from 'vue-router'
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
      path: '/events/:slug',
      name: 'event-detail',
      component: () => import('@/views/EventDetail.vue')
    },
    {
      path: '/mentions-legales',
      name: 'mentions-legales',
      component: () => import('@/views/legal/MentionsLegales.vue')
    },
    {
      path: '/confidentialite',
      name: 'privacy-policy',
      component: () => import('@/views/legal/PrivacyPolicy.vue')
    },
    {
      path: '/cgv',
      name: 'sales-terms',
      component: () => import('@/views/legal/SalesTerms.vue')
    },
    {
      path: '/payment/complete',
      name: 'payment-complete',
      component: () => import('@/views/PaymentComplete.vue')
    },
    {
      path: '/scanner',
      name: 'scanner',
      component: () => import('@/views/ScannerView.vue'),
      meta: {
        requiresAuth: true,
        hideLayout: true
      }
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
          path: 'orders',
          name: 'dashboard-orders',
          component: () => import('@/views/dashboard/OrdersView.vue')
        },
        {
          path: 'users',
          name: 'dashboard-users',
          component: () => import('@/views/dashboard/UsersView.vue')
        },
        {
          path: 'settings',
          name: 'dashboard-settings',
          component: () => import('@/views/dashboard/DashboardView.vue')
        }
      ]
    }
  ],
  scrollBehavior(to, _from, savedPosition) {
    // NOTE: Use 'auto' instead of 'smooth' because Lenis handles smooth scrolling on desktop.
    // Using 'smooth' here would cause double-smoothing (browser + Lenis) and jank.
    if (to.hash) {
      // Delay for lazy-loaded components to mount
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            el: to.hash,
            behavior: 'auto',
            top: 80
          })
        }, 300)
      })
    }
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0, behavior: 'auto' }
  }
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const appStore = useAppStore()

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  // For public routes, no auth check needed
  if (!requiresAuth && to.path !== '/login') {
    return next()
  }

  // For /login page, check auth to redirect if already logged in
  if (to.path === '/login') {
    if (!authStore.isInitialized) {
      await authStore.checkAuth()
    }
    if (authStore.isAuthenticated) {
      // Rediriger les stewards vers le scanner, les autres vers le dashboard
      const redirectPath = authStore.user?.role === 'steward' ? '/scanner' : '/dashboard'
      return next({ path: redirectPath })
    }
    return next()
  }

  // Protected routes: check auth if not initialized
  if (!authStore.isInitialized) {
    appStore.startLoading('Vérification...')

    await Promise.race([
      authStore.checkAuth(),
      new Promise<void>((resolve) => setTimeout(resolve, 3000))
    ])
  }

  if (!authStore.isAuthenticated) {
    return next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }

  if (!authStore.isAdmin && to.path.startsWith('/dashboard')) {
    return next({ path: '/' })
  }

  // Dashboard routes use skeleton loaders, no global spinner needed
  // Only show global loading for non-dashboard protected routes
  if (!to.path.startsWith('/dashboard')) {
    appStore.startLoading('Chargement...')
  }

  next()
})

router.afterEach((to) => {
  const appStore = useAppStore()

  // Always stop loading after navigation (in case it was started elsewhere)
  if (appStore.isLoading) {
    // Dashboard routes handle their own loading state, stop immediately
    if (to.path.startsWith('/dashboard')) {
      appStore.stopLoading()
    } else {
      requestAnimationFrame(() => {
        appStore.stopLoading()
      })
    }
  }
})

export default router
