<template>
  <section ref="sectionRef" class="events" id="events">
    <!-- Background is now handled by GlobalBackground component -->

    <div class="container">
      <!-- Section Header - Premium Style -->
      <div ref="headerRef" class="events__header">
        <div class="events__badge">
          <span class="events__badge-icon">
            <i class="fas fa-calendar-alt"></i>
          </span>
          <span class="events__badge-text">{{ t('events.label') }}</span>
        </div>

        <h2 class="events__title">
          {{ t('events.title') }}
        </h2>
      </div>

      <!-- Error State -->
      <ErrorMessage
        v-if="error"
        :message="error"
        retry
        @retry="loadEvents"
      />

      <!-- Events Grid - Always visible (data already cached from Hero) -->
      <div v-else ref="gridRef" class="events__grid-container">
        <!-- Real Events -->
        <EventCard
          v-for="(event, index) in displayedEvents"
          :key="event.id"
          :event="event"
          :variant="getCardVariant(index)"
        />

        <!-- Coming Soon Cards -->
        <EventCard
          v-for="(comingSoonEvent, index) in comingSoonEvents"
          :key="`coming-soon-${index}`"
          :event="comingSoonEvent"
          :variant="getCardVariant(displayedEvents.length + index)"
          :is-coming-soon="true"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import EventCard from '@/components/common/EventCard.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import { useDataStore } from '@/stores/data'
import { useI18n } from 'vue-i18n'
import { useAnimations } from '@/composables/useAnimations'
import { logger } from '@/services/logger'

const { t } = useI18n()

// Emit loaded event
const emit = defineEmits(['loaded'])

// Template refs for animations
const sectionRef = ref<HTMLElement | null>(null)
const headerRef = ref<HTMLElement | null>(null)
const gridRef = ref<HTMLElement | null>(null)

// Animation context
const { createContext, isReady: animationsReady } = useAnimations()
let animationContext: ReturnType<typeof createContext> | null = null

// ✅ Utiliser le dataStore au lieu d'appeler l'API
const dataStore = useDataStore()

const MAX_EVENTS = 3
const error = computed(() => dataStore.eventsError)

// ✅ Charger depuis le dataStore (cache - probablement déjà chargé par Hero)
const loadEvents = async () => {
  try {
    await dataStore.fetchEvents()
  } catch (err) {
    logger.error('Error loading events:', err)
  } finally {
    emit('loaded')
  }
}

// ═══════════════════════════════════════════════════════════════
// ANIMATIONS - Desktop only for performance
// ═══════════════════════════════════════════════════════════════

const initScrollAnimations = () => {
  animationContext = createContext(sectionRef.value || undefined)
  if (!animationContext.gsap) return

  const { gsap, ScrollTrigger } = animationContext
  if (!ScrollTrigger) return

  animationContext.context?.add(() => {
    // ─────────────────────────────────────────────────────────────
    // HEADER - Cinematic text reveal (desktop only)
    // ─────────────────────────────────────────────────────────────
    const badge = headerRef.value?.querySelector('.events__badge')
    const title = headerRef.value?.querySelector('.events__title')

    const headerTl = gsap.timeline({
      scrollTrigger: {
        trigger: headerRef.value,
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    })

    if (badge) {
      gsap.set(badge, { opacity: 0, y: 25 })
      headerTl.to(badge, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out'
      })
    }

    if (title) {
      gsap.set(title, { opacity: 0, y: 35, clipPath: 'inset(0 0 100% 0)' })
      headerTl.to(title, {
        opacity: 1,
        y: 0,
        clipPath: 'inset(0 0 0% 0)',
        duration: 1,
        ease: 'power3.out'
      }, '-=0.5')
    }

    // ─────────────────────────────────────────────────────────────
    // CARDS - Staggered reveal (desktop only)
    // ─────────────────────────────────────────────────────────────
    const cards = gridRef.value?.querySelectorAll('.event-card')
    if (cards && cards.length > 0) {
      const rect = gridRef.value?.getBoundingClientRect()
      const isInView = rect && rect.top < window.innerHeight * 0.85

      gsap.set(cards, {
        opacity: 0,
        y: 50,
        scale: 0.96
      })

      const animationConfig = {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1,
        stagger: {
          amount: 0.6,
          from: 'start' as const
        },
        ease: 'power2.out'
      }

      if (isInView) {
        gsap.to(cards, animationConfig)
      } else {
        gsap.to(cards, {
          ...animationConfig,
          scrollTrigger: {
            trigger: gridRef.value,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        })
      }
    }
  })
}

// Wait for animations ready
watch(animationsReady, async (ready) => {
  if (ready) {
    await nextTick()
    requestAnimationFrame(() => {
      initScrollAnimations()
    })
  }
}, { immediate: true })

// Lifecycle
onMounted(async () => {
  // Load events (will use cache if already loaded by Hero)
  loadEvents()
})

onUnmounted(() => {
  if (animationContext) {
    animationContext.cleanup()
    animationContext = null
  }
})

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
/* ============================================
   EVENTS SECTION - PREMIUM DESIGN
   Matching Hero Section Aesthetic
   ============================================ */

.events {
  position: relative;
  padding: 120px 0;
  background: transparent;
  overflow-x: clip;
  overflow-y: visible;
}

/* Background is now handled by GlobalBackground component */

/* ===== SECTION HEADER ===== */
.events__header {
  position: relative;
  z-index: 1;
  text-align: center;
  margin-bottom: 64px;
}

/* Badge - Glass Style matching Hero */
.events__badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50px;
  margin-bottom: 24px;
}

