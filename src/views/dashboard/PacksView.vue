<template>
  <div class="packs-view">
    <!-- Loading State -->
    <LoadingSpinner v-if="isPageLoading" :message="'Chargement des packs...'" />
    
    <!-- Content -->
    <template v-else>
      <!-- Page Header -->
      <div class="page-header">
      <h1 class="page-header__title">Packs de réservation</h1>
      <button class="create-btn" @click="showCreateModal">
        <i class="fas fa-plus"></i>
        <span>Nouveau pack</span>
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="packs.length === 0" class="empty-state">
      <div class="empty-state__icon">
        <i class="fas fa-ticket-alt"></i>
      </div>
      <h3 class="empty-state__title">Aucun pack</h3>
      <p class="empty-state__text">Créez vos premiers packs de réservation</p>
    </div>

    <div v-else class="packs-grid">
      <div v-for="pack in packs" :key="pack.id" class="pack-card" :class="`pack-card--${pack.type}`">
        <div class="pack-card__header">
          <h3 class="pack-card__name">{{ pack.name }}</h3>
          <div class="pack-card__price">
            {{ pack.price }}{{ pack.currency }}
            <span v-if="pack.unit" class="pack-card__unit">{{ pack.unit }}</span>
          </div>
        </div>
        
        <p v-if="pack.description" class="pack-card__desc">{{ pack.description }}</p>
        
        <div v-if="pack.features && pack.features.length" class="pack-card__features">
          <div v-for="(feature, idx) in pack.features" :key="idx" class="feature">
            <i class="fas fa-check"></i>
            <span>{{ feature }}</span>
          </div>
        </div>
        
        <div class="pack-card__footer">
          <span :class="['pack-card__status', pack.is_active ? 'active' : 'inactive']">
            {{ pack.is_active ? 'Actif' : 'Inactif' }}
          </span>
          <div class="pack-card__actions">
            <button class="action-btn action-btn--edit" @click="editPack(pack)">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn action-btn--delete" @click="deletePack(pack)">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
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
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-euro-sign"></i>
                  Prix
                  <span class="required">*</span>
                </label>
                <input v-model.number="formData.price" type="number" class="form-input" min="0" step="0.01" required>
              </div>
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-users"></i>
                  Unité
                </label>
                <input v-model="formData.unit" type="text" class="form-input" placeholder="/ personne">
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
              <div class="form-group">
                <label class="checkbox-label">
                  <input v-model="formData.is_active" type="checkbox" class="form-checkbox">
                  <span>Pack actif</span>
                </label>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn--outline" @click="closeModal">
                <span>Annuler</span>
              </button>
              <button type="submit" class="btn btn--primary" :disabled="isSubmitting">
                <span v-if="isSubmitting">Chargement...</span>
                <span v-else>{{ editingPack ? 'Enregistrer' : 'Créer' }}</span>
                <i v-if="!isSubmitting" class="fas" :class="editingPack ? 'fa-save' : 'fa-plus'"></i>
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
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

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
const packs = ref<any[]>([])
const isModalOpen = ref(false)
const editingPack = ref<any>(null)
const isSubmitting = ref(false) // Renommé pour plus de clarté
const isPageLoading = ref(true)
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
async function fetchPacks() {
  try {
    const response = await fetch(buildApiUrl(API_ENDPOINTS.PACKS) + '?active_only=false')
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des packs')
    }
    packs.value = await response.json()
  } catch (error) {
    console.error('Erreur lors de la récupération des packs:', error)
    toast.error('Impossible de charger les packs')
  } finally {
    isPageLoading.value = false
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
      headers: getAuthHeaders(authStore.token),
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Erreur lors de la sauvegarde')
    }
    
    await fetchPacks()
    toast.success(editingPack.value ? 'Pack modifié avec succès' : 'Pack créé avec succès')
    closeModal()
  } catch (error) {
    console.error('Erreur:', error)
    const message = error instanceof Error ? error.message : 'Une erreur est survenue'
    submitError.value = message
    toast.error(message)
  } finally {
    isSubmitting.value = false
  }
}

// Edit pack
function editPack(pack: any) {
  editingPack.value = pack
  formData.value = {
    name: pack.name,
    name_translations: pack.name_translations || { fr: '', en: '', nl: '', sq: '' },
    type: pack.type,
    description: pack.description || '',
    description_translations: pack.description_translations || { fr: '', en: '', nl: '', sq: '' },
    price: pack.price,
    currency: pack.currency || '€',
    unit: pack.unit || '',
    features: pack.features && pack.features.length > 0 ? [...pack.features] : [''],
    features_translations: pack.features_translations || { fr: [''], en: [''], nl: [''], sq: [''] },
    is_active: pack.is_active
  }
  isModalOpen.value = true
}

