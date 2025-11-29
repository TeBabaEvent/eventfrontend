<template>
  <article :class="cardClasses" @click="goToDetail" @mouseenter="prefetchEvent">
    <!-- Image Layer - Full Coverage -->
    <div class="event-card__image-container">
      <img
        v-if="!isComingSoon"
        :src="optimizedImage"
        :alt="event.title"
        class="event-card__image"
        loading="lazy"
        width="400"
        height="300"
      >

      <!-- Coming Soon Background -->
      <div v-else class="event-card__cs-background">
        <!-- Animated gradient mesh -->
        <div class="event-card__cs-mesh"></div>
        <!-- Subtle animated lines -->
        <div class="event-card__cs-lines">
          <div class="event-card__cs-line"></div>
          <div class="event-card__cs-line"></div>
        </div>
      </div>

      <!-- Gradient Overlay - Matching Hero -->
      <div class="event-card__overlay"></div>

      <!-- Hover Glow Effect -->
      <div class="event-card__glow"></div>
    </div>

    <!-- Content Layer - Overlay on Image -->
    <div class="event-card__content">
      <!-- Regular Event Content -->
      <template v-if="!isComingSoon">
        <!-- Top Section: Category Badge -->
        <div class="event-card__top">
          <div class="event-card__category-badge">
            <span>{{ categoryLabel }}</span>
          </div>
        </div>

        <!-- Bottom Section: Info -->
        <div class="event-card__bottom">
          <h3 class="event-card__title">{{ displayTitle }}</h3>

          <div class="event-card__meta">
            <div class="event-card__meta-item">
              <i class="fas fa-calendar"></i>
              <span>{{ formatFullDate(event.date) }}</span>
            </div>
            <div class="event-card__meta-item">
              <i class="fas fa-map-marker-alt"></i>
              <span>{{ event.city }}</span>
            </div>
          </div>

          <div class="event-card__footer">
            <div v-if="minPrice" class="event-card__price">
              <span class="event-card__price-label">{{ t('events.price.from') }}</span>
              <span class="event-card__price-value">{{ minPrice }}</span>
            </div>

            <button class="event-card__cta" @click.stop="goToDetail">
              <span>{{ t('events.cta.learnMore') }}</span>
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </template>

      <!-- Coming Soon Content - Same structure as Hero card -->
      <template v-else>
        <!-- Top Section: Badge -->
        <div class="event-card__top">
          <div class="event-card__cs-badge">
            <i class="fas fa-clock"></i>
            <span>{{ t('events.comingSoon.title') }}</span>
          </div>
        </div>

        <!-- Bottom Section: Info -->
        <div class="event-card__bottom">
          <div class="event-card__cs-category">Nouvel événement</div>
          <h3 class="event-card__title event-card__title--cs">{{ t('events.comingSoon.title') }}</h3>
          <p class="event-card__cs-description">{{ t('events.comingSoon.description') }}</p>

          <!-- Placeholder footer -->
          <div class="event-card__cs-footer">
            <div class="event-card__cs-hint">
              <i class="fas fa-bell"></i>
              <span>Restez informé</span>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Border Glow on Hover -->
    <div class="event-card__border-glow"></div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref, type PropType } from 'vue'
import { useRouter } from 'vue-router'
import { formatPrice } from '@/utils'
import { getOptimizedImageUrl } from '@/utils/image'
import { getEventTitle } from '@/utils/translations'
import type { Event } from '@/types'
import { useI18n } from 'vue-i18n'
import { api } from '@/services/api'

const { t, locale } = useI18n()
const router = useRouter()
const isPrefetched = ref(false)

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

const optimizedImage = computed(() => {
  const url = props.event.image_url || props.event.image || ''
  const width = props.variant === 'large' ? 800 : 600
  return getOptimizedImageUrl(url, width)
})

// Calculate minimum price from packs
const minPrice = computed(() => {
  if (props.event.packs && props.event.packs.length > 0) {
    const prices = props.event.packs.map((pack) => pack.price)
    const min = Math.min(...prices)
    const currency = props.event.packs[0]?.currency || '€'
    return formatPrice(min, currency)
  }
  if (props.event.price) {
    return formatPrice(props.event.price.from, props.event.price.currency)
  }
  return null
})

