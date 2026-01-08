// Types principaux de l'application Baba Event

export interface Event {
  id: string
  slug?: string  // URL-friendly slug for SEO
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
  youtube_shorts_url?: string
  instagram_reels_url?: string
  status?: 'upcoming' | 'past' | 'cancelled'
  featured?: boolean
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

/**
 * @deprecated Utilisez `Artist` à la place. Ce type sera supprimé dans une version future.
 * DJ est maintenant un alias de Artist pour la rétrocompatibilité.
 */
export type DJ = Artist

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

// Types pour le système de paiement
export interface CheckoutData {
  event_id: string
  pack_id: string
  quantity: number
  customer_name: string
  customer_email: string
  customer_phone?: string
}

export interface CheckoutResponse {
  order_number: string
  pay_url: string
  paypal_order_id?: string
}

// Types pour le checkout multi-pack
export interface CartCheckoutData {
  items: Array<{
    event_id: string
    pack_id: string
    quantity: number
  }>
  customer_name: string
  customer_email: string
  customer_phone?: string
  payment_method?: 'online' | 'cash'
}

export interface CartCheckoutResponse {
  order_number: string
  pay_url: string
  amount: number
  total_items: number
  payment_method: 'online' | 'cash'
  is_pending_cash: boolean
  paypal_order_id?: string
}

export interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  event_id: string
  event_slug?: string  // URL-friendly slug for navigation
  /** @deprecated Legacy single-pack only */
  pack_id?: string
  /** @deprecated Use pack_display instead */
  pack_name?: string
  /** Multi-pack formatted display (e.g., "VIP x2, Standard x3") */
  pack_display?: string
  /** Structured pack breakdown for detailed views */
  pack_items?: PackItemSummary[]
  /** @deprecated Use total_quantity instead */
  quantity?: number
  /** Total tickets across all packs */
  total_quantity?: number
  amount: number // En centimes
  status: 'pending' | 'pending_cash' | 'completed' | 'failed' | 'refunded' | 'cancelled'
  payment_method?: 'online' | 'cash'
  ccv_reference?: string
  paypal_order_id?: string
  mollie_payment_id?: string  // Legacy
  created_at: string
  paid_at?: string
  event?: Event
  pack?: Pack
  tickets?: Ticket[]
}

export interface Ticket {
  id: string
  ticket_code: string
  holder_name: string
  holder_email?: string
  status: 'valid' | 'used' | 'cancelled' | 'expired'
  scanned_at?: string
  qr_data: string
}

// Types pour le système de scan
export interface ScanRequest {
  qr_data: string
  event_id?: string  // Optionnel - détecté automatiquement depuis le QR code
}

export interface ScanResponse {
  /** True si le scan a réussi (entrée validée) */
  valid: boolean
  /** Résultat du scan: success, already_used, invalid, cancelled, expired, wrong_event, error */
  result: 'success' | 'already_used' | 'invalid' | 'cancelled' | 'expired' | 'wrong_event' | 'error'
  /** Message à afficher au steward */
  message: string
  /** Nom du titulaire du billet */
  holder?: string
  /** Code du ticket (BABA-XXXXXXXX) */
  ticket_code?: string
  /** Type de pack (VIP, Standard, etc.) */
  pack_name?: string
  /** Heure du scan (ISO string) */
  scanned_at?: string
  /** ID de l'événement détecté depuis le QR code */
  event_id?: string
  /** Nom de l'événement détecté depuis le QR code */
  event_name?: string
}

export interface ScanLog {
  id: string
  ticket_code?: string
  holder?: string
  event_id: string
  event_name?: string
  result: 'success' | 'already_used' | 'invalid' | 'cancelled' | 'expired' | 'wrong_event'
  scanned_at: string
  steward_name?: string
}

export interface ScanStats {
  /** ID de l'événement */
  event_id: string
  /** Nom de l'événement */
  event_name: string
  /** Nombre total de tickets pour cet événement */
  total_tickets: number
  /** Nombre de tickets scannés (status = used) */
  scanned_tickets: number
  /** Taux de scan en pourcentage */
  scan_rate: number
  /** Résultats par type */
  results_by_type: Record<string, number>
  /** Scans par heure (pour graphiques) */
  scans_by_hour: Record<number, number>
  /** Nombre de scans réussis */
  success_count: number
  /** Nombre de scans "déjà utilisé" */
  already_used_count: number
  /** Nombre de scans invalides */
  invalid_count: number
}

