<template>
  <div class="scanner" :class="{ 'scanner--result': scanResult }">
    <!-- Fullscreen Camera -->
    <div class="scanner__camera">
      <video ref="videoRef" class="scanner__video" autoplay playsinline muted></video>

      <!-- Gradient overlays for depth -->
      <div class="scanner__gradient scanner__gradient--top"></div>
      <div class="scanner__gradient scanner__gradient--bottom"></div>

      <!-- Scan target area -->
      <div v-if="!scanResult && !cameraError" class="scanner__target">
        <div class="target">
          <div class="target__corner target__corner--tl"></div>
          <div class="target__corner target__corner--tr"></div>
          <div class="target__corner target__corner--bl"></div>
          <div class="target__corner target__corner--br"></div>
          <div v-if="isScanning" class="target__pulse"></div>
        </div>
        <p class="scanner__hint">Placez le QR code dans le cadre</p>
      </div>

      <!-- Camera Error -->
      <div v-if="cameraError" class="scanner__error">
        <div class="error-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <p class="error-text">{{ cameraError }}</p>
        <button @click="startScanning" class="error-retry">
          Réessayer
        </button>
      </div>
    </div>

    <!-- Top Controls -->
    <header class="scanner__header">
      <button v-if="canAccessDashboard" @click="goToDashboard" class="header-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <div v-else class="header-spacer"></div>

      <div class="header-status" :class="{ 'header-status--active': isScanning }">
        <span class="status-dot"></span>
        <span>{{ isScanning ? 'Scanner actif' : 'En pause' }}</span>
      </div>

      <button @click="logout" class="header-btn header-btn--logout">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
      </button>
    </header>

    <!-- Bottom Control -->
    <div v-if="!scanResult && !cameraError" class="scanner__control">
      <button
        @click="isScanning ? stopScanning() : startScanning()"
        class="scan-toggle"
        :class="{ 'scan-toggle--active': isScanning }"
      >
        <span class="scan-toggle__ring"></span>
        <span class="scan-toggle__inner">
          <svg v-if="!isScanning" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
          </svg>
        </span>
      </button>
    </div>

    <!-- Result Overlay -->
    <transition name="result">
      <div v-if="scanResult" class="result" :class="resultClass">
        <div class="result__content">
          <!-- Success/Error Icon -->
          <div class="result__icon">
            <svg v-if="scanResult.valid" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 13l4 4L19 7"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </div>

          <!-- Status Text -->
          <h2 class="result__status">{{ scanResult.valid ? 'Accès autorisé' : getErrorTitle() }}</h2>

          <!-- Ticket Details (only for valid tickets) -->
          <div v-if="scanResult.valid && scanResult.holder" class="result__details">
            <div class="detail">
              <span class="detail__label">Titulaire</span>
              <span class="detail__value">{{ scanResult.holder }}</span>
            </div>
            <div v-if="scanResult.pack_name" class="detail">
              <span class="detail__label">Type</span>
              <span class="detail__value">{{ scanResult.pack_name }}</span>
            </div>
          </div>

          <!-- Error details (only for errors) -->
          <p v-if="!scanResult.valid" class="result__error-msg">{{ getErrorMessage() }}</p>

          <!-- Next Button -->
          <button @click="resetScan" class="result__next">
            <span>Scanner suivant</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useScanner } from '@/composables/useScanner'
import { logger } from '@/services/logger'
import type { ScanResponse } from '@/types'
import QrScanner from 'qr-scanner'

const router = useRouter()
const authStore = useAuthStore()
const { validateTicket, authError } = useScanner()

// State
const videoRef = ref<HTMLVideoElement>()
const isScanning = ref(false)
const scanResult = ref<ScanResponse | null>(null)
const cameraError = ref<string | null>(null)

// Use shallowRef for non-reactive complex objects
const qrScanner = shallowRef<QrScanner | null>(null)
let lastScanTime = 0
const SCAN_DEBOUNCE_MS = 1500

// Audio
let audioContext: AudioContext | null = null

// Computed
const canAccessDashboard = computed(() => {
  const role = authStore.user?.role
  return role === 'admin' || role === 'super_admin'
})

const resultClass = computed(() => {
  if (!scanResult.value) return ''
  return scanResult.value.valid ? 'result--success' : 'result--error'
})

// Methods
function goToDashboard() {
  router.push('/dashboard')
}

function logout() {
  authStore.logout()
  router.push('/login')
}

function getErrorTitle(): string {
  if (!scanResult.value) return 'Erreur'
  switch (scanResult.value.result) {
    case 'already_used': return 'Déjà scanné'
    case 'expired': return 'Billet expiré'
    case 'cancelled': return 'Billet annulé'
    case 'wrong_event': return 'Mauvais événement'
    default: return 'Billet invalide'
  }
}

