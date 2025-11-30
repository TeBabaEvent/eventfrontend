<template>
  <div class="event-detail-page">
    <!-- Loading Skeleton (accès direct via lien partagé) -->
    <Transition name="skeleton-fade" mode="out-in">
      <section v-if="!isInitialized || isLoading" key="skeleton" class="event-hero event-hero--skeleton">
        <div class="event-hero__background event-hero__background--skeleton"></div>
        <div class="event-hero__overlay"></div>
        <div class="container">
          <div class="event-hero__content">
            <!-- Skeleton Breadcrumb -->
            <div class="skeleton-breadcrumb">
              <div class="skeleton-line skeleton-line--sm"></div>
            </div>
            <!-- Skeleton Title -->
            <div class="skeleton-title"></div>
            <div class="skeleton-title skeleton-title--short"></div>
            <!-- Skeleton Meta -->
            <div class="skeleton-meta">
              <div class="skeleton-meta-item"></div>
              <div class="skeleton-meta-item"></div>
              <div class="skeleton-meta-item"></div>
            </div>
            <!-- Skeleton CTA -->
            <div class="skeleton-cta"></div>
          </div>
        </div>
      </section>

      <!-- Event Content -->
      <div v-else-if="isInitialized && event && !isLoading" key="content" class="event-content-wrapper">
      <!-- Event Hero -->
      <section ref="heroRef" class="event-hero" id="event-hero">
        <!-- Background Image with Parallax -->
        <div class="event-hero__background">
          <img
            ref="heroImageRef"
            :src="optimizedHeroImage"
            :alt="event?.title"
            class="event-hero__image"
            width="1920"
            height="1080"
            fetchpriority="high"
            loading="eager"
            decoding="async"
          >
          <!-- Multi-layer overlay for depth -->
          <div class="event-hero__overlay"></div>
          <div class="event-hero__gradient"></div>
        </div>

        <div class="container">
          <div ref="heroContentRef" class="event-hero__content">
            <!-- Breadcrumb - Glass Style -->
            <nav ref="breadcrumbRef" class="breadcrumb hero-animate">
              <router-link to="/" class="breadcrumb__link">
                <i class="fas fa-home"></i>
                <span>{{ t('nav.home') }}</span>
              </router-link>
              <span class="breadcrumb__separator">
                <i class="fas fa-chevron-right"></i>
              </span>
              <router-link to="/#events" class="breadcrumb__link">
                <i class="fas fa-calendar"></i>
                <span>{{ t('nav.events') }}</span>
              </router-link>
              <span class="breadcrumb__separator">
                <i class="fas fa-chevron-right"></i>
              </span>
              <span class="breadcrumb__current">{{ displayTitle }}</span>
            </nav>

            <!-- Event Badge - Glass Premium Style -->
            <div v-if="event?.featured" ref="badgeRef" class="event-hero__badge hero-animate">
              <span class="event-hero__badge-icon">
                <i class="fas fa-fire"></i>
              </span>
              <span class="event-hero__badge-text">{{ t('eventDetail.badge.popular') }}</span>
            </div>

            <!-- Event Title -->
            <h1 ref="titleRef" class="event-hero__title hero-animate">
              {{ displayTitle }}
            </h1>

            <!-- Countdown -->
            <div ref="countdownRef" class="hero-animate">
              <EventCountdown
                v-if="event?.date"
                :eventDate="event.date"
              />
            </div>

            <!-- Event Meta - Glass Cards -->
            <div ref="metaRef" class="event-hero__meta hero-animate">
              <div class="event-hero__meta-item">
                <div class="event-hero__meta-icon">
                  <i class="fas fa-calendar-alt"></i>
                </div>
                <div class="event-hero__meta-content">
                  <span class="event-hero__meta-label">{{ t('eventDetail.meta.date') }}</span>
                  <span class="event-hero__meta-value">{{ formatFullDate(event?.date || '') }}</span>
                </div>
              </div>
              <div class="event-hero__meta-item">
                <div class="event-hero__meta-icon">
                  <i class="fas fa-clock"></i>
                </div>
                <div class="event-hero__meta-content">
                  <span class="event-hero__meta-label">{{ t('eventDetail.meta.time') }}</span>
                  <span class="event-hero__meta-value">{{ event?.time }}</span>
                </div>
              </div>
              <div class="event-hero__meta-item">
                <div class="event-hero__meta-icon">
                  <i class="fas fa-map-marker-alt"></i>
                </div>
                <div class="event-hero__meta-content">
                  <span class="event-hero__meta-label">{{ t('eventDetail.meta.location') }}</span>
                  <span class="event-hero__meta-value">{{ event?.location }}, {{ event?.city }}</span>
                </div>
              </div>
            </div>

            <!-- Event CTA -->
            <div ref="ctaRef" class="event-hero__cta hero-animate">
              <BaseButton
                variant="primary"
                size="large"
                icon="fas fa-ticket-alt"
                @click="scrollToBooking"
              >
                {{ t('eventDetail.cta.book') }}
              </BaseButton>
            </div>
          </div>
        </div>

      </section>

    <!-- Event Info -->
    <section class="event-info section" id="event-info">
      <div class="container">
        <div class="event-info__layout">
          <!-- Main Content -->
          <div class="event-info__main">
            <!-- About Event -->
            <div class="event-info__card">
              <div class="event-info__badge">
                <span class="event-info__badge-icon">
                  <i class="fas fa-info-circle"></i>
                </span>
                <span class="event-info__badge-text">{{ t('eventDetail.about.label') }}</span>
              </div>
              <div class="event-info__text">
                <p>
                  <strong>{{ displayTitle }}</strong> {{ displayDescription }}
                </p>
              </div>

              <!-- Event Highlights -->
              <div class="event-highlights">
                <div class="event-info__badge event-info__badge--inline">
                  <span class="event-info__badge-icon">
                    <i class="fas fa-star"></i>
                  </span>
                  <span class="event-info__badge-text">{{ t('eventDetail.highlights.title') }}</span>
                </div>
                <div class="event-highlights__grid">
                  <div class="event-highlight">
                    <div class="event-highlight__icon">
                      <i class="fas fa-music"></i>
                    </div>
                    <div class="event-highlight__content">
                      <h4>{{ t('eventDetail.highlights.artists') }}</h4>
                      <p>{{ t('eventDetail.highlights.artistsDesc') }}</p>
                    </div>
                  </div>
                  <div class="event-highlight">
                    <div class="event-highlight__icon">
                      <i class="fas fa-glass-cheers"></i>
                    </div>
                    <div class="event-highlight__content">
                      <h4>{{ t('eventDetail.highlights.bar') }}</h4>
                      <p>{{ t('eventDetail.highlights.barDesc') }}</p>
                    </div>
                  </div>
                  <div class="event-highlight">
                    <div class="event-highlight__icon">
                      <i class="fas fa-bolt"></i>
                    </div>
                    <div class="event-highlight__content">
                      <h4>{{ t('eventDetail.highlights.production') }}</h4>
                      <p>{{ t('eventDetail.highlights.productionDesc') }}</p>
                    </div>
                  </div>
                  <div class="event-highlight">
                    <div class="event-highlight__icon">
                      <i class="fas fa-crown"></i>
                    </div>
                    <div class="event-highlight__content">
                      <h4>{{ t('eventDetail.highlights.vip') }}</h4>
                      <p>{{ t('eventDetail.highlights.vipDesc') }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Lineup Section -->
            <div v-if="event?.artists && event.artists.length > 0" class="event-info__card">
              <div class="event-info__badge">
                <span class="event-info__badge-icon">
                  <i class="fas fa-music"></i>
                </span>
                <span class="event-info__badge-text">{{ t('eventDetail.lineup.label') }}</span>
              </div>
              <div class="lineup">
                <div v-for="artist in event.artists" :key="artist.id" class="lineup-item">
                    <img
                    v-if="artist.image_url"
                      :src="artist.image_url"
                      :alt="artist.name"
                    />
                  <div v-else class="lineup-item__placeholder">
                    <i class="fas fa-user"></i>
                  </div>
                  <div class="lineup-item__content">
                    <h3 class="lineup-item__name">{{ artist.name }}</h3>
                    <p class="lineup-item__role">{{ getArtistRole(artist, locale) }}</p>
                    <p v-if="artist.start_time && artist.end_time" class="lineup-item__time">
                      {{ artist.start_time }} - {{ artist.end_time }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Venue Info -->
            <div class="event-info__card">
              <div class="event-info__badge">
                <span class="event-info__badge-icon">
                  <i class="fas fa-map-marker-alt"></i>
                </span>
                <span class="event-info__badge-text">{{ t('eventDetail.venue.label') }}</span>
              </div>
              <div class="venue">
                <div v-if="googleMapsEmbedUrl" class="venue__map">
                  <div v-if="!isMapLoaded" class="venue__map-facade" @click="loadMap">
                    <div class="venue__map-overlay">
                      <div class="venue__map-button">
                        <i class="fas fa-map-marked-alt"></i>
                        <span>{{ t('eventDetail.venue.loadMap') }}</span>
                      </div>
                    </div>
                  </div>
                  <iframe
                    v-else
                    :src="googleMapsEmbedUrl"
                    width="100%"
                    height="400"
                    style="border:0; border-radius: 16px;"
                    allowfullscreen
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade">
                  </iframe>
                </div>
                <div v-else class="venue__map-placeholder">
                  <div class="venue__map-icon">
                    <i class="fas fa-map-marker-alt"></i>
                  </div>
                  <p>{{ t('eventDetail.venue.mapNotAvailable') }}</p>
                </div>
                <div class="venue__content">
                  <h3 class="venue__name">{{ event?.location }}</h3>
                  <p class="venue__address">
                    <i class="fas fa-map-marker-alt"></i>
                    <span v-if="event?.address">{{ event.address }}, {{ event?.city }}</span>
                    <span v-else>{{ event?.city }}</span>
                  </p>
                  <a
                    v-if="googleMapsUrl"
                    :href="googleMapsUrl"
                    target="_blank"
                    rel="noopener"
                    class="venue__directions"
                  >
                    <i class="fas fa-directions"></i>
                    {{ t('eventDetail.venue.getDirections') }}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <aside id="booking" class="event-info__sidebar">
            <!-- Booking Card -->
            <div class="booking-card">
              <div class="booking-card__header">
                <h3>{{ t('eventDetail.booking.title') }}</h3>
                <div v-if="event?.availableTickets && event.availableTickets < 50" class="booking-card__badge">
                  <i class="fas fa-fire"></i>
                  <span>{{ t('eventDetail.booking.limitedSeats') }}</span>
                </div>
              </div>

              <div v-if="event?.packs && event.packs.length > 0" class="booking-card__tickets">
                <!-- Pack from DB -->
                <div
                  v-for="pack in event.packs"
                  :key="pack.id"
                  class="ticket-option"
                >
                  <div v-if="pack.is_soldout" class="ticket-option__soldout">
                    <i class="fas fa-exclamation-circle"></i>
                    {{ t('eventDetail.booking.soldOut') }}
                  </div>
                  <div class="ticket-option__header">
                    <h4 class="ticket-option__name">{{ getPackName(pack, locale) }}</h4>
                    <div v-if="shouldShowUnit(pack)" class="ticket-option__price-wrapper">
                      <div class="ticket-option__price">{{ formatPrice(pack.price, pack.currency) }}</div>
                      <span class="ticket-option__unit">{{ getPackUnitText(pack) }}</span>
                    </div>
                    <div v-else class="ticket-option__price">{{ formatPrice(pack.price, pack.currency) }}</div>
                  </div>
                  <ul v-if="getPackFeatures(pack, locale).length > 0" class="ticket-option__features">
                    <li v-for="(feature, idx) in getPackFeatures(pack, locale)" :key="idx">
                      <i class="fas fa-check"></i> {{ feature }}
                    </li>
                  </ul>
                  <BaseButton
                    variant="outline"
                    size="small"
                    icon="fas fa-arrow-right"
                    :disabled="pack.is_soldout"
                    @click="openReservationModal(pack)"
                  >
                    {{ pack.is_soldout ? t('eventDetail.booking.soldOut') : t('eventDetail.booking.choose') }}
                  </BaseButton>
                </div>
              </div>

              <!-- Fallback message if no packs -->
              <div v-else class="booking-card__no-packs">
                <p>{{ t('eventDetail.booking.noPacks') }}</p>
              </div>
            </div>

            <!-- Info Card -->
            <div class="info-card">
              <h3 class="info-card__title">{{ t('eventDetail.info.title') }}</h3>
              <ul class="info-card__list">
                <li>
                  <i class="fas fa-tshirt"></i>
                  <span><strong>{{ t('eventDetail.info.dressing') }}</strong> {{ t('eventDetail.info.dressingDesc') }}</span>
                </li>
                <li>
                  <i class="fas fa-smoking"></i>
                  <span><strong>{{ t('eventDetail.info.smokingArea') }}</strong> {{ t('eventDetail.info.smokingAreaDesc') }}</span>
                </li>
                <li>
                  <i class="fas fa-wheelchair"></i>
                  <span><strong>{{ t('eventDetail.info.accessibility') }}</strong> {{ t('eventDetail.info.accessibilityDesc') }}</span>
                </li>
                <li>
                  <i class="fas fa-parking"></i>
                  <span><strong>{{ t('eventDetail.info.parking') }}</strong> {{ t('eventDetail.info.parkingDesc') }}</span>
                </li>
              </ul>
            </div>

                    <!-- Share Card -->
                    <div class="share-card">
                        <h3 class="share-card__title">{{ t('eventDetail.share.title') }}</h3>
                        <div class="share-card__buttons">
                            <a :href="shareLinks.facebook" class="share-btn share-btn--facebook" target="_blank" rel="noopener" :title="t('eventDetail.share.facebook')">
                                <i class="fab fa-facebook-f"></i>
                            </a>
                            <a :href="shareLinks.twitter" class="share-btn share-btn--twitter" target="_blank" rel="noopener" :title="t('eventDetail.share.twitter')">
                                <i class="fab fa-twitter"></i>
                            </a>
                            <a :href="shareLinks.whatsapp" class="share-btn share-btn--whatsapp" target="_blank" rel="noopener" :title="t('eventDetail.share.whatsapp')">
                                <i class="fab fa-whatsapp"></i>
                            </a>
                            <button @click="copyEventLink" class="share-btn share-btn--copy" :title="t('eventDetail.share.copyLink')">
                                <i class="fas fa-link"></i>
                            </button>
                        </div>
                    </div>
          </aside>
        </div>
      </div>
    </section>
      </div>
    </Transition>

    <!-- Error State -->
    <div v-if="isInitialized && !event && !isLoading" class="error-state">
      <div class="error-state__content">
        <i class="fas fa-exclamation-triangle"></i>
        <h2>{{ t('common.error') }}</h2>
        <p>{{ t('eventDetail.notFound') }}</p>
        <router-link to="/" class="btn btn--primary">
          {{ t('common.backHome') }}
        </router-link>
      </div>
    </div>

    <!-- Reservation Modal -->
    <ReservationModal
      :is-open="isReservationModalOpen"
      :pack-name="selectedPack ? getPackName(selectedPack, locale) : ''"
      :pack-price="selectedPack ? formatPrice(selectedPack.price, selectedPack.currency) : ''"
      :event-title="displayTitle"
      :whatsapp-message="''"
      @close="closeReservationModal"
      @submit="handleReservationSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'
import { logger } from '@/services/logger'
import BaseButton from '@/components/ui/BaseButton.vue'
import EventCountdown from '@/components/ui/EventCountdown.vue'
import ReservationModal from '@/components/ui/ReservationModal.vue'
import { useDataStore } from '@/stores/data'
import { api } from '@/services/api'
import { API_BASE_URL } from '@/config/api'
import { formatPrice, scrollToElement } from '@/utils'
import { getOptimizedImageUrl } from '@/utils/image'
import { getEventTitle, getArtistRole, getPackName, getPackFeatures } from '@/utils/translations'
import { useMobile } from '@/composables/useMobile'
import type { Event, Pack } from '@/types'
import gsap from 'gsap'
// ScrollTrigger is registered globally in App.vue, no need to import here

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const toast = useToast()
const dataStore = useDataStore()

// Refs for GSAP animations
const heroRef = ref<HTMLElement | null>(null)
const heroImageRef = ref<HTMLImageElement | null>(null)
const heroContentRef = ref<HTMLElement | null>(null)
const breadcrumbRef = ref<HTMLElement | null>(null)
const badgeRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const countdownRef = ref<HTMLElement | null>(null)
const metaRef = ref<HTMLElement | null>(null)
const ctaRef = ref<HTMLElement | null>(null)

let gsapContext: gsap.Context | null = null

// ✅ Vérifier le cache IMMÉDIATEMENT (avant le premier rendu)
const initialEventId = route.params.id as string
const cachedEvent = initialEventId ? dataStore.getEventById(initialEventId) ?? null : null

// Si on a un cache hit, initialiser avec les données immédiatement (pas de skeleton)
const event = ref<Event | null>(cachedEvent)
const isLoading = ref(!cachedEvent) // false si cache hit, true sinon
const isInitialized = ref(!!cachedEvent) // true si cache hit, false sinon

// Reservation Modal State
const isReservationModalOpen = ref(false)
const selectedPack = ref<Pack | null>(null)

// Map Facade State
const isMapLoaded = ref(false)
const loadMap = () => {
  isMapLoaded.value = true
}

// Computed properties for translations
const displayTitle = computed(() => {
  if (!event.value) return ''
  return getEventTitle(event.value, locale.value)
})

const displayDescription = computed(() => {
  if (!event.value) return ''
  // Try translation first, fallback to main description
  const translations = event.value.description_translations as Record<string, string> | undefined
  return translations?.[locale.value] || event.value.description || ''
})

// 🚀 Optimize hero image with wsrv.nl
const optimizedHeroImage = computed(() => {
  if (!event.value) return ''
  const url = event.value.image_url || event.value.image || ''
  // 1920px width for hero, but compressed and WebP
  return getOptimizedImageUrl(url, 1920)
})

const googleMapsUrl = computed(() => {
  if (!event.value) return ''
  const query = event.value.address
    ? `${event.value.location}, ${event.value.address}, ${event.value.city}`
    : `${event.value.location}, ${event.value.city}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
})

const googleMapsEmbedUrl = computed(() => {
  if (!event.value) return ''

  // Si l'événement a une URL d'embed personnalisée, l'utiliser
  if (event.value.maps_embed_url) {
    return event.value.maps_embed_url
  }

  // Sinon, générer automatiquement l'URL
  const query = event.value.address
    ? `${event.value.location}, ${event.value.address}, ${event.value.city}`
    : `${event.value.location}, ${event.value.city}`
  return `https://maps.google.com/maps?width=100%25&height=400&hl=fr&q=${encodeURIComponent(query)}&t=&z=14&ie=UTF8&iwloc=&output=embed`
})

// Fetch event data - Cache-first strategy for instant transitions
async function fetchEventData(eventId: string) {
  try {
    // 1. Si on a déjà les données (initialisation synchrone), juste rafraîchir en background
    if (event.value && event.value.id === eventId && isInitialized.value) {
      // Rafraîchir en arrière-plan pour avoir les données complètes
      api.getEventById(eventId).then(freshEvent => {
        if (freshEvent) {
          event.value = freshEvent
        }
      }).catch(() => {})
      return
    }

    // 2. Chercher dans le cache
    const cachedEvent = dataStore.getEventById(eventId)
    if (cachedEvent) {
      event.value = cachedEvent
      isLoading.value = false
      isInitialized.value = true

      // Rafraîchir en arrière-plan
      api.getEventById(eventId).then(freshEvent => {
        if (freshEvent) {
          event.value = freshEvent
        }
      }).catch(() => {})
      return
    }

    // 3. Pas en cache - charger depuis l'API
    isLoading.value = true
    const newEvent = await api.getEventById(eventId)
    event.value = newEvent
    isInitialized.value = true

  } catch (error) {
    logger.error('Error fetching event:', error)
    toast.error('Impossible de charger l\'événement')
    router.push('/')
  } finally {
    isLoading.value = false
  }
}

// Watch for route changes
watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchEventData(newId as string)
  }
}, { immediate: true })

