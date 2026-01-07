import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@vueuse/head'

import App from './App.vue'
import router from './router'
import { i18n, loadLocale } from './i18n'
import { useAuthStore } from './stores/auth'
import type { LocaleCode } from './i18n/locales'

// 🚀 FontAwesome - Tree-shaking optimized (only ~53 icons instead of 2000+)
import { FontAwesomeIcon } from './plugins/fontawesome'

const app = createApp(App)

const pinia = createPinia()
const head = createHead()

// Register FontAwesomeIcon globally for gradual migration from <i class="fas"> to <font-awesome-icon>
app.component('font-awesome-icon', FontAwesomeIcon)

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

  // ✅ Définir l'attribut lang du HTML
  document.documentElement.lang = initialLocale

  app.mount('#app')
})
