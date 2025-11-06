<template>
  <div class="dashboard-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-header__title">Dashboard</h1>
      <p class="page-header__subtitle">Bienvenue, {{ userName }}</p>
    </div>
    
    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card" data-aos="fade-up" data-aos-delay="0">
        <div class="stat-card__header">
          <span class="stat-card__title">Total Événements</span>
          <div class="stat-card__icon stat-card__icon--primary">
            <i class="fas fa-calendar-alt"></i>
          </div>
        </div>
        <div class="stat-card__value">{{ stats.totalEvents }}</div>
        <div class="stat-card__change stat-card__change--positive">
          <i class="fas fa-arrow-up"></i>
          {{ stats.eventsThisMonth }} ce mois
        </div>
      </div>
      
      <div class="stat-card" data-aos="fade-up" data-aos-delay="100">
        <div class="stat-card__header">
          <span class="stat-card__title">Événements à venir</span>
          <div class="stat-card__icon stat-card__icon--info">
            <i class="fas fa-clock"></i>
          </div>
        </div>
        <div class="stat-card__value">{{ stats.upcomingEvents }}</div>
        <div class="stat-card__change">Prochainement</div>
      </div>
      
      <div class="stat-card" data-aos="fade-up" data-aos-delay="200">
        <div class="stat-card__header">
          <span class="stat-card__title">Événements passés</span>
          <div class="stat-card__icon stat-card__icon--secondary">
            <i class="fas fa-history"></i>
          </div>
        </div>
        <div class="stat-card__value">{{ stats.pastEvents }}</div>
        <div class="stat-card__change">Terminés</div>
      </div>
      
      <div class="stat-card" data-aos="fade-up" data-aos-delay="300">
        <div class="stat-card__header">
          <span class="stat-card__title">Revenus estimés</span>
          <div class="stat-card__icon stat-card__icon--success">
            <i class="fas fa-euro-sign"></i>
          </div>
        </div>
        <div class="stat-card__value">{{ formatPrice(stats.totalRevenue, '€') }}</div>
        <div class="stat-card__change">Estimation</div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions" data-aos="fade-up" data-aos-delay="400">
      <h2 class="section-title">Actions rapides</h2>
      <div class="actions-grid">
        <router-link to="/dashboard/events" class="action-card">
          <div class="action-card__icon">
            <i class="fas fa-calendar-plus"></i>
          </div>
          <div class="action-card__content">
            <h3 class="action-card__title">Créer un événement</h3>
            <p class="action-card__desc">Ajouter un nouvel événement au calendrier</p>
          </div>
          <i class="fas fa-arrow-right action-card__arrow"></i>
        </router-link>

        <router-link to="/dashboard/artists" class="action-card">
          <div class="action-card__icon">
            <i class="fas fa-microphone"></i>
          </div>
          <div class="action-card__content">
            <h3 class="action-card__title">Gérer les artistes</h3>
            <p class="action-card__desc">Voir et modifier tous les artistes</p>
          </div>
          <i class="fas fa-arrow-right action-card__arrow"></i>
        </router-link>

        <router-link to="/dashboard/packs" class="action-card">
          <div class="action-card__icon">
            <i class="fas fa-ticket-alt"></i>
          </div>
          <div class="action-card__content">
            <h3 class="action-card__title">Gérer les packs</h3>
            <p class="action-card__desc">Voir et modifier tous les packs</p>
          </div>
          <i class="fas fa-arrow-right action-card__arrow"></i>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDataStore } from '@/stores/data'
import { formatPrice } from '@/utils'

const authStore = useAuthStore()
const dataStore = useDataStore()

// Computed
const userName = computed(() => authStore.user?.name || 'Admin')

// Stats (mock data for now)
const stats = ref({
  totalEvents: 0,
  upcomingEvents: 0,
  pastEvents: 0,
  totalRevenue: 0,
  eventsThisMonth: 0
})

// Calculate stats from dataStore
onMounted(async () => {
  // Charger les événements depuis le dataStore
  await dataStore.fetchEvents()
  
  const events = dataStore.events
  const now = new Date()
  
  stats.value.totalEvents = events.length
  stats.value.upcomingEvents = events.filter(e => new Date(e.date) >= now).length
  stats.value.pastEvents = events.filter(e => new Date(e.date) < now).length
  
  // Calculate revenue
  stats.value.totalRevenue = events.reduce((sum, e) => {
    return sum + (e.price?.from || 0) * (e.capacity || 0) * 0.7 // Estimation à 70% de remplissage
  }, 0)
  
  // Events this month
  const currentMonth = now.getMonth()
  stats.value.eventsThisMonth = events.filter(e => {
    const eventDate = new Date(e.date)
    return eventDate.getMonth() === currentMonth
  }).length
})
</script>

