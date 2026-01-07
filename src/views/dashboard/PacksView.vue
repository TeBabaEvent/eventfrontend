<template>
  <div class="packs-view">
    <!-- Page Header - Always visible -->
    <div class="page-header">
      <div class="page-header__left">
        <h1 class="page-header__title">Packs</h1>
        <p class="page-header__count">{{ packs.length }} pack(s)</p>
      </div>
      <button class="create-btn" @click="showCreateModal">
        <i class="fas fa-plus"></i>
        <span>Nouveau pack</span>
      </button>
    </div>

    <!-- Skeleton Loading State -->
    <div v-if="isInitialLoading" class="packs-grid">
      <SkeletonCard v-for="n in 4" :key="n" variant="pack" />
    </div>

    <!-- Empty State -->
    <div v-else-if="packs.length === 0" class="empty-state">
      <div class="empty-state__icon">
        <i class="fas fa-ticket-alt"></i>
      </div>
      <h3 class="empty-state__title">Aucun pack</h3>
      <p class="empty-state__text">Créez vos premiers packs de réservation</p>
    </div>

    <!-- Packs Grid -->
    <div v-else class="packs-grid">
      <article v-for="pack in packs" :key="pack.id" class="pack-card">
        <!-- Visual / Type Badge -->
        <div class="pack-card__visual" :class="`pack-card__visual--${pack.type}`">
          <i :class="getTypeIcon(pack.type)"></i>
          <span class="pack-card__type">{{ getTypeLabel(pack.type) }}</span>
        </div>

        <!-- Content -->
        <div class="pack-card__content">
          <!-- Top Row: Type Tag + Status -->
          <div class="pack-card__top">
            <span class="pack-card__price-tag">{{ pack.price }}{{ pack.currency }}<span v-if="pack.unit"> {{ pack.unit }}</span></span>
            <span :class="['pack-card__indicator', pack.is_active ? 'pack-card__indicator--active' : 'pack-card__indicator--inactive']">
              <i :class="pack.is_active ? 'fas fa-circle' : 'fas fa-circle-xmark'"></i>
              {{ pack.is_active ? 'Actif' : 'Inactif' }}
            </span>
          </div>

          <!-- Name -->
          <h3 class="pack-card__name">{{ pack.name }}</h3>

          <!-- Details -->
          <div class="pack-card__details">
            <div class="detail" v-if="pack.description">
              <i class="fas fa-info-circle"></i>
              <span>{{ pack.description }}</span>
            </div>
            <div class="detail" v-if="pack.features && pack.features.length > 0">
              <i class="fas fa-check-circle"></i>
              <span>{{ pack.features.length }} caractéristique(s)</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="pack-card__actions">
            <button class="btn-action btn-action--secondary" @click="editPack(pack)">
              <i class="fas fa-pen"></i>
              Modifier
            </button>
            <button class="btn-action btn-action--icon" @click="deletePack(pack)" title="Supprimer">
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
            <h2 class="modal-title">{{ editingPack ? 'Modifier le pack' : 'Nouveau pack' }}</h2>
            <button class="modal-close" @click="closeModal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="form">
            <!-- Nom du pack multilingue -->
            <div class="form-row form-row--single">
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-tag"></i>
                  Nom du pack
                  <span class="required">*</span>
                </label>

                <!-- Language Tabs -->
                <div class="language-tabs">
                  <button
                    v-for="lang in languages"
                    :key="lang.code"
                    type="button"
                    :class="['language-tab', { active: currentNameLang === lang.code }]"
                    @click="currentNameLang = lang.code"
                  >
                    {{ lang.label }}
                  </button>
                </div>

                <!-- Name inputs for each language -->
                <div class="language-inputs">
                  <input
                    v-for="lang in languages"
                    :key="lang.code"
                    v-show="currentNameLang === lang.code"
                    v-model="(formData.name_translations as any)[lang.code]"
                    type="text"
                    class="form-input"
                    :placeholder="`Nom du pack (${lang.label})`"
                    :required="lang.code === 'fr'"
                  >
                </div>
              </div>
            </div>

            <!-- Type & Prix -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-layer-group"></i>
                  Type
                  <span class="required">*</span>
                </label>
                <select v-model="formData.type" class="form-select" required>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-euro-sign"></i>
                  Prix
                  <span class="required">*</span>
                </label>
                <input v-model.number="formData.price" type="number" class="form-input" min="0" step="0.01" placeholder="0.00" required>
              </div>
            </div>

            <!-- Unité -->
            <div class="form-row form-row--single">
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-tag"></i>
                  Unité de prix
                </label>
                <input v-model="formData.unit" type="text" class="form-input" placeholder="Ex: / personne, / table, / groupe...">
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
                    :placeholder="`Description du pack (${lang.label})`"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Caractéristiques multilingues -->
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-list-check"></i>
                Caractéristiques
              </label>

              <!-- Language Tabs -->
              <div class="language-tabs">
                <button
                  v-for="lang in languages"
                  :key="lang.code"
                  type="button"
                  :class="['language-tab', { active: currentFeaturesLang === lang.code }]"
                  @click="currentFeaturesLang = lang.code"
                >
                  {{ lang.label }}
                </button>
              </div>

              <!-- Features for each language -->
              <div class="language-inputs">
                <div v-for="lang in languages" :key="lang.code" v-show="currentFeaturesLang === lang.code">
                  <div class="features-list">
                    <div v-for="(feature, idx) in (formData.features_translations as any)[lang.code]" :key="idx" class="feature-input">
                      <input
                        v-model="(formData.features_translations as any)[lang.code][idx]"
                        type="text"
                        class="form-input"
                        :placeholder="`Caractéristique ${idx + 1} (${lang.label})`"
                      >
                      <button type="button" class="remove-feature-btn" @click="removeFeatureTranslation(lang.code, idx)">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                  <button type="button" class="add-feature-btn" @click="addFeatureTranslation(lang.code)">
                    <i class="fas fa-plus"></i>
                    <span>Ajouter une caractéristique ({{ lang.label }})</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="form-row form-row--single">
              <label class="checkbox-label">
                <span class="checkbox-label__content">
                  <i class="fas fa-toggle-on"></i>
                  Pack actif
                </span>
                <input v-model="formData.is_active" type="checkbox">
              </label>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn--outline" @click="closeModal">
                Annuler
              </button>
              <button type="submit" class="btn btn--primary" :disabled="isSubmitting">
                {{ isSubmitting ? 'Chargement...' : (editingPack ? 'Enregistrer' : 'Créer') }}
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
import type { Pack } from '@/types'

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
const packs = computed(() => adminStore.packs)
const isModalOpen = ref(false)
const editingPack = ref<Pack | null>(null)
const isSubmitting = ref(false)
const isInitialLoading = ref(!adminStore.packsLoaded)
const submitError = ref<string | null>(null)
const currentNameLang = ref('fr')
const currentDescLang = ref('fr')
const currentFeaturesLang = ref('fr')

