import { onUnmounted } from 'vue'

/**
 * Centralized scroll lock management with reference counting
 *
 * This composable manages body scroll locking across multiple components
 * (modals, drawers, menus) using a reference counter to prevent conflicts.
 *
 * When multiple components try to lock/unlock scroll simultaneously,
 * the body only unlocks when ALL components have released their locks.
 *
 * @example
 * const { lock, unlock } = useScrollLock()
 *
 * // When opening modal
 * lock()
 *
 * // When closing modal
 * unlock()
 *
 * // Auto-cleanup on unmount is handled automatically
 */

let lockCount = 0
let originalOverflow = ''
let originalPaddingRight = ''

// Track which component instances have active locks for auto-cleanup
const activeLocks = new WeakMap<object, boolean>()

function getScrollbarWidth(): number {
  return window.innerWidth - document.documentElement.clientWidth
}

function lockBody(): void {
  if (lockCount === 0) {
    // Save original styles
    originalOverflow = document.body.style.overflow
    originalPaddingRight = document.body.style.paddingRight

    // Get scrollbar width before hiding it
    const scrollbarWidth = getScrollbarWidth()

    // Lock scroll
    document.body.style.overflow = 'hidden'

    // Prevent layout shift by compensating for scrollbar width
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }
  }
  lockCount++
}

function unlockBody(): void {
  lockCount = Math.max(0, lockCount - 1)

  if (lockCount === 0) {
    // Restore original styles
    document.body.style.overflow = originalOverflow
    document.body.style.paddingRight = originalPaddingRight
  }
}

export function useScrollLock() {
  // Create a unique key for this component instance
  const instanceKey = {}
  let isLocked = false

  /**
   * Lock body scroll
   * Safe to call multiple times - only locks once per instance
   */
  function lock(): void {
    if (!isLocked) {
      isLocked = true
      activeLocks.set(instanceKey, true)
      lockBody()
    }
  }

  /**
   * Unlock body scroll
   * Safe to call multiple times - only unlocks if previously locked
   */
  function unlock(): void {
    if (isLocked) {
      isLocked = false
      activeLocks.delete(instanceKey)
      unlockBody()
    }
  }

  // Auto-cleanup when component unmounts
  onUnmounted(() => {
    unlock()
  })

  return {
    lock,
    unlock,
    /**
     * Check if this instance currently has a lock
     */
    get isLocked(): boolean {
      return isLocked
    }
  }
}

/**
 * Force reset all scroll locks (use with caution)
 * Only use this for debugging or error recovery
 */
export function forceResetScrollLocks(): void {
  lockCount = 0
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
}
