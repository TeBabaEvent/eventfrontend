<template>
  <div class="events-view">
    <!-- Page Header - Always visible -->
    <div class="page-header">
      <div class="page-header__left">
        <h1 class="page-header__title">Événements</h1>
        <p class="page-header__count">{{ events.length }} événement(s)</p>
      </div>
      <button class="create-btn" @click="showCreateModal">
        <i class="fas fa-plus"></i>
        <span>Nouvel événement</span>
      </button>
    </div>

    <!-- Skeleton Loading State -->
    <div v-if="isInitialLoading" class="events-grid">
      <SkeletonCard v-for="n in 4" :key="n" variant="event" />
    </div>

    <!-- Empty State -->
    <div v-else-if="events.length === 0" class="empty-state">
      <div class="empty-state__icon">
        <i class="fas fa-calendar-times"></i>
      </div>
      <h3 class="empty-state__title">Aucun événement</h3>
      <p class="empty-state__text">Commencez par créer votre premier événement</p>
    </div>

    <!-- Events Grid -->
    <div v-else class="events-grid">
        <article v-for="event in sortedEvents" :key="event.id" class="event-card" :class="{ 'event-card--past': !isUpcoming(event) }">
          <!-- Image -->
          <div class="event-card__visual">
            <img v-if="event.image_url" :src="event.image_url" :alt="event.title">
            <div v-else class="event-card__no-image">
              <i class="fas fa-image"></i>
            </div>
          </div>

          <!-- Content -->
          <div class="event-card__content">
            <!-- Top Row: Category + Status -->
            <div class="event-card__top">
              <span class="event-card__tag">{{ getCategoryLabel(event.category) }}</span>
              <span :class="['event-card__indicator', isUpcoming(event) ? 'event-card__indicator--active' : 'event-card__indicator--past']">
                <i :class="isUpcoming(event) ? 'fas fa-circle' : 'fas fa-check'"></i>
                {{ getStatusLabel(event) }}
              </span>
            </div>

            <!-- Title -->
            <h3 class="event-card__title">{{ event.title }}</h3>

            <!-- Details -->
            <div class="event-card__details">
              <div class="detail">
                <i class="fas fa-calendar-alt"></i>
                <span>{{ formatDate(event.date) }} · {{ event.time }}</span>
              </div>
              <div class="detail">
                <i class="fas fa-map-marker-alt"></i>
                <span>{{ event.location }}</span>
              </div>
            </div>

            <!-- Stats Row -->
            <div class="event-card__stats">
              <div class="stat" v-if="event.artists && event.artists.length > 0">
                <i class="fas fa-microphone"></i>
                <span>{{ event.artists.length }} artiste(s)</span>
              </div>
              <div class="stat" v-if="event.packs && event.packs.length > 0">
                <i class="fas fa-ticket-alt"></i>
                <span>{{ Math.min(...event.packs.map((p: any) => p.price)) }}€</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="event-card__actions">
              <button class="btn-action btn-action--stats" @click="openStats(event)" title="Statistiques">
                <i class="fas fa-chart-bar"></i>
              </button>
              <button class="btn-action btn-action--primary" @click="editEvent(event)">
                <i class="fas fa-pen"></i>
                Modifier
              </button>
              <button class="btn-action btn-action--view" @click="viewEvent(event)" title="Voir la page publique">
                <i class="fas fa-external-link-alt"></i>
                Voir
              </button>
              <button class="btn-action btn-action--icon" @click="deleteEvent(event)" title="Supprimer">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
        </article>
      </div>

    <!-- Stats Drawer -->
    <EventStatsDrawer
      :is-open="isStatsDrawerOpen"
      :event-id="selectedEventForStats?.id ?? null"
      :event-date="selectedEventForStats?.date"
      @close="closeStatsDrawer"
    />

    <!-- Create/Edit Modal -->
    <Transition name="modal">
      <div v-if="isModalOpen" class="modal" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">{{ editingEvent ? 'Modifier l\'événement' : 'Nouvel événement' }}</h2>
            <button class="modal-close" @click="closeModal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="event-form">
            <!-- Titre multilingue -->
            <div class="form-row form-row--single">
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-heading"></i>
                  Titre
                  <span class="required">*</span>
                </label>

                <!-- Language Tabs -->
                <div class="language-tabs">
                  <button
                    v-for="lang in languages"
                    :key="lang.code"
                    type="button"
                    :class="['language-tab', { active: currentTitleLang === lang.code }]"
                    @click="currentTitleLang = lang.code"
                  >
                    {{ lang.label }}
                  </button>
                </div>

                <!-- Title inputs for each language -->
                <div class="language-inputs">
                  <input
                    v-for="lang in languages"
                    :key="lang.code"
                    v-show="currentTitleLang === lang.code"
                    v-model="(formData.title_translations as any)[lang.code]"
                    type="text"
                    class="form-input"
                    :placeholder="`Titre de l'événement (${lang.label})`"
                    :required="lang.code === 'fr'"
                  >
                </div>
              </div>
            </div>

            <!-- Category & Date -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-tag"></i>
                  Catégorie
                  <span class="required">*</span>
                </label>
                <select v-model="formData.category" class="form-select" required>
                  <option value="">Sélectionner</option>
                  <option value="concert">Concert</option>
                  <option value="festival">Festival</option>
                  <option value="party">Soirée</option>
                  <option value="wedding">Mariage</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-calendar"></i>
                  Date
                  <span class="required">*</span>
                </label>
                <input v-model="formData.date" type="date" class="form-input" required>
              </div>
            </div>

            <!-- Time & Capacity -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-clock"></i>
                  Heure
                  <span class="required">*</span>
                </label>
                <input v-model="formData.time" type="time" class="form-input" required>
              </div>
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-users"></i>
                  Capacité
                </label>
                <input v-model.number="formData.capacity" type="number" class="form-input" min="0" placeholder="Ex: 500">
              </div>
            </div>

            <!-- Location -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-map-marker-alt"></i>
                  Lieu
                  <span class="required">*</span>
                </label>
                <input v-model="formData.location" type="text" class="form-input" placeholder="Nom du lieu" required>
              </div>
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-city"></i>
                  Ville
                  <span class="required">*</span>
                </label>
                <input v-model="formData.city" type="text" class="form-input" placeholder="Ex: Paris" required>
              </div>
            </div>

            <!-- Address -->
            <div class="form-row form-row--single">
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-location-arrow"></i>
                  Adresse complète
                </label>
                <input v-model="formData.address" type="text" class="form-input" placeholder="Rue, numéro, code postal...">
              </div>
            </div>

            <!-- Description multilingue -->
            <div class="form-row form-row--single">
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-align-left"></i>
                  Description
                  <span class="required">*</span>
                </label>

                <!-- Language Tabs -->
                <div class="language-tabs">
                  <button
                    v-for="lang in languages"
                    :key="lang.code"
                    type="button"
                    :class="['language-tab', { active: currentDescLang === lang.code }]"
                    @click="currentDescLang = lang.code"
                  >
                    {{ lang.label }}
                  </button>
                </div>

                <!-- Description textareas for each language -->
                <div class="language-inputs">
                  <textarea
                    v-for="lang in languages"
                    :key="lang.code"
                    v-show="currentDescLang === lang.code"
                    v-model="(formData.description_translations as any)[lang.code]"
                    class="form-textarea"
                    :placeholder="`Description de l'événement (${lang.label})`"
                    :required="lang.code === 'fr'"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Image URL -->
            <div class="form-row form-row--single">
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-image"></i>
                  URL de l'image
                </label>
                <input v-model="formData.image_url" type="url" class="form-input" placeholder="https://...">
              </div>
            </div>

            <!-- Maps Embed URL -->
            <div class="form-row form-row--single">
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-map-marked-alt"></i>
                  URL d'embed Google Maps
                </label>
                <input
                  v-model="formData.maps_embed_url"
                  type="text"
                  class="form-input"
                  placeholder="Collez l'iframe Google Maps complet ici..."
                  @paste="handleMapsPaste"
                >
                <small class="form-help">Optionnel : Collez directement l'iframe Google Maps complet - l'URL sera extraite automatiquement ! Laissez vide pour génération automatique.</small>
              </div>
            </div>

            <!-- After Movie Links -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <i class="fab fa-youtube"></i>
                  URL YouTube Shorts (After Movie)
                </label>
                <input v-model="formData.youtube_shorts_url" type="url" class="form-input" placeholder="https://youtube.com/shorts/...">
                <small class="form-help">Lien vers l'after movie YouTube Shorts de l'événement (optionnel)</small>
              </div>
              <div class="form-group">
                <label class="form-label">
                  <i class="fab fa-instagram"></i>
                  URL Instagram Reels (After Movie)
                </label>
                <input v-model="formData.instagram_reels_url" type="url" class="form-input" placeholder="https://instagram.com/reel/...">
                <small class="form-help">Lien vers l'after movie Instagram Reels de l'événement (optionnel)</small>
              </div>
            </div>

            <!-- Artistes -->
            <div class="form-section">
              <h3 class="form-section-title">
                <i class="fas fa-microphone"></i>
                Artistes / DJs
              </h3>
              <div v-if="artists.length === 0" class="form-empty">
                Aucun artiste disponible. <router-link to="/dashboard/artists" class="link">Créer un artiste</router-link>
              </div>
              <div v-else class="artists-selector">
                <div v-for="artist in artists" :key="artist.id" class="selector-item">
                  <label class="selector-checkbox">
                    <input type="checkbox" :checked="isArtistSelected(artist.id)" @change="toggleArtist(artist)">
                    <span class="selector-name">{{ artist.name }}</span>
                    <span class="selector-role">{{ artist.role }}</span>
                  </label>
                </div>
              </div>

              <!-- Horaires des artistes sélectionnés -->
              <div v-if="formData.selectedArtists.length > 0" class="selected-artists-schedule">
                <div class="schedule-header">
                  <span class="schedule-header__artist">Artiste</span>
                  <span class="schedule-header__time">Horaire</span>
                </div>
                <div v-for="(selectedArtist, index) in formData.selectedArtists" :key="selectedArtist.id || selectedArtist.artist_id" class="schedule-item">
                  <div class="schedule-item__info">
                    <span class="schedule-item__name">{{ selectedArtist.name }}</span>
                  </div>
                  <div class="schedule-item__times">
                    <input
                      v-model="formData.selectedArtists[index].start_time"
                      type="time"
                      class="form-input--time"
                    >
                    <span class="time-arrow">→</span>
                    <input
                      v-model="formData.selectedArtists[index].end_time"
                      type="time"
                      class="form-input--time"
                    >
                  </div>
                </div>
              </div>
            </div>

            <!-- Packs -->
            <div class="form-section">
              <h3 class="form-section-title">
                <i class="fas fa-ticket-alt"></i>
                Packs de réservation
              </h3>
              <div v-if="packs.length === 0" class="form-empty">
                Aucun pack disponible. <router-link to="/dashboard/packs" class="link">Créer un pack</router-link>
              </div>
              <div v-else class="packs-selector">
                <div v-for="pack in packs" :key="pack.id" class="selector-item">
                  <label class="selector-checkbox">
                    <input type="checkbox" :checked="isPackSelected(pack.id)" @change="togglePack(pack)">
                    <span class="selector-name">{{ pack.name }}</span>
                    <span class="selector-price">{{ pack.price }}€</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="form-actions">
              <button type="button" class="btn btn--outline" @click="closeModal">
                Annuler
              </button>
              <button type="submit" class="btn btn--primary">
                {{ editingEvent ? 'Enregistrer' : 'Créer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ref, computed, onMounted } from 'vue'
import { buildApiUrl, getAuthHeaders, API_ENDPOINTS } from '@/config/api'
import { useAdminDataStore } from '@/stores/adminData'
import { useToast } from '@/composables/useToast'
import { logger } from '@/services/logger'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'
import EventStatsDrawer from '@/components/dashboard/EventStatsDrawer.vue'
import type { Event, Artist } from '@/types'

const adminStore = useAdminDataStore()
const toast = useToast()

// Languages
const languages = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'nl', label: 'NL' },
  { code: 'sq', label: 'SQ' }
]

