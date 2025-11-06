<template>
  <div class="event-detail-page">
    <!-- Loading State -->
    <LoadingSpinner 
      v-if="!isInitialized || isLoading" 
      fullscreen 
      :message="t('common.loading')" 
    />
    
    <!-- Event Content -->
    <template v-else-if="isInitialized && event && !isLoading">
      <!-- Event Hero -->
      <section class="event-hero" id="event-hero">
      <div class="event-hero__background">
        <img :src="event?.image_url || event?.image" :alt="event?.title">
        <div class="event-hero__overlay"></div>
      </div>

      <div class="container">
        <div class="event-hero__content">
          <!-- Breadcrumb -->
          <nav class="breadcrumb" data-aos="fade-down" data-aos-duration="500">
            <router-link to="/" class="breadcrumb__link">{{ t('nav.home') }}</router-link>
            <span class="breadcrumb__separator">/</span>
            <router-link to="/#events" class="breadcrumb__link">{{ t('nav.events') }}</router-link>
            <span class="breadcrumb__separator">/</span>
            <span class="breadcrumb__current">{{ displayTitle }}</span>
          </nav>

          <!-- Event Badge -->
          <div v-if="event?.featured" class="event-hero__badge" data-aos="zoom-in" data-aos-delay="100" data-aos-duration="600">
            <i class="fas fa-fire"></i>
            <span>{{ t('eventDetail.badge.popular') }}</span>
          </div>

          <!-- Event Title -->
          <h1 class="event-hero__title" data-aos="fade-up" data-aos-delay="200" data-aos-duration="1000">
            {{ displayTitle }}
          </h1>

          <!-- Countdown -->
          <EventCountdown 
            v-if="event?.date"
            :eventDate="event.date" 
            data-aos="zoom-in" 
            data-aos-delay="350"
            data-aos-duration="700"
          />

          <!-- Event Meta -->
          <div class="event-hero__meta" data-aos="fade-up" data-aos-delay="450" data-aos-duration="800">
            <div class="event-hero__meta-item">
              <i class="fas fa-calendar-alt"></i>
              <div>
                <span class="label">{{ t('eventDetail.meta.date') }}</span>
                <span class="value">{{ formatFullDate(event?.date || '') }}</span>
              </div>
            </div>
            <div class="event-hero__meta-item">
              <i class="fas fa-clock"></i>
              <div>
                <span class="label">{{ t('eventDetail.meta.time') }}</span>
                <span class="value">{{ event?.time }}</span>
              </div>
            </div>
            <div class="event-hero__meta-item">
              <i class="fas fa-map-marker-alt"></i>
              <div>
                <span class="label">{{ t('eventDetail.meta.location') }}</span>
                <span class="value">{{ event?.location }}, {{ event?.city }}</span>
              </div>
            </div>
          </div>

          <!-- Event CTA -->
          <div class="event-hero__cta" data-aos="fade-up" data-aos-delay="600" data-aos-duration="700">
            <BaseButton
              variant="primary"
              size="large"
              icon="fas fa-arrow-down"
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
            <div class="event-info__card" data-aos="fade-right" data-aos-duration="800">
              <h2 class="event-info__title">{{ t('eventDetail.about.title') }}</h2>
              <div class="event-info__text">
                <p>
                  <strong>{{ displayTitle }}</strong> {{ displayDescription }}
                </p>
              </div>

              <!-- Event Highlights -->
              <div class="event-highlights">
                <h3 class="event-highlights__title">{{ t('eventDetail.highlights.title') }}</h3>
                <div class="event-highlights__grid">
                  <div class="event-highlight">
                    <div class="event-highlight__icon">
                      <i class="fas fa-music"></i>
                    </div>
                    <div class="event-highlight__content">
                      <h4>{{ t('eventDetail.highlights.artists') }}</h4>
                      <p>{{ t('eventDetail.highlights.artistsDesc', { count: artistsCount }) }}</p>
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
                      <i class="fas fa-video"></i>
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
            <div v-if="event?.artists && event.artists.length > 0" class="event-info__card" data-aos="fade-right" data-aos-delay="150" data-aos-duration="800">
              <h2 class="event-info__title">{{ t('eventDetail.lineup.title') }}</h2>
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
            <div class="event-info__card" data-aos="fade-right" data-aos-delay="300" data-aos-duration="800">
              <h2 class="event-info__title">{{ t('eventDetail.venue.title') }}</h2>
              <div class="venue">
                <div v-if="googleMapsEmbedUrl" class="venue__map">
                  <iframe 
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
            <div class="booking-card" data-aos="zoom-in-left" data-aos-duration="900">
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
                    tag="a"
                    :href="getWhatsAppLink(pack)"
                    target="_blank"
                    rel="noopener"
                    :disabled="pack.is_soldout"
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
            <div class="info-card" data-aos="fade-left" data-aos-delay="150" data-aos-duration="800">
              <h3 class="info-card__title">{{ t('eventDetail.info.title') }}</h3>
              <ul class="info-card__list">
                <li>
                  <i class="fas fa-smoking-ban"></i>
                  <span><strong>{{ t('eventDetail.info.smoking') }}</strong> {{ t('eventDetail.info.smokingDesc') }}</span>
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
                    <div class="share-card" data-aos="fade-left" data-aos-delay="300" data-aos-duration="800">
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
    </template>
    
    <!-- Error State -->
    <div v-else-if="isInitialized && !event && !isLoading" class="error-state">
      <div class="error-state__content">
        <i class="fas fa-exclamation-triangle"></i>
        <h2>{{ t('common.error') }}</h2>
        <p>{{ t('eventDetail.notFound') }}</p>
        <router-link to="/" class="btn btn--primary">
          {{ t('common.backHome') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import { useToast } from '@/composables/useToast'
import AOS from 'aos'
import BaseButton from '@/components/ui/BaseButton.vue'
import EventCountdown from '@/components/ui/EventCountdown.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { api } from '@/services/api'
import { formatPrice, scrollToElement } from '@/utils'
import { getEventTitle, getEventDescription, getArtistRole, getArtistDescription, getPackName, getPackFeatures } from '@/utils/translations'
import type { Event } from '@/types'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const appStore = useAppStore()
const toast = useToast()

const event = ref<Event | null>(null)
const isLoading = ref(true)
const isInitialized = ref(false) // Empêche le flash initial

// AbortController pour annuler les requêtes en cours
let abortController: AbortController | null = null

// Computed properties for translations
const displayTitle = computed(() => {
  if (!event.value) return ''
  return getEventTitle(event.value, locale.value)
})

const displayDescription = computed(() => {
  if (!event.value) return ''
  return getEventDescription(event.value, locale.value)
})

// Computed property for artists count
const artistsCount = computed(() => {
  if (!event.value?.artists) return 0
  return event.value.artists.length
})

// Google Maps URLs
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

// Fetch event data
async function fetchEventData(eventId: string) {
  // Annuler la requête précédente si elle existe
  if (abortController) {
    abortController.abort()
  }
  
  // Créer un nouveau controller
  abortController = new AbortController()
  
  try {
    // Clear previous data and show loading immediately
    event.value = null
    isLoading.value = true
    
    // Fetch new event data
    const newEvent = await api.getEventById(eventId)
    
    // Set the new event (suppression du délai artificiel)
    event.value = newEvent
    
    // Marquer comme initialisé après le premier chargement
    isInitialized.value = true
    
    // Refresh AOS to detect new elements after data loads
    setTimeout(() => {
      AOS.refresh()
    }, 100)
  } catch (error: any) {
    // Ignorer les erreurs d'annulation
    if (error?.name === 'AbortError') {
      console.log('Request cancelled')
      return
    }
    
    console.error('Error fetching event:', error)
    toast.error('Impossible de charger l\'événement')
    router.push('/')
  } finally {
    isLoading.value = false
  }
}

// Cleanup au unmount
onUnmounted(() => {
  if (abortController) {
    abortController.abort()
  }
})

// Watch for route changes
watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchEventData(newId as string)
  }
}, { immediate: true })



