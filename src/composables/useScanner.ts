import { ref, onUnmounted } from 'vue'
import { buildApiUrl, API_ENDPOINTS, getAuthHeaders } from '@/config/api'
import type { ScanRequest, ScanResponse, ScanStats, ScanLog } from '@/types'
import { logger } from '@/services/logger'

export function useScanner() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastScanResult = ref<ScanResponse | null>(null)

  // AbortController for request cancellation
  let abortController: AbortController | null = null

  function cancelPendingRequests() {
    if (abortController) {
      abortController.abort()
      abortController = null
    }
  }

  function createAbortController(): AbortController {
    cancelPendingRequests()
    abortController = new AbortController()
    return abortController
  }

  /**
   * Valider un ticket scanné
   * L'event_id est automatiquement détecté depuis le QR code (JWT)
   */
  async function validateTicket(qrData: string, eventId?: string): Promise<ScanResponse | null> {
    isLoading.value = true
    error.value = null
    lastScanResult.value = null

    const controller = createAbortController()

    try {
      // L'event_id est optionnel - le backend le détecte depuis le JWT
      const scanData: ScanRequest = {
        qr_data: qrData
      }

      // N'ajouter event_id que s'il est fourni (pour vérification croisée optionnelle)
      if (eventId) {
        scanData.event_id = eventId
      }

      const response = await fetch(buildApiUrl(API_ENDPOINTS.SCAN_VALIDATE), {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify(scanData),
        signal: controller.signal
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Erreur lors de la validation du ticket')
      }

      const result: ScanResponse = await response.json()
      lastScanResult.value = result

      logger.log('Scan result:', result)
      return result

    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return null
      }
      const message = err instanceof Error ? err.message : 'Erreur lors de la validation'
      error.value = message
      logger.error('Scan validation error:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Récupérer les statistiques de scan
   */
  async function getStats(eventId?: string): Promise<ScanStats | null> {
    if (!eventId) {
      return null  // Stats nécessitent un event_id
    }

    isLoading.value = true
    error.value = null

    const controller = createAbortController()

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.SCAN_STATS(eventId)), {
        credentials: 'include',
        headers: getAuthHeaders(),
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques')
      }

      const stats: ScanStats = await response.json()
      logger.log('Scan stats:', stats)
      return stats

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return null
      }
      const message = err instanceof Error ? err.message : 'Erreur lors de la récupération des statistiques'
      error.value = message
      logger.error('Stats fetch error:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Récupérer l'historique des scans
   * L'API retourne { scans: ScanLog[], total: number, ... }
   */
  async function getHistory(eventId?: string, limit = 50): Promise<ScanLog[] | null> {
    isLoading.value = true
    error.value = null

    const controller = createAbortController()

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.SCAN_HISTORY(eventId, limit)), {
        credentials: 'include',
        headers: getAuthHeaders(),
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'historique')
      }

      const data = await response.json()
      // L'API retourne { scans: [], total: number, limit: number, offset: number }
      const history: ScanLog[] = data.scans || data
      logger.log('Scan history:', history)
      return history

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return null
      }
      const message = err instanceof Error ? err.message : 'Erreur lors de la récupération de l\'historique'
      error.value = message
      logger.error('History fetch error:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Réinitialiser l'état
   */
  function reset() {
    cancelPendingRequests()
    error.value = null
    lastScanResult.value = null
  }

  // Cleanup on unmount
  onUnmounted(() => {
    cancelPendingRequests()
  })

  return {
    // État
    isLoading,
    error,
    lastScanResult,

    // Méthodes
    validateTicket,
    getStats,
    getHistory,
    reset,
    cancelPendingRequests
  }
}
