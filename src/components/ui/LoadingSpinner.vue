<template>
  <div :class="['loading-spinner', { 'loading-spinner--fullscreen': fullscreen }]">
    <div class="spinner-circle"></div>
    <p v-if="message" class="spinner-message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  fullscreen?: boolean
  message?: string
}

withDefaults(defineProps<Props>(), {
  fullscreen: false,
  message: ''
})
</script>

<style scoped>
/* Loading Spinner */
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.loading-spinner--fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 9999;
}

.spinner-circle {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(220, 20, 60, 0.2);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite; /* spin defined in variables.css */
}

/* Message */
.spinner-message {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  text-align: center;
  animation: fade-in-out 2s ease-in-out infinite;
}

@keyframes fade-in-out {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
</style>

