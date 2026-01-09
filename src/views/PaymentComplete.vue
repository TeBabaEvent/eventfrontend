<template>
  <div class="payment-page">
    <div class="payment-page__container">
      <!-- Loading State -->
      <Transition name="fade" mode="out-in">
        <div v-if="showLoading" key="loading" class="payment-card">
          <div class="payment-card__icon payment-card__icon--loading">
            <div class="spinner-ring"></div>
          </div>
          <h1 class="payment-card__title">{{ $t('payment.checking') }}</h1>
          <p class="payment-card__subtitle">{{ $t('payment.pleaseWait') }}</p>
        </div>

        <!-- Success State -->
        <div v-else-if="order && order.status === 'completed'" key="success" class="payment-card payment-card--success">
          <!-- Confetti effect -->
          <div class="confetti-container" aria-hidden="true">
            <span v-for="i in 20" :key="i" class="confetti" :style="confettiStyle(i)"></span>
          </div>

          <div class="payment-card__icon payment-card__icon--success">
            <i class="fas fa-check"></i>
          </div>

          <h1 class="payment-card__title">{{ order.amount === 0 ? $t('payment.success.titleFree') : $t('payment.success.title') }}</h1>
          <p class="payment-card__subtitle">{{ order.amount === 0 ? $t('payment.success.subtitleFree') : $t('payment.success.subtitle') }}</p>

          <!-- Order Summary -->
          <div class="order-summary">
            <div class="order-summary__header">
              <span class="order-number">{{ order.order_number }}</span>
              <span class="order-badge">{{ $t('payment.confirmed') }}</span>
            </div>

            <div class="order-summary__details">
              <div class="detail-row">
                <span class="detail-label">
                  <i class="fas fa-calendar-alt"></i>
                  {{ $t('payment.event') }}
                </span>
                <span class="detail-value">{{ eventName }}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">
                  <i class="fas fa-ticket-alt"></i>
                  {{ $t('payment.quantity') }}
                </span>
                <span class="detail-value">{{ totalQuantity }} {{ totalQuantity > 1 ? $t('payment.tickets') : $t('payment.ticket') }}</span>
              </div>

              <div class="detail-row detail-row--total">
                <span class="detail-label">
                  <i class="fas fa-euro-sign"></i>
                  {{ $t('payment.total') }}
                </span>
                <span class="detail-value detail-value--amount">{{ formatAmount(order.amount) }} €</span>
              </div>
            </div>
          </div>

          <!-- Email Notice -->
          <div class="email-notice">
            <i class="fas fa-envelope"></i>
            <p>{{ $t('payment.emailSent', { email: order.customer_email }) }}</p>
          </div>

          <!-- Actions -->
          <div class="payment-card__actions">
            <button class="btn btn--primary" @click="goToEvent">
              <i class="fas fa-arrow-left"></i>
              {{ $t('payment.viewEvent') }}
            </button>
            <button class="btn btn--ghost" @click="goToHome">
              {{ $t('payment.backToHome') }}
            </button>
          </div>
        </div>

        <!-- Pending State (Online payment processing) -->
        <div v-else-if="order && order.status === 'pending'" key="pending" class="payment-card payment-card--pending">
          <div class="payment-card__icon payment-card__icon--pending">
            <div class="spinner-ring"></div>
          </div>

          <h1 class="payment-card__title">{{ $t('payment.pending.title') }}</h1>
          <p class="payment-card__subtitle">{{ $t('payment.pending.subtitle') }}</p>

          <div class="order-number-display">
            <span class="label">{{ $t('payment.orderNumber') }}</span>
            <span class="value">{{ order.order_number }}</span>
          </div>

          <div class="payment-card__actions">
            <button class="btn btn--outline" @click="refreshStatus" :disabled="isLoading">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
              {{ $t('payment.refresh') }}
            </button>
          </div>

          <p class="auto-refresh-notice">
            <i class="fas fa-info-circle"></i>
            {{ $t('payment.autoRefresh') }}
          </p>
        </div>

        <!-- Pending Cash State -->
        <div v-else-if="order && order.status === 'pending_cash'" key="pending_cash" class="payment-card payment-card--pending-cash">
          <div class="payment-card__icon payment-card__icon--cash">
            <i class="fas fa-money-bill-wave"></i>
          </div>

          <h1 class="payment-card__title">{{ $t('payment.pendingCash.title') }}</h1>
          <p class="payment-card__subtitle">{{ $t('payment.pendingCash.subtitle') }}</p>

          <!-- Order Summary -->
          <div class="order-summary order-summary--cash">
            <div class="order-summary__header">
              <span class="order-number">{{ order.order_number }}</span>
              <span class="order-badge order-badge--pending">{{ $t('dashboard.orders.status.pending_cash') }}</span>
            </div>

            <div class="order-summary__details">
              <div class="detail-row">
                <span class="detail-label">
                  <i class="fas fa-calendar-alt"></i>
                  {{ $t('payment.event') }}
                </span>
                <span class="detail-value">{{ eventName }}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">
                  <i class="fas fa-ticket-alt"></i>
                  {{ $t('payment.quantity') }}
                </span>
                <span class="detail-value">{{ totalQuantity }} {{ totalQuantity > 1 ? $t('payment.tickets') : $t('payment.ticket') }}</span>
              </div>

              <div class="detail-row detail-row--total">
                <span class="detail-label">
                  <i class="fas fa-euro-sign"></i>
                  {{ $t('payment.total') }}
                </span>
                <span class="detail-value detail-value--amount">{{ formatAmount(order.amount) }} €</span>
              </div>
            </div>
          </div>

          <!-- Warning Notice -->
          <div class="warning-notice">
            <i class="fas fa-exclamation-triangle"></i>
            <p>{{ $t('payment.pendingCash.warning') }}</p>
          </div>

          <!-- Instructions -->
          <div class="email-notice">
            <i class="fas fa-envelope"></i>
            <p>{{ $t('payment.pendingCash.instructions') }}</p>
          </div>

          <!-- WhatsApp Contact -->
          <a :href="whatsappLink" target="_blank" class="whatsapp-btn">
            <i class="fab fa-whatsapp"></i>
            {{ $t('payment.pendingCash.contact') }}
          </a>

          <!-- Actions -->
          <div class="payment-card__actions">
            <button class="btn btn--primary" @click="goToEvent">
              <i class="fas fa-arrow-left"></i>
              {{ $t('payment.viewEvent') }}
            </button>
            <button class="btn btn--ghost" @click="goToHome">
              {{ $t('payment.backToHome') }}
            </button>
          </div>
        </div>

        <!-- Cancelled State -->
        <div v-else-if="order && order.status === 'cancelled'" key="cancelled" class="payment-card payment-card--cancelled">
          <div class="payment-card__icon payment-card__icon--warning">
            <i class="fas fa-ban"></i>
          </div>

          <h1 class="payment-card__title">{{ $t('payment.cancelled.title') }}</h1>
          <p class="payment-card__subtitle">{{ $t('payment.cancelled.subtitle') }}</p>

          <div class="order-number-display">
            <span class="label">{{ $t('payment.orderNumber') }}</span>
            <span class="value">{{ order.order_number }}</span>
          </div>

          <div class="payment-card__actions">
            <button class="btn btn--primary" @click="goToEvent">
              <i class="fas fa-redo"></i>
              {{ $t('payment.tryAgain') }}
            </button>
            <button class="btn btn--ghost" @click="goToHome">
              {{ $t('payment.backToHome') }}
            </button>
          </div>
        </div>

        <!-- Failed State -->
        <div v-else-if="order && order.status === 'failed'" key="failed" class="payment-card payment-card--failed">
          <div class="payment-card__icon payment-card__icon--error">
            <i class="fas fa-times"></i>
          </div>

          <h1 class="payment-card__title">{{ $t('payment.failed.title') }}</h1>
          <p class="payment-card__subtitle">{{ $t('payment.failed.subtitle') }}</p>

          <div class="order-number-display">
            <span class="label">{{ $t('payment.orderNumber') }}</span>
            <span class="value">{{ order.order_number }}</span>
          </div>

          <div class="payment-card__actions">
            <button class="btn btn--primary" @click="goToEvent">
              <i class="fas fa-redo"></i>
              {{ $t('payment.tryAgain') }}
            </button>
            <button class="btn btn--ghost" @click="goToHome">
              {{ $t('payment.backToHome') }}
            </button>
          </div>
        </div>

        <!-- Error State -->
        <div v-else key="error" class="payment-card payment-card--error">
          <div class="payment-card__icon payment-card__icon--error">
            <i class="fas fa-exclamation-triangle"></i>
          </div>

          <h1 class="payment-card__title">{{ $t('payment.error.title') }}</h1>
          <p class="payment-card__subtitle">{{ error || $t('payment.error.notFound') }}</p>

          <div class="payment-card__actions">
            <button class="btn btn--primary" @click="goToHome">
              <i class="fas fa-home"></i>
              {{ $t('payment.backToHome') }}
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCheckout } from '@/composables/useCheckout'
import { CONTACT_INFO } from '@/constants'
import type { Order } from '@/types'

