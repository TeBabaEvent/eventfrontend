<template>
  <article :class="cardClasses" @click="goToDetail">
    <div class="event-card__image-wrapper">
      <img 
        v-if="!isComingSoon"
        :src="event.image_url || event.image" 
        :alt="event.title" 
        class="event-card__image"
      >
      <div v-else class="event-card__image event-card__image--placeholder">
        <div class="coming-soon-overlay">
          <i class="fas fa-calendar-plus"></i>
          <span>{{ t('events.comingSoon.title') }}</span>
        </div>
      </div>
      
      <!-- Event Tag Premium -->
      <div v-if="!isComingSoon" :class="tagClasses">
        <i :class="tagIcon"></i>
        {{ tagText }}
      </div>
      
      <!-- Event Date Calendar Style -->
      <div v-if="!isComingSoon" class="event-card__date">
        <span class="event-card__date-day">{{ formatDay(event.date) }}</span>
        <span class="event-card__date-month">{{ formatMonth(event.date, t) }}</span>
      </div>
    </div>
    
    <div class="event-card__content">
      <div v-if="!isComingSoon" class="event-card__category">{{ categoryLabel }}</div>
      <h3 class="event-card__title">{{ displayTitle }}</h3>
      <p class="event-card__description">{{ displayDescription }}</p>
      
      <div v-if="!isComingSoon" class="event-card__meta">
        <span><i class="fas fa-map-marker-alt"></i> {{ event.city }}</span>
        <span><i class="far fa-clock"></i> {{ event.time }}</span>
      </div>
      
      <div v-if="!isComingSoon" class="event-card__footer">
        <div v-if="minPrice" class="event-card__price">
          <span class="event-card__price-from">{{ t('events.price.from') }}</span>
          <span class="event-card__price-amount">{{ minPrice }}</span>
        </div>
        
        <BaseButton
          variant="primary"
          size="small"
          icon="fas fa-arrow-right"
          @click.stop="goToDetail"
        >
          {{ t('events.cta.learnMore') }}
        </BaseButton>
      </div>
    </div>
    
    <!-- Glow Effect -->
    <div class="event-card__glow"></div>
  </article>
</template>

<script setup lang="ts">
import { computed, nextTick, type PropType } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import { formatPrice, formatDay, formatMonth } from '@/utils'
import { getEventTitle, getEventDescription } from '@/utils/translations'
import type { Event } from '@/types'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'

const { t, locale } = useI18n()
const router = useRouter()
const appStore = useAppStore()

type CardVariant = 'large' | 'medium'

const props = defineProps({
  event: {
    type: Object as PropType<Event>,
    required: true
  },
  variant: {
    type: String as PropType<CardVariant>,
    default: 'medium'
  },
  isComingSoon: {
    type: Boolean,
    default: false
  }
})

// Computed properties
const cardClasses = computed(() => [
  'event-card',
  `event-card--${props.variant}`,
  { 'event-card--coming-soon': props.isComingSoon }
])

const categoryLabel = computed(() => {
  return t(`categories.${props.event.category}`)
})

const displayTitle = computed(() => {
  return getEventTitle(props.event, locale.value)
})

const displayDescription = computed(() => {
  return getEventDescription(props.event, locale.value)
})

// Calculate minimum price from packs
const minPrice = computed(() => {
  // Check if event has packs
  if (props.event.packs && props.event.packs.length > 0) {
    const prices = props.event.packs.map((pack) => pack.price)
    const min = Math.min(...prices)
    const currency = props.event.packs[0]?.currency || '€'
    return formatPrice(min, currency)
  }
  // Fallback to old price format
  if (props.event.price) {
    return formatPrice(props.event.price.from, props.event.price.currency)
  }
  return null
})

const minPriceValue = computed(() => {
  if (props.event.packs && props.event.packs.length > 0) {
    const prices = props.event.packs.map((pack) => pack.price)
    return Math.min(...prices)
  }
  return props.event.price?.from || 0
})

const tagClasses = computed(() => [
  'event-card__tag',
  {
    'event-card__tag--hot': props.event.featured,
    'event-card__tag--free': !props.event.price && (!props.event.packs || props.event.packs.length === 0),
    'event-card__tag--premium': minPriceValue.value > 100
  }
])

const tagIcon = computed(() => {
  if (props.event.featured) return 'fas fa-fire'
  if (!minPrice.value) return 'fas fa-star'
  if (minPriceValue.value > 100) return 'fas fa-crown'
  return 'fas fa-calendar'
})

const tagText = computed(() => {
  if (props.event.featured) return t('tags.hot').toUpperCase()
  if (!minPrice.value) return t('tags.free').toUpperCase()
  if (minPriceValue.value > 100) return t('tags.vip')
  return t(`categories.${props.event.category}`)
})

