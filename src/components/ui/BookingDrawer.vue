<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="isOpen" class="booking-drawer" @click.self="closeDrawer">
        <!-- Backdrop -->
        <div class="booking-drawer__backdrop" @click="closeDrawer"></div>

        <!-- Drawer Panel -->
        <div class="booking-drawer__panel" ref="panelRef">
          <!-- Mobile drag handle -->
          <div class="drag-handle" aria-hidden="true"></div>

          <!-- Header -->
          <div class="booking-drawer__header">
            <div class="header-content">
              <h2 class="header-title">{{ t('booking.title') }}</h2>
              <p class="header-event">{{ props.event?.title || '' }}</p>
            </div>
            <button class="close-btn" @click="closeDrawer" :disabled="isLoading">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Content -->
          <div class="booking-drawer__content">
            <!-- Step 1: Packs + Customer Form -->
            <template v-if="currentStep === 1">
            <!-- Packs Selection -->
            <div class="packs-section">
              <div class="section-label">
                <i class="fas fa-ticket-alt"></i>
                <span>{{ t('booking.selectTickets') }}</span>
              </div>

              <div class="packs-list">
                <div
                  v-for="pack in availablePacks"
                  :key="pack.id"
                  class="pack-item"
                  :class="{ 'pack-item--selected': getPackQuantity(pack.id) > 0, 'pack-item--soldout': pack.is_soldout }"
                >
                  <div class="pack-info">
                    <div class="pack-header">
                      <span class="pack-name">{{ getPackName(pack) }}</span>
                      <span v-if="pack.is_soldout" class="pack-soldout-badge">
                        {{ t('booking.soldOut') }}
                      </span>
                    </div>
                    <div class="pack-price">
                      {{ formatPrice(pack.price, '€', t('common.free')) }}
                      <span v-if="pack.unit" class="pack-unit">{{ pack.unit }}</span>
                    </div>
                    <ul v-if="getPackFeatures(pack).length > 0" class="pack-features">
                      <li v-for="(feature, idx) in getPackFeatures(pack).slice(0, 2)" :key="idx">
                        <i class="fas fa-check"></i>
                        {{ feature }}
                      </li>
                    </ul>
                  </div>

                  <div class="pack-quantity" v-if="!pack.is_soldout">
                    <button
                      type="button"
                      class="qty-btn"
                      @click="decrementPack(pack.id)"
                      :disabled="getPackQuantity(pack.id) <= 0"
                    >
                      <i class="fas fa-minus"></i>
                    </button>
                    <span class="qty-value">{{ getPackQuantity(pack.id) }}</span>
                    <button
                      type="button"
                      class="qty-btn"
                      @click="incrementPack(pack.id)"
                      :disabled="totalQuantity >= 50"
                    >
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Customer Form (show only when items selected) -->
            <Transition name="slide-fade">
              <div v-if="totalQuantity > 0" class="customer-section">
                <div class="section-label">
                  <i class="fas fa-user"></i>
                  <span>{{ t('booking.yourInfo') }}</span>
                </div>

                <form @submit.prevent="handleSubmit" class="customer-form">
                  <div class="form-row">
                    <div class="form-field" :class="{ 'form-field--error': fieldErrors.firstName }">
                      <label for="firstName">{{ t('booking.firstName') }} *</label>
                      <input
                        id="firstName"
                        v-model="formData.firstName"
                        type="text"
                        :placeholder="t('booking.firstNamePlaceholder')"
                        required
                        :disabled="isLoading"
                        @blur="markTouched('firstName')"
                      />
                      <Transition name="fade">
                        <span v-if="fieldErrors.firstName" class="field-error">{{ fieldErrors.firstName }}</span>
                      </Transition>
                    </div>
                    <div class="form-field" :class="{ 'form-field--error': fieldErrors.lastName }">
                      <label for="lastName">{{ t('booking.lastName') }} *</label>
                      <input
                        id="lastName"
                        v-model="formData.lastName"
                        type="text"
                        :placeholder="t('booking.lastNamePlaceholder')"
                        required
                        :disabled="isLoading"
                        @blur="markTouched('lastName')"
                      />
                      <Transition name="fade">
                        <span v-if="fieldErrors.lastName" class="field-error">{{ fieldErrors.lastName }}</span>
                      </Transition>
                    </div>
                  </div>

                  <div class="form-field" :class="{ 'form-field--error': fieldErrors.email }">
                    <label for="email">{{ t('booking.email') }} *</label>
                    <input
                      id="email"
                      v-model="formData.email"
                      type="email"
                      placeholder="votre@email.com"
                      required
                      :disabled="isLoading"
                      @blur="markTouched('email')"
                    />
                    <Transition name="fade">
                      <span v-if="fieldErrors.email" class="field-error">{{ fieldErrors.email }}</span>
                    </Transition>
                  </div>

                  <div class="form-field" :class="{ 'form-field--error': fieldErrors.phone }">
                    <label for="phone">{{ t('booking.phone') }} *</label>
                    <input
                      id="phone"
                      v-model="formData.phone"
                      type="tel"
                      placeholder="+32 xxx xx xx xx"
                      required
                      :disabled="isLoading"
                      @blur="markTouched('phone')"
                    />
                    <Transition name="fade">
                      <span v-if="fieldErrors.phone" class="field-error">{{ fieldErrors.phone }}</span>
                    </Transition>
                  </div>

                  <!-- Terms & Conditions Checkbox -->
                  <div class="terms-section">
                    <label class="terms-checkbox" :class="{ 'terms-checkbox--error': touched.email && !formData.termsAccepted }"> <!-- Simple error logic reused -->
                      <input
                        type="checkbox"
                        v-model="formData.termsAccepted"
                        :disabled="isLoading"
                      />
                      <span class="terms-text">
                        {{ t('booking.acceptTerms') }}
                        <router-link to="/cgv" target="_blank">{{ t('booking.termsLink') }}</router-link>
                        {{ t('common.and') }}
                        <router-link to="/confidentialite" target="_blank">{{ t('booking.privacyLink') }}</router-link>
                      </span>
                    </label>
                  </div>

                </form>
              </div>
            </Transition>
            </template>

            <!-- Step 2: Payment Method Selection -->
            <template v-if="currentStep === 2">
              <div class="payment-step">
                <!-- Back button -->
                <button type="button" class="back-btn" @click="currentStep = 1" :disabled="isLoading">
                  <i class="fas fa-arrow-left"></i>
                  <span>{{ t('booking.backToForm') }}</span>
                </button>

                <!-- Step indicator -->
                <div class="step-indicator">
                  <div class="step-badge">
                    <i class="fas fa-credit-card"></i>
                  </div>
                  <h3 class="step-title">{{ t('booking.choosePaymentMethod') }}</h3>
                  <p class="step-subtitle">{{ t('booking.choosePaymentMethodDesc') }}</p>
                </div>

                <!-- Payment Methods Grid -->
                <div class="payment-methods-grid">
                  <!-- Bancontact -->
                  <button
                    type="button"
                    class="payment-method-card"
                    :class="{ 'payment-method-card--selected': selectedPaymentSource === 'bancontact' }"
                    @click="selectedPaymentSource = 'bancontact'"
                    :disabled="isLoading"
                  >
                    <div class="payment-method-card__icon payment-method-card__icon--bancontact">
                      <img :src="bancontactLogo" alt="Bancontact" />
                    </div>
                    <div class="payment-method-card__info">
                      <span class="payment-method-card__name">Bancontact</span>
                      <span class="payment-method-card__desc">{{ t('booking.paymentMethods.bancontactDesc') }}</span>
                    </div>
                    <div class="payment-method-card__check">
                      <i class="fas fa-check-circle"></i>
                    </div>
                  </button>

                  <!-- Card -->
                  <button
                    type="button"
                    class="payment-method-card"
                    :class="{ 'payment-method-card--selected': selectedPaymentSource === 'card' }"
                    @click="selectedPaymentSource = 'card'"
                    :disabled="isLoading"
                  >
                    <div class="payment-method-card__icon payment-method-card__icon--card">
                      <img :src="visaLogo" alt="Visa" />
                    </div>
                    <div class="payment-method-card__info">
                      <span class="payment-method-card__name">{{ t('booking.paymentMethods.card') }}</span>
                      <span class="payment-method-card__desc">{{ t('booking.paymentMethods.cardDesc') }}</span>
                    </div>
                    <div class="payment-method-card__check">
                      <i class="fas fa-check-circle"></i>
                    </div>
                  </button>

                  <!-- PayPal -->
                  <button
                    type="button"
                    class="payment-method-card"
                    :class="{ 'payment-method-card--selected': selectedPaymentSource === 'paypal' }"
                    @click="selectedPaymentSource = 'paypal'"
                    :disabled="isLoading"
                  >
                    <div class="payment-method-card__icon payment-method-card__icon--paypal">
                      <img :src="paypalLogo" alt="PayPal" />
                    </div>
                    <div class="payment-method-card__info">
                      <span class="payment-method-card__name">PayPal</span>
                      <span class="payment-method-card__desc">{{ t('booking.paymentMethods.paypalDesc') }}</span>
                    </div>
                    <div class="payment-method-card__check">
                      <i class="fas fa-check-circle"></i>
                    </div>
                  </button>

                  <!-- Cash (pay on site) -->
                  <button
                    type="button"
                    class="payment-method-card"
                    :class="{ 'payment-method-card--selected': selectedPaymentSource === 'cash' }"
                    @click="selectedPaymentSource = 'cash'"
                    :disabled="isLoading"
                  >
                    <div class="payment-method-card__icon payment-method-card__icon--cash">
                      <i class="fas fa-coins"></i>
                    </div>
                    <div class="payment-method-card__info">
                      <span class="payment-method-card__name">{{ t('booking.payCash') }}</span>
                      <span class="payment-method-card__desc">{{ t('booking.paymentMethods.cashDesc') }}</span>
                    </div>
                    <div class="payment-method-card__check">
                      <i class="fas fa-check-circle"></i>
                    </div>
                  </button>
                </div>

                <!-- Cash Warning -->
                <Transition name="fade">
                  <div v-if="selectedPaymentSource === 'cash'" class="cash-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>{{ t('booking.cashWarning') }}</span>
                  </div>
                </Transition>
              </div>
            </template>
          </div>

          <!-- Footer with Summary -->
          <div class="booking-drawer__footer" :class="{ 'footer--visible': totalQuantity > 0 }">
            <!-- Order Summary -->
            <div class="order-summary">
              <div class="summary-details">
                <span class="summary-qty">{{ totalQuantity }} {{ totalQuantity > 1 ? t('booking.tickets') : t('booking.ticket') }}</span>
                <span class="summary-breakdown" v-if="selectedPacks.length > 1">
                  {{ summaryBreakdown }}
                </span>
              </div>
              <div class="summary-total">
                <span class="total-label">{{ t('booking.total') }}</span>
                <span class="total-amount">{{ formatPrice(totalAmount, '€', t('common.free')) }}</span>
              </div>
            </div>

            <!-- Error Message -->
            <Transition name="fade">
              <div v-if="errorMessage" class="error-alert">
                <i class="fas fa-exclamation-circle"></i>
                <span>{{ errorMessage }}</span>
              </div>
            </Transition>

            <!-- Step 1: Continue Button -->
            <button
              v-if="currentStep === 1"
              type="button"
              class="submit-btn"
              :disabled="!canContinue"
              @click="goToPaymentStep"
            >
              <span class="btn-content">
                <!-- Free ticket - direct submit -->
                <template v-if="totalAmount === 0">
                  <i class="fas fa-ticket-alt"></i>
                  <span>{{ t('booking.reserveNow') }}</span>
                </template>
                <!-- Paid ticket - go to payment selection -->
                <template v-else>
                  <i class="fas fa-credit-card"></i>
                  <span>{{ t('booking.continueToPayment') }}</span>
                </template>
                <i class="fas fa-arrow-right btn-arrow"></i>
              </span>
            </button>

            <!-- Step 2: Pay Button -->
            <button
              v-if="currentStep === 2"
              type="button"
              class="submit-btn"
              :class="{
                'submit-btn--cash': selectedPaymentSource === 'cash',
                'submit-btn--bancontact': selectedPaymentSource === 'bancontact',
                'submit-btn--paypal': selectedPaymentSource === 'paypal'
              }"
              :disabled="!selectedPaymentSource || isLoading"
              @click="handleSubmit"
            >
              <span v-if="isLoading" class="btn-content">
                <i class="fas fa-circle-notch fa-spin"></i>
                <span>{{ t('booking.redirecting') }}</span>
              </span>
              <span v-else class="btn-content">
                <!-- Cash payment -->
                <template v-if="selectedPaymentSource === 'cash'">
                  <i class="fas fa-clock"></i>
                  <span>{{ t('booking.reserveCash') }} {{ formatPrice(totalAmount, '€', t('common.free')) }}</span>
                </template>
                <!-- Bancontact -->
                <template v-else-if="selectedPaymentSource === 'bancontact'">
                  <span>{{ t('booking.payWith') }} Bancontact · {{ formatPrice(totalAmount, '€', t('common.free')) }}</span>
                </template>
                <!-- PayPal -->
                <template v-else-if="selectedPaymentSource === 'paypal'">
                  <i class="fab fa-paypal"></i>
                  <span>{{ t('booking.payWith') }} PayPal · {{ formatPrice(totalAmount, '€', t('common.free')) }}</span>
                </template>
                <!-- Card -->
                <template v-else-if="selectedPaymentSource === 'card'">
                  <i class="fas fa-credit-card"></i>
                  <span>{{ t('booking.payNow') }} {{ formatPrice(totalAmount, '€', t('common.free')) }}</span>
                </template>
                <i class="fas fa-arrow-right btn-arrow"></i>
              </span>
            </button>

            <!-- Trust badges (only for paid tickets) -->
            <div v-if="totalAmount > 0" class="trust-badges">
              <span class="trust-item">
                <i class="fas fa-shield-alt"></i>
                {{ t('booking.securePayment') }}
              </span>
              <span class="trust-item">
                <i class="fas fa-bolt"></i>
                {{ t('booking.instantConfirmation') }}
              </span>
            </div>
            <!-- Free ticket badge -->
            <div v-else class="trust-badges">
              <span class="trust-item">
                <i class="fas fa-check-circle"></i>
                {{ t('booking.instantConfirmation') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Event, Pack } from '@/types'
import { useCheckout } from '@/composables/useCheckout'
import { formatPrice } from '@/utils'

// Payment method logos (official)
import bancontactLogo from '@/assets/images/payment/Bancontact-Original-logo-RGB.svg'
import paypalLogo from '@/assets/images/payment/PP_logo_h_100x26.png'
import visaLogo from '@/assets/images/payment/visa-svgrepo-com.svg'

const { t, locale } = useI18n()

const props = defineProps<{
  isOpen: boolean
  event: Event | null
  initialPackId?: string // Pack pré-sélectionné au clic
}>()

const emit = defineEmits<{
  close: []
}>()

// Refs
const panelRef = ref<HTMLElement | null>(null)

// State
const packQuantities = reactive<Record<string, number>>({})
const currentStep = ref<1 | 2>(1) // 1 = form, 2 = payment method selection
const selectedPaymentSource = ref<'paypal' | 'bancontact' | 'card' | 'cash' | null>(null)
const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  termsAccepted: false
})
const errorMessage = ref<string | null>(null)

