// Configuration centralisée de l'API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Configuration des endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',
  
  // Events
  EVENTS: '/api/events',
  EVENT_BY_ID: (id: string) => `/api/events/${id}`,
  FEATURED_EVENTS: '/api/events/featured',
  
  // Artists
  ARTISTS: '/api/artists',
  ARTIST_BY_ID: (id: string) => `/api/artists/${id}`,
  
  // Packs
  PACKS: '/api/packs',
  PACK_BY_ID: (id: string) => `/api/packs/${id}`,
  
  // Gallery
  GALLERY: '/api/gallery',
  GALLERY_ITEM: (id: string) => `/api/gallery/${id}`,
  
  // Contact & Newsletter
  CONTACT: '/api/contact',
  NEWSLETTER_SUBSCRIBE: '/api/newsletter/subscribe'
} as const

// Helper pour construire une URL complète
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`
}

// Helper pour les headers d'authentification
export const getAuthHeaders = (token?: string | null): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

