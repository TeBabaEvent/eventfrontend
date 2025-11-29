<template>
  <div class="events-view">
    <!-- Loading State -->
    <LoadingSpinner v-if="isPageLoading" :message="'Chargement des événements...'" />

    <!-- Content -->
    <template v-else>
      <!-- Page Header -->
      <div class="page-header">
      <h1 class="page-header__title">Événements</h1>
      <button class="create-event-btn" @click="showCreateModal">
        <i class="fas fa-plus"></i>
        <span>Nouvel événement</span>
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="events.length === 0" class="empty-state">
      <div class="empty-state__icon">
        <i class="fas fa-calendar-times"></i>
      </div>
      <h3 class="empty-state__title">Aucun événement</h3>
      <p class="empty-state__text">Commencez par créer votre premier événement</p>
    </div>

    <!-- Events Grid -->
    <div v-else class="events-grid">
        <div v-for="event in sortedEvents" :key="event.id" class="event-card">
          <!-- Event Image -->
          <div class="event-card__image">
            <img v-if="event.image_url" :src="event.image_url" :alt="event.title">
            <div v-else class="event-card__placeholder">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <span :class="['event-card__status', getStatusClass(event)]">
              {{ getStatusLabel(event) }}
            </span>
            <span class="event-card__category">{{ getCategoryLabel(event.category) }}</span>
          </div>

          <!-- Event Content -->
          <div class="event-card__content">
            <h3 class="event-card__title">{{ event.title }}</h3>

            <div class="event-card__info">
              <div class="info-item">
                <i class="fas fa-calendar"></i>
                <span>{{ formatDate(event.date) }} à {{ event.time }}</span>
              </div>
              <div class="info-item">
                <i class="fas fa-map-marker-alt"></i>
                <span>{{ event.location }}, {{ event.city }}</span>
              </div>
              <div class="info-item" v-if="event.packs && event.packs.length > 0">
                <i class="fas fa-ticket-alt"></i>
                <span>À partir de {{ Math.min(...event.packs.map((p: any) => p.price)) }}€</span>
              </div>
              <div class="info-item" v-if="event.artists && event.artists.length > 0">
                <i class="fas fa-user-music"></i>
                <span>{{ event.artists.length }} artiste(s)</span>
              </div>
            </div>
          </div>

          <!-- Event Actions -->
          <div class="event-card__actions">
            <button class="action-btn action-btn--view" @click="viewEvent(event)" title="Voir">
              <i class="fas fa-eye"></i>
            </button>
            <button class="action-btn action-btn--edit" @click="editEvent(event)" title="Modifier">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn action-btn--delete" @click="deleteEvent(event)" title="Supprimer">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>

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

            <!-- Category -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-tag"></i>
                  Catégorie
                  <span class="required">*</span>
                </label>
                <select v-model="formData.category" class="form-select" required>
                  <option value="">Sélectionner une catégorie</option>
                  <option value="concert">Concert</option>
                  <option value="festival">Festival</option>
                  <option value="party">Soirée</option>
                  <option value="wedding">Mariage</option>
                </select>
              </div>
            </div>

            <!-- Date & Time -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-calendar"></i>
                  Date
                  <span class="required">*</span>
                </label>
                <input v-model="formData.date" type="date" class="form-input" required>
              </div>
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-clock"></i>
                  Heure
                  <span class="required">*</span>
                </label>
                <input v-model="formData.time" type="time" class="form-input" required>
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
                <input v-model="formData.location" type="text" class="form-input" required>
              </div>
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-city"></i>
                  Ville
                  <span class="required">*</span>
                </label>
                <input v-model="formData.city" type="text" class="form-input" required>
              </div>
            </div>

            <!-- Capacity and Address -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-users"></i>
                  Capacité
                </label>
                <input v-model.number="formData.capacity" type="number" class="form-input" min="0">
              </div>
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-map-marker-alt"></i>
                  Adresse complète
                </label>
                <input v-model="formData.address" type="text" class="form-input">
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
                <h4 class="schedule-title">Horaires de passage</h4>
                <div v-for="(selectedArtist, index) in formData.selectedArtists" :key="selectedArtist.id || selectedArtist.artist_id" class="schedule-item">
                  <div class="schedule-item__info">
                    <span class="schedule-item__name">{{ selectedArtist.name }}</span>
                    <span class="schedule-item__role">{{ selectedArtist.role }}</span>
                  </div>
                  <div class="schedule-item__times">
                    <div class="time-input-group">
                      <label>Début</label>
                      <input
                        v-model="formData.selectedArtists[index].start_time"
                        type="time"
                        class="form-input form-input--small"
                        placeholder="21:00"
                      >
                    </div>
                    <span class="time-separator">-</span>
                    <div class="time-input-group">
                      <label>Fin</label>
                      <input
                        v-model="formData.selectedArtists[index].end_time"
                        type="time"
                        class="form-input form-input--small"
                        placeholder="23:00"
                      >
                    </div>
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

            <!-- Options -->
            <div class="form-row">
              <div class="form-group">
                <label class="checkbox-label">
                  <input v-model="formData.featured" type="checkbox">
                  <span>Événement à la une</span>
                </label>
              </div>
            </div>

            <!-- Actions -->
            <div class="form-actions">
              <button type="button" class="btn btn--outline btn--large" @click="closeModal">
                <span>Annuler</span>
                <i class="fas fa-times"></i>
              </button>
              <button type="submit" class="btn btn--primary btn--large">
                <span>{{ editingEvent ? 'Enregistrer' : 'Créer' }}</span>
                <i class="fas" :class="editingEvent ? 'fa-save' : 'fa-plus'"></i>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
    </template>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ref, computed, onMounted } from 'vue'
