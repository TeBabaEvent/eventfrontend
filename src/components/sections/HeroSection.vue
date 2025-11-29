<template>
  <section class="hero" id="home">
    <!-- Background is now handled by GlobalBackground component -->

    <div class="container">
      <div class="hero__layout">
        <!-- Main Content -->
        <div ref="heroMainRef" class="hero__main">
          <!-- Top Section: Badge only -->
          <div class="hero__main-top">
            <!-- Badge -->
            <div ref="badgeRef" class="hero__badge hero__animate">
              <span class="hero__badge-icon">
                <i class="fas fa-fire"></i>
              </span>
              <span class="hero__badge-text">{{ t('hero.badge') }}</span>
            </div>
          </div>

          <!-- Bottom Section: Title, Subtitle, CTA Buttons -->
          <div class="hero__main-bottom">
            <!-- Title -->
            <h1 ref="titleRef" class="hero__title">
              <span class="hero__title-line">{{ t('hero.title.line1') }}</span>
              <span class="hero__title-accent">{{ t('hero.title.accent') }}</span>
              <span class="hero__title-line">{{ t('hero.title.line2') }}</span>
            </h1>

            <!-- Subtitle -->
            <p ref="subtitleRef" class="hero__subtitle hero__animate">
              {{ t('hero.subtitle') }}
            </p>

            <!-- CTA Buttons -->
            <div ref="ctaRef" class="hero__cta">
              <BaseButton
                variant="primary"
                size="large"
                icon="fas fa-arrow-right"
                @click="scrollToEvents"
              >
                {{ t('hero.cta.explore') }}
              </BaseButton>

              <BaseButton
                variant="secondary"
                size="large"
                icon="fas fa-calendar-plus"
                tag="a"
                :href="organizeEventLink"
                target="_blank"
                rel="noopener"
                class="hero__cta-secondary"
              >
                {{ t('hero.cta.organize') }}
              </BaseButton>
            </div>
          </div>
        </div>

        <!-- Featured Event Card -->
        <div ref="featuredRef" class="hero__featured hero__animate">
          <!-- Skeleton Loader -->
          <div v-if="!featuredEvent" class="hero__event-skeleton">
            <div class="skeleton-image"></div>
            <div class="skeleton-content">
              <div class="skeleton-line title"></div>
              <div class="skeleton-line text"></div>
              <div class="skeleton-line text"></div>
            </div>
          </div>

          <article v-else class="hero__event-card" @click="goToEventDetail" @mouseenter="prefetchEvent">
            <!-- Image Container -->
            <div class="hero__event-image">
              <img
                :src="optimizedHeroImage"
                :alt="featuredEvent.title"
                fetchpriority="high"
                loading="eager"
                decoding="async"
                width="600"
                height="720"
              >
              <div class="hero__event-overlay"></div>
            </div>

            <!-- Content Overlay -->
            <div class="hero__event-content">
              <!-- Bottom Content -->
              <div class="hero__event-bottom">
                <div class="hero__event-category">{{ featuredEventCategoryLabel }}</div>
                <h3 class="hero__event-title">{{ displayTitle }}</h3>

                <div class="hero__event-meta">
                  <div class="hero__event-date-inline">
                    <i class="fas fa-calendar"></i>
                    <span>{{ formatDay(featuredEvent.date) }} {{ formatMonth(featuredEvent.date, t) }}</span>
                  </div>
                  <div class="hero__event-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>{{ featuredEvent.city }}</span>
                  </div>
                </div>

                <div class="hero__event-footer">
                  <div v-if="minPrice" class="hero__event-price">
                    <span class="hero__event-price-label">{{ t('events.price.from') }}</span>
                    <span class="hero__event-price-value">{{ formatPrice(minPrice.value, minPrice.currency) }}</span>
                  </div>
                  <button class="hero__event-cta" @click.stop="goToEventDetail" @mouseenter="prefetchEvent">
                    <span>{{ t('events.cta.learnMore') }}</span>
                    <i class="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import { scrollToElement, formatPrice, generateWhatsAppLink, formatDay, formatMonth } from '@/utils'