// Field validation - track touched fields
const touched = reactive({
  firstName: false,
  lastName: false,
  email: false,
  phone: false
})

// Field-level validation errors
const fieldErrors = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phoneRegex = /^[+]?[\d\s-]{8,}$/
  return {
    firstName: touched.firstName && formData.value.firstName.trim().length < 2
      ? t('booking.validation.firstNameMin')
      : null,
    lastName: touched.lastName && formData.value.lastName.trim().length < 2
      ? t('booking.validation.lastNameMin')
      : null,
    email: touched.email && !emailRegex.test(formData.value.email.trim())
      ? t('booking.validation.emailInvalid')
      : null,
    phone: touched.phone && !phoneRegex.test(formData.value.phone.trim())
      ? t('booking.validation.phoneInvalid')
      : null
  }
})

// Mark field as touched on blur
function markTouched(field: 'firstName' | 'lastName' | 'email' | 'phone') {
  touched[field] = true
}

// Checkout
const { initiateCartPayment, isLoading, error: checkoutError } = useCheckout()

// Computed
const availablePacks = computed(() => {
  if (!props.event?.packs) return []
  return props.event.packs.filter(p => p.is_active)
})

const selectedPacks = computed(() => {
  return availablePacks.value.filter(p => getPackQuantity(p.id) > 0)
})