// State - Use store for cached data
const events = computed(() => adminStore.events)
const artists = ref<Artist[]>([])
const packs = ref<any[]>([])
const isModalOpen = ref(false)
const editingEvent = ref<Event | null>(null)
const isSubmitting = ref(false)
const isInitialLoading = ref(!adminStore.eventsLoaded) // Show skeleton only on first load
const submitError = ref<string | null>(null)
const currentTitleLang = ref('fr')
const currentDescLang = ref('fr')

// Stats drawer
const isStatsDrawerOpen = ref(false)
const selectedEventForStats = ref<Event | null>(null)

function openStats(event: Event) {
  selectedEventForStats.value = event
  isStatsDrawerOpen.value = true
}

function closeStatsDrawer() {
  isStatsDrawerOpen.value = false
  selectedEventForStats.value = null
}

const formData = ref({
  title: '',
  title_translations: {
    fr: '',
    en: '',
    nl: '',
    sq: ''
  },
  category: '',
  date: '',
  time: '',
  location: '',
  city: '',
  address: '',
  capacity: 0,
  description: '',
  description_translations: {
    fr: '',
    en: '',
    nl: '',
    sq: ''
  },
  image_url: '',
  maps_embed_url: '',
  youtube_shorts_url: '',
  instagram_reels_url: '',
  status: 'upcoming',
  selectedArtists: [] as any[],
  selectedPacks: [] as any[]
})

