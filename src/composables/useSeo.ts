/**
 * Composable pour gérer les meta tags SEO dynamiques avec i18n
 *
 * Gère automatiquement:
 * - Title et description traduits
 * - Open Graph tags (Facebook, LinkedIn)
 * - Twitter Card tags
 * - og:locale et og:locale:alternate pour toutes les langues
 * - Mise à jour automatique lors du changement de langue
 */
import { computed } from 'vue'
import { useHead } from '@vueuse/head'
import { useI18n } from 'vue-i18n'
import type { LocaleCode } from '@/i18n/locales'

const SITE_URL = 'https://www.baba.events'
const OG_IMAGE = `${SITE_URL}/og-image.jpg` // Image optimisée pour les partages sociaux (1200x630px)

// Mapping des locales pour Open Graph
const localeMapping: Record<LocaleCode, string> = {
  fr: 'fr_FR',
  en: 'en_US',
  nl: 'nl_NL',
  sq: 'sq_AL'
}

// Toutes les locales alternatives (pour og:locale:alternate)
const alternateLocales: LocaleCode[] = ['fr', 'en', 'nl', 'sq']

export function useSeo() {
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

  // Appeler useHead() une seule fois au niveau top avec des computed
  useHead({
    title: computed(() => t('seo.title')),
    meta: computed(() => [
      // Description
      {
        name: 'description',
        content: t('seo.description')
      },
      // Keywords
      {
        name: 'keywords',
        content: t('seo.keywords')
      },

      // Open Graph (Facebook, LinkedIn)
      {
        property: 'og:title',
        content: t('seo.ogTitle')
      },
      {
        property: 'og:description',
        content: t('seo.ogDescription')
      },
      {
        property: 'og:type',
        content: 'website'
      },
      {
        property: 'og:url',
        content: SITE_URL
      },
      {
        property: 'og:image',
        content: OG_IMAGE
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

      // Twitter Card
      {
        name: 'twitter:card',
        content: 'summary_large_image'
      },
      {
        name: 'twitter:url',
        content: SITE_URL
      },
      {
        name: 'twitter:title',
        content: t('seo.twitterTitle')
      },
      {
        name: 'twitter:description',
        content: t('seo.twitterDescription')
      },
      {
        name: 'twitter:image',
        content: OG_IMAGE
      }
    ]),
    link: computed(() => [
      {
        rel: 'canonical',
        href: SITE_URL
      }
    ])
  })
}
