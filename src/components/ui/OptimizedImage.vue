<script setup lang="ts">
import { ref, computed } from 'vue'
import { getOptimizedImageUrl } from '@/utils/image'

interface Props {
  src: string
  alt: string
  width?: number
  height?: number
  loading?: 'lazy' | 'eager'
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  aspectRatio?: string
  placeholder?: string
  sizes?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: 800,
  loading: 'lazy',
  objectFit: 'cover',
  sizes: '100vw'
})

const imageLoaded = ref(false)
const imageError = ref(false)
const imgRef = ref<HTMLImageElement>()

// Helper to encode URL for wsrv.nl (avoid double-encoding)
const encodeImageUrl = (url: string): string => {
  // Check if URL is already encoded by looking for %XX patterns
  const isAlreadyEncoded = /%[0-9A-Fa-f]{2}/.test(url)

  if (isAlreadyEncoded) {
    // URL already has percent-encoding, use as-is
    return url.replace(/:/g, '%3A').replace(/\//g, '%2F')
  }

  // Not encoded, encode it
  return encodeURIComponent(url)
}

// Generate optimized URLs for different formats
const avifUrl = computed(() => {
  if (!props.src) return ''
  // Use wsrv.nl for AVIF format
  if (props.src.startsWith('http')) {
    const baseUrl = 'https://wsrv.nl/?url='
    let params = `${encodeImageUrl(props.src)}&w=${props.width}&q=80&output=avif&il`
    if (props.height) {
      params += `&h=${props.height}&fit=cover`
    }
    return `${baseUrl}${params}`
  }
  return props.src
})

const webpUrl = computed(() => {
  if (!props.src) return ''
  return getOptimizedImageUrl(props.src, props.width, props.height)
})

const jpegUrl = computed(() => {
  if (!props.src) return ''
  // Use wsrv.nl for JPEG format
  if (props.src.startsWith('http')) {
    const baseUrl = 'https://wsrv.nl/?url='
    let params = `${encodeImageUrl(props.src)}&w=${props.width}&q=80&output=jpg&il`
    if (props.height) {
      params += `&h=${props.height}&fit=cover`
    }
    return `${baseUrl}${params}`
  }
  return props.src
})

// Generate srcset for different screen densities
const generateDensitySrcSet = (baseUrl: string): string => {
  if (!baseUrl || !props.width) return ''

  const densities = [1, 2]
  return densities
    .map(density => {
      const width = Math.round(props.width! * density)
      let url = baseUrl
      // Replace width parameter in URL
      url = url.replace(/&w=\d+/, `&w=${width}`)
      return `${url} ${density}x`
    })
    .join(', ')
}

const avifSrcSet = computed(() => generateDensitySrcSet(avifUrl.value))
const webpSrcSet = computed(() => generateDensitySrcSet(webpUrl.value))
const jpegSrcSet = computed(() => generateDensitySrcSet(jpegUrl.value))

const handleLoad = () => {
  imageLoaded.value = true
  imageError.value = false
}

const handleError = () => {
  imageError.value = true
  imageLoaded.value = false

  // Log failed image URL in development for debugging
  if (import.meta.env.DEV) {
    console.warn('OptimizedImage: Failed to load image:', props.src)
  }
}

const imageClasses = computed(() => ({
  'optimized-image__img': true,
  'optimized-image__img--loaded': imageLoaded.value,
  'optimized-image__img--error': imageError.value
}))

const containerStyle = computed(() => ({
  aspectRatio: props.aspectRatio,
  backgroundColor: imageLoaded.value ? 'transparent' : '#1a1a1a'
}))

const imageStyle = computed(() => ({
  objectFit: props.objectFit
}))
</script>

<template>
  <div class="optimized-image" :style="containerStyle">
    <!-- Loading placeholder -->
    <div
      v-if="!imageLoaded && !imageError"
      class="optimized-image__placeholder"
    >
      <div class="optimized-image__skeleton"></div>
    </div>

    <!-- Error state -->
    <div
      v-if="imageError"
      class="optimized-image__error"
      :aria-label="`Failed to load image: ${alt}`"
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      <span>Image unavailable</span>
    </div>

    <!-- Optimized picture element -->
    <picture v-show="!imageError">
      <!-- AVIF format - best compression -->
      <source
        v-if="avifUrl"
        :srcset="avifSrcSet"
        :sizes="sizes"
        type="image/avif"
      />

      <!-- WebP format - good compression, wide support -->
      <source
        v-if="webpUrl"
        :srcset="webpSrcSet"
        :sizes="sizes"
        type="image/webp"
      />

      <!-- JPEG fallback - universal support -->
      <img
        ref="imgRef"
        :src="jpegUrl"
        :srcset="jpegSrcSet"
        :alt="alt"
        :loading="loading"
        :class="imageClasses"
        :style="imageStyle"
        @load="handleLoad"
        @error="handleError"
      />
    </picture>
  </div>
</template>

<style scoped>
.optimized-image {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #1a1a1a;
}

.optimized-image__img {
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.optimized-image__img--loaded {
  opacity: 1;
}

.optimized-image__img--error {
  display: none;
}

.optimized-image__placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.optimized-image__skeleton {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    #1a1a1a 0%,
    #2a2a2a 50%,
    #1a1a1a 100%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.optimized-image__error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #666;
  background-color: #1a1a1a;
}

.optimized-image__error svg {
  opacity: 0.5;
}

.optimized-image__error span {
  font-size: 0.875rem;
  opacity: 0.7;
}

/* Responsive image sizing */
.optimized-image img {
  display: block;
}

/* Ensure proper aspect ratio preservation */
.optimized-image[style*="aspect-ratio"] {
  height: auto;
}
</style>