// Computed
const sortedEvents = computed(() => {
  return [...events.value].sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    return dateB.getTime() - dateA.getTime()
  })
})

// Fetch data using store cache-first strategy
async function fetchEvents(force = false) {
  try {
    await adminStore.fetchEvents(force)
  } catch (error) {
    logger.error('Erreur:', error)
    toast.error('Impossible de charger les événements')
  }
}

async function fetchArtists() {
  try {
    const response = await fetch(buildApiUrl(API_ENDPOINTS.ARTISTS))
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des artistes')
    }
    artists.value = await response.json()
  } catch (error) {
    logger.error('Erreur:', error)
    toast.error('Impossible de charger les artistes')
  }
}

async function fetchPacks() {
  try {
    const response = await fetch(buildApiUrl(API_ENDPOINTS.PACKS))
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des packs')
    }
    packs.value = await response.json()
  } catch (error) {
    logger.error('Erreur:', error)
    toast.error('Impossible de charger les packs')
  }
}

// Methods
async function showCreateModal() {
  editingEvent.value = null
  resetForm()
  // ✅ Pas de refetch - utiliser les données en cache
  isModalOpen.value = true
}

async function editEvent(event: Event) {
  editingEvent.value = event
  // ✅ Pas de refetch - utiliser les données en cache

  formData.value = {
    title: event.title,
    title_translations: {
      fr: event.title_translations?.fr || '',
      en: event.title_translations?.en || '',
      nl: event.title_translations?.nl || '',
      sq: event.title_translations?.sq || ''
    },
    category: event.category,
    date: event.date,
    time: event.time,
    location: event.location,
    city: event.city,
    address: event.address || '',
    capacity: event.capacity || 0,
    description: event.description,
    description_translations: {
      fr: event.description_translations?.fr || '',
      en: event.description_translations?.en || '',
      nl: event.description_translations?.nl || '',
      sq: event.description_translations?.sq || ''
    },
    image_url: event.image_url || event.image || '',
    maps_embed_url: event.maps_embed_url || '',
    youtube_shorts_url: event.youtube_shorts_url || '',
    instagram_reels_url: event.instagram_reels_url || '',
    status: event.status || 'upcoming',
    selectedArtists: event.artists || [],
    selectedPacks: event.packs || []
  }
  isModalOpen.value = true
}

