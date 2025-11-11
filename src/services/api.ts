// Service API pour Baba Event

import type { Event, Artist, DJ, GalleryItem } from '@/types'
import { buildApiUrl, API_ENDPOINTS } from '@/config/api'
import { logger } from './logger'

// Type pour les erreurs API
export interface ApiError {
  message: string
  status?: number
  details?: any
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = buildApiUrl(endpoint)
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    }

    try {
      const response = await fetch(url, { ...defaultOptions, ...options })
      
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
    }
  }

  // Événements
  async getEvents(): Promise<Event[]> {
    return this.request<Event[]>(API_ENDPOINTS.EVENTS)
  }

  async getEventById(id: string): Promise<Event> {
    return this.request<Event>(API_ENDPOINTS.EVENT_BY_ID(id))
  }
  
  // Alias pour compatibilité
  async getEvent(id: string): Promise<Event> {
    return this.getEventById(id)
  }

  async getFeaturedEvents(): Promise<Event[]> {
    return this.request<Event[]>(API_ENDPOINTS.FEATURED_EVENTS)
  }

  // Artists
  async getArtists(): Promise<Artist[]> {
    return this.request<Artist[]>(API_ENDPOINTS.ARTISTS)
  }

  async getWebsiteArtists(): Promise<Artist[]> {
    const artists = await this.getArtists()
    return artists.filter(artist => artist.show_on_website !== false)
  }

  async getArtist(id: string): Promise<DJ> {
    return this.request<DJ>(API_ENDPOINTS.ARTIST_BY_ID(id))
  }
  
  // Alias pour compatibilité (deprecated - use getArtists/getArtist)
  getDJs = this.getArtists.bind(this)
  getDJ = this.getArtist.bind(this)

  // Galerie
  async getGalleryItems(): Promise<GalleryItem[]> {
    return this.request<GalleryItem[]>(API_ENDPOINTS.GALLERY)
  }

  async getGalleryItem(id: string): Promise<GalleryItem> {
    return this.request<GalleryItem>(API_ENDPOINTS.GALLERY_ITEM(id))
  }

  // Contact
  async sendContactMessage(data: {
    name: string
    email: string
    phone?: string
    message: string
    eventType?: string
  }): Promise<{ success: boolean; message: string }> {
    return this.request(API_ENDPOINTS.CONTACT, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Newsletter
  async subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
    return this.request(API_ENDPOINTS.NEWSLETTER_SUBSCRIBE, {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }
}

// Instance singleton
export const apiService = new ApiService()

// Import des données mockées traduites pour fallback
import { getMockEvents, getMockDJs, getMockGallery } from './mockData'

// API wrapper avec fallback automatique vers mock data en cas d'erreur
class ApiWithFallback {
  async getEvents(): Promise<Event[]> {
    try {
      return await apiService.getEvents()
    } catch (error) {
      logger.warn('API call failed, using mock data:', error)
      return getMockEvents()
    }
  }

  async getEventById(id: string): Promise<Event> {
    try {
      return await apiService.getEventById(id)
    } catch (error) {
      logger.warn('API call failed, using mock data:', error)
      const events = getMockEvents()
      const event = events.find(e => e.id === id)
      if (!event) throw new Error('Event not found')
      return event
    }
  }

  async getArtists(): Promise<DJ[]> {
    try {
      return await apiService.getArtists()
    } catch (error) {
      logger.warn('API call failed, using mock data:', error)
      return getMockDJs()
    }
  }

  async getGallery(): Promise<GalleryItem[]> {
    try {
      return await apiService.getGalleryItems()
    } catch (error) {
      logger.warn('API call failed, using mock data:', error)
      return getMockGallery()
    }
  }
}

export const api = new ApiWithFallback()
