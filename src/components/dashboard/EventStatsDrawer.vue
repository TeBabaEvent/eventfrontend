<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="isOpen" class="drawer-overlay" @click="close">
        <div class="drawer-container" @click.stop>
          <!-- Header -->
          <div class="drawer-header">
            <div class="drawer-header__info">
              <div class="drawer-header__badge">
                <i class="fas fa-chart-line"></i>
                Statistiques
              </div>
              <h2 class="drawer-header__title">{{ stats?.event_title || 'Chargement...' }}</h2>
              <p class="drawer-header__subtitle" v-if="eventDate">
                <i class="fas fa-calendar-alt"></i>
                {{ formatDate(eventDate) }}
              </p>
            </div>
            <button class="drawer-close" @click="close">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Content -->
          <div class="drawer-content">
            <!-- Loading -->
            <div v-if="isLoading" class="loading-state">
              <div class="spinner"></div>
              <p>Chargement des statistiques...</p>
            </div>

            <!-- Error -->
            <div v-else-if="error" class="error-state">
              <div class="error-icon">
                <i class="fas fa-exclamation-triangle"></i>
              </div>
              <p>{{ error }}</p>
              <button class="retry-btn" @click="loadStats">
                <i class="fas fa-redo"></i>
                Réessayer
              </button>
            </div>

            <!-- Stats Content -->
            <template v-else-if="stats">
              <!-- Revenue Highlight Card -->
              <div class="revenue-card">
                <div class="revenue-card__icon">
                  <i class="fas fa-euro-sign"></i>
                </div>
                <div class="revenue-card__content">
                  <span class="revenue-card__label">Revenus totaux</span>
                  <span class="revenue-card__value">{{ formatPrice(stats.total_revenue) }}</span>
                </div>
                <div class="revenue-card__orders">
                  <span>{{ stats.total_orders }}</span>
                  <small>commandes</small>
                </div>
              </div>

              <!-- KPI Cards -->
              <div class="kpi-grid">
                <div class="kpi-card kpi-card--tickets">
                  <div class="kpi-card__icon">
                    <i class="fas fa-ticket-alt"></i>
                  </div>
                  <div class="kpi-card__content">
                    <span class="kpi-card__value">{{ stats.tickets_sold }}</span>
                    <span class="kpi-card__label">Tickets vendus</span>
                  </div>
                </div>

                <div class="kpi-card kpi-card--scanned">
                  <div class="kpi-card__icon">
                    <i class="fas fa-qrcode"></i>
                  </div>
                  <div class="kpi-card__content">
                    <span class="kpi-card__value">{{ stats.tickets_scanned }}</span>
                    <span class="kpi-card__label">Scannés</span>
                  </div>
                </div>

                <div class="kpi-card kpi-card--rate">
                  <div class="kpi-card__icon">
                    <i class="fas fa-percentage"></i>
                  </div>
                  <div class="kpi-card__content">
                    <span class="kpi-card__value">{{ stats.scan_rate }}%</span>
                    <span class="kpi-card__label">Taux de scan</span>
                  </div>
                  <div class="kpi-card__progress">
                    <div class="kpi-card__progress-fill" :style="{ width: stats.scan_rate + '%' }"></div>
                  </div>
                </div>
              </div>

              <!-- Orders by Status Card -->
              <div class="stats-card">
                <div class="stats-card__header">
                  <div class="stats-card__icon stats-card__icon--orders">
                    <i class="fas fa-shopping-cart"></i>
                  </div>
                  <h3 class="stats-card__title">Commandes par statut</h3>
                </div>
                <div class="stats-card__body">
                  <div class="status-list">
                    <div class="status-item" v-for="(count, status) in stats.orders_by_status" :key="status">
                      <div class="status-item__left">
                        <span class="status-dot" :class="`status-dot--${status}`"></span>
                        <span class="status-item__label">{{ getStatusLabel(status as string) }}</span>
                      </div>
                      <div class="status-item__right">
                        <span class="status-item__count">{{ count }}</span>
                        <span class="status-item__percent">{{ getStatusPercentage(count) }}%</span>
                      </div>
                    </div>
                  </div>
                  <div class="status-bar-unified">
                    <div
                      v-for="(count, status) in stats.orders_by_status"
                      :key="status"
                      class="status-bar-segment"
                      :class="`segment--${status}`"
                      :style="{ width: getStatusPercentage(count) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Sales by Pack Card -->
              <div class="stats-card" v-if="stats.sales_by_pack.length > 0">
                <div class="stats-card__header">
                  <div class="stats-card__icon stats-card__icon--packs">
                    <i class="fas fa-layer-group"></i>
                  </div>
                  <h3 class="stats-card__title">Ventes par pack</h3>
                </div>
                <div class="stats-card__body stats-card__body--table">
                  <div class="pack-table">
                    <div class="pack-row pack-row--header">
                      <span>Pack</span>
                      <span>Cmd</span>
                      <span>Tickets</span>
                      <span>Revenus</span>
                    </div>
                    <div
                      v-for="pack in stats.sales_by_pack"
                      :key="pack.pack_name"
                      class="pack-row"
                    >
                      <span class="pack-name">
                        <span class="pack-badge">{{ pack.pack_name }}</span>
                      </span>
                      <span class="pack-cell">{{ pack.orders }}</span>
                      <span class="pack-cell">{{ pack.tickets }}</span>
                      <span class="pack-revenue">{{ formatPrice(pack.revenue) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Sales Chart Card -->
              <div class="stats-card" v-if="stats.sales_by_day.length > 0">
                <div class="stats-card__header">
                  <div class="stats-card__icon stats-card__icon--chart">
                    <i class="fas fa-chart-area"></i>
                  </div>
                  <h3 class="stats-card__title">Évolution des ventes</h3>
                </div>
                <div class="stats-card__body">
                  <div class="chart-wrapper">
                    <div class="chart-y-axis">
                      <span>{{ formatPriceShort(maxRevenue) }}</span>
                      <span>{{ formatPriceShort(maxRevenue / 2) }}</span>
                      <span>0 €</span>
                    </div>
                    <div class="chart-area">
                      <div class="chart-grid">
                        <div class="chart-grid-line"></div>
                        <div class="chart-grid-line"></div>
                        <div class="chart-grid-line"></div>
                      </div>
                      <div class="chart-bars">
                        <div
                          v-for="(day, index) in stats.sales_by_day"
                          :key="day.date"
                          class="chart-bar"
                          :style="{
                            '--height': getChartHeight(day.revenue) + '%',
                            '--delay': (index * 0.03) + 's'
                          }"
                        >
                          <div class="chart-bar__fill"></div>
                          <div class="chart-bar__tooltip">
                            <div class="tooltip-date">{{ formatShortDate(day.date) }}</div>
                            <div class="tooltip-value">{{ formatPrice(day.revenue) }}</div>
                            <div class="tooltip-orders">{{ day.orders }} commande(s)</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="chart-labels">
                    <span v-for="(day, index) in chartLabels" :key="index">{{ day }}</span>
                  </div>
                </div>
              </div>

              <!-- No sales yet -->
              <div v-if="stats.total_orders === 0" class="empty-stats">
                <div class="empty-stats__icon">
                  <i class="fas fa-chart-bar"></i>
                </div>
                <p class="empty-stats__title">Aucune vente</p>
                <p class="empty-stats__text">Cet événement n'a pas encore de commandes</p>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAdminDataStore } from '@/stores/adminData'
import { logger } from '@/services/logger'
import type { EventStats } from '@/types'

const props = defineProps<{
  isOpen: boolean
  eventId: string | null
  eventDate?: string
}>()

const emit = defineEmits<{
  close: []
}>()

const adminStore = useAdminDataStore()

const stats = ref<EventStats | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

// Watch for open/eventId changes
watch(
  () => [props.isOpen, props.eventId],
  ([open, id]) => {
    if (open && id) {
      loadStats()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  },
  { immediate: true }
)

async function loadStats() {
  if (!props.eventId) return

  isLoading.value = true
  error.value = null

  try {
    stats.value = await adminStore.fetchEventStats(props.eventId)
  } catch (e) {
    error.value = 'Impossible de charger les statistiques'
    logger.error('Error loading event stats:', e)
  } finally {
    isLoading.value = false
  }
}

function close() {
  emit('close')
}

// Formatters
function formatPrice(value: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function formatShortDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short'
  })
}

