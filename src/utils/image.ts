// Image optimization utilities

/**
 * Standard image width constants for consistent sizing across the app
 */
export const IMAGE_WIDTHS = {
  SMALL: 400,
  MEDIUM: 600,
  LARGE: 800,
  XLARGE: 1200,
  HERO: 1920
} as const

/**
 * Encode URL for wsrv.nl (avoid double-encoding)
 * @param url The URL to encode
 * @returns Properly encoded URL
 */
function encodeImageUrl(url: string): string {
  try {
    // First decode the URL in case it's already encoded
    // This handles URLs like "https://cdn.com/my%20image.jpg"
    const decoded = decodeURIComponent(url)
    // Then encode it properly for wsrv.nl
    return encodeURIComponent(decoded)
  } catch {
    // If decoding fails (malformed URL), try encoding as-is
    return encodeURIComponent(url)
  }
}

/**
 * Optimizes an image URL by appending resizing parameters for known services (Pexels, Unsplash)
 * @param url The original image URL
 * @param width The desired width
 * @param height Optional desired height
 * @returns The optimized URL
 */
export function getOptimizedImageUrl(url: string, width: number = IMAGE_WIDTHS.LARGE, height?: number): string {
  if (!url) return ''

  // Skip already optimized URLs or data URIs
  if (url.includes('wsrv.nl') || url.startsWith('data:')) return url

  // Pexels
  if (url.includes('images.pexels.com')) {
    const separator = url.includes('?') ? '&' : '?'
    let params = `auto=compress&cs=tinysrgb&w=${width}`
    if (height) {
      params += `&h=${height}&dpr=1` // dpr=1 to avoid huge images on retina if not needed
    }
    return `${url}${separator}${params}`
  }

  // Unsplash
  if (url.includes('images.unsplash.com')) {
    const separator = url.includes('?') ? '&' : '?'
    let params = `w=${width}&q=80&auto=format`
    if (height) {
      params += `&h=${height}&fit=crop`
    }
    return `${url}${separator}${params}`
  }

  // Use wsrv.nl for all other absolute URLs (including our own backend)
  // This solves the issue of serving 4K images for thumbnails
  if (url.startsWith('http')) {
    const baseUrl = 'https://wsrv.nl/?url='
    // q=80: Good balance of quality/size
    // output=webp: Modern format, smaller size
    // we: Enable WebP
    // il: Progressive loading
    let params = `${encodeImageUrl(url)}&w=${width}&q=80&output=webp&we&il`

    if (height) {
      params += `&h=${height}&fit=cover`
    }

    return `${baseUrl}${params}`
  }

  // Return original URL if it's a relative path or other protocol
  return url
}

/**
 * Generates a srcset string for responsive images
 * ✅ Now works with all image URLs (including wsrv.nl optimized images)
 * @param url The original image URL
 * @param widths Array of widths to generate
 * @returns srcset string
 */
export function generateSrcSet(url: string, widths: number[] = [IMAGE_WIDTHS.SMALL, IMAGE_WIDTHS.LARGE, IMAGE_WIDTHS.XLARGE]): string {
  if (!url) return ''

  // Skip data URIs and relative paths
  if (url.startsWith('data:') || !url.startsWith('http')) return ''

  // Skip already optimized wsrv.nl URLs (they already have specific width)
  if (url.includes('wsrv.nl')) return ''

  return widths
    .map(w => `${getOptimizedImageUrl(url, w)} ${w}w`)
    .join(', ')
}

/**
 * Image format types supported by wsrv.nl
 */
export type ImageFormat = 'avif' | 'webp' | 'jpg' | 'png'

/**
 * Gets an optimized image URL in a specific format
 * @param url The original image URL
 * @param format The desired output format (avif, webp, jpg, png)
 * @param width The desired width
 * @param height Optional desired height
 * @returns The optimized URL in the specified format
 */
export function getFormatVariant(
  url: string,
  format: ImageFormat,
  width: number = IMAGE_WIDTHS.LARGE,
  height?: number
): string {
  if (!url) return ''

  // Skip data URIs
  if (url.startsWith('data:')) return url

  // For HTTP URLs, use wsrv.nl to convert to desired format
  if (url.startsWith('http')) {
    const baseUrl = 'https://wsrv.nl/?url='
    let params = `${encodeImageUrl(url)}&w=${width}&q=80&output=${format}&il`

    if (height) {
      params += `&h=${height}&fit=cover`
    }

    return `${baseUrl}${params}`
  }

  // Return original URL for relative paths
  return url
}

/**
 * Generates a srcset for different pixel densities (1x, 2x)
 * @param url The original image URL
 * @param format The desired output format
 * @param width Base width for 1x density
 * @param height Optional height
 * @returns srcset string with density descriptors
 */
export function generateDensitySrcSet(
  url: string,
  format: ImageFormat,
  width: number = IMAGE_WIDTHS.LARGE,
  height?: number
): string {
  if (!url) return ''

  const densities = [1, 2]
  return densities
    .map(density => {
      const scaledWidth = Math.round(width * density)
      const scaledHeight = height ? Math.round(height * density) : undefined
      const optimizedUrl = getFormatVariant(url, format, scaledWidth, scaledHeight)
      return `${optimizedUrl} ${density}x`
    })
    .join(', ')
}