// Format full date (e.g., "Lundi 15 Décembre 2025")
// Defined early because updateMetaTags needs it
const formatFullDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  return new Intl.DateTimeFormat(locale.value, options).format(date)
}

// ============================================
// META TAGS FOR SOCIAL SHARING
// ============================================
const updateMetaTags = () => {
  if (!event.value) return

  const title = displayTitle.value
  const description = displayDescription.value || `${title} - ${event.value.city || ''}`
  const imageUrl = event.value.image_url || event.value.image || ''
  const url = window.location.href
  const date = event.value.date ? formatFullDate(event.value.date) : ''

  // Update page title
  document.title = `${title} | Baba Event`

  // Helper to update or create meta tags
  const setMetaTag = (property: string, content: string, isName = false) => {
    const attr = isName ? 'name' : 'property'
    let element = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement
    if (!element) {
      element = document.createElement('meta')
      element.setAttribute(attr, property)
      document.head.appendChild(element)
    }
    element.content = content
  }

  // OpenGraph meta tags (no emojis for a professional look)
  setMetaTag('og:title', title)
  setMetaTag('og:description', `${date} | ${event.value.location || ''}, ${event.value.city || ''} | ${description}`)
  setMetaTag('og:image', imageUrl)
  setMetaTag('og:url', url)
  setMetaTag('og:type', 'event')
  setMetaTag('og:site_name', 'Baba Event')

  // Twitter Card meta tags
  setMetaTag('twitter:card', 'summary_large_image', true)
  setMetaTag('twitter:title', title, true)
  setMetaTag('twitter:description', `${date} | ${event.value.location || ''}, ${event.value.city || ''}`, true)
  setMetaTag('twitter:image', imageUrl, true)

  // Additional meta tags for better sharing
  setMetaTag('description', description, true)
}