// Methods
const goToDetail = async () => {
  if (!props.isComingSoon) {
    // Démarrer le loading IMMÉDIATEMENT avant la navigation
    appStore.startLoading(t('common.loading'))
    // Attendre que le DOM soit mis à jour (loading visible)
    await nextTick()
    // Puis naviguer
    router.push({ name: 'event-detail', params: { id: props.event.id } })
  }
}
</script>

<style scoped>
/* ============================================
   EVENT CARD - DESIGN PREMIUM DU PROTOTYPE
   ============================================ */
.event-card {
  background: var(--color-gray);
  border-radius: var(--radius-lg);
  overflow: hidden;
  position: relative;
  transition: all var(--transition-slow);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  cursor: pointer;
}

.event-card:hover {
  transform: translateY(-3px);
  border-color: rgba(220, 20, 60, 0.3);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.25),
    0 2px 8px rgba(220, 20, 60, 0.08);
}

/* Coming Soon State */
.event-card--coming-soon {
  cursor: default;
  opacity: 0.85;
}

.event-card--coming-soon:hover {
  transform: translateY(-4px);
  opacity: 0.95;
}

.event-card--large {
  grid-column: span 2;
}

.event-card--large .event-card__image-wrapper {
  height: 450px;
}

/* ============================================
   IMAGE WRAPPER
   ============================================ */
.event-card__image-wrapper {
  position: relative;
  height: 300px;
  overflow: hidden;
}

.event-card__image-wrapper::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60%;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.95) 0%,
    rgba(0, 0, 0, 0.7) 20%,
    rgba(220, 20, 60, 0.15) 50%,
    transparent 100%
  );
  z-index: 1;
  transition: opacity var(--transition-slow);
}

.event-card:hover .event-card__image-wrapper::before {
  opacity: 0.9;
}

.event-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s ease;
  filter: brightness(0.95) contrast(1.05);
}

.event-card:hover .event-card__image {
  transform: scale(1.03);
  filter: brightness(0.98) contrast(1.08);
}

.event-card__image--placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(var(--color-gold-rgb), 0.12) 0%,
    rgba(var(--color-gold-rgb), 0.05) 50%,
    rgba(var(--color-gold-rgb), 0.12) 100%
  );
  background-size: 200% 200%;
  animation: gradient-shift 3s ease infinite;
  display: flex;
  align-items: center;
  justify-content: center;
}

.coming-soon-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  text-align: center;
  color: var(--color-gold);
  padding: 2rem;
}

.coming-soon-overlay i {
  font-size: 4rem;
  opacity: 0.6;
}

.coming-soon-overlay span {
  font-size: 1.25rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  opacity: 0.9;
}

/* ============================================
   TAG PREMIUM STYLE
   ============================================ */
.event-card__tag {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  padding: 0.625rem 1.25rem;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 50px;
  font-size: 0.8125rem;
  font-weight: 800;
  color: var(--color-white);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 2;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  transition: all var(--transition-normal);
}

.event-card__tag:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 6px 20px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.event-card__tag--hot {
  background: linear-gradient(135deg, 
    var(--color-primary) 0%, 
    rgba(220, 20, 60, 0.9) 100%
  );
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 4px 16px rgba(220, 20, 60, 0.5),
    0 0 30px rgba(220, 20, 60, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  animation: pulse-glow 2s ease-in-out infinite;
}

.event-card__tag--hot i {
  animation: flame-flicker 1.5s ease-in-out infinite;
}

.event-card__tag--premium {
  background: linear-gradient(135deg, 
    var(--color-accent) 0%, 
    rgba(139, 0, 0, 0.9) 100%
  );
  border-color: rgba(255, 215, 0, 0.4);
  box-shadow: 
    0 4px 16px rgba(139, 0, 0, 0.5),
    0 0 25px rgba(255, 215, 0, 0.2),
    inset 0 1px 0 rgba(255, 215, 0, 0.3);
}

.event-card__tag--premium i {
  color: #FFD700;
  filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.6));
}

.event-card__tag--free {
  background: rgba(16, 185, 129, 0.9);
  border-color: rgba(255, 255, 255, 0.3);
}

/* ============================================
   DATE CALENDAR STYLE
   ============================================ */
.event-card__date {
  position: absolute;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 70px;
  height: 80px;
  z-index: 2;
  transition: all var(--transition-normal);
}