const totalQuantity = computed(() => {
  return Object.values(packQuantities).reduce((sum, qty) => sum + qty, 0)
})

const totalAmount = computed(() => {
  return availablePacks.value.reduce((sum, pack) => {
    const qty = getPackQuantity(pack.id)
    return sum + (pack.price * qty)
  }, 0)
})

const summaryBreakdown = computed(() => {
  return selectedPacks.value
    .map(p => `${getPackName(p)} ×${getPackQuantity(p.id)}`)
    .join(', ')
})

const isFormValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phoneRegex = /^[+]?[\d\s-]{8,}$/
  return formData.value.firstName.trim().length >= 2 &&
         formData.value.lastName.trim().length >= 2 &&
         emailRegex.test(formData.value.email.trim()) &&
         phoneRegex.test(formData.value.phone.trim())
})

// Step 1: Can continue to payment selection
const canContinue = computed(() => {
  return totalQuantity.value > 0 && isFormValid.value && formData.value.termsAccepted
})

// Methods
function getPackQuantity(packId: string): number {
  return packQuantities[packId] || 0
}

function incrementPack(packId: string) {
  if (totalQuantity.value >= 50) return
  packQuantities[packId] = (packQuantities[packId] || 0) + 1
}

function decrementPack(packId: string) {
  const current = packQuantities[packId] || 0
  if (current > 0) {
    packQuantities[packId] = current - 1
  }
}