function viewEvent(event: Event) {
  // Open event detail page in new tab (use slug for SEO-friendly URLs)
  const url = `/events/${event.slug || event.id}`
  window.open(url, '_blank')
}

async function deleteEvent(event: Event) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return

  try {
    const response = await fetch(buildApiUrl(API_ENDPOINTS.EVENT_BY_ID(event.id)), {
      method: 'DELETE',
      credentials: 'include', // ✅ Send auth cookie
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Erreur lors de la suppression')
    }

    adminStore.invalidateEvents()
    await fetchEvents(true)
    toast.success('Événement supprimé avec succès')
  } catch (error) {
    logger.error('Erreur:', error)
    const message = error instanceof Error ? error.message : 'Erreur lors de la suppression'
    toast.error(message)
  }
}

async function handleSubmit() {
  isSubmitting.value = true
  submitError.value = null

  try {
    // Use FR as primary title/description, fallback to the first non-empty translation
    const primaryTitle = formData.value.title_translations.fr ||
                        formData.value.title_translations.en ||
                        formData.value.title_translations.nl ||
                        formData.value.title_translations.sq ||
                        formData.value.title

    const primaryDesc = formData.value.description_translations.fr ||
                       formData.value.description_translations.en ||
                       formData.value.description_translations.nl ||
                       formData.value.description_translations.sq ||
                       formData.value.description

    const data = {
      title: primaryTitle,
      title_translations: formData.value.title_translations,
      description: primaryDesc,
      description_translations: formData.value.description_translations,
      category: formData.value.category,
      date: formData.value.date,
      time: formData.value.time,
      location: formData.value.location,
      address: formData.value.address,
      city: formData.value.city,
      maps_embed_url: formData.value.maps_embed_url,
      image_url: formData.value.image_url,
      youtube_shorts_url: formData.value.youtube_shorts_url,
      instagram_reels_url: formData.value.instagram_reels_url,
      capacity: formData.value.capacity,
      status: formData.value.status,
      artists: formData.value.selectedArtists.map((a: any, index: number) => ({
        artist_id: a.id || a.artist_id,
        start_time: a.start_time || null,
        end_time: a.end_time || null,
        order: index
      })),
      packs: formData.value.selectedPacks.map((p: any) => ({
        pack_id: p.id || p.pack_id,
        is_soldout: p.is_soldout || false
      }))
    }

    const url = editingEvent.value
      ? buildApiUrl(API_ENDPOINTS.EVENT_BY_ID(editingEvent.value.id))
      : buildApiUrl(API_ENDPOINTS.EVENTS)

    const method = editingEvent.value ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      credentials: 'include', // ✅ Send auth cookie
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Erreur lors de la sauvegarde')
    }

    adminStore.invalidateEvents()
    await fetchEvents(true)
    toast.success(editingEvent.value ? 'Événement modifié avec succès' : 'Événement créé avec succès')
    closeModal()
  } catch (error) {
    logger.error('Erreur:', error)
    const message = error instanceof Error ? error.message : 'Une erreur est survenue'
    submitError.value = message
    toast.error(message)
  } finally {
    isSubmitting.value = false
  }
}

