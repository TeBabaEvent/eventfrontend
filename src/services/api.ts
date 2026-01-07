// Service API pour Baba Event

import type { Event, Artist } from '@/types'
import { buildApiUrl, API_ENDPOINTS } from '@/config/api'
import { logger } from './logger'

// Type pour les erreurs API
export interface ApiError {
  message: string
  status?: number
  details?: unknown
  aborted?: boolean
}

// Options étendues pour les requêtes avec support AbortSignal
interface RequestOptions extends Omit<RequestInit, 'signal'> {
  signal?: AbortSignal
  timeout?: number // Timeout en ms (défaut: 30s)
}

class ApiService {
  private readonly DEFAULT_TIMEOUT = 30000 // 30 secondes

  /**
   * Crée un AbortController avec timeout automatique
   * @param timeout - Timeout en millisecondes
   * @returns AbortController
   */
  createAbortController(timeout?: number): AbortController {
    const controller = new AbortController()
    const timeoutMs = timeout ?? this.DEFAULT_TIMEOUT

    setTimeout(() => {
      controller.abort(new DOMException('Request timeout', 'TimeoutError'))
    }, timeoutMs)

    return controller
  }

  private async request<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = buildApiUrl(endpoint)

    const defaultOptions: RequestInit = {
      credentials: 'include', // ✅ Always include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
    }

    // Merge options et ajouter signal si présent
    const { signal, timeout, ...restOptions } = options ?? {}

    // Créer un signal avec timeout si pas de signal fourni mais timeout demandé
    let effectiveSignal = signal
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    if (!signal && timeout) {
      const controller = new AbortController()
      effectiveSignal = controller.signal
      timeoutId = setTimeout(() => {
        controller.abort(new DOMException('Request timeout', 'TimeoutError'))
      }, timeout)
    }

    try {
      const response = await fetch(url, {
        ...defaultOptions,
        ...restOptions,
        signal: effectiveSignal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const error: ApiError = {
          message: errorData.message || `Erreur HTTP: ${response.status}`,
          status: response.status,
          details: errorData
        }
        throw error
      }

      return await response.json()
    } catch (error) {
      // Requête annulée (AbortController)
      if (error instanceof DOMException && error.name === 'AbortError') {
        const abortError: ApiError = {
          message: 'Requête annulée',
          aborted: true,
          details: error.message
        }
        // Ne pas logger les abort intentionnels
        throw abortError
      }

      // Si c'est une erreur réseau ou autre erreur non-HTTP
      if (error instanceof TypeError) {
        const networkError: ApiError = {
          message: 'Erreur de connexion au serveur',
          details: error.message
        }
        logger.error('Network error:', networkError)
        throw networkError
      }

      // Si c'est déjà notre ApiError, on la propage
      logger.error('API request failed:', error)
      throw error
    } finally {
      // Nettoyer le timeout si on en a créé un
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }

  // Événements
  async getEvents(signal?: AbortSignal): Promise<Event[]> {
    return this.request<Event[]>(API_ENDPOINTS.EVENTS, { signal })
  }

  async getEventById(id: string, signal?: AbortSignal): Promise<Event> {
    return this.request<Event>(API_ENDPOINTS.EVENT_BY_ID(id), { signal })
  }

  // Alias pour compatibilité
  async getEvent(id: string, signal?: AbortSignal): Promise<Event> {
    return this.getEventById(id, signal)
  }

  async getUpcomingEvents(signal?: AbortSignal): Promise<Event[]> {
    return this.request<Event[]>(API_ENDPOINTS.UPCOMING_EVENTS, { signal })
  }

  async getPastEvents(limit = 12, offset = 0, signal?: AbortSignal): Promise<{ items: Event[], total: number, has_more: boolean }> {
    return this.request<{ items: Event[], total: number, has_more: boolean }>(
      `${API_ENDPOINTS.PAST_EVENTS}?limit=${limit}&offset=${offset}`,
      { signal }
    )
  }

  // Artists
  async getArtists(signal?: AbortSignal): Promise<Artist[]> {
    return this.request<Artist[]>(API_ENDPOINTS.ARTISTS, { signal })
  }

  async getWebsiteArtists(signal?: AbortSignal): Promise<Artist[]> {
    const artists = await this.getArtists(signal)
    return artists.filter(artist => artist.show_on_website !== false)
  }

  async getArtist(id: string, signal?: AbortSignal): Promise<Artist> {
    return this.request<Artist>(API_ENDPOINTS.ARTIST_BY_ID(id), { signal })
  }
}

// Instance singleton - exportée directement comme 'api' pour usage simplifié
export const api = new ApiService()

// Export également comme apiService pour compatibilité
export const apiService = api