// Watch for event changes to update meta tags
watch(() => event.value, () => {
  if (event.value) {
    updateMetaTags()
  }
}, { immediate: true })

// ============================================
// GSAP ANIMATIONS - Desktop only
// ============================================

// Mobile detection + reduced motion preference (accessibility)
const { isMobile, prefersReducedMotion } = useMobile()

function initHeroAnimations() {
  if (!heroContentRef.value) return

  // SKIP all GSAP animations on mobile OR if user prefers reduced motion
  if (isMobile.value || prefersReducedMotion.value) {
    return
  }

  gsapContext = gsap.context(() => {
    // Set initial states for animated elements
    const animatedElements = heroContentRef.value?.querySelectorAll('.hero-animate')
    if (animatedElements) {
      gsap.set(animatedElements, {
        opacity: 0,
        y: 30
      })
    }

    // Create master timeline
    const tl = gsap.timeline({
      delay: 0.2,
      defaults: {
        ease: 'power2.out'
      }
    })

    // Animate breadcrumb
    if (breadcrumbRef.value) {
      tl.to(breadcrumbRef.value, {
        opacity: 1,
        y: 0,
        duration: 0.6
      })
    }

    // Animate badge (if exists)
    if (badgeRef.value) {
      tl.to(badgeRef.value, {
        opacity: 1,
        y: 0,
        duration: 0.5
      }, '-=0.3')
    }

    // Animate title
    if (titleRef.value) {
      tl.to(titleRef.value, {
        opacity: 1,
        y: 0,
        duration: 0.7
      }, '-=0.3')
    }

    // Animate countdown
    if (countdownRef.value) {
      tl.to(countdownRef.value, {
        opacity: 1,
        y: 0,
        duration: 0.5
      }, '-=0.4')
    }

    // Animate meta section
    if (metaRef.value) {
      tl.to(metaRef.value, {
        opacity: 1,
        y: 0,
        duration: 0.6
      }, '-=0.3')

      // Stagger meta items
      const metaItems = metaRef.value.querySelectorAll('.event-hero__meta-item')
      if (metaItems.length) {
        tl.fromTo(metaItems,
          { opacity: 0, y: 20, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.1
          },
          '-=0.4'
        )
      }
    }

    // Animate CTA
    if (ctaRef.value) {
      tl.to(ctaRef.value, {
        opacity: 1,
        y: 0,
        duration: 0.5
      }, '-=0.2')
    }

    // Parallax + Fade effect on hero image (desktop only)
    if (heroImageRef.value && heroRef.value) {
      gsap.to(heroImageRef.value, {
        yPercent: 15,
        scale: 1.02,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.value,
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        }
      })

      // 🚀 CRITICAL PERFORMANCE FIX: Animate overlay opacity instead of image
      // - Animating opacity on overlay is cheaper than on large image
      // - Eliminates repaint of 1920x1080 image on every frame
      const heroOverlay = heroRef.value.querySelector('.event-hero__overlay')
      if (heroOverlay) {
        gsap.to(heroOverlay, {
          opacity: 0.9, // Darken overlay as user scrolls down
          ease: 'power2.in',
          scrollTrigger: {
            trigger: heroRef.value,
            start: '40% top',
            end: 'bottom top',
            scrub: 1
          }
        })
      }
    }
  }, heroRef.value || undefined)
}

