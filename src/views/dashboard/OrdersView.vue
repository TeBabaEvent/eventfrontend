<template>
  <div class="orders-view">
    <!-- Page Header with Stats -->
    <div class="page-header">
      <div class="page-header__left">
        <h1 class="page-header__title">{{ $t('dashboard.orders.title') }}</h1>
        <p class="page-header__count">{{ totalOrders }} {{ $t('dashboard.orders.count') }}</p>
      </div>
    </div>

    <!-- Stats Cards - Skeleton Loading -->
    <div v-if="isInitialLoading" class="stats-row">
      <SkeletonStatCard v-for="n in 4" :key="n" />
    </div>

    <!-- Stats Cards -->
    <div v-else class="stats-row">
      <div class="stat-card" style="--delay: 0">
        <div class="stat-card__glow stat-card__glow--success"></div>
        <div class="stat-card__header">
          <span class="stat-card__title">{{ $t('dashboard.orders.stats.revenue') }}</span>
          <div class="stat-card__icon stat-card__icon--success">
            <i class="fas fa-euro-sign"></i>
          </div>
        </div>
        <div class="stat-card__value">{{ formatPrice(stats.revenue) }}</div>
        <div class="stat-card__change stat-card__change--positive">
          <i class="fas fa-check-circle"></i>
          {{ stats.completed }} {{ $t('dashboard.orders.stats.completed').toLowerCase() }}
        </div>
      </div>

      <div class="stat-card" style="--delay: 1">
        <div class="stat-card__glow stat-card__glow--info"></div>
        <div class="stat-card__header">
          <span class="stat-card__title">{{ $t('dashboard.orders.stats.completed') }}</span>
          <div class="stat-card__icon stat-card__icon--info">
            <i class="fas fa-check-circle"></i>
          </div>
        </div>
        <div class="stat-card__value">{{ stats.completed }}</div>
        <div class="stat-card__change">
          <i class="fas fa-shopping-cart"></i>
          {{ $t('dashboard.orders.count') }}
        </div>
      </div>

      <div class="stat-card" style="--delay: 2">
        <div class="stat-card__glow stat-card__glow--warning"></div>
        <div class="stat-card__header">
          <span class="stat-card__title">{{ $t('dashboard.orders.stats.pending') }}</span>
          <div class="stat-card__icon stat-card__icon--warning">
            <i class="fas fa-clock"></i>
          </div>
        </div>
        <div class="stat-card__value">{{ stats.pending }}</div>
        <div class="stat-card__change">
          <i class="fas fa-hourglass-half"></i>
          En attente
        </div>
      </div>

      <div class="stat-card" style="--delay: 3">
        <div class="stat-card__glow stat-card__glow--danger"></div>
        <div class="stat-card__header">
          <span class="stat-card__title">{{ $t('dashboard.orders.stats.failed') }}</span>
          <div class="stat-card__icon stat-card__icon--danger">
            <i class="fas fa-times-circle"></i>
          </div>
        </div>
        <div class="stat-card__value">{{ stats.failed }}</div>
        <div class="stat-card__change">
          <i class="fas fa-exclamation-triangle"></i>
          Échouées
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <div class="filters-bar__left">
        <div class="filter-select-wrapper">
          <i class="fas fa-calendar-alt"></i>
          <select v-model="filters.event_id" class="filter-select" @change="loadOrders">
            <option value="">{{ $t('dashboard.orders.filters.allEvents') }}</option>
            <option v-for="event in events" :key="event.id" :value="event.id">
              {{ event.title }}
            </option>
          </select>
          <i class="fas fa-chevron-down filter-arrow"></i>
        </div>
        <div class="filter-select-wrapper">
          <i class="fas fa-filter"></i>
          <select v-model="filters.status" class="filter-select" @change="loadOrders">
            <option value="">{{ $t('dashboard.orders.filters.allStatuses') }}</option>
            <option value="completed">{{ $t('dashboard.orders.status.completed') }}</option>
            <option value="pending">{{ $t('dashboard.orders.status.pending') }}</option>
            <option value="failed">{{ $t('dashboard.orders.status.failed') }}</option>
            <option value="refunded">{{ $t('dashboard.orders.status.refunded') }}</option>
          </select>
          <i class="fas fa-chevron-down filter-arrow"></i>
        </div>
        <div class="search-input">
          <i class="fas fa-search"></i>
          <input
            v-model="filters.search"
            type="text"
            :placeholder="$t('dashboard.orders.filters.search')"
            @input="debouncedSearch"
          >
        </div>
      </div>
      <div class="filters-bar__right">
        <div class="date-range">
          <div class="date-input-wrapper">
            <i class="fas fa-calendar"></i>
            <input
              v-model="filters.date_from"
              type="date"
              class="filter-date"
              @change="loadOrders"
            >
          </div>
          <span class="date-separator">
            <i class="fas fa-arrow-right"></i>
          </span>
          <div class="date-input-wrapper">
            <i class="fas fa-calendar"></i>
            <input
              v-model="filters.date_to"
              type="date"
              class="filter-date"
              @change="loadOrders"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="table-loading">
      <div class="spinner"></div>
      <span>{{ $t('common.loading') }}</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="orders.length === 0" class="empty-state">
      <div class="empty-state__icon">
        <i class="fas fa-receipt"></i>
      </div>
      <h3 class="empty-state__title">{{ $t('dashboard.orders.noOrders') }}</h3>
      <p class="empty-state__text">{{ $t('dashboard.orders.noOrdersDesc') }}</p>
    </div>

    <!-- Orders Table -->
    <div v-else class="table-container">
      <table class="orders-table">
        <thead>
          <tr>
            <th class="col-order">{{ $t('dashboard.orders.table.orderNumber') }}</th>
            <th class="col-customer">{{ $t('dashboard.orders.table.customer') }}</th>
            <th class="col-event">{{ $t('dashboard.orders.table.event') }}</th>
            <th class="col-pack">{{ $t('dashboard.orders.table.pack') }}</th>
            <th class="col-amount">{{ $t('dashboard.orders.table.amount') }}</th>
            <th class="col-status">{{ $t('dashboard.orders.table.status') }}</th>
            <th class="col-date">{{ $t('dashboard.orders.table.date') }}</th>
            <th class="col-actions">{{ $t('dashboard.orders.table.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="order in orders"
            :key="order.id"
            class="order-row"
            @click="openOrderDetail(order)"
          >
            <td class="col-order">
              <code class="order-code">{{ order.order_number }}</code>
            </td>
            <td class="col-customer">
              <div class="customer-info">
                <span class="customer-name">{{ order.customer_name }}</span>
                <span class="customer-email">{{ order.customer_email }}</span>
              </div>
            </td>
            <td class="col-event">
              <span class="event-name">{{ order.event_title }}</span>
            </td>
            <td class="col-pack">
              <div class="pack-info">
                <span class="pack-badge">{{ order.pack_display }}</span>
                <span class="pack-qty">×{{ order.total_quantity }}</span>
              </div>
            </td>
            <td class="col-amount">
              <span class="amount">{{ formatPrice(order.amount) }}</span>
            </td>
            <td class="col-status">
              <span :class="['status-badge', `status-badge--${order.status}`]">
                <i :class="getStatusIcon(order.status)"></i>
                {{ $t(`dashboard.orders.status.${order.status}`) }}
              </span>
            </td>
            <td class="col-date">
              <span class="date">{{ formatDate(order.created_at) }}</span>
            </td>
            <td class="col-actions" @click.stop>
              <button
                class="action-btn"
                :title="$t('dashboard.orders.actions.view')"
                @click="openOrderDetail(order)"
              >
                <i class="fas fa-eye"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination">
        <button
          class="pagination__btn"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        <span class="pagination__info">
          {{ $t('dashboard.orders.pagination.page') }} {{ currentPage }} / {{ totalPages }}
        </span>
        <button
          class="pagination__btn"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Order Detail Drawer -->
    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="selectedOrder" class="drawer-overlay" @click="closeDrawer">
          <div class="drawer" @click.stop>
            <!-- Drawer Header -->
            <div class="drawer__header">
              <div class="drawer__title-row">
                <!-- Back button when in refund view -->
                <button
                  v-if="drawerView === 'refund'"
                  class="drawer__back"
                  @click="cancelRefund"
                >
                  <i class="fas fa-arrow-left"></i>
                </button>
                <div class="drawer__order-id">
                  <code>{{ selectedOrder.order_number }}</code>
                </div>
                <span :class="['status-pill', `status-pill--${selectedOrder.status}`]">
                  <i :class="getStatusIcon(selectedOrder.status)"></i>
                  {{ $t(`dashboard.orders.status.${selectedOrder.status}`) }}
                </span>
              </div>
              <button class="drawer__close" @click="closeDrawer">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <!-- Details View -->
            <template v-if="drawerView === 'details'">
              <div class="drawer__content">
                <!-- Customer Card -->
                <div class="detail-card">
                  <div class="detail-card__header">
                    <div class="detail-card__icon detail-card__icon--customer">
                      <i class="fas fa-user"></i>
                    </div>
                    <h4 class="detail-card__title">{{ $t('dashboard.orders.detail.customer') }}</h4>
                  </div>
                  <div class="detail-card__body">
                    <div class="detail-row">
                      <span class="detail-label">{{ $t('dashboard.orders.detail.name') }}</span>
                      <span class="detail-value">{{ selectedOrder.customer_name }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">{{ $t('dashboard.orders.detail.email') }}</span>
                      <span class="detail-value detail-value--email">{{ selectedOrder.customer_email }}</span>
                    </div>
                    <div class="detail-row" v-if="selectedOrder.customer_phone">
                      <span class="detail-label">{{ $t('dashboard.orders.detail.phone') }}</span>
                      <span class="detail-value">{{ selectedOrder.customer_phone }}</span>
                    </div>
                  </div>
                </div>

                <!-- Event Card -->
                <div class="detail-card">
                  <div class="detail-card__header">
                    <div class="detail-card__icon detail-card__icon--event">
                      <i class="fas fa-calendar-alt"></i>
                    </div>
                    <h4 class="detail-card__title">{{ $t('dashboard.orders.detail.event') }}</h4>
                  </div>
                  <div class="detail-card__body">
                    <div class="detail-row detail-row--highlight">
                      <span class="detail-label">{{ $t('dashboard.orders.detail.eventName') }}</span>
                      <span class="detail-value detail-value--event">{{ selectedOrder.event_title }}</span>
                    </div>
                    <div class="detail-row-grid">
                      <div class="detail-cell">
                        <span class="detail-label">{{ $t('dashboard.orders.detail.eventDate') }}</span>
                        <span class="detail-value">{{ formatDate(selectedOrder.event_date) }}</span>
                      </div>
                      <div class="detail-cell">
                        <span class="detail-label">{{ $t('dashboard.orders.detail.pack') }}</span>
                        <span class="detail-value">
                          <span class="pack-pill">{{ selectedOrder.pack_display }}</span>
                          <span class="pack-multiplier">× {{ selectedOrder.total_quantity }}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Payment Card -->
                <div class="detail-card detail-card--payment">
                  <div class="detail-card__header">
                    <div class="detail-card__icon detail-card__icon--payment">
                      <i class="fas fa-credit-card"></i>
                    </div>
                    <h4 class="detail-card__title">{{ $t('dashboard.orders.detail.payment') }}</h4>
                  </div>
                  <div class="detail-card__body">
                    <div class="payment-amount-row">
                      <span class="detail-label">{{ $t('dashboard.orders.detail.amount') }}</span>
                      <span class="payment-amount">{{ formatPrice(selectedOrder.amount) }}</span>
                    </div>
                    <div class="detail-row-grid">
                      <div class="detail-cell">
                        <span class="detail-label">{{ $t('dashboard.orders.detail.createdAt') }}</span>
                        <span class="detail-value">{{ formatDateTime(selectedOrder.created_at) }}</span>
                      </div>
                      <div class="detail-cell" v-if="selectedOrder.paid_at">
                        <span class="detail-label">{{ $t('dashboard.orders.detail.paidAt') }}</span>
                        <span class="detail-value">{{ formatDateTime(selectedOrder.paid_at) }}</span>
                      </div>
                    </div>
                    <div class="detail-row" v-if="selectedOrder.ccv_reference">
                      <span class="detail-label">{{ $t('dashboard.orders.detail.ccvRef') }}</span>
                      <code class="ccv-ref">{{ selectedOrder.ccv_reference }}</code>
                    </div>
                  </div>
                </div>

                <!-- Tickets Card -->
                <div class="detail-card" v-if="selectedOrder.tickets && selectedOrder.tickets.length > 0">
                  <div class="detail-card__header">
                    <div class="detail-card__icon detail-card__icon--tickets">
                      <i class="fas fa-ticket-alt"></i>
                    </div>
                    <h4 class="detail-card__title">
                      {{ $t('dashboard.orders.detail.tickets') }}
                      <span class="tickets-count">({{ selectedOrder.tickets.length }})</span>
                    </h4>
                  </div>
                  <div class="detail-card__body detail-card__body--tickets">
                    <div
                      v-for="(ticket, index) in selectedOrder.tickets"
                      :key="ticket.id"
                      :class="['ticket-card', `ticket-card--${ticket.status}`]"
                    >
                      <div class="ticket-card__left">
                        <code class="ticket-card__code">{{ ticket.ticket_code }}</code>
                        <span class="ticket-card__holder">{{ ticket.holder_name || `${$t('dashboard.orders.detail.guest')} ${index + 1}` }}</span>
                      </div>
                      <div class="ticket-card__right">
                        <div v-if="ticket.status === 'used'" class="ticket-status ticket-status--scanned">
                          <i class="fas fa-check-circle"></i>
                          <div class="ticket-status__text">
                            <span>{{ $t('dashboard.orders.detail.scanned') }}</span>
                            <small v-if="ticket.scanned_at">{{ formatTime(ticket.scanned_at) }}</small>
                          </div>
                        </div>
                        <div v-else-if="ticket.status === 'valid'" class="ticket-status ticket-status--valid">
                          <i class="fas fa-circle"></i>
                          <span>{{ $t('dashboard.orders.detail.notUsed') }}</span>
                        </div>
                        <div v-else class="ticket-status ticket-status--cancelled">
                          <i class="fas fa-times-circle"></i>
                          <span>{{ $t('dashboard.orders.detail.cancelled') }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Actions Footer - Completed Orders -->
              <div class="drawer__footer" v-if="selectedOrder.status === 'completed'">
                <button
                  class="drawer-btn drawer-btn--secondary"
                  :disabled="isResending"
                  @click="resendEmail"
                >
                  <i class="fas fa-envelope"></i>
                  <span>{{ isResending ? $t('common.sending') : $t('dashboard.orders.actions.resendEmail') }}</span>
                </button>
                <button
                  class="drawer-btn drawer-btn--danger"
                  @click="showRefundView"
                >
                  <i class="fas fa-undo"></i>
                  <span>{{ $t('dashboard.orders.actions.refund') }}</span>
                </button>
              </div>

              <!-- Actions Footer - Pending Cash -->
              <div class="drawer__footer" v-else-if="selectedOrder.status === 'pending_cash'">
                <button
                  class="drawer-btn drawer-btn--success"
                  :disabled="isMarkingPaid"
                  @click="markAsPaid"
                >
                  <i :class="isMarkingPaid ? 'fas fa-circle-notch fa-spin' : 'fas fa-check-circle'"></i>
                  <span>{{ isMarkingPaid ? $t('dashboard.orders.actions.markingPaid') : $t('dashboard.orders.actions.markPaid') }}</span>
                </button>
              </div>
            </template>

            <!-- Refund View -->
            <template v-else-if="drawerView === 'refund'">
              <div class="drawer__content">
                <!-- Refund Header Card -->
                <div class="refund-header-card">
                  <div class="refund-header-card__icon">
                    <i class="fas fa-undo"></i>
                  </div>
                  <div class="refund-header-card__content">
                    <h3 class="refund-header-card__title">{{ $t('dashboard.orders.refund.title') }}</h3>
                    <p class="refund-header-card__subtitle">{{ selectedOrder.customer_name }}</p>
                  </div>
                </div>

                <!-- Warning -->
                <div class="refund-warning">
                  <i class="fas fa-exclamation-triangle"></i>
                  <p>{{ $t('dashboard.orders.refund.warning') }}</p>
                </div>

                <!-- Order Summary -->
                <div class="detail-card">
                  <div class="detail-card__header">
                    <div class="detail-card__icon detail-card__icon--payment">
                      <i class="fas fa-receipt"></i>
                    </div>
                    <h4 class="detail-card__title">Récapitulatif</h4>
                  </div>
                  <div class="detail-card__body">
                    <div class="detail-row">
                      <span class="detail-label">Événement</span>
                      <span class="detail-value">{{ selectedOrder.event_title }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Billets</span>
                      <span class="detail-value">{{ selectedOrder.total_quantity }}</span>
                    </div>
                    <div class="payment-amount-row">
                      <span class="detail-label">Montant payé</span>
                      <span class="payment-amount">{{ formatPrice(selectedOrder.amount) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Refund Form -->
                <div class="refund-form">
                  <div class="form-group">
                    <label class="form-label">
                      <i class="fas fa-euro-sign"></i>
                      {{ $t('dashboard.orders.refund.amount') }}
                    </label>
                    <div class="amount-input-wrapper">
                      <input
                        v-model.number="refundAmount"
                        type="number"
                        step="0.01"
                        min="0"
                        :max="selectedOrder.amount"
                        class="form-input amount-input"
                        :placeholder="selectedOrder.amount.toString()"
                      >
                      <span class="amount-suffix">€</span>
                    </div>
                    <small class="form-help">{{ $t('dashboard.orders.refund.amountHint', { max: selectedOrder.amount }) }}</small>
                  </div>

                  <div class="form-group">
                    <label class="form-label">
                      <i class="fas fa-comment-alt"></i>
                      {{ $t('dashboard.orders.refund.reason') }}
                    </label>
                    <textarea
                      v-model="refundReason"
                      rows="3"
                      class="form-textarea"
                      :placeholder="$t('dashboard.orders.refund.reasonPlaceholder')"
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- Refund Actions Footer -->
              <div class="drawer__footer">
                <button
                  class="drawer-btn drawer-btn--secondary"
                  @click="cancelRefund"
                  :disabled="isRefunding"
                >
                  <i class="fas fa-arrow-left"></i>
                  <span>{{ $t('common.cancel') }}</span>
                </button>
                <button
                  class="drawer-btn drawer-btn--danger"
                  :disabled="isRefunding"
                  @click="processRefund"
                >
                  <i class="fas fa-undo"></i>
                  <span>{{ isRefunding ? $t('common.processing') : $t('dashboard.orders.refund.confirm') }}</span>
                </button>
              </div>
            </template>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { buildApiUrl, getAuthHeaders, API_ENDPOINTS } from '@/config/api'
import { useAdminDataStore } from '@/stores/adminData'
import { useToast } from '@/composables/useToast'
import { useAnimations } from '@/composables/useAnimations'
import { logger } from '@/services/logger'
import SkeletonStatCard from '@/components/ui/SkeletonStatCard.vue'
import type { OrderListItem, OrderDetail, OrderFilters, OrdersListResponse } from '@/types'
import type { AnimationContext } from '@/composables/useAnimations'

const { t } = useI18n()
const adminDataStore = useAdminDataStore()
const { showToast } = useToast()

// Animations
const { initialize, createContext, isEnabled } = useAnimations()
const animationContext = ref<AnimationContext | null>(null)

// State - shallowRef pour la performance (orders peut avoir beaucoup d'items avec nested data)
const orders = shallowRef<OrderListItem[]>([])
const selectedOrder = ref<OrderDetail | null>(null)
const isLoading = ref(false)
const isInitialLoading = ref(true)
const isLoadingDetail = ref(false)
const isResending = ref(false)
const isRefunding = ref(false)
const isMarkingPaid = ref(false)
const drawerView = ref<'details' | 'refund'>('details') // Track drawer view state
const refundAmount = ref<number | null>(null)
const refundReason = ref('')

// Pagination
const currentPage = ref(1)
const totalOrders = ref(0)
const totalPages = ref(0)
const pageSize = 20

// Filters
const filters = reactive<OrderFilters>({
  event_id: '',
  status: '',
  search: '',
  date_from: '',
  date_to: ''
})

// Stats
const stats = reactive({
  revenue: 0,
  completed: 0,
  pending: 0,
  failed: 0
})


// Computed
const events = computed(() => adminDataStore.events)

// Debounce search
let searchTimeout: ReturnType<typeof setTimeout> | null = null
function debouncedSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadOrders()
  }, 300)
}

// Format helpers
function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

function formatDate(dateStr: string): string {
  if (!dateStr || dateStr === 'N/A') return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

function formatDateTime(dateStr: string): string {
  if (!dateStr || dateStr === 'N/A') return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function formatTime(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function getStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    completed: 'fas fa-check',
    pending: 'fas fa-clock',
    pending_cash: 'fas fa-money-bill-wave',
    failed: 'fas fa-times',
    refunded: 'fas fa-undo',
    cancelled: 'fas fa-ban'
  }
  return icons[status] || 'fas fa-question'
}

// API calls
async function loadOrders() {
  isLoading.value = true

  try {
    const params = new URLSearchParams()
    params.append('page', currentPage.value.toString())
    params.append('limit', pageSize.toString())

    if (filters.event_id) params.append('event_id', filters.event_id)
    if (filters.status) params.append('status', filters.status)
    if (filters.search) params.append('search', filters.search)
    if (filters.date_from) params.append('date_from', filters.date_from)
    if (filters.date_to) params.append('date_to', filters.date_to)

    const response = await fetch(
      buildApiUrl(`${API_ENDPOINTS.ADMIN_ORDERS}?${params.toString()}`),
      {
        credentials: 'include',
        headers: getAuthHeaders()
      }
    )

    if (!response.ok) throw new Error('Failed to load orders')

    const data: OrdersListResponse = await response.json()
    orders.value = data.orders
    totalOrders.value = data.total
    totalPages.value = data.total_pages

    // Utiliser les stats globales du backend
    stats.revenue = data.global_revenue
    stats.completed = data.global_completed
    stats.pending = data.global_pending
    stats.failed = data.global_failed

    // Animate table rows after data loads
    // ✅ Use nextTick + requestAnimationFrame to ensure DOM is fully rendered
    await nextTick()
    requestAnimationFrame(() => {
      animateTableRows()
    })
  } catch (error) {
    logger.error('Error loading orders:', error)
    showToast(t('dashboard.orders.errors.loadFailed'), 'error')
  } finally {
    isLoading.value = false
  }
}

async function loadOrderDetail(orderId: string) {
  isLoadingDetail.value = true

  try {
    const response = await fetch(
      buildApiUrl(API_ENDPOINTS.ADMIN_ORDER_BY_ID(orderId)),
      {
        credentials: 'include',
        headers: getAuthHeaders()
      }
    )

    if (!response.ok) throw new Error('Failed to load order detail')

    const data: OrderDetail = await response.json()
    selectedOrder.value = data
  } catch (error) {
    logger.error('Error loading order detail:', error)
    showToast(t('dashboard.orders.errors.detailFailed'), 'error')
  } finally {
    isLoadingDetail.value = false
  }
}

async function resendEmail() {
  if (!selectedOrder.value) return

  isResending.value = true
  try {
    const response = await fetch(
      buildApiUrl(API_ENDPOINTS.ADMIN_ORDER_RESEND_EMAIL(selectedOrder.value.id)),
      {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders()
      }
    )

    if (!response.ok) throw new Error('Failed to resend email')

    showToast(t('dashboard.orders.success.emailSent'), 'success')
  } catch (error) {
    logger.error('Error resending email:', error)
    showToast(t('dashboard.orders.errors.emailFailed'), 'error')
  } finally {
    isResending.value = false
  }
}

async function processRefund() {
  if (!selectedOrder.value) return

  isRefunding.value = true
  try {
    const response = await fetch(
      buildApiUrl(API_ENDPOINTS.ADMIN_ORDER_REFUND(selectedOrder.value.id)),
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: refundAmount.value || null,  // null = remboursement total
          reason: refundReason.value || undefined
        })
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Refund failed')
    }

    showToast(t('dashboard.orders.success.refunded'), 'success')
    closeDrawer()
    loadOrders()
  } catch (error) {
    logger.error('Error processing refund:', error)
    showToast(error instanceof Error ? error.message : t('dashboard.orders.errors.refundFailed'), 'error')
  } finally {
    isRefunding.value = false
  }
}

async function markAsPaid() {
  if (!selectedOrder.value) return

  isMarkingPaid.value = true
  try {
    const response = await fetch(
      buildApiUrl(API_ENDPOINTS.ADMIN_ORDER_MARK_PAID(selectedOrder.value.id)),
      {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders()
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Mark paid failed')
    }

    showToast(t('dashboard.orders.success.markedPaid'), 'success')
    closeDrawer()
    loadOrders()
  } catch (error) {
    logger.error('Error marking order as paid:', error)
    showToast(error instanceof Error ? error.message : t('dashboard.orders.errors.markPaidFailed'), 'error')
  } finally {
    isMarkingPaid.value = false
  }
}

// Navigation
function goToPage(page: number) {
  currentPage.value = page
  loadOrders()
}

function openOrderDetail(order: OrderListItem) {
  loadOrderDetail(order.id)
}

function closeDrawer() {
  selectedOrder.value = null
  drawerView.value = 'details'
  refundAmount.value = null
  refundReason.value = ''
}

function showRefundView() {
  drawerView.value = 'refund'
  refundAmount.value = selectedOrder.value?.amount || null
}

function cancelRefund() {
  drawerView.value = 'details'
  refundAmount.value = null
  refundReason.value = ''
}

// Block body scroll when drawer is open
watch(selectedOrder, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

/**
 * Anime l'apparition des stats et du tableau avec GSAP (desktop uniquement)
 * ✅ Vérifie que les éléments existent avant d'animer
 */
function animateEntranceElements() {
  if (!isEnabled.value || !animationContext.value?.gsap) return

  const { gsap } = animationContext.value

  const tl = gsap.timeline({
    defaults: { ease: 'power2.out' }
  })

  // Stats cards avec stagger
  const statCards = document.querySelectorAll('.stat-card')
  if (statCards.length > 0) {
    tl.fromTo(statCards,
      { opacity: 0, y: 20, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08 }
    )
  }

  // Filters bar
  const filtersBar = document.querySelector('.filters-bar')
  if (filtersBar) {
    tl.fromTo(filtersBar,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4 },
      statCards.length > 0 ? '-=0.3' : 0
    )
  }

  // Table container
  const tableContainer = document.querySelector('.table-container')
  if (tableContainer) {
    tl.fromTo(tableContainer,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5 },
      '-=0.2'
    )
  }

  // Table rows avec stagger (already has internal check)
  animateTableRows()
}

/**
 * Anime les lignes du tableau (appelé après chaque chargement de données)
 * ✅ Vérifie que les éléments existent avant d'animer pour éviter les warnings GSAP
 */
function animateTableRows() {
  if (!isEnabled.value || !animationContext.value?.gsap) return

  const { gsap } = animationContext.value

  // ✅ Check if rows exist in DOM before animating
  const rows = document.querySelectorAll('.order-row')
  if (rows.length === 0) return

  gsap.fromTo(rows,
    { opacity: 0, x: -10 },
    { opacity: 1, x: 0, duration: 0.3, stagger: 0.04, ease: 'power2.out' }
  )
}

// Lifecycle
onMounted(async () => {
  // Initialize animations (GSAP lazy load on desktop)
  await initialize()
  if (isEnabled.value) {
    animationContext.value = createContext()
  }

  await adminDataStore.fetchEvents()
  await loadOrders()

  // Hide skeleton and trigger animations
  isInitialLoading.value = false
  // ✅ Use nextTick + requestAnimationFrame to ensure DOM is fully rendered
  await nextTick()
  requestAnimationFrame(() => {
    animateEntranceElements()
  })
})

// Cleanup animations and body scroll
onUnmounted(() => {
  animationContext.value?.cleanup()
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* ============================================
   ORDERS VIEW - Professional Dashboard Style
   ============================================ */
.orders-view {
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

/* Page Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
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
  margin: 0;
}

.page-header__count {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.45);
  margin: 0;
}

/* Stats Row - Matching DashboardView */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

/* Stat Card - Glass Effect matching DashboardView */
.stat-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 1.25rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

/* Glow effect behind icon */
.stat-card__glow {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.3;
  transition: opacity 0.3s ease;
}

.stat-card:hover .stat-card__glow {
  opacity: 0.5;
}

.stat-card__glow--success {
  background: #10b981;
}

.stat-card__glow--info {
  background: #3b82f6;
}

.stat-card__glow--warning {
  background: #fbbf24;
}

.stat-card__glow--danger {
  background: #ef4444;
}

.stat-card:hover {
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.stat-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.stat-card__title {
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-card__icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 1rem;
  transition: transform 0.3s ease;
  position: relative;
  z-index: 1;
}

.stat-card:hover .stat-card__icon {
  transform: scale(1.1);
}

.stat-card__icon--success {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.stat-card__icon--info {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.stat-card__icon--warning {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.stat-card__icon--danger {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.stat-card__value {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-white);
  margin-bottom: 0.35rem;
  line-height: 1;
}

.stat-card__change {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.stat-card__change--positive {
  color: #10b981;
}

.stat-card__change i {
  font-size: 0.65rem;
}

/* Filters Bar */
.filters-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filters-bar__left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filters-bar__right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Filter Select Wrapper */
.filter-select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.filter-select-wrapper > i:first-child {
  position: absolute;
  left: 0.875rem;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.75rem;
  pointer-events: none;
  z-index: 1;
}

.filter-select-wrapper .filter-arrow {
  position: absolute;
  right: 0.75rem;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.6rem;
  pointer-events: none;
}

.filter-select {
  padding: 0.625rem 2rem 0.625rem 2.25rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: var(--color-white);
  font-size: 0.8rem;
  cursor: pointer;
  min-width: 160px;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-primary);
  background: rgba(255, 255, 255, 0.06);
}

.filter-select option {
  background: #1a1a1f;
  color: var(--color-white);
  padding: 0.5rem;
}

.search-input {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input i {
  position: absolute;
  left: 0.875rem;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.8rem;
}

.search-input input {
  padding: 0.625rem 1rem 0.625rem 2.25rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: var(--color-white);
  font-size: 0.8rem;
  width: 240px;
  transition: all 0.2s ease;
}

.search-input input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: rgba(255, 255, 255, 0.06);
  width: 280px;
}

.search-input input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

/* Date Range */
.date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
}

.date-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.date-input-wrapper i {
  position: absolute;
  left: 0.625rem;
  color: rgba(255, 255, 255, 0.35);
  font-size: 0.7rem;
  pointer-events: none;
}

.filter-date {
  padding: 0.5rem 0.625rem 0.5rem 1.75rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid transparent;
  border-radius: 6px;
  color: var(--color-white);
  font-size: 0.75rem;
  min-width: 120px;
}

.filter-date:focus {
  outline: none;
  border-color: var(--color-primary);
  background: rgba(255, 255, 255, 0.06);
}

.filter-date::-webkit-calendar-picker-indicator {
  filter: invert(1) opacity(0.5);
  cursor: pointer;
}

.date-separator {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.25);
  font-size: 0.65rem;
  padding: 0 0.25rem;
}

/* Table Loading */
.table-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 4rem;
  color: rgba(255, 255, 255, 0.5);
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
}

.empty-state__icon {
  font-size: 3rem;
  color: rgba(255, 255, 255, 0.2);
  margin-bottom: 1rem;
}

.empty-state__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-white);
  margin: 0 0 0.5rem;
}

.empty-state__text {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

/* Table Container */
.table-container {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  overflow: hidden;
}

/* Orders Table */
.orders-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.orders-table thead {
  background: rgba(255, 255, 255, 0.03);
}

.orders-table th {
  padding: 0.875rem 1rem;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.45);
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  white-space: nowrap;
}

.orders-table td {
  padding: 0.875rem 1rem;
  font-size: 0.85rem;
  color: var(--color-white);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  vertical-align: middle;
}

/* Column Widths */
.col-order { width: 12%; }
.col-customer { width: 18%; }
.col-event { width: 18%; }
.col-pack { width: 14%; text-align: center; }
.col-amount { width: 10%; text-align: right; }
.col-status { width: 12%; text-align: center; }
.col-date { width: 11%; }
.col-actions { width: 5%; text-align: center; }

.orders-table th.col-pack,
.orders-table th.col-amount,
.orders-table th.col-status,
.orders-table th.col-actions {
  text-align: center;
}

.orders-table th.col-amount {
  text-align: right;
}

.order-row {
  cursor: pointer;
  transition: background 0.15s ease;
}

.order-row:hover {
  background: rgba(255, 255, 255, 0.04);
}

.order-row:last-child td {
  border-bottom: none;
}

/* Order Code */
.order-code {
  display: inline-block;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-primary);
  background: rgba(220, 38, 38, 0.1);
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  letter-spacing: 0.3px;
}

/* Customer Info */
.customer-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.customer-name {
  font-weight: 500;
  font-size: 0.85rem;
  color: var(--color-white);
}

.customer-email {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.45);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Event Name */
.event-name {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.85);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Pack Info */
.pack-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}

.pack-badge {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-white);
  background: rgba(255, 255, 255, 0.08);
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.pack-qty {
  font-size: 0.7rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
}

/* Amount */
.amount {
  display: block;
  font-weight: 600;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.85rem;
  color: var(--color-white);
  text-align: right;
}

/* Date */
.date {
  display: block;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.75rem;
}

/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.35rem 0.65rem;
  border-radius: 20px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.status-badge i {
  font-size: 0.55rem;
}

.status-badge--completed {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.status-badge--pending {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.status-badge--failed {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.status-badge--refunded {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
}

.status-badge--cancelled {
  background: rgba(107, 114, 128, 0.15);
  color: #6b7280;
}

.status-badge--pending_cash {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

/* Actions */
.action-btn {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-white);
  border-color: rgba(255, 255, 255, 0.15);
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.pagination__btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: var(--color-white);
  cursor: pointer;
  transition: all 0.15s ease;
}

.pagination__btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.pagination__btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.pagination__info {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
}

/* ============================================
   DRAWER - Order Detail Panel
   Matching BookingDrawer Design Language
   ============================================ */
.drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  justify-content: flex-end;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  overflow: hidden;
}

.drawer {
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

/* Drawer Header */
.drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(10, 10, 15, 0.8);
  flex-shrink: 0;
}

.drawer__title-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.drawer__order-id code {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-white);
  letter-spacing: 0.5px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.status-pill i {
  font-size: 0.55rem;
}

.status-pill--completed {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.25);
}

.status-pill--pending {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.25);
}

.status-pill--failed {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.status-pill--refunded {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
  border: 1px solid rgba(139, 92, 246, 0.25);
}

.status-pill--pending_cash {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.25);
}

.drawer__close {
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

.drawer__close:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  color: #fff;
}

/* Drawer Back Button */
.drawer__back {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 0.5rem;
}

.drawer__back:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.drawer__back i {
  font-size: 0.75rem;
}

/* Drawer Content */
.drawer__content {
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

/* Custom Scrollbar for Drawer */
.drawer__content::-webkit-scrollbar {
  width: 5px;
}

.drawer__content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 3px;
}

.drawer__content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
}

.drawer__content::-webkit-scrollbar-thumb:hover {
  background: rgba(220, 20, 60, 0.5);
}

/* Detail Cards */
.detail-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  overflow: visible; /* Allow content to be fully visible */
  flex-shrink: 0; /* Prevent cards from shrinking */
}

.detail-card__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.detail-card__icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 0.8rem;
}

.detail-card__icon--customer {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.detail-card__icon--event {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
}

.detail-card__icon--payment {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.detail-card__icon--tickets {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.detail-card__title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.tickets-count {
  font-weight: 400;
  color: rgba(255, 255, 255, 0.4);
}

.detail-card__body {
  padding: 1rem;
}

.detail-card__body--tickets {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  max-height: none; /* Ensure all tickets are visible */
}

/* Detail Rows */
.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.detail-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.detail-row:first-child {
  padding-top: 0;
}

.detail-row--highlight {
  padding-bottom: 0.75rem;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.detail-label {
  font-size: 0.7rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.detail-value {
  font-size: 0.85rem;
  color: var(--color-white);
  text-align: right;
}

.detail-value--email {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.detail-value--event {
  font-weight: 600;
  color: var(--color-white);
}

/* Detail Row Grid */
.detail-row-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding-top: 0.5rem;
}

.detail-cell {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.detail-cell .detail-value {
  text-align: left;
}

/* Pack Pill */
.pack-pill {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-white);
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.25);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

.pack-multiplier {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  margin-left: 0.25rem;
}

/* Payment Amount */
.payment-amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  margin: -1rem -1rem 0.75rem;
  background: rgba(34, 197, 94, 0.08);
  border-bottom: 1px solid rgba(34, 197, 94, 0.15);
}

.payment-amount {
  font-size: 1.5rem;
  font-weight: 700;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  color: #22c55e;
  letter-spacing: 0.5px;
}

/* CCV Reference */
.ccv-ref {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.05);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

/* Ticket Cards */
.ticket-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.ticket-card--used {
  background: rgba(34, 197, 94, 0.05);
  border-color: rgba(34, 197, 94, 0.2);
}

.ticket-card--cancelled {
  opacity: 0.5;
}

.ticket-card__left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ticket-card__code {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-primary);
  letter-spacing: 0.3px;
}

.ticket-card__holder {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.ticket-card__right {
  flex-shrink: 0;
}

/* Ticket Status */
.ticket-status {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
  font-weight: 500;
}

.ticket-status--scanned {
  color: #22c55e;
}

.ticket-status--scanned i {
  font-size: 0.85rem;
}

.ticket-status__text {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.1rem;
}

.ticket-status__text small {
  font-size: 0.6rem;
  opacity: 0.7;
}

.ticket-status--valid {
  color: rgba(255, 255, 255, 0.45);
}

.ticket-status--valid i {
  font-size: 0.45rem;
}

.ticket-status--cancelled {
  color: #ef4444;
}

/* Drawer Footer */
.drawer__footer {
  padding: 1rem 1.5rem 1.25rem;
  background: rgba(10, 10, 15, 0.98);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
  position: relative;
  z-index: 2; /* Ensure footer stays on top */
}

/* Drawer Buttons */
.drawer-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  flex: 1;
}

.drawer-btn i {
  font-size: 0.75rem;
}

.drawer-btn--secondary {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
}

.drawer-btn--secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.drawer-btn--danger {
  background: rgba(220, 20, 60, 0.1);
  border: 1px solid rgba(220, 20, 60, 0.2);
  color: #dc143c;
}

.drawer-btn--danger:hover:not(:disabled) {
  background: rgba(220, 20, 60, 0.15);
  border-color: rgba(220, 20, 60, 0.3);
}

.drawer-btn--success {
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.25);
  color: #22c55e;
}

.drawer-btn--success:hover:not(:disabled) {
  background: rgba(34, 197, 94, 0.25);
  border-color: rgba(34, 197, 94, 0.4);
}

.drawer-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* ============================================
   REFUND VIEW - Integrated in Drawer
   ============================================ */

/* Refund Header Card */
.refund-header-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, rgba(220, 20, 60, 0.1) 0%, rgba(220, 20, 60, 0.02) 100%);
  border: 1px solid rgba(220, 20, 60, 0.2);
  border-radius: 14px;
}

.refund-header-card__icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(220, 20, 60, 0.15);
  border-radius: 12px;
  font-size: 1.25rem;
  color: #dc143c;
}