const formData = ref({
  name: '',
  name_translations: {
    fr: '',
    en: '',
    nl: '',
    sq: ''
  },
  type: 'standard',
  description: '',
  description_translations: {
    fr: '',
    en: '',
    nl: '',
    sq: ''
  },
  price: 0,
  currency: '€',
  unit: '',
  features: [''],
  features_translations: {
    fr: [''],
    en: [''],
    nl: [''],
    sq: ['']
  },
  is_active: true
})

// Fetch packs
async function fetchPacks(force = false) {
  try {
    await adminStore.fetchPacks(force)
  } catch (error) {
    logger.error('Erreur lors de la récupération des packs:', error)
    toast.error('Impossible de charger les packs')
  } finally {
    isInitialLoading.value = false
  }
}

// Create/Update pack
async function handleSubmit() {
  isSubmitting.value = true
  submitError.value = null

  try {
    // Filtrer les features vides
    const cleanedFeatures = formData.value.features.filter(f => f.trim())

    // Nettoyer les features_translations
    const cleanedFeaturesTranslations: any = {}
    Object.keys(formData.value.features_translations).forEach(lang => {
      const langFeatures = formData.value.features_translations[lang as keyof typeof formData.value.features_translations]
      cleanedFeaturesTranslations[lang] = langFeatures.filter((f: string) => f.trim())
    })

    // Utiliser FR comme titre/description principal, fallback aux autres langues
    const primaryName = formData.value.name_translations.fr ||
                       formData.value.name_translations.en ||
                       formData.value.name_translations.nl ||
                       formData.value.name_translations.sq ||
                       formData.value.name

    const primaryDesc = formData.value.description_translations.fr ||
                       formData.value.description_translations.en ||
                       formData.value.description_translations.nl ||
                       formData.value.description_translations.sq ||
                       formData.value.description

    const data = {
      ...formData.value,
      name: primaryName,
      description: primaryDesc,
      features: cleanedFeatures.length > 0 ? cleanedFeatures : null,
      features_translations: cleanedFeaturesTranslations
    }

    const url = editingPack.value
      ? buildApiUrl(API_ENDPOINTS.PACK_BY_ID(editingPack.value.id))
      : buildApiUrl(API_ENDPOINTS.PACKS)

    const method = editingPack.value ? 'PUT' : 'POST'

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

    adminStore.invalidatePacks()
    await fetchPacks(true)
    toast.success(editingPack.value ? 'Pack modifié avec succès' : 'Pack créé avec succès')
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

// Edit pack
function editPack(pack: Pack) {
  editingPack.value = pack
  formData.value = {
    name: pack.name,
    name_translations: {
      fr: pack.name_translations?.fr || '',
      en: pack.name_translations?.en || '',
      nl: pack.name_translations?.nl || '',
      sq: pack.name_translations?.sq || ''
    },
    type: pack.type,
    description: pack.description || '',
    description_translations: {
      fr: pack.description_translations?.fr || '',
      en: pack.description_translations?.en || '',
      nl: pack.description_translations?.nl || '',
      sq: pack.description_translations?.sq || ''
    },
    price: pack.price,
    currency: pack.currency || '€',
    unit: pack.unit || '',
    features: pack.features && pack.features.length > 0 ? [...pack.features] : [''],
    features_translations: {
      fr: pack.features_translations?.fr || [''],
      en: pack.features_translations?.en || [''],
      nl: pack.features_translations?.nl || [''],
      sq: pack.features_translations?.sq || ['']
    },
    is_active: pack.is_active
  }
  isModalOpen.value = true
}

// Delete pack
async function deletePack(pack: Pack) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce pack ?')) return

  try {
    const response = await fetch(buildApiUrl(API_ENDPOINTS.PACK_BY_ID(pack.id)), {
      method: 'DELETE',
      credentials: 'include', // ✅ Send auth cookie
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Erreur lors de la suppression')
    }

    adminStore.invalidatePacks()
    await fetchPacks(true)
    toast.success('Pack supprimé avec succès')
  } catch (error) {
    logger.error('Erreur:', error)
    const message = error instanceof Error ? error.message : 'Erreur lors de la suppression'
    toast.error(message)
  }
}

function showCreateModal() {
  editingPack.value = null
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
    name_translations: {
      fr: '',
      en: '',
      nl: '',
      sq: ''
    },
    type: 'standard',
    description: '',
    description_translations: {
      fr: '',
      en: '',
      nl: '',
      sq: ''
    },
    price: 0,
    currency: '€',
    unit: '',
    features: [''],
    features_translations: {
      fr: [''],
      en: [''],
      nl: [''],
      sq: ['']
    },
    is_active: true
  }
  currentNameLang.value = 'fr'
  currentDescLang.value = 'fr'
  currentFeaturesLang.value = 'fr'
}

// function addFeature() {
//   formData.value.features.push('')
// }

// function removeFeature(idx: number) {
//   formData.value.features.splice(idx, 1)
//   if (formData.value.features.length === 0) {
//     formData.value.features = ['']
//   }
// }

function addFeatureTranslation(lang: string) {
  const langKey = lang as keyof typeof formData.value.features_translations
  formData.value.features_translations[langKey].push('')
}

function removeFeatureTranslation(lang: string, idx: number) {
  const langKey = lang as keyof typeof formData.value.features_translations
  formData.value.features_translations[langKey].splice(idx, 1)
  if (formData.value.features_translations[langKey].length === 0) {
    formData.value.features_translations[langKey] = ['']
  }
}

function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    standard: 'fas fa-ticket-alt',
    premium: 'fas fa-gem',
    vip: 'fas fa-crown'
  }
  return icons[type] || 'fas fa-ticket-alt'
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    standard: 'Standard',
    premium: 'Premium',
    vip: 'VIP'
  }
  return labels[type] || type
}

