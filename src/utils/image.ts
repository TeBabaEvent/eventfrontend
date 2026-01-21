// Image URL utilities for backend-stored images
import { API_BASE_URL } from '@/config/api'

/**
 * Resolves an image URL to a full absolute URL.
 * Handles backend-stored images (in /uploads/) by prepending API_BASE_URL.
 *
 * @param url The original image URL (can be relative like /uploads/... or absolute)
 * @returns The resolved absolute URL
 */
export function getOptimizedImageUrl(url: string): string {
  if (!url) return ''

  // Skip data URIs
  if (url.startsWith('data:')) return url

  // Handle backend uploads - prepend API_BASE_URL
  if (url.startsWith('/uploads')) {
    return `${API_BASE_URL}${url}`
  }

  // Already an absolute URL
  if (url.startsWith('http')) {
    return url
  }

  // Return original URL for other cases
  return url
}