import { buildApiUrl, getAuthHeaders, API_ENDPOINTS } from '@/config/api'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { logger } from '@/services/logger'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import type { Event, Artist } from '@/types'

const authStore = useAuthStore()
const toast = useToast()

// Languages
const languages = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'nl', label: 'NL' },
  { code: 'sq', label: 'SQ' }
]

// State
const events = ref<Event[]>([])
const artists = ref<Artist[]>([])
const packs = ref<any[]>([])
const isModalOpen = ref(false)
const editingEvent = ref<Event | null>(null)
const isSubmitting = ref(false) // Renommé pour plus de clarté
const isPageLoading = ref(true)
const submitError = ref<string | null>(null)
const currentTitleLang = ref('fr')
const currentDescLang = ref('fr')

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
  featured: false,
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

// Fetch data
async function fetchEvents() {
  try {
    const response = await fetch(buildApiUrl(API_ENDPOINTS.EVENTS))
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des événements')
    }
    events.value = await response.json()
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
    featured: event.featured || false,
    status: event.status || 'upcoming',
    selectedArtists: event.artists || [],
    selectedPacks: event.packs || []
  }
  isModalOpen.value = true
}

function viewEvent(event: Event) {
  alert(`Événement: ${event.title}\nDate: ${event.date}\nLieu: ${event.location}, ${event.city}`)
}

