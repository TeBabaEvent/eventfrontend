<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { useToast } from '@/composables/useToast'
import { useAnimations } from '@/composables/useAnimations'
import { usePerformance } from '@/composables/usePerformance'
import { useSeo } from '@/composables/useSeo'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css' // Recommended CSS for better compatibility
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import GlobalBackground from '@/components/layout/GlobalBackground.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import ToastNotification from '@/components/ui/ToastNotification.vue'

const route = useRoute()
const authStore = useAuthStore()
const appStore = useAppStore()
const { setToastInstance } = useToast()
const {
  initialize: initAnimations,
  isEnabled: animationsEnabled,
  gsap: gsapRef,
  ScrollTrigger: scrollTriggerRef
} = useAnimations()
const { startMonitoring } = usePerformance()

// Initialize SEO with dynamic meta tags
useSeo()

const toastRef = ref()
let lenis: Lenis | null = null
let lenisTickerCallback: ((time: number) => void) | null = null

// iOS viewport height fix - prevents jarring repositioning when URL bar changes
const setViewportHeight = () => {
  // Only apply on mobile
  if (window.innerWidth > 768) return

  // Set a CSS custom property to the actual viewport height
  const vh = window.innerHeight * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)
}

// Debounced resize handler for viewport
let resizeTimeout: ReturnType<typeof setTimeout> | null = null
const handleViewportResize = () => {
  if (resizeTimeout) clearTimeout(resizeTimeout)
  // Debounce to prevent rapid updates during scroll
  resizeTimeout = setTimeout(setViewportHeight, 150)
}

const hideLayout = computed(() => route.meta.hideLayout === true)
const isLoading = computed(() => appStore.isLoading)
const isDashboardRoute = computed(() => route.path.startsWith('/dashboard'))
const isLoginRoute = computed(() => route.path === '/login')

// Skip transitions for routes that hide layout (login, dashboard) to avoid background flash
const skipTransition = computed(() => hideLayout.value || isDashboardRoute.value)

// Use stable keys for dashboard and login to prevent re-mounting
const getRouteKey = computed(() => {
  if (isDashboardRoute.value) return 'dashboard'
  if (isLoginRoute.value) return 'login'
  return route.path
})

const loadingMessage = computed(() => {
  if (!authStore.isInitialized) return 'Initialisation...'
  if (appStore.isLoading) return appStore.loadingMessage
  return ''
})

onMounted(async () => {
  if (toastRef.value) {
    setToastInstance(toastRef.value)
  }

  // Set initial viewport height for iOS
  setViewportHeight()
  window.addEventListener('resize', handleViewportResize, { passive: true })
  // Also update on orientation change
  window.addEventListener('orientationchange', () => {
    setTimeout(setViewportHeight, 100)
  })

  startMonitoring()

  await initAnimations()

  if (!animationsEnabled.value) {
    return
  }

  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    touchMultiplier: 2
  })

  // ═══════════════════════════════════════════════════════════════
  // LENIS ↔ GSAP SYNCHRONIZATION (Best Practice)
  // Using gsap.ticker instead of manual RAF for perfect sync
  // ═══════════════════════════════════════════════════════════════

  const gsap = gsapRef.value
  const ScrollTrigger = scrollTriggerRef.value

  if (gsap && ScrollTrigger) {
    // Sync Lenis scroll position with ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)

    // Use GSAP ticker for Lenis RAF (time is in seconds, Lenis expects ms)
    lenisTickerCallback = (time: number) => {
      lenis?.raf(time * 1000)
    }
    gsap.ticker.add(lenisTickerCallback)

    // Disable GSAP lag smoothing for smoother scroll-linked animations
    gsap.ticker.lagSmoothing(0)
  } else {
    // Fallback: manual RAF if GSAP not available (shouldn't happen on desktop)
    const animate = (time: number) => {
      lenis?.raf(time)
      requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }
})

onUnmounted(() => {
  // Clean up viewport resize handler
  window.removeEventListener('resize', handleViewportResize)
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
    resizeTimeout = null
  }

  // Clean up GSAP ticker callback
  if (lenisTickerCallback && gsapRef.value) {
    gsapRef.value.ticker.remove(lenisTickerCallback)
    lenisTickerCallback = null
  }

  // Destroy Lenis instance
  if (lenis) {
    lenis.destroy()
    lenis = null
  }
})
</script>

<template>
  <GlobalBackground />
  <ToastNotification ref="toastRef" />

  <LoadingSpinner
    v-if="isLoading"
    fullscreen
    :message="loadingMessage"
  />

  <div v-if="!isLoading" class="app">
    <AppHeader v-if="!hideLayout" />

    <main class="main">
      <router-view v-slot="{ Component }">
      <Suspense>
          <template #default>
            <!-- Skip transitions for dashboard and login to avoid background flash -->
            <Transition :name="skipTransition ? '' : 'fade'" mode="out-in">
              <component
                :is="Component"
                :key="getRouteKey"
              />
            </Transition>
          </template>
          <template #fallback>
            <div class="suspense-fallback"></div>
          </template>
        </Suspense>
        </router-view>
    </main>

    <AppFooter v-if="!hideLayout" :key="`footer-${route.path}`" />
  </div>
</template>

<style>
@import '@/assets/styles/variables.css';
@import '@/assets/styles/base.css';

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main {
  flex: 1;
}

@media (max-width: 768px) {
  .main {
    padding-top: 0;
  }
}


.fade-enter-active {
  transition: opacity 0.25s ease-in;
}

.fade-leave-active {
  transition: opacity 0.2s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active {
  transition-delay: 0.05s;
}

.fade-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: -1;
  pointer-events: none;
}

.suspense-fallback {
  min-height: 100vh;
  background: transparent;
}
</style>
