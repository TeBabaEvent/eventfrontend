import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/services/api'
import { logger } from '@/services/logger'
import type { Event, Artist } from '@/types'

export const useDataStore = defineStore('data', () => {
  // État
  const events = ref<Event[]>([])
  const artists = ref<Artist[]>([])
  const isEventsLoading = ref(false)
  const isArtistsLoading = ref(false)
  const eventsLoaded = ref(false)
  const artistsLoaded = ref(false)
  const eventsError = ref<string | null>(null)
  const artistsError = ref<string | null>(null)

  // Shared promises pour éviter les appels concurrents
  // (remplace le pattern de polling avec setInterval)
  let pendingEventsPromise: Promise<Event[]> | null = null
  let pendingArtistsPromise: Promise<Artist[]> | null = null

  /**
   * Fetch events une seule fois et met en cache
   * Utilise une Promise partagée pour dédupliquer les appels concurrents
   * @param force - Forcer le rechargement même si déjà en cache
   */
  async function fetchEvents(force = false): Promise<Event[]> {
    // Si déjà chargé et pas de force, retourner le cache
    if (eventsLoaded.value && !force) {
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
        const data = await api.getEvents()
        events.value = data
        eventsLoaded.value = true
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
    // Si déjà chargé et pas de force, retourner le cache
    if (artistsLoaded.value && !force) {
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
   * Précharger toutes les données en parallèle
   */
  async function preloadAll(): Promise<void> {
    try {
      await Promise.all([
        fetchEvents(),
        fetchArtists()
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
  }

  /**
   * Getter pour les événements à venir uniquement
   */
  function getUpcomingEvents(): Event[] {
    return events.value.filter((event) =>
      !event.status || event.status === 'upcoming'
    )
  }

  /**
   * Récupérer un événement par ID depuis le cache
   * @param id - ID de l'événement
   * @returns L'événement ou undefined si non trouvé
   */
  function getEventById(id: string): Event | undefined {
    return events.value.find(e => e.id === id)
  }

  return {
    // State
    events,
    artists,
    isEventsLoading,
    isArtistsLoading,
    eventsLoaded,
    artistsLoaded,
    eventsError,
    artistsError,

    // Actions
    fetchEvents,
    fetchArtists,
    preloadAll,
    invalidateCache,

    // Getters
    getUpcomingEvents,
    getEventById
  }
})