function getErrorMessage(): string {
  if (!scanResult.value) return ''
  switch (scanResult.value.result) {
    case 'already_used':
      return scanResult.value.scanned_at
        ? `Entrée enregistrée à ${formatTime(scanResult.value.scanned_at)}`
        : 'Ce billet a déjà été utilisé'
    case 'expired': return 'Ce billet n\'est plus valide'
    case 'cancelled': return 'Ce billet a été remboursé'
    case 'wrong_event': return 'Ce billet appartient à un autre événement'
    default: return 'QR code non reconnu'
  }
}

function formatTime(dateString: string): string {
  return new Intl.DateTimeFormat('fr', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString))
}

async function startScanning() {
  if (!videoRef.value) return
  cameraError.value = null

  try {
    const hasCamera = await QrScanner.hasCamera()
    if (!hasCamera) {
      cameraError.value = 'Aucune caméra détectée sur cet appareil'
      return
    }

    qrScanner.value = new QrScanner(
      videoRef.value,
      (result) => {
        const now = Date.now()
        if (now - lastScanTime < SCAN_DEBOUNCE_MS) return
        lastScanTime = now

        if (isScanning.value) {
          handleScan(result.data)
        }
      },
      {
        returnDetailedScanResult: true,
        highlightScanRegion: false,
        highlightCodeOutline: false
      }
    )

    await qrScanner.value.start()
    isScanning.value = true
  } catch (err) {
    const error = err as Error
    logger.error('Camera error:', error)

    if (error.message?.includes('NotAllowedError') || error.message?.includes('Permission')) {
      cameraError.value = 'Accès à la caméra refusé. Autorisez l\'accès dans les paramètres de votre navigateur.'
    } else if (error.message?.includes('NotFoundError')) {
      cameraError.value = 'Aucune caméra disponible sur cet appareil.'
    } else if (error.message?.includes('https') || error.message?.includes('secure')) {
      cameraError.value = 'Une connexion sécurisée (HTTPS) est requise.'
    } else {
      cameraError.value = 'Impossible d\'accéder à la caméra.'
    }
  }
}

function stopScanning() {
  if (qrScanner.value) {
    qrScanner.value.stop()
    isScanning.value = false
  }
}

async function handleScan(qrData: string) {
  isScanning.value = false

  const result = await validateTicket(qrData)
  if (result) {
    scanResult.value = result

    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(result.valid ? [50] : [50, 50, 50])
    }

    // Audio feedback
    playSound(result.valid)
  }
}

function resetScan() {
  scanResult.value = null
  if (qrScanner.value) {
    qrScanner.value.start()
    isScanning.value = true
  }
}

function playSound(success: boolean) {
  try {
    if (!audioContext || audioContext.state === 'closed') {
      audioContext = new AudioContext()
    }

    const osc = audioContext.createOscillator()
    const gain = audioContext.createGain()
    osc.connect(gain)
    gain.connect(audioContext.destination)

    if (success) {
      osc.frequency.value = 880
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.15, audioContext.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15)
      osc.start(audioContext.currentTime)
      osc.stop(audioContext.currentTime + 0.15)
    } else {
      osc.frequency.value = 200
      osc.type = 'square'
      gain.gain.setValueAtTime(0.1, audioContext.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25)
      osc.start(audioContext.currentTime)
      osc.stop(audioContext.currentTime + 0.25)
    }
  } catch { /* ignore audio errors */ }
}

// Auth error watcher
watch(authError, (hasError) => {
  if (hasError) {
    router.push({ path: '/login', query: { redirect: '/scanner' } })
  }
})

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push({ path: '/login', query: { redirect: '/scanner' } })
    return
  }

  // Auto-start camera
  await startScanning()
})

onUnmounted(() => {
  if (qrScanner.value) {
    qrScanner.value.destroy()
    qrScanner.value = null
  }
  if (audioContext && audioContext.state !== 'closed') {
    audioContext.close().catch(() => {})
    audioContext = null
  }
})
</script>

<style scoped>
/* =============================================
   PROFESSIONAL SCANNER - Minimal & Clean
   ============================================= */

.scanner {
  --black: #000000;
  --white: #ffffff;
  --gray-50: #fafafa;
  --gray-100: #f4f4f5;
  --gray-400: #a1a1aa;
  --gray-500: #71717a;
  --gray-800: #27272a;
  --gray-900: #18181b;
  --success: #22c55e;
  --success-bg: rgba(34, 197, 94, 0.12);
  --error: #ef4444;
  --error-bg: rgba(239, 68, 68, 0.12);

  position: fixed;
  inset: 0;
  background: var(--black);
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
}

/* =============================================
   CAMERA LAYER
   ============================================= */

.scanner__camera {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scanner__video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scanner__gradient {
  position: absolute;
  left: 0;
  right: 0;
  height: 200px;
  pointer-events: none;
}

.scanner__gradient--top {
  top: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%);
}

.scanner__gradient--bottom {
  bottom: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%);
}

/* =============================================
   SCAN TARGET
   ============================================= */

.scanner__target {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}

.target {
  position: relative;
  width: min(280px, 65vw);
  aspect-ratio: 1;
}

.target__corner {
  position: absolute;
  width: 40px;
  height: 40px;
  border-color: var(--white);
  border-style: solid;
  border-width: 0;
}

