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
          component: () => import('@/views/dashboard/DashboardView.vue')
        }
      ]
    }
  ],
  scrollBehavior(to, _from, savedPosition) {
    if (to.hash) {
      // Delay for lazy-loaded components to mount
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

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const appStore = useAppStore()

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (!requiresAuth) {
    // Non-blocking auth check for public routes
    if (!authStore.isInitialized) {
      authStore.checkAuth().catch(() => {})
    }

    if (to.path === '/login' && authStore.isAuthenticated) {
      return next({ path: '/dashboard' })
    }

    return next()
  }

  // Protected routes: wait for auth with timeout
  if (!authStore.isInitialized) {
    appStore.startLoading('Vérification...')

    await Promise.race([
      new Promise<void>((resolve) => {
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

  if (!authStore.isAuthenticated) {
    return next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }

  if (!authStore.isAdmin && to.path.startsWith('/dashboard')) {
    return next({ path: '/' })
  }

  appStore.startLoading('Chargement...')
  next()
})

router.afterEach(() => {
  const appStore = useAppStore()

  if (appStore.isLoading) {
    requestAnimationFrame(() => {
      appStore.stopLoading()
    })
  }
})

export default router
