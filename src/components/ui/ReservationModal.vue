<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="reservation-modal" @click.self="closeModal">
        <div class="reservation-modal__backdrop"></div>

        <div class="reservation-modal__container">
          <!-- Gradient border effect -->
          <div class="reservation-modal__border-glow"></div>

          <!-- Close Button -->
          <button class="reservation-modal__close" @click="closeModal" :aria-label="t('common.close')">
            <i class="fas fa-times"></i>
          </button>

          <!-- Modal Header -->
          <div class="reservation-modal__header">
            <div class="reservation-modal__badge">
              <span class="reservation-modal__badge-icon">
                <i class="fas fa-ticket-alt"></i>
              </span>
              <span class="reservation-modal__badge-text">{{ t('reservation.badge') }}</span>
            </div>
            <h2 class="reservation-modal__title">{{ t('reservation.title') }}</h2>
            <p class="reservation-modal__pack-name">{{ packName }}</p>
          </div>

          <!-- Modal Content -->
          <form class="reservation-modal__form" @submit.prevent="submitReservation">
            <!-- Name Fields Row -->
            <div class="reservation-modal__row">
              <!-- First Name -->
              <div class="reservation-modal__field">
                <label for="firstName" class="reservation-modal__label">
                  <span class="reservation-modal__label-icon">
                    <i class="fas fa-user"></i>
                  </span>
                  {{ t('reservation.firstName') }}
                </label>
                <input
                  id="firstName"
                  v-model="formData.firstName"
                  type="text"
                  class="reservation-modal__input"
                  :placeholder="t('reservation.firstNamePlaceholder')"
                  required
                  autocomplete="given-name"
                />
              </div>

              <!-- Last Name -->
              <div class="reservation-modal__field">
                <label for="lastName" class="reservation-modal__label">
                  <span class="reservation-modal__label-icon">
                    <i class="fas fa-user"></i>
                  </span>
                  {{ t('reservation.lastName') }}
                </label>
                <input
                  id="lastName"
                  v-model="formData.lastName"
                  type="text"
                  class="reservation-modal__input"
                  :placeholder="t('reservation.lastNamePlaceholder')"
                  required
                  autocomplete="family-name"
                />
              </div>
            </div>

            <!-- Number of People -->
            <div class="reservation-modal__field">
              <label class="reservation-modal__label">
                <span class="reservation-modal__label-icon">
                  <i class="fas fa-users"></i>
                </span>
                {{ t('reservation.numberOfPeople') }}
              </label>
              <div class="reservation-modal__counter">
                <button
                  type="button"
                  class="reservation-modal__counter-btn"
                  @click="decrementPeople"
                  :disabled="formData.numberOfPeople <= 1"
                  aria-label="Decrease"
                >
                  <i class="fas fa-minus"></i>
                </button>
                <div class="reservation-modal__counter-display">
                  <span class="reservation-modal__counter-value">{{ formData.numberOfPeople }}</span>
                  <span class="reservation-modal__counter-label">{{ formData.numberOfPeople > 1 ? 'personnes' : 'personne' }}</span>
                </div>
                <button
                  type="button"
                  class="reservation-modal__counter-btn"
                  @click="incrementPeople"
                  :disabled="formData.numberOfPeople >= 20"
                  aria-label="Increase"
                >
                  <i class="fas fa-plus"></i>
                </button>
              </div>
            </div>

            <!-- Event & Pack Summary -->
            <div class="reservation-modal__summary">
              <div class="reservation-modal__summary-row">
                <div class="reservation-modal__summary-item">
                  <span class="reservation-modal__summary-icon">
                    <i class="fas fa-calendar-alt"></i>
                  </span>
                  <div class="reservation-modal__summary-content">
                    <span class="reservation-modal__summary-label">Événement</span>
                    <span class="reservation-modal__summary-value">{{ eventTitle }}</span>
                  </div>
                </div>
                <div class="reservation-modal__summary-item reservation-modal__summary-item--price">
                  <span class="reservation-modal__summary-icon">
                    <i class="fas fa-tag"></i>
                  </span>
                  <div class="reservation-modal__summary-content">
                    <span class="reservation-modal__summary-label">Prix</span>
                    <span class="reservation-modal__summary-price">{{ packPrice }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <button type="submit" class="reservation-modal__submit">
              <span class="reservation-modal__submit-icon">
                <i class="fab fa-whatsapp"></i>
              </span>
              <span class="reservation-modal__submit-text">{{ t('reservation.submit') }}</span>
              <span class="reservation-modal__submit-arrow">
                <i class="fas fa-arrow-right"></i>
              </span>
            </button>
          </form>

          <!-- Footer Note -->
          <div class="reservation-modal__footer">
            <i class="fas fa-shield-alt"></i>
            <span>{{ t('reservation.note') }}</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  isOpen: boolean
  packName: string
  packPrice: string
  eventTitle: string
  whatsappMessage: string
}>()