const route = useRoute()
const router = useRouter()
const { isLoading, error, getOrderByNumber, pollOrderStatus, cancelOrder } = useCheckout()

const order = ref<Order | null>(null)
const isInitializing = ref(true)  // True until first API call completes

const orderNumber = computed(() => route.query.order as string | undefined)
// Récupérer le paramètre status de l'URL (cancelled, failed, etc.)
const urlStatus = computed(() => route.query.status as string | undefined)

// Show loading state during initialization OR during API calls
const showLoading = computed(() => isInitializing.value || (isLoading.value && !order.value))

const totalQuantity = computed(() => {
  if (!order.value) return 0
  // Use total_quantity if available (multi-pack), fallback to quantity (legacy)
  return order.value.total_quantity || order.value.quantity || 0
})

const eventName = computed(() => {
  if (!order.value) return ''
  // API returns event_name as flat field, or event.title as nested object
  const orderData = order.value as Order & { event_name?: string }
  return orderData.event_name || order.value.event?.title || ''
})

const whatsappLink = computed(() => {
  const phone = CONTACT_INFO.whatsapp.replace(/[^0-9+]/g, '')
  const message = `Bonjour, j'ai une réservation en attente de paiement cash.\n\nNuméro de commande: ${order.value?.order_number || ''}\nNom: ${order.value?.customer_name || ''}\nÉvénement: ${eventName.value}\n\nMerci de me contacter pour plus d'informations.`
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
})

