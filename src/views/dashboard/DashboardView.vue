<template>
  <div class="dashboard-page">
    <!-- Welcome Header -->
    <div class="welcome-header">
      <div class="welcome-header__content">
        <h1 class="welcome-header__title">
          {{ greeting }}, <span class="welcome-header__name">{{ userName }}</span>
        </h1>
        <p class="welcome-header__date">
          <i class="fas fa-calendar-day"></i>
          {{ formattedDate }}
        </p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div v-if="isInitialLoading" class="stats-grid">
      <SkeletonStatCard v-for="n in 4" :key="n" />
    </div>

    <div v-else class="stats-grid">
      <div class="stat-card" style="--delay: 0">
        <div class="stat-card__glow stat-card__glow--success"></div>
        <div class="stat-card__header">
          <span class="stat-card__title">Revenus</span>
          <div class="stat-card__icon stat-card__icon--success">
            <i class="fas fa-euro-sign"></i>
          </div>
        </div>
        <div class="stat-card__value">{{ formatPrice(salesStats.totalRevenue) }}</div>
        <div class="stat-card__change stat-card__change--positive">
          <i class="fas fa-check-circle"></i>
          {{ salesStats.completedOrders }} commandes
        </div>
      </div>

      <div class="stat-card" style="--delay: 1">
        <div class="stat-card__glow stat-card__glow--info"></div>
        <div class="stat-card__header">
          <span class="stat-card__title">Tickets vendus</span>
          <div class="stat-card__icon stat-card__icon--info">
            <i class="fas fa-ticket-alt"></i>
          </div>
        </div>
        <div class="stat-card__value">{{ salesStats.ticketsSold }}</div>
        <div class="stat-card__change">
          <i class="fas fa-qrcode"></i>
          {{ salesStats.ticketsScanned }} scannés
        </div>
      </div>

      <div class="stat-card" style="--delay: 2">
        <div class="stat-card__glow stat-card__glow--primary"></div>
        <div class="stat-card__header">
          <span class="stat-card__title">Événements</span>
          <div class="stat-card__icon stat-card__icon--primary">
            <i class="fas fa-calendar-alt"></i>
          </div>
        </div>
        <div class="stat-card__value">{{ eventStats.totalEvents }}</div>
        <div class="stat-card__change">
          <i class="fas fa-clock"></i>
          {{ eventStats.upcomingEvents }} à venir
        </div>
      </div>

      <div class="stat-card" style="--delay: 3">
        <div class="stat-card__glow stat-card__glow--secondary"></div>
        <div class="stat-card__header">
          <span class="stat-card__title">Taux de scan</span>
          <div class="stat-card__icon stat-card__icon--secondary">
            <i class="fas fa-chart-pie"></i>
          </div>
        </div>
        <div class="stat-card__value">{{ salesStats.scanRate }}%</div>
        <div class="stat-card__change">
          <i class="fas fa-check-circle"></i>
          {{ salesStats.ticketsScanned }} / {{ salesStats.ticketsSold }} tickets
        </div>
      </div>
    </div>

    <!-- Two Columns Layout -->
    <div class="dashboard-grid">
      <!-- Top Events by Sales -->
      <div class="dashboard-section">
        <div class="section-header">
          <h2 class="section-title">
            <i class="fas fa-trophy"></i>
            Top ventes
          </h2>
          <router-link to="/dashboard/orders" class="section-link">
            Voir commandes <i class="fas fa-arrow-right"></i>
          </router-link>
        </div>

        <div class="top-events">
          <template v-if="isInitialLoading">
            <SkeletonListItem v-for="n in 3" :key="n" variant="top-event" />
          </template>

          <template v-else>
            <div
              v-for="(event, index) in topEvents"
              :key="event.event_id"
              class="top-event-item"
            >
              <div class="top-event-item__rank" :class="`rank-${index + 1}`">
                {{ index + 1 }}
              </div>
              <div class="top-event-item__info">
                <h4 class="top-event-item__title">{{ event.event_title }}</h4>
                <p class="top-event-item__meta">
                  <span><i class="fas fa-ticket-alt"></i> {{ event.tickets_sold }} tickets</span>
                  <span><i class="fas fa-shopping-cart"></i> {{ event.orders_count }} commandes</span>
                </p>
              </div>
              <div class="top-event-item__revenue">
                {{ formatPrice(event.revenue) }}
              </div>
            </div>

            <div v-if="topEvents.length === 0" class="empty-state">
              <i class="fas fa-chart-bar"></i>
              <p>Aucune vente pour le moment</p>
            </div>
          </template>
        </div>

        <!-- Upcoming Events Section -->
        <div class="section-header section-header--secondary">
          <h2 class="section-title">
            <i class="fas fa-fire"></i>
            Prochains événements
          </h2>
          <router-link to="/dashboard/events" class="section-link">
            Voir tout <i class="fas fa-arrow-right"></i>
          </router-link>
        </div>

        <div class="upcoming-events">
          <template v-if="isInitialLoading">
            <SkeletonListItem v-for="n in 3" :key="n" variant="upcoming-event" />
          </template>

          <template v-else>
            <div
              v-for="event in upcomingEventsList"
              :key="event.id"
              class="event-item"
            >
              <div class="event-item__date">
                <span class="event-item__day">{{ formatEventDay(event.date) }}</span>
                <span class="event-item__month">{{ formatEventMonth(event.date) }}</span>
              </div>
              <div class="event-item__info">
                <h4 class="event-item__title">{{ event.title }}</h4>
                <p class="event-item__location">
                  <i class="fas fa-map-marker-alt"></i>
                  {{ event.location }}
                </p>
              </div>
              <div class="event-item__status" :class="getEventStatusClass(event)">
                {{ getEventStatusText(event) }}
              </div>
            </div>

            <div v-if="upcomingEventsList.length === 0" class="empty-state">
              <i class="fas fa-calendar-times"></i>
              <p>Aucun événement à venir</p>
            </div>
          </template>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="dashboard-section">
        <div class="section-header">
          <h2 class="section-title">
            <i class="fas fa-bolt"></i>
            Actions rapides
          </h2>
        </div>

        <div class="actions-list">
          <router-link to="/dashboard/events" class="action-card">
            <div class="action-card__icon">
              <i class="fas fa-calendar-plus"></i>
            </div>
            <div class="action-card__content">
              <h3 class="action-card__title">Créer un événement</h3>
              <p class="action-card__desc">Ajouter un nouvel événement</p>
            </div>
            <i class="fas fa-chevron-right action-card__arrow"></i>
          </router-link>

          <router-link to="/dashboard/artists" class="action-card">
            <div class="action-card__icon action-card__icon--purple">
              <i class="fas fa-user-plus"></i>
            </div>
            <div class="action-card__content">
              <h3 class="action-card__title">Ajouter un artiste</h3>
              <p class="action-card__desc">Enregistrer un nouvel artiste</p>
            </div>
            <i class="fas fa-chevron-right action-card__arrow"></i>
          </router-link>

          <router-link to="/dashboard/packs" class="action-card">
            <div class="action-card__icon action-card__icon--gold">
              <i class="fas fa-ticket-alt"></i>
            </div>
            <div class="action-card__content">
              <h3 class="action-card__title">Gérer les packs</h3>
              <p class="action-card__desc">Configurer les offres</p>
            </div>
            <i class="fas fa-chevron-right action-card__arrow"></i>
          </router-link>

          <router-link to="/" class="action-card action-card--outline">
            <div class="action-card__icon action-card__icon--outline">
              <i class="fas fa-external-link-alt"></i>
            </div>
            <div class="action-card__content">
              <h3 class="action-card__title">Voir le site</h3>
              <p class="action-card__desc">Prévisualiser le site public</p>
            </div>
            <i class="fas fa-chevron-right action-card__arrow"></i>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAdminDataStore } from '@/stores/adminData'