<style scoped>
/* ============================================
   DASHBOARD PAGE
   ============================================ */

.dashboard-page {
  max-width: 1400px;
}

/* Page Header */
.page-header {
  margin-bottom: 2.5rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid rgba(220, 20, 60, 0.2);
}

.page-header__title {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-white);
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;
}

.page-header__subtitle {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1.5rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.stat-card:hover {
  border-color: rgba(220, 20, 60, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.stat-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.stat-card__title {
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.65);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.stat-card__icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 1.15rem;
}

.stat-card__icon--primary {
  background: rgba(220, 20, 60, 0.2);
  color: var(--color-primary);
}

.stat-card__icon--info {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.stat-card__icon--secondary {
  background: rgba(168, 85, 247, 0.2);
  color: #a855f7;
}

.stat-card__icon--success {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.stat-card__value {
  font-family: var(--font-heading);
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--color-white);
  margin-bottom: 0.5rem;
  line-height: 1;
}

.stat-card__change {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-card__change--positive {
  color: #10b981;
}

.stat-card__change i {
  font-size: 0.75rem;
}

/* Quick Actions */
.quick-actions {
  margin-top: 2.5rem;
}

.section-title {
  font-family: var(--font-heading);
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--color-white);
  margin-bottom: 1.25rem;
  letter-spacing: -0.5px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: var(--color-primary);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.action-card:hover {
  border-color: rgba(220, 20, 60, 0.3);
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.action-card:hover::before {
  opacity: 1;
}

.action-card__icon {
  width: 55px;
  height: 55px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(220, 20, 60, 0.15);
  border-radius: 10px;
  color: var(--color-primary);
  font-size: 1.35rem;
  transition: all 0.2s ease;
}

.action-card:hover .action-card__icon {
  background: rgba(220, 20, 60, 0.25);
}

.action-card__content {
  flex: 1;
}

.action-card__title {
  font-family: var(--font-heading);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-white);
  margin-bottom: 0.4rem;
  letter-spacing: -0.3px;
}

.action-card__desc {
  font-size: 0.825rem;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.5;
}

.action-card__arrow {
  font-size: 1.15rem;
  color: rgba(255, 255, 255, 0.3);
  transition: all 0.2s ease;
}

.action-card:hover .action-card__arrow {
  color: var(--color-primary);
  transform: translateX(2px);
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .page-header {
    margin-bottom: 1.75rem;
    padding-bottom: 0.875rem;
  }

  .page-header__title {
    font-size: 1.5rem;
  }

  .page-header__subtitle {
    font-size: 0.85rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    padding: 1.25rem;
  }

  .stat-card__value {
    font-size: 2rem;
  }

  .stat-card__icon {
    width: 36px;
    height: 36px;
    font-size: 1.05rem;
  }

  .quick-actions {
    margin-top: 2rem;
  }

  .section-title {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }

  .actions-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .action-card {
    padding: 1.25rem;
  }

  .action-card__icon {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }
}

@media (max-width: 580px) {
  .page-header__title {
    font-size: 1.4rem;
  }
}

@media (max-width: 480px) {
  .page-header {
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
  }

  .page-header__title {
    font-size: 1.3rem;
  }

  .page-header__subtitle {
    font-size: 0.8rem;
  }

  .stats-grid {
    gap: 0.875rem;
  }

  .stat-card {
    padding: 1.125rem;
  }

  .stat-card__header {
    margin-bottom: 0.875rem;
  }

  .stat-card__title {
    font-size: 0.7rem;
  }

  .stat-card__icon {
    width: 34px;
    height: 34px;
    font-size: 1rem;
  }

  .stat-card__value {
    font-size: 1.85rem;
  }

  .stat-card__change {
    font-size: 0.8rem;
  }

  .section-title {
    font-size: 1.15rem;
  }

  .action-card {
    padding: 1rem;
    gap: 1rem;
  }

  .action-card__icon {
    width: 45px;
    height: 45px;
    font-size: 1.1rem;
  }

  .action-card__title {
    font-size: 0.95rem;
  }

  .action-card__desc {
    font-size: 0.8rem;
  }
}
</style>

