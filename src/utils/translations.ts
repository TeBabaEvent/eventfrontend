/**
 * Utilitaires pour gérer les traductions d'événements et d'artistes
 */
import type { Event, DJ, Pack } from '@/types'

/**
 * Récupère le titre d'un événement dans la langue actuelle
 */
export function getEventTitle(event: Event, locale: string): string {
  if (!event.title_translations) {
    return event.title
  }

  const translations = event.title_translations as Record<string, string>
  return translations[locale] || event.title || translations.fr || ''
}

/**
 * Récupère la description d'un événement dans la langue actuelle
 */
export function getEventDescription(event: Event, locale: string): string {
  if (!event.description_translations) {
    return event.description
  }

  const translations = event.description_translations as Record<string, string>
  return translations[locale] || event.description || translations.fr || ''
}

/**
 * Récupère le rôle d'un artiste dans la langue actuelle
 */
export function getArtistRole(artist: DJ, locale: string): string {
  if (!artist.role_translations) {
    return artist.role || ''
  }

  const translations = artist.role_translations as Record<string, string>
  return translations[locale] || artist.role || translations.fr || ''
}

/**
 * Récupère la description d'un artiste dans la langue actuelle
 */
export function getArtistDescription(artist: DJ, locale: string): string {
  if (!artist.description_translations) {
    return artist.description || ''
  }

  const translations = artist.description_translations as Record<string, string>
  return translations[locale] || artist.description || translations.fr || ''
}

/**
 * Récupère le nom d'un pack dans la langue actuelle
 */
export function getPackName(pack: Pack, locale: string): string {
  if (!pack.name_translations) {
    return pack.name || ''
  }

  const translations = pack.name_translations as Record<string, string>
  return translations[locale] || pack.name || translations.fr || ''
}

/**
 * Récupère la description d'un pack dans la langue actuelle
 */
export function getPackDescription(pack: Pack, locale: string): string {
  if (!pack.description_translations) {
    return pack.description || ''
  }

  const translations = pack.description_translations as Record<string, string>
  return translations[locale] || pack.description || translations.fr || ''
}

/**
 * Récupère les caractéristiques d'un pack dans la langue actuelle
 */
export function getPackFeatures(pack: Pack, locale: string): string[] {
  if (!pack.features_translations) {
    return pack.features || []
  }

  const translations = pack.features_translations as Record<string, string[]>
  return translations[locale] || pack.features || translations.fr || []
}
