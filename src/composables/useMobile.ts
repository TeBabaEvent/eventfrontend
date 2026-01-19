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

  // Track last width to ignore address bar changes (height-only changes)
  let lastWidth = 0

  // 🚀 Debounced resize handler - only fires after resize stops (150ms)
  // CRITICAL: Only check mobile on WIDTH changes, not height changes
  // Height changes are typically caused by mobile browser address bar
  const handleResize = () => {
    if (resizeTimeout) clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => {
      // Only check if width actually changed (ignore address bar height changes)
      const currentWidth = window.innerWidth
      if (Math.abs(currentWidth - lastWidth) > 10) {
        lastWidth = currentWidth
        checkMobile()
      }
    }, 150)
  }

  // Combined check: skip animations if mobile OR reduced motion preferred
  const shouldReduceMotion = () => isMobile.value || prefersReducedMotion.value

  onMounted(() => {
    checkMobile()
    checkReducedMotion()
    // Initialize last width for resize comparison
    lastWidth = window.innerWidth
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