function formatPriceShort(value: number) {
  if (value >= 1000) {
    return (value / 1000).toFixed(1).replace('.0', '') + 'k €'
  }
  return value + ' €'
}

// Status helpers
function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    completed: 'Complétées',
    pending: 'En attente',
    failed: 'Échouées',
    refunded: 'Remboursées'
  }
  return labels[status] || status
}

const totalOrders = computed(() => {
  if (!stats.value?.orders_by_status) return 1
  return Object.values(stats.value.orders_by_status).reduce((a, b) => a + b, 0) || 1
})

function getStatusPercentage(count: number) {
  return Math.round((count / totalOrders.value) * 100)
}

// Chart helpers
const maxRevenue = computed(() => {
  if (!stats.value?.sales_by_day?.length) return 1
  return Math.max(...stats.value.sales_by_day.map(d => d.revenue)) || 1
})

function getChartHeight(revenue: number) {
  return Math.round((revenue / maxRevenue.value) * 100)
}

const chartLabels = computed(() => {
  if (!stats.value?.sales_by_day?.length) return []
  const days = stats.value.sales_by_day
  if (days.length <= 7) {
    return days.map(d => formatShortDate(d.date))
  }
  // Show only first, middle, and last for many days
  const first = days[0]
  const middle = days[Math.floor(days.length / 2)]
  const last = days[days.length - 1]
  return [
    first ? formatShortDate(first.date) : '',
    '',
    middle ? formatShortDate(middle.date) : '',
    '',
    last ? formatShortDate(last.date) : ''
  ]
})
</script>

