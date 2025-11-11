<template>
  <section class="team section" id="team">
    <div class="container">
      <!-- Section Header -->
      <div class="section__header" data-aos="fade-down" data-aos-duration="800">
        <div class="section__label">
          <span class="section__label-line"></span>
          <span class="section__label-text">{{ t('team.label') }}</span>
          <span class="section__label-line"></span>
        </div>
        <h2 class="section__title">{{ t('team.title') }}</h2>
      </div>

      <!-- Loading State -->
      <LoadingSpinner v-if="isLoading" :message="t('common.loading')" />

      <!-- Error State -->
      <ErrorMessage 
        v-else-if="error"
        :message="error"
        retry
        @retry="loadArtists"
      />

      <!-- Artists Grid -->
      <div v-else-if="artists.length > 0" class="team__grid">
        <DJCard
          v-for="(artist, index) in artists"
          :key="artist.id"
          :dj="artist"
          data-aos="zoom-in-up"
          :data-aos-delay="index * 120"
          data-aos-duration="800"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="team__empty">
        <p>{{ t('team.noArtists') }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import DJCard from '@/components/common/DJCard.vue'
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

// Data
const artists = computed(() => dataStore.artists)
const isLoading = computed(() => dataStore.isArtistsLoading)
const error = computed(() => dataStore.artistsError)

// Methods
const loadArtists = async () => {
  try {
    await dataStore.fetchArtists()
  } catch (err) {
    logger.error('Error loading artists:', err)
  } finally {
    emit('loaded')
  }
}

// Lifecycle
onMounted(() => {
  loadArtists()
})
</script>

<style scoped>
.team {
  background: var(--color-black);
  position: relative;
}

.team__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
}

.team__empty {
  text-align: center;
  padding: 4rem 0;
  color: rgba(255, 255, 255, 0.6);
}

/* Responsive - Tablette */
@media (max-width: 1024px) {
  .team__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .team__grid {
    grid-template-columns: 1fr;
    gap: 2rem;
    max-width: 600px;
    margin: 0 auto;
  }
}
</style>

