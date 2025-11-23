<template>
  <div class="artists-view">
    <!-- Loading State -->
    <LoadingSpinner v-if="isPageLoading" :message="'Chargement des artistes...'" />
    
    <!-- Content -->
    <template v-else>
      <!-- Page Header -->
      <div class="page-header">
      <h1 class="page-header__title">Artistes</h1>
      <button class="create-btn" @click="showCreateModal">
        <i class="fas fa-plus"></i>
        <span>Nouvel artiste</span>
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="artists.length === 0" class="empty-state">
      <div class="empty-state__icon">
        <i class="fas fa-microphone-slash"></i>
      </div>
      <h3 class="empty-state__title">Aucun artiste</h3>
      <p class="empty-state__text">Commencez par créer votre premier artiste</p>
    </div>

    <div v-else class="artists-grid">
      <div v-for="artist in artists" :key="artist.id" class="artist-card">
        <div class="artist-card__image">
          <img v-if="artist.image_url" :src="artist.image_url" :alt="artist.name">
          <div v-else class="artist-card__placeholder">
            <i class="fas fa-user-music"></i>
          </div>
          <div v-if="artist.badge" class="artist-card__badge" :class="`artist-card__badge--${artist.badge}`">
            <i class="fas" :class="getBadgeIcon(artist.badge)"></i>
          </div>
        </div>
        <div class="artist-card__content">
          <div class="artist-card__header">
            <h3 class="artist-card__name">{{ artist.name }}</h3>
            <div class="artist-card__status">
              <span 
                v-if="artist.show_on_website !== false" 
                class="status-badge status-badge--visible"
                title="Visible sur le site web"
              >
                <i class="fas fa-eye"></i>
              </span>
              <span 
                v-else 
                class="status-badge status-badge--hidden"
                title="Masqué du site web"
              >
                <i class="fas fa-eye-slash"></i>
              </span>
            </div>
          </div>
          <p class="artist-card__role">{{ artist.role || 'Artiste' }}</p>
          <p class="artist-card__desc">{{ artist.description || 'Aucune description' }}</p>
          <div class="artist-card__stats">
            <span><i class="fas fa-calendar"></i> {{ artist.events_count || 0 }} événements</span>
            <a v-if="artist.instagram" :href="artist.instagram" target="_blank" class="artist-card__instagram">
              <i class="fab fa-instagram"></i>
            </a>
          </div>
        </div>
        <div class="artist-card__actions">
          <button class="action-btn action-btn--edit" @click="editArtist(artist)">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn action-btn--delete" @click="deleteArtist(artist)">
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
            <h2 class="modal-title">{{ editingArtist ? 'Modifier l\'artiste' : 'Nouvel artiste' }}</h2>
            <button class="modal-close" @click="closeModal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-user"></i>
                  Nom
                  <span class="required">*</span>
                </label>
                <input v-model="formData.name" type="text" class="form-input" required>
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

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-image"></i>
                  URL de l'image
                </label>
                <input v-model="formData.image_url" type="url" class="form-input" placeholder="https://...">
              </div>
              <div class="form-group">
                <label class="form-label">
                  <i class="fab fa-instagram"></i>
                  Instagram
                </label>
                <input v-model="formData.instagram" type="url" class="form-input" placeholder="https://instagram.com/...">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-star"></i>
                  Badge
                </label>
                <select v-model="formData.badge" class="form-select">
                  <option value="">Aucun badge</option>
                  <option value="star">⭐ Star</option>
                  <option value="fire">🔥 Trending</option>
                  <option value="premium">💎 Premium</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-calendar-check"></i>
                  Nombre d'événements
                </label>
                <input v-model.number="formData.events_count" type="number" class="form-input" min="0">
              </div>
            </div>

            <div class="form-row form-row--single">
              <div class="form-group">
                <div class="checkbox-group">
                  <input 
                    v-model="formData.show_on_website" 
                    type="checkbox" 
                    id="show_on_website" 
                    class="form-checkbox"
                  >
                  <label for="show_on_website" class="checkbox-label">
                    <i class="fas fa-globe"></i>
                    Afficher sur le site web
                    <span class="checkbox-help">Si coché, cet artiste apparaîtra dans la section "Notre équipe" du site web</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn--outline" @click="closeModal">
                <span>Annuler</span>
              </button>
              <button type="submit" class="btn btn--primary" :disabled="isSubmitting">
                <span v-if="isSubmitting">Chargement...</span>
                <span v-else>{{ editingArtist ? 'Enregistrer' : 'Créer' }}</span>
                <i v-if="!isSubmitting" class="fas" :class="editingArtist ? 'fa-save' : 'fa-plus'"></i>
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
import { ref, onMounted } from 'vue'
import { buildApiUrl, getAuthHeaders, API_ENDPOINTS } from '@/config/api'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { logger } from '@/services/logger'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import type { Artist } from '@/types'

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
const artists = ref<Artist[]>([])
const isModalOpen = ref(false)
const editingArtist = ref<Artist | null>(null)
const isSubmitting = ref(false) // Renommé pour plus de clarté
const isPageLoading = ref(true)
const submitError = ref<string | null>(null)
const currentRoleLang = ref('fr')
const currentDescLang = ref('fr')

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
async function fetchArtists() {
  try {
    const response = await fetch(buildApiUrl(API_ENDPOINTS.ARTISTS))
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des artistes')
    }
    artists.value = await response.json()
  } catch (error) {
    logger.error('Erreur lors de la récupération des artistes:', error)
    toast.error('Impossible de charger les artistes')
  } finally {
    isPageLoading.value = false
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
    
    const data = {
      ...formData.value,
      role: primaryRole,
      description: primaryDesc
    }
    
    const url = editingArtist.value 
      ? buildApiUrl(API_ENDPOINTS.ARTIST_BY_ID(editingArtist.value.id))
      : buildApiUrl(API_ENDPOINTS.ARTISTS)
    
    const method = editingArtist.value ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: getAuthHeaders(authStore.token),
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Erreur lors de la sauvegarde')
    }
    
    await fetchArtists()
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
    role_translations: artist.role_translations || { fr: '', en: '', nl: '', sq: '' },
    description: artist.description || '',
    description_translations: artist.description_translations || { fr: '', en: '', nl: '', sq: '' },
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
      headers: getAuthHeaders(authStore.token)
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Erreur lors de la suppression')
    }
    
    await fetchArtists()
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
}