async function deleteEvent(event: Event) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return

  try {
    const response = await fetch(buildApiUrl(API_ENDPOINTS.EVENT_BY_ID(event.id)), {
      method: 'DELETE',
      headers: getAuthHeaders(authStore.token)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Erreur lors de la suppression')
    }

    await fetchEvents()
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
      capacity: formData.value.capacity,
      featured: formData.value.featured,
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
      headers: getAuthHeaders(authStore.token),
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Erreur lors de la sauvegarde')
    }

    await fetchEvents()
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
    featured: false,
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
  await Promise.all([
    fetchEvents(),
    fetchArtists(),
    fetchPacks()
  ])
  isPageLoading.value = false
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

function getStatusClass(event: Event): string {
  const eventDate = new Date(event.date)
  const now = new Date()
  return eventDate > now ? 'event-status--upcoming' : 'event-status--past'
}

function getStatusLabel(event: Event): string {
  const eventDate = new Date(event.date)
  const now = new Date()
  return eventDate > now ? 'À venir' : 'Passé'
}
</script>

<style scoped>
@import '@/assets/styles/dashboard-modals.css';

/* Page Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2.5rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid rgba(220, 20, 60, 0.2);
}

.page-header__title {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-white);
  letter-spacing: -0.5px;
}

.create-event-btn {
  padding: 0.8rem 1.75rem;
  background: linear-gradient(135deg, #dc143c 0%, #b01030 100%);
  border: none;
  border-radius: 8px;
  color: var(--color-white);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 0.6rem;
  box-shadow: 0 2px 10px rgba(220, 20, 60, 0.35), 0 0 0 0 rgba(220, 20, 60, 0.5);
  position: relative;
  overflow: hidden;
}

.create-event-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.create-event-btn:hover::before {
  left: 100%;
}

.create-event-btn:hover {
  background: linear-gradient(135deg, #c41e3a 0%, #9e0f2a 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(220, 20, 60, 0.45), 0 0 0 3px rgba(220, 20, 60, 0.1);
}

.create-event-btn:active {
  transform: translateY(0);
}

/* Events Grid */
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
}

/* Event Card */
.event-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.event-card:hover {
  transform: translateY(-2px);
  border-color: rgba(220, 20, 60, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

/* Event Image */
.event-card__image {
  position: relative;
  height: 180px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
}

.event-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: none;
}

.event-card:hover .event-card__image img {
  transform: none;
}

.event-card__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: rgba(255, 255, 255, 0.15);
  background: rgba(0, 0, 0, 0.3);
}

.event-card__status {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 0.4rem 0.75rem;
  border-radius: 5px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  backdrop-filter: blur(8px);
  z-index: 2;
  border: none;
}

.event-card__status.event-status--upcoming {
  background: rgba(16, 185, 129, 0.95);
  color: white;
}

.event-card__status.event-status--past {
  background: rgba(107, 114, 128, 0.95);
  color: white;
}

.event-card__category {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 0.4rem 0.75rem;
  background: rgba(220, 20, 60, 0.95);
  color: white;
  border-radius: 5px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  backdrop-filter: blur(8px);
  z-index: 2;
  border: none;
}

/* Event Content */
.event-card__content {
  padding: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.event-card__title {
  font-family: var(--font-heading);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-white);
  margin-bottom: 1rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-card__info {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
}

.info-item i {
  color: rgba(220, 20, 60, 0.8);
  font-size: 0.85rem;
  width: 14px;
  flex-shrink: 0;
  margin-top: 2px;
}

/* Event Actions */
.event-card__actions {
  display: flex;
  gap: 0.5rem;
  padding: 0.85rem 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(0, 0, 0, 0.15);
}

.action-btn {
  flex: 1;
  height: 34px;
  border-radius: 5px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn:hover {
  color: var(--color-white);
  transform: none;
}

.action-btn--view:hover {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.4);
  color: #10b981;
}

.action-btn--edit:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.4);
  color: #3b82f6;
}

.action-btn--delete:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.4);
  color: #ef4444;
}

/* Responsive Grid */
@media (max-width: 1200px) {
  .events-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 5rem 2rem;
  color: rgba(255, 255, 255, 0.6);
}

.empty-state__icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  color: rgba(220, 20, 60, 0.4);
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

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow-y: auto;
}

.modal-content {
  background: #1a1a1a;
  border: 1px solid rgba(220, 20, 60, 0.3);
  border-radius: 8px;
  padding: 2rem;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(220, 20, 60, 0.2);
}

.modal-title {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-white);
}

.modal-close {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: rgba(231, 76, 60, 0.2);
  border-color: #e74c3c;
  color: #e74c3c;
}

/* Form */
.event-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-row--single {
  grid-template-columns: 1fr;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-label i {
  color: var(--color-primary);
  width: 16px;
}

.required {
  color: var(--color-primary);
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: var(--color-white);
  font-family: var(--font-body);
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s ease;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--color-primary);
}