// Watch for content initialization to trigger animations
watch(isInitialized, async (newValue) => {
  if (newValue && event.value) {
    await nextTick()
    setTimeout(() => initHeroAnimations(), 50)
  }
})

// Cleanup GSAP on unmount
onUnmounted(() => {
  if (gsapContext) {
    gsapContext.revert()
    gsapContext = null
  }
})

// Scroll to booking section
function scrollToBooking() {
  scrollToElement('#booking', 100)
}

// Check if pack unit should be displayed (only for multiple persons/table)
const shouldShowUnit = (pack: Pack): boolean => {
  if (!pack.unit) return false

  // If unit is already a formatted text (contains "/"), use it as is
  if (pack.unit.includes('/')) {
    return true
  }

  // If unit is just a number
  const capacity = parseInt(pack.unit, 10)
  if (!isNaN(capacity)) {
    return capacity > 1
  }

  return true
}

// Get formatted unit text
const getPackUnitText = (pack: Pack): string => {
  if (!pack.unit) return ''

  // If unit already contains formatting (like "/ table de 6"), return as is
  if (pack.unit.includes('/') || pack.unit.includes('table') || pack.unit.includes('groupe')) {
    return pack.unit
  }

  // If unit is a number, format it based on pack type
  const capacity = parseInt(pack.unit, 10)
  if (!isNaN(capacity)) {
    // Check pack name to determine context
    const packName = getPackName(pack, locale.value).toLowerCase()

    if (packName.includes('table') || packName.includes('vip')) {
      return `/ table de ${capacity}`
    }

    if (capacity > 1) {
      return `/ ${capacity} personnes`
    }
  }

  // Fallback: return as is
  return pack.unit
}