import { useAnimations } from '@/composables/useAnimations'
import { logger } from '@/services/logger'
import SkeletonStatCard from '@/components/ui/SkeletonStatCard.vue'
import SkeletonListItem from '@/components/ui/SkeletonListItem.vue'
import type { Event, TopEventStats } from '@/types'
import type { AnimationContext } from '@/composables/useAnimations'

const authStore = useAuthStore()
const adminStore = useAdminDataStore()

// Animations
const { initialize, createContext, isEnabled } = useAnimations()
const animationContext = ref<AnimationContext | null>(null)

// Loading state - skeleton uniquement si pas de cache
const isInitialLoading = ref(true)

// Computed
const userName = computed(() => authStore.user?.name || 'Admin')

// Dynamic greeting based on time
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bonjour'
  if (hour < 18) return 'Bon après-midi'
  return 'Bonsoir'
})

// Formatted date
const formattedDate = computed(() => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  return new Date().toLocaleDateString('fr-FR', options)
})

// Sales stats from global stats
const salesStats = ref({
  totalRevenue: 0,
  completedOrders: 0,
  ticketsSold: 0,
  ticketsScanned: 0,
  scanRate: 0
})

// Event stats (from local data)
const eventStats = ref({
  totalEvents: 0,
  upcomingEvents: 0,
  totalArtists: 0
})

