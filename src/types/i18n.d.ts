// Types pour vue-i18n
import 'vue-i18n'
import type fr from '@/i18n/locales/fr'

type MessageSchema = typeof fr

declare module 'vue-i18n' {
  export interface DefineLocaleMessage extends MessageSchema {}
}