import { getOptimizedImageUrl } from '@/utils/image'
import { getEventTitle } from '@/utils/translations'
import { CONTACT_INFO } from '@/constants'
import { useDataStore } from '@/stores/data'
import { useI18n } from 'vue-i18n'
import { logger } from '@/services/logger'
import { api } from '@/services/api'
import { useMobile } from '@/composables/useMobile'
import gsap from 'gsap'

const { t, locale } = useI18n()
const router = useRouter()
const isPrefetched = ref(false)

// Emit loaded event
const emit = defineEmits(['loaded'])

// ✅ Utiliser le dataStore au lieu de faire un appel API
const dataStore = useDataStore()

// Template refs for GSAP animations
const heroMainRef = ref<HTMLElement | null>(null)
const badgeRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const subtitleRef = ref<HTMLElement | null>(null)
const ctaRef = ref<HTMLElement | null>(null)
const featuredRef = ref<HTMLElement | null>(null)

// GSAP context for cleanup
let gsapContext: gsap.Context | null = null
let animationsInitialized = false

// Data
const events = computed(() => dataStore.getUpcomingEvents())

const stats = computed(() => [
  { label: t('stats.participants'), value: 50000 },
  { label: t('stats.experience'), value: 15 },
  { label: t('stats.countries'), value: 4 }
])

const animatedStats = ref<Record<string, number>>({})

// Computed - Get the closest event (by date)
const featuredEvent = computed(() => {
  const allEvents = events.value
  if (allEvents.length === 0) return null

  const now = new Date()
  now.setHours(0, 0, 0, 0) // Reset time to compare only dates

  // Sort events by date (closest first)
  const sortedEvents = [...allEvents].sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    dateA.setHours(0, 0, 0, 0)
    dateB.setHours(0, 0, 0, 0)
    return dateA.getTime() - dateB.getTime()
  })

  // Find the first upcoming event
  const upcomingEvent = sortedEvents.find(event => {
    const eventDate = new Date(event.date)
    eventDate.setHours(0, 0, 0, 0)
    return eventDate >= now
  })

  return upcomingEvent || sortedEvents[0] || null
})

const optimizedHeroImage = computed(() => {
  if (!featuredEvent.value) return ''
  const url = featuredEvent.value.image_url || featuredEvent.value.image || ''
  return getOptimizedImageUrl(url, 1200) // Larger width for hero
})

const featuredEventCategoryLabel = computed(() => {
  if (!featuredEvent.value) return ''
  return t(`categories.${featuredEvent.value.category}`)
})

const displayTitle = computed(() => {
  if (!featuredEvent.value) return ''
  return getEventTitle(featuredEvent.value, locale.value)
})

// Calculate minimum price from packs
const minPrice = computed(() => {
  if (!featuredEvent.value) return null

  if (featuredEvent.value.packs && featuredEvent.value.packs.length > 0) {
    const prices = featuredEvent.value.packs.map((pack) => pack.price)
    const min = Math.min(...prices)
    const currency = featuredEvent.value.packs[0]?.currency || '€'
    return { value: min, currency }
  }

  if (featuredEvent.value.price) {
    return { value: featuredEvent.value.price.from, currency: featuredEvent.value.price.currency }
  }

  return null
})

const organizeEventLink = computed(() => {
  return generateWhatsAppLink(t('hero.whatsappMessage'), CONTACT_INFO.whatsapp)
})

// Methods
const scrollToEvents = () => {
  scrollToElement('#events')
}

// Prefetch event data on hover for instant navigation
const prefetchEvent = () => {
  if (featuredEvent.value && !isPrefetched.value) {
    isPrefetched.value = true
    api.getEventById(featuredEvent.value.id).catch(() => {})
  }
}