function closeModal() {
  isModalOpen.value = false
  resetForm()
}

function resetForm() {
  formData.value = {
    title: '',
    title_translations: {
      fr: '',
      en: '',
      nl: '',
      sq: ''
    },
    category: '',
    date: '',
    time: '',
    location: '',
    city: '',
    address: '',
    capacity: 0,
    description: '',
    description_translations: {
      fr: '',
      en: '',
      nl: '',
      sq: ''
    },
    image_url: '',
    maps_embed_url: '',
    youtube_shorts_url: '',
    instagram_reels_url: '',
    status: 'upcoming',
    selectedArtists: [],
    selectedPacks: []
  }
  currentTitleLang.value = 'fr'
  currentDescLang.value = 'fr'
}

function toggleArtist(artist: any) {
  const index = formData.value.selectedArtists.findIndex((a: any) =>
    (a.id || a.artist_id) === artist.id
  )
  if (index !== -1) {
    formData.value.selectedArtists.splice(index, 1)
  } else {
    // Check if artist already has time data (from editing existing event)
    const existingArtist = editingEvent.value?.artists?.find((ea: any) =>
      (ea.id || ea.artist_id) === artist.id
    )

    formData.value.selectedArtists.push({
      ...artist,
      start_time: existingArtist?.start_time || '',
      end_time: existingArtist?.end_time || ''
    })
  }
}

function togglePack(pack: any) {
  const index = formData.value.selectedPacks.findIndex((p: any) => p.id === pack.id)
  if (index !== -1) {
    formData.value.selectedPacks.splice(index, 1)
  } else {
    formData.value.selectedPacks.push({ ...pack, is_soldout: false })
  }
}

function isArtistSelected(artistId: string): boolean {
  return formData.value.selectedArtists.some((a: any) =>
    (a.id || a.artist_id) === artistId
  )
}

function isPackSelected(packId: string): boolean {
  return formData.value.selectedPacks.some((p: any) => p.id === packId)
}

// Fonction pour extraire automatiquement l'URL du src de l'iframe Google Maps
function handleMapsPaste(event: ClipboardEvent) {
  event.preventDefault()
  const pastedText = event.clipboardData?.getData('text') || ''

  // Regex pour extraire l'URL du src de l'iframe
  const iframeSrcRegex = /src="([^"]*google\.com\/maps\/embed[^"]*)"/i
  const match = pastedText.match(iframeSrcRegex)

  if (match && match[1]) {
    // URL trouvée dans l'iframe, l'utiliser
    formData.value.maps_embed_url = match[1]
  } else {
    // Vérifier si c'est déjà une URL Google Maps directe
    if (pastedText.includes('google.com/maps/embed')) {
      formData.value.maps_embed_url = pastedText.trim()
    } else {
      // Coller le texte tel quel
      formData.value.maps_embed_url = pastedText
    }
  }
}

