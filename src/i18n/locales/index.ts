// Locales are now loaded lazily via dynamic imports
// See src/i18n/index.ts loadLocale() function

export const availableLocales = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'sq', name: 'Shqip', flag: '🇦🇱' }
] as const

export type LocaleCode = 'fr' | 'en' | 'nl' | 'sq'

