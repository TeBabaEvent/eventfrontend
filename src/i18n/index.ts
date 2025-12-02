import { createI18n } from 'vue-i18n'
import { availableLocales, type LocaleCode } from './locales'
import { logger } from '@/services/logger'

// Extract locale codes from availableLocales (single source of truth)
const supportedLocaleCodes = availableLocales.map(l => l.code)

// Détecte la langue du navigateur
function getBrowserLocale(): LocaleCode {
  const browserLang = navigator.language.split('-')[0]

  return supportedLocaleCodes.includes(browserLang as LocaleCode)
    ? (browserLang as LocaleCode)
    : 'fr' // Langue par défaut
}

// Récupère la langue sauvegardée ou celle du navigateur
function getInitialLocale(): LocaleCode {
  try {
    const savedLocale = localStorage.getItem('locale')
    if (savedLocale && supportedLocaleCodes.includes(savedLocale as LocaleCode)) {
      return savedLocale as LocaleCode
    }
  } catch (error) {
    // localStorage not available (private browsing, etc.)
    // Fall through to browser locale
  }
  return getBrowserLocale()
}

// Cache des locales déjà chargées
const loadedLocales = new Set<LocaleCode>()

export const i18n = createI18n({
  legacy: false, // Utilise Composition API
  locale: getInitialLocale(),
  fallbackLocale: 'fr',
  messages: {}, // Messages chargés dynamiquement
  globalInjection: true,
  missingWarn: false,
  fallbackWarn: false
})

/**
 * Charge dynamiquement les messages d'une locale
 * Utilise un cache pour éviter de recharger les locales déjà importées
 *
 * @param locale - Code de la locale à charger (fr, en, nl, sq)
 * @returns Promise qui se résout quand la locale est chargée
 */
export async function loadLocale(locale: LocaleCode): Promise<void> {
  // Si la locale est déjà chargée, pas besoin de la recharger
  if (loadedLocales.has(locale)) {
    return
  }

  try {
    // Import dynamique de la locale
    const messages = await import(`./locales/${locale}.ts`)

    // Ajoute les messages à l'instance i18n
    i18n.global.setLocaleMessage(locale, messages.default)

    // Marque la locale comme chargée
    loadedLocales.add(locale)
  } catch (error) {
    logger.error(`Failed to load locale ${locale}:`, error)
    throw error
  }
}

// Type-safe pour les clés de traduction - nécessite le chargement de fr
export type MessageSchema = Record<string, any>