// Reservation Modal Methods
const openReservationModal = (pack: Pack) => {
  if (pack.is_soldout) return
  selectedPack.value = pack
  isReservationModalOpen.value = true
}

const closeReservationModal = () => {
  isReservationModalOpen.value = false
  selectedPack.value = null
}

const handleReservationSubmit = (data: { firstName: string; lastName: string; numberOfPeople: number }) => {
  if (!selectedPack.value) return

  const phone = '32495526656'
  const pack = selectedPack.value

  // Event info
  const eventTitle = displayTitle.value
  const eventDate = event.value?.date ? formatFullDate(event.value.date) : ''
  const eventTime = event.value?.time || ''
  const eventLocation = event.value?.location || ''
  const eventCity = event.value?.city || ''

  // Pack info
  const packName = getPackName(pack, locale.value)
  const packPrice = formatPrice(pack.price, pack.currency)
  const packUnit = getPackUnitText(pack)
  const packFeatures = getPackFeatures(pack, locale.value)

  // Build professional formatted message (no emojis for a clean look)
  let message = ''

  // Header with decorative line
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
  message += `${t('reservation.whatsapp.header').toUpperCase()}\n`
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`

  // Greeting
  message += `${t('reservation.whatsapp.greeting')}\n\n`
  message += `${t('reservation.whatsapp.intro')}\n\n`

  // Client section
  message += `*${t('reservation.whatsapp.clientSection')}*\n`
  message += `----------------------------------------\n`
  message += `${t('reservation.whatsapp.name')}: ${data.firstName} ${data.lastName}\n`
  message += `${t('reservation.whatsapp.guests')}: ${data.numberOfPeople}\n\n`

  // Event section
  message += `*${t('reservation.whatsapp.eventSection')}*\n`
  message += `----------------------------------------\n`
  message += `${t('reservation.whatsapp.event')}: ${eventTitle}\n`
  message += `${t('reservation.whatsapp.date')}: ${eventDate}\n`
  message += `${t('reservation.whatsapp.time')}: ${eventTime}\n`
  message += `${t('reservation.whatsapp.venue')}: ${eventLocation}, ${eventCity}\n\n`

  // Pack section
  message += `*${t('reservation.whatsapp.packSection')}*\n`
  message += `----------------------------------------\n`
  message += `${t('reservation.whatsapp.pack')}: ${packName}\n`

  let priceText = packPrice
  if (packUnit && shouldShowUnit(pack)) {
    priceText += ` ${packUnit}`
  }
  message += `${t('reservation.whatsapp.price')}: ${priceText}\n`

  if (packFeatures.length > 0) {
    message += `${t('reservation.whatsapp.includes')}:\n`
    packFeatures.forEach((feature: string) => {
      message += `  - ${feature}\n`
    })
  }

  // Closing
  message += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
  message += `${t('reservation.whatsapp.closing')}\n\n`
  message += `${t('reservation.whatsapp.signature')},\n`
  message += `${data.firstName} ${data.lastName}`

  // Open WhatsApp with the message
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, '_blank')

  // Close the modal
  closeReservationModal()
}

// Build share message for the event
const buildShareMessage = () => {
  const eventId = route.params.id as string
  // Use the actual frontend URL for sharing (not the backend OG URL)
  // This way users can click and go directly to the event page
  const frontendUrl = `${window.location.origin}/events/${eventId}`
  const title = displayTitle.value
  const date = event.value?.date ? formatFullDate(event.value.date) : ''
  const time = event.value?.time || ''
  const location = event.value?.location || ''
  const city = event.value?.city || ''

  // Get minimum price from packs
  const minPrice = event.value?.packs?.length
    ? Math.min(...event.value.packs.filter((p: Pack) => !p.is_soldout).map((p: Pack) => p.price))
    : null

  // Build professional formatted message (no emojis for a clean look)
  let message = ''

  // Header
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
  message += `${t('eventDetail.share.message.header').toUpperCase()}\n`
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`

  // Introduction
  message += `${t('eventDetail.share.message.discover')}\n\n`

  // Event details
  message += `*${t('eventDetail.share.message.event')}*\n`
  message += `${title}\n\n`

  message += `${t('eventDetail.share.message.date')}: ${date}\n`
  if (time) {
    message += `${t('eventDetail.share.message.time')}: ${time}\n`
  }
  message += `${t('eventDetail.share.message.venue')}: ${location}${city ? `, ${city}` : ''}\n`

  if (minPrice && minPrice > 0) {
    message += `${t('eventDetail.share.message.tickets')}: ${formatPrice(minPrice, event.value?.packs?.[0]?.currency || 'EUR')}\n`
  }

  // Call to action
  message += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
  message += `*${t('eventDetail.share.message.cta')}*\n\n`

  // Link to the frontend event page (direct link for users)
  message += `${frontendUrl}`

  return message
}

