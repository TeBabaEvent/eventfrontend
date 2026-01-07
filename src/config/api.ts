// Configuration centralisée de l'API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Configuration des endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',
  ME: '/api/auth/me',

  // Events
  EVENTS: '/api/events',
  EVENT_BY_ID: (id: string) => `/api/events/${id}`,
  UPCOMING_EVENTS: '/api/events/upcoming',
  PAST_EVENTS: '/api/events/past',

  // Artists
  ARTISTS: '/api/artists',
  ARTIST_BY_ID: (id: string) => `/api/artists/${id}`,

  // Packs
  PACKS: '/api/packs',
  PACK_BY_ID: (id: string) => `/api/packs/${id}`,

  // Checkout & Payments
  CHECKOUT_CREATE: '/api/checkout/create-session',
  CART_CHECKOUT_CREATE: '/api/checkout/create-cart-session',
  ORDER_BY_NUMBER: (orderNumber: string) => `/api/checkout/order/${orderNumber}`,

  // Scan & Validation
  SCAN_VALIDATE: '/api/scan/validate',
  SCAN_STATS: (eventId: string) => `/api/scan/stats/${eventId}`,
  SCAN_HISTORY: (eventId?: string, limit?: number) => {
    const params = new URLSearchParams()
    if (eventId) params.append('event_id', eventId)
    if (limit) params.append('limit', limit.toString())
    return `/api/scan/history?${params.toString()}`
  },

  // Admin - Orders
  ADMIN_ORDERS: '/api/admin/orders',
  ADMIN_ORDER_BY_ID: (id: string) => `/api/admin/orders/${id}`,
  ADMIN_ORDER_REFUND: (id: string) => `/api/admin/orders/${id}/refund`,
  ADMIN_ORDER_RESEND_EMAIL: (id: string) => `/api/admin/orders/${id}/resend-email`,

  // Admin - Stats
  ADMIN_GLOBAL_STATS: '/api/admin/stats',
  ADMIN_EVENT_STATS: (eventId: string) => `/api/admin/stats/${eventId}`,

  // Admin - Users
  ADMIN_USERS: '/api/admin/users',
  ADMIN_USER_BY_ID: (id: string) => `/api/admin/users/${id}`
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