<style scoped>
/* ============================================
   DRAWER - Base Styles (scoped won't work with @import)
   ============================================ */
.drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-drawer);
  display: flex;
  justify-content: flex-end;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  overflow: hidden;
}

.drawer-container {
  position: relative;
  width: 100%;
  max-width: 420px;
  height: 100vh;
  max-height: 100%;
  background: #08080c;
  display: flex;
  flex-direction: column;
  box-shadow: -20px 0 60px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  border-left: 1px solid rgba(255, 255, 255, 0.04);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(10, 10, 15, 0.8);
  flex-shrink: 0;
}

.drawer-close {
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

.drawer-close:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.drawer-content {
  flex: 1 1 0;
  min-height: 0; /* Critical for flex children with overflow */
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  padding: 1.25rem 1.5rem;
  padding-bottom: 1.5rem; /* Extra padding at bottom for last element visibility */
  display: flex;
  flex-direction: column;
  gap: 1rem;
  /* Scroll shadow indicators */
  background:
    /* Top shadow when scrolled */
    linear-gradient(to bottom, #08080c, #08080c) center top,
    linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.3)) center top,
    /* Bottom shadow when more content */
    linear-gradient(to top, #08080c, #08080c) center bottom,
    linear-gradient(to top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.3)) center bottom;
  background-repeat: no-repeat;
  background-size: 100% 20px, 100% 20px, 100% 20px, 100% 20px;
  background-attachment: local, scroll, local, scroll;
}

/* Custom Scrollbar */
.drawer-content::-webkit-scrollbar {
  width: 5px;
}

.drawer-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 3px;
}

.drawer-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
}

.drawer-content::-webkit-scrollbar-thumb:hover {
  background: rgba(220, 20, 60, 0.5);
}

/* Drawer Transitions */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-enter-active .drawer-container,
.drawer-leave-active .drawer-container {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .drawer-container,
.drawer-leave-to .drawer-container {
  transform: translateX(100%);
}

/* Responsive */
@media (max-width: 520px) {
  .drawer-container {
    max-width: 100%;
    border-left: none;
  }

  .drawer-content {
    padding: 1rem;
    padding-bottom: 1.25rem;
    gap: 0.875rem;
  }
}

/* ============================================
   DRAWER HEADER - Custom for Stats
   ============================================ */

.drawer-header__info {
  flex: 1;
  min-width: 0;
}

.drawer-header__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.6rem;
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.25);
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 600;
  color: #a78bfa;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.drawer-header__badge i {
  font-size: 0.6rem;
}