const goToEventDetail = () => {
  if (!featuredEvent.value) return
  router.push({ name: 'event-detail', params: { id: featuredEvent.value.id } })
}

// Animate stats on mount (disabled on mobile)
const animateStats = () => {
  // On mobile, just set final values immediately (no animation)
  if (isMobile.value) {
    stats.value.forEach(stat => {
      animatedStats.value[stat.label] = stat.value
    })
    return
  }

  // On desktop, animate with requestAnimationFrame
  stats.value.forEach(stat => {
    let current = 0
    const increment = stat.value / 60
    const animate = () => {
      current += increment
      if (current >= stat.value) {
        animatedStats.value[stat.label] = stat.value
      } else {
        animatedStats.value[stat.label] = Math.floor(current)
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  })
}

// ═══════════════════════════════════════════════════════════════
// HERO ANIMATIONS - Desktop only for performance
// ═══════════════════════════════════════════════════════════════

// Mobile detection - disable ALL GSAP animations on mobile (based on screen width only)
const { isMobile } = useMobile()

const initHeroAnimations = () => {
  if (animationsInitialized) return
  animationsInitialized = true

  // SKIP all GSAP animations on mobile for smooth scroll performance
  if (isMobile.value) {
    return
  }

  gsapContext = gsap.context(() => {
    const titleLines = titleRef.value?.querySelectorAll('.hero__title-line, .hero__title-accent')

    // ─────────────────────────────────────────────────────────────
    // MASTER TIMELINE - Desktop only
    // ─────────────────────────────────────────────────────────────
    const masterTL = gsap.timeline({
      defaults: { ease: 'power2.out' },
      delay: 0.8
    })

    // Badge - Smooth fade
    masterTL.fromTo(badgeRef.value,
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 0.8 }
    )

    // Title Lines - Clip-path reveal
    if (titleLines && titleLines.length > 0) {
      masterTL.fromTo(titleLines,
        { opacity: 0, y: 40, clipPath: 'inset(0 0 100% 0)' },
        {
          opacity: 1,
          y: 0,
          clipPath: 'inset(0 0 0% 0)',
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out'
        },
        '-=0.5'
      )
    }

    // Subtitle - Soft emergence
    masterTL.fromTo(subtitleRef.value,
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 0.8 },
      '-=0.6'
    )

    // CTA Buttons
    if (ctaRef.value) {
      masterTL.fromTo(ctaRef.value,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.8 },
        '-=0.5'
      )
    }

    // ─────────────────────────────────────────────────────────────
    // FEATURED CARD - Elegant entrance
    // ─────────────────────────────────────────────────────────────
    if (featuredRef.value) {
      masterTL.fromTo(featuredRef.value,
        { opacity: 0, x: 80, scale: 0.95 },
        { opacity: 1, x: 0, scale: 1, duration: 1.2, ease: 'power3.out' },
        '-=0.4'
      )
    }

    // ─────────────────────────────────────────────────────────────
    // HOVER EFFECT - Card lift (desktop only)
    // ─────────────────────────────────────────────────────────────
    if (featuredRef.value) {
      const card = featuredRef.value.querySelector('.hero__event-card')
      if (card) {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            scale: 1.02,
            y: -8,
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.5)',
            duration: 0.4,
            ease: 'power2.out'
          })
        })
        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            scale: 1,
            y: 0,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
            duration: 0.4,
            ease: 'power2.out'
          })
        })
      }
    }
  }, heroMainRef.value?.parentElement || undefined)
}

onMounted(async () => {
  // Initialize stats
  stats.value.forEach(stat => {
    animatedStats.value[stat.label] = 0
  })

  // ✅ Start GSAP animations IMMEDIATELY (don't wait for data)
  await nextTick()
  requestAnimationFrame(() => {
    initHeroAnimations()
    animateStats()
  })

  // ✅ Load data in parallel (card will appear when ready)
  try {
    await dataStore.fetchEvents()
  } catch (error) {
    logger.error('Error loading events:', error)
  } finally {
    // Emit loaded event
    emit('loaded')
  }
})