/**
 * Generate random confetti style
 */
function confettiStyle(index: number) {
  const colors = ['#dc143c', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4']
  const left = Math.random() * 100
  const delay = Math.random() * 2
  const duration = 2 + Math.random() * 2
  const size = 6 + Math.random() * 8

  return {
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: colors[index % colors.length]
  }
}

/**
 * Charge le statut de la commande
 */
async function loadOrderStatus() {
  if (!orderNumber.value) {
    error.value = 'Numéro de commande manquant'
    isInitializing.value = false
    return
  }

  try {
    // Si le paramètre URL indique une annulation ou un échec,
    // on met d'abord à jour le statut côté backend
    if (urlStatus.value === 'cancelled' || urlStatus.value === 'failed') {
      await cancelOrder(orderNumber.value)
    }

    // Charger la commande depuis l'API
    order.value = await getOrderByNumber(orderNumber.value)

    // Si la commande est en attente ET qu'on n'a pas reçu d'indication d'annulation/échec,
    // démarrer le polling automatique
    if (order.value && order.value.status === 'pending' && !urlStatus.value) {
      startPolling()
    }
  } finally {
    isInitializing.value = false
  }
}

/**
 * Démarre le polling automatique pour les paiements en attente
 * Utilise un polling agressif au début (1.5s) puis normal (3s)
 */
async function startPolling() {
  if (!orderNumber.value) return

  // Phase 1: Polling rapide pendant les 15 premières secondes (1.5s interval)
  // Le webhook PayPal arrive généralement dans les 5-10 secondes
  const quickPollOrder = await pollOrderStatus(
    orderNumber.value,
    10,  // 10 tentatives
    1500, // 1.5 secondes
    (updatedOrder) => {
      order.value = updatedOrder
    }
  )

  if (quickPollOrder && (quickPollOrder.status === 'completed' || quickPollOrder.status === 'failed' || quickPollOrder.status === 'cancelled')) {
    order.value = quickPollOrder
    return
  }

  // Phase 2: Si toujours pending, continuer avec un polling normal (3s)
  const finalOrder = await pollOrderStatus(
    orderNumber.value,
    30,  // 30 tentatives supplémentaires (~1.5 minutes)
    3000,
    (updatedOrder) => {
      order.value = updatedOrder
    }
  )

  if (finalOrder) {
    order.value = finalOrder
  }
}

/**
 * Rafraîchit manuellement le statut
 */
async function refreshStatus() {
  await loadOrderStatus()
}

/**
 * Formate un montant (déjà en euros depuis l'API)
 */
function formatAmount(euros: number): string {
  return euros.toFixed(2)
}

/**
 * Redirige vers la page de l'événement
 */
function goToEvent() {
  if (order.value?.event_slug) {
    router.push(`/events/${order.value.event_slug}`)
  } else {
    goToHome()
  }
}

/**
 * Redirige vers la page d'accueil
 */
function goToHome() {
  router.push('/')
}

onMounted(() => {
  loadOrderStatus()
})
</script>

<style scoped>
/* ============================================
   PAYMENT PAGE - Uses Global Background
   ============================================ */

.payment-page {
  min-height: 100vh;
  min-height: 100dvh; /* Dynamic viewport height for mobile */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  padding-top: max(2rem, env(safe-area-inset-top));
  padding-bottom: max(2rem, env(safe-area-inset-bottom));
  background: transparent; /* Let GlobalBackground show through */
  position: relative;
}

.payment-page__container {
  max-width: 440px;
  width: 100%;
  position: relative;
  z-index: 1;
}

/* ============================================
   PAYMENT CARD
   ============================================ */

.payment-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  padding: 2rem 1.75rem;
  text-align: center;
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
}

