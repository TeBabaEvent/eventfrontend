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
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import GlobalBackground from '@/components/layout/GlobalBackground.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import ToastNotification from '@/components/ui/ToastNotification.vue'

const route = useRoute()
const authStore = useAuthStore()
const appStore = useAppStore()
const { setToastInstance } = useToast()
const { initialize: initAnimations, isEnabled: animationsEnabled } = useAnimations()
const { startMonitoring } = usePerformance()

// Initialize SEO with dynamic meta tags
useSeo()

const toastRef = ref()
let lenis: Lenis | null = null
let rafId: number | null = null

const hideLayout = computed(() => route.meta.hideLayout === true)
const isLoading = computed(() => appStore.isLoading)

const loadingMessage = computed(() => {
  if (!authStore.isInitialized) return 'Initialisation...'
  if (appStore.isLoading) return appStore.loadingMessage
  return ''
})

onMounted(async () => {
  if (toastRef.value) {
    setToastInstance(toastRef.value)
  }

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

  // Use native RAF instead of GSAP ticker for better decoupling
  function animate(time: number) {
    lenis?.raf(time)
    rafId = requestAnimationFrame(animate)
  }
  rafId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }

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
            <Transition name="fade" mode="out-in">
            <component :is="Component" :key="route.path" />
          </Transition>
          </template>
          <template #fallback>
            <div class="suspense-fallback"></div>
          </template>
        </Suspense>
        </router-view>
    </main>

    <AppFooter v-if="!hideLayout" />
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