// Cleanup GSAP on unmount
onUnmounted(() => {
  if (gsapContext) {
    gsapContext.revert()
    gsapContext = null
  }
})
</script>

<style scoped>
/* ========================================
   HERO SECTION - Refined Designer Edition
   ======================================== */

.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding-top: calc(var(--header-height) + 24px);
  padding-bottom: 80px;
  box-sizing: border-box;
  background: transparent;
  overflow: hidden;
}

/* Background is now handled by GlobalBackground component */

/* ===== LAYOUT - Balanced Proportions ===== */
.hero__layout {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 60px;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

/* ===== LEFT COLUMN ===== */
.hero__main {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px 0;
}

.hero__main-top {
  display: flex;
  flex-direction: column;
}

.hero__main-bottom {
  display: flex;
  flex-direction: column;
}

/* Badge - Glass Style matching card aesthetic */
.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50px;
  margin-bottom: 24px;
  width: fit-content;
  transition: all 0.3s ease;
}

.hero__badge:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
}

.hero__badge-icon {
  color: var(--color-primary);
  font-size: 12px;
  animation: hero-badge-pulse 2s ease-in-out infinite;
}

@keyframes hero-badge-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.hero__badge-text {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 2px;
}

/* Title - Cinematic Typography */
.hero__title {
  font-family: var(--font-heading);
  font-size: clamp(38px, 4vw, 56px);
  font-weight: 800;
  color: #fff;
  line-height: 1.08;
  margin: 0 0 24px 0;
  letter-spacing: -0.03em;
  perspective: 1000px;
}

.hero__title-line {
  display: block;
  transform-style: preserve-3d;
}

.hero__title-accent {
  display: block;
  color: var(--color-primary);
  position: relative;
  text-shadow: 0 0 60px rgba(220, 20, 60, 0.4);
  transform-style: preserve-3d;
}

/* Subtitle */
.hero__subtitle {
  font-size: 15px;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.55);
  max-width: 400px;
  font-weight: 400;
  margin: 0 0 36px 0;
}

/* CTAs - Matching card button style */
.hero__cta {
  display: flex;
  align-items: center;
  gap: 14px;
}

.hero__cta :deep(.btn) {
  position: relative;
  padding: 14px 28px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 50px;
  letter-spacing: 1.2px;
  white-space: nowrap;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.hero__cta :deep(.btn--primary) {
  background: var(--color-primary);
  box-shadow: 0 8px 24px rgba(220, 20, 60, 0.25);
  border: none;
}

.hero__cta :deep(.btn--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(220, 20, 60, 0.35);
  background: #b01030;
}

/* Secondary Button - Glass Style like card CTA */
.hero__cta :deep(.btn--secondary),
.hero__cta-secondary :deep(.btn) {
  padding: 13px 26px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.85);
}

.hero__cta :deep(.btn--secondary:hover),
.hero__cta-secondary :deep(.btn:hover) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* ===== RIGHT COLUMN - EVENT CARD ===== */
.hero__featured {
  position: relative;
  max-width: 420px;
  width: 100%;
  margin-left: auto;
  perspective: 1000px;
  transform-style: preserve-3d;
}

/* Event Card - Immersive Full-Image Design */
.hero__event-card {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 5 / 6;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.hero__event-card:hover {
  transform: translateY(-12px);
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(220, 20, 60, 0.3);
}

/* Skeleton */
.hero__event-skeleton {
  border-radius: 20px;
  background: rgba(18, 18, 18, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.05);
  width: 100%;
  aspect-ratio: 4 / 5;
  overflow: hidden;
}

.skeleton-image {
  height: 100%;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.06) 50%, rgba(255, 255, 255, 0.02) 100%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.8s ease-in-out infinite;
}

