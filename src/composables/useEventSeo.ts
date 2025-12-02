/**
 * Composable pour gérer les meta tags SEO dynamiques des événements avec i18n
 *
 * Gère automatiquement:
 * - Title et description spécifiques à l'événement
 * - Open Graph avec og:type="event"
 * - Twitter Cards
 * - og:locale et og:locale:alternate pour toutes les langues
 * - Meta tags spécifiques aux événements (date, lieu)
 * - Mise à jour automatique lors du changement de langue
 */
import { computed, type Ref } from 'vue'
import { useHead } from '@vueuse/head'
import { useI18n } from 'vue-i18n'
import type { Event } from '@/types'
import type { LocaleCode } from '@/i18n/locales'

const SITE_URL = 'https://www.baba.events'

// Mapping des locales pour Open Graph
const localeMapping: Record<LocaleCode, string> = {
  fr: 'fr_FR',
  en: 'en_US',
  nl: 'nl_NL',
  sq: 'sq_AL'
}

// Toutes les locales alternatives
const alternateLocales: LocaleCode[] = ['fr', 'en', 'nl', 'sq']

/**
 * Formatte une date pour les meta tags
 */
function formatDateForMeta(dateStr: string, locale: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''

  // Pour l'albanais, utiliser un formatage manuel car Intl ne supporte pas bien sq
  if (locale === 'sq') {
    const monthNames = ['Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor', 'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor']
    const dayNames = ['e diel', 'e hënë', 'e martë', 'e mërkurë', 'e enjte', 'e premte', 'e shtunë']

    const dayName = dayNames[date.getDay()]
    const day = date.getDate()
    const monthName = monthNames[date.getMonth()]
    const year = date.getFullYear()

    return `${dayName}, ${day} ${monthName} ${year}`
  }

  return date.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

/**
 * Formatte une date en ISO 8601 pour og:event:start_time
 */
function formatDateISO(dateStr: string, time?: string): string {
  if (!dateStr) return ''

  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return ''

    // Si on a une heure, on l'ajoute
    if (time) {
      const [hours, minutes] = time.split(':')
      if (hours && minutes) {
        date.setHours(parseInt(hours), parseInt(minutes))
      }
    }

    return date.toISOString()
  } catch {
    return ''
  }
}

/**
 * Tronque le texte pour les descriptions OG (recommandé: 150-300 caractères)
 */
function truncateDescription(text: string, maxLength: number = 200): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

export function useEventSeo(event: Ref<Event | null>) {
  const { t, locale } = useI18n()

  // Computed values qui se mettent à jour automatiquement
  const currentLocale = computed(() => locale.value as LocaleCode)
  const ogLocale = computed(() => localeMapping[currentLocale.value])

  // Locales alternatives (toutes sauf la courante)
  const alternates = computed(() =>
    alternateLocales
      .filter(l => l !== currentLocale.value)
      .map(l => localeMapping[l])
  )

  // Préparer les données de l'événement (computed)
  const eventTitle = computed(() => event.value?.title || '')
  const eventDate = computed(() =>
    event.value?.date ? formatDateForMeta(event.value.date, currentLocale.value) : ''
  )
  const eventDateISO = computed(() =>
    event.value?.date ? formatDateISO(event.value.date, event.value.time) : ''
  )
  const eventLocation = computed(() => {
    if (!event.value) return ''
    return event.value.location
      ? `${event.value.location}, ${event.value.city || ''}`
      : event.value.city || ''
  })
  const eventImage = computed(() =>
    event.value?.image_url || event.value?.image || `${SITE_URL}/og-image.jpg`
  )

  // Description enrichie pour le partage
  const eventDescription = computed(() => {
    if (!event.value) return t('seo.ogDescription')
    return event.value.description
      ? truncateDescription(event.value.description)
      : t('seo.ogDescription')
  })

  // Title optimisé pour le partage
  const shareTitle = computed(() => {
    if (!event.value) return 'Baba Event'
    return `${eventTitle.value} | Baba Event`
  })

  // Description enrichie avec date et lieu
  const shareDescription = computed(() => {
    if (!event.value) return t('seo.ogDescription')
    return `${eventDate.value} • ${eventLocation.value} • ${eventDescription.value}`
  })

  // URL de la page événement
  const eventUrl = computed(() =>
    event.value ? `${SITE_URL}/events/${event.value.id}` : SITE_URL
  )

  // Keywords
  const keywords = computed(() => {
    if (!event.value) return t('seo.keywords')
    return `${eventTitle.value}, ${event.value.category || 'concert'}, ${event.value.city || ''}, ${t('seo.keywords')}`
  })

  // Appeler useHead() une seule fois au niveau top avec des computed
  useHead({
    title: shareTitle,
    meta: computed(() => [
      // Description
      {
        name: 'description',
        content: truncateDescription(shareDescription.value, 160)
      },
      // Keywords
      {
        name: 'keywords',
        content: keywords.value
      },

      // Open Graph (Facebook, LinkedIn, WhatsApp)
      {
        property: 'og:title',
        content: eventTitle.value
      },
      {
        property: 'og:description',
        content: shareDescription.value
      },
      {
        property: 'og:type',
        content: 'event'
      },
      {
        property: 'og:url',
        content: eventUrl.value
      },
      {
        property: 'og:image',
        content: eventImage.value
      },
      {
        property: 'og:image:width',
        content: '1200'
      },
      {
        property: 'og:image:height',
        content: '630'
      },
      {
        property: 'og:locale',
        content: ogLocale.value
      },
      // Locales alternatives pour SEO multilingue
      ...alternates.value.map(alt => ({
        property: 'og:locale:alternate',
        content: alt
      })),
      {
        property: 'og:site_name',
        content: 'Baba Event'
      },

      // Meta tags spécifiques aux événements (Open Graph Event)
      ...(eventDateISO.value ? [{
        property: 'og:event:start_time',
        content: eventDateISO.value
      }] : []),
      ...(eventLocation.value ? [{
        property: 'og:event:location',
        content: eventLocation.value
      }] : []),

      // Twitter Card
      {
        name: 'twitter:card',
        content: 'summary_large_image'
      },
      {
        name: 'twitter:url',
        content: eventUrl.value
      },
      {
        name: 'twitter:title',
        content: eventTitle.value
      },
      {
        name: 'twitter:description',
        content: truncateDescription(shareDescription.value, 200)
      },
      {
        name: 'twitter:image',
        content: eventImage.value
      }
    ]),
    link: computed(() => [
      {
        rel: 'canonical',
        href: eventUrl.value
      }
    ])
  })
}
