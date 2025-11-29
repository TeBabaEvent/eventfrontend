// Image optimization utilities

/**
 * Optimizes an image URL by appending resizing parameters for known services (Pexels, Unsplash)
 * @param url The original image URL
 * @param width The desired width
 * @param height Optional desired height
 * @returns The optimized URL
 */
export function getOptimizedImageUrl(url: string, width: number = 800, height?: number): string {
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

  // 🚀 Use wsrv.nl for all other absolute URLs (including our own backend)
  // This solves the issue of serving 4K images for thumbnails
  if (url.startsWith('http')) {
    const baseUrl = 'https://wsrv.nl/?url='
    // q=80: Good balance of quality/size
    // output=webp: Modern format, smaller size
    // we: Enable WebP
    // il: Progressive loading
    let params = `${encodeURIComponent(url)}&w=${width}&q=80&output=webp&we&il`

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
 * @param url The original image URL
 * @param widths Array of widths to generate
 * @returns srcset string
 */
export function generateSrcSet(url: string, widths: number[] = [400, 800, 1200]): string {
  if (!url) return ''

  // Only generate srcset for supported providers
  if (!url.includes('images.pexels.com') && !url.includes('images.unsplash.com')) {
    return ''
  }

  return widths
    .map(w => `${getOptimizedImageUrl(url, w)} ${w}w`)
    .join(', ')
}