// Share links
const shareLinks = computed(() => {
  const eventId = route.params.id as string
  const title = displayTitle.value
  const date = event.value?.date ? formatFullDate(event.value.date) : ''
  const location = event.value?.city || ''

  // URL with OpenGraph meta tags served by backend (for Facebook/Twitter crawlers)
  // Include current language for proper translations
  const ogUrl = `${API_BASE_URL}/og/events/${eventId}?lang=${locale.value}`

  // Short text for Twitter (character limit, no emojis)
  const shareText = `${title} | ${date} | ${location}`

  // Beautiful WhatsApp message with frontend URL
  const whatsappMessage = buildShareMessage()

  return {
    // Facebook & Twitter use the OG URL which has proper meta tags and redirects to the actual page
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(ogUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(ogUrl)}&text=${encodeURIComponent(shareText)}`,
    // WhatsApp uses the formatted message directly
    whatsapp: `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`
  }
})

// Copier le lien de l'événement
const copyEventLink = async () => {
  try {
    // Build the beautiful share message
    const textToCopy = buildShareMessage()

    // Utiliser l'API Clipboard si disponible
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(textToCopy)
      toast.success(t('eventDetail.share.copied'))
    } else {
      // Fallback pour les anciens navigateurs
      const textArea = document.createElement('textarea')
      textArea.value = textToCopy
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        toast.success(t('eventDetail.share.copied'))
      } catch {
        toast.error(t('eventDetail.share.copyError'))
      }
      document.body.removeChild(textArea)
    }
  } catch (err) {
    logger.error('Erreur lors de la copie:', err)
    toast.error(t('eventDetail.share.copyError'))
  }
}
</script>

<style scoped>
@import '@/assets/styles/eventDetail.css';

/* Error State */
.error-state {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.error-state__content {
  text-align: center;
  max-width: 400px;
}

.error-state__content i {
  font-size: 4rem;
  color: var(--color-primary);
  margin-bottom: 1.5rem;
  opacity: 0.6;
}

.error-state__content h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-white);
  margin-bottom: 1rem;
}

.error-state__content p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn--primary {
  background: var(--color-primary);
  color: var(--color-white);
}

.btn--primary:hover {
  background: #c41e3a;
  transform: translateY(-2px);
}

/* ============================================
   SKELETON LOADING STATE - PREMIUM
   ============================================ */
.event-hero--skeleton {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 120px 0 80px;
  animation: skeleton-fade-in 0.4s ease-out;
}

@keyframes skeleton-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.event-hero__background--skeleton {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 50% at 50% 0%, rgba(220, 20, 60, 0.08) 0%, transparent 50%),
    linear-gradient(180deg, rgba(10, 10, 15, 0.98) 0%, rgba(15, 10, 12, 0.95) 100%);
  z-index: 1;
  overflow: hidden;
}

/* Ambient glow effect */
.event-hero__background--skeleton::before {
  content: '';
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 300px;
  background: radial-gradient(ellipse, rgba(220, 20, 60, 0.15) 0%, transparent 70%);
  filter: blur(60px);
  animation: skeleton-glow 3s ease-in-out infinite alternate;
}

@keyframes skeleton-glow {
  0% { opacity: 0.5; transform: translateX(-50%) scale(0.9); }
  100% { opacity: 1; transform: translateX(-50%) scale(1.1); }
}

/* skeleton-shimmer is now centralized in variables.css */

@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Staggered entrance animation */
@keyframes skeleton-slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.skeleton-breadcrumb {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
  animation: skeleton-slide-up 0.5s ease-out 0.1s both;
}

.skeleton-line {
  height: 16px;
  width: 200px;
  border-radius: 20px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.03) 0%,
    rgba(255, 255, 255, 0.08) 20%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.08) 80%,
    rgba(255, 255, 255, 0.03) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 2s ease-in-out infinite;
}

.skeleton-line--sm {
  width: 180px;
  height: 14px;
}

.skeleton-title {
  height: 52px;
  width: 75%;
  max-width: 550px;
  margin: 0 auto 1rem;
  border-radius: 16px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.04) 0%,
    rgba(255, 255, 255, 0.1) 20%,
    rgba(255, 255, 255, 0.18) 50%,
    rgba(255, 255, 255, 0.1) 80%,
    rgba(255, 255, 255, 0.04) 100%
  );
  background-size: 200% 100%;
  animation:
    skeleton-shimmer 2s ease-in-out infinite,
    skeleton-slide-up 0.5s ease-out 0.2s both;
}

.skeleton-title--short {
  width: 45%;
  max-width: 350px;
  height: 44px;
  margin-bottom: 2.5rem;
  animation:
    skeleton-shimmer 2s ease-in-out infinite,
    skeleton-slide-up 0.5s ease-out 0.3s both;
}

.skeleton-meta {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  padding: 1.5rem 2rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  animation: skeleton-slide-up 0.5s ease-out 0.4s both;
}

.skeleton-meta-item {
  width: 100px;
  height: 45px;
  border-radius: 12px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.02) 0%,
    rgba(255, 255, 255, 0.06) 20%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.06) 80%,
    rgba(255, 255, 255, 0.02) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 2s ease-in-out infinite;
}

.skeleton-meta-item:nth-child(1) { animation-delay: 0s; }
.skeleton-meta-item:nth-child(2) { animation-delay: 0.15s; }
.skeleton-meta-item:nth-child(3) { animation-delay: 0.3s; }

.skeleton-cta {
  width: 200px;
  height: 52px;
  margin: 0 auto;
  border-radius: 30px;
  background: linear-gradient(
    90deg,
    rgba(220, 20, 60, 0.15) 0%,
    rgba(220, 20, 60, 0.25) 20%,
    rgba(220, 20, 60, 0.4) 50%,
    rgba(220, 20, 60, 0.25) 80%,
    rgba(220, 20, 60, 0.15) 100%
  );
  background-size: 200% 100%;
  animation:
    skeleton-shimmer 2s ease-in-out infinite,
    skeleton-slide-up 0.5s ease-out 0.5s both,
    skeleton-pulse 2s ease-in-out infinite 1s;
  border: 1px solid rgba(220, 20, 60, 0.25);
  box-shadow:
    0 0 30px rgba(220, 20, 60, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* Responsive skeleton */
@media (max-width: 768px) {
  .event-hero--skeleton {
    min-height: 100vh;
    padding: 100px 1rem 60px;
  }

  .event-hero__background--skeleton::before {
    width: 300px;
    height: 150px;
  }

  .skeleton-title {
    height: 40px;
    width: 90%;
  }

  .skeleton-title--short {
    height: 36px;
    width: 70%;
  }

  .skeleton-meta {
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.25rem;
  }

  .skeleton-meta-item {
    width: 100%;
    height: 40px;
  }

  .skeleton-cta {
    width: 160px;
    height: 46px;
  }
}

/* ============================================
   SKELETON → CONTENT TRANSITION
   ============================================ */
.skeleton-fade-enter-active {
  transition: opacity 0.4s ease-out, transform 0.4s ease-out;
}

.skeleton-fade-leave-active {
  transition: opacity 0.3s ease-in, transform 0.3s ease-in;
}

.skeleton-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.skeleton-fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

/* Content wrapper for smooth entrance */
.event-content-wrapper {
  animation: content-reveal 0.5s ease-out;
}

@keyframes content-reveal {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

