// Types pour vue-i18n
import 'vue-i18n'
import type fr from '@/i18n/locales/fr'

type MessageSchema = typeof fr

declare module 'vue-i18n' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefineLocaleMessage extends MessageSchema {}
}