// Top events from global stats
const topEvents = ref<TopEventStats[]>([])

// Upcoming events list (max 3)
const upcomingEventsList = computed(() => {
  const now = new Date()
  return adminStore.events
    .filter(e => new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)
})

// Format price
const formatPrice = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

// Format event date
const formatEventDay = (date: string) => {
  return new Date(date).getDate().toString().padStart(2, '0')
}

const formatEventMonth = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()
}

// Event status
const getEventStatusClass = (event: Event) => {
  const eventDate = new Date(event.date)
  const now = new Date()
  const diffDays = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays <= 7) return 'event-item__status--soon'
  return 'event-item__status--upcoming'
}

const getEventStatusText = (event: Event) => {
  const eventDate = new Date(event.date)
  const now = new Date()
  const diffDays = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Demain'
  if (diffDays <= 7) return `Dans ${diffDays}j`
  return `Dans ${diffDays}j`
}

/**
 * Anime l'apparition des stats avec GSAP (desktop uniquement)
 * Utilise fromTo() pour garantir un état final visible même si l'animation échoue
 * ✅ Vérifie que les éléments existent avant d'animer pour éviter les warnings GSAP
 * Note: Les action-cards NE sont PAS animées car ils sont statiques et toujours visibles
 */
function animateStatsEntry() {
  if (!isEnabled.value || !animationContext.value?.gsap) return

  const { gsap } = animationContext.value

  const tl = gsap.timeline({
    defaults: { ease: 'power2.out' }
  })

  // Stats cards avec stagger - fromTo garantit l'état final
  const statCards = document.querySelectorAll('.stat-card')
  if (statCards.length > 0) {
    tl.fromTo(statCards,
      { opacity: 0, y: 20, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1 }
    )
  }

  // Top events items
  const topEventItems = document.querySelectorAll('.top-event-item')
  if (topEventItems.length > 0) {
    tl.fromTo(topEventItems,
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.08 },
      statCards.length > 0 ? '-=0.3' : 0
    )
  }

  // Upcoming events items
  const eventItems = document.querySelectorAll('.event-item')
  if (eventItems.length > 0) {
    tl.fromTo(eventItems,
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.08 },
      '-=0.2'
    )
  }

  // Action cards: pas d'animation GSAP - ils sont statiques et toujours visibles
  // Utiliser l'animation CSS native pour éviter le "flash" de disparition/réapparition
}

// Load all data
onMounted(async () => {
  const now = new Date()

  // Initialize animations (GSAP lazy load on desktop)
  await initialize()
  if (isEnabled.value) {
    animationContext.value = createContext()
  }

  // Load events and artists for local stats
  await Promise.all([
    adminStore.fetchEvents(),
    adminStore.fetchArtists()
  ])

  eventStats.value.totalEvents = adminStore.events.length
  eventStats.value.upcomingEvents = adminStore.events.filter(e => new Date(e.date) >= now).length
  eventStats.value.totalArtists = adminStore.artists.length

  // Load global sales stats
  try {
    const globalStats = await adminStore.fetchGlobalStats()
    salesStats.value = {
      totalRevenue: globalStats.total_revenue,
      completedOrders: globalStats.completed_orders,
      ticketsSold: globalStats.tickets_sold,
      ticketsScanned: globalStats.tickets_scanned,
      scanRate: globalStats.scan_rate
    }
    topEvents.value = globalStats.top_events
  } catch (error) {
    // If global stats fail (no orders yet), keep defaults
    logger.warn('Could not load global stats:', error)
  }

  // Hide skeletons
  isInitialLoading.value = false

  // Trigger entrance animations after DOM update
  // ✅ Use nextTick + requestAnimationFrame to ensure DOM is fully rendered
  await nextTick()
  requestAnimationFrame(() => {
    animateStatsEntry()
  })
})

