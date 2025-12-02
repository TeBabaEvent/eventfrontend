import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@vueuse/head'

import App from './App.vue'
import router from './router'
import { i18n, loadLocale } from './i18n'
import { useAuthStore } from './stores/auth'
import type { LocaleCode } from './i18n/locales'

const app = createApp(App)

const pinia = createPinia()
const head = createHead()

app.use(pinia)
app.use(router)
app.use(i18n)
app.use(head)

// ✅ Attendre que le router soit prêt AVANT de monter l'app
// Cela évite le flash de la route par défaut (/) lors d'un accès direct à une autre route
router.isReady().then(async () => {
  // ✅ Charger la locale initiale avant de monter l'app
  // Cela évite le flash de contenu non traduit
  const initialLocale = i18n.global.locale.value as LocaleCode
  await loadLocale(initialLocale)

  // ✅ Initialiser l'auth AVANT de monter l'app
  // Évite le flash de contenu non autorisé et les race conditions
  const authStore = useAuthStore()
  if (authStore.token) {
    try {
      await authStore.checkAuth()
    } catch (error) {
      // Token invalide, sera supprimé automatiquement par le store
      // Continue with app mount
    }
  } else {
    authStore.setInitialized(true)
  }

  // ✅ Définir l'attribut lang du HTML
  document.documentElement.lang = initialLocale

  app.mount('#app')
})