.payment-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--color-primary, #dc143c), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.payment-card--success::before {
  background: linear-gradient(90deg, transparent, #10b981, transparent);
  opacity: 1;
}

.payment-card--pending::before {
  background: linear-gradient(90deg, transparent, #f59e0b, transparent);
  opacity: 1;
}

.payment-card--pending-cash::before {
  background: linear-gradient(90deg, transparent, #f59e0b, transparent);
  opacity: 1;
}

.payment-card--failed::before,
.payment-card--error::before {
  background: linear-gradient(90deg, transparent, #ef4444, transparent);
  opacity: 1;
}

.payment-card--cancelled::before {
  background: linear-gradient(90deg, transparent, #f59e0b, transparent);
  opacity: 1;
}

/* Icon */
.payment-card__icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 1.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.payment-card__icon--success {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  animation: iconPop 0.5s ease-out;
}

.payment-card__icon--error {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.payment-card__icon--warning {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.payment-card__icon--loading {
  background: rgba(255, 255, 255, 0.05);
}

.payment-card__icon--pending {
  background: rgba(245, 158, 11, 0.1);
}

.payment-card__icon--pending .spinner-ring {
  border-top-color: #f59e0b;
}

.payment-card__icon--cash {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  animation: iconPop 0.5s ease-out;
}

@keyframes iconPop {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* Spinner */
.spinner-ring {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--color-primary, #dc143c);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Typography */
.payment-card__title {
  font-family: var(--font-heading, 'Clash Display', sans-serif);
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 0.35rem;
}

.payment-card__subtitle {
  font-size: 0.925rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 1.5rem;
}

/* ============================================
   ORDER SUMMARY
   ============================================ */

.order-summary {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 1.25rem;
  text-align: left;
}

.order-summary__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.order-number {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.5px;
}

.order-badge {
  padding: 0.25rem 0.75rem;
  background: rgba(16, 185, 129, 0.15);
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #10b981;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.order-badge--pending {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.order-summary__details {
  padding: 0.75rem 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row--total {
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
}

.detail-label i {
  width: 16px;
  color: var(--color-primary, #dc143c);
  opacity: 0.7;
}

.detail-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
}

.detail-value--amount {
  font-size: 1.25rem;
  color: var(--color-primary, #dc143c);
}

/* ============================================
   EMAIL NOTICE
   ============================================ */

.email-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-radius: 10px;
  margin-bottom: 1.25rem;
}

.email-notice i {
  color: #10b981;
  font-size: 1rem;
}

.email-notice p {
  margin: 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
}

/* ============================================
   WARNING NOTICE (Cash)
   ============================================ */

.warning-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 10px;
  margin-bottom: 1rem;
  text-align: left;
}

.warning-notice i {
  color: #f59e0b;
  font-size: 1.1rem;
  margin-top: 0.1rem;
  flex-shrink: 0;
}

.warning-notice p {
  margin: 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
}

/* ============================================
   WHATSAPP BUTTON
   ============================================ */

.whatsapp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.9rem 1.5rem;
  background: #25D366;
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.2s ease;
  margin-bottom: 1.25rem;
}

.whatsapp-btn:hover {
  background: #1ebe5d;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
}

.whatsapp-btn i {
  font-size: 1.2rem;
}

/* ============================================
   ORDER NUMBER DISPLAY (Pending/Failed)
   ============================================ */

.order-number-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 1.25rem;
}

.order-number-display .label {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.order-number-display .value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  padding: 0.4rem 0.875rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.auto-refresh-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  margin-top: 1.25rem;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.35);
}

.auto-refresh-notice i {
  color: #f59e0b;
  opacity: 0.7;
}

/* ============================================
   ACTIONS
   ============================================ */

.payment-card__actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn--primary {
  background: linear-gradient(135deg, var(--color-primary, #dc143c) 0%, #a80329 100%);
  color: #fff;
}

.btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(220, 20, 60, 0.4);
}

.btn--outline {
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn--outline:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.3);
}

.btn--outline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--ghost {
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
}

.btn--ghost:hover {
  color: #fff;
}

/* ============================================
   CONFETTI
   ============================================ */

.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.confetti {
  position: absolute;
  top: -20px;
  border-radius: 2px;
  animation: confettiFall 3s ease-in forwards;
  opacity: 0;
}

@keyframes confettiFall {
  0% {
    opacity: 1;
    transform: translateY(0) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: translateY(400px) rotate(720deg);
  }
}

/* ============================================
   TRANSITIONS
   ============================================ */

.fade-enter-active,
.fade-leave-active {
  transition: all 0.4s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* ============================================
   RESPONSIVE
   ============================================ */

/* Tablet */
@media (max-width: 768px) {
  .payment-page {
    padding: 1.5rem 1rem;
    padding-top: max(5rem, env(safe-area-inset-top) + 3rem);
    align-items: center;
  }

  .payment-page__container {
    max-width: 100%;
  }

  .payment-card {
    padding: 1.75rem 1.25rem;
    border-radius: 18px;
  }

  .payment-card__title {
    font-size: 1.35rem;
  }

  .payment-card__subtitle {
    font-size: 0.875rem;
    margin-bottom: 1.25rem;
  }

  .payment-card__icon {
    width: 64px;
    height: 64px;
    font-size: 1.75rem;
    margin-bottom: 1rem;
  }

  .order-summary__header {
    padding: 0.75rem 0.875rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .order-number {
    font-size: 0.85rem;
  }

  .order-summary__details {
    padding: 0.75rem 0.875rem;
  }

  .detail-row {
    padding: 0.5rem 0;
  }

  .detail-label {
    font-size: 0.8rem;
  }

  .detail-value {
    font-size: 0.85rem;
  }

  .email-notice {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
    padding: 0.875rem;
  }

  .email-notice p {
    font-size: 0.8rem;
    word-break: break-word;
  }

  .spinner-ring {
    width: 42px;
    height: 42px;
  }

  .order-number-display {
    margin-bottom: 1rem;
  }

  .order-number-display .value {
    font-size: 0.9rem;
    padding: 0.35rem 0.75rem;
  }

  .auto-refresh-notice {
    margin-top: 1rem;
  }

  .payment-card__actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn {
    width: 100%;
    padding: 0.75rem 1.25rem;
    font-size: 0.875rem;
  }
}

/* Mobile Small */
@media (max-width: 480px) {
  .payment-page {
    padding: 1rem 0.75rem;
    padding-top: max(4rem, env(safe-area-inset-top) + 2rem);
  }

  .payment-card {
    padding: 1.25rem 0.875rem;
    border-radius: 14px;
  }

  .payment-card__title {
    font-size: 1.25rem;
    line-height: 1.3;
  }

  .payment-card__subtitle {
    font-size: 0.8rem;
    margin-bottom: 1rem;
  }

  .payment-card__icon {
    width: 56px;
    height: 56px;
    font-size: 1.5rem;
    margin-bottom: 0.875rem;
  }

  .spinner-ring {
    width: 36px;
    height: 36px;
  }

  .order-summary {
    border-radius: 12px;
    margin-bottom: 1rem;
  }

  .order-summary__header {
    padding: 0.625rem 0.75rem;
  }

  .order-summary__details {
    padding: 0.625rem 0.75rem;
  }

  .order-badge {
    font-size: 0.6rem;
    padding: 0.175rem 0.5rem;
  }

  .detail-row {
    padding: 0.4rem 0;
  }

  .detail-label {
    font-size: 0.75rem;
  }

  .detail-value {
    font-size: 0.8rem;
  }

  .detail-value--amount {
    font-size: 1rem;
  }

  .email-notice {
    padding: 0.75rem;
    margin-bottom: 1rem;
    border-radius: 8px;
  }

  .email-notice i {
    font-size: 0.875rem;
  }

  .email-notice p {
    font-size: 0.75rem;
  }

  .order-number-display .value {
    font-size: 0.925rem;
    padding: 0.375rem 0.75rem;
  }

  .auto-refresh-notice {
    font-size: 0.7rem;
    margin-top: 1rem;
  }

  .btn {
    padding: 0.7rem 1rem;
    font-size: 0.825rem;
  }

  .confetti-container {
    display: none; /* Save performance on small devices */
  }
}

/* Landscape orientation on mobile */
@media (max-height: 500px) and (orientation: landscape) {
  .payment-page {
    padding-top: 1rem;
    align-items: center;
  }

  .payment-card {
    padding: 1rem 1.25rem;
    max-height: 90vh;
    overflow-y: auto;
  }

  .payment-card__icon {
    width: 44px;
    height: 44px;
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }

  .payment-card__title {
    font-size: 1.15rem;
    margin-bottom: 0.2rem;
  }

  .payment-card__subtitle {
    font-size: 0.8rem;
    margin-bottom: 0.75rem;
  }

  .order-summary {
    margin-bottom: 0.75rem;
  }

  .email-notice {
    margin-bottom: 0.75rem;
    padding: 0.5rem;
  }

  .spinner-ring {
    width: 32px;
    height: 32px;
  }

  .order-number-display {
    margin-bottom: 0.75rem;
  }

  .order-number-display .value {
    font-size: 0.85rem;
    padding: 0.25rem 0.5rem;
  }

  .auto-refresh-notice {
    margin-top: 0.75rem;
    font-size: 0.65rem;
  }

  .btn {
    padding: 0.5rem 1rem;
  }
}

/* Reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .spinner-ring {
    animation: spin 2s linear infinite;
  }

  .confetti {
    animation: none;
    display: none;
  }
}
</style>