function getPackName(pack: Pack): string {
  const lang = locale.value as 'fr' | 'en' | 'nl' | 'sq'
  return pack.name_translations?.[lang] || pack.name_translations?.fr || pack.name
}

function getPackFeatures(pack: Pack): string[] {
  const lang = locale.value as 'fr' | 'en' | 'nl' | 'sq'
  return pack.features_translations?.[lang] || pack.features_translations?.fr || pack.features || []
}

function closeDrawer() {
  if (!isLoading.value) {
    emit('close')
  }
}

function resetForm() {
  Object.keys(packQuantities).forEach(key => delete packQuantities[key])
  formData.value = { firstName: '', lastName: '', email: '', phone: '', termsAccepted: false }
  currentStep.value = 1
  selectedPaymentSource.value = null
  errorMessage.value = null
  // Reset touched state
  touched.firstName = false
  touched.lastName = false
  touched.email = false
  touched.phone = false
}

// Go to payment method selection (Step 2)
function goToPaymentStep() {
  if (!canContinue.value) return

  // For free tickets, submit directly
  if (totalAmount.value === 0) {
    handleFreeTicket()
    return
  }

  // Go to step 2 for payment selection
  currentStep.value = 2
  errorMessage.value = null
}

// Handle free ticket booking
async function handleFreeTicket() {
  if (!props.event) return

  const items = selectedPacks.value.map(pack => ({
    event_id: props.event!.id,
    pack_id: pack.id,
    quantity: getPackQuantity(pack.id)
  }))

  const checkoutData = {
    items,
    customer_name: `${formData.value.firstName.trim()} ${formData.value.lastName.trim()}`,
    customer_email: formData.value.email.trim().toLowerCase(),
    customer_phone: formData.value.phone?.trim() || undefined,
    payment_method: 'online' as 'online' | 'cash',
    terms_accepted: true
  }

  const result = await initiateCartPayment(checkoutData, true)
  if (!result) {
    errorMessage.value = checkoutError.value ?? t('booking.error')
  }
}

// Handle payment submission (Step 2)
async function handleSubmit() {
  if (!selectedPaymentSource.value || !props.event) return

  errorMessage.value = null

  // Build checkout items
  const items = selectedPacks.value.map(pack => ({
    event_id: props.event!.id,
    pack_id: pack.id,
    quantity: getPackQuantity(pack.id)
  }))

  // Determine payment method for backend
  const isCash = selectedPaymentSource.value === 'cash'

  // Cast payment_source to correct type (excluding 'cash')
  const paymentSourceForApi = isCash ? undefined : selectedPaymentSource.value as 'paypal' | 'bancontact' | 'card'

  const checkoutData = {
    items,
    customer_name: `${formData.value.firstName.trim()} ${formData.value.lastName.trim()}`,
    customer_email: formData.value.email.trim().toLowerCase(),
    customer_phone: formData.value.phone?.trim() || undefined,
    payment_method: isCash ? 'cash' : 'online' as 'online' | 'cash',
    payment_source: paymentSourceForApi,
    terms_accepted: true
  }

  // Auto-redirect vers PayPal/Bancontact ou page de confirmation
  const result = await initiateCartPayment(checkoutData, true)

  if (!result) {
    errorMessage.value = checkoutError.value ?? t('booking.error')
  }
  // Si result existe, la redirection a déjà été faite par initiateCartPayment
}

