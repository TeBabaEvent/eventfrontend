import { ref } from 'vue'
import type { Toast } from '@/components/ui/ToastNotification.vue'
import { logger } from '@/services/logger'

interface ToastInstance {
  addToast: (message: string, type: Toast['type'], duration: number) => void
}

// Instance globale du toast
const toastInstance = ref<ToastInstance | null>(null)

export function useToast() {
  function setToastInstance(instance: ToastInstance) {
    toastInstance.value = instance
  }

  function showToast(
    message: string, 
    type: Toast['type'] = 'info', 
    duration = 5000
  ) {
    if (toastInstance.value) {
      return toastInstance.value.addToast(message, type, duration)
    } else {
      logger.warn('Toast instance not initialized')
      // Fallback vers alert en cas d'erreur
      if (type === 'error') {
        alert(message)
      }
    }
  }

  function success(message: string, duration = 5000) {
    return showToast(message, 'success', duration)
  }

  function error(message: string, duration = 7000) {
    return showToast(message, 'error', duration)
  }

  function warning(message: string, duration = 6000) {
    return showToast(message, 'warning', duration)
  }

  function info(message: string, duration = 5000) {
    return showToast(message, 'info', duration)
  }

  return {
    setToastInstance,
    showToast,
    success,
    error,
    warning,
    info
  }
}