onMounted(async () => {
  await fetchPacks()
  // Refresh in background if cache is stale
  adminStore.refreshInBackground('packs')
})
</script>

<style scoped>
@import '@/assets/styles/dashboard-modals.css';

.packs-view {
  max-width: 1400px;
}

/* ============================================
   PAGE HEADER - Matching Events/Artists Style
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
}

.page-header__count {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.45);
  margin: 0;
}

/* Create Button - Matching Events/Artists Style */
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
  display: flex;
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
   PACKS GRID - Matching Events/Artists Style
   ============================================ */
.packs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1rem;
}

/* ============================================
   PACK CARD - Matching Events/Artists Style
   ============================================ */
.pack-card {
  display: flex;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.2s ease;
  min-height: 180px;
}

.pack-card:hover {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
}

/* Visual / Type Section */
.pack-card__visual {
  width: 120px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
}

.pack-card__visual i {
  font-size: 1.75rem;
  opacity: 0.8;
}

.pack-card__visual--standard {
  color: #3b82f6;
}

.pack-card__visual--premium {
  color: var(--color-primary);
}

.pack-card__visual--vip {
  color: #eab308;
}

.pack-card__type {
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.7;
}

/* Content Section */
.pack-card__content {
  flex: 1;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

/* Top Row */
.pack-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.25rem;
}

