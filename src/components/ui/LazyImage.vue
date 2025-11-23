<template>
  <div class="lazy-image" :class="{ 'lazy-image--loading': isLoading }">
    <!-- Loading Placeholder -->
    <div v-if="isLoading" class="lazy-image__placeholder">
      <div class="lazy-image__spinner">
        <div class="spinner-circle"></div>
      </div>
    </div>
    
    <!-- Error Placeholder -->
    <div v-else-if="hasError" class="lazy-image__error">
      <i class="fas fa-image"></i>
      <span>{{ errorMessage || 'Image non disponible' }}</span>
    </div>
    
    <!-- Actual Image -->
    <img
      v-else
      :src="optimizedSrc"
      :srcset="srcSet"
      :alt="alt"
      :class="imageClass"
      :loading="loading"
      :width="width"
      :height="height"
      @load="onLoad"
      @error="onError"
      v-show="!isLoading && !hasError"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { getOptimizedImageUrl, generateSrcSet } from '@/utils/image'

interface Props {
  src: string
  alt?: string
  imageClass?: string
  errorMessage?: string
  loading?: 'lazy' | 'eager'
  width?: number | string
  height?: number | string
  resizeWidth?: number
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  imageClass: '',
  errorMessage: '',
  loading: 'lazy',
  resizeWidth: 800
})

const isLoading = ref(true)
const hasError = ref(false)

const optimizedSrc = computed(() => {
  return getOptimizedImageUrl(props.src, props.resizeWidth)
})

const srcSet = computed(() => {
  return generateSrcSet(props.src)
})

const onLoad = () => {
  isLoading.value = false
  hasError.value = false
}

const onError = () => {
  isLoading.value = false
  hasError.value = true
}

// Reset states when src changes
watch(() => props.src, () => {
  if (props.src) {
    isLoading.value = true
    hasError.value = false
  }
})

onMounted(() => {
  if (!props.src) {
    isLoading.value = false
    hasError.value = true
  }
})
</script>

<style scoped>
.lazy-image {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.lazy-image__placeholder,
.lazy-image__error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.lazy-image__spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-circle {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(220, 20, 60, 0.2);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.lazy-image__error {
  flex-direction: column;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
  text-align: center;
  padding: 1rem;
}

.lazy-image__error i {
  font-size: 2rem;
  opacity: 0.6;
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}
</style>
