import { ref, shallowRef, computed } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/services/api'
import { logger } from '@/services/logger'
import type { Event, Artist } from '@/types'

export const useDataStore = defineStore('data', () => {
  // État - shallowRef pour éviter la réactivité profonde sur les grands arrays
  // Les items individuels ne sont pas modifiés, donc pas besoin de réactivité profonde
  const events = shallowRef<Event[]>([])
  const artists = shallowRef<Artist[]>([])
  const isEventsLoading = ref(false)
  const isArtistsLoading = ref(false)
  const eventsLoaded = ref(false)
  const artistsLoaded = ref(false)
  const eventsError = ref<string | null>(null)
  const artistsError = ref<string | null>(null)

  // État pour les événements passés - shallowRef car peut accumuler beaucoup d'items
  const pastEvents = shallowRef<Event[]>([])
  const isPastEventsLoading = ref(false)
  const pastEventsLoaded = ref(false)
  const pastEventsError = ref<string | null>(null)
  const pastEventsHasMore = ref(true)

  // Cache TTL - durée de validité du cache (2 minutes pour les données publiques)
  const CACHE_DURATION = 2 * 60 * 1000
  const eventsLastFetch = ref(0)
  const artistsLastFetch = ref(0)
  const pastEventsLastFetch = ref(0)

  function isCacheValid(lastFetch: number): boolean {
    return Date.now() - lastFetch < CACHE_DURATION
  }

  // Shared promises pour éviter les appels concurrents
  // (remplace le pattern de polling avec setInterval)
  let pendingEventsPromise: Promise<Event[]> | null = null
  let pendingArtistsPromise: Promise<Artist[]> | null = null
  let pendingPastEventsPromise: Promise<Event[]> | null = null

  /**
   * Fetch événements à venir (triés par date, filtrés côté backend)
   * Utilise une Promise partagée pour dédupliquer les appels concurrents
   * @param force - Forcer le rechargement même si déjà en cache
   */
  async function fetchEvents(force = false): Promise<Event[]> {
    // Si déjà chargé, cache valide, et pas de force, retourner le cache
    if (eventsLoaded.value && !force && isCacheValid(eventsLastFetch.value)) {
      return events.value
    }

    // Si un chargement est déjà en cours, retourner la Promise existante
    if (pendingEventsPromise && !force) {
      return pendingEventsPromise
    }

    // Créer une nouvelle Promise et la stocker
    isEventsLoading.value = true
    eventsError.value = null

    pendingEventsPromise = (async () => {
      try {
        // Utilise le nouvel endpoint qui retourne les événements:
        // - Triés par date (le plus proche en premier)
        // - Filtrés: date >= aujourd'hui (visible jusqu'à 23:59, disparaît le lendemain)
        // - Status = "upcoming" uniquement
        const data = await api.getUpcomingEvents()
        events.value = data
        eventsLoaded.value = true
        eventsLastFetch.value = Date.now()
        return data
      } catch (error) {
        logger.error('Error fetching events:', error)
        eventsError.value = error instanceof Error ? error.message : 'Unknown error'
        throw error
      } finally {
        isEventsLoading.value = false
        pendingEventsPromise = null
      }
    })()

    return pendingEventsPromise
  }

  /**
   * Fetch artists une seule fois et met en cache
   * Utilise une Promise partagée pour dédupliquer les appels concurrents
   * @param force - Forcer le rechargement même si déjà en cache
   */
  async function fetchArtists(force = false): Promise<Artist[]> {
    // Si déjà chargé, cache valide, et pas de force, retourner le cache
    if (artistsLoaded.value && !force && isCacheValid(artistsLastFetch.value)) {
      return artists.value
    }

    // Si un chargement est déjà en cours, retourner la Promise existante
    if (pendingArtistsPromise && !force) {
      return pendingArtistsPromise
    }

    // Créer une nouvelle Promise et la stocker
    isArtistsLoading.value = true
    artistsError.value = null

    pendingArtistsPromise = (async () => {
      try {
        const data = await api.getWebsiteArtists()
        artists.value = data
        artistsLoaded.value = true
        artistsLastFetch.value = Date.now()
        return data
      } catch (error) {
        logger.error('Error fetching artists:', error)
        artistsError.value = error instanceof Error ? error.message : 'Unknown error'
        throw error
      } finally {
        isArtistsLoading.value = false
        pendingArtistsPromise = null
      }
    })()

    return pendingArtistsPromise
  }

  /**
   * Fetch événements passés avec pagination (triés par date desc, filtrés côté backend)
   * Utilise une Promise partagée pour dédupliquer les appels concurrents
   * @param limit - Nombre d'événements à charger
   * @param offset - Offset pour la pagination (0 pour le premier chargement)
   * @param force - Forcer le rechargement même si déjà en cache
   */
  async function fetchPastEvents(limit = 12, offset = 0, force = false): Promise<Event[]> {
    // Si offset = 0, cache valide et pas de force, retourner le cache
    if (offset === 0 && pastEventsLoaded.value && !force && isCacheValid(pastEventsLastFetch.value)) {
      return pastEvents.value
    }

    // Si un chargement est déjà en cours, retourner la Promise existante
    if (pendingPastEventsPromise && !force) {
      return pendingPastEventsPromise
    }

    // Créer une nouvelle Promise et la stocker
    isPastEventsLoading.value = true
    pastEventsError.value = null

    pendingPastEventsPromise = (async () => {
      try {
        const response = await api.getPastEvents(limit, offset)

        if (offset === 0) {
          // Premier chargement : remplacer
          pastEvents.value = response.items
          pastEventsLoaded.value = true
          pastEventsLastFetch.value = Date.now()
        } else {
          // Chargement suivant : append
          pastEvents.value = [...pastEvents.value, ...response.items]
        }

        // Mettre à jour hasMore avec la valeur du backend
        pastEventsHasMore.value = response.has_more

        return response.items
      } catch (error) {
        logger.error('Error fetching past events:', error)
        pastEventsError.value = error instanceof Error ? error.message : 'Unknown error'
        throw error
      } finally {
        isPastEventsLoading.value = false
        pendingPastEventsPromise = null
      }
    })()

    return pendingPastEventsPromise
  }

  /**
   * Précharger toutes les données en parallèle
   */
  async function preloadAll(): Promise<void> {
    try {
      await Promise.all([
        fetchEvents(),
        fetchArtists(),
        fetchPastEvents(12, 0)  // Précharger aussi les événements passés
      ])
    } catch (error) {
      logger.error('Error preloading data:', error)
      // Ne pas throw pour ne pas bloquer l'app
    }
  }

  /**
   * Invalider le cache et forcer un rechargement
   */
  function invalidateCache() {
    eventsLoaded.value = false
    artistsLoaded.value = false
    pastEventsLoaded.value = false
    eventsLastFetch.value = 0
    artistsLastFetch.value = 0
    pastEventsLastFetch.value = 0
  }

  // ===== COMPUTED GETTERS =====
  // Computed properties for derived state - cached and reactive

  /**
   * Événements à venir (déjà filtrés et triés par le backend)
   */
  const upcomingEvents = computed(() => events.value)

  /**
   * Événements passés (déjà filtrés et triés par le backend)
   */
  const pastEventsList = computed(() => pastEvents.value)

  /**
   * Nombre total d'événements chargés
   */
  const totalEventsCount = computed(() => events.value.length + pastEvents.value.length)

  /**
   * Indique si des données sont en cours de chargement
   */
  const isLoading = computed(() => isEventsLoading.value || isArtistsLoading.value || isPastEventsLoading.value)

  /**
   * Indique si une erreur existe
   */
  const hasError = computed(() => !!(eventsError.value || artistsError.value || pastEventsError.value))

  /**
   * Récupérer un événement par ID depuis le cache (fonction car nécessite un paramètre)
   */
  function getEventById(id: string): Event | undefined {
    // Chercher dans les événements à venir ET les événements passés
    return events.value.find(e => e.id === id) || pastEvents.value.find(e => e.id === id)
  }

  /**
   * Récupérer un artiste par ID depuis le cache
   */
  function getArtistById(id: string): Artist | undefined {
    return artists.value.find(a => a.id === id)
  }

  return {
    // State
    events,
    artists,
    pastEvents,
    isEventsLoading,
    isArtistsLoading,
    isPastEventsLoading,
    eventsLoaded,
    artistsLoaded,
    pastEventsLoaded,
    eventsError,
    artistsError,
    pastEventsError,
    pastEventsHasMore,

    // Actions
    fetchEvents,
    fetchArtists,
    fetchPastEvents,
    preloadAll,
    invalidateCache,

    // Computed Getters
    upcomingEvents,
    pastEventsList,
    totalEventsCount,
    isLoading,
    hasError,

    // Function Getters (parameterized)
    getEventById,
    getArtistById
  }
})

