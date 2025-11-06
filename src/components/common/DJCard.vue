<template>
  <article class="dj-card">
    <!-- Image Wrapper -->
    <div class="dj-card__image-wrapper">
      <img 
        v-if="dj.image_url || dj.image" 
        :src="dj.image_url || dj.image" 
        :alt="dj.name"
        @error="onImageError"
      >
      <div v-else class="dj-card__placeholder">
        <i class="fas fa-user-music"></i>
        <span>{{ dj.name }}</span>
      </div>
      
      <!-- Badge -->
      <div :class="badgeClasses">
        <i :class="badgeIcon"></i>
        {{ badgeLabel }}
      </div>
      
      <!-- Social Overlay -->
      <div class="dj-card__overlay">
        <div class="dj-card__social">
          <a
            v-if="dj.instagram"
            :href="dj.instagram"
            class="dj-card__social-link"
            target="_blank"
            rel="noopener"
            aria-label="Instagram"
          >
            <i class="fab fa-instagram"></i>
          </a>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="dj-card__content">
      <div class="dj-card__role">{{ displayRole }}</div>
      <h3 class="dj-card__name">{{ dj.name }}</h3>
      <p class="dj-card__description">{{ displayDescription }}</p>
    </div>

    <!-- Glow Effect -->
    <div class="dj-card__glow"></div>
  </article>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'
import { DJ_BADGES } from '@/constants'
import type { DJ } from '@/types'
import { useI18n } from 'vue-i18n'
import { getArtistRole, getArtistDescription } from '@/utils/translations'

const { t, locale } = useI18n()

const props = defineProps({
  dj: {
    type: Object as PropType<DJ>,
    required: true
  }
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

// Methods
const onImageError = (event: Event) => {
  // Hide the image and show placeholder
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
  const placeholder = img.parentElement?.querySelector('.dj-card__placeholder')
  if (placeholder) {
    (placeholder as HTMLElement).style.display = 'flex'
  }
}
</script>

<style scoped>
/* DJ Cards */
.dj-card {
  position: relative;
  background: var(--color-gray);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  transition: all var(--transition-slow);
}

.dj-card:hover {
  transform: translateY(-8px);
  border-color: rgba(220, 20, 60, 0.4);
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.4),
    0 0 40px rgba(220, 20, 60, 0.2);
}

/* Image */
.dj-card__image-wrapper {
  position: relative;
  height: 400px;
  overflow: hidden;
}

.dj-card__image-wrapper::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60%;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.95) 0%,
    rgba(0, 0, 0, 0.6) 40%,
    transparent 100%
  );
  z-index: 1;
  pointer-events: none;
}

.dj-card__image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  filter: brightness(0.9) contrast(1.05);
}

.dj-card:hover .dj-card__image-wrapper img {
  transform: scale(1.08);
  filter: brightness(0.95) contrast(1.1);
}

/* Placeholder */
.dj-card__placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(220, 20, 60, 0.1) 0%, rgba(139, 0, 0, 0.1) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.6);
}

.dj-card__placeholder i {
  font-size: 4rem;
  color: var(--color-primary);
  opacity: 0.7;
}

.dj-card__placeholder span {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
}

/* Badge */
.dj-card__badge {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  padding: 0.625rem 1.25rem;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 50px;
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--color-white);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 2;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all var(--transition-normal);
}

.dj-card__badge i {
  color: var(--color-primary);
}

.dj-card__badge--fire {
  background: linear-gradient(135deg, var(--color-primary) 0%, rgba(220, 20, 60, 0.9) 100%);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 4px 16px rgba(220, 20, 60, 0.5),
    0 0 30px rgba(220, 20, 60, 0.3);
  animation: pulse-glow 2s ease-in-out infinite;
}

.dj-card__badge--fire i {
  color: var(--color-white);
  animation: flame-flicker 1.5s ease-in-out infinite;
}

.dj-card__badge--premium {
  background: linear-gradient(135deg, var(--color-accent) 0%, rgba(139, 0, 0, 0.9) 100%);
  border-color: rgba(255, 215, 0, 0.4);
  box-shadow: 
    0 4px 16px rgba(139, 0, 0, 0.5),
    0 0 25px rgba(255, 215, 0, 0.2);
}

.dj-card__badge--premium i {
  color: #FFD700;
  filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.6));
}

/* Overlay Social */
.dj-card__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(220, 20, 60, 0.95) 0%,
    rgba(139, 0, 0, 0.95) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-slow);
  z-index: 3;
}

.dj-card:hover .dj-card__overlay {
  opacity: 1;
}

.dj-card__social {
  display: flex;
  gap: 1rem;
  transform: translateY(20px);
  transition: transform var(--transition-slow);
}

.dj-card:hover .dj-card__social {
  transform: translateY(0);
}

.dj-card__social-link {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  font-size: 1.25rem;
  transition: all var(--transition-normal);
  text-decoration: none;
}

.dj-card__social-link:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: var(--color-white);
  transform: translateY(-4px) scale(1.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

/* Content */
.dj-card__content {
  padding: var(--spacing-lg) var(--spacing-md) var(--spacing-lg);
}

.dj-card__role {
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 2.5px;
  margin-bottom: 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.dj-card__role::before {
  content: '';
  width: 4px;
  height: 4px;
  background: var(--color-primary);
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(220, 20, 60, 0.5);
  animation: pulse-dot 2s ease-in-out infinite;
}

.dj-card__name {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 900;
  color: var(--color-white);
  margin-bottom: 1rem;
  line-height: 1.2;
  position: relative;
}

.dj-card__name::after {
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

.dj-card:hover .dj-card__name::after {
  width: 60%;
}

.dj-card__description {
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.7;
  margin-bottom: 0;
  font-size: 0.9375rem;
}

/* Glow Effect */
.dj-card__glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, rgba(220, 20, 60, 0.08) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.6s ease;
  pointer-events: none;
}

.dj-card:hover .dj-card__glow {
  opacity: 1;
}

/* Responsive - Tablette */
@media (max-width: 768px) {
  .dj-card__image-wrapper {
    height: 350px;
  }

  .dj-card__name {
    font-size: 1.75rem;
  }
}

/* Responsive - Mobile */
@media (max-width: 480px) {
  .dj-card__image-wrapper {
    height: 300px;
  }

  .dj-card__badge {
    top: 1rem;
    left: 1rem;
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
  }

  .dj-card__content {
    padding: var(--spacing-5) var(--spacing-4) var(--spacing-5);
  }

  .dj-card__name {
    font-size: 1.5rem;
    margin-bottom: 0.75rem;
  }

  .dj-card__description {
    font-size: 0.875rem;
  }

  .dj-card__social-link {
    width: 48px;
    height: 48px;
    font-size: 1.125rem;
  }
}
</style>