function getBadgeIcon(badge: string): string {
  const icons: Record<string, string> = {
    star: 'fa-star',
    fire: 'fa-fire',
    premium: 'fa-gem'
  }
  return icons[badge] || 'fa-star'
}

onMounted(() => {
  fetchArtists()
})
</script>

<style scoped>
@import '@/assets/styles/dashboard-modals.css';

.artists-view {
  max-width: 1400px;
}

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

.create-btn {
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

.create-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.create-btn:hover::before {
  left: 100%;
}

.create-btn:hover {
  background: linear-gradient(135deg, #c41e3a 0%, #9e0f2a 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(220, 20, 60, 0.45), 0 0 0 3px rgba(220, 20, 60, 0.1);
}

.create-btn:active {
  transform: translateY(0);
}

/* Artists Grid */
.artists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.artist-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.artist-card:hover {
  border-color: rgba(220, 20, 60, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.artist-card__image {
  position: relative;
  height: 180px;
  background: rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.artist-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.artist-card__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: rgba(255, 255, 255, 0.15);
}

.artist-card__badge {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  backdrop-filter: blur(8px);
}

.artist-card__badge--star {
  background: rgba(234, 179, 8, 0.95);
  color: white;
}

.artist-card__badge--fire {
  background: rgba(239, 68, 68, 0.95);
  color: white;
}

.artist-card__badge--premium {
  background: rgba(168, 85, 247, 0.95);
  color: white;
}

.artist-card__content {
  padding: 1.25rem;
}

.artist-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  gap: 0.75rem;
}

.artist-card__name {
  font-family: var(--font-heading);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-white);
  margin: 0;
  flex: 1;
  line-height: 1.3;
}

.artist-card__status {
  flex-shrink: 0;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 0.7rem;
  cursor: help;
}

.status-badge--visible {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.status-badge--hidden {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.artist-card__role {
  font-size: 0.75rem;
  color: rgba(220, 20, 60, 0.9);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 0.75rem;
}

.artist-card__desc {
  font-size: 0.825rem;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.5;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.artist-card__stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  padding-top: 0.85rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.artist-card__instagram {
  color: rgba(220, 20, 60, 0.8);
  font-size: 1.15rem;
  transition: all 0.15s ease;
}

.artist-card__instagram:hover {
  color: var(--color-primary);
  transform: none;
}

.artist-card__actions {
  display: flex;
  gap: 0.5rem;
  padding: 0.85rem 1.25rem;
  background: rgba(0, 0, 0, 0.15);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.action-btn {
  flex: 1;
  padding: 0.6rem;
  border-radius: 5px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 0.85rem;
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
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.modal-content {
  background: #1a1a1a;
  border: 1px solid rgba(220, 20, 60, 0.3);
  border-radius: 8px;
  padding: 2rem;
  max-width: 700px;
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
.form {
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

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--color-primary);
}

.form-textarea {
  min-height: 100px;
  resize: vertical;
}

/* Checkbox Styles */
.checkbox-group {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
}

.form-checkbox {
  width: 18px;
  height: 18px;
  accent-color: var(--color-primary);
  cursor: pointer;
  margin-top: 2px;
}

.checkbox-label {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  cursor: pointer;
}

.checkbox-label i {
  color: var(--color-primary);
  margin-right: 0.5rem;
}

.checkbox-help {
  font-size: 0.75rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.4;
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

.btn--primary:hover:not(:disabled) {
  background: #c41e3a;
}

.btn--primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn--outline {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.8);
}

.btn--outline:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--color-primary);
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

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (max-width: 1024px) {
  .artists-grid {
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

  .create-btn {
    padding: 0.65rem 1.25rem;
    font-size: 0.8rem;
    gap: 0.45rem;
    flex-shrink: 0;
  }

  .create-btn span {
    display: inline;
  }

  .artists-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .artist-card__image {
    height: 160px;
  }

  .artist-card__content {
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

  .create-btn {
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

  .artist-card__image {
    height: 150px;
  }

  .artist-card__content {
    padding: 1rem;
  }

  .artist-card__name {
    font-size: 1.05rem;
  }

  .artist-card__role {
    font-size: 0.7rem;
  }

  .artist-card__desc {
    font-size: 0.8rem;
  }

  .artist-card__actions {
    padding: 0.75rem 1rem;
  }

  .action-btn {
    padding: 0.55rem;
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