.skeleton-content { display: none; }

@keyframes skeleton-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Event Image - Full Card */
.hero__event-image {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.hero__event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

.hero__event-card:hover .hero__event-image img {
  transform: scale(1.08);
}

/* Overlay Gradient */
.hero__event-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.95) 0%,
    rgba(0, 0, 0, 0.7) 30%,
    rgba(0, 0, 0, 0.3) 60%,
    rgba(0, 0, 0, 0.15) 100%
  );
  z-index: 2;
}

/* Content Layer */
.hero__event-content {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 28px;
}

/* Bottom Content */
.hero__event-bottom {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Category */
.hero__event-category {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 2px;
}

/* Title */
.hero__event-title {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin: 0 0 4px 0;
}

/* Meta Info Row */
.hero__event-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 4px;
}

/* Date Inline */
.hero__event-date-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.hero__event-date-inline i {
  color: var(--color-primary);
  font-size: 11px;
}

.hero__event-location {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.hero__event-location i {
  color: var(--color-primary);
  font-size: 11px;
}

/* Footer Row */
.hero__event-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 8px;
}

/* Price - Clean Typography */
.hero__event-price {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.hero__event-price-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.hero__event-price-value {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}

/* CTA Button - Glass Style */
.hero__event-cta {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 14px 28px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  overflow: hidden;
}

.hero__event-cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--color-primary) 0%, #b01030 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: -1;
}

.hero__event-cta:hover {
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(220, 20, 60, 0.35);
}

.hero__event-cta:hover::before {
  opacity: 1;
}

