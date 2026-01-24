<template>
  <div class="image-upload">
    <label class="form-label">
      <i class="fas fa-image"></i>
      {{ label }}
    </label>

    <!-- Current Image Preview (when editing existing entity) -->
    <div v-if="currentImageUrl && !previewUrl && !imageDeleted" class="current-image">
      <img :src="resolveImageUrl(currentImageUrl)" :alt="label" />
      <div class="current-image__overlay">
        <span class="current-image__badge">Image actuelle</span>
        <div class="current-image__actions">
          <button type="button" class="current-image__btn current-image__btn--change" @click="triggerFileInput">
            <i class="fas fa-camera"></i>
            Changer
          </button>
          <button type="button" class="current-image__btn current-image__btn--delete" @click="markImageForDeletion" :disabled="isDeleting">
            <i class="fas fa-trash"></i>
            {{ isDeleting ? 'Suppression...' : 'Supprimer' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Drop Zone -->
    <div
      v-else
      :class="[
        'drop-zone',
        { 'drop-zone--active': isDragging },
        { 'drop-zone--has-preview': previewUrl },
        { 'drop-zone--error': error }
      ]"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      @click="!previewUrl && triggerFileInput()"
    >
      <!-- Preview Mode -->
      <template v-if="previewUrl">
        <div class="preview">
          <img :src="previewUrl" alt="Preview" class="preview__image" />
          <div class="preview__actions">
            <button type="button" class="preview__btn preview__btn--crop" @click.stop="openCropModal" title="Recadrer">
              <i class="fas fa-crop-alt"></i>
            </button>
            <button type="button" class="preview__btn preview__btn--change" @click.stop="triggerFileInput" title="Changer">
              <i class="fas fa-camera"></i>
            </button>
            <button type="button" class="preview__btn preview__btn--remove" @click.stop="removeImage" title="Supprimer">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </template>

      <!-- Empty State -->
      <template v-else>
        <div class="drop-zone__content">
          <div class="drop-zone__icon">
            <i class="fas fa-cloud-upload-alt"></i>
          </div>
          <p class="drop-zone__text">
            <span class="drop-zone__text--primary">Glissez une image ici</span>
            <span class="drop-zone__text--secondary">ou cliquez pour parcourir</span>
          </p>
          <p class="drop-zone__hint">
            JPEG, PNG, WebP - Max {{ maxSizeMB }} MB
          </p>
        </div>
      </template>
    </div>

    <!-- Hidden File Input -->
    <input
      ref="fileInput"
      type="file"
      :accept="acceptedTypes"
      class="hidden-input"
      @change="handleFileSelect"
    />

    <!-- Error Message -->
    <p v-if="error" class="upload-error">
      <i class="fas fa-exclamation-circle"></i>
      {{ error }}
    </p>

    <!-- Upload Progress -->
    <div v-if="isUploading" class="upload-progress">
      <div class="upload-progress__bar">
        <div class="upload-progress__fill" :style="{ width: `${uploadProgress}%` }"></div>
      </div>
      <span class="upload-progress__text">Envoi en cours...</span>
    </div>

    <!-- Crop Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="isCropModalOpen" class="crop-modal" @click.self="closeCropModal">
          <div class="crop-modal__content">
            <div class="crop-modal__header">
              <h3>Recadrer l'image</h3>
              <button type="button" class="crop-modal__close" @click="closeCropModal">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="crop-modal__body">
              <div class="crop-container" ref="cropContainer">
                <img
                  ref="cropImage"
                  :src="originalPreviewUrl ?? undefined"
                  alt="Crop preview"
                  class="crop-image"
                  @load="initCrop"
                />
                <div
                  class="crop-overlay"
                  :style="cropOverlayStyle"
                  @mousedown="startDrag"
                  @touchstart="startDrag"
                >
                  <div class="crop-box" :style="cropBoxStyle">
                    <!-- Resize handles -->
                    <div class="crop-handle crop-handle--nw" @mousedown.stop="startResize('nw', $event)" @touchstart.stop="startResize('nw', $event)"></div>
                    <div class="crop-handle crop-handle--ne" @mousedown.stop="startResize('ne', $event)" @touchstart.stop="startResize('ne', $event)"></div>
                    <div class="crop-handle crop-handle--sw" @mousedown.stop="startResize('sw', $event)" @touchstart.stop="startResize('sw', $event)"></div>
                    <div class="crop-handle crop-handle--se" @mousedown.stop="startResize('se', $event)" @touchstart.stop="startResize('se', $event)"></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="crop-modal__footer">
              <button type="button" class="btn btn--outline" @click="closeCropModal">
                Annuler
              </button>
              <button type="button" class="btn btn--primary" @click="applyCrop">
                <i class="fas fa-check"></i>
                Appliquer
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useImageUpload } from '@/composables/useImageUpload'
import { API_BASE_URL } from '@/config/api'

