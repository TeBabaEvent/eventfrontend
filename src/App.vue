<script setup lang="ts">
import { onMounted, computed, watch, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { useToast } from '@/composables/useToast'
import AOS from 'aos'
// Utilisation d'un import dynamique pour le CSS AOS pour ne pas bloquer le rendu initial
// 'aos/dist/aos.css' est maintenant chargé via un import asynchrone ou différé si possible
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import ToastNotification from '@/components/ui/ToastNotification.vue'

const route = useRoute()
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
  // Utiliser requestAnimationFrame pour une meilleure synchronisation
  requestAnimationFrame(() => {
    AOS.refresh()
  })
}

// Initialize AOS (Animate On Scroll) when component mounts
onMounted(async () => {
  // Import CSS AOS dynamiquement
  import('aos/dist/aos.css')

  // Initialize toast instance
  if (toastRef.value) {
    setToastInstance(toastRef.value)
  }
  
  // Configuration AOS adaptée pour mobile et desktop
  const isMobile = window.innerWidth < 768
  
  // Initialiser AOS - désactivé initialement si on est en train de charger
  AOS.init({
    duration: 900,
    easing: 'ease-out-quart', // Plus fluide que cubic
    once: false, // Allow animations to replay
    offset: isMobile ? 0 : 50, // Offset réduit, surtout sur mobile
    delay: 0,
    disable: isLoading.value, // Disable during initial loading
    startEvent: 'DOMContentLoaded',
    anchorPlacement: isMobile ? 'top-center' : 'top-bottom', // Meilleure détection sur mobile
    // Optimisations de performance
    disableMutationObserver: false, // On garde true par défaut, mais on peut le désactiver si trop coûteux
    throttleDelay: 99, // Délai de throttle (défaut 99)
    debounceDelay: 50  // Délai de debounce (défaut 50)
  })
})

// Watch loading state and refresh AOS when loading finishes
watch(isLoading, (newValue, oldValue) => {
  if (oldValue === true && newValue === false) {
    // Loading just finished, enable and refresh AOS to trigger animations
    const isMobile = window.innerWidth < 768
    
    // ✅ Utiliser requestAnimationFrame pour éviter les délais artificiels
    requestAnimationFrame(() => {
      // Re-initialize to ensure it's enabled
      AOS.init({
        duration: 900,
        easing: 'ease-out-quart',
        once: true, // Ne jouer qu'une seule fois
        offset: isMobile ? 0 : 50, // Offset réduit, surtout sur mobile
        delay: 0,
        disable: false,
        anchorPlacement: isMobile ? 'top-center' : 'top-bottom'
      })
      
      // Petit délai pour laisser le temps au DOM de se stabiliser complètement
      setTimeout(() => {
        AOS.refreshHard()
      }, 100)
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
</style>
