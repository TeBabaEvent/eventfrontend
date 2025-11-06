// Utilitaires généraux pour l'application Baba Event

import { WHATSAPP_MESSAGES, CONTACT_INFO } from '@/constants'

/**
 * Génère un lien WhatsApp avec un message prédéfini
 */
export function generateWhatsAppLink(
  message: string = WHATSAPP_MESSAGES.general,
  phone: string = CONTACT_INFO.whatsapp
): string {
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodedMessage}`
}

/**
 * Formate une date selon la locale courante
 * @param date - Date à formater
 * @param locale - Locale à utiliser (par défaut: 'fr-FR')
 * @param options - Options de formatage
 */
export function formatDate(
  date: string | Date, 
  locale: string = 'fr-FR',
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  }
  return dateObj.toLocaleDateString(locale, defaultOptions)
}

/**
 * Formate une heure en français
 */
export function formatTime(time: string): string {
  return time.replace(':', 'h')
}

/**
 * Génère un slug à partir d'un texte
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9\s-]/g, '') // Supprime les caractères spéciaux
    .replace(/\s+/g, '-') // Remplace les espaces par des tirets
    .replace(/-+/g, '-') // Supprime les tirets multiples
    .trim()
}

/**
 * Formate un prix avec la devise
 */
export function formatPrice(amount: number, currency: string = '€'): string {
  return `${amount}${currency}`
}

/**
 * Vérifie si un élément est visible dans le viewport
 */
export function isInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

/**
 * Debounce une fonction
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle une fonction
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Scroll fluide vers un élément
 */
export function scrollToElement(
  elementId: string,
  offset: number = 80,
  behavior: ScrollBehavior = 'smooth'
): void {
  const element = document.getElementById(elementId.replace('#', ''))
  if (element) {
    const elementPosition = element.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({
      top: elementPosition,
      behavior
    })
  }
}

/**
 * Génère un ID unique
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Valide une adresse email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valide un numéro de téléphone (français ou belge)
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Regex pour numéros français
  const frenchRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/
  // Regex pour numéros belges
  const belgianRegex = /^(?:(?:\+|00)32|0)\s*[1-9](?:[\s.-]*\d{2}){3,4}$/
  
  return frenchRegex.test(phone) || belgianRegex.test(phone)
}

/**
 * Copie du texte dans le presse-papiers
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Erreur lors de la copie:', error)
    return false
  }
}

/**
 * Détecte si l'utilisateur est sur mobile
 */
export function isMobile(): boolean {
  return window.innerWidth < 768
}

/**
 * Charge une image de manière asynchrone
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * Formate un nombre avec des séparateurs de milliers
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('fr-FR')
}

/**
 * Formate le jour d'une date
 */
export function formatDay(date: string): string {
  return new Date(date).getDate().toString()
}

/**
 * Formate le mois d'une date avec traduction i18n
 * @param date - Date au format string
 * @param t - Fonction de traduction i18n
 */
export function formatMonth(date: string, t: (key: string) => string): string {
  const monthIndex = new Date(date).getMonth()
  const months = [
    t('months.jan'), t('months.feb'), t('months.mar'),
    t('months.apr'), t('months.may'), t('months.jun'),
    t('months.jul'), t('months.aug'), t('months.sep'),
    t('months.oct'), t('months.nov'), t('months.dec')
  ]
  return months[monthIndex] || t('months.jan')
}