// Props
interface Props {
  label?: string
  modelValue?: string | null
  currentImageUrl?: string | null
  aspectRatio?: number
  maxSizeMB?: number
  entityType?: 'event' | 'artist'
  entityId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Image',
  modelValue: null,
  currentImageUrl: null,
  aspectRatio: 16 / 9,
  maxSizeMB: 10,
  entityType: 'event',
  entityId: null
})

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
  (e: 'file-selected', file: File): void
  (e: 'upload-complete', url: string): void
  (e: 'upload-error', error: string): void
  (e: 'removed'): void
}>()

// Image upload composable
const {
  previewUrl,
  originalFile,
  isUploading,
  isDeleting,
  uploadProgress,
  error,
  isDragging,
  handleFileSelect: baseHandleFileSelect,
  handleDrop: baseHandleDrop,
  handleDragOver,
  handleDragLeave,
  setCroppedImage,
  uploadEventImage,
  uploadArtistImage,
  deleteEventImage,
  deleteArtistImage,
  clear
} = useImageUpload({
  maxSizeMB: props.maxSizeMB
})

// Local state
const fileInput = ref<HTMLInputElement | null>(null)
const isCropModalOpen = ref(false)
const originalPreviewUrl = ref<string | null>(null)
const cropContainer = ref<HTMLElement | null>(null)
const cropImage = ref<HTMLImageElement | null>(null)
const imageDeleted = ref(false) // Track if existing image was marked for deletion

// Crop state
const cropArea = ref({ x: 0, y: 0, width: 100, height: 100 })
const imageSize = ref({ width: 0, height: 0 })
const isDraggingCrop = ref(false)
const isResizing = ref(false)
const resizeHandle = ref<string | null>(null)
const dragStart = ref({ x: 0, y: 0 })
const cropStart = ref({ x: 0, y: 0, width: 0, height: 0 })

// Computed
const acceptedTypes = computed(() => 'image/jpeg,image/jpg,image/png,image/webp')

const cropOverlayStyle = computed(() => ({
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  cursor: isDraggingCrop.value ? 'grabbing' : 'grab'
}))

const cropBoxStyle = computed(() => ({
  left: `${cropArea.value.x}%`,
  top: `${cropArea.value.y}%`,
  width: `${cropArea.value.width}%`,
  height: `${cropArea.value.height}%`
}))

// Methods
function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  baseHandleFileSelect(event)
  if (originalFile.value) {
    // Store original for crop
    originalPreviewUrl.value = previewUrl.value ?? null
    emit('file-selected', originalFile.value)
  }
}

function handleDrop(event: DragEvent) {
  baseHandleDrop(event)
  if (originalFile.value) {
    originalPreviewUrl.value = previewUrl.value ?? null
    emit('file-selected', originalFile.value)
  }
}

function removeImage() {
  clear()
  originalPreviewUrl.value = null
  emit('update:modelValue', null)
  emit('removed')
}

/**
 * Mark existing image for deletion (will be deleted when form is submitted)
 */
function markImageForDeletion() {
  imageDeleted.value = true
  emit('update:modelValue', null)
  emit('removed')
}

/**
 * Delete existing image from backend immediately
 * Called by parent component when needed
 */
async function deleteExistingImage(): Promise<boolean> {
  const entityId = props.entityId
  if (!entityId) {
    return false
  }

  let success = false

  if (props.entityType === 'event') {
    success = await deleteEventImage(entityId)
  } else if (props.entityType === 'artist') {
    success = await deleteArtistImage(entityId)
  }

  if (success) {
    imageDeleted.value = true
    emit('update:modelValue', null)
    emit('removed')
  }

  return success
}

/**
 * Reset the deleted state (e.g., when canceling)
 */
function resetDeletedState() {
  imageDeleted.value = false
}

function resolveImageUrl(url: string): string {
  if (!url) return ''
  // If it's a relative URL starting with /uploads, prepend API base URL
  if (url.startsWith('/uploads')) {
    return `${API_BASE_URL}${url}`
  }
  return url
}