.form-textarea {
  min-height: 120px;
  resize: vertical;
}

.form-select {
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(220, 20, 60, 0.2);
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
}

.btn--primary {
  background: var(--color-primary);
  color: var(--color-white);
}

.btn--primary:hover {
  background: #c41e3a;
}

.btn--outline {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.8);
}

.btn--outline:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--color-primary);
  color: var(--color-white);
}

.btn--large {
  padding: 0.875rem 1.75rem;
}

/* Form Section */
.form-section {
  margin: 1.5rem 0;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(220, 20, 60, 0.15);
  border-radius: 8px;
}

.form-section-title {
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-white);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(220, 20, 60, 0.2);
}

.form-section-title i {
  color: var(--color-primary);
}

.form-empty {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  text-align: center;
  padding: 1rem;
}

.link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
}

.link:hover {
  text-decoration: underline;
}

/* Language Tabs */
.language-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding: 0.25rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  width: fit-content;
}

.language-tab {
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.language-tab:hover {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
}

.language-tab.active {
  background: var(--color-primary);
  color: var(--color-white);
  box-shadow: 0 2px 8px rgba(220, 20, 60, 0.3);
}

.language-inputs {
  position: relative;
}

/* Selectors */
.artists-selector,
.packs-selector {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
}

.selector-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.selector-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(220, 20, 60, 0.3);
}

.selector-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  cursor: pointer;
}

.selector-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.selector-name {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-white);
}

.selector-role,
.selector-price {
  font-size: 0.75rem;
  color: var(--color-primary);
}

/* Selected Artists Schedule */
.selected-artists-schedule {
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
}

.schedule-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1rem;
}

.schedule-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  margin-bottom: 0.75rem;
}

.schedule-item:last-child {
  margin-bottom: 0;
}

.schedule-item__info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.schedule-item__name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-white);
}

.schedule-item__role {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

.schedule-item__times {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.time-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.time-input-group label {
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.time-separator {
  color: rgba(255, 255, 255, 0.4);
  font-size: 1rem;
  padding-top: 1rem;
}

.form-input--small {
  width: 90px;
  padding: 0.5rem;
  font-size: 0.875rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
}

/* Responsive */
@media (max-width: 1024px) {
  .events-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.75rem;
    padding-bottom: 0.875rem;
    gap: 1rem;
  }

  .page-header__title {
    font-size: 1.5rem;
    flex: 1;
  }

  .create-event-btn {
    padding: 0.65rem 1.25rem;
    font-size: 0.8rem;
    gap: 0.45rem;
    flex-shrink: 0;
  }

  .create-event-btn span {
    display: inline;
  }

  .events-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .event-card__image {
    height: 160px;
  }

  .event-card__content {
    padding: 1.125rem;
  }

  .empty-state {
    padding: 4rem 1.5rem;
  }

  .empty-state__icon {
    font-size: 3.5rem;
  }

  .empty-state__title {
    font-size: 1.25rem;
  }
}

@media (max-width: 580px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.875rem;
    margin-bottom: 1.5rem;
  }

  .page-header__title {
    font-size: 1.4rem;
  }

  .create-event-btn {
    width: 100%;
    justify-content: center;
    padding: 0.75rem 1.5rem;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding-bottom: 0.75rem;
  }

  .page-header__title {
    font-size: 1.3rem;
  }

  .event-card__image {
    height: 150px;
  }

  .event-card__content {
    padding: 1rem;
  }

  .event-card__title {
    font-size: 1rem;
  }

  .event-card__actions {
    padding: 0.75rem 1rem;
  }

  .action-btn {
    height: 32px;
    font-size: 0.8rem;
  }

  .empty-state {
    padding: 3rem 1rem;
  }

  .empty-state__icon {
    font-size: 3rem;
  }

  .empty-state__title {
    font-size: 1.15rem;
  }

  .empty-state__text {
    font-size: 0.85rem;
  }
}
</style>

