// Constantes de l'application Baba Event

export const APP_CONFIG = {
  name: 'Baba Event',
  description: 'Créateur d\'expériences culturelles albanaises inoubliables',
  version: '1.0.0',
  author: 'Baba Event Team',
  website: 'https://babaevent.com'
} as const

export const CONTACT_INFO = {
  email: 'baba.limited.event@gmail.com',
  phone: '+32 495 52 66 56',
  whatsapp: '+32495526656',
  address: 'Zemst',
  cities: ['Zemst']
} as const

export const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/Baba.limited.event/',
  instagram: 'https://www.instagram.com/baba.limited/',
  tiktok: 'https://www.tiktok.com/@baba.limited',
  youtube: 'https://www.youtube.com/@baba.limited-event'
} as const

export const NAVIGATION_ITEMS = [
  { id: 'home', label: 'Accueil', href: '#home' },
  { id: 'events', label: 'Événements', href: '#events' },
  { id: 'team', label: 'DJs', href: '#team' },
  { id: 'contact', label: 'Contact', href: '#contact' }
] as const

export const EVENT_CATEGORIES = {
  concert: { icon: 'fas fa-music' },
  festival: { icon: 'fas fa-star' },
  wedding: { icon: 'fas fa-heart' },
  party: { icon: 'fas fa-champagne-glasses' },
  vip: { icon: 'fas fa-crown' }
} as const

export const DJ_BADGES = {
  star: { icon: 'fas fa-star', class: 'badge--star' },
  fire: { icon: 'fas fa-fire', class: 'badge--fire' },
  premium: { icon: 'fas fa-crown', class: 'badge--premium' }
} as const

export const ANIMATION_DURATIONS = {
  fast: 200,
  normal: 300,
  slow: 500,
  slower: 800
} as const

export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1200
} as const

export const WHATSAPP_MESSAGES = {
  general: 'Bonjour, je souhaite des informations sur vos événements',
  event: 'Bonjour, je souhaite réserver pour cet événement',
  organize: 'Bonjour, je souhaite organiser un événement',
  contact: 'Bonjour, je souhaite discuter d\'un projet d\'événement'
} as const

// URLs des images par défaut
export const DEFAULT_IMAGES = {
  event: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=2070',
  dj: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?q=80&w=2070',
  placeholder: 'https://via.placeholder.com/400x300?text=Baba+Event'
} as const

export const SEO_CONFIG = {
  defaultTitle: 'Baba Event - Événements Culturels Albanais Premium',
  titleTemplate: '%s | Baba Event',
  defaultDescription: 'Créateur d\'expériences culturelles albanaises inoubliables : concerts, festivals, soirées exclusives et mariages d\'exception à travers l\'Europe.',
  keywords: [
    'événements albanais',
    'concerts albanais',
    'festivals culturels',
    'mariages albanais',
    'soirées VIP',
    'DJ albanais',
    'musique albanaise',
    'événements Paris',
    'événements Bruxelles',
    'événements Genève'
  ]
} as const