// Crop Modal
function openCropModal() {
  if (originalPreviewUrl.value || previewUrl.value) {
    // Use original file preview for cropping
    if (originalFile.value) {
      originalPreviewUrl.value = URL.createObjectURL(originalFile.value)
    }
    isCropModalOpen.value = true
  }
}

function closeCropModal() {
  isCropModalOpen.value = false
}

function initCrop() {
  if (!cropImage.value) return

  const img = cropImage.value
  imageSize.value = { width: img.naturalWidth, height: img.naturalHeight }

  // Initialize crop area based on aspect ratio
  const containerAspect = img.clientWidth / img.clientHeight
  const targetAspect = props.aspectRatio

  let cropWidth, cropHeight

  if (containerAspect > targetAspect) {
    // Container is wider - fit height
    cropHeight = 80
    cropWidth = (cropHeight * img.clientHeight * targetAspect) / img.clientWidth
  } else {
    // Container is taller - fit width
    cropWidth = 80
    cropHeight = (cropWidth * img.clientWidth) / (img.clientHeight * targetAspect)
  }

  // Center the crop area
  cropArea.value = {
    x: (100 - cropWidth) / 2,
    y: (100 - cropHeight) / 2,
    width: cropWidth,
    height: cropHeight
  }
}

function startDrag(event: MouseEvent | TouchEvent) {
  if (isResizing.value) return

  isDraggingCrop.value = true
  const pos = getEventPosition(event)
  dragStart.value = pos
  cropStart.value = { ...cropArea.value }

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', onDrag)
  document.addEventListener('touchend', stopDrag)
}

function onDrag(event: MouseEvent | TouchEvent) {
  if (!isDraggingCrop.value || !cropContainer.value) return

  const pos = getEventPosition(event)
  const rect = cropContainer.value.getBoundingClientRect()

  const deltaX = ((pos.x - dragStart.value.x) / rect.width) * 100
  const deltaY = ((pos.y - dragStart.value.y) / rect.height) * 100

  let newX = cropStart.value.x + deltaX
  let newY = cropStart.value.y + deltaY

  // Constrain to bounds
  newX = Math.max(0, Math.min(100 - cropArea.value.width, newX))
  newY = Math.max(0, Math.min(100 - cropArea.value.height, newY))

  cropArea.value.x = newX
  cropArea.value.y = newY
}

function stopDrag() {
  isDraggingCrop.value = false
  isResizing.value = false
  resizeHandle.value = null

  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onResize)
  document.removeEventListener('touchend', stopDrag)
}

function startResize(handle: string, event: MouseEvent | TouchEvent) {
  event.preventDefault()
  isResizing.value = true
  resizeHandle.value = handle

  const pos = getEventPosition(event)
  dragStart.value = pos
  cropStart.value = { ...cropArea.value }

  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', onResize)
  document.addEventListener('touchend', stopDrag)
}

function onResize(event: MouseEvent | TouchEvent) {
  if (!isResizing.value || !cropContainer.value) return

  const pos = getEventPosition(event)
  const rect = cropContainer.value.getBoundingClientRect()

  const deltaX = ((pos.x - dragStart.value.x) / rect.width) * 100
  const deltaY = ((pos.y - dragStart.value.y) / rect.height) * 100

  const minSize = 10

  let newX = cropStart.value.x
  let newY = cropStart.value.y
  let newWidth = cropStart.value.width
  let newHeight = cropStart.value.height

  switch (resizeHandle.value) {
    case 'se':
      newWidth = Math.max(minSize, cropStart.value.width + deltaX)
      newHeight = newWidth / props.aspectRatio * (rect.width / rect.height)
      break
    case 'sw':
      newWidth = Math.max(minSize, cropStart.value.width - deltaX)
      newX = cropStart.value.x + cropStart.value.width - newWidth
      newHeight = newWidth / props.aspectRatio * (rect.width / rect.height)
      break
    case 'ne':
      newWidth = Math.max(minSize, cropStart.value.width + deltaX)
      newHeight = newWidth / props.aspectRatio * (rect.width / rect.height)
      newY = cropStart.value.y + cropStart.value.height - newHeight
      break
    case 'nw':
      newWidth = Math.max(minSize, cropStart.value.width - deltaX)
      newX = cropStart.value.x + cropStart.value.width - newWidth
      newHeight = newWidth / props.aspectRatio * (rect.width / rect.height)
      newY = cropStart.value.y + cropStart.value.height - newHeight
      break
  }

  // Constrain to bounds
  if (newX < 0) {
    newWidth += newX
    newX = 0
  }
  if (newY < 0) {
    newHeight += newY
    newY = 0
  }
  if (newX + newWidth > 100) {
    newWidth = 100 - newX
  }
  if (newY + newHeight > 100) {
    newHeight = 100 - newY
  }

  cropArea.value = { x: newX, y: newY, width: newWidth, height: newHeight }
}