const emit = defineEmits<{
  close: []
  submit: [data: { firstName: string; lastName: string; numberOfPeople: number }]
}>()

const formData = ref({
  firstName: '',
  lastName: '',
  numberOfPeople: 1
})

// Reset form when modal opens
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    formData.value = {
      firstName: '',
      lastName: '',
      numberOfPeople: 1
    }
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

const closeModal = () => {
  emit('close')
}

const incrementPeople = () => {
  if (formData.value.numberOfPeople < 20) {
    formData.value.numberOfPeople++
  }
}

const decrementPeople = () => {
  if (formData.value.numberOfPeople > 1) {
    formData.value.numberOfPeople--
  }
}

const submitReservation = () => {
  emit('submit', {
    firstName: formData.value.firstName,
    lastName: formData.value.lastName,
    numberOfPeople: formData.value.numberOfPeople
  })
}

// Handle escape key
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) {
    closeModal()
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
   RESERVATION MODAL - PREMIUM DESIGN
   Matching EventDetail Page Style
   ============================================ */

.reservation-modal {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow: hidden;
}

/* Backdrop - Solid black matching site */
.reservation-modal__backdrop {
  position: absolute;
  inset: 0;
  background: #030305;
}

/* Container - Solid dark background */
.reservation-modal__container {
  position: relative;
  width: 100%;
  max-width: 420px;
  max-height: calc(100vh - 2rem);
  max-height: calc(100dvh - 2rem);
  overflow-y: auto;
  overflow-x: hidden;
  background: #0a0a0f;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 2rem;
  box-shadow:
    0 25px 80px rgba(0, 0, 0, 0.8),
    0 0 0 1px rgba(255, 255, 255, 0.03),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  /* Animation handled by Vue Transition - no separate animation */
}

/* Gradient border glow */
.reservation-modal__border-glow {
  position: absolute;
  inset: -1px;
  border-radius: 21px;
  background: linear-gradient(
    135deg,
    rgba(220, 20, 60, 0.2) 0%,
    transparent 40%,
    transparent 60%,
    rgba(220, 20, 60, 0.15) 100%
  );
  opacity: 0.6;
  z-index: -1;
  filter: blur(1px);
  transition: opacity 0.4s ease;
}

.reservation-modal__container:hover .reservation-modal__border-glow {
  opacity: 1;
}

/* Close Button */
.reservation-modal__close {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
}

.reservation-modal__close:hover {
  background: rgba(220, 20, 60, 0.15);
  border-color: rgba(220, 20, 60, 0.3);
  color: var(--color-primary);
  transform: rotate(90deg);
}

.reservation-modal__close i {
  font-size: 0.75rem;
}

/* Header */
.reservation-modal__header {
  text-align: center;
  margin-bottom: 1.75rem;
  padding-top: 0.5rem;
}

/* Badge - Matching event-info__badge style */
.reservation-modal__badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50px;
  margin-bottom: 1.25rem;
  transition: all 0.3s ease;
}

.reservation-modal__badge:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(220, 20, 60, 0.2);
}

.reservation-modal__badge-icon {
  color: var(--color-primary);
  font-size: 12px;
  animation: badge-pulse 2s ease-in-out infinite;
}

