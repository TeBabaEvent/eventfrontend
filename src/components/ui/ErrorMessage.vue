<template>
  <div :class="['error-message', `error-message--${variant}`]">
    <i class="fas fa-exclamation-circle"></i>
    <div class="error-message__content">
      <p class="error-message__title">{{ title || $t('common.error') }}</p>
      <p v-if="message" class="error-message__text">{{ message }}</p>
      <button v-if="retry" class="error-message__retry" @click="$emit('retry')">
        <i class="fas fa-redo"></i>
        {{ $t('common.retry') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  message?: string
  variant?: 'error' | 'warning' | 'info'
  retry?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'error',
  retry: false
})

defineEmits(['retry'])
</script>

<style scoped>
.error-message {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: var(--radius-sm);
  margin: 2rem 0;
}

.error-message--error {
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: #ff6b6b;
}

.error-message--warning {
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  color: #ffc107;
}

.error-message--info {
  background: rgba(13, 202, 240, 0.1);
  border: 1px solid rgba(13, 202, 240, 0.3);
  color: #0dcaf0;
}

.error-message i {
  font-size: 1.5rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.error-message__content {
  flex: 1;
}

.error-message__title {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.error-message__text {
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 0.75rem;
}

.error-message__retry {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-sm);
  color: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.error-message__retry:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}
</style>