// Initialize - charger toutes les données une seule fois
onMounted(async () => {
  // Load data with cache-first strategy
  await Promise.all([
    fetchEvents(),
    fetchArtists(),
    fetchPacks()
  ])
  isInitialLoading.value = false

  // Refresh in background if cache is stale
  adminStore.refreshInBackground('events')
})

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'concert': 'Concert',
    'festival': 'Festival',
    'party': 'Soirée',
    'wedding': 'Mariage'
  }
  return labels[category] || category
}

function isUpcoming(event: Event): boolean {
  return new Date(event.date) > new Date()
}

function getStatusLabel(event: Event): string {
  return isUpcoming(event) ? 'À venir' : 'Passé'
}
</script>

<style scoped>
@import '@/assets/styles/dashboard-modals.css';

/* ============================================
   EVENTS VIEW - Matching Dashboard Style
   ============================================ */
.events-view {
  max-width: 1400px;
  animation: pageIn 0.6s ease-out;
}

@keyframes pageIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ============================================
   PAGE HEADER - Premium Style
   ============================================ */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.page-header__left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.page-header__title {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-white);
  letter-spacing: -0.3px;
  margin: 0;
}

.page-header__count {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.45);
  margin: 0;
}

/* Create Button - Premium Style */
.create-btn {
  padding: 0.625rem 1.25rem;
  background: var(--color-primary);
  border: none;
  border-radius: 8px;
  color: var(--color-white);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.create-btn:hover {
  background: #c41e3a;
}

.create-btn:active {
  transform: scale(0.97);
}

.create-btn i {
  font-size: 0.65rem;
}

/* ============================================
   EVENTS GRID
   ============================================ */
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1rem;
}

/* ============================================
   EVENT CARD - Premium Professional Design
   ============================================ */
.event-card {
  display: flex;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.2s ease;
  min-height: 180px;
}

.event-card:hover {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
}

.event-card--past {
  opacity: 0.6;
}

.event-card--past:hover {
  opacity: 0.75;
}

/* Visual / Image Section */
.event-card__visual {
  width: 160px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
}

.event-card__visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  transition: transform 0.4s ease;
}

.event-card:hover .event-card__visual img {
  transform: scale(1.03);
}

.event-card__no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.02);
  color: rgba(255, 255, 255, 0.15);
  font-size: 1.75rem;
}

/* Content Section */
.event-card__content {
  flex: 1;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

/* Top Row */
.event-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.25rem;
}

.event-card__tag {
  padding: 0.2rem 0.5rem;
  background: rgba(var(--color-primary-rgb), 0.12);
  color: var(--color-primary);
  border-radius: 3px;
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.event-card__indicator {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.event-card__indicator i {
  font-size: 0.35rem;
}

.event-card__indicator--active {
  color: #22c55e;
}

.event-card__indicator--active i {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.event-card__indicator--past {
  color: rgba(255, 255, 255, 0.35);
}

/* Title */
.event-card__title {
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-white);
  margin: 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Details */
.event-card__details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.45);
}

.detail i {
  width: 12px;
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.25);
  flex-shrink: 0;
}

/* Stats Row */
.event-card__stats {
  display: flex;
  gap: 0.875rem;
  margin-top: auto;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.55);
}

.stat i {
  font-size: 0.6rem;
  color: var(--color-primary);
  opacity: 0.8;
}

/* Actions */
.event-card__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.btn-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
}

.btn-action i {
  font-size: 0.6rem;
}

.btn-action--primary {
  background: var(--color-primary);
  color: white;
}

.btn-action--primary:hover {
  background: #b91c3a;
}

.btn-action--secondary {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.btn-action--secondary:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
  color: white;
}

.btn-action--view {
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.5rem 0.75rem;
}

.btn-action--view:hover {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.3);
  color: #818cf8;
}

.btn-action--view i {
  font-size: 0.55rem;
}

.btn-action--icon {
  width: 30px;
  height: 30px;
  padding: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.3);
  margin-left: auto;
  border-radius: 6px;
}

.btn-action--icon:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.btn-action--stats {
  width: 30px;
  height: 30px;
  padding: 0;
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border-radius: 6px;
  flex-shrink: 0;
}

