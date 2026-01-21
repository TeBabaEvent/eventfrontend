<template>
  <div class="artists-view">
    <!-- Page Header - Always visible -->
    <div class="page-header">
      <div class="page-header__left">
        <h1 class="page-header__title">Artistes</h1>
        <p class="page-header__count">{{ artists.length }} artiste(s)</p>
      </div>
      <button class="create-btn" @click="showCreateModal">
        <i class="fas fa-plus"></i>
        <span>Nouvel artiste</span>
      </button>
    </div>

    <!-- Skeleton Loading State -->
    <div v-if="isInitialLoading" class="artists-grid">
      <SkeletonCard v-for="n in 4" :key="n" variant="artist" />
    </div>

    <!-- Empty State -->
    <div v-else-if="artists.length === 0" class="empty-state">
      <div class="empty-state__icon">
        <i class="fas fa-microphone-slash"></i>
      </div>
      <h3 class="empty-state__title">Aucun artiste</h3>
      <p class="empty-state__text">Commencez par créer votre premier artiste</p>
    </div>

    <!-- Artists Grid -->
    <div v-else class="artists-grid">
      <article v-for="artist in artists" :key="artist.id" class="artist-card">
        <!-- Image -->
        <div class="artist-card__visual">
          <img v-if="artist.image_url" :src="getOptimizedImageUrl(artist.image_url)" :alt="artist.name">
          <div v-else class="artist-card__no-image">
            <i class="fas fa-user-music"></i>
          </div>
        </div>

        <!-- Content -->
        <div class="artist-card__content">
          <!-- Top Row: Role + Status -->
          <div class="artist-card__top">
            <span class="artist-card__tag">{{ artist.role || 'Artiste' }}</span>
            <span :class="['artist-card__indicator', artist.show_on_website !== false ? 'artist-card__indicator--active' : 'artist-card__indicator--hidden']">
              <i :class="artist.show_on_website !== false ? 'fas fa-circle' : 'fas fa-eye-slash'"></i>
              {{ artist.show_on_website !== false ? 'Visible' : 'Masqué' }}
            </span>
          </div>

          <!-- Name -->
          <h3 class="artist-card__name">{{ artist.name }}</h3>

          <!-- Details -->
          <div class="artist-card__details">
            <div class="detail" v-if="artist.description">
              <i class="fas fa-info-circle"></i>
              <span>{{ artist.description }}</span>
            </div>
            <div class="detail">
              <i class="fas fa-calendar-alt"></i>
              <span>{{ artist.events_count || 0 }} événement(s)</span>
            </div>
          </div>

          <!-- Stats Row -->
          <div class="artist-card__stats" v-if="artist.instagram || artist.badge">
            <a v-if="artist.instagram" :href="artist.instagram" target="_blank" class="stat stat--link">
              <i class="fab fa-instagram"></i>
              <span>Instagram</span>
            </a>
            <div v-if="artist.badge" class="stat stat--badge" :class="`stat--badge-${artist.badge}`">
              <i class="fas" :class="getBadgeIcon(artist.badge)"></i>
              <span>{{ getBadgeLabel(artist.badge) }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="artist-card__actions">
            <button class="btn-action btn-action--secondary" @click="editArtist(artist)">
              <i class="fas fa-pen"></i>
              Modifier
            </button>
            <button class="btn-action btn-action--icon" @click="deleteArtist(artist)" title="Supprimer">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </article>
    </div>

    <!-- Create/Edit Modal -->
    <Transition name="modal">
      <div v-if="isModalOpen" class="modal" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">{{ editingArtist ? 'Modifier l\'artiste' : 'Nouvel artiste' }}</h2>
            <button class="modal-close" @click="closeModal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="artist-form">
            <!-- Nom -->
            <div class="form-row form-row--single">
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-user"></i>
                  Nom
                  <span class="required">*</span>
                </label>
                <input v-model="formData.name" type="text" class="form-input" placeholder="Nom de l'artiste" required>
              </div>
            </div>

            <!-- Rôle multilingue -->
            <div class="form-row form-row--single">
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-microphone"></i>
                  Rôle
                </label>

                <!-- Language Tabs -->
                <div class="language-tabs">
                  <button
                    v-for="lang in languages"
                    :key="lang.code"
                    type="button"
                    :class="['language-tab', { active: currentRoleLang === lang.code }]"
                    @click="currentRoleLang = lang.code"
                  >
                    {{ lang.label }}
                  </button>
                </div>

                <!-- Role inputs for each language -->
                <div class="language-inputs">
                  <input
                    v-for="lang in languages"
                    :key="lang.code"
                    v-show="currentRoleLang === lang.code"
                    v-model="(formData.role_translations as any)[lang.code]"
                    type="text"
                    class="form-input"
                    :placeholder="`Rôle de l'artiste (${lang.label})`"
                  >
                </div>
              </div>
            </div>

            <!-- Description multilingue -->
            <div class="form-row form-row--single">
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-align-left"></i>
                  Description
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
                    :placeholder="`Description de l'artiste (${lang.label})`"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Image Upload -->
            <div class="form-row form-row--single">
              <div class="form-group">
                <ImageUploadField
                  ref="imageUploadRef"
                  label="Photo de l'artiste"
                  v-model="formData.image_url"
                  :current-image-url="editingArtist?.image_url"
                  :aspect-ratio="1"
                  :max-size-m-b="10"
                  entity-type="artist"
                  :entity-id="editingArtist?.id"
                  @upload-complete="(url) => formData.image_url = url"
                  @upload-error="(err) => toast.error(err)"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <i class="fab fa-instagram"></i>
                  Instagram
                </label>
                <input v-model="formData.instagram" type="url" class="form-input" placeholder="https://instagram.com/...">
              </div>
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-star"></i>
                  Badge
                </label>
                <select v-model="formData.badge" class="form-select">
                  <option value="">Aucun badge</option>
                  <option value="star">Star</option>
                  <option value="fire">Trending</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-calendar-check"></i>
                  Événements
                </label>
                <input v-model.number="formData.events_count" type="number" class="form-input" min="0" placeholder="0">
              </div>
            </div>

            <div class="form-row form-row--single">
              <label class="checkbox-label">
                <span class="checkbox-label__content">
                  <i class="fas fa-globe"></i>
                  Afficher sur le site web
                </span>
                <input v-model="formData.show_on_website" type="checkbox">
              </label>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn--outline" @click="closeModal">
                Annuler
              </button>
              <button type="submit" class="btn btn--primary" :disabled="isSubmitting">
                {{ isSubmitting ? 'Chargement...' : (editingArtist ? 'Enregistrer' : 'Créer') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { buildApiUrl, getAuthHeaders, API_ENDPOINTS } from '@/config/api'
import { getOptimizedImageUrl } from '@/utils/image'
import { useAdminDataStore } from '@/stores/adminData'
import { useToast } from '@/composables/useToast'
import { logger } from '@/services/logger'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'
import ImageUploadField from '@/components/ui/ImageUploadField.vue'
import type { Artist } from '@/types'

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
const artists = computed(() => adminStore.artists)
const isModalOpen = ref(false)
const editingArtist = ref<Artist | null>(null)
const isSubmitting = ref(false)
const isInitialLoading = ref(!adminStore.artistsLoaded)
const submitError = ref<string | null>(null)
const currentRoleLang = ref('fr')
const currentDescLang = ref('fr')

// Image upload ref
const imageUploadRef = ref<InstanceType<typeof ImageUploadField> | null>(null)

const formData = ref({
  name: '',
  role: '',
  role_translations: {
    fr: '',
    en: '',
    nl: '',
    sq: ''
  },
  description: '',
  description_translations: {
    fr: '',
    en: '',
    nl: '',
    sq: ''
  },
  image_url: '',
  instagram: '',
  badge: '',
  events_count: 0,
  show_on_website: true
})

// Fetch artists
async function fetchArtists(force = false) {
  try {
    await adminStore.fetchArtists(force)
  } catch (error) {
    logger.error('Erreur lors de la récupération des artistes:', error)
    toast.error('Impossible de charger les artistes')
  } finally {
    isInitialLoading.value = false
  }
}

// Create/Update artist
async function handleSubmit() {
  isSubmitting.value = true
  submitError.value = null

  try {
    // Utiliser FR comme rôle/description principal, fallback aux autres langues
    const primaryRole = formData.value.role_translations.fr ||
                       formData.value.role_translations.en ||
                       formData.value.role_translations.nl ||
                       formData.value.role_translations.sq ||
                       formData.value.role

    const primaryDesc = formData.value.description_translations.fr ||
                       formData.value.description_translations.en ||
                       formData.value.description_translations.nl ||
                       formData.value.description_translations.sq ||
                       formData.value.description

    // Don't include image_url in initial save if we have a new file to upload
    const hasNewImage = imageUploadRef.value?.hasFile

    const data = {
      ...formData.value,
      role: primaryRole,
      description: primaryDesc,
      image_url: hasNewImage ? editingArtist.value?.image_url : formData.value.image_url
    }

    const url = editingArtist.value
      ? buildApiUrl(API_ENDPOINTS.ARTIST_BY_ID(editingArtist.value.id))
      : buildApiUrl(API_ENDPOINTS.ARTISTS)

    const method = editingArtist.value ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      credentials: 'include',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Erreur lors de la sauvegarde')
    }

    const savedArtist = await response.json()
    const artistId = savedArtist.id || editingArtist.value?.id

    // Upload image if we have a new file
    if (hasNewImage && artistId && imageUploadRef.value) {
      // Pass the artistId to the upload function (needed for new artists)
      const imageUrl = await imageUploadRef.value.upload(artistId)
      if (imageUrl) {
        // Image uploaded successfully - the backend already updated the artist
        logger.log('Image uploaded:', imageUrl)
      }
    }

    adminStore.invalidateArtists()
    await fetchArtists(true)
    toast.success(editingArtist.value ? 'Artiste modifié avec succès' : 'Artiste créé avec succès')
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

// Edit artist
function editArtist(artist: Artist) {
  editingArtist.value = artist
  formData.value = {
    name: artist.name,
    role: artist.role || '',
    role_translations: {
      fr: artist.role_translations?.fr || '',
      en: artist.role_translations?.en || '',
      nl: artist.role_translations?.nl || '',
      sq: artist.role_translations?.sq || ''
    },
    description: artist.description || '',
    description_translations: {
      fr: artist.description_translations?.fr || '',
      en: artist.description_translations?.en || '',
      nl: artist.description_translations?.nl || '',
      sq: artist.description_translations?.sq || ''
    },
    image_url: artist.image_url || '',
    instagram: artist.instagram || '',
    badge: artist.badge || '',
    events_count: artist.events_count || 0,
    show_on_website: artist.show_on_website !== false
  }
  isModalOpen.value = true
}

// Delete artist
async function deleteArtist(artist: Artist) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet artiste ?')) return

  try {
    const response = await fetch(buildApiUrl(API_ENDPOINTS.ARTIST_BY_ID(artist.id)), {
      method: 'DELETE',
      credentials: 'include', // ✅ Send auth cookie
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Erreur lors de la suppression')
    }

    adminStore.invalidateArtists()
    await fetchArtists(true)
    toast.success('Artiste supprimé avec succès')
  } catch (error) {
    logger.error('Erreur:', error)
    const message = error instanceof Error ? error.message : 'Erreur lors de la suppression'
    toast.error(message)
  }
}

function showCreateModal() {
  editingArtist.value = null
  resetForm()
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  resetForm()
}

function resetForm() {
  formData.value = {
    name: '',
    role: '',
    role_translations: {
      fr: '',
      en: '',
      nl: '',
      sq: ''
    },
    description: '',
    description_translations: {
      fr: '',
      en: '',
      nl: '',
      sq: ''
    },
    image_url: '',
    instagram: '',
    badge: '',
    events_count: 0,
    show_on_website: true
  }
  currentRoleLang.value = 'fr'
  currentDescLang.value = 'fr'
  // Clear image upload state
  imageUploadRef.value?.clear()
}

function getBadgeIcon(badge: string): string {
  const icons: Record<string, string> = {
    star: 'fa-star',
    fire: 'fa-fire',
    premium: 'fa-gem'
  }
  return icons[badge] || 'fa-star'
}

function getBadgeLabel(badge: string): string {
  const labels: Record<string, string> = {
    star: 'Vedette',
    fire: 'Tendance',
    premium: 'Premium'
  }
  return labels[badge] || badge
}

onMounted(async () => {
  await fetchArtists()
  // Refresh in background if cache is stale
  adminStore.refreshInBackground('artists')
})
</script>

<style scoped>
@import '@/assets/styles/dashboard-modals.css';

.artists-view {
  max-width: 1400px;
  animation: pageIn 0.5s ease-out;
}

@keyframes pageIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ============================================
   PAGE HEADER - Matching Events Style
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

/* Artists Grid - Same as Events */
.artists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1rem;
}

/* ============================================
   ARTIST CARD - Matching Events Card Style
   ============================================ */
.artist-card {
  display: flex;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.2s ease;
  min-height: 180px;
}

.artist-card:hover {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
}

/* Visual / Image Section */
.artist-card__visual {
  width: 160px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
}

.artist-card__visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  transition: transform 0.4s ease;
}

.artist-card:hover .artist-card__visual img {
  transform: scale(1.03);
}

.artist-card__no-image {
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
.artist-card__content {
  flex: 1;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

/* Top Row */
.artist-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.25rem;
}

.artist-card__tag {
  padding: 0.2rem 0.5rem;
  background: rgba(var(--color-primary-rgb), 0.12);
  color: var(--color-primary);
  border-radius: 3px;
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.artist-card__indicator {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.artist-card__indicator i {
  font-size: 0.35rem;
}

.artist-card__indicator--active {
  color: #22c55e;
}

.artist-card__indicator--active i {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.artist-card__indicator--hidden {
  color: rgba(255, 255, 255, 0.35);
}

/* Name */
.artist-card__name {
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
.artist-card__details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.artist-card__details .detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.55);
}

.artist-card__details .detail i {
  width: 14px;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.35);
}

.artist-card__details .detail span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Stats Row */
.artist-card__stats {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: auto;
}

.artist-card__stats .stat {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.45);
}

.artist-card__stats .stat i {
  font-size: 0.65rem;
}

.artist-card__stats .stat--link {
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition: color 0.15s ease;
}

.artist-card__stats .stat--link:hover {
  color: var(--color-primary);
}

.artist-card__stats .stat--badge {
  padding: 0.15rem 0.4rem;
  border-radius: 3px;
  font-weight: 600;
}

.artist-card__stats .stat--badge-star {
  background: rgba(234, 179, 8, 0.15);
  color: #eab308;
}

.artist-card__stats .stat--badge-fire {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.artist-card__stats .stat--badge-premium {
  background: rgba(168, 85, 247, 0.15);
  color: #a855f7;
}

/* Actions - Matching Events Style */
.artist-card__actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 0.75rem;
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.btn-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.5rem 0.875rem;
  border-radius: 6px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-action i {
  font-size: 0.65rem;
}

.btn-action--secondary:hover {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.btn-action--icon {
  padding: 0.5rem;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.btn-action--icon:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
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
   MODAL - Uses shared dashboard-modals.css
   ============================================ */

/* All form styles are in dashboard-modals.css */

/* ============================================
   RESPONSIVE - Matching Events Style
   ============================================ */
@media (max-width: 1024px) {
  .artists-grid {
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

  .artists-grid {
    grid-template-columns: 1fr;
    gap: 0.875rem;
  }

  /* Horizontal layout on tablet */
  .artist-card {
    border-radius: 12px;
    min-height: 140px;
  }

  .artist-card__visual {
    width: 110px;
  }

  .artist-card__content {
    padding: 0.875rem 1rem;
  }

  .artist-card__name {
    font-size: 0.95rem;
  }

  .artist-card__tag {
    font-size: 0.55rem;
  }

  .artist-card__details .detail {
    font-size: 0.75rem;
  }

  /* Action buttons - Touch friendly */
  .artist-card__actions {
    gap: 0.5rem;
    padding-top: 0.625rem;
  }

  .btn-action {
    min-height: 36px;
    font-size: 0.75rem;
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

  /* Vertical layout on small screens */
  .artist-card {
    flex-direction: column;
    min-height: auto;
  }

  .artist-card__visual {
    width: 100%;
    height: 180px;
  }

  .artist-card__content {
    padding: 1rem;
  }

  .artist-card__name {
    font-size: 1.05rem;
  }

  .artist-card__tag {
    font-size: 0.6rem;
  }

  .artist-card__details .detail {
    font-size: 0.75rem;
  }

  .artist-card__stats .stat {
    font-size: 0.65rem;
  }

  .artist-card__actions {
    padding-top: 0.75rem;
    gap: 0.5rem;
  }

  .btn-action {
    min-height: 40px;
    font-size: 0.8rem;
    flex: 1;
  }

  .btn-action--icon {
    width: 40px;
    height: 40px;
    flex: 0;
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

