<script setup lang="ts">
import { onMounted, computed, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { useToast } from '@/composables/useToast'
import AOS from 'aos'
import 'aos/dist/aos.css'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import ToastNotification from '@/components/ui/ToastNotification.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()
const { setToastInstance } = useToast()

// Toast instance ref
const toastRef = ref()

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

// Transition hooks to prevent flash
const onBeforeLeave = () => {
  // Component is about to leave
}

const onAfterEnter = () => {
  // Component has entered, safe to show
  // Refresh AOS after component enters to ensure animations play
  setTimeout(() => {
    AOS.refresh()
  }, 100)
}

// Initialize AOS (Animate On Scroll) when component mounts
onMounted(() => {
  // Initialize toast instance
  if (toastRef.value) {
    setToastInstance(toastRef.value)
  }
  
  // Initialiser AOS - désactivé initialement si on est en train de charger
  AOS.init({
    duration: 900,
    easing: 'ease-out-quart', // Plus fluide que cubic
    once: false, // Allow animations to replay
    offset: 120,
    delay: 0,
    disable: isLoading.value, // Disable during initial loading
    startEvent: 'DOMContentLoaded',
    anchorPlacement: 'top-bottom'
  })
})

// Watch loading state and refresh AOS when loading finishes
watch(isLoading, (newValue, oldValue) => {
  if (oldValue === true && newValue === false) {
    // Loading just finished, enable and refresh AOS to trigger animations
    // ✅ Utiliser requestAnimationFrame pour éviter les délais artificiels
    requestAnimationFrame(() => {
      // Re-initialize to ensure it's enabled
      AOS.init({
        duration: 900,
        easing: 'ease-out-quart',
        once: true, // Ne jouer qu'une seule fois
        offset: 120,
        delay: 0,
        disable: false
      })
      // Hard refresh to recalculate and animate all elements
      AOS.refreshHard()
    })
  }
})
</script>

<template>
  <!-- Toast Notifications -->
  <ToastNotification ref="toastRef" />
  
  <!-- Loader global -->
  <LoadingSpinner 
    v-if="isLoading" 
    fullscreen 
    :message="loadingMessage"
  />
  
  <!-- Contenu principal -->
  <div v-if="!isLoading" id="app" class="app">
    <!-- Header Navigation -->
    <AppHeader v-if="!hideLayout" />
    
    <!-- Main Content -->
    <main class="main">
      <Suspense>
        <router-view v-slot="{ Component }">
          <Transition name="fade" mode="out-in" @before-leave="onBeforeLeave" @after-enter="onAfterEnter">
            <component :is="Component" :key="route.path" />
          </Transition>
        </router-view>
      </Suspense>
    </main>
    
    <!-- Footer -->
    <AppFooter v-if="!hideLayout" />
  </div>
</template>

<style>
/* Import global styles */
@import '@/assets/styles/variables.css';
@import '@/assets/styles/base.css';

/* Font Awesome CDN - will be replaced by proper import later */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

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
</style>