.drawer-header__title {
  font-family: var(--font-heading);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-white);
  margin: 0 0 0.35rem;
  line-height: 1.3;
}

.drawer-header__subtitle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.45);
  margin: 0;
}

.drawer-header__subtitle i {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.35);
}

/* Loading / Error / Empty States */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1.5rem;
  text-align: center;
}

.loading-state .spinner {
  width: 44px;
  height: 44px;
  border: 3px solid rgba(255, 255, 255, 0.08);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.error-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 50%;
  margin-bottom: 1rem;
}

.error-icon i {
  font-size: 1.5rem;
  color: #ef4444;
}

.error-state p {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.retry-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.25rem;
  padding: 0.625rem 1.25rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--color-white);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.retry-btn i {
  font-size: 0.7rem;
}

/* Empty Stats */
.empty-stats {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
}

.empty-stats__icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 50%;
  margin-bottom: 1rem;
}

.empty-stats__icon i {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.3);
}

.empty-stats__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-white);
  margin: 0 0 0.25rem;
}

.empty-stats__text {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.45);
  margin: 0;
}

/* ============================================
   REVENUE HIGHLIGHT CARD
   ============================================ */
.revenue-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.02) 100%);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 14px;
  flex-shrink: 0; /* Prevent shrinking */
}

.revenue-card__icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(16, 185, 129, 0.15);
  border-radius: 12px;
  font-size: 1.25rem;
  color: #10b981;
}

.revenue-card__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.revenue-card__label {
  font-size: 0.7rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.revenue-card__value {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 1.5rem;
  font-weight: 700;
  color: #10b981;
  letter-spacing: 0.5px;
}

.revenue-card__orders {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.revenue-card__orders span {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-white);
}

.revenue-card__orders small {
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.45);
  text-transform: uppercase;
}

/* ============================================
   KPI GRID
   ============================================ */
.kpi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  flex-shrink: 0; /* Prevent shrinking */
}

.kpi-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  position: relative;
  overflow: visible; /* Allow content to be fully visible */
  transition: all 0.2s ease;
}

.kpi-card:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.1);
}

.kpi-card--rate {
  grid-column: span 2;
  flex-direction: row;
  gap: 1rem;
}

.kpi-card--rate .kpi-card__content {
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.kpi-card--rate .kpi-card__value {
  font-size: 1.5rem;
}

.kpi-card--rate .kpi-card__label {
  font-size: 0.7rem;
}

.kpi-card__icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 0.95rem;
  flex-shrink: 0;
}

.kpi-card--tickets .kpi-card__icon {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.kpi-card--scanned .kpi-card__icon {
  background: rgba(168, 85, 247, 0.15);
  color: #a855f7;
}

.kpi-card--rate .kpi-card__icon {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.kpi-card__content {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.kpi-card__value {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-white);
  line-height: 1.2;
}

.kpi-card__label {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.45);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.kpi-card__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.06);
}

.kpi-card__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 0 2px 2px 0;
  transition: width 0.5s ease;
}

/* ============================================
   STATS CARDS
   ============================================ */
.stats-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  overflow: visible; /* Allow content to be fully visible */
  flex-shrink: 0; /* Prevent cards from shrinking */
}

.stats-card__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.stats-card__icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 0.8rem;
}