.btn-action--stats:hover {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

/* Empty State - Glass Effect */
.empty-state {
  text-align: center;
  padding: 5rem 2rem;
  background: rgba(15, 15, 15, 0.5);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-lg);
  margin: 2rem 0;
}

.empty-state__icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  color: rgba(var(--color-primary-rgb), 0.4);
  animation: pulse-subtle 3s ease-in-out infinite;
}

@keyframes pulse-subtle {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.05); }
}

.empty-state__title {
  font-family: var(--font-heading);
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: var(--color-white);
  letter-spacing: -0.3px;
}

.empty-state__text {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}

/* ============================================
   RESPONSIVE - UNIFIED
   ============================================ */
@media (max-width: 1024px) {
  .events-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
    margin-bottom: 1.75rem;
    padding-bottom: 0;
    border-bottom: none;
  }

  .page-header__left {
    gap: 0.5rem;
  }

  .page-header__title {
    font-size: 1.5rem;
    font-weight: 700;
  }

  .page-header__count {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.5);
  }

  /* Premium Create Button - Mobile */
  .create-btn {
    width: 100%;
    justify-content: center;
    padding: 1rem 1.5rem;
    font-size: 0.9rem;
    font-weight: 600;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--color-primary) 0%, #e01a3d 100%);
    box-shadow: 0 4px 15px rgba(220, 20, 60, 0.3);
    gap: 0.625rem;
  }

  .create-btn:hover {
    background: linear-gradient(135deg, #e01a3d 0%, var(--color-primary) 100%);
  }

  .create-btn:active {
    transform: scale(0.98);
    box-shadow: 0 2px 10px rgba(220, 20, 60, 0.2);
  }

  .create-btn i {
    font-size: 0.75rem;
  }

  .events-grid {
    grid-template-columns: 1fr;
    gap: 0.875rem;
  }

  .event-card {
    border-radius: 12px;
  }

  .event-card::before {
    border-radius: 12px;
  }

  .event-card:active {
    transform: scale(0.99);
  }

  .event-card:hover {
    transform: none;
  }

  .event-card__visual {
    width: 110px;
    min-height: 140px;
  }

  .event-card__content {
    padding: 0.875rem 1rem;
  }

  .event-card__title {
    font-size: 0.95rem;
  }

  /* Actions - Touch friendly */
  .event-card__actions {
    gap: 0.5rem;
    margin-top: 0.875rem;
    padding-top: 0.875rem;
  }

  .btn-action {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    min-height: 36px;
    border-radius: 8px;
  }

  .btn-action i {
    font-size: 0.65rem;
  }

  .btn-action--icon {
    width: 36px;
    height: 36px;
  }

  .empty-state {
    padding: 3.5rem 1.5rem;
    border-radius: 12px;
  }

  .empty-state__icon {
    font-size: 3rem;
  }

  .empty-state__title {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .page-header {
    gap: 1.25rem;
  }

  .page-header__title {
    font-size: 1.35rem;
  }

  .create-btn {
    padding: 0.875rem 1.25rem;
    font-size: 0.85rem;
    border-radius: 10px;
  }

  /* Stack card vertically */
  .event-card {
    flex-direction: column;
  }

  .event-card__visual {
    width: 100%;
    height: 180px;
    min-height: auto;
  }

  .event-card__content {
    padding: 1rem 1.125rem;
  }

  .event-card__top {
    margin-bottom: 0.375rem;
  }

  .event-card__tag {
    font-size: 0.6rem;
    padding: 0.25rem 0.5rem;
  }

  .event-card__title {
    font-size: 1.05rem;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    margin-bottom: 0.5rem;
  }

  .detail {
    font-size: 0.75rem;
  }

  .detail i {
    font-size: 0.65rem;
    width: 14px;
  }

  .stat {
    font-size: 0.7rem;
  }

  /* Buttons - Extra touch friendly on small screens */
  .event-card__actions {
    gap: 0.625rem;
  }

  .btn-action {
    flex: 1;
    padding: 0.625rem 0.75rem;
    font-size: 0.8rem;
    min-height: 40px;
    justify-content: center;
  }

  .btn-action i {
    font-size: 0.7rem;
  }

  .btn-action--icon {
    flex: 0;
    width: 40px;
    height: 40px;
  }

  .empty-state {
    padding: 3rem 1rem;
  }

  .empty-state__title {
    font-size: 1.1rem;
  }

  .empty-state__text {
    font-size: 0.85rem;
  }
}
</style>


