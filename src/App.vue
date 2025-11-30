<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { useToast } from '@/composables/useToast'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useMobile } from '@/composables/useMobile'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import GlobalBackground from '@/components/layout/GlobalBackground.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import ToastNotification from '@/components/ui/ToastNotification.vue'

// Register ScrollTrigger globally
gsap.registerPlugin(ScrollTrigger)

const route = useRoute()
const authStore = useAuthStore()
const appStore = useAppStore()
const { setToastInstance } = useToast()

// Toast instance ref
const toastRef = ref()

// Lenis instance
let lenis: Lenis | null = null
let lenisTickerCallback: ((time: number) => void) | null = null

// Mobile detection + reduced motion preference (accessibility)
const { isMobile, prefersReducedMotion } = useMobile()

// Check if current route should hide layout
const hideLayout = computed(() => route.meta.hideLayout === true)

// Computed pour savoir si on doit afficher le contenu ou le spinner
const isLoading = computed(() => {
  return appStore.isLoading
})

const loadingMessage = computed(() => {
  if (!authStore.isInitialized) return 'Initialisation...'
  if (appStore.isLoading) return appStore.loadingMessage
  return ''
})

// Initialize Lenis smooth scroll (DESKTOP ONLY)
onMounted(() => {
  // Initialize toast instance
  if (toastRef.value) {
    setToastInstance(toastRef.value)
  }

  // SKIP Lenis on mobile OR if user prefers reduced motion
  if (isMobile.value || prefersReducedMotion.value) {
    return
  }

  // Initialize Lenis for smooth scrolling (desktop only)
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    touchMultiplier: 2
  })

  // 🚀 CRITICAL: Sync Lenis with GSAP ScrollTrigger
  // This ensures ScrollTrigger updates when Lenis scrolls
  lenis.on('scroll', ScrollTrigger.update)

  // Use GSAP ticker instead of custom rAF loop for better sync
  // Store reference for cleanup
  lenisTickerCallback = (time: number) => {
    lenis?.raf(time * 1000)
  }
  gsap.ticker.add(lenisTickerCallback)

  // Disable GSAP lag smoothing for smoother Lenis integration
  gsap.ticker.lagSmoothing(0)
})

// Cleanup Lenis on unmount
onUnmounted(() => {
  // Remove ticker callback first
  if (lenisTickerCallback) {
    gsap.ticker.remove(lenisTickerCallback)
    lenisTickerCallback = null
  }

  // Then cleanup Lenis
  if (lenis) {
    lenis.off('scroll', ScrollTrigger.update)
    lenis.destroy()
    lenis = null
  }
})
</script>

<template>
  <!-- Global Background - Always visible -->
  <GlobalBackground />

  <!-- Toast Notifications -->
  <ToastNotification ref="toastRef" />

  <!-- Loader global -->
  <LoadingSpinner
    v-if="isLoading"
    fullscreen
    :message="loadingMessage"
  />

  <!-- Contenu principal -->
  <div v-if="!isLoading" class="app">
    <!-- Header Navigation -->
    <AppHeader v-if="!hideLayout" />

    <!-- Main Content -->
    <main class="main">
      <router-view v-slot="{ Component }">
      <Suspense>
          <template #default>
            <Transition name="fade" mode="out-in">
            <component :is="Component" :key="route.path" />
          </Transition>
          </template>
          <template #fallback>
            <!-- Pendant le chargement du composant lazy-loaded -->
            <div class="suspense-fallback"></div>
          </template>
        </Suspense>
        </router-view>
    </main>

    <!-- Footer -->
    <AppFooter v-if="!hideLayout" />
  </div>
</template>

<style>
/* Import global styles */
@import '@/assets/styles/variables.css';
@import '@/assets/styles/base.css';

/* Note: Font Awesome import removed here as it's now loaded asynchronously in index.html */

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main {
  flex: 1;
  /* Pas de padding-top - le header est fixe et le Hero gère son propre padding */
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .main {
    padding-top: 0;
  }
}

/* Transitions */
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

/* Ensure smooth transitions by preventing layout shifts */
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

/* Suspense fallback - invisible placeholder during lazy load */
.suspense-fallback {
  min-height: 100vh;
  background: transparent;
}
</style>
