<template>
  <section class="hero" id="home">
    <!-- Background Effects -->
    <div class="hero__background">
      <div class="hero__bg-grid"></div>
      <div class="hero__particles"></div>
    </div>

    <div class="container">
      <div class="hero__layout">
        <!-- Main Content -->
        <div class="hero__main">
          <!-- Badge -->
          <div 
            class="hero__badge" 
            data-aos="fade-down" 
            data-aos-delay="100"
            data-aos-duration="600"
            data-aos-easing="ease-out-cubic"
          >
            <span class="hero__badge-icon">
              <i class="fas fa-fire"></i>
            </span>
            <span class="hero__badge-text">{{ t('hero.badge') }}</span>
          </div>

          <!-- Title -->
          <h1 
            class="hero__title" 
            data-aos="fade-up" 
            data-aos-delay="200" 
            data-aos-duration="800"
            data-aos-easing="ease-out-cubic"
          >
            {{ t('hero.title.line1') }}
            <span class="hero__title-accent">{{ t('hero.title.accent') }}</span>
            {{ t('hero.title.line2') }}
          </h1>

          <!-- Subtitle -->
          <p 
            class="hero__subtitle" 
            data-aos="fade-up" 
            data-aos-delay="300" 
            data-aos-duration="700"
            data-aos-easing="ease-out-cubic"
          >
            {{ t('hero.subtitle') }}
          </p>

          <!-- Features -->
          <div 
            class="hero__features" 
            data-aos="fade-up" 
            data-aos-delay="400"
            data-aos-duration="700"
            data-aos-easing="ease-out-cubic"
          >
            <div 
              v-for="(feature, index) in features" 
              :key="feature" 
              class="hero__feature"
              :style="{ animationDelay: `${0.5 + index * 0.1}s` }"
            >
              <span>{{ feature }}</span>
            </div>
          </div>

          <!-- CTA Buttons -->
          <div 
            class="hero__cta" 
            data-aos="fade-up" 
            data-aos-delay="500" 
            data-aos-duration="700"
            data-aos-easing="ease-out-cubic"
          >
            <BaseButton 
              variant="primary" 
              size="large" 
              icon="fas fa-arrow-right"
              @click="scrollToEvents"
            >
              {{ t('hero.cta.explore') }}
            </BaseButton>
            
            <BaseButton 
              variant="outline" 
              size="large" 
              icon="fas fa-calendar-plus"
              tag="a"
              :href="organizeEventLink" 
              target="_blank" 
              rel="noopener"
            >
              {{ t('hero.cta.organize') }}
            </BaseButton>
          </div>
        </div>

        <!-- Featured Event Card -->
        <div 
          v-if="featuredEvent" 
          class="hero__featured"
        >
          <article class="hero__event-card" @click="goToEventDetail">
            <div class="hero__event-image">
              <img :src="featuredEvent.image_url || featuredEvent.image" :alt="featuredEvent.title">
              <div class="hero__event-badge">
                <i class="fas fa-fire"></i>
                {{ t('hero.eventBadge') }}
              </div>
              <div class="hero__event-date">
                <span class="day">{{ formatDay(featuredEvent.date) }}</span>
                <span class="month">{{ formatMonth(featuredEvent.date, t) }}</span>
              </div>
            </div>

            <div class="hero__event-content">
              <div class="hero__event-category">{{ featuredEventCategoryLabel }}</div>
              <h3 class="hero__event-title">{{ displayTitle }}</h3>
              <p class="hero__event-desc">{{ displayDescription }}</p>

              <div class="hero__event-meta">
                <span><i class="fas fa-map-marker-alt"></i> {{ featuredEvent.city }}</span>
                <span><i class="far fa-clock"></i> {{ featuredEvent.time }}</span>
              </div>

              <div class="hero__event-footer">
                <div v-if="minPrice" class="hero__event-price">
                  <span class="from">{{ t('events.price.from') }}</span>
                  <span class="amount">{{ formatPrice(minPrice.value, minPrice.currency) }}</span>
                </div>

                <BaseButton
                  variant="primary"
                  size="small"
                  icon="fas fa-arrow-right"
                  @click.stop="goToEventDetail"
                >
                  {{ t('events.cta.learnMore') }}
                </BaseButton>
              </div>
            </div>

            <div class="hero__event-glow"></div>
          </article>

          <!-- Mini Stats -->
          <div class="hero__mini-stats">
            <div 
              v-for="(stat, index) in stats" 
              :key="stat.label" 
              class="hero__mini-stat"
              :style="{ animationDelay: `${0.5 + index * 0.15}s` }"
            >
              <div class="hero__mini-stat-number" :data-count="stat.value">{{ animatedStats[stat.label] || 0 }}</div>
              <div class="hero__mini-stat-label">{{ stat.label.toUpperCase() }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scroll Indicator -->
    <a 
      href="#events" 
      class="hero__scroll" 
      @click.prevent="scrollToEvents"
      data-aos="fade-up"
      data-aos-delay="600"
      data-aos-duration="700"
      data-aos-easing="ease-out-cubic"
    >
      <span>{{ t('hero.scroll') }}</span>
      <i class="fas fa-chevron-down"></i>
    </a>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import { scrollToElement, formatPrice, generateWhatsAppLink, formatDay, formatMonth } from '@/utils'
import { getEventTitle, getEventDescription } from '@/utils/translations'
import type { Event } from '@/types'
import { WHATSAPP_MESSAGES, CONTACT_INFO } from '@/constants'
import { useDataStore } from '@/stores/data'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import { logger } from '@/services/logger'

const { t, locale } = useI18n()
const router = useRouter()

// Emit loaded event
const emit = defineEmits(['loaded'])

// ✅ Utiliser le dataStore au lieu de faire un appel API
const dataStore = useDataStore()
const appStore = useAppStore()

// Data
const events = computed(() => dataStore.getUpcomingEvents())

const features = computed(() => [
  t('hero.features.concerts'),
  t('hero.features.vip'),
  t('hero.features.festivals'),
  t('hero.features.weddings')
])

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

const featuredEventCategoryLabel = computed(() => {
  if (!featuredEvent.value) return ''
  return t(`categories.${featuredEvent.value.category}`)
})

const displayTitle = computed(() => {
  if (!featuredEvent.value) return ''
  return getEventTitle(featuredEvent.value, locale.value)
})

const displayDescription = computed(() => {
  if (!featuredEvent.value) return ''
  return getEventDescription(featuredEvent.value, locale.value)
})

// Calculate minimum price from packs
const minPrice = computed(() => {
  if (!featuredEvent.value) return null
  
  if (featuredEvent.value.packs && featuredEvent.value.packs.length > 0) {
    const prices = featuredEvent.value.packs.map((pack: any) => pack.price)
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
  return generateWhatsAppLink(WHATSAPP_MESSAGES.organize, CONTACT_INFO.whatsapp)
})

// Methods
const scrollToEvents = () => {
  scrollToElement('#events')
}

const goToEventDetail = async () => {
  if (!featuredEvent.value) return
  // Démarrer le loading avant la navigation
  appStore.startLoading(t('common.loading'))
  // Attendre que le DOM soit mis à jour (loading visible)
  await nextTick()
  // Puis naviguer
  router.push({ name: 'event-detail', params: { id: featuredEvent.value.id } })
}

// Animate stats on mount
const animateStats = () => {
  stats.value.forEach(stat => {
    let current = 0
    const increment = stat.value / 100
    const timer = setInterval(() => {
      current += increment
      if (current >= stat.value) {
        current = stat.value
        clearInterval(timer)
      }
      animatedStats.value[stat.label] = Math.floor(current)
    }, 20)
  })
}

onMounted(async () => {
  // ✅ Charger depuis le dataStore (cache)
  try {
    await dataStore.fetchEvents()
  } catch (error) {
    logger.error('Error loading events:', error)
  } finally {
    // Emit loaded event
    emit('loaded')
  }
  
  // Initialize stats
  stats.value.forEach(stat => {
    animatedStats.value[stat.label] = 0
  })
  
  // ✅ Start animation immédiatement avec requestAnimationFrame
  requestAnimationFrame(animateStats)
})
</script>

<style scoped>
.hero {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: 0;
  background: var(--color-black);
}

.hero__background {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  opacity: 0;
  animation: background-fade-in 1.2s ease-out 0.2s forwards;
}

@keyframes background-fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.hero__bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(220, 20, 60, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(220, 20, 60, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: hero-grid-move 20s linear infinite;
}

.hero__particles {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 30%, rgba(220, 20, 60, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(220, 20, 60, 0.03) 0%, transparent 50%);
}

/* Layout Asymétrique - Identique au prototype */
.hero__layout {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
  align-items: center;
  min-height: 600px;
}

/* Section Principale (Gauche) */
.hero__main {
  max-width: 600px;
  position: relative;
}

.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: rgba(220, 20, 60, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(220, 20, 60, 0.3);
  border-radius: 50px;
  margin-bottom: var(--spacing-lg);
  transition: all var(--transition-normal);
  will-change: transform, opacity;
}

.hero__badge:hover {
  background: rgba(220, 20, 60, 0.15);
  box-shadow: 0 0 20px rgba(220, 20, 60, 0.3);
}

.hero__badge-icon {
  color: var(--color-primary);
  animation: pulse-fire 2s ease infinite;
}

.hero__badge-text {
  font-size: 0.875rem;
  font-weight: var(--font-weight-bold);
  color: var(--color-white);
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

.hero__title {
  font-family: var(--font-heading);
  font-size: 4.5rem;
  font-weight: 900;
  color: var(--color-white);
  line-height: 1.1;
  margin-bottom: var(--spacing-lg);
  letter-spacing: -0.02em;
  will-change: transform, opacity;
}

.hero__title-accent {
  display: block;
  background: linear-gradient(135deg, var(--color-primary) 0%, #FF1744 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 20px rgba(220, 20, 60, 0.4));
}

.hero__subtitle {
  font-size: 1.125rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.75);
  margin-bottom: var(--spacing-lg);
  will-change: transform, opacity;
}

.hero__features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: var(--spacing-lg);
  will-change: transform, opacity;
}

.hero__feature {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-sm);
  transition: all var(--transition-normal);
  position: relative;
  opacity: 0;
  animation: feature-slide-in 0.6s ease-out forwards;
}

.hero__feature::before {
  content: '';
  position: absolute;
  left: 1rem;
  width: 4px;
  height: 20px;
  background: var(--color-primary);
  border-radius: 2px;
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.hero__feature:hover {
  background: rgba(220, 20, 60, 0.05);
  border-color: rgba(220, 20, 60, 0.3);
  transform: translateX(4px);
}

.hero__feature:hover::before {
  opacity: 1;
}

.hero__feature span {
  font-size: 0.9375rem;
  font-weight: var(--font-weight-semibold);
  color: var(--color-white);
  text-align: center;
}

.hero__cta {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  will-change: transform, opacity;
}


/* Section Événement Featured (Droite) */
.hero__featured {
  position: relative;
  min-height: 550px;
  display: flex;
  flex-direction: column;
}

.hero__event-card {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: var(--color-secondary);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  transition: all var(--transition-slow);
  width: 100%;
  animation: card-entrance 1s ease-out;
  cursor: pointer;
}

@keyframes card-entrance {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.hero__event-card:hover {
  transform: translateY(-8px);
  border-color: rgba(220, 20, 60, 0.4);
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.5),
    0 0 40px rgba(220, 20, 60, 0.2);
}

.hero__event-image {
  position: relative;
  height: 300px;
  overflow: hidden;
}

.hero__event-image::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, transparent 65%);
  z-index: 1;
  pointer-events: none;
}

.hero__event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s ease;
}