// Cleanup animations
onUnmounted(() => {
  animationContext.value?.cleanup()
})
</script>

<style scoped>
/* ============================================
   DASHBOARD PAGE - Premium Design
   ============================================ */

.dashboard-page {
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

/* ============================================
   WELCOME HEADER
   ============================================ */
.welcome-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.welcome-header__content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.welcome-header__title {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-white);
  letter-spacing: -0.5px;
  margin: 0;
}

.welcome-header__name {
  background: linear-gradient(135deg, var(--color-primary) 0%, #ff4d6d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-header__date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  text-transform: capitalize;
}

.welcome-header__date i {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
}

/* ============================================
   STATS GRID
   ============================================ */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

/* Stat Card - Glass Effect */
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

.stat-card__glow--primary {
  background: var(--color-primary);
}

.stat-card__glow--info {
  background: #3b82f6;
}

.stat-card__glow--secondary {
  background: #a855f7;
}

.stat-card__glow--success {
  background: #10b981;
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

.stat-card__icon--primary {
  background: rgba(var(--color-primary-rgb), 0.15);
  color: var(--color-primary);
}

.stat-card__icon--info {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.stat-card__icon--secondary {
  background: rgba(168, 85, 247, 0.15);
  color: #a855f7;
}

.stat-card__icon--success {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
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

/* ============================================
   DASHBOARD GRID (Two Columns)
   ============================================ */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 1.5rem;
}

.dashboard-section {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-white);
  margin: 0;
}

.section-title i {
  color: var(--color-primary);
  font-size: 0.9rem;
}

.section-link {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition: color 0.2s ease;
}

.section-link:hover {
  color: var(--color-primary);
}

.section-link i {
  font-size: 0.65rem;
  transition: transform 0.2s ease;
}

.section-link:hover i {
  transform: translateX(3px);
}

/* ============================================
   TOP EVENTS (Sales)
   ============================================ */
.top-events {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.top-event-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.top-event-item:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
}

.top-event-item__rank {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-family: var(--font-heading);
  font-size: 0.8rem;
  font-weight: 800;
  flex-shrink: 0;
}

.top-event-item__rank.rank-1 {
  background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
  color: #1a1a2e;
}

.top-event-item__rank.rank-2 {
  background: linear-gradient(135deg, #c0c0c0 0%, #a0a0a0 100%);
  color: #1a1a2e;
}

.top-event-item__rank.rank-3 {
  background: linear-gradient(135deg, #cd7f32 0%, #b5651d 100%);
  color: #1a1a2e;
}

.top-event-item__rank.rank-4,
.top-event-item__rank.rank-5 {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
}

.top-event-item__info {
  flex: 1;
  min-width: 0;
}

.top-event-item__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-white);
  margin: 0 0 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.top-event-item__meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.top-event-item__meta span {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.top-event-item__meta i {
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.4);
}

.top-event-item__revenue {
  font-family: var(--font-heading);
  font-size: 0.95rem;
  font-weight: 700;
  color: #10b981;
  flex-shrink: 0;
}

.section-header--secondary {
  margin-top: 0.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

/* ============================================
   UPCOMING EVENTS
   ============================================ */
.upcoming-events {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.event-item:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
}

.event-item__date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background: rgba(var(--color-primary-rgb), 0.1);
  border: 1px solid rgba(var(--color-primary-rgb), 0.2);
  border-radius: 10px;
  flex-shrink: 0;
}

.event-item__day {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-white);
  line-height: 1;
}

.event-item__month {
  font-size: 0.6rem;
  font-weight: 600;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.event-item__info {
  flex: 1;
  min-width: 0;
}

.event-item__title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-white);
  margin: 0 0 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-item__location {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.event-item__location i {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.4);
}

.event-item__status {
  padding: 0.35rem 0.75rem;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 20px;
  flex-shrink: 0;
}

.event-item__status--soon {
  background: rgba(var(--color-primary-rgb), 0.15);
  color: var(--color-primary);
}

.event-item__status--upcoming {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1rem;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
}

.empty-state i {
  font-size: 2rem;
  margin-bottom: 0.75rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: 0.85rem;
  margin: 0;
}

/* ============================================
   ACTION CARDS
   ============================================ */
.actions-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

/* Animation CSS native staggerée pour les action-cards */
.action-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s ease;
  animation: actionCardIn 0.4s ease-out backwards;
}

.action-card:nth-child(1) { animation-delay: 0.15s; }
.action-card:nth-child(2) { animation-delay: 0.22s; }
.action-card:nth-child(3) { animation-delay: 0.29s; }
.action-card:nth-child(4) { animation-delay: 0.36s; }

@keyframes actionCardIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.action-card:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
  transform: translateX(4px);
}