.pack-card__price-tag {
  padding: 0.2rem 0.5rem;
  background: rgba(var(--color-primary-rgb), 0.12);
  color: var(--color-primary);
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: 700;
}

.pack-card__indicator {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.pack-card__indicator i {
  font-size: 0.35rem;
}

.pack-card__indicator--active {
  color: #22c55e;
}

.pack-card__indicator--active i {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.pack-card__indicator--inactive {
  color: rgba(255, 255, 255, 0.35);
}

/* Name */
.pack-card__name {
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
.pack-card__details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.pack-card__details .detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.55);
}

.pack-card__details .detail i {
  width: 14px;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.35);
}

.pack-card__details .detail span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Actions */
.pack-card__actions {
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

/* Features Input - Uses shared dashboard-modals.css */

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
/* All modal and form styles are in dashboard-modals.css */

/* ============================================
   RESPONSIVE - Matching Events/Artists Style
   ============================================ */
@media (max-width: 1024px) {
  .packs-grid {
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

  .packs-grid {
    grid-template-columns: 1fr;
    gap: 0.875rem;
  }

  /* Pack Card - Horizontal layout on tablet */
  .pack-card {
    border-radius: 12px;
    min-height: 140px;
  }

  .pack-card__visual {
    width: 90px;
    padding: 0.75rem;
  }

  .pack-card__visual i {
    font-size: 1.5rem;
  }

  .pack-card__content {
    padding: 0.875rem 1rem;
  }

  .pack-card__name {
    font-size: 0.95rem;
  }

  .pack-card__price-tag {
    font-size: 0.65rem;
  }

  .pack-card__details .detail {
    font-size: 0.75rem;
  }

  /* Action buttons - Touch friendly */
  .pack-card__actions {
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

  /* Empty State */
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
  .pack-card {
    flex-direction: column;
    min-height: auto;
  }

  .pack-card__visual {
    width: 100%;
    height: 100px;
    flex-direction: row;
    gap: 0.75rem;
  }

  .pack-card__visual i {
    font-size: 1.75rem;
  }

  .pack-card__content {
    padding: 1rem;
  }

  .pack-card__name {
    font-size: 1.05rem;
  }

  .pack-card__price-tag {
    font-size: 0.6rem;
  }

  .pack-card__details .detail {
    font-size: 0.75rem;
  }

  .pack-card__actions {
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