.hero__event-card:hover .hero__event-image img {
  transform: scale(1.05);
}

.hero__event-badge {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  padding: 0.625rem 1.25rem;
  background: rgba(220, 20, 60, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--color-white);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 2;
  box-shadow: 0 4px 16px rgba(220, 20, 60, 0.5);
  text-transform: uppercase;
  letter-spacing: 1.2px;
}

.hero__event-badge i {
  animation: pulse-fire 2s ease infinite;
}

.hero__event-date {
  position: absolute;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 70px;
  height: 80px;
  background: linear-gradient(180deg, var(--color-primary) 0%, var(--color-accent) 100%);
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2;
  box-shadow: 0 8px 24px rgba(220, 20, 60, 0.5);
}

.hero__event-date .day {
  font-size: 2rem;
  font-weight: var(--font-weight-black);
  color: var(--color-white);
  line-height: 1;
}

.hero__event-date .month {
  font-size: 0.75rem;
  font-weight: var(--font-weight-bold);
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-top: 0.25rem;
}

.hero__event-content {
  padding: var(--spacing-md);
}

.hero__event-category {
  font-size: 0.6875rem;
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 0.5rem;
}

.hero__event-title {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 900;
  color: var(--color-white);
  margin-bottom: 0.75rem;
  line-height: 1.2;
}

