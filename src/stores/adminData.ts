import { ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { buildApiUrl, getAuthHeaders, API_ENDPOINTS } from '@/config/api'
import { logger } from '@/services/logger'
import type { Event, Artist, Pack, User, GlobalStats, EventStats } from '@/types'

/**
 * Store pour les données admin du dashboard
 * Utilise une stratégie cache-first avec rafraîchissement en background
 *
 * Note: shallowRef utilisé pour éviter la réactivité profonde sur les arrays
 * Les items ne sont pas modifiés individuellement, donc pas besoin de deep reactivity
 */
export const useAdminDataStore = defineStore('adminData', () => {
  // État - shallowRef pour la performance (pas de réactivité profonde)
  const events = shallowRef<Event[]>([])
  const artists = shallowRef<Artist[]>([])
  const packs = shallowRef<Pack[]>([])
  const users = shallowRef<User[]>([])

  // Flags de chargement
  const isEventsLoading = ref(false)
  const isArtistsLoading = ref(false)
  const isPacksLoading = ref(false)
  const isUsersLoading = ref(false)

  // Flags de cache
  const eventsLoaded = ref(false)
  const artistsLoaded = ref(false)
  const packsLoaded = ref(false)
  const usersLoaded = ref(false)

  // Timestamps pour savoir quand rafraîchir
  const eventsLastFetch = ref<number>(0)
  const artistsLastFetch = ref<number>(0)
  const packsLastFetch = ref<number>(0)
  const usersLastFetch = ref<number>(0)

  // Durée de validité du cache (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000

  // Shared promises pour éviter les appels concurrents
  let pendingEventsPromise: Promise<Event[]> | null = null
  let pendingArtistsPromise: Promise<Artist[]> | null = null
  let pendingPacksPromise: Promise<Pack[]> | null = null
  let pendingUsersPromise: Promise<User[]> | null = null

  /**
   * Vérifie si le cache est encore valide
   */
  function isCacheValid(lastFetch: number): boolean {
    return Date.now() - lastFetch < CACHE_DURATION
  }

  /**
   * Fetch events avec cache-first strategy
   */
  async function fetchEvents(force = false): Promise<Event[]> {
    // Si déjà chargé et cache valide, retourner le cache
    if (eventsLoaded.value && !force && isCacheValid(eventsLastFetch.value)) {
      return events.value
    }

    // Si un chargement est déjà en cours, retourner la Promise existante
    if (pendingEventsPromise && !force) {
      return pendingEventsPromise
    }

    isEventsLoading.value = true

    pendingEventsPromise = (async () => {
      try {
        const response = await fetch(buildApiUrl(API_ENDPOINTS.EVENTS), {
          credentials: 'include',
          headers: getAuthHeaders()
        })

        if (!response.ok) throw new Error('Failed to fetch events')

        const data: Event[] = await response.json()
        events.value = data
        eventsLoaded.value = true
        eventsLastFetch.value = Date.now()
        return data
      } catch (error) {
        logger.error('Error fetching admin events:', error)
        throw error
      } finally {
        isEventsLoading.value = false
        pendingEventsPromise = null
      }
    })()

    return pendingEventsPromise
  }

  /**
   * Fetch artists avec cache-first strategy
   */
  async function fetchArtists(force = false): Promise<Artist[]> {
    if (artistsLoaded.value && !force && isCacheValid(artistsLastFetch.value)) {
      return artists.value
    }

    if (pendingArtistsPromise && !force) {
      return pendingArtistsPromise
    }

    isArtistsLoading.value = true

    pendingArtistsPromise = (async () => {
      try {
        const response = await fetch(buildApiUrl(API_ENDPOINTS.ARTISTS), {
          credentials: 'include',
          headers: getAuthHeaders()
        })

        if (!response.ok) throw new Error('Failed to fetch artists')

        const data: Artist[] = await response.json()
        artists.value = data
        artistsLoaded.value = true
        artistsLastFetch.value = Date.now()
        return data
      } catch (error) {
        logger.error('Error fetching admin artists:', error)
        throw error
      } finally {
        isArtistsLoading.value = false
        pendingArtistsPromise = null
      }
    })()

    return pendingArtistsPromise
  }

  /**
   * Fetch packs avec cache-first strategy
   */
  async function fetchPacks(force = false): Promise<Pack[]> {
    if (packsLoaded.value && !force && isCacheValid(packsLastFetch.value)) {
      return packs.value
    }

    if (pendingPacksPromise && !force) {
      return pendingPacksPromise
    }

    isPacksLoading.value = true

    pendingPacksPromise = (async () => {
      try {
        const response = await fetch(buildApiUrl(API_ENDPOINTS.PACKS), {
          credentials: 'include',
          headers: getAuthHeaders()
        })

        if (!response.ok) throw new Error('Failed to fetch packs')

        const data: Pack[] = await response.json()
        packs.value = data
        packsLoaded.value = true
        packsLastFetch.value = Date.now()
        return data
      } catch (error) {
        logger.error('Error fetching admin packs:', error)
        throw error
      } finally {
        isPacksLoading.value = false
        pendingPacksPromise = null
      }
    })()

    return pendingPacksPromise
  }

  /**
   * Fetch users avec cache-first strategy
   */
  async function fetchUsers(force = false): Promise<User[]> {
    if (usersLoaded.value && !force && isCacheValid(usersLastFetch.value)) {
      return users.value
    }

    if (pendingUsersPromise && !force) {
      return pendingUsersPromise
    }

    isUsersLoading.value = true

    pendingUsersPromise = (async () => {
      try {
        const response = await fetch(buildApiUrl(API_ENDPOINTS.ADMIN_USERS), {
          credentials: 'include',
          headers: getAuthHeaders()
        })

        if (!response.ok) throw new Error('Failed to fetch users')

        const data: User[] = await response.json()
        users.value = data
        usersLoaded.value = true
        usersLastFetch.value = Date.now()
        return data
      } catch (error) {
        logger.error('Error fetching admin users:', error)
        throw error
      } finally {
        isUsersLoading.value = false
        pendingUsersPromise = null
      }
    })()

    return pendingUsersPromise
  }

  /**
   * Rafraîchir les données en background (sans bloquer l'UI)
   */
  function refreshInBackground(type: 'events' | 'artists' | 'packs' | 'users') {
    switch (type) {
      case 'events':
        fetchEvents(true).catch(() => {})
        break
      case 'artists':
        fetchArtists(true).catch(() => {})
        break
      case 'packs':
        fetchPacks(true).catch(() => {})
        break
      case 'users':
        fetchUsers(true).catch(() => {})
        break
    }
  }

  /**
   * Invalider le cache après une modification (create/update/delete)
   */
  function invalidateEvents() {
    eventsLoaded.value = false
    eventsLastFetch.value = 0
  }

  function invalidateArtists() {
    artistsLoaded.value = false
    artistsLastFetch.value = 0
  }

  function invalidatePacks() {
    packsLoaded.value = false
    packsLastFetch.value = 0
  }

  function invalidateUsers() {
    usersLoaded.value = false
    usersLastFetch.value = 0
  }

  /**
   * Invalider tout le cache
   */
  function invalidateAll() {
    invalidateEvents()
    invalidateArtists()
    invalidatePacks()
    invalidateUsers()
  }

  // ===== STATS =====

  const globalStats = ref<GlobalStats | null>(null)
  const isGlobalStatsLoading = ref(false)
  const eventStatsCache = ref<Map<string, EventStats>>(new Map())

  /**
   * Fetch global stats
   */
  async function fetchGlobalStats(force = false): Promise<GlobalStats> {
    if (globalStats.value && !force) {
      return globalStats.value
    }

    isGlobalStatsLoading.value = true

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.ADMIN_GLOBAL_STATS), {
        credentials: 'include',
        headers: getAuthHeaders()
      })

      if (!response.ok) throw new Error('Failed to fetch global stats')

      const data: GlobalStats = await response.json()
      globalStats.value = data
      return data
    } catch (error) {
      logger.error('Error fetching global stats:', error)
      throw error
    } finally {
      isGlobalStatsLoading.value = false
    }
  }

  /**
   * Fetch event-specific stats
   */
  async function fetchEventStats(eventId: string, force = false): Promise<EventStats> {
    if (!force && eventStatsCache.value.has(eventId)) {
      return eventStatsCache.value.get(eventId)!
    }

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.ADMIN_EVENT_STATS(eventId)), {
        credentials: 'include',
        headers: getAuthHeaders()
      })

      if (!response.ok) throw new Error('Failed to fetch event stats')

      const data: EventStats = await response.json()
      eventStatsCache.value.set(eventId, data)
      return data
    } catch (error) {
      logger.error('Error fetching event stats:', error)
      throw error
    }
  }

  /**
   * Invalider le cache des stats
   */
  function invalidateStats() {
    globalStats.value = null
    eventStatsCache.value.clear()
  }

  return {
    // State
    events,
    artists,
    packs,
    users,
    isEventsLoading,
    isArtistsLoading,
    isPacksLoading,
    isUsersLoading,
    eventsLoaded,
    artistsLoaded,
    packsLoaded,
    usersLoaded,

    // Actions
    fetchEvents,
    fetchArtists,
    fetchPacks,
    fetchUsers,
    refreshInBackground,
    invalidateEvents,
    invalidateArtists,
    invalidatePacks,
    invalidateUsers,
    invalidateAll,

    // Stats
    globalStats,
    isGlobalStatsLoading,
    eventStatsCache,
    fetchGlobalStats,
    fetchEventStats,
    invalidateStats
  }
})

