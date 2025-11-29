<template>
  <div class="home">
    <!-- Hero Section -->
    <HeroSection @loaded="onHeroLoaded" />

    <!-- Events Section -->
    <EventsSection @loaded="onEventsLoaded" />

    <!-- Team Section -->
    <TeamSection @loaded="onTeamLoaded" />

    <!-- Contact Section -->
    <!-- <ContactSection /> -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDataStore } from '@/stores/data'
import HeroSection from '@/components/sections/HeroSection.vue'
import EventsSection from '@/components/sections/EventsSection.vue'
import TeamSection from '@/components/sections/TeamSection.vue'

const dataStore = useDataStore()

// Track loading state of each section
const sectionsLoaded = ref({
  hero: false,
  events: false,
  team: false
})

// ✅ Précharger toutes les données en parallèle au montage
onMounted(async () => {
  sectionsLoaded.value = {
    hero: false,
    events: false,
    team: false
  }

  // Précharger les données en arrière-plan (non bloquant)
  dataStore.preloadAll()

  // Le router gère déjà le stopLoading dans afterEach
  // On n'a plus besoin de le faire ici
})

const onHeroLoaded = () => {
  sectionsLoaded.value.hero = true
}

const onEventsLoaded = () => {
  sectionsLoaded.value.events = true
}

const onTeamLoaded = () => {
  sectionsLoaded.value.team = true
}
</script>

