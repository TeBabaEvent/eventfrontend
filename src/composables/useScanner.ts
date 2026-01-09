import { ref, onUnmounted } from 'vue'
import { buildApiUrl, API_ENDPOINTS, getAuthHeaders } from '@/config/api'
import type { ScanRequest, ScanResponse, ScanStats, ScanLog } from '@/types'
import { useAuthStore } from '@/stores/auth'

// Production-safe logging for scanner
const log = (...args: unknown[]) => console.log('[Scanner API]', ...args)
const logError = (...args: unknown[]) => console.error('[Scanner API]', ...args)

export function useScanner() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastScanResult = ref<ScanResponse | null>(null)
  const authError = ref(false) // Flag pour erreur 401

  // AbortController for request cancellation
  let abortController: AbortController | null = null
  const authStore = useAuthStore()

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
    const startTime = Date.now()
    log('validateTicket called, qrData length:', qrData.length)

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

      const url = buildApiUrl(API_ENDPOINTS.SCAN_VALIDATE)
      log('POST', url)

      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify(scanData),
        signal: controller.signal
      })

      const duration = Date.now() - startTime
      log('Response:', response.status, response.statusText, `(${duration}ms)`)

      if (!response.ok) {
        // Handle 401 - try refresh then retry once
        if (response.status === 401) {
          log('401 received, attempting token refresh...')
          const refreshed = await authStore.refreshToken()
          log('Token refresh result:', refreshed)

          if (refreshed) {
            // Retry the request with new token
            log('Retrying request after token refresh...')
            const retryResponse = await fetch(url, {
              method: 'POST',
              credentials: 'include',
              headers: getAuthHeaders(),
              body: JSON.stringify(scanData),
              signal: controller.signal
            })
            log('Retry response:', retryResponse.status)

            if (retryResponse.ok) {
              const result: ScanResponse = await retryResponse.json()
              log('Retry success:', result.valid, result.result)
              lastScanResult.value = result
              return result
            }
          }
          // Refresh failed or retry failed - set auth error flag
          logError('Auth failed after refresh attempt')
          authError.value = true
          throw new Error('Session expirée - veuillez vous reconnecter')
        }
        const errorData = await response.json().catch(() => ({}))
        logError('Error response:', response.status, errorData)
        throw new Error(errorData.detail || 'Erreur lors de la validation du ticket')
      }

      const result: ScanResponse = await response.json()
      lastScanResult.value = result

      log('Success:', result.valid, result.result, result.holder || '')
      return result

    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        log('Request aborted')
        return null
      }
      const message = err instanceof Error ? err.message : 'Erreur lors de la validation'
      error.value = message
      logError('Exception:', err)
      return null
    } finally {
      isLoading.value = false
      log('validateTicket completed in', Date.now() - startTime, 'ms')
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
      const url = buildApiUrl(API_ENDPOINTS.SCAN_STATS(eventId))
      log('GET stats:', url)

      const response = await fetch(url, {
        credentials: 'include',
        headers: getAuthHeaders(),
        signal: controller.signal
      })

      log('Stats response:', response.status)

      if (!response.ok) {
        if (response.status === 401) {
          logError('Stats: 401 unauthorized')
          authError.value = true
          return null
        }
        throw new Error('Erreur lors de la récupération des statistiques')
      }

      const stats: ScanStats = await response.json()
      log('Stats:', stats)
      return stats

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return null
      }
      const message = err instanceof Error ? err.message : 'Erreur lors de la récupération des statistiques'
      error.value = message
      logError('Stats error:', err)
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
      const url = buildApiUrl(API_ENDPOINTS.SCAN_HISTORY(eventId, limit))
      log('GET history:', url)

      const response = await fetch(url, {
        credentials: 'include',
        headers: getAuthHeaders(),
        signal: controller.signal
      })

      log('History response:', response.status)

      if (!response.ok) {
        if (response.status === 401) {
          logError('History: 401 unauthorized')
          authError.value = true
          return null
        }
        throw new Error('Erreur lors de la récupération de l\'historique')
      }

      const data = await response.json()
      // L'API retourne { scans: [], total: number, limit: number, offset: number }
      const history: ScanLog[] = data.scans || data
      log('History count:', history.length)
      return history

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return null
      }
      const message = err instanceof Error ? err.message : 'Erreur lors de la récupération de l\'historique'
      error.value = message
      logError('History error:', err)
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
    authError, // Flag pour détecter session expirée

    // Méthodes
    validateTicket,
    getStats,
    getHistory,
    reset,
    cancelPendingRequests
  }
}