.stats-card__icon--orders {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.stats-card__icon--packs {
  background: rgba(139, 92, 246, 0.15);
  color: #a78bfa;
}

.stats-card__icon--chart {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.stats-card__title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.stats-card__body {
  padding: 1rem;
}

.stats-card__body--table {
  padding: 0.75rem;
}

/* ============================================
   STATUS LIST & BAR
   ============================================ */
.status-list {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  margin-bottom: 0.875rem;
}

.status-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.status-item__left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot--completed { background: #10b981; }
.status-dot--pending { background: #f59e0b; }
.status-dot--failed { background: #ef4444; }
.status-dot--refunded { background: #8b5cf6; }

.status-item__label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.75);
}

.status-item__right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-item__count {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-white);
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

.status-item__percent {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
  min-width: 32px;
  text-align: right;
}

.status-bar-unified {
  display: flex;
  height: 8px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  overflow: hidden;
}

.status-bar-segment {
  height: 100%;
  transition: width 0.5s ease;
}

.segment--completed { background: #10b981; }
.segment--pending { background: #f59e0b; }
.segment--failed { background: #ef4444; }
.segment--refunded { background: #8b5cf6; }

/* ============================================
   PACK TABLE
   ============================================ */
.pack-table {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pack-row {
  display: grid;
  grid-template-columns: 1.5fr 0.8fr 0.8fr 1fr;
  gap: 0.5rem;
  align-items: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  font-size: 0.8rem;
  transition: background 0.15s ease;
}

.pack-row:hover:not(.pack-row--header) {
  background: rgba(255, 255, 255, 0.04);
}

.pack-row--header {
  background: transparent;
  font-size: 0.65rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.35);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.5rem 0.75rem;
}

.pack-name {
  min-width: 0;
}

.pack-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: rgba(139, 92, 246, 0.12);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #a78bfa;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.pack-cell {
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
}

.pack-revenue {
  color: #10b981;
  font-weight: 600;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.75rem;
  text-align: right;
}

/* ============================================
   CHART
   ============================================ */
.chart-wrapper {
  display: flex;
  gap: 0.5rem;
  height: 140px;
}

.chart-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0.25rem 0;
  min-width: 40px;
}

.chart-y-axis span {
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.35);
  text-align: right;
}

.chart-area {
  flex: 1;
  position: relative;
}

.chart-grid {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}

.chart-grid-line {
  height: 1px;
  background: rgba(255, 255, 255, 0.04);
}

.chart-bars {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 4px;
  height: 100%;
  padding: 0 8px;
}

.chart-bar {
  flex: 1;
  min-width: 8px;
  max-width: 40px;
  height: var(--height, 0%);
  position: relative;
  cursor: pointer;
  animation: chartBarGrow 0.5s ease-out backwards;
  animation-delay: var(--delay, 0s);
}

@keyframes chartBarGrow {
  from {
    height: 0;
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.chart-bar__fill {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #10b981 0%, rgba(16, 185, 129, 0.4) 100%);
  border-radius: 4px 4px 0 0;
  transition: all 0.15s ease;
}

.chart-bar:hover .chart-bar__fill {
  filter: brightness(1.2);
}

.chart-bar__tooltip {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  padding: 0.625rem 0.875rem;
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  white-space: nowrap;
  display: none;
  flex-direction: column;
  gap: 0.25rem;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.chart-bar:hover .chart-bar__tooltip {
  display: flex;
}

.tooltip-date {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-white);
}

.tooltip-value {
  font-size: 0.85rem;
  font-weight: 700;
  color: #10b981;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

.tooltip-orders {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.5);
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.35);
  margin-left: 46px;
}

/* ============================================
   RESPONSIVE - Custom for Stats
   ============================================ */
@media (max-width: 520px) {
  .revenue-card {
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .revenue-card__orders {
    width: 100%;
    flex-direction: row;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.625rem;
    margin-top: 0.25rem;
  }

  .kpi-grid {
    gap: 0.5rem;
  }

  .kpi-card {
    padding: 0.875rem;
  }

  .kpi-card--rate {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .kpi-card--rate .kpi-card__content {
    flex-direction: row;
    justify-content: space-between;
  }

  .kpi-card__icon {
    width: 36px;
    height: 36px;
    font-size: 0.85rem;
  }

  .kpi-card__value {
    font-size: 1.1rem;
  }

  .chart-wrapper {
    height: 120px;
  }

  .chart-y-axis {
    min-width: 35px;
  }
}
</style>