export interface User {
  id: string
  username: string
  email: string
  name: string
  role: 'admin' | 'steward' | 'super_admin'
  phone: string | null
  is_active: boolean
  created_at: string
  last_login: string | null
}

// ============== ADMIN - ORDERS ==============

export interface PackItemSummary {
  /** Pack name - backend sends as 'name' */
  name: string
  quantity: number
  price: number
}

export interface OrderListItem {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  event_id: string
  event_title: string
  /** @deprecated Use pack_display instead */
  pack_name: string
  /** Multi-pack formatted display (e.g., "VIP x2, Standard x3") */
  pack_display: string
  /** Structured pack breakdown for detailed views */
  pack_items: PackItemSummary[]
  /** @deprecated Use total_quantity instead */
  quantity: number
  /** Total tickets across all packs */
  total_quantity: number
  amount: number // En EUR
  status: 'pending' | 'pending_cash' | 'completed' | 'failed' | 'refunded' | 'cancelled'
  payment_method?: 'online' | 'cash'
  ccv_reference?: string
  paypal_order_id?: string
  mollie_payment_id?: string  // Legacy
  created_at: string
  paid_at?: string
}

export interface TicketDetail {
  id: string
  ticket_code: string
  holder_name: string
  holder_email?: string
  status: 'valid' | 'used' | 'cancelled' | 'expired'
  scanned_at?: string
  scanned_by?: string
}

export interface OrderDetail {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  event_id: string
  event_title: string
  event_date: string
  /** @deprecated Legacy single-pack only */
  pack_id?: string
  /** @deprecated Use pack_display instead */
  pack_name: string
  /** Multi-pack formatted display (e.g., "VIP x2, Standard x3") */
  pack_display: string
  /** Structured pack breakdown for detailed views */
  pack_items: PackItemSummary[]
  /** @deprecated Use total_quantity instead */
  quantity: number
  /** Total tickets across all packs */
  total_quantity: number
  amount: number // En EUR
  status: 'pending' | 'pending_cash' | 'completed' | 'failed' | 'refunded' | 'cancelled'
  payment_method?: 'online' | 'cash'
  ccv_reference?: string
  paypal_order_id?: string
  mollie_payment_id?: string  // Legacy
  payment_failure_reason?: string
  created_at: string
  paid_at?: string
  tickets: TicketDetail[]
}

export interface PaginatedEventsResponse {
  items: Event[]
  total: number
  offset: number
  limit: number
  has_more: boolean
}

export interface OrdersListResponse {
  orders: OrderListItem[]
  total: number
  page: number
  limit: number
  total_pages: number
  // Stats globales (toutes les commandes, pas filtrées)
  global_revenue: number
  global_completed: number
  global_pending: number
  global_pending_cash: number
  global_failed: number
}

export interface OrderFilters {
  event_id?: string
  status?: string
  search?: string
  date_from?: string
  date_to?: string
  page?: number
  limit?: number
}

export interface RefundRequest {
  amount?: number
  reason?: string
}

export interface RefundResponse {
  success: boolean
  message: string
  refund_amount: number
  order_status: string
}

export interface ResendEmailResponse {
  success: boolean
  message: string
}

export interface EventStats {
  event_id: string
  event_title: string
  total_orders: number
  total_revenue: number
  tickets_sold: number
  tickets_scanned: number
  scan_rate: number
  orders_by_status: Record<string, number>
  sales_by_pack: Array<{
    pack_name: string
    orders: number
    tickets: number
    revenue: number
  }>
  sales_by_day: Array<{
    date: string
    orders: number
    revenue: number
  }>
}

export interface TopEventStats {
  event_id: string
  event_title: string
  event_date: string
  revenue: number
  tickets_sold: number
  orders_count: number
}

export interface GlobalStats {
  total_revenue: number
  total_orders: number
  completed_orders: number
  pending_orders: number
  failed_orders: number
  refunded_orders: number
  tickets_sold: number
  tickets_scanned: number
  scan_rate: number
  top_events: TopEventStats[]
}
