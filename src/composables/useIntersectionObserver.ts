/**
 * Composable pour détecter la visibilité d'éléments avec Intersection Observer API
 * 
 * @description
 * Permet de détecter quand un élément entre dans le viewport.
 * Utile pour lazy loading, animations au scroll, etc.
 * 
 * @example
 * ```ts
 * // Dans un composant
 * import { useIntersectionObserver } from '@/composables/useIntersectionObserver'
 * import { ref } from 'vue'
 * 
 * const imageRef = ref<HTMLElement>()
 * const { isIntersecting, observe } = useIntersectionObserver({
 *   threshold: 0.5,
 *   rootMargin: '100px'
 * })
 * 
 * onMounted(() => {
 *   if (imageRef.value) {
 *     observe(imageRef.value)
 *   }
 * })
 * 
 * // Utiliser dans le template
 * <img ref="imageRef" v-show="isIntersecting" />
 * ```
 * 
 * @param options - Options de l'IntersectionObserver
 * @returns Object avec isIntersecting, target, observe, unobserve
 */
import { ref, onMounted, onUnmounted } from 'vue'

export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const isIntersecting = ref(false)
  const target = ref<Element | null>(null)
  
  let observer: IntersectionObserver | null = null

  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
    ...options
  }

  onMounted(() => {
    observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        isIntersecting.value = entry.isIntersecting
      }
    }, defaultOptions)

    if (target.value) {
      observer.observe(target.value)
    }
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  const observe = (element: Element) => {
    target.value = element
    if (observer) {
      observer.observe(element)
    }
  }

  const unobserve = (element: Element) => {
    if (observer) {
      observer.unobserve(element)
    }
  }

  return {
    isIntersecting,
    target,
    observe,
    unobserve
  }
}
