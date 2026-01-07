<template>
  <section ref="sectionRef" class="past-events" id="historique">
    <!-- Background is now handled by GlobalBackground component -->

    <div class="container">
      <!-- Section Header - Premium Style -->
      <div ref="headerRef" class="past-events__header">
        <div class="past-events__badge">
          <span class="past-events__badge-icon">
            <i class="fas fa-history"></i>
          </span>
          <span class="past-events__badge-text">{{ t('historique.label') }}</span>
        </div>

        <h2 class="past-events__title">
          {{ t('historique.title') }}
        </h2>
      </div>

      <!-- Error State -->
      <ErrorMessage
        v-if="error"
        :message="error"
        retry
        @retry="loadEvents"
      />

      <!-- Loading State with Skeletons (initial load) -->
      <div v-else-if="dataStore.isPastEventsLoading && displayedEvents.length === 0" class="past-events__grid-container">
        <SkeletonCard v-for="i in 6" :key="i" variant="event" />
      </div>

      <!-- Events Grid -->
      <div v-else-if="displayedEvents.length > 0" ref="gridRef" class="past-events__grid-container">
        <!-- Real Events -->
        <EventCard
          v-for="event in displayedEvents"
          :key="event.id"
          :event="event"
          variant="past"
        />
      </div>

      <!-- Load More Button -->
      <div v-if="hasMoreEvents && !error" class="past-events__load-more">
        <button
          @click="loadMore"
          :disabled="isLoadingMore"
          class="past-events__load-more-btn"
        >
          <span v-if="!isLoadingMore">{{ t('historique.loadMore') }}</span>
          <span v-else>
            <i class="fas fa-spinner fa-spin"></i>
            {{ t('common.loading') }}
          </span>
        </button>
      </div>

      <!-- No Events State -->
      <div v-if="!error && displayedEvents.length === 0 && !dataStore.isPastEventsLoading" class="past-events__empty">
        <p>{{ t('historique.noEvents') }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import EventCard from '@/components/common/EventCard.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'
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

// Utiliser le dataStore
const dataStore = useDataStore()

const INITIAL_LIMIT = 12
const isLoadingMore = ref(false)

const error = computed(() => dataStore.pastEventsError)

// Charger depuis le dataStore
const loadEvents = async () => {
  try {
    await dataStore.fetchPastEvents(INITIAL_LIMIT, 0)
  } catch (err) {
    logger.error('Error loading past events:', err)
  } finally {
    emit('loaded')
  }
}

// Load more events
const loadMore = async () => {
  if (isLoadingMore.value || !hasMoreEvents.value) return

  isLoadingMore.value = true
  try {
    const currentLength = dataStore.pastEvents.length
    await dataStore.fetchPastEvents(INITIAL_LIMIT, currentLength)

    // Animate new cards after they're added
    await nextTick()
    if (animationContext?.gsap && gridRef.value) {
      const newCards = gridRef.value.querySelectorAll('.event-card')
      const newCardsArray = Array.from(newCards).slice(currentLength)

      if (newCardsArray.length > 0) {
        animationContext.gsap.from(newCardsArray, {
          opacity: 0,
          y: 30,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power2.out'
        })
      }
    }
  } catch (err) {
    logger.error('Error loading more past events:', err)
  } finally {
    isLoadingMore.value = false
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
    const badge = headerRef.value?.querySelector('.past-events__badge')
    const title = headerRef.value?.querySelector('.past-events__title')

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
  // Load events
  loadEvents()
})

onUnmounted(() => {
  if (animationContext) {
    animationContext.cleanup()
    animationContext = null
  }
})

// Events to display
const displayedEvents = computed(() => dataStore.pastEventsList)

// Check if there are more events to load
const hasMoreEvents = computed(() => {
  return dataStore.pastEventsHasMore
})
</script>

<style scoped>
/* ============================================
   PAST EVENTS SECTION - PREMIUM DESIGN
   Matching Events Section Aesthetic
   ============================================ */

.past-events {
  position: relative;
  padding: 120px 0;
  background: transparent;
  overflow-x: clip;
  overflow-y: visible;
}

/* ===== SECTION HEADER ===== */
.past-events__header {
  position: relative;
  z-index: 1;
  text-align: center;
  margin-bottom: 64px;
}

/* Badge - Glass Style matching Hero */
.past-events__badge {
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

.past-events__badge-icon {
  color: var(--color-primary);
  font-size: 12px;
  animation: badge-pulse 2s ease-in-out infinite;
}

.past-events__badge-text {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 2px;
}

/* Title */
.past-events__title {
  font-family: var(--font-heading);
  font-size: clamp(36px, 5vw, 52px);
  font-weight: 800;
  color: #fff;
  line-height: 1.1;
  margin: 0;
  letter-spacing: -0.03em;
}

/* ===== EVENTS GRID ===== */
.past-events__grid-container {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Ensure cards are visible by default (GSAP will override) */
.past-events__grid-container :deep(.event-card) {
  opacity: 1;
}

/* Desktop only: Enable will-change for smooth animations */
@media (min-width: 1025px) {
  .past-events__grid-container :deep(.event-card) {
    will-change: transform, opacity;
  }
}

/* ===== LOAD MORE BUTTON ===== */
.past-events__load-more {
  display: flex;
  justify-content: center;
  margin-top: 48px;
}

.past-events__load-more-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 40px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.past-events__load-more-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--color-primary) 0%, #b01030 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: -1;
}

.past-events__load-more-btn:hover:not(:disabled) {
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(220, 20, 60, 0.35);
}

.past-events__load-more-btn:hover:not(:disabled)::before {
  opacity: 1;
}

.past-events__load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.past-events__load-more-btn i {
  font-size: 10px;
}

/* ===== EMPTY STATE ===== */
.past-events__empty {
  text-align: center;
  padding: 80px 20px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 16px;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .past-events {
    padding: 100px 0;
  }

  .past-events__header {
    margin-bottom: 48px;
  }

  .past-events__grid-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .past-events {
    padding: 80px 0;
    overscroll-behavior: none;
  }

  .past-events__grid-container {
    grid-template-columns: 1fr;
    gap: 16px;
    max-width: 500px;
  }

  .past-events__header {
    margin-bottom: 40px;
  }

  .past-events__badge {
    padding: 8px 16px;
  }

  .past-events__badge-text {
    font-size: 10px;
  }

  .past-events__load-more {
    margin-top: 32px;
  }

  .past-events__load-more-btn {
    width: 100%;
    max-width: 300px;
  }
}

@media (max-width: 480px) {
  .past-events {
    padding: 60px 0;
  }

  .past-events__grid-container {
    max-width: 100%;
    padding: 0 4px;
  }
}

/* Mobile Optimizations */
@media (max-width: 768px) {
  /* Animations d'entrée section */
  .past-events__badge {
    animation: pastEventsFadeInUp 0.6s ease-out 0.1s backwards;
  }

  .past-events__title {
    animation: pastEventsFadeInUp 0.8s ease-out 0.2s backwards;
  }

  @keyframes pastEventsFadeInUp {
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
  .past-events__badge,
  .past-events__load-more-btn {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    background: rgba(30, 30, 35, 0.9) !important;
    border: 1px solid rgba(255, 255, 255, 0.15) !important;
  }

  /* Réactiver pulse subtil sur badge */
  .past-events__badge-icon {
    animation: badge-pulse 3s ease-in-out infinite !important;
  }

  /* Transitions safe - uniquement opacity */
  .past-events__grid-container :deep(.event-card) {
    will-change: auto !important;
    transition: opacity 0.4s ease !important;
  }

  /* Animation d'apparition des cartes - fade in staggeré */
  .past-events__grid-container :deep(.event-card) {
    animation: cardFadeIn 0.6s ease-out backwards;
  }

  .past-events__grid-container :deep(.event-card:nth-child(1)) {
    animation-delay: 0.3s;
  }

  .past-events__grid-container :deep(.event-card:nth-child(2)) {
    animation-delay: 0.4s;
  }

  .past-events__grid-container :deep(.event-card:nth-child(3)) {
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
