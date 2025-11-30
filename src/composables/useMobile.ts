import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Composable to detect if the device is mobile/tablet based on screen width.
 * Uses 1024px as the breakpoint to include tablets in the "mobile" category
 * for performance reasons (disabling heavy animations/scroll effects).
 *
 * Also detects prefers-reduced-motion for accessibility.
 */
export function useMobile() {
  const isMobile = ref(false)
  const prefersReducedMotion = ref(false)
  const MOBILE_BREAKPOINT = 1024
  let resizeTimeout: ReturnType<typeof setTimeout> | null = null
  let motionQuery: MediaQueryList | null = null

  const checkMobile = () => {
    isMobile.value = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches
  }

  const checkReducedMotion = () => {
    prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  // 🚀 Debounced resize handler - only fires after resize stops (150ms)
  const handleResize = () => {
    if (resizeTimeout) clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(checkMobile, 150)
  }

  // Combined check: skip animations if mobile OR reduced motion preferred
  const shouldReduceMotion = () => isMobile.value || prefersReducedMotion.value

  onMounted(() => {
    checkMobile()
    checkReducedMotion()
    window.addEventListener('resize', handleResize, { passive: true })

    // Listen for reduced motion changes
    motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    motionQuery.addEventListener('change', checkReducedMotion)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    if (resizeTimeout) clearTimeout(resizeTimeout)
    
    // ✅ Cleanup motionQuery listener
    if (motionQuery) {
      motionQuery.removeEventListener('change', checkReducedMotion)
      motionQuery = null
    }
  })

  return {
    isMobile,
    prefersReducedMotion,
    shouldReduceMotion
  }
}
