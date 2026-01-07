import { ref, onUnmounted } from 'vue'
import { logger } from '@/services/logger'

export interface PerformanceMetrics {
  lcp: number | null
  fid: number | null
  cls: number | null
  fcp: number | null
  ttfb: number | null
}

const metrics = ref<PerformanceMetrics>({
  lcp: null,
  fid: null,
  cls: null,
  fcp: null,
  ttfb: null
})

/**
 * Performance monitoring composable for Core Web Vitals
 *
 * Tracks:
 * - LCP (Largest Contentful Paint) - Visual loading performance
 * - FID (First Input Delay) - Interactivity responsiveness
 * - CLS (Cumulative Layout Shift) - Visual stability
 * - FCP (First Contentful Paint) - Initial render speed
 * - TTFB (Time to First Byte) - Server response time
 *
 * Logs metrics to console in development mode only
 *
 * @example
 * const { startMonitoring, stopMonitoring, metrics } = usePerformance()
 *
 * onMounted(() => {
 *   startMonitoring()
 * })
 *
 * onUnmounted(() => {
 *   stopMonitoring()
 * })
 */
export function usePerformance() {
  // Instance-scoped observers array to prevent memory leaks
  let observers: PerformanceObserver[] = []

  function observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number }

        const lcpValue = lastEntry.renderTime || lastEntry.loadTime || 0
        metrics.value.lcp = lcpValue
        logger.info(`LCP: ${lcpValue.toFixed(2)}ms`)
      })

      observer.observe({ entryTypes: ['largest-contentful-paint'] })
      observers.push(observer)
    } catch (error) {
      logger.warn('LCP observation not supported:', error)
    }
  }

  function observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          const fidEntry = entry as PerformanceEntry & { processingStart?: number }
          const fidValue = fidEntry.processingStart ? fidEntry.processingStart - entry.startTime : 0
          metrics.value.fid = fidValue
          logger.info(`FID: ${fidValue.toFixed(2)}ms`)
        })
      })

      observer.observe({ entryTypes: ['first-input'] })
      observers.push(observer)
    } catch (error) {
      logger.warn('FID observation not supported:', error)
    }
  }

  function observeCLS() {
    try {
      let clsValue = 0
      let lastLoggedCls = 0
      let clsLogTimeout: ReturnType<typeof setTimeout> | null = null

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number }
          if (!layoutShiftEntry.hadRecentInput && layoutShiftEntry.value) {
            clsValue += layoutShiftEntry.value
            metrics.value.cls = clsValue

            // Debounce CLS logging - only log when stable (no changes for 1s)
            // and only if value changed significantly (> 0.01)
            if (clsLogTimeout) clearTimeout(clsLogTimeout)
            clsLogTimeout = setTimeout(() => {
              if (Math.abs(clsValue - lastLoggedCls) > 0.01) {
                logger.info(`CLS: ${clsValue.toFixed(4)}`)
                lastLoggedCls = clsValue
              }
            }, 1000)
          }
        })
      })

      observer.observe({ entryTypes: ['layout-shift'] })
      observers.push(observer)
    } catch (error) {
      logger.warn('CLS observation not supported:', error)
    }
  }

  function observeFCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            metrics.value.fcp = entry.startTime
            logger.info(`FCP: ${entry.startTime.toFixed(2)}ms`)
          }
        })
      })

      observer.observe({ entryTypes: ['paint'] })
      observers.push(observer)
    } catch (error) {
      logger.warn('FCP observation not supported:', error)
    }
  }

  function observeTTFB() {
    try {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

      if (navEntry) {
        const ttfbValue = navEntry.responseStart - navEntry.requestStart
        metrics.value.ttfb = ttfbValue
        logger.info(`TTFB: ${ttfbValue.toFixed(2)}ms`)
      }
    } catch (error) {
      logger.warn('TTFB measurement not supported:', error)
    }
  }

  function startMonitoring() {
    if (typeof window === 'undefined' || !window.PerformanceObserver) {
      logger.warn('PerformanceObserver API not available')
      return
    }

    observeLCP()
    observeFID()
    observeCLS()
    observeFCP()
    observeTTFB()
    logger.info('Performance monitoring started')
  }

  function stopMonitoring() {
    observers.forEach(observer => {
      try {
        observer.disconnect()
      } catch (error) {
        logger.warn('Error disconnecting performance observer:', error)
      }
    })
    observers = []
    logger.info('Performance monitoring stopped')
  }

  function logMetricsSummary() {
    logger.info('=== Performance Metrics Summary ===')
    logger.info(`LCP: ${metrics.value.lcp ? `${metrics.value.lcp.toFixed(2)}ms` : 'N/A'}`)
    logger.info(`FID: ${metrics.value.fid ? `${metrics.value.fid.toFixed(2)}ms` : 'N/A'}`)
    logger.info(`CLS: ${metrics.value.cls ? metrics.value.cls.toFixed(4) : 'N/A'}`)
    logger.info(`FCP: ${metrics.value.fcp ? `${metrics.value.fcp.toFixed(2)}ms` : 'N/A'}`)
    logger.info(`TTFB: ${metrics.value.ttfb ? `${metrics.value.ttfb.toFixed(2)}ms` : 'N/A'}`)
    logger.info('===================================')
  }

  onUnmounted(() => {
    stopMonitoring()
  })

  return {
    metrics,
    startMonitoring,
    stopMonitoring,
    logMetricsSummary
  }
}