// Format full date (e.g., "Lundi 15 Décembre 2025")
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

// Scroll to info section
const scrollToInfo = () => {
  scrollToElement('#event-info')
}

const scrollToBooking = () => {
  scrollToElement('#booking', 100)
}

// Check if pack unit should be displayed (only for multiple persons/table)
const shouldShowUnit = (pack: any): boolean => {
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
const getPackUnitText = (pack: any): string => {
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

// Generate WhatsApp link for tickets
const getWhatsAppLink = (pack: any) => {
  const phone = '32495526656' // Numéro WhatsApp Baba Event
  
  // Récupérer toutes les informations de l'événement
  const eventTitle = displayTitle.value
  const eventDate = event.value?.date ? formatFullDate(event.value.date) : ''
  const eventTime = event.value?.time || ''
  const eventLocation = event.value?.location || ''
  const eventCity = event.value?.city || ''
  
  // Récupérer les informations du pack
  const packName = getPackName(pack, locale.value)
  const packPrice = formatPrice(pack.price, pack.currency)
  const packUnit = getPackUnitText(pack)
  const packFeatures = getPackFeatures(pack, locale.value)
  
  // Construire le message formaté avec emojis
  let message = `🎉 *RÉSERVATION ÉVÉNEMENT*\n\n`
  message += `📋 *Événement :* ${eventTitle}\n`
  message += `📅 *Date :* ${eventDate}\n`
  message += `🕐 *Heure :* ${eventTime}\n`
  message += `📍 *Lieu :* ${eventLocation}, ${eventCity}\n\n`
  message += `🎫 *Pack choisi :* ${packName}\n`
  message += `💰 *Prix :* ${packPrice}`
  
  // Ajouter l'unité si elle existe
  if (packUnit && shouldShowUnit(pack)) {
    message += ` ${packUnit}`
  }
  
  // Ajouter les fonctionnalités du pack
  if (packFeatures.length > 0) {
    message += `\n\n✨ *Inclus :*\n`
    packFeatures.forEach((feature: string) => {
      message += `• ${feature}\n`
    })
  }
  
  message += `\n\nJe souhaite réserver pour cet événement. Merci !`
  
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

// Share links
const shareLinks = computed(() => {
  const url = window.location.href
  const title = displayTitle.value
  const date = event.value?.date ? formatFullDate(event.value.date) : ''
  const location = event.value?.city || ''
  
  // Message enrichi avec plus de détails
  const shareText = `${title} - ${date} à ${location}`
  const shareMessage = `🎉 ${title}\n📅 ${date}\n📍 ${location}\n\n${url}`
  
  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareMessage)}`
  }
})

// Copier le lien de l'événement
const copyEventLink = async () => {
  try {
    const url = window.location.href
    const title = displayTitle.value
    const date = event.value?.date ? formatFullDate(event.value.date) : ''
    const location = event.value?.city || ''
    
    // Texte enrichi à copier
    const textToCopy = `🎉 ${title}\n📅 ${date}\n📍 ${location}\n\n${url}`
    
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
      } catch (err) {
        toast.error(t('eventDetail.share.copyError'))
      }
      document.body.removeChild(textArea)
    }
  } catch (err) {
    console.error('Erreur lors de la copie:', err)
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
</style>