.refund-header-card__content {
  flex: 1;
}

.refund-header-card__title {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-white);
  margin: 0 0 0.25rem;
}

.refund-header-card__subtitle {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

/* Refund Warning */
.refund-warning {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 10px;
}

.refund-warning i {
  color: #f59e0b;
  font-size: 1rem;
  margin-top: 0.1rem;
  flex-shrink: 0;
}

.refund-warning p {
  margin: 0;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
}

/* Refund Form */
.refund-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.refund-form .form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.refund-form .form-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.refund-form .form-label i {
  color: var(--color-primary);
  font-size: 0.65rem;
  opacity: 0.75;
}

.refund-form .form-input,
.refund-form .form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: var(--color-white);
  font-size: 0.9rem;
  font-family: inherit;
  transition: all 0.2s ease;
}

.refund-form .form-input:focus,
.refund-form .form-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  background: rgba(255, 255, 255, 0.06);
}

.refund-form .form-textarea {
  resize: vertical;
  min-height: 80px;
}

.refund-form .form-help {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
  font-style: italic;
}

/* Amount Input Wrapper */
.amount-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.amount-input-wrapper .amount-input {
  padding-right: 2.5rem;
}

.amount-input-wrapper .amount-suffix {
  position: absolute;
  right: 1rem;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 600;
  font-size: 0.9rem;
  pointer-events: none;
}

