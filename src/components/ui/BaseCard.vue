<template>
  <div :class="cardClasses">
    <div v-if="$slots.header" class="card__header">
      <slot name="header" />
    </div>
    
    <div class="card__content" :class="contentClasses">
      <slot />
    </div>
    
    <div v-if="$slots.footer" class="card__footer">
      <slot name="footer" />
    </div>
    
    <div v-if="hoverable" class="card__glow"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

type CardVariant = 'default' | 'elevated' | 'outlined' | 'glass'
type CardPadding = 'none' | 'small' | 'medium' | 'large'

const props = defineProps({
  variant: {
    type: String as PropType<CardVariant>,
    default: 'default'
  },
  padding: {
    type: String as PropType<CardPadding>,
    default: 'medium'
  },
  hoverable: {
    type: Boolean,
    default: false
  },
  clickable: {
    type: Boolean,
    default: false
  }
})

const cardClasses = computed(() => [
  'card',
  `card--${props.variant}`,
  {
    'card--hoverable': props.hoverable,
    'card--clickable': props.clickable
  }
])

const contentClasses = computed(() => [
  'card__content',
  `card__content--${props.padding}`
])
</script>

<style scoped>
.card {
  position: relative;
  background: var(--bg-secondary);
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  transition: all var(--transition-normal);
}

/* Variants */
.card--default {
  background: var(--bg-secondary);
}

.card--elevated {
  background: var(--bg-secondary);
  box-shadow: var(--shadow-lg);
}

.card--outlined {
  background: var(--bg-secondary);
  border: 1px solid var(--color-gray-700);
}

.card--glass {
  background: var(--bg-glass);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* States */
.card--hoverable:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-2xl);
}

.card--clickable {
  cursor: pointer;
}

.card--clickable:hover {
  transform: translateY(-2px);
}

/* Content padding */
.card__content--none {
  padding: 0;
}

.card__content--small {
  padding: var(--spacing-4);
}

.card__content--medium {
  padding: var(--spacing-6);
}

.card__content--large {
  padding: var(--spacing-8);
}

/* Header and footer */
.card__header,
.card__footer {
  padding: var(--spacing-4) var(--spacing-6);
  border-bottom: 1px solid var(--color-gray-700);
}

.card__footer {
  border-bottom: none;
  border-top: 1px solid var(--color-gray-700);
}

/* Glow effect */
.card__glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  opacity: 0;
  transition: opacity var(--transition-normal);
  z-index: -1;
  filter: blur(20px);
}

.card--hoverable:hover .card__glow {
  opacity: 0.1;
}

/* Responsive */
@media (max-width: 768px) {
  .card__content--medium {
    padding: var(--spacing-4);
  }
  
  .card__content--large {
    padding: var(--spacing-6);
  }
}
</style>