.hero__event-desc {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9375rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.hero__event-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 1rem;
}

.hero__event-meta span {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.hero__event-meta i {
  color: var(--color-primary);
}

.hero__event-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid rgba(220, 20, 60, 0.2);
}

.hero__event-price {
  display: flex;
  flex-direction: column;
}

.hero__event-price .from {
  font-size: 0.6875rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: var(--font-weight-semibold);
}

.hero__event-price .amount {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 900;
  background: linear-gradient(135deg, var(--color-primary) 0%, #FF1744 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero__event-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, rgba(220, 20, 60, 0.08) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.6s ease;
  pointer-events: none;
}

.hero__event-card:hover .hero__event-glow {
  opacity: 1;
}

.hero__mini-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: var(--spacing-md);
  animation: stats-entrance 0.8s ease-out 0.3s;
}

@keyframes stats-entrance {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero__mini-stat {
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-sm);
  transition: all var(--transition-normal);
  opacity: 0;
  animation: stat-pop-in 0.5s ease-out forwards;
}

.hero__mini-stat:hover {
  background: rgba(220, 20, 60, 0.05);
  border-color: rgba(220, 20, 60, 0.3);
}

.hero__mini-stat-number {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 900;
  color: var(--color-primary);
  margin-bottom: 0.25rem;
}