/* Legacy button classes for modal */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
  flex: 1;
}

.btn--secondary {
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-white);
}

.btn--secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
}

.btn--danger {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.btn--danger:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.25);
}

.btn--ghost {
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
}

.btn--ghost:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-white);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ============================================
   MODAL - Refund Confirmation
   ============================================ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal {
  width: 100%;
  max-width: 440px;
  background: linear-gradient(180deg, #1c1c20 0%, #141416 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  animation: modalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.modal__title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-white);
  margin: 0;
}

.modal__close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal__close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-white);
  transform: rotate(90deg);
}

.modal__body {
  padding: 1.5rem;
}

.modal__warning {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(251, 191, 36, 0.08);
  border: 1px solid rgba(251, 191, 36, 0.2);
  border-radius: 12px;
  color: #fbbf24;
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.modal__warning i {
  margin-top: 0.125rem;
  font-size: 1rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.form-group small {
  display: block;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 0.5rem;
}

.amount-input {
  position: relative;
  display: flex;
  align-items: center;
}

.amount-input input {
  width: 100%;
  padding: 0.875rem 2.5rem 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: var(--color-white);
  font-size: 1.1rem;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-weight: 500;
  transition: all 0.2s ease;
}

.amount-input input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: rgba(255, 255, 255, 0.06);
}

.amount-suffix {
  position: absolute;
  right: 1rem;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 600;
  font-size: 1rem;
}

.form-group textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: var(--color-white);
  font-size: 0.875rem;
  resize: vertical;
  font-family: inherit;
  min-height: 80px;
  transition: all 0.2s ease;
}