// Delete pack
async function deletePack(pack: any) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce pack ?')) return
  
  try {
    const response = await fetch(buildApiUrl(API_ENDPOINTS.PACK_BY_ID(pack.id)), {
      method: 'DELETE',
      headers: getAuthHeaders(authStore.token)
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Erreur lors de la suppression')
    }
    
    await fetchPacks()
    toast.success('Pack supprimé avec succès')
  } catch (error) {
    console.error('Erreur:', error)
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

function addFeature() {
  formData.value.features.push('')
}

function removeFeature(idx: number) {
  formData.value.features.splice(idx, 1)
  if (formData.value.features.length === 0) {
    formData.value.features = ['']
  }
}

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

onMounted(() => {
  fetchPacks()
})
</script>

<style scoped>
@import '@/assets/styles/dashboard-modals.css';

.packs-view {
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

/* Packs Grid */
.packs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.pack-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid;
  border-radius: 10px;
  padding: 1.75rem;
  transition: all 0.2s ease;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.pack-card--standard {
  border-color: rgba(59, 130, 246, 0.3);
}

.pack-card--premium {
  border-color: rgba(220, 20, 60, 0.3);
}

.pack-card--vip {
  border-color: rgba(234, 179, 8, 0.3);
}

.pack-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.pack-card--standard:hover {
  border-color: rgba(59, 130, 246, 0.5);
}

.pack-card--premium:hover {
  border-color: rgba(220, 20, 60, 0.5);
}

.pack-card--vip:hover {
  border-color: rgba(234, 179, 8, 0.5);
}

.pack-card__header {
  text-align: center;
  margin-bottom: 1.25rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.pack-card__name {
  font-family: var(--font-heading);
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-white);
  margin-bottom: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pack-card__price {
  font-family: var(--font-heading);
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--color-primary);
  line-height: 1;
}

.pack-card__unit {
  display: block;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.55);
  margin-top: 0.5rem;
  font-weight: 500;
  text-transform: lowercase;
}

.pack-card__desc {
  font-size: 0.825rem;
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 1.25rem;
  text-align: center;
  line-height: 1.5;
}

.pack-card__features {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin-bottom: 1.25rem;
}

.feature {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.4;
}

.feature i {
  color: rgba(220, 20, 60, 0.8);
  font-size: 0.7rem;
  margin-top: 2px;
}

.pack-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.85rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.pack-card__status {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.4rem 0.75rem;
  border-radius: 5px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pack-card__status.active {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.pack-card__status.inactive {
  background: rgba(107, 114, 128, 0.2);
  color: #9ca3af;
}

.pack-card__actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 30px;
  height: 30px;
  border-radius: 5px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
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

/* Features Input */
.features-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.feature-input {
  display: flex;
  gap: 0.5rem;
}

.remove-feature-btn {
  width: 38px;
  height: 38px;
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: 6px;
  color: #e74c3c;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-feature-btn:hover {
  background: rgba(231, 76, 60, 0.2);
}

.add-feature-btn {
  width: 100%;
  padding: 0.625rem;
  background: rgba(220, 20, 60, 0.1);
  border: 1px dashed rgba(220, 20, 60, 0.3);
  border-radius: 6px;
  color: var(--color-primary);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.add-feature-btn:hover {
  background: rgba(220, 20, 60, 0.15);
  border-color: var(--color-primary);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
}

.form-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
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

/* Form styles (shared with ArtistsView) */
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
  .packs-grid {
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

  .packs-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .pack-card {
    padding: 1.5rem;
  }

  .pack-card__header {
    margin-bottom: 1.125rem;
    padding-bottom: 1.125rem;
  }

  .pack-card__name {
    font-size: 1.2rem;
  }

  .pack-card__price {
    font-size: 2.1rem;
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

  .pack-card {
    padding: 1.25rem;
  }

  .pack-card__header {
    margin-bottom: 1rem;
    padding-bottom: 1rem;
  }

  .pack-card__name {
    font-size: 1.1rem;
  }

  .pack-card__price {
    font-size: 1.9rem;
  }

  .pack-card__desc {
    font-size: 0.8rem;
  }

  .feature {
    font-size: 0.775rem;
  }

  .pack-card__footer {
    padding-top: 0.75rem;
  }

  .action-btn {
    width: 28px;
    height: 28px;
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