// Watch isOpen pour initialiser le pack pré-sélectionné
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    // Si un pack est pré-sélectionné, le mettre à 1
    if (props.initialPackId) {
      // Vérifier que le pack existe et n'est pas soldout
      const pack = availablePacks.value.find(p => p.id === props.initialPackId)
      if (pack && !pack.is_soldout) {
        packQuantities[props.initialPackId] = 1
      }
    }
    // Bloquer le scroll du body
    document.body.style.overflow = 'hidden'
  } else {
    // Réinitialiser le formulaire quand le modal se ferme
    resetForm()
    document.body.style.overflow = ''
  }
})

// Keyboard handling
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.isOpen && !isLoading.value) {
    closeDrawer()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* ============================================
   BOOKING DRAWER - Premium Side Panel
   Matching EventDetail Design Language
   ============================================ */

.booking-drawer {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  justify-content: flex-end;
}

.booking-drawer__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
}

.booking-drawer__panel {
  position: relative;
  width: 100%;
  max-width: 420px;
  height: 100%;
  background: #08080c;
  display: flex;
  flex-direction: column;
  box-shadow: -20px 0 60px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  border-left: 1px solid rgba(255, 255, 255, 0.04);
}

.drag-handle {
  display: none;
}

/* ============================================
   HEADER - Clean & Minimal
   ============================================ */

.booking-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(10, 10, 15, 0.8);
}

.header-content {
  flex: 1;
  min-width: 0;
}

.header-title {
  font-family: var(--font-heading, 'Clash Display', sans-serif);
  font-size: 1.125rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 0.125rem;
  letter-spacing: -0.01em;
}

.header-event {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-left: 1rem;
}

.close-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.close-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* ============================================
   CONTENT
   ============================================ */

.booking-drawer__content {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.section-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 50px;
  font-size: 0.6rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.875rem;
}

.section-label i {
  color: var(--color-primary, #dc143c);
  font-size: 0.55rem;
}

/* ============================================
   PACKS LIST - Matching EventDetail Cards
   ============================================ */

.packs-list {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.pack-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.pack-item:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.1);
}

.pack-item--selected {
  background: rgba(220, 20, 60, 0.06);
  border-color: rgba(220, 20, 60, 0.2);
}

.pack-item--selected:hover {
  background: rgba(220, 20, 60, 0.08);
}

.pack-item--soldout {
  opacity: 0.45;
  pointer-events: none;
}

.pack-info {
  flex: 1;
  min-width: 0;
}

.pack-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.125rem;
}

.pack-name {
  font-family: var(--font-heading, 'Clash Display', sans-serif);
  font-size: 0.8125rem;
  font-weight: 600;
  color: #fff;
}

.pack-soldout-badge {
  padding: 0.125rem 0.375rem;
  background: rgba(239, 68, 68, 0.15);
  border-radius: 3px;
  font-size: 0.5rem;
  font-weight: 700;
  color: #f87171;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.pack-price {
  font-family: var(--font-heading, 'Clash Display', sans-serif);
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-primary, #dc143c);
}

.pack-unit {
  font-size: 0.625rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.35);
  margin-left: 0.25rem;
}

.pack-features {
  list-style: none;
  margin: 0.375rem 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem 0.625rem;
}

