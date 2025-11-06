import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { i18n } from './i18n'
import { useAuthStore } from './stores/auth'

const app = createApp(App)

const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)

// Initialiser l'authentification au démarrage de manière asynchrone
const authStore = useAuthStore()

// Fonction d'initialisation
async function initApp() {
  // 1. Vérifier l'authentification
  if (authStore.token) {
    await authStore.checkAuth().catch(() => {
      // Si le token est invalide, le store va le supprimer automatiquement
    })
  } else {
    // Pas de token, marquer comme initialisé via l'action du store
    authStore.setInitialized(true)
  }
  
  // 2. Attendre que le router soit prêt
  await router.isReady()
  
  // 3. Monter l'app après toutes les vérifications
  app.mount('#app')
}

// Lancer l'initialisation
initApp()