// Format full date
const formatFullDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString(locale.value, {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
}

// Prefetch event data on hover for instant navigation
const prefetchEvent = () => {
  if (!props.isComingSoon && !isPrefetched.value) {
    isPrefetched.value = true
    // Prefetch silently in background - will be cached by browser/API
    api.getEventById(props.event.id).catch(() => {
      // Silencieux - simple prefetch
    })
  }
}

// Methods
const goToDetail = () => {
  if (!props.isComingSoon) {
    router.push({ name: 'event-detail', params: { id: props.event.id } })
  }
}
</script>

<style scoped>
/* ============================================
   EVENT CARD - IMMERSIVE STYLE (Matching Hero)
   ============================================ */

.event-card {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 4 / 5;
  background: #0a0a0a;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

/* Subtle gradient border */
.event-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 20px;
  padding: 1px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.02) 50%,
    rgba(220, 20, 60, 0.1) 100%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  opacity: 0.6;
  transition: opacity 0.4s ease;
  z-index: 5;
}

.event-card:hover {
  transform: translateY(-8px);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(220, 20, 60, 0.2);
}

.event-card:hover::before {
  opacity: 1;
}

/* Variant: Large - Spans 2 columns */
.event-card--large {
  grid-column: span 2;
  aspect-ratio: 16 / 9;
}

/* Coming Soon State */
.event-card--coming-soon {
  cursor: default;
}

.event-card--coming-soon:hover {
  transform: translateY(-4px);
}

/* ============================================
   IMAGE CONTAINER - Full Coverage
   ============================================ */
.event-card__image-container {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.event-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

.event-card:hover .event-card__image {
  transform: scale(1.08);
}

/* Gradient Overlay - Same as Hero */
.event-card__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.95) 0%,
    rgba(0, 0, 0, 0.7) 35%,
    rgba(0, 0, 0, 0.3) 60%,
    rgba(0, 0, 0, 0.15) 100%
  );
  z-index: 2;
  transition: opacity 0.4s ease;
}

.event-card:hover .event-card__overlay {
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.98) 0%,
    rgba(0, 0, 0, 0.65) 35%,
    rgba(0, 0, 0, 0.25) 60%,
    rgba(0, 0, 0, 0.1) 100%
  );
}

/* Glow Effect */
.event-card__glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 80% 50% at 50% 100%,
    rgba(220, 20, 60, 0.15) 0%,
    transparent 60%
  );
  opacity: 0;
  transition: opacity 0.5s ease;
  z-index: 3;
}

.event-card:hover .event-card__glow {
  opacity: 1;
}

/* Border Glow */
.event-card__border-glow {
  position: absolute;
  inset: -1px;
  border-radius: 21px;
  background: linear-gradient(
    135deg,
    rgba(220, 20, 60, 0.4) 0%,
    transparent 50%,
    rgba(220, 20, 60, 0.2) 100%
  );
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: 0;
  filter: blur(4px);
}

.event-card:hover .event-card__border-glow {
  opacity: 0.6;
}

/* ============================================
   COMING SOON CARD - Hero Style
   ============================================ */

/* Background with gradient mesh effect */
.event-card__cs-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    #0a0a0a 0%,
    #0f0a0c 50%,
    #0a0a0a 100%
  );
  overflow: hidden;
}

/* Animated gradient mesh */
.event-card__cs-mesh {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 20% 20%, rgba(220, 20, 60, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse 60% 80% at 80% 80%, rgba(220, 20, 60, 0.06) 0%, transparent 50%);
  animation: cs-mesh-move 15s ease-in-out infinite;
}

@keyframes cs-mesh-move {
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

/* Subtle animated lines */
.event-card__cs-lines {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.event-card__cs-line {
  position: absolute;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(220, 20, 60, 0.15) 50%,
    transparent 100%
  );
  animation: cs-line-pulse 4s ease-in-out infinite;
}

.event-card__cs-line:first-child {
  width: 60%;
  top: 35%;
  left: 20%;
}

.event-card__cs-line:last-child {
  width: 40%;
  top: 65%;
  right: 15%;
  animation-delay: 2s;
}

@keyframes cs-line-pulse {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.6; }
}