function getEventPosition(event: MouseEvent | TouchEvent): { x: number; y: number } {
  if ('touches' in event && event.touches[0]) {
    return { x: event.touches[0].clientX, y: event.touches[0].clientY }
  }
  return { x: (event as MouseEvent).clientX, y: (event as MouseEvent).clientY }
}

async function applyCrop() {
  if (!cropImage.value || !originalFile.value) return

  const img = cropImage.value
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) return

  // Calculate actual pixel coordinates from percentage
  const sourceX = (cropArea.value.x / 100) * img.naturalWidth
  const sourceY = (cropArea.value.y / 100) * img.naturalHeight
  const sourceWidth = (cropArea.value.width / 100) * img.naturalWidth
  const sourceHeight = (cropArea.value.height / 100) * img.naturalHeight

  // Set canvas size to match crop dimensions (or max target size)
  const maxWidth = props.entityType === 'event' ? 1920 : 800
  const maxHeight = props.entityType === 'event' ? 1080 : 800

  let targetWidth = sourceWidth
  let targetHeight = sourceHeight

  // Scale down if necessary
  if (targetWidth > maxWidth) {
    targetHeight = (maxWidth / targetWidth) * targetHeight
    targetWidth = maxWidth
  }
  if (targetHeight > maxHeight) {
    targetWidth = (maxHeight / targetHeight) * targetWidth
    targetHeight = maxHeight
  }

  canvas.width = targetWidth
  canvas.height = targetHeight

  // Draw cropped image
  ctx.drawImage(
    img,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    targetWidth,
    targetHeight
  )

  // Convert to blob
  canvas.toBlob(
    (blob) => {
      if (blob) {
        setCroppedImage(blob)
        closeCropModal()
      }
    },
    'image/webp',
    0.85
  )
}

// Expose upload method for parent components
// Accepts optional entityId to override props (useful for newly created entities)
async function upload(overrideEntityId?: string): Promise<string | null> {
  if (!originalFile.value && !previewUrl.value) {
    return props.currentImageUrl || null
  }

  const entityId = overrideEntityId || props.entityId
  if (!entityId) {
    error.value = 'ID de l\'entité manquant'
    return null
  }

  let result: string | null = null

  if (props.entityType === 'event') {
    result = await uploadEventImage(entityId)
  } else if (props.entityType === 'artist') {
    result = await uploadArtistImage(entityId)
  }

  if (result) {
    emit('update:modelValue', result)
    emit('upload-complete', result)
  } else if (error.value) {
    emit('upload-error', error.value)
  }

  return result
}

// Watch for external modelValue changes
watch(() => props.modelValue, (newValue) => {
  if (newValue && !previewUrl.value) {
    // External URL set - don't override local preview
  }
})

// Cleanup
onUnmounted(() => {
  clear()
  if (originalPreviewUrl.value) {
    URL.revokeObjectURL(originalPreviewUrl.value)
  }
})

// Expose methods to parent
defineExpose({
  upload,
  clear,
  deleteExistingImage,
  resetDeletedState,
  hasFile: computed(() => !!originalFile.value),
  isMarkedForDeletion: computed(() => imageDeleted.value)
})
</script>

<style scoped>
.image-upload {
  width: 100%;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.5rem;
}

.form-label i {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

/* Current Image */
.current-image {
  position: relative;
  width: 100%;
  aspect-ratio: v-bind('props.aspectRatio');
  border-radius: 12px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
}

.current-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.current-image__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.current-image:hover .current-image__overlay {
  opacity: 1;
}

.current-image__badge {
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
  background: rgba(0, 0, 0, 0.5);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.current-image__actions {
  display: flex;
  gap: 0.5rem;
}

.current-image__btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.current-image__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.current-image__btn--change {
  background: var(--color-primary);
}

.current-image__btn--change:hover:not(:disabled) {
  background: #b91c3a;
  transform: scale(1.02);
}

.current-image__btn--delete {
  background: rgba(239, 68, 68, 0.8);
}

.current-image__btn--delete:hover:not(:disabled) {
  background: #dc2626;
  transform: scale(1.02);
}

/* Drop Zone */
.drop-zone {
  position: relative;
  width: 100%;
  min-height: 180px;
  border: 2px dashed rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
}

.drop-zone:hover {
  border-color: rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.04);
}

.drop-zone--active {
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.1);
}