.target__corner--tl {
  top: 0; left: 0;
  border-top-width: 3px;
  border-left-width: 3px;
  border-top-left-radius: 16px;
}

.target__corner--tr {
  top: 0; right: 0;
  border-top-width: 3px;
  border-right-width: 3px;
  border-top-right-radius: 16px;
}

.target__corner--bl {
  bottom: 0; left: 0;
  border-bottom-width: 3px;
  border-left-width: 3px;
  border-bottom-left-radius: 16px;
}

.target__corner--br {
  bottom: 0; right: 0;
  border-bottom-width: 3px;
  border-right-width: 3px;
  border-bottom-right-radius: 16px;
}

.target__pulse {
  position: absolute;
  inset: -8px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.02); opacity: 0.8; }
}

.scanner__hint {
  color: var(--white);
  font-size: 0.9375rem;
  font-weight: 500;
  text-align: center;
  opacity: 0.8;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
  margin: 0;
}

/* =============================================
   CAMERA ERROR
   ============================================= */

.scanner__error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 2rem;
  background: var(--black);
}

.error-icon {
  width: 64px;
  height: 64px;
  color: var(--gray-400);
}

.error-icon svg {
  width: 100%;
  height: 100%;
}

.error-text {
  color: var(--gray-400);
  font-size: 1rem;
  text-align: center;
  max-width: 300px;
  line-height: 1.5;
  margin: 0;
}

.error-retry {
  padding: 0.875rem 2rem;
  background: var(--white);
  border: none;
  border-radius: 100px;
  color: var(--black);
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.error-retry:active {
  transform: scale(0.97);
  opacity: 0.9;
}

/* =============================================
   HEADER
   ============================================= */

.scanner__header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  padding-top: max(1rem, env(safe-area-inset-top));
}

.header-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: var(--white);
  cursor: pointer;
  transition: background 0.15s ease;
}

.header-btn svg {
  width: 20px;
  height: 20px;
}

.header-btn:active {
  background: rgba(255, 255, 255, 0.2);
}

.header-spacer {
  width: 44px;
}

.header-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 100px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--gray-400);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--gray-500);
  transition: all 0.3s ease;
}

.header-status--active .status-dot {
  background: var(--success);
  box-shadow: 0 0 12px var(--success);
}

.header-status--active {
  color: var(--white);
}

/* =============================================
   BOTTOM CONTROL
   ============================================= */

.scanner__control {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  justify-content: center;
  padding: 2rem;
  padding-bottom: max(2rem, calc(env(safe-area-inset-bottom) + 1rem));
}

.scan-toggle {
  position: relative;
  width: 80px;
  height: 80px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}

.scan-toggle__ring {
  position: absolute;
  inset: 0;
  border: 3px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  transition: all 0.2s ease;
}

.scan-toggle--active .scan-toggle__ring {
  border-color: var(--success);
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
}

.scan-toggle__inner {
  position: absolute;
  inset: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--white);
  border-radius: 50%;
  color: var(--black);
  transition: all 0.2s ease;
}

.scan-toggle--active .scan-toggle__inner {
  background: var(--success);
  color: var(--white);
}

.scan-toggle__inner svg {
  width: 24px;
  height: 24px;
}

.scan-toggle:active .scan-toggle__inner {
  transform: scale(0.92);
}

/* =============================================
   RESULT OVERLAY
   ============================================= */

.result {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.result--success {
  background: var(--success);
}

.result--error {
  background: var(--error);
}

.result__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 320px;
  width: 100%;
}

.result__icon {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  margin-bottom: 1.5rem;
  animation: pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.result__icon svg {
  width: 48px;
  height: 48px;
  color: var(--white);
}

@keyframes pop {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.result__status {
  color: var(--white);
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.result__details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 1rem;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  width: 100%;
}

.detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.375rem 0;
}

.detail__label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}

.detail__value {
  color: var(--white);
  font-size: 0.9375rem;
  font-weight: 600;
}

.result__error-msg {
  color: rgba(255, 255, 255, 0.85);
  font-size: 1rem;
  margin: 0.5rem 0 0 0;
  line-height: 1.4;
}

.result__next {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  margin-top: 2rem;
  padding: 1rem 2rem;
  background: var(--white);
  border: none;
  border-radius: 100px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.result--success .result__next {
  color: var(--success);
}

.result--error .result__next {
  color: var(--error);
}

.result__next svg {
  width: 20px;
  height: 20px;
}

.result__next:active {
  transform: scale(0.97);
  opacity: 0.9;
}

/* =============================================
   TRANSITIONS
   ============================================= */

.result-enter-active {
  animation: result-in 0.3s ease-out;
}

.result-leave-active {
  animation: result-out 0.2s ease-in;
}

@keyframes result-in {
  0% { opacity: 0; transform: scale(1.1); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes result-out {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.95); }
}

/* Hide when showing result */
.scanner--result .scanner__header,
.scanner--result .scanner__control {
  opacity: 0;
  pointer-events: none;
}
</style>
