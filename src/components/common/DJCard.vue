<template>
  <article class="dj-card">
    <!-- Image Layer - Full Coverage -->
    <div class="dj-card__image-container">
      <img
        v-if="dj.image_url"
        :src="optimizedImage"
        :alt="dj.name"
        class="dj-card__image"
        loading="lazy"
        decoding="async"
        width="400"
        height="500"
      >

      <!-- Placeholder if no image -->
      <div v-else class="dj-card__placeholder">
        <div class="dj-card__placeholder-icon">
          <i class="fas fa-user-music"></i>
        </div>
        <div class="dj-card__placeholder-pattern"></div>
      </div>

      <!-- Gradient Overlay - Same as EventCard -->
      <div class="dj-card__overlay"></div>

      <!-- Hover Glow Effect -->
      <div class="dj-card__glow"></div>
    </div>

    <!-- Content Layer - Overlay on Image -->
    <div class="dj-card__content">
      <!-- Top Section: Badge -->
      <div class="dj-card__top">
        <div :class="badgeClasses">
          <i :class="badgeIcon"></i>
          <span>{{ badgeLabel }}</span>
        </div>
      </div>

      <!-- Bottom Section: Info -->
      <div class="dj-card__bottom">
        <!-- Role -->
        <div class="dj-card__role">
          <span class="dj-card__role-dot"></span>
          {{ displayRole }}
        </div>

        <!-- Name -->
        <h3 class="dj-card__name">{{ dj.name }}</h3>

        <!-- Description -->
        <p class="dj-card__description">{{ displayDescription }}</p>

        <!-- Footer with Social -->
        <div class="dj-card__footer">
          <a
            v-if="dj.instagram"
            :href="dj.instagram"
            class="dj-card__social-link"
            target="_blank"
            rel="noopener"
            aria-label="Instagram"
            @click.stop
          >
            <i class="fab fa-instagram"></i>
            <span>Instagram</span>
          </a>

          <div v-else class="dj-card__social-placeholder">
            <i class="fas fa-music"></i>
            <span>{{ t('team.defaultRole') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Border Glow on Hover -->
    <div class="dj-card__border-glow"></div>
  </article>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'
import { DJ_BADGES } from '@/constants'
import type { Artist } from '@/types'
import { useI18n } from 'vue-i18n'
import { getArtistRole, getArtistDescription } from '@/utils/translations'
import { getOptimizedImageUrl, IMAGE_WIDTHS } from '@/utils/image'

const { t, locale } = useI18n()

const props = defineProps({
  dj: {
    type: Object as PropType<Artist>,
    required: true
  }
})

const optimizedImage = computed(() => {
  return getOptimizedImageUrl(props.dj.image_url || '', IMAGE_WIDTHS.SMALL)
})

// Computed properties
const badgeClasses = computed(() => [
  'dj-card__badge',
  props.dj.badge === 'fire' && 'dj-card__badge--fire',
  props.dj.badge === 'premium' && 'dj-card__badge--premium'
])

const badgeIcon = computed(() => {
  if (!props.dj.badge) return 'fas fa-star'
  return DJ_BADGES[props.dj.badge].icon
})

const badgeLabel = computed(() => {
  if (!props.dj.badge) return t('team.badges.star')
  return t(`team.badges.${props.dj.badge}`)
})

const displayRole = computed(() => {
  return getArtistRole(props.dj, locale.value)
})

const displayDescription = computed(() => {
  return getArtistDescription(props.dj, locale.value)
})
</script>

<style scoped>
/* ============================================
   DJ CARD - IMMERSIVE STYLE (Matching EventCard)
   ============================================ */

.dj-card {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  aspect-ratio: 3 / 4;
  background: #0a0a0a;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

/* Subtle gradient border */
.dj-card::before {
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

.dj-card:hover {
  transform: translateY(-8px);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(220, 20, 60, 0.2);
}

.dj-card:hover::before {
  opacity: 1;
}

/* ============================================
   IMAGE CONTAINER - Full Coverage
   ============================================ */
.dj-card__image-container {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.dj-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  filter: brightness(0.95) contrast(1.05);
}

.dj-card:hover .dj-card__image {
  transform: scale(1.08);
  filter: brightness(1) contrast(1.1);
}

/* Placeholder */
.dj-card__placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    #0a0a0a 0%,
    #0f0a0c 50%,
    #0a0a0a 100%
  );
}

.dj-card__placeholder-icon {
  position: relative;
  z-index: 2;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(220, 20, 60, 0.1);
  border: 1px solid rgba(220, 20, 60, 0.2);
  border-radius: 50%;
}

.dj-card__placeholder-icon i {
  font-size: 40px;
  color: var(--color-primary);
  opacity: 0.7;
}

.dj-card__placeholder-pattern {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 30% 20%, rgba(220, 20, 60, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse 60% 80% at 70% 80%, rgba(220, 20, 60, 0.06) 0%, transparent 50%);
  animation: pattern-pulse 10s ease-in-out infinite;
}

@keyframes pattern-pulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

/* Gradient Overlay - Same as EventCard */
.dj-card__overlay {
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

.dj-card:hover .dj-card__overlay {
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.98) 0%,
    rgba(0, 0, 0, 0.65) 35%,
    rgba(0, 0, 0, 0.25) 60%,
    rgba(0, 0, 0, 0.1) 100%
  );
}

/* Glow Effect */
.dj-card__glow {
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

.dj-card:hover .dj-card__glow {
  opacity: 1;
}

/* Border Glow */
.dj-card__border-glow {
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

.dj-card:hover .dj-card__border-glow {
  opacity: 0.6;
}

/* ============================================
   CONTENT LAYER - Overlay
   ============================================ */
.dj-card__content {
  position: absolute;
  inset: 0;
  z-index: 4;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px;
}

/* Top Section */
.dj-card__top {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
}

/* Badge - Subtle glass style matching EventCard category badge */
.dj-card__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
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

.dj-card__badge i {
  color: var(--color-primary);
  font-size: 10px;
}

.dj-card:hover .dj-card__badge {
  background: rgba(0, 0, 0, 0.6);
  border-color: rgba(220, 20, 60, 0.3);
}

/* Fire Badge - Premium feel with subtle glow */
.dj-card__badge--fire {
  background: rgba(220, 20, 60, 0.2);
  border-color: rgba(220, 20, 60, 0.4);
  color: #fff;
}

.dj-card__badge--fire i {
  color: var(--color-primary);
  animation: icon-pulse 2s ease-in-out infinite;
}

@keyframes icon-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.dj-card:hover .dj-card__badge--fire {
  background: rgba(220, 20, 60, 0.3);
  border-color: rgba(220, 20, 60, 0.5);
  box-shadow: 0 0 20px rgba(220, 20, 60, 0.2);
}

/* Premium Badge - Gold accent */
.dj-card__badge--premium {
  background: rgba(139, 69, 19, 0.2);
  border-color: rgba(255, 215, 0, 0.3);
  color: #fff;
}

.dj-card__badge--premium i {
  color: #FFD700;
}

.dj-card:hover .dj-card__badge--premium {
  background: rgba(139, 69, 19, 0.3);
  border-color: rgba(255, 215, 0, 0.4);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.15);
}

/* Bottom Section */
.dj-card__bottom {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Role */
.dj-card__role {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.dj-card__role-dot {
  width: 6px;
  height: 6px;
  background: var(--color-primary);
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(220, 20, 60, 0.6);
  animation: dot-pulse 2s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.8); }
}

/* Name */
.dj-card__name {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin: 4px 0 8px 0;
}

/* Description */
.dj-card__description {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Footer */
.dj-card__footer {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Social Link - Glass Button like EventCard CTA */
.dj-card__social-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 50px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.dj-card__social-link::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #E1306C 0%, #C13584 50%, #833AB4 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: -1;
  border-radius: 50px;
}

.dj-card__social-link:hover {
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(225, 48, 108, 0.35);
}

.dj-card__social-link:hover::before {
  opacity: 1;
}

.dj-card__social-link i {
  font-size: 14px;
  transition: transform 0.3s ease;
}

.dj-card__social-link:hover i {
  transform: scale(1.1);
}

/* Social Placeholder */
.dj-card__social-placeholder {
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
  color: rgba(255, 255, 255, 0.5);
}

.dj-card__social-placeholder i {
  color: var(--color-primary);
  font-size: 12px;
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 768px) {
  .dj-card {
    aspect-ratio: 3 / 4;
    border-radius: 16px;
    will-change: auto !important;
  }

  /* 🚀 PERFORMANCE: Disable backdrop-filter on mobile */
  .dj-card__badge,
  .dj-card__social-link,
  .dj-card__social-placeholder {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    background: rgba(10, 10, 15, 0.95) !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
  }

  /* 🚀 PERFORMANCE: Disable continuous animations on mobile */
  .dj-card__role-dot,
  .dj-card__badge--fire i,
  .dj-card__placeholder-pattern {
    animation: none !important;
  }

  /* 🚀 Static state for role dot */
  .dj-card__role-dot {
    opacity: 1 !important;
    transform: scale(1) !important;
  }

  /* 🚀 Disable hover transforms on mobile */
  .dj-card:hover {
    transform: none !important;
  }

  .dj-card:hover .dj-card__image {
    transform: none !important;
  }

  .dj-card:hover .dj-card__glow,
  .dj-card:hover .dj-card__border-glow {
    opacity: 0 !important;
  }

  /* 🚀 Simpler transitions */
  .dj-card,
  .dj-card__image,
  .dj-card__overlay {
    transition: opacity 0.2s ease !important;
  }

  .dj-card::before {
    border-radius: 16px;
  }

  .dj-card__border-glow {
    border-radius: 17px;
  }

  .dj-card__content {
    padding: 20px;
  }

  .dj-card__badge {
    padding: 6px 12px;
    font-size: 9px;
    border-radius: 5px;
  }

  .dj-card__name {
    font-size: 24px;
  }

  .dj-card__description {
    font-size: 12px;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }

  .dj-card__footer {
    margin-top: 12px;
    padding-top: 12px;
  }

  .dj-card__social-link {
    padding: 10px 16px;
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .dj-card__content {
    padding: 16px;
  }

  .dj-card__badge {
    padding: 5px 10px;
    font-size: 8px;
    border-radius: 4px;
  }

  .dj-card__role {
    font-size: 9px;
  }

  .dj-card__name {
    font-size: 20px;
    margin: 2px 0 6px 0;
  }

  .dj-card__description {
    font-size: 11px;
  }

  .dj-card__social-link,
  .dj-card__social-placeholder {
    padding: 8px 14px;
    font-size: 9px;
  }

  .dj-card__placeholder-icon {
    width: 80px;
    height: 80px;
  }

  .dj-card__placeholder-icon i {
    font-size: 32px;
  }
}
</style>
