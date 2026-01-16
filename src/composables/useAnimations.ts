import { ref, shallowRef } from 'vue'
import { logger } from '@/services/logger'
import type gsap from 'gsap'
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger'

let gsapInstance: typeof gsap | null = null
let ScrollTriggerInstance: typeof ScrollTriggerType | null = null

// Reactive refs for external access (e.g., Lenis integration)
const gsapRef = shallowRef<typeof gsap | null>(null)
const scrollTriggerRef = shallowRef<typeof ScrollTriggerType | null>(null)
let isInitialized = false
let resizeDebounceTimer: ReturnType<typeof setTimeout> | null = null
// ✅ Store resize handler reference for proper cleanup
let resizeHandler: (() => void) | null = null

const activeContexts = new Set<gsap.Context>()

const MOBILE_BREAKPOINT = 1024
const checkIsMobile = () => window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches
const checkReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const isReady = ref(false)
const isEnabled = ref(!checkIsMobile() && !checkReducedMotion())

export interface AnimationContext {
  gsap: typeof gsap | null
  ScrollTrigger: typeof ScrollTriggerType | null
  context: gsap.Context | null
  cleanup: () => void
}

export interface MatchMediaInstance {
  mm: gsap.MatchMedia | null
  cleanup: () => void
}

// Standard breakpoints for matchMedia
export const BREAKPOINTS = {
  mobile: `(max-width: ${MOBILE_BREAKPOINT}px)`,
  desktop: `(min-width: ${MOBILE_BREAKPOINT + 1}px)`,
  reducedMotion: '(prefers-reduced-motion: reduce)',
  noReducedMotion: '(prefers-reduced-motion: no-preference)'
} as const

/**
 * Centralized animation lifecycle manager
 *
 * - Lazy loads GSAP/ScrollTrigger only on desktop (>1024px)
 * - Provides scoped contexts with automatic cleanup
 * - Debounces resize events for ScrollTrigger.refresh()
 *
 * @example
 * const { initialize, createContext, isReady } = useAnimations()
 *
 * onMounted(async () => {
 *   await initialize()
 *   const animCtx = createContext(elementRef.value)
 *   if (animCtx.gsap) {
 *     animCtx.context?.add(() => {
 *       animCtx.gsap!.to('.element', { opacity: 1 })
 *     })
 *   }
 * })
 *
 * onUnmounted(() => animCtx?.cleanup())
 */
export function useAnimations() {
  async function initialize(): Promise<void> {
    if (!isEnabled.value) {
      isReady.value = true
      return
    }

    if (isInitialized) {
      isReady.value = true
      return
    }

    try {
      const gsapModule = await import('gsap')
      gsapInstance = gsapModule.default

      const scrollTriggerModule = await import('gsap/ScrollTrigger')
      ScrollTriggerInstance = scrollTriggerModule.ScrollTrigger

      gsapInstance.registerPlugin(ScrollTriggerInstance)

      // Expose instances via reactive refs for Lenis integration
      gsapRef.value = gsapInstance
      scrollTriggerRef.value = ScrollTriggerInstance

      setupResizeDebounce()

      isInitialized = true
      isReady.value = true
    } catch (error) {
      logger.error('Failed to initialize animations:', error)
      isEnabled.value = false
      isReady.value = true
    }
  }

  function setupResizeDebounce() {
    // ✅ Prevent duplicate listeners
    if (!ScrollTriggerInstance || resizeHandler) return

    // ✅ Store handler reference for cleanup
    resizeHandler = () => {
      if (resizeDebounceTimer) {
        clearTimeout(resizeDebounceTimer)
      }

      resizeDebounceTimer = setTimeout(() => {
        if (ScrollTriggerInstance) {
          ScrollTriggerInstance.refresh()
        }
      }, 250)
    }

    window.addEventListener('resize', resizeHandler, { passive: true })
  }

  /**
   * Create a scoped animation context
   *
   * @param scope - DOM element or selector to scope animations to
   * @returns Animation context with gsap, ScrollTrigger, and cleanup method
   */
  function createContext(scope?: Element | string | undefined): AnimationContext {
    if (!gsapInstance || !isEnabled.value) {
      return {
        gsap: null,
        ScrollTrigger: null,
        context: null,
        cleanup: () => {}
      }
    }

    const context = gsapInstance.context(() => {}, scope)
    activeContexts.add(context)

    return {
      gsap: gsapInstance,
      ScrollTrigger: ScrollTriggerInstance,
      context,
      cleanup: () => {
        try {
          // revert() already calls kill() internally - no need for both
          context.revert()
          activeContexts.delete(context)
        } catch (error) {
          logger.warn('Animation context cleanup error:', error)
        }
      }
    }
  }

  /**
   * Create a gsap.matchMedia() instance for responsive animations
   * Animations inside matchMedia auto-cleanup when conditions change
   *
   * @example
   * const { mm } = createMatchMedia()
   * if (mm) {
   *   mm.add({
   *     isDesktop: BREAKPOINTS.desktop,
   *     isMobile: BREAKPOINTS.mobile
   *   }, (context) => {
   *     const { isDesktop } = context.conditions
   *     if (isDesktop) {
   *       gsap.to('.el', { x: 100 })
   *     }
   *     return () => { // optional cleanup }
   *   })
   * }
   *
   * onUnmounted(() => mm?.cleanup())
   */
  function createMatchMedia(): MatchMediaInstance {
    if (!gsapInstance || !isEnabled.value) {
      return {
        mm: null,
        cleanup: () => {}
      }
    }

    const mm = gsapInstance.matchMedia()

    return {
      mm,
      cleanup: () => {
        try {
          mm.revert()
        } catch (error) {
          logger.warn('MatchMedia cleanup error:', error)
        }
      }
    }
  }

  function cleanup() {
    try {
      activeContexts.forEach(context => {
        try {
          // revert() already calls kill() internally
          context.revert()
        } catch (error) {
          logger.warn('Error cleaning up animation context:', error)
        }
      })
      activeContexts.clear()

      if (resizeDebounceTimer) {
        clearTimeout(resizeDebounceTimer)
        resizeDebounceTimer = null
      }

      // ✅ Remove resize listener properly
      if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler)
        resizeHandler = null
      }

      if (ScrollTriggerInstance) {
        ScrollTriggerInstance.getAll().forEach(st => st.kill())
      }
    } catch (error) {
      logger.error('Error during global animation cleanup:', error)
    }
  }

  return {
    isReady,
    isEnabled,
    initialize,
    createContext,
    createMatchMedia,
    cleanup,
    // Reactive refs for Lenis ↔ GSAP integration
    gsap: gsapRef,
    ScrollTrigger: scrollTriggerRef
  }
}
