// Types principaux de l'application Baba Event

export interface Event {
  id: string
  title: string
  title_translations?: {
    fr?: string
    en?: string
    nl?: string
    sq?: string
  }
  description: string
  description_translations?: {
    fr?: string
    en?: string
    nl?: string
    sq?: string
  }
  category: EventCategory
  date: string
  time: string
  location: string
  city: string
  address?: string
  maps_embed_url?: string
  price?: {
    from: number
    currency: string
  }
  image?: string
  image_url?: string
  featured?: boolean
  status?: 'upcoming' | 'past' | 'cancelled'
  tags?: string[]
  capacity?: number
  availableTickets?: number
  whatsappLink?: string
  artists?: Artist[]
  packs?: Pack[]
  created_at?: string
  updated_at?: string
}

export interface Pack {
  id: string
  name: string
  name_translations?: {
    fr?: string
    en?: string
    nl?: string
    sq?: string
  }
  type: 'standard' | 'premium' | 'vip'
  description?: string
  description_translations?: {
    fr?: string
    en?: string
    nl?: string
    sq?: string
  }
  price: number
  currency: string
  unit?: string
  features: string[]
  features_translations?: {
    fr?: string[]
    en?: string[]
    nl?: string[]
    sq?: string[]
  }
  is_active: boolean
  created_at?: string
  updated_at?: string
  is_soldout?: boolean
}

export interface Artist {
  id: string
  name: string
  role?: string
  role_translations?: {
    fr?: string
    en?: string
    nl?: string
    sq?: string
  }
  description?: string
  description_translations?: {
    fr?: string
    en?: string
    nl?: string
    sq?: string
  }
  image_url?: string
  events_count?: number
  instagram?: string
  badge?: 'star' | 'fire' | 'premium'
  show_on_website?: boolean
  created_at?: string
  updated_at?: string
  // Event-specific properties (from EventArtist relation)
  start_time?: string
  end_time?: string
  order?: number
}

// Alias pour compatibilité (DJ est essentiellement un Artist)
export interface DJ extends Artist {
  // Propriétés legacy pour compatibilité avec ancien code
  image?: string // Deprecated: use image_url instead
  eventsCount?: number // Deprecated: use events_count instead
}

export interface GalleryItem {
  id: string
  title: string
  category: string
  image: string
  type: 'concert' | 'festival' | 'wedding' | 'party' | 'other'
  date?: string
}

export interface ContactInfo {
  email: string
  phone: string
  whatsapp: string
  address: string
  cities: string[]
}

export interface SocialLinks {
  facebook?: string
  instagram?: string
  tiktok?: string
  youtube?: string
}

export type EventCategory = 'concert' | 'festival' | 'wedding' | 'party' | 'vip'

export type Theme = 'light' | 'dark'

export interface AppState {
  theme: Theme
  isMenuOpen: boolean
  currentSection: string
  isLoading: boolean
}

// Types pour les animations
export interface AnimationConfig {
  duration: number
  delay?: number
  easing?: string
}

// Types pour les composants UI
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  disabled?: boolean
  icon?: string
  iconPosition?: 'left' | 'right'
  tag?: string
}

export interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: 'none' | 'small' | 'medium' | 'large'
  hoverable?: boolean
}