.action-card--outline {
  background: transparent;
  border-style: dashed;
}

.action-card__icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--color-primary-rgb), 0.12);
  border-radius: 10px;
  color: var(--color-primary);
  font-size: 1rem;
  transition: all 0.2s ease;
}

.action-card:hover .action-card__icon {
  transform: scale(1.05);
}

.action-card__icon--purple {
  background: rgba(168, 85, 247, 0.12);
  color: #a855f7;
}

.action-card__icon--gold {
  background: rgba(234, 179, 8, 0.12);
  color: #eab308;
}

.action-card__icon--outline {
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.6);
}

.action-card__content {
  flex: 1;
  min-width: 0;
}

.action-card__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-white);
  margin: 0 0 0.15rem;
}

.action-card__desc {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.action-card__arrow {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.3);
  transition: all 0.2s ease;
}

.action-card:hover .action-card__arrow {
  color: var(--color-primary);
  transform: translateX(2px);
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
}

@media (max-width: 768px) {
  .welcome-header {
    margin-bottom: 1.5rem;
    padding-bottom: 1.25rem;
  }

  .welcome-header__title {
    font-size: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-card__value {
    font-size: 1.5rem;
  }

  .stat-card__icon {
    width: 32px;
    height: 32px;
    font-size: 0.9rem;
  }

  .stat-card__glow {
    width: 60px;
    height: 60px;
  }

  .dashboard-section {
    padding: 1.25rem;
  }

  .event-item {
    padding: 0.875rem;
  }

  .event-item__date {
    width: 44px;
    height: 44px;
  }

  .event-item__day {
    font-size: 1rem;
  }

  .action-card {
    padding: 0.75rem;
  }

  .action-card__icon {
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }

  /* Touch feedback */
  .stat-card:active,
  .action-card:active,
  .event-item:active {
    transform: scale(0.98);
  }

  /* Disable hover effects */
  .stat-card:hover,
  .action-card:hover {
    transform: none;
  }
}

@media (max-width: 580px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .welcome-header__title {
    font-size: 1.35rem;
  }
}

@media (max-width: 480px) {
  .welcome-header {
    margin-bottom: 1.25rem;
    padding-bottom: 1rem;
  }

  .welcome-header__title {
    font-size: 1.25rem;
  }

  .welcome-header__date {
    font-size: 0.8rem;
  }

  .stats-grid {
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

  .dashboard-section {
    padding: 1rem;
    border-radius: 14px;
  }

  .section-header {
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
  }

  .section-title {
    font-size: 0.9rem;
  }

  .event-item {
    padding: 0.75rem;
    gap: 0.75rem;
    border-radius: 10px;
  }

  .event-item__date {
    width: 40px;
    height: 40px;
    border-radius: 8px;
  }

  .event-item__day {
    font-size: 0.95rem;
  }

  .event-item__month {
    font-size: 0.55rem;
  }

  .event-item__title {
    font-size: 0.85rem;
  }

  .event-item__location {
    font-size: 0.7rem;
  }

  .event-item__status {
    padding: 0.25rem 0.5rem;
    font-size: 0.6rem;
  }

  .action-card {
    padding: 0.7rem 0.875rem;
    border-radius: 10px;
  }

  .action-card__icon {
    width: 34px;
    height: 34px;
    font-size: 0.85rem;
    border-radius: 8px;
  }

  .action-card__title {
    font-size: 0.8rem;
  }

  .action-card__desc {
    font-size: 0.7rem;
  }
}
</style>



