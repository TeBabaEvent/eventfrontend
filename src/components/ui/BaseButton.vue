<template>
  <component
    :is="tag"
    :class="buttonClasses"
    :disabled="disabled || loading"
    v-bind="$attrs"
    @click="handleClick"
  >
    <span v-if="loading" class="btn__spinner">
      <i class="fas fa-spinner fa-spin"></i>
    </span>
    <span v-else-if="icon && iconPosition === 'left'" class="btn__icon btn__icon--left">
      <i :class="icon"></i>
    </span>
    
    <span class="btn__content">
      <slot />
    </span>
    
    <span v-if="icon && iconPosition === 'right'" class="btn__icon btn__icon--right">
      <i :class="icon"></i>
    </span>
    
    <div v-if="variant === 'outline'" class="btn__border"></div>
  </component>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'
type ButtonSize = 'small' | 'medium' | 'large'
type IconPosition = 'left' | 'right'

const props = defineProps({
  variant: {
    type: String as PropType<ButtonVariant>,
    default: 'primary'
  },
  size: {
    type: String as PropType<ButtonSize>,
    default: 'medium'
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: ''
  },
  iconPosition: {
    type: String as PropType<IconPosition>,
    default: 'right'
  },
  tag: {
    type: String,
    default: 'button'
  }
})

const emit = defineEmits<{
  click: [event: Event]
}>()

const buttonClasses = computed(() => [
  'btn',
  `btn--${props.variant}`,
  `btn--${props.size}`,
  {
    'btn--loading': props.loading,
    'btn--disabled': props.disabled,
    'btn--with-icon': props.icon
  }
])

const handleClick = (event: Event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  font-family: var(--font-heading);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  border: none;
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  transition: all var(--transition-normal);
  overflow: hidden;
  white-space: nowrap;
  user-select: none;
}

.btn:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Variants */
.btn--primary {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: var(--color-white);
  box-shadow: var(--shadow-md);
}

.btn--primary:hover {
  background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.btn--secondary {
  background: var(--bg-secondary);
  color: var(--color-white);
  border: 1px solid var(--color-gray-600);
}

.btn--secondary:hover {
  background: var(--bg-tertiary);
  border-color: var(--color-gray-500);
}

.btn--outline {
  background: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  position: relative;
}

.btn--outline:hover {
  color: var(--color-white);
  background: var(--color-primary);
}

.btn--ghost {
  background: transparent;
  color: var(--color-gray-300);
}

.btn--ghost:hover {
  background: var(--bg-glass);
  color: var(--color-white);
}

/* Sizes */
.btn--small {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-sm);
  min-height: 36px;
}

.btn--medium {
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--font-size-base);
  min-height: 44px;
}

.btn--large {
  padding: var(--spacing-4) var(--spacing-8);
  font-size: var(--font-size-lg);
  min-height: 52px;
}

/* States */
.btn--loading,
.btn--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.btn--loading:hover,
.btn--disabled:hover {
  transform: none;
}

/* Icons */
.btn__icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn__spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn__content {
  flex: 1;
}

/* Border animation for outline variant */
.btn__border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  padding: 2px;
  background: linear-gradient(45deg, var(--color-primary), var(--color-accent));
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.btn--outline:hover .btn__border {
  opacity: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .btn--large {
    padding: var(--spacing-3) var(--spacing-6);
    font-size: var(--font-size-base);
    min-height: 48px;
  }
}
</style>