.pack-features li {
  font-size: 0.625rem;
  color: rgba(255, 255, 255, 0.45);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.pack-features i {
  color: var(--color-primary, #dc143c);
  font-size: 0.5rem;
  opacity: 0.8;
}

/* Quantity Selector */
.pack-quantity {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-left: 0.75rem;
}

.qty-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.625rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.qty-btn:hover:not(:disabled) {
  background: var(--color-primary, #dc143c);
  border-color: var(--color-primary, #dc143c);
  color: #fff;
}

.qty-btn:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.qty-value {
  min-width: 20px;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 700;
  color: #fff;
}

/* ============================================
   CUSTOMER FORM - Clean Input Style
   ============================================ */

.customer-section {
  padding-top: 0.25rem;
}

.customer-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.625rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.form-field label {
  font-size: 0.625rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.45);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.form-field .optional {
  font-weight: 400;
  color: rgba(255, 255, 255, 0.25);
  text-transform: none;
  letter-spacing: 0;
}

.form-field input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.625rem 0.875rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.8125rem;
  color: #fff;
  transition: all 0.2s ease;
}

.form-field input::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.form-field input:focus {
  outline: none;
  border-color: rgba(220, 20, 60, 0.35);
  background: rgba(255, 255, 255, 0.03);
}

.form-field input:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Error state */
.form-field--error input {
  border-color: rgba(220, 53, 69, 0.5);
  background: rgba(220, 53, 69, 0.05);
}

.form-field--error input:focus {
  border-color: rgba(220, 53, 69, 0.7);
}

.field-error {
  font-size: 0.625rem;
  color: #ff6b6b;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* ============================================
   PAYMENT METHOD SELECTION
   ============================================ */

.payment-method-section {
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.section-label--inline {
  margin-bottom: 0.625rem;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.payment-option {
  position: relative;
  cursor: pointer;
}

.payment-option input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.payment-option__content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.payment-option:hover .payment-option__content {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.1);
}

.payment-option--selected .payment-option__content {
  background: rgba(220, 20, 60, 0.08);
  border-color: rgba(220, 20, 60, 0.3);
}

.payment-option__icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(220, 20, 60, 0.1);
  border-radius: 8px;
  color: var(--color-primary, #dc143c);
  font-size: 0.875rem;
  flex-shrink: 0;
}

.payment-option__icon--cash {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.payment-option__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.payment-option__title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #fff;
}

.payment-option__desc {
  font-size: 0.625rem;
  color: rgba(255, 255, 255, 0.45);
}

.payment-option__check {
  font-size: 0.875rem;
  color: var(--color-primary, #dc143c);
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s ease;
}

.payment-option--selected .payment-option__check {
  opacity: 1;
  transform: scale(1);
}

/* Cash Warning */
.cash-warning {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  margin-top: 0.5rem;
  background: rgba(251, 191, 36, 0.08);
  border: 1px solid rgba(251, 191, 36, 0.15);
  border-radius: 8px;
  font-size: 0.6875rem;
  color: #fbbf24;
  line-height: 1.5;
}

.cash-warning i {
  font-size: 0.75rem;
  margin-top: 0.125rem;
  flex-shrink: 0;
}

/* Terms Checkbox */
.terms-section {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.terms-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.terms-checkbox:hover {
  background: rgba(255, 255, 255, 0.03);
}

.terms-checkbox input {
  margin-top: 0.25rem;
  accent-color: var(--color-primary, #dc143c);
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.terms-text {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.4;
}

.terms-text a {
  color: var(--color-primary, #dc143c);
  text-decoration: none;
  font-weight: 500;
}

.terms-text a:hover {
  text-decoration: underline;
}

.terms-checkbox--error .terms-text {
  color: #fca5a5;
}

.terms-checkbox--error input {
  outline: 2px solid #ef4444;
}

/* Submit Button Cash Variant */
.submit-btn--cash {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.submit-btn--cash:hover:not(:disabled) {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  box-shadow: 0 6px 20px rgba(34, 197, 94, 0.35);
}

/* ============================================
   FOOTER - Clean & Professional
   ============================================ */

.booking-drawer__footer {
  padding: 1rem 1.5rem 1.25rem;
  background: rgba(10, 10, 15, 0.95);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  transform: translateY(100%);
  opacity: 0;
  transition: all 0.3s ease;
}

.booking-drawer__footer.footer--visible {
  transform: translateY(0);
  opacity: 1;
}

.order-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 0.875rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.summary-details {
  display: flex;
  flex-direction: column;
}

.summary-qty {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
}

.summary-breakdown {
  font-size: 0.625rem;
  color: rgba(255, 255, 255, 0.35);
}

.summary-total {
  text-align: right;
}

.total-label {
  display: block;
  font-size: 0.5625rem;
  color: rgba(255, 255, 255, 0.35);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.125rem;
}

.total-amount {
  font-family: var(--font-heading, 'Clash Display', sans-serif);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary, #dc143c);
}

/* Error Alert */
.error-alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.15);
  border-radius: 6px;
  font-size: 0.6875rem;
  color: #fca5a5;
}

.error-alert i {
  color: #f87171;
  font-size: 0.625rem;
}

/* Submit Button */
.submit-btn {
  width: 100%;
  padding: 0.875rem 1rem;
  background: var(--color-primary, #dc143c);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.submit-btn:hover:not(:disabled) {
  background: #c41030;
  box-shadow: 0 6px 20px rgba(220, 20, 60, 0.35);
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #fff;
}

.btn-arrow {
  font-size: 0.6875rem;
  transition: transform 0.2s ease;
}

.submit-btn:hover:not(:disabled) .btn-arrow {
  transform: translateX(3px);
}

/* Trust Badges */
.trust-badges {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.875rem;
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.5625rem;
  color: rgba(255, 255, 255, 0.3);
}

.trust-item i {
  color: #10b981;
  font-size: 0.5rem;
}

/* ============================================
   TRANSITIONS
   ============================================ */

.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-enter-active .booking-drawer__panel,
.drawer-leave-active .booking-drawer__panel {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .booking-drawer__panel {
  transform: translateX(100%);
}

.drawer-leave-to .booking-drawer__panel {
  transform: translateX(100%);
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ============================================
   RESPONSIVE - Tablet (1024px)
   ============================================ */

@media (max-width: 1024px) {
  .booking-drawer__panel {
    max-width: 400px;
  }
}

/* ============================================
   RESPONSIVE - Mobile Bottom Sheet (768px)
   ============================================ */

@media (max-width: 768px) {
  .booking-drawer {
    align-items: flex-end;
  }

  .booking-drawer__panel {
    max-width: 100%;
    max-height: 92vh;
    max-height: 92dvh;
    border-radius: 16px 16px 0 0;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    /* Safe area for modern phones */
    padding-bottom: env(safe-area-inset-bottom, 0);
  }

  .drag-handle {
    display: block;
    width: 32px;
    height: 3px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 2px;
    margin: 8px auto 0;
  }

  .booking-drawer__header {
    padding: 0.75rem 1.25rem;
  }

  .header-title {
    font-size: 1rem;
  }

  .header-event {
    font-size: 0.6875rem;
  }

  .close-btn {
    width: 36px;
    height: 36px;
    font-size: 0.875rem;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .booking-drawer__content {
    padding: 1rem 1.25rem;
    gap: 1rem;
  }

  .section-label {
    padding: 0.375rem 0.75rem;
    font-size: 0.5625rem;
    margin-bottom: 0.625rem;
  }

  .packs-list {
    gap: 0.5rem;
  }

  .pack-item {
    padding: 0.875rem 1rem;
    border-radius: 10px;
  }

  .pack-name {
    font-size: 0.8125rem;
  }

  .pack-price {
    font-size: 0.9375rem;
  }

  .pack-features {
    margin-top: 0.25rem;
    gap: 0.25rem 0.5rem;
  }

  .pack-features li {
    font-size: 0.5625rem;
  }

  .qty-btn {
    width: 34px;
    height: 34px;
    font-size: 0.75rem;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
  }

  .qty-value {
    font-size: 0.9375rem;
    min-width: 32px;
  }

  .pack-quantity {
    gap: 0.375rem;
    margin-left: 0.875rem;
  }

  .customer-form {
    gap: 0.75rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0.625rem;
  }

  .form-field label {
    font-size: 0.6875rem;
  }

  .form-field input {
    padding: 0.75rem 0.875rem;
    font-size: 0.9375rem;
    border-radius: 8px;
    min-height: 48px;
  }

  .booking-drawer__footer {
    padding: 0.75rem 1.25rem;
    padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0));
    gap: 0.625rem;
  }

  .order-summary {
    padding: 0.5rem 0.75rem;
  }

  .summary-qty {
    font-size: 0.6875rem;
  }

  .summary-breakdown {
    font-size: 0.5625rem;
  }

  .total-label {
    font-size: 0.5rem;
  }

  .total-amount {
    font-size: 1.125rem;
  }

  .submit-btn {
    padding: 0.75rem 1rem;
    min-height: 48px;
    border-radius: 8px;
  }

  .btn-content {
    font-size: 0.75rem;
  }

  .trust-badges {
    gap: 0.75rem;
  }

  .trust-item {
    font-size: 0.5rem;
  }

  .trust-item i {
    font-size: 0.4375rem;
  }

  .drawer-enter-from .booking-drawer__panel {
    transform: translateY(100%);
  }

  .drawer-leave-to .booking-drawer__panel {
    transform: translateY(100%);
  }
}

/* ============================================
   RESPONSIVE - Small Mobile (480px)
   ============================================ */

@media (max-width: 480px) {
  .booking-drawer__panel {
    max-height: 94vh;
    max-height: 94dvh;
    border-radius: 14px 14px 0 0;
  }

  .booking-drawer__header {
    padding: 0.625rem 1rem;
  }

  .header-title {
    font-size: 0.9375rem;
  }

  .header-event {
    font-size: 0.625rem;
  }

  .close-btn {
    width: 34px;
    height: 34px;
    margin-left: 0.625rem;
    font-size: 0.8125rem;
  }

  .booking-drawer__content {
    padding: 0.875rem 1rem;
    gap: 0.875rem;
  }

  .section-label {
    padding: 0.3125rem 0.625rem;
    font-size: 0.5rem;
    letter-spacing: 0.75px;
  }

  .pack-item {
    padding: 0.75rem 0.875rem;
    border-radius: 8px;
  }

  .pack-name {
    font-size: 0.75rem;
  }

  .pack-price {
    font-size: 0.875rem;
  }

  .pack-soldout-badge {
    font-size: 0.4375rem;
    padding: 0.1rem 0.25rem;
  }

  .pack-features li {
    font-size: 0.5rem;
  }

  .pack-quantity {
    margin-left: 0.625rem;
    gap: 0.25rem;
  }

  .qty-btn {
    width: 32px;
    height: 32px;
    font-size: 0.6875rem;
    border-radius: 6px;
  }

  .qty-value {
    font-size: 0.875rem;
    min-width: 28px;
  }

  .form-field label {
    font-size: 0.625rem;
  }

  .form-field input {
    padding: 0.6875rem 0.75rem;
    font-size: 0.875rem;
    min-height: 46px;
  }

  .booking-drawer__footer {
    padding: 0.625rem 1rem;
    padding-bottom: calc(0.625rem + env(safe-area-inset-bottom, 0));
    gap: 0.5rem;
  }

  .order-summary {
    padding: 0.4375rem 0.625rem;
    border-radius: 6px;
  }

  .total-amount {
    font-size: 1rem;
  }

  .submit-btn {
    padding: 0.6875rem 0.875rem;
    min-height: 44px;
  }

  .btn-content {
    font-size: 0.6875rem;
    gap: 0.375rem;
  }

  .error-alert {
    padding: 0.5rem 0.625rem;
    font-size: 0.625rem;
    border-radius: 5px;
  }
}

/* ============================================
   RESPONSIVE - Extra Small Mobile (360px)
   ============================================ */

@media (max-width: 360px) {
  .booking-drawer__panel {
    border-radius: 12px 12px 0 0;
  }

  .drag-handle {
    width: 28px;
    height: 2px;
    margin: 6px auto 0;
  }

  .booking-drawer__header {
    padding: 0.5rem 0.875rem;
  }

  .header-title {
    font-size: 0.875rem;
  }

  .header-event {
    font-size: 0.5625rem;
  }

  .close-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    margin-left: 0.5rem;
    font-size: 0.75rem;
  }

  .booking-drawer__content {
    padding: 0.75rem 0.875rem;
    gap: 0.75rem;
  }

  .section-label {
    padding: 0.25rem 0.5rem;
    font-size: 0.4375rem;
    margin-bottom: 0.5rem;
  }

  .packs-list {
    gap: 0.375rem;
  }

  .pack-item {
    padding: 0.625rem 0.75rem;
    border-radius: 6px;
  }

  .pack-name {
    font-size: 0.6875rem;
  }

  .pack-price {
    font-size: 0.8125rem;
  }

  .pack-features {
    display: none;
  }

  .pack-quantity {
    margin-left: 0.5rem;
    gap: 0.1875rem;
  }

  .qty-btn {
    width: 28px;
    height: 28px;
    font-size: 0.625rem;
    border-radius: 5px;
  }

  .qty-value {
    font-size: 0.8125rem;
    min-width: 22px;
  }

  .customer-form {
    gap: 0.5rem;
  }

  .form-field {
    gap: 0.1875rem;
  }

  .form-field label {
    font-size: 0.5625rem;
  }

  .form-field input {
    padding: 0.5625rem 0.625rem;
    font-size: 0.8125rem;
    border-radius: 5px;
    min-height: 40px;
  }

  .booking-drawer__footer {
    padding: 0.5rem 0.875rem;
    padding-bottom: calc(0.5rem + env(safe-area-inset-bottom, 0));
    gap: 0.375rem;
  }

  .order-summary {
    padding: 0.375rem 0.5rem;
  }

  .summary-qty {
    font-size: 0.625rem;
  }

  .total-label {
    font-size: 0.4375rem;
  }

  .total-amount {
    font-size: 0.9375rem;
  }

  .submit-btn {
    padding: 0.5625rem 0.75rem;
    min-height: 40px;
    border-radius: 6px;
  }

  .btn-content {
    font-size: 0.625rem;
  }

  .trust-badges {
    gap: 0.5rem;
  }

  .trust-item {
    font-size: 0.4375rem;
    gap: 0.1875rem;
  }
}

/* Scrollbar */
.booking-drawer__content::-webkit-scrollbar {
  width: 4px;
}

.booking-drawer__content::-webkit-scrollbar-track {
  background: transparent;
}

.booking-drawer__content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

/* ========================= */
/* STEP 2: PAYMENT SELECTION */
/* ========================= */

.payment-step {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 0.5rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.5rem 0;
  transition: color 0.2s ease;
  align-self: flex-start;
}

.back-btn:hover:not(:disabled) {
  color: #fff;
}

.back-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.step-indicator {
  text-align: center;
  padding: 1rem 0;
}

.step-badge {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, rgba(220, 20, 60, 0.2) 0%, rgba(220, 20, 60, 0.1) 100%);
  border: 2px solid rgba(220, 20, 60, 0.4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.step-badge i {
  font-size: 1.5rem;
  color: #dc143c;
}

.step-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 0.5rem;
}

.step-subtitle {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

/* Payment Methods Grid */
.payment-methods-grid {
  display: grid;
  gap: 0.75rem;
}

.payment-method-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
}

.payment-method-card:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.2);
}

.payment-method-card:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.payment-method-card--selected {
  background: rgba(220, 20, 60, 0.1);
  border-color: #dc143c;
}

.payment-method-card--selected .payment-method-card__check {
  opacity: 1;
  color: #dc143c;
}

.payment-method-card__icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.05);
}

.payment-method-card__icon i {
  font-size: 1.5rem;
}

.payment-method-card__icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.payment-method-card__icon--bancontact {
  background: #fff;
  padding: 6px;
  overflow: hidden;
}

.payment-method-card__icon--card {
  background: #fff;
  padding: 6px;
  overflow: hidden;
}

.payment-method-card__icon--paypal {
  background: #fff;
  padding: 6px;
  overflow: hidden;
}

.payment-method-card__icon--cash {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.payment-method-card__icon--cash i {
  color: #fff;
  font-size: 1.5rem;
}

.payment-method-card__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.payment-method-card__name {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
}

.payment-method-card__desc {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.5);
}

.payment-method-card__check {
  opacity: 0;
  transition: opacity 0.2s ease;
  font-size: 1.25rem;
}

/* Submit button variants for Step 2 */
.submit-btn--bancontact {
  background: linear-gradient(135deg, #005498 0%, #003d70 100%);
}

.submit-btn--bancontact:hover:not(:disabled) {
  background: linear-gradient(135deg, #003d70 0%, #002850 100%);
  box-shadow: 0 6px 20px rgba(0, 84, 152, 0.35);
}

.submit-btn--paypal {
  background: linear-gradient(135deg, #0070ba 0%, #003087 100%);
}

.submit-btn--paypal:hover:not(:disabled) {
  background: linear-gradient(135deg, #003087 0%, #001f5c 100%);
  box-shadow: 0 6px 20px rgba(0, 112, 186, 0.35);
}

/* Mobile responsiveness for payment step */
@media (max-width: 480px) {
  .payment-step {
    gap: 1rem;
    padding: 0.25rem;
  }

  .step-badge {
    width: 48px;
    height: 48px;
  }

  .step-badge i {
    font-size: 1.25rem;
  }

  .step-title {
    font-size: 1.125rem;
  }

  .payment-method-card {
    padding: 0.875rem 1rem;
    gap: 0.75rem;
  }

  .payment-method-card__icon {
    width: 40px;
    height: 40px;
  }

  .payment-method-card__icon i {
    font-size: 1.25rem;
  }

  .payment-method-card__icon img,
  .payment-method-card__icon svg {
    width: 100%;
    height: 100%;
  }

  .payment-method-card__name {
    font-size: 0.9375rem;
  }

  .payment-method-card__desc {
    font-size: 0.75rem;
  }
}

@media (max-width: 360px) {
  .payment-method-card {
    padding: 0.75rem;
  }

  .payment-method-card__icon {
    width: 36px;
    height: 36px;
  }
}
</style>