@keyframes badge-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.reservation-modal__badge-text {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.reservation-modal__title {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.reservation-modal__pack-name {
  font-size: 0.875rem;
  color: var(--color-primary);
  font-weight: 600;
  margin: 0;
}

/* Form */
.reservation-modal__form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.reservation-modal__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.reservation-modal__field {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

/* Label - Matching info-card style */
.reservation-modal__label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.75px;
}

.reservation-modal__label-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: rgba(var(--color-primary-rgb), 0.12);
  border: 1px solid rgba(var(--color-primary-rgb), 0.2);
  border-radius: 6px;
  color: var(--color-primary);
  font-size: 0.5rem;
}

/* Input - Matching ticket-option style */
.reservation-modal__input {
  width: 100%;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  font-family: inherit;
  font-size: 0.9375rem;
  color: #fff;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
}

.reservation-modal__input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.reservation-modal__input:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.12);
}

.reservation-modal__input:focus {
  outline: none;
  background: rgba(var(--color-primary-rgb), 0.05);
  border-color: rgba(var(--color-primary-rgb), 0.4);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

/* Counter - Premium style */
.reservation-modal__counter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.reservation-modal__counter:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.12);
}

.reservation-modal__counter-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.reservation-modal__counter-btn:hover:not(:disabled) {
  background: var(--color-primary);
  border-color: var(--color-primary);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(220, 20, 60, 0.35);
}

.reservation-modal__counter-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.reservation-modal__counter-btn:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.reservation-modal__counter-btn i {
  font-size: 0.75rem;
}

.reservation-modal__counter-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
}

.reservation-modal__counter-value {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 800;
  color: #fff;
  line-height: 1;
  letter-spacing: -0.02em;
}

.reservation-modal__counter-label {
  font-size: 0.6875rem;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Summary - Matching meta items style */
.reservation-modal__summary {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 1rem;
  margin-top: 0.25rem;
  box-sizing: border-box;
}

.reservation-modal__summary-row {
  display: flex;
  gap: 0.75rem;
}

.reservation-modal__summary-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.reservation-modal__summary-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(220, 20, 60, 0.15);
}

.reservation-modal__summary-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  min-width: 32px;
  background: rgba(var(--color-primary-rgb), 0.12);
  border: 1px solid rgba(var(--color-primary-rgb), 0.2);
  border-radius: 8px;
  color: var(--color-primary);
  font-size: 0.75rem;
}

.reservation-modal__summary-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
  overflow: hidden;
}