.hero__mini-stat-number::after {
  content: '+';
  font-size: 1.25rem;
}

.hero__mini-stat-label {
  font-size: 0.6875rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 1.2px;
  font-weight: 600;
}

.hero__scroll {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  transition: all var(--transition-normal);
  animation: hero-float 3s ease-in-out infinite;
}

.hero__scroll:hover {
  color: var(--color-primary);
}

.hero__scroll i {
  animation: hero-bounce 2s ease infinite;
}

@keyframes hero-grid-move {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

@keyframes hero-float {
  0%, 100% { transform: translate(-50%, 0); }
  50% { transform: translate(-50%, 10px); }
}

@keyframes hero-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(5px); }
}

@keyframes feature-slide-in {
  0% {
    opacity: 0;
    transform: translateX(-30px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes stat-pop-in {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }
  60% {
    transform: scale(1.05) translateY(-5px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes pulse-fire {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

@media (max-width: 1024px) {
  .hero {
    padding: 130px 0 80px;
  }

  .hero__layout {
    grid-template-columns: 1fr;
    gap: var(--spacing-12);
  }

  .hero__main {
    max-width: 100%;
    text-align: center;
  }

  .hero__subtitle {
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .hero__features {
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .hero__cta {
    justify-content: center;
    gap: 1rem;
  }

  .hero__featured {
    max-width: 600px;
    margin: 0 auto;
  }

  .hero__event-image {
    height: 280px;
  }

  .hero__event-title {
    font-size: var(--font-size-2xl);
  }

  .hero__scroll {
    bottom: 1.5rem;
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 90px 0 50px;
    min-height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hero__layout {
    grid-template-columns: 1fr;
    gap: 0;
    max-width: 100%;
    text-align: center;
  }

  .hero__main {
    max-width: 100%;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .hero__badge {
    padding: 0.625rem 1.25rem;
    font-size: 0.8125rem;
    margin-bottom: 1.75rem;
    display: inline-flex;
    margin-left: auto;
    margin-right: auto;
  }

  .hero__badge-text {
    font-size: 0.75rem;
    letter-spacing: 1.2px;
  }

  .hero__title {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
    line-height: 1.15;
    max-width: 95%;
    margin-left: auto;
    margin-right: auto;
  }

  .hero__subtitle {
    font-size: 1rem;
    margin-bottom: 2rem;
    line-height: 1.6;
    max-width: 90%;
    margin-left: auto;
    margin-right: auto;
    color: rgba(255, 255, 255, 0.8);
  }

  .hero__features {
    margin-bottom: 2rem;
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .hero__feature {
    padding: 0.875rem 1rem;
    font-size: 0.8125rem;
  }

  .hero__cta {
    flex-direction: column;
    gap: 1rem;
    max-width: 100%;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .hero__cta .btn {
    width: 100%;
    justify-content: center;
    padding: 0.875rem 1.5rem;
    font-size: 0.9375rem;
  }

  /* Masquer la carte d'événement featured en mobile */
  .hero__featured {
    display: none;
  }

  .hero__scroll {
    display: none;
  }
}

@media (max-width: 480px) {
  .hero {
    padding: 85px 0 40px;
    min-height: auto;
  }

  .hero__main {
    padding: 0 0.875rem;
  }

  .hero__badge {
    padding: 0.5rem 1rem;
    gap: 0.375rem;
    margin-bottom: 1.5rem;
    font-size: 0.75rem;
  }

  .hero__badge-text {
    font-size: 0.6875rem;
    letter-spacing: 1px;
  }

  .hero__badge-icon {
    font-size: 0.875rem;
  }

  .hero__title {
    font-size: 2rem;
    margin-bottom: 1.25rem;
    line-height: 1.2;
    max-width: 100%;
  }

  .hero__subtitle {
    font-size: 0.9375rem;
    line-height: 1.5;
    margin-bottom: 1.5rem;
    max-width: 95%;
  }

  .hero__features {
    grid-template-columns: 1fr;
    gap: 0.625rem;
    margin-bottom: 1.75rem;
    max-width: 100%;
  }

  .hero__feature {
    padding: 0.75rem 1rem;
    font-size: 0.8125rem;
  }

  .hero__cta {
    gap: 0.875rem;
    max-width: 100%;
    padding: 0 0.5rem;
  }

  .hero__cta .btn {
    padding: 1rem 1.25rem;
    font-size: 0.875rem;
  }
}
</style>