.event-card__date::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 8px;
  background: var(--color-primary);
  border-radius: 4px 4px 0 0;
  box-shadow: 
    0 2px 0 rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.event-card__date::after {
  content: '';
  position: absolute;
  top: 8px;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, #ffffff 0%, #f9f9f9 100%);
  border-radius: 0 0 var(--radius-sm) var(--radius-sm);
  box-shadow: 
    0 6px 20px rgba(0, 0, 0, 0.3),
    inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.event-card:hover .event-card__date {
  transform: translateY(-4px) rotate(-2deg);
}

.event-card:hover .event-card__date::after {
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.35),
    inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.event-card__date-day {
  position: relative;
  z-index: 1;
  font-size: 2rem;
  font-weight: 900;
  line-height: 1;
  color: var(--color-black);
  margin-top: 20px;
  display: block;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.event-card__date-month {
  position: relative;
  z-index: 1;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-primary);
  letter-spacing: 1.5px;
  display: block;
  text-align: center;
  margin-top: 4px;
}

/* ============================================
   CONTENT
   ============================================ */
.event-card__content {
  padding: var(--spacing-md);
  overflow: hidden;
  max-width: 100%;
}

.event-card__category {
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 2.5px;
  margin-bottom: 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  opacity: 0.9;
}

.event-card__category::before {
  content: '';
  width: 4px;
  height: 4px;
  background: var(--color-primary);
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(220, 20, 60, 0.5);
  animation: pulse-dot 2s ease-in-out infinite;
}

.event-card__title {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 900;
  color: var(--color-white);
  margin-bottom: 1rem;
  position: relative;
  line-height: 1.2;
  transition: color var(--transition-normal);
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
}

.event-card__title::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 0;
  width: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary), transparent);
  transition: width var(--transition-slow);
  border-radius: 2px;
}

.event-card:hover .event-card__title::after {
  width: 50%;
}

.event-card__description {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: var(--spacing-md);
  line-height: 1.6;
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
}

.event-card__meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;
}

.event-card__meta span {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all var(--transition-fast);
}

.event-card__meta span:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(220, 20, 60, 0.3);
  transform: translateY(-1px);
}

.event-card__meta i {
  color: var(--color-primary);
  font-size: 0.8125rem;
}

/* ============================================
   FOOTER & PRICE
   ============================================ */
.event-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--spacing-md);
  margin-top: var(--spacing-sm);
  border-top: 1px solid transparent;
  background-image: linear-gradient(
    90deg,
    rgba(220, 20, 60, 0.3) 0%,
    rgba(220, 20, 60, 0.1) 50%,
    transparent 100%
  );
  background-repeat: no-repeat;
  background-position: top;
  background-size: 100% 1px;
}

.event-card__price {
  display: flex;
  flex-direction: column;
  position: relative;
}

.event-card__price::before {
  content: '';
  position: absolute;
  left: -1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent,
    var(--color-primary),
    transparent
  );
  border-radius: 2px;
}

.event-card__price-from {
  font-size: 0.6875rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.event-card__price-amount {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 900;
  background: linear-gradient(135deg, 
    var(--color-primary) 0%, 
    var(--color-accent) 50%,
    #FF1744 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 200% 200%;
  animation: gradient-shift 3s ease infinite;
  filter: drop-shadow(0 2px 8px rgba(220, 20, 60, 0.3));
  position: relative;
  display: inline-block;
}

.event-card:hover .event-card__price-amount {
  animation: gradient-shift 2s ease infinite, price-pulse 1s ease;
}

.event-card__link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-primary);
  font-weight: 600;
  padding: 0.5rem 1rem;
  background: rgba(220, 20, 60, 0.05);
  border-radius: 6px;
  border: 1px solid rgba(220, 20, 60, 0.2);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
  text-decoration: none;
}

.event-card__link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(220, 20, 60, 0.1),
    transparent
  );
  transition: left 0.5s ease;
}

.event-card__link:hover::before {
  left: 100%;
}

.event-card__link:hover {
  gap: 0.75rem;
  background: rgba(220, 20, 60, 0.1);
  border-color: var(--color-primary);
  transform: translateX(4px);
}

.event-card__link i {
  transition: transform var(--transition-fast);
}

.event-card__link:hover i {
  transform: translateX(2px);
}

/* ============================================
   GLOW EFFECT
   ============================================ */
.event-card__glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 50% 50%, rgba(220, 20, 60, 0.08) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.6s ease;
  pointer-events: none;
}

.event-card:hover .event-card__glow {
  opacity: 1;
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 1024px) {
  .event-card--large {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
  .event-card__image-wrapper {
    height: 250px;
  }
  
  .event-card--large .event-card__image-wrapper {
    height: 300px;
  }
  
  .event-card__content {
    padding: 1.25rem;
  }
  
  .event-card__title {
    font-size: 1.375rem;
  }
  
  .event-card__footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .event-card__footer .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .event-card__image-wrapper {
    height: 200px;
  }
  
  .event-card--large .event-card__image-wrapper {
    height: 220px;
  }
  
  .event-card__tag {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
    top: 1rem;
    left: 1rem;
  }
  
  .event-card__date {
    width: 60px;
    height: 70px;
    bottom: 1rem;
    right: 1rem;
  }
  
  .event-card__date-day {
    font-size: 1.625rem;
    margin-top: 16px;
  }
  
  .event-card__date-month {
    font-size: 0.625rem;
  }
  
  .event-card__title {
    font-size: 1.375rem;
  }
  
  .event-card__price-amount {
    font-size: 1.5rem;
  }
}
</style>