.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  background: rgba(255, 255, 255, 0.06);
}

.form-group textarea::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

.modal__footer {
  display: flex;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0 0 16px 16px;
}

.modal__footer .btn {
  flex: 1;
  padding: 0.875rem 1.25rem;
  border-radius: 10px;
}

/* ============================================
   TRANSITIONS
   ============================================ */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.35s ease;
}

.drawer-enter-active .drawer,
.drawer-leave-active .drawer {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .drawer,
.drawer-leave-to .drawer {
  transform: translateX(100%);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.95) translateY(10px);
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 1200px) {
  .col-event { width: 16%; }
  .col-customer { width: 17%; }
}

@media (max-width: 1024px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .filters-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .filters-bar__left,
  .filters-bar__right {
    width: 100%;
  }

  .filters-bar__left {
    flex-wrap: nowrap;
  }

  .search-input {
    flex: 1;
  }

  .search-input input {
    width: 100%;
  }

  .search-input input:focus {
    width: 100%;
  }

  .date-range {
    width: 100%;
    justify-content: space-between;
  }

  .date-input-wrapper {
    flex: 1;
  }

  .filter-date {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding-bottom: 0;
    border-bottom: none;
  }

  .stats-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-card__glow {
    width: 60px;
    height: 60px;
  }

  .stat-card__icon {
    width: 32px;
    height: 32px;
    font-size: 0.9rem;
  }

  .stat-card__value {
    font-size: 1.5rem;
  }

  /* Touch feedback */
  .stat-card:active {
    transform: scale(0.98);
  }

  /* Disable hover effects on mobile */
  .stat-card:hover {
    transform: none;
  }

  .stat-card:hover .stat-card__icon {
    transform: none;
  }

  .filters-bar__left {
    flex-direction: column;
    gap: 0.5rem;
  }

  .filter-select-wrapper {
    width: 100%;
  }

  .filter-select {
    width: 100%;
  }

  .table-container {
    overflow-x: auto;
    margin: 0 -1rem;
    padding: 0 1rem;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }

  .orders-table {
    min-width: 900px;
  }

  .drawer {
    max-width: 100%;
    border-left: none;
  }

  .drawer__content {
    padding: 1rem;
    padding-bottom: 1.25rem;
    gap: 0.875rem;
  }

  .detail-card__body {
    padding: 0.875rem;
  }

  .detail-card__body--tickets {
    padding: 0.875rem;
  }

  .payment-amount {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .stats-row {
    grid-template-columns: 1fr 1fr;
    gap: 0.625rem;
  }

  .stat-card {
    padding: 0.875rem;
  }

  .stat-card__title {
    font-size: 0.6rem;
  }

  .stat-card__value {
    font-size: 1.35rem;
  }

  .stat-card__change {
    font-size: 0.7rem;
  }

  .stat-card__icon {
    width: 30px;
    height: 30px;
    font-size: 0.85rem;
    border-radius: 8px;
  }

  .date-range {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;
  }

  .date-separator {
    transform: rotate(90deg);
    padding: 0.25rem 0;
  }

  .date-input-wrapper {
    width: 100%;
  }

  .drawer__footer {
    flex-direction: column;
    padding: 1rem;
  }

  .drawer-btn {
    width: 100%;
  }

  .modal {
    margin: 0 0.5rem;
  }

  .modal__footer {
    flex-direction: column;
  }
}
</style>

