// Service API pour Baba Event

import type { Event, Artist, DJ, GalleryItem } from '@/types'
import { buildApiUrl, API_ENDPOINTS } from '@/config/api'

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
        console.error('Network error:', networkError)
        throw networkError
      }
      
      // Si c'est déjà notre ApiError, on la propage
      console.error('API request failed:', error)
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
      console.warn('API call failed, using mock data:', error)
      return getMockEvents()
    }
  }

  async getEventById(id: string): Promise<Event> {
    try {
      return await apiService.getEventById(id)
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
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
      console.warn('API call failed, using mock data:', error)
      return getMockDJs()
    }
  }

  async getGallery(): Promise<GalleryItem[]> {
    try {
      return await apiService.getGalleryItems()
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return getMockGallery()
    }
  }
}

export const api = new ApiWithFallback()

// Mock data deprecated - kept only for reference (TODO: remove after backend is stable)
const oldMockData = {
  events: [
    {
      id: '1',
      title: 'Nata Shqiptare 2024',
      description: 'La plus grande soirée albanaise de l\'année avec des artistes internationaux',
      category: 'concert' as const,
      date: '2024-12-15',
      time: '21:00',
      location: 'Palais des Congrès',
      city: 'Paris',
      price: { from: 35, currency: '€' },
      image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=2070',
      featured: true,
      tags: ['concert', 'albanais', 'live'],
      capacity: 2000,
      availableTickets: 150,
      whatsappLink: 'https://wa.me/33123456789?text=Bonjour,%20je%20souhaite%20réserver%20pour%20Nata%20Shqiptare%202024'
    },
    {
      id: '2',
      title: 'Festival Folklorique',
      description: 'Traditions, danses et gastronomie authentique',
      category: 'festival' as const,
      date: '2024-12-22',
      time: '15:00',
      location: 'Centre Culturel',
      city: 'Bruxelles',
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070',
      featured: false,
      tags: ['festival', 'culture', 'gratuit'],
      whatsappLink: 'https://wa.me/33123456789?text=Bonjour,%20je%20souhaite%20des%20informations%20sur%20le%20Festival%20Folklorique'
    },
    {
      id: '3',
      title: 'Nouvel An 2025',
      description: 'Gala premium avec DJ international',
      category: 'party' as const,
      date: '2024-12-31',
      time: '22:00',
      location: 'Grand Hôtel',
      city: 'Genève',
      price: { from: 120, currency: '€' },
      image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=2070',
      featured: true,
      tags: ['réveillon', 'vip', 'gala'],
      whatsappLink: 'https://wa.me/33123456789?text=Bonjour,%20je%20souhaite%20réserver%20pour%20le%20Nouvel%20An%202025'
    }
  ] as Event[],

  djs: [
    {
      id: '1',
      name: 'DJ Ardit',
      role: 'Resident DJ',
      description: 'Spécialiste de la musique albanaise moderne et des remixes électro',
      image: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?q=80&w=2070',
      image_url: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?q=80&w=2070',
      events_count: 200,
      badge: 'star' as const
    },
    {
      id: '2',
      name: 'DJ Lori',
      role: 'Club DJ',
      description: 'Expert en ambiances festives et hits albanais actuels',
      image: 'https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?q=80&w=2076',
      image_url: 'https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?q=80&w=2076',
      events_count: 150,
      badge: 'fire' as const
    },
    {
      id: '3',
      name: 'DJ Enca',
      role: 'Live Performer',
      description: 'Mixage live et performances visuelles pour événements premium',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2070',
      image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2070',
      events_count: 100,
      badge: 'premium' as const
    }
  ] as DJ[],

  gallery: [
    {
      id: '1',
      title: 'Concert Albanais 2024',
      category: 'Concert Live',
      image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=2070',
      type: 'concert' as const,
      date: '2024-10-15'
    },
    {
      id: '2',
      title: 'Festival Culturel',
      category: 'Événement',
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070',
      type: 'festival' as const,
      date: '2024-09-20'
    },
    {
      id: '3',
      title: 'Mariage Premium',
      category: 'Cérémonie',
      image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=2069',
      type: 'wedding' as const,
      date: '2024-08-12'
    }
  ] as GalleryItem[]
}

// Export pour legacy support (deprecated)
export { oldMockData }