/* Coming Soon Badge - Glass style like Hero */
.event-card__cs-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(220, 20, 60, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(220, 20, 60, 0.25);
  border-radius: 50px;
  font-size: 10px;
  font-weight: 600;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

.event-card__cs-badge i {
  font-size: 10px;
  animation: cs-clock-pulse 2s ease-in-out infinite;
}

@keyframes cs-clock-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Coming Soon Category */
.event-card__cs-category {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 4px;
}

/* Coming Soon Title modifier */
.event-card__title--cs {
  color: rgba(255, 255, 255, 0.9);
}

/* Coming Soon Description */
.event-card__cs-description {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.6;
  margin: 8px 0 0 0;
  max-width: 280px;
}

/* Coming Soon Footer */
.event-card__cs-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.event-card__cs-hint {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50px;
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
}

.event-card:hover .event-card__cs-hint {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(220, 20, 60, 0.2);
  color: rgba(255, 255, 255, 0.8);
}

.event-card__cs-hint i {
  color: var(--color-primary);
  font-size: 11px;
}

/* ============================================
   CONTENT LAYER - Overlay
   ============================================ */
.event-card__content {
  position: absolute;
  inset: 0;
  z-index: 4;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px;
}

/* Top Section */
.event-card__top {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
}

/* Category Badge - Subtle glass style */
.event-card__category-badge {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  transition: all 0.3s ease;
}

.event-card:hover .event-card__category-badge {
  background: rgba(0, 0, 0, 0.6);
  border-color: rgba(220, 20, 60, 0.3);
}

/* Bottom Section */
.event-card__bottom {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Title */
.event-card__title {
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-card--large .event-card__title {
  font-size: 28px;
}

/* Meta - Same as Hero */
.event-card__meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 4px;
}

.event-card__meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.event-card__meta-item i {
  color: var(--color-primary);
  font-size: 11px;
}

/* Footer - Same as Hero */
.event-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Price - Same as Hero */
.event-card__price {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.event-card__price-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.event-card__price-value {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}

/* CTA Button - Glass Style (exactly like Hero) */
.event-card__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 50px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.event-card__cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--color-primary) 0%, #b01030 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: -1;
  border-radius: 50px;
}

.event-card__cta:hover {
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(220, 20, 60, 0.35);
}

.event-card__cta:hover::before {
  opacity: 1;
}

.event-card__cta i {
  font-size: 10px;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.event-card__cta:hover i {
  transform: translateX(4px);
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 1024px) {
  .event-card--large {
    grid-column: span 1;
    aspect-ratio: 4 / 5;
  }

  .event-card--large .event-card__title {
    font-size: 24px;
  }
}

@media (max-width: 768px) {
  /* Carte plus haute comme sur desktop - ratio 4:5 */
  .event-card {
    aspect-ratio: 4 / 5;
    border-radius: 16px;
    /* Disable transitions during scroll - only on :active (tap) */
    transition: none;
  }
  
  /* Only animate on tap/touch */
  .event-card:active {
    transition: transform 0.2s ease;
    transform: scale(0.98);
  }

  .event-card::before {
    border-radius: 16px;
  }

  .event-card__border-glow {
    border-radius: 17px;
  }

  /* Overlay optimisé : plus léger en haut pour montrer l'image, foncé en bas pour le texte */
  .event-card__overlay {
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.98) 0%,
      rgba(0, 0, 0, 0.9) 35%,
      rgba(0, 0, 0, 0.4) 65%,
      rgba(0, 0, 0, 0.15) 100%
    );
  }

  /* Structure cohérente avec desktop */
  .event-card__content {
    padding: 20px;
    justify-content: space-between;
  }

  .event-card__bottom {
    /* Contenu reste en bas comme sur desktop */
    gap: 8px;
  }

  .event-card__category-badge {
    padding: 8px 14px;
    font-size: 10px;
    letter-spacing: 1.2px;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(12px);
  }

  .event-card__title {
    font-size: 22px;
    font-weight: 700;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  .event-card__meta {
    margin-top: 8px;
    gap: 14px;
  }

  .event-card__meta-item {
    font-size: 13px;
    font-weight: 500;
    gap: 6px;
    color: rgba(255, 255, 255, 0.8);
  }

  .event-card__meta-item i {
    font-size: 12px;
    color: var(--color-primary);
  }

  /* Footer comme sur desktop - prix et CTA côte à côte */
  .event-card__footer {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .event-card__price {
    justify-content: flex-start;
    flex-direction: row;
    align-items: baseline;
    gap: 6px;
  }

  .event-card__price-label {
    font-size: 11px;
    text-transform: none;
    letter-spacing: 0;
    opacity: 0.7;
  }

  .event-card__price-value {
    font-size: 22px;
    font-weight: 700;
    text-shadow: 0 2px 8px rgba(220, 20, 60, 0.3);
  }

  /* CTA Button - Compact comme sur desktop */
  .event-card__cta {
    padding: 12px 18px;
    font-size: 11px;
    font-weight: 600;
    width: auto;
    flex-shrink: 0;
    justify-content: center;
    background: linear-gradient(135deg, var(--color-primary) 0%, #b01030 100%);
    border: none;
    box-shadow: 0 4px 12px rgba(220, 20, 60, 0.25);
    letter-spacing: 0.5px;
    gap: 6px;
  }

  .event-card__cta::before {
    display: none;
  }

  /* Disable hover on mobile - use :active for touch feedback */
  .event-card__cta:active {
    transform: scale(0.95);
  }

  /* Coming Soon responsive - même structure que event card */
  .event-card__cs-badge {
    padding: 8px 14px;
    font-size: 10px;
    letter-spacing: 1.2px;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(12px);
  }

  .event-card__cs-category {
    font-size: 11px;
    letter-spacing: 1.5px;
    margin-bottom: 4px;
    color: rgba(255, 255, 255, 0.5);
  }

  .event-card__title--cs {
    font-size: 22px !important;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  .event-card__cs-description {
    font-size: 13px;
    line-height: 1.5;
    margin-top: 8px;
    color: rgba(255, 255, 255, 0.7);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Footer Coming Soon - même style que event card */
  .event-card__cs-footer {
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  /* Bouton Coming Soon - compact comme CTA */
  .event-card__cs-hint {
    padding: 12px 18px;
    font-size: 11px;
    font-weight: 600;
    width: auto;
    display: inline-flex;
    justify-content: center;
    background: linear-gradient(135deg, rgba(220, 20, 60, 0.2) 0%, rgba(176, 16, 48, 0.2) 100%);
    border: 1px solid rgba(220, 20, 60, 0.35);
    color: var(--color-primary);
    letter-spacing: 0.5px;
    gap: 6px;
  }

  .event-card__cs-hint i {
    color: var(--color-primary);
    font-size: 12px;
  }
  
  /* Mobile performance: disable all GPU hints */
  .event-card,
  .event-card__image,
  .event-card__overlay,
  .event-card__content {
    will-change: auto !important;
  }
  
  /* Disable hover effects - mobile uses :active */
  .event-card:hover {
    transform: none;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }
  
  .event-card:hover::before,
  .event-card:hover .event-card__glow,
  .event-card:hover .event-card__border-glow,
  .event-card:hover .event-card__overlay,
  .event-card:hover .event-card__image {
    /* Disable all hover effects on mobile */
    opacity: initial;
    transform: none;
    background: initial;
  }
}

@media (max-width: 480px) {
  /* Garde le ratio 4:5 même sur petits écrans */
  .event-card {
    aspect-ratio: 4 / 5;
  }

  .event-card__content {
    padding: 16px;
  }

  .event-card__category-badge {
    padding: 6px 10px;
    font-size: 9px;
  }

  .event-card__title {
    font-size: 18px;
  }

  .event-card__meta {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 12px;
  }

  .event-card__meta-item {
    font-size: 11px;
  }

  .event-card__meta-item i {
    font-size: 11px;
  }

  .event-card__price-value {
    font-size: 18px;
  }

  .event-card__price-label {
    font-size: 10px;
  }

  .event-card__cta {
    padding: 10px 14px;
    font-size: 10px;
    gap: 5px;
  }

  /* Coming Soon responsive - 480px */
  .event-card__cs-badge {
    padding: 6px 10px;
    font-size: 9px;
  }

  .event-card__cs-category {
    font-size: 10px;
  }

  .event-card__title--cs {
    font-size: 18px !important;
  }

  .event-card__cs-description {
    font-size: 12px;
    max-width: 100%;
  }

  .event-card__cs-hint {
    padding: 10px 14px;
    font-size: 10px;
  }
}
</style>
