/**
 * Composable pour gérer le changement de langue
 * 
 * @description
 * Permet de changer la langue de l'application et de la persister dans localStorage.
 * Utilise vue-i18n en arrière-plan.
 * 
 * @example
 * ```ts
 * import { useLanguage } from '@/composables/useLanguage'
 * 
 * const { currentLocale, changeLocale, availableLocales } = useLanguage()
 * 
 * // Changer la langue
 * changeLocale('en')
 * ```
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { availableLocales, type LocaleCode } from '@/i18n/locales'

export function useLanguage() {
  const { locale, t } = useI18n()

  const currentLocale = computed(() => locale.value as LocaleCode)

  const changeLocale = (newLocale: LocaleCode) => {
    locale.value = newLocale
    localStorage.setItem('locale', newLocale)
    
    // Mettre à jour l'attribut lang du HTML
    document.documentElement.lang = newLocale
  }

  const getCurrentLocaleName = computed(() => {
    return availableLocales.find(l => l.code === currentLocale.value)?.name || 'Français'
  })

  const getCurrentLocaleFlag = computed(() => {
    return availableLocales.find(l => l.code === currentLocale.value)?.flag || '🇫🇷'
  })

  return {
    locale: currentLocale,
    currentLocale,
    currentLocaleName: getCurrentLocaleName,
    currentLocaleFlag: getCurrentLocaleFlag,
    availableLocales,
    changeLocale,
    t
  }
}

