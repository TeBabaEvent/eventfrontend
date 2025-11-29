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

  /**
   * Fetch events une seule fois et met en cache
   * @param force - Forcer le rechargement même si déjà en cache
   */
  async function fetchEvents(force = false): Promise<Event[]> {
    // Si déjà chargé et pas de force, retourner le cache
    if (eventsLoaded.value && !force) {
      return events.value
    }

    // Si un chargement est déjà en cours, attendre qu'il se termine
    if (isEventsLoading.value) {
      await new Promise<void>(resolve => {
        const check = setInterval(() => {
          if (!isEventsLoading.value) {
            clearInterval(check)
            resolve()
          }
        }, 50)
      })
      return events.value
    }

    isEventsLoading.value = true
    eventsError.value = null

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
    }
  }

  /**
   * Fetch artists une seule fois et met en cache
   * @param force - Forcer le rechargement même si déjà en cache
   */
  async function fetchArtists(force = false): Promise<Artist[]> {
    // Si déjà chargé et pas de force, retourner le cache
    if (artistsLoaded.value && !force) {
      return artists.value
    }

    // Si un chargement est déjà en cours, attendre qu'il se termine
    if (isArtistsLoading.value) {
      await new Promise<void>(resolve => {
        const check = setInterval(() => {
          if (!isArtistsLoading.value) {
            clearInterval(check)
            resolve()
          }
        }, 50)
      })
      return artists.value
    }

    isArtistsLoading.value = true
    artistsError.value = null

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
    }
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

