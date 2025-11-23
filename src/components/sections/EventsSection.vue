<template>
  <section class="events section" id="events">
    <div class="container">
      <!-- Section Header -->
      <div class="section__header" data-aos="fade-down" data-aos-duration="800">
        <div class="section__label">
          <span class="section__label-line"></span>
          <span class="section__label-text">{{ t('events.label') }}</span>
          <span class="section__label-line"></span>
        </div>
        <h2 class="section__title">{{ t('events.title') }}</h2>
      </div>

      <!-- Loading State -->
      <LoadingSpinner v-if="isLoading" :message="t('common.loading')" />

      <!-- Error State -->
      <ErrorMessage 
        v-else-if="error"
        :message="error"
        retry
        @retry="loadEvents"
      />

      <!-- Events Grid -->
      <div v-else class="events__masonry">
        <!-- Real Events -->
        <EventCard
          v-for="(event, index) in displayedEvents"
          :key="event.id"
          :event="event"
          :variant="getCardVariant(index)"
          :data-aos="index === 0 ? 'zoom-in' : 'flip-up'"
          :data-aos-delay="index * 150"
          :data-aos-duration="index === 0 ? '1000' : '700'"
        />
        
        <!-- Coming Soon Cards -->
        <EventCard
          v-for="(comingSoonEvent, index) in comingSoonEvents"
          :key="`coming-soon-${index}`"
          :event="comingSoonEvent"
          :variant="getCardVariant(displayedEvents.length + index)"
          :data-aos="'flip-up'"
          :data-aos-delay="(displayedEvents.length + index) * 150"
          :data-aos-duration="'700'"
          :is-coming-soon="true"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import EventCard from '@/components/common/EventCard.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import { useDataStore } from '@/stores/data'
import { useI18n } from 'vue-i18n'
import { logger } from '@/services/logger'

const { t } = useI18n()

// Emit loaded event
const emit = defineEmits(['loaded'])

// ✅ Utiliser le dataStore au lieu d'appeler l'API
const dataStore = useDataStore()

const MAX_EVENTS = 3
const isLoading = computed(() => dataStore.isEventsLoading)
const error = computed(() => dataStore.eventsError)

// ✅ Charger depuis le dataStore (cache)
const loadEvents = async () => {
  try {
    await dataStore.fetchEvents()
  } catch (err) {
    logger.error('Error loading events:', err)
  } finally {
    emit('loaded')
  }
}

// Lifecycle
onMounted(loadEvents)

// Events to display (real events) - max 3 événements à venir
const displayedEvents = computed(() => {
  return dataStore.getUpcomingEvents().slice(0, MAX_EVENTS)
})

// Generate "Coming Soon" event objects
const comingSoonEvents = computed(() => {
  const remaining = MAX_EVENTS - displayedEvents.value.length
  if (remaining <= 0) return []
  
  return Array(remaining).fill(null).map((_, index) => ({
    id: `coming-soon-${index}`,
    title: t('events.comingSoon.title'),
    description: t('events.comingSoon.description'),
    category: 'party' as const,
    date: '2025-12-31',
    time: '21:00',
    location: 'TBA',
    city: '...',
    featured: false
  }))
})

// Determine card variant based on index for masonry layout
const getCardVariant = (index: number): 'large' | 'medium' => {
  return index === 0 ? 'large' : 'medium'
}
</script>

<style scoped>
.events {
  background: var(--color-black);
  position: relative;
}

/* Layout Masonry Asymétrique du prototype */
.events__masonry {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

/* Responsive */
@media (max-width: 768px) {
  .events__masonry {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .events__masonry {
    gap: 1.25rem;
  }
}
</style>