.events__badge-icon {
  color: var(--color-primary);
  font-size: 12px;
  animation: badge-pulse 2s ease-in-out infinite;
}

.events__badge-text {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 2px;
}

/* Title */
.events__title {
  font-family: var(--font-heading);
  font-size: clamp(36px, 5vw, 52px);
  font-weight: 800;
  color: #fff;
  line-height: 1.1;
  margin: 0;
  letter-spacing: -0.03em;
}

/* ===== GSAP SCROLL ANIMATION ===== */
/* Elements start visible - GSAP will animate them when in viewport */

/* ===== EVENTS GRID ===== */
.events__grid-container {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

/* Desktop only: Enable will-change for smooth animations */
@media (min-width: 1025px) {
  .events__grid-container :deep(.event-card) {
    will-change: transform, opacity;
  }
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .events {
    padding: 100px 0;
  }

  .events__header {
    margin-bottom: 48px;
  }

  .events__grid-container {
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .events {
    padding: 80px 0;
    overscroll-behavior: none;
  }

  .events__grid-container {
    grid-template-columns: 1fr;
    gap: 24px;
    max-width: 400px;
  }

  .events__header {
    margin-bottom: 40px;
  }

  .events__badge {
    padding: 8px 16px;
  }

  .events__badge-text {
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .events {
    padding: 60px 0;
  }

  .events__grid-container {
    max-width: 100%;
    padding: 0 4px;
  }
}

/* Mobile Optimizations */
@media (max-width: 768px) {
  /* ✅ Animations d'entrée section */
  .events__badge {
    animation: eventsFadeInUp 0.6s ease-out 0.1s backwards;
  }

  .events__title {
    animation: eventsFadeInUp 0.8s ease-out 0.2s backwards;
  }

  @keyframes eventsFadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Disable heavy glassmorphism */
  .events__badge {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    background: rgba(30, 30, 35, 0.9) !important;
    border: 1px solid rgba(255, 255, 255, 0.15) !important;
  }

  /* ✅ Réactiver pulse subtil sur badge */
  .events__badge-icon {
    animation: badge-pulse 3s ease-in-out infinite !important;
  }

  /* ✅ Transitions safe - uniquement opacity (pas de repositionnement) */
  .events__grid-container :deep(.event-card) {
    will-change: auto !important;
    transition: opacity 0.4s ease !important;
  }

  /* ✅ Animation d'apparition des cartes - fade in staggeré */
  .events__grid-container :deep(.event-card) {
    animation: cardFadeIn 0.6s ease-out backwards;
  }

  .events__grid-container :deep(.event-card:nth-child(1)) {
    animation-delay: 0.3s;
  }

  .events__grid-container :deep(.event-card:nth-child(2)) {
    animation-delay: 0.4s;
  }

  .events__grid-container :deep(.event-card:nth-child(3)) {
    animation-delay: 0.5s;
  }

  @keyframes cardFadeIn {
    from {
      opacity: 0;
      transform: translateY(15px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
</style>
