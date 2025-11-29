import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Composable to detect if the device is mobile/tablet based on screen width.
 * Uses 1024px as the breakpoint to include tablets in the "mobile" category
 * for performance reasons (disabling heavy animations/scroll effects).
 */
export function useMobile() {
  const isMobile = ref(false)
  const MOBILE_BREAKPOINT = 1024

  const checkMobile = () => {
    isMobile.value = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches
  }

  onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
  })

  return {
    isMobile
  }
}
