<template>
  <section ref="sectionRef" class="team" id="team">
    <!-- Background is now handled by GlobalBackground component -->

    <div class="container">
      <!-- Section Header - Premium Style -->
      <div ref="headerRef" class="team__header">
        <div class="team__badge">
          <span class="team__badge-icon">
            <i class="fas fa-music"></i>
          </span>
          <span class="team__badge-text">{{ t('team.label') }}</span>
        </div>

        <h2 class="team__title">{{ t('team.title') }}</h2>
      </div>

      <!-- Error State -->
      <ErrorMessage
        v-if="error"
        :message="error"
        retry
        @retry="() => dataStore.fetchArtists()"
      />

      <!-- Artists Grid -->
      <div v-else ref="gridRef" class="team__grid">
        <!-- Real Artists -->
        <DJCard
          v-for="artist in artists"
          :key="artist.id"
          :dj="artist"
        />

        <!-- Empty State (only after loading is done and no artists) -->
        <div v-if="artists.length === 0 && !isLoading" class="team__empty-inline">
        <p>{{ t('team.noArtists') }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import DJCard from '@/components/common/DJCard.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import { useDataStore } from '@/stores/data'
import { useI18n } from 'vue-i18n'
import { useMobile } from '@/composables/useMobile'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const { t } = useI18n()

// Emit loaded event
const emit = defineEmits(['loaded'])

// Template refs for animations
const sectionRef = ref<HTMLElement | null>(null)
const headerRef = ref<HTMLElement | null>(null)
const gridRef = ref<HTMLElement | null>(null)

// GSAP context
let gsapCtx: gsap.Context | null = null
let animationsInitialized = false

// ✅ Utiliser le dataStore au lieu d'appeler l'API
const dataStore = useDataStore()

// Data
const artists = computed(() => dataStore.artists)
const isLoading = computed(() => dataStore.isArtistsLoading)
const error = computed(() => dataStore.artistsError)

// ═══════════════════════════════════════════════════════════════
// AWWWARDS-WORTHY ANIMATIONS - Fluid and elegant
// ═══════════════════════════════════════════════════════════════

// Mobile detection + reduced motion preference (accessibility)
const { isMobile, prefersReducedMotion } = useMobile()

const initHeaderAnimations = () => {
  // SKIP animations on mobile OR if user prefers reduced motion
  if (isMobile.value || prefersReducedMotion.value) {
    return
  }

  gsapCtx = gsap.context(() => {
    const badge = headerRef.value?.querySelector('.team__badge')
    const title = headerRef.value?.querySelector('.team__title')

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
  }, sectionRef.value || undefined)
}

// Animate DJ cards when they appear (desktop only)
const animateDJCards = () => {
  if (animationsInitialized) return
  animationsInitialized = true

  // SKIP animations on mobile OR if user prefers reduced motion
  if (isMobile.value || prefersReducedMotion.value) {
    return
  }

  const cards = gridRef.value?.querySelectorAll('.dj-card')
  if (!cards || cards.length === 0) return

  // Check if section is already in view
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
      amount: 0.7,
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

// Watch for artists to load then setup card animations
watch(artists, async (newArtists, oldArtists) => {
  // Only trigger when we go from 0 to some artists
  if (newArtists.length > 0 && (!oldArtists || oldArtists.length === 0) && !animationsInitialized) {
    await nextTick()
    // Small delay to ensure DOM is fully rendered
    setTimeout(() => {
      animateDJCards()
    }, 50)
}
}, { immediate: true })

// Lifecycle
onMounted(async () => {
  // Load artists FIRST (will use cache if already loaded)
  await dataStore.fetchArtists().catch(() => {})

  // Init header animations after data attempt
  await nextTick()
  initHeaderAnimations()

  // If artists already loaded, setup card animations
  if (artists.value.length > 0 && !animationsInitialized) {
    setTimeout(() => {
      animateDJCards()
    }, 100)
  }

  emit('loaded')
})

onUnmounted(() => {
  if (gsapCtx) {
    gsapCtx.revert()
    gsapCtx = null
  }
})
</script>

<style scoped>
/* ============================================
   TEAM SECTION - PREMIUM DESIGN
   Matching Hero & Events Section Aesthetic
   ============================================ */

.team {
  position: relative;
  padding: 120px 0;
  background: transparent;
  overflow: hidden;
  min-height: 600px;
}

/* Background is now handled by GlobalBackground component */

/* ===== SECTION HEADER ===== */
.team__header {
  position: relative;
  z-index: 1;
  text-align: center;
  margin-bottom: 64px;
}

/* Badge - Glass Style matching Hero */
.team__badge {
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

.team__badge-icon {
  color: var(--color-primary);
  font-size: 12px;
  animation: badge-pulse 2s ease-in-out infinite;
}

.team__badge-text {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 2px;
}

/* Title */
.team__title {
  font-family: var(--font-heading);
  font-size: clamp(36px, 5vw, 52px);
  font-weight: 800;
  color: #fff;
  line-height: 1.1;
  margin: 0;
  letter-spacing: -0.03em;
}

/* ===== TEAM GRID ===== */
.team__grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
  min-height: 400px;
}

.team__grid :deep(.dj-card) {
  will-change: transform, opacity;
}

.team__empty,
.team__empty-inline {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 4rem 0;
  color: rgba(255, 255, 255, 0.6);
}

.team__empty-inline {
  grid-column: 1 / -1;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .team {
    padding: 100px 0;
  }

  .team__header {
    margin-bottom: 48px;
  }

  .team__grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .team {
    padding: 80px 0;
  }

  .team__grid {
    grid-template-columns: 1fr;
    gap: 24px;
    max-width: 400px;
    margin: 0 auto;
  }

  .team__header {
    margin-bottom: 40px;
  }

  .team__badge {
    padding: 8px 16px;
  }

  .team__badge-text {
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .team {
    padding: 60px 0;
  }

  .team__grid {
    max-width: 100%;
    padding: 0 4px;
  }
}
</style>