.drop-zone--has-preview {
  border-style: solid;
  cursor: default;
}

.drop-zone--error {
  border-color: #ef4444;
}

.drop-zone__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  min-height: 180px;
}

.drop-zone__icon {
  font-size: 2.5rem;
  color: rgba(255, 255, 255, 0.2);
  margin-bottom: 1rem;
}

.drop-zone--active .drop-zone__icon {
  color: var(--color-primary);
}

.drop-zone__text {
  text-align: center;
  margin: 0;
}

.drop-zone__text--primary {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.25rem;
}

.drop-zone__text--secondary {
  display: block;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
}

.drop-zone__hint {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.3);
  margin-top: 0.75rem;
}

/* Preview */
.preview {
  position: relative;
  width: 100%;
  aspect-ratio: v-bind('props.aspectRatio');
}

.preview__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

.preview__actions {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: flex;
  gap: 0.5rem;
}

.preview__btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 0.85rem;
}

.preview__btn--crop {
  background: rgba(0, 0, 0, 0.6);
  color: white;
}

.preview__btn--crop:hover {
  background: rgba(99, 102, 241, 0.8);
}

.preview__btn--change {
  background: rgba(0, 0, 0, 0.6);
  color: white;
}

.preview__btn--change:hover {
  background: rgba(var(--color-primary-rgb), 0.8);
}

.preview__btn--remove {
  background: rgba(0, 0, 0, 0.6);
  color: #ef4444;
}

.preview__btn--remove:hover {
  background: rgba(239, 68, 68, 0.8);
  color: white;
}

/* Hidden Input */
.hidden-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

/* Error */
.upload-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #ef4444;
}

/* Progress */
.upload-progress {
  margin-top: 0.75rem;
}

.upload-progress__bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.upload-progress__fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.upload-progress__text {
  display: block;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.25rem;
}

/* Crop Modal */
.crop-modal {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
}

.crop-modal__content {
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: rgba(25, 25, 25, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
}

.crop-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.crop-modal__header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.crop-modal__close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.crop-modal__close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.crop-modal__body {
  flex: 1;
  padding: 1.5rem;
  overflow: auto;
}

.crop-container {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  overflow: hidden;
}

.crop-image {
  max-width: 100%;
  max-height: 50vh;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
}

.crop-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}

.crop-box {
  position: absolute;
  background: transparent;
  border: 2px solid white;
  box-shadow:
    0 0 0 9999px rgba(0, 0, 0, 0.5),
    inset 0 0 0 1px rgba(255, 255, 255, 0.2);
  cursor: grab;
}

.crop-box:active {
  cursor: grabbing;
}

.crop-handle {
  position: absolute;
  width: 16px;
  height: 16px;
  background: white;
  border: 2px solid var(--color-primary);
  border-radius: 50%;
}

.crop-handle--nw {
  top: -8px;
  left: -8px;
  cursor: nwse-resize;
}

.crop-handle--ne {
  top: -8px;
  right: -8px;
  cursor: nesw-resize;
}

.crop-handle--sw {
  bottom: -8px;
  left: -8px;
  cursor: nesw-resize;
}

.crop-handle--se {
  bottom: -8px;
  right: -8px;
  cursor: nwse-resize;
}

.crop-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.btn {
  padding: 0.625rem 1.25rem;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn--outline {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.7);
}

.btn--outline:hover {
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
}

.btn--primary {
  background: var(--color-primary);
  border: none;
  color: white;
}

.btn--primary:hover {
  background: #b91c3a;
}

/* Modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .crop-modal__content,
.modal-leave-active .crop-modal__content {
  transition: transform 0.2s ease;
}

.modal-enter-from .crop-modal__content,
.modal-leave-to .crop-modal__content {
  transform: scale(0.95);
}

/* Responsive */
@media (max-width: 768px) {
  .drop-zone__content {
    padding: 1.5rem;
    min-height: 150px;
  }

  .drop-zone__icon {
    font-size: 2rem;
  }

  .preview__btn {
    width: 32px;
    height: 32px;
    font-size: 0.75rem;
  }

  .crop-modal__content {
    max-height: 85vh;
  }

  .crop-image {
    max-height: 40vh;
  }
}
</style>
