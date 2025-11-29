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

// ✅ Attendre que le router soit prêt AVANT de monter l'app
// Cela évite le flash de la route par défaut (/) lors d'un accès direct à une autre route
router.isReady().then(() => {
  app.mount('#app')

  // ✅ Initialiser l'auth en arrière-plan (non bloquant)
const authStore = useAuthStore()
  if (authStore.token) {
    authStore.checkAuth().catch(() => {
      // Token invalide, sera supprimé automatiquement
    })
  } else {
    authStore.setInitialized(true)
  }
})