.hero__event-cta i {
  font-size: 10px;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.hero__event-cta:hover i {
  transform: translateX(4px);
}

/* ===== GSAP ANIMATION SETUP ===== */
/* Desktop: Hide elements initially for GSAP animation */
@media (min-width: 769px) {
  .hero__animate {
    opacity: 0;
    will-change: transform, opacity;
  }

  .hero__title-line,
  .hero__title-accent {
    opacity: 0;
    transform-style: preserve-3d;
  }
}

/* Mobile: All elements visible by default (no GSAP animations) */
@media (max-width: 768px) {
  .hero__animate {
    opacity: 1 !important;
  }

  .hero__title-line,
  .hero__title-accent {
    opacity: 1 !important;
  }
}

.hero__layout {
  perspective: 1500px;
}

/* Smooth transitions */
.hero__badge,
.hero__title,
.hero__subtitle,
.hero__cta,
.hero__featured {
  will-change: transform, opacity;
}

/* ===== ANIMATIONS ===== */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ===== RESPONSIVE ===== */

/* Large Desktop (1440px+) */
@media (min-width: 1440px) {
  .hero__layout {
    max-width: 1320px;
    gap: 80px;
  }

  .hero__title {
    font-size: 60px;
  }

  .hero__featured {
    max-width: 460px;
  }

  .hero__event-title {
    font-size: 30px;
  }

  .hero__event-content {
    padding: 28px;
  }
}

/* Medium screens */
@media (max-width: 1200px) {
  .hero__layout {
    gap: 40px;
    max-width: 100%;
    grid-template-columns: 1fr 1fr;
  }

  .hero__title {
    font-size: 40px;
  }

  .hero__featured {
    max-width: 380px;
  }

  .hero__event-title {
    font-size: 24px;
  }

  .hero__event-content {
    padding: 22px;
  }
}

/* Tablet (max 1024px) */
@media (max-width: 1024px) {
  .hero {
    padding-top: 100px;
    padding-bottom: 50px;
  }

  .hero__layout {
    grid-template-columns: 1fr;
    gap: 50px;
    max-width: 520px;
    padding-top: 0;
  }

  .hero__main {
    text-align: center;
    padding-top: 0;
  }

  .hero__badge {
    margin-left: auto;
    margin-right: auto;
  }

  .hero__subtitle {
    margin-left: auto;
    margin-right: auto;
  }

  .hero__cta {
    justify-content: center;
    flex-wrap: wrap;
  }

  .hero__featured {
    max-width: 380px;
    margin: 0 auto;
  }

  .hero__event-card {
    aspect-ratio: 5 / 6;
  }

  .hero__event-title {
    font-size: 22px;
  }

  .hero__event-content {
    padding: 22px;
  }
}

/* Tablet (max 900px) */
@media (max-width: 900px) and (min-width: 769px) {
  .hero__layout {
    grid-template-columns: 1fr;
    gap: 40px;
    text-align: center;
    justify-items: center;
  }

  .hero__main {
    align-items: center;
    max-width: 600px;
  }

  .hero__cta {
    justify-content: center;
  }

  .hero__featured {
    max-width: 360px;
  }

  .hero__event-card {
    aspect-ratio: 16 / 9;
  }

  .hero__event-title {
    font-size: 22px;
  }
}

/* Mobile (max 768px) - Premium Experience */
@media (max-width: 768px) {
  .hero {
    min-height: 100svh;
    min-height: 100dvh;
    padding-top: 0;
    padding-bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .hero__layout {
    gap: 0;
    max-width: 100%;
    padding: 0;
    min-height: 100svh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .hero__main {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0 28px;
    width: 100%;
    max-width: 420px;
  }

  /* Badge premium avec glow subtil */
  .hero__badge {
    padding: 10px 20px;
    margin-bottom: 24px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .hero__badge-icon {
    font-size: 12px;
    color: var(--color-primary);
  }

  .hero__badge-text {
    font-size: 11px;
    letter-spacing: 2px;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 600;
  }

  /* Titre avec impact maximal */
  .hero__title {
    font-size: clamp(38px, 10vw, 48px);
    margin-bottom: 24px;
    line-height: 1.05;
    letter-spacing: -0.03em;
    font-weight: 800;
  }

  .hero__title-accent {
    display: block;
    background: linear-gradient(
      135deg,
      var(--color-primary) 0%,
      #ff4d6d 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 0 20px rgba(220, 20, 60, 0.4));
  }

  .hero__subtitle {
    font-size: 15px;
    margin-bottom: 40px;
    max-width: 340px;
    line-height: 1.8;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 400;
  }

  /* CTAs premium full-width */
  .hero__cta {
    flex-direction: column;
    gap: 14px;
    width: 100%;
  }

  .hero__cta :deep(.btn) {
    width: 100%;
    justify-content: center;
    padding: 18px 32px;
    font-size: 12px;
    letter-spacing: 1.2px;
    border-radius: 50px;
    font-weight: 600;
  }

  .hero__cta :deep(.btn--primary) {
    background: linear-gradient(
      135deg,
      var(--color-primary) 0%,
      #e01841 100%
    );
    box-shadow:
      0 8px 32px rgba(220, 20, 60, 0.35),
      0 0 0 1px rgba(255, 255, 255, 0.08) inset;
  }

  .hero__cta :deep(.btn--secondary),
  .hero__cta-secondary :deep(.btn) {
    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.12);
  }

  .hero__featured {
    display: none;
  }
}

/* Small Mobile (max 400px) */
@media (max-width: 400px) {
  .hero__main {
    padding: 0 24px;
  }

  .hero__badge {
    padding: 8px 16px;
    margin-bottom: 24px;
  }

  .hero__badge-text {
    font-size: 10px;
    letter-spacing: 2px;
  }

  .hero__title {
    font-size: clamp(32px, 9vw, 38px);
    margin-bottom: 20px;
  }

  .hero__subtitle {
    font-size: 14px;
    max-width: 300px;
    margin-bottom: 36px;
  }

  .hero__cta :deep(.btn) {
    padding: 16px 28px;
    font-size: 11px;
    letter-spacing: 1px;
  }
}
</style>
