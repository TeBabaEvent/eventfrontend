import fr from './fr'
import en from './en'
import nl from './nl'
import sq from './sq'

export const messages = {
  fr,
  en,
  nl,
  sq
}

export const availableLocales = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'sq', name: 'Shqip', flag: '🇦🇱' }
] as const

export type LocaleCode = 'fr' | 'en' | 'nl' | 'sq'

