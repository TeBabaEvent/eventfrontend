import { createI18n } from 'vue-i18n'
import { messages, type LocaleCode } from './locales'

// Détecte la langue du navigateur
function getBrowserLocale(): LocaleCode {
  const browserLang = navigator.language.split('-')[0]
  const supportedLocales: LocaleCode[] = ['fr', 'en', 'nl', 'sq']
  
  return supportedLocales.includes(browserLang as LocaleCode) 
    ? (browserLang as LocaleCode) 
    : 'fr' // Langue par défaut
}

// Récupère la langue sauvegardée ou celle du navigateur
function getInitialLocale(): LocaleCode {
  const savedLocale = localStorage.getItem('locale')
  if (savedLocale && ['fr', 'en', 'nl', 'sq'].includes(savedLocale)) {
    return savedLocale as LocaleCode
  }
  return getBrowserLocale()
}

export const i18n = createI18n({
  legacy: false, // Utilise Composition API
  locale: getInitialLocale(),
  fallbackLocale: 'fr',
  messages,
  globalInjection: true,
  missingWarn: false,
  fallbackWarn: false
})

// Type-safe pour les clés de traduction
export type MessageSchema = typeof messages.fr

