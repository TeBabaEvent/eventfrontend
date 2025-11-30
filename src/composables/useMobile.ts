import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Composable to detect if the device is mobile/tablet based on screen width.
 * Uses 1024px as the breakpoint to include tablets in the "mobile" category
 * for performance reasons (disabling heavy animations/scroll effects).
 */
export function useMobile() {
  const isMobile = ref(false)
  const MOBILE_BREAKPOINT = 1024
  let resizeTimeout: ReturnType<typeof setTimeout> | null = null

  const checkMobile = () => {
    isMobile.value = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches
  }

  // 🚀 Debounced resize handler - only fires after resize stops (150ms)
  const handleResize = () => {
    if (resizeTimeout) clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(checkMobile, 150)
  }

  onMounted(() => {
    checkMobile()
    window.addEventListener('resize', handleResize, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    if (resizeTimeout) clearTimeout(resizeTimeout)
  })

  return {
    isMobile
  }
}
