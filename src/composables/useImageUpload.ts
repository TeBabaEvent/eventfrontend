/**
 * Composable pour l'upload d'images avec crop et preview.
 * Gère le drag & drop, la validation, le crop et l'upload vers le backend.
 */
import { ref, computed, type ComputedRef } from 'vue'
import { buildApiUrl, API_ENDPOINTS } from '@/config/api'
import { logger } from '@/services/logger'

// Types
export interface ImageUploadOptions {
  maxSizeMB?: number
  allowedTypes?: string[]
  aspectRatio?: number // width / height (e.g., 16/9 for events, 1 for artists)
}

export interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export interface UseImageUploadReturn {
  // State
  previewUrl: ReturnType<typeof ref<string | null>>
  originalFile: ReturnType<typeof ref<File | null>>
  croppedBlob: ReturnType<typeof ref<Blob | null>>
  isUploading: ReturnType<typeof ref<boolean>>
  uploadProgress: ReturnType<typeof ref<number>>
  error: ReturnType<typeof ref<string | null>>
  isDragging: ReturnType<typeof ref<boolean>>
  isDeleting: ReturnType<typeof ref<boolean>>

  // Computed
  hasImage: ComputedRef<boolean>

  // Methods
  handleFileSelect: (event: Event) => void
  handleDrop: (event: DragEvent) => void
  handleDragOver: (event: DragEvent) => void
  handleDragLeave: () => void
  setCroppedImage: (blob: Blob) => void
  uploadEventImage: (eventId: string) => Promise<string | null>
  uploadArtistImage: (artistId: string) => Promise<string | null>
  deleteEventImage: (eventId: string) => Promise<boolean>
  deleteArtistImage: (artistId: string) => Promise<boolean>
  clear: () => void
  validateFile: (file: File) => string | null
}

const DEFAULT_OPTIONS: ImageUploadOptions = {
  maxSizeMB: 10,
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  aspectRatio: undefined
}

export function useImageUpload(options: ImageUploadOptions = {}): UseImageUploadReturn {
  const config = { ...DEFAULT_OPTIONS, ...options }

  // State
  const previewUrl = ref<string | null>(null)
  const originalFile = ref<File | null>(null)
  const croppedBlob = ref<Blob | null>(null)
  const isUploading = ref(false)
  const isDeleting = ref(false)
  const uploadProgress = ref(0)
  const error = ref<string | null>(null)
  const isDragging = ref(false)

  // Computed
  const hasImage = computed(() => !!previewUrl.value)

  /**
   * Validates a file before processing
   */
  function validateFile(file: File): string | null {
    // Check type
    if (!config.allowedTypes?.includes(file.type)) {
      return `Type de fichier non supporté. Utilisez: ${config.allowedTypes?.join(', ')}`
    }

    // Check size
    const maxBytes = (config.maxSizeMB || 10) * 1024 * 1024
    if (file.size > maxBytes) {
      return `Le fichier est trop volumineux. Maximum: ${config.maxSizeMB} MB`
    }

    return null
  }

  /**
   * Process a selected file
   */
  function processFile(file: File) {
    error.value = null

    const validationError = validateFile(file)
    if (validationError) {
      error.value = validationError
      return
    }

    originalFile.value = file
    croppedBlob.value = null

    // Create preview URL
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
    }
    previewUrl.value = URL.createObjectURL(file)
  }

  /**
   * Handle file input change
   */
  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]

    if (file) {
      processFile(file)
    }

    // Reset input to allow re-selecting same file
    input.value = ''
  }

  /**
   * Handle drag over event
   */
  function handleDragOver(event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()
    isDragging.value = true
  }

  /**
   * Handle drag leave event
   */
  function handleDragLeave() {
    isDragging.value = false
  }

  /**
   * Handle file drop
   */
  function handleDrop(event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()
    isDragging.value = false

    const file = event.dataTransfer?.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  /**
   * Set the cropped image blob (called from cropper component)
   */
  function setCroppedImage(blob: Blob) {
    croppedBlob.value = blob

    // Update preview to show cropped version
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
    }
    previewUrl.value = URL.createObjectURL(blob)
  }

  /**
   * Upload image to backend
   */
  async function uploadImage(endpoint: string): Promise<string | null> {
    const imageToUpload = croppedBlob.value || originalFile.value

    if (!imageToUpload) {
      error.value = 'Aucune image sélectionnée'
      return null
    }

    isUploading.value = true
    uploadProgress.value = 0
    error.value = null

    try {
      const formData = new FormData()

      // Use filename from original file, or generate one
      const filename = originalFile.value?.name || 'image.webp'
      formData.append('file', imageToUpload, filename)

      const response = await fetch(buildApiUrl(endpoint), {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || errorData.message || `Erreur ${response.status}`)
      }

      const data = await response.json()
      uploadProgress.value = 100

      logger.log('Image uploaded successfully:', data.image_url)
      return data.image_url

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du téléchargement'
      error.value = message
      logger.error('Upload error:', err)
      return null

    } finally {
      isUploading.value = false
    }
  }

  /**
   * Upload event image
   */
  async function uploadEventImage(eventId: string): Promise<string | null> {
    return uploadImage(API_ENDPOINTS.UPLOAD_EVENT_IMAGE(eventId))
  }

  /**
   * Upload artist image
   */
  async function uploadArtistImage(artistId: string): Promise<string | null> {
    return uploadImage(API_ENDPOINTS.UPLOAD_ARTIST_IMAGE(artistId))
  }

  /**
   * Delete image from backend
   */
  async function deleteImage(endpoint: string): Promise<boolean> {
    isDeleting.value = true
    error.value = null

    try {
      const response = await fetch(buildApiUrl(endpoint), {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || errorData.message || `Erreur ${response.status}`)
      }

      logger.log('Image deleted successfully')
      return true

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression'
      error.value = message
      logger.error('Delete error:', err)
      return false

    } finally {
      isDeleting.value = false
    }
  }

  /**
   * Delete event image
   */
  async function deleteEventImage(eventId: string): Promise<boolean> {
    return deleteImage(API_ENDPOINTS.DELETE_EVENT_IMAGE(eventId))
  }

  /**
   * Delete artist image
   */
  async function deleteArtistImage(artistId: string): Promise<boolean> {
    return deleteImage(API_ENDPOINTS.DELETE_ARTIST_IMAGE(artistId))
  }

  /**
   * Clear all state
   */
  function clear() {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
    }
    previewUrl.value = null
    originalFile.value = null
    croppedBlob.value = null
    error.value = null
    uploadProgress.value = 0
    isDragging.value = false
  }

  return {
    // State
    previewUrl,
    originalFile,
    croppedBlob,
    isUploading,
    isDeleting,
    uploadProgress,
    error,
    isDragging,

    // Computed
    hasImage,

    // Methods
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    setCroppedImage,
    uploadEventImage,
    uploadArtistImage,
    deleteEventImage,
    deleteArtistImage,
    clear,
    validateFile
  }
}