.reservation-modal__summary-label {
  font-size: 0.5625rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.reservation-modal__summary-value {
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.reservation-modal__summary-price {
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-primary) 0%, #ff6b6b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Submit Button - WhatsApp branded with glass hover */
.reservation-modal__submit {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.875rem;
  width: 100%;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
  border: none;
  border-radius: 14px;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 0.5rem;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.reservation-modal__submit::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s ease;
}

.reservation-modal__submit:hover {
  transform: translateY(-3px);
  box-shadow:
    0 12px 32px rgba(37, 211, 102, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

.reservation-modal__submit:hover::before {
  left: 100%;
}

.reservation-modal__submit:active {
  transform: translateY(-1px);
}

.reservation-modal__submit-icon {
  font-size: 1.25rem;
}

.reservation-modal__submit-text {
  flex: 1;
}

.reservation-modal__submit-arrow {
  font-size: 0.75rem;
  transition: transform 0.3s ease;
}

.reservation-modal__submit:hover .reservation-modal__submit-arrow {
  transform: translateX(4px);
}

/* Footer Note - Subtle style */
.reservation-modal__footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 0.6875rem;
  color: rgba(255, 255, 255, 0.35);
  text-align: center;
}

.reservation-modal__footer i {
  font-size: 0.625rem;
  color: rgba(255, 255, 255, 0.25);
}

/* ============================================
   TRANSITIONS - Single animation source
   ============================================ */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease-out;
}

.modal-enter-active .reservation-modal__container,
.modal-leave-active .reservation-modal__container {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-out;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .reservation-modal__container {
  transform: scale(0.95) translateY(20px);
  opacity: 0;
}

.modal-leave-to .reservation-modal__container {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 768px) {
  .reservation-modal {
    padding: 0;
    align-items: flex-end;
  }

  .reservation-modal__container {
    width: 100%;
    max-width: 100%;
    max-height: 90vh;
    max-height: 90dvh;
    padding: 1.5rem 1.25rem;
    border-radius: 20px 20px 0 0;
    /* Animation handled by Vue Transition */
  }

  /* Mobile-specific transition: slide up from bottom */
  .modal-enter-from .reservation-modal__container {
    transform: translateY(100%);
    opacity: 1;
  }

  .modal-leave-to .reservation-modal__container {
    transform: translateY(100%);
    opacity: 1;
  }

  .reservation-modal__border-glow {
    border-radius: 21px 21px 0 0;
  }

  .reservation-modal__row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .reservation-modal__title {
    font-size: 1.25rem;
  }

  .reservation-modal__badge {
    padding: 8px 14px;
    gap: 6px;
  }

  .reservation-modal__badge-icon {
    font-size: 10px;
  }

  .reservation-modal__badge-text {
    font-size: 9px;
    letter-spacing: 1.25px;
  }

  .reservation-modal__label {
    font-size: 0.6875rem;
  }

  .reservation-modal__input {
    padding: 0.75rem 0.875rem;
    font-size: 1rem;
    border-radius: 10px;
  }

  .reservation-modal__counter {
    padding: 0.625rem 0.875rem;
    border-radius: 12px;
  }

  .reservation-modal__counter-btn {
    width: 36px;
    height: 36px;
    border-radius: 8px;
  }

  .reservation-modal__counter-value {
    font-size: 1.5rem;
  }

  .reservation-modal__counter-label {
    font-size: 0.625rem;
  }

  .reservation-modal__summary {
    padding: 0.75rem;
    border-radius: 12px;
  }

  .reservation-modal__summary-row {
    flex-direction: column;
    gap: 0.5rem;
  }

  .reservation-modal__summary-item {
    padding: 0.625rem;
    gap: 0.625rem;
    border-radius: 8px;
  }

  .reservation-modal__summary-icon {
    width: 28px;
    height: 28px;
    min-width: 28px;
    font-size: 0.625rem;
    border-radius: 6px;
  }

  .reservation-modal__summary-label {
    font-size: 0.5rem;
  }

  .reservation-modal__summary-value {
    font-size: 0.75rem;
  }

  .reservation-modal__summary-price {
    font-size: 0.875rem;
  }

  .reservation-modal__submit {
    padding: 0.875rem 1rem;
    font-size: 0.75rem;
    gap: 0.625rem;
    border-radius: 12px;
    letter-spacing: 0.5px;
  }

  .reservation-modal__submit-icon {
    font-size: 1.125rem;
  }

  .reservation-modal__footer {
    margin-top: 1rem;
    padding-top: 1rem;
    font-size: 0.625rem;
  }
}

@media (max-width: 380px) {
  .reservation-modal__container {
    padding: 1.25rem 1rem;
  }

  .reservation-modal__close {
    width: 30px;
    height: 30px;
    top: 0.875rem;
    right: 0.875rem;
    border-radius: 8px;
  }

  .reservation-modal__close i {
    font-size: 0.625rem;
  }

  .reservation-modal__header {
    margin-bottom: 1.25rem;
  }

  .reservation-modal__title {
    font-size: 1.125rem;
  }

  .reservation-modal__pack-name {
    font-size: 0.8125rem;
  }

  .reservation-modal__form {
    gap: 1rem;
  }

  .reservation-modal__label-icon {
    width: 18px;
    height: 18px;
    font-size: 0.4375rem;
    border-radius: 5px;
  }

  .reservation-modal__counter-btn {
    width: 32px;
    height: 32px;
  }

  .reservation-modal__counter-btn i {
    font-size: 0.625rem;
  }

  .reservation-modal__counter-value {
    font-size: 1.375rem;
  }
}
</style>
