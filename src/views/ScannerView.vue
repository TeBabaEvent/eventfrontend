<template>
  <div class="scanner-app">
    <!-- Top Bar - Minimal -->
    <header class="top-bar">
      <button
        v-if="canAccessDashboard"
        @click="goToDashboard"
        class="top-bar__btn top-bar__btn--back"
      >
        <i class="fas fa-arrow-left"></i>
        <span>Dashboard</span>
      </button>
      <div v-else class="top-bar__spacer"></div>

      <!-- Status Indicator -->
      <div class="status-indicator" :class="{ 'status-indicator--active': isScanning }">
        <span class="status-dot"></span>
        <span class="status-text">{{ isScanning ? 'Actif' : 'En pause' }}</span>
      </div>

      <button @click="logout" class="top-bar__btn top-bar__btn--logout">
        <i class="fas fa-sign-out-alt"></i>
      </button>
    </header>

    <!-- Main Scanner Area -->
    <main class="scanner-area">
      <!-- Event Info (when detected) -->
      <transition name="slide-down">
        <div v-if="currentEventName" class="event-info">
          <i class="fas fa-calendar-check"></i>
          <span>{{ currentEventName }}</span>
        </div>
      </transition>

      <!-- Scanner Viewport -->
      <div class="viewport" :class="{ 'viewport--active': isScanning, 'viewport--result': scanResult }">
        <!-- Camera Feed -->
        <div v-show="!scanResult" class="camera-feed">
          <!-- Camera Error Message -->
          <div v-if="cameraError" class="camera-error">
            <i class="fas fa-exclamation-triangle"></i>
            <p>{{ cameraError }}</p>
            <button @click="startScanning" class="retry-btn">
              <i class="fas fa-redo"></i>
              Réessayer
            </button>
          </div>

          <video ref="videoRef" class="camera-video" autoplay playsinline muted></video>

          <!-- Scan Frame Overlay -->
          <div class="scan-overlay">
            <div class="scan-frame">
              <svg class="frame-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                <!-- Corner brackets -->
                <path d="M0,25 L0,8 Q0,0 8,0 L25,0" class="frame-corner"/>
                <path d="M75,0 L92,0 Q100,0 100,8 L100,25" class="frame-corner"/>
                <path d="M100,75 L100,92 Q100,100 92,100 L75,100" class="frame-corner"/>
                <path d="M25,100 L8,100 Q0,100 0,92 L0,75" class="frame-corner"/>
              </svg>

              <!-- Scan line animation -->
              <div v-if="isScanning" class="scan-beam"></div>
            </div>
          </div>

          <!-- Camera Controls -->
          <div class="camera-controls">
            <button
              @click="isScanning ? stopScanning() : startScanning()"
              class="control-btn"
              :class="isScanning ? 'control-btn--active' : ''"
            >
              <div class="control-btn__inner">
                <i :class="isScanning ? 'fas fa-pause' : 'fas fa-play'"></i>
              </div>
            </button>
          </div>
        </div>

        <!-- Scan Result -->
        <transition name="result-appear">
          <div v-if="scanResult" class="result-display" :class="resultClass">
            <!-- Result Icon -->
            <div class="result-icon">
              <div class="result-icon__circle">
                <i :class="resultIcon"></i>
              </div>
            </div>

            <!-- Result Message -->
            <p class="result-message">{{ scanResult.message }}</p>

            <!-- Ticket Info -->
            <div v-if="scanResult.holder || scanResult.event_name" class="ticket-info">
              <div v-if="scanResult.event_name" class="ticket-row ticket-row--event">
                <span class="ticket-row__icon"><i class="fas fa-calendar"></i></span>
                <span class="ticket-row__value">{{ scanResult.event_name }}</span>
              </div>
              <div v-if="scanResult.holder" class="ticket-row">
                <span class="ticket-row__label">Titulaire</span>
                <span class="ticket-row__value">{{ scanResult.holder }}</span>
              </div>
              <div v-if="scanResult.ticket_code" class="ticket-row">
                <span class="ticket-row__label">Code</span>
                <span class="ticket-row__value ticket-row__value--mono">{{ scanResult.ticket_code }}</span>
              </div>
              <div v-if="scanResult.pack_name" class="ticket-row">
                <span class="ticket-row__label">Pack</span>
                <span class="ticket-row__value">{{ scanResult.pack_name }}</span>
              </div>
              <div v-if="scanResult.scanned_at" class="ticket-row">
                <span class="ticket-row__label">Heure</span>
                <span class="ticket-row__value">{{ formatDateTime(scanResult.scanned_at) }}</span>
              </div>
            </div>

            <!-- Next Scan Button -->
            <button @click="resetScan" class="next-btn">
              <span>Scanner suivant</span>
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </transition>
      </div>

      <!-- Stats Bar -->
      <transition name="fade-up">
        <div v-if="stats" class="stats-bar">
          <div class="stat">
            <span class="stat__value">{{ stats.success_count || 0 }}</span>
            <span class="stat__label">Validés</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <span class="stat__value">{{ (stats.invalid_count || 0) + (stats.already_used_count || 0) }}</span>
            <span class="stat__label">Refusés</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <span class="stat__value">{{ stats.scanned_tickets || 0 }}</span>
            <span class="stat__label">Entrées</span>
          </div>
        </div>
      </transition>
    </main>

    <!-- History Panel -->
    <aside v-if="recentScans.length > 0" class="history-panel">
      <div class="history-header">
        <span>Derniers scans</span>
        <span class="history-count">{{ recentScans.length }}</span>
      </div>
      <div class="history-scroll">
        <div
          v-for="scan in recentScans"
          :key="scan.id"
          class="history-entry"
          :class="`history-entry--${scan.result}`"
        >
          <div class="history-entry__icon">
            <i :class="getHistoryIcon(scan.result)"></i>
          </div>
          <div class="history-entry__info">
            <span class="history-entry__name">{{ scan.holder || 'Inconnu' }}</span>
            <span class="history-entry__time">{{ formatTime(scan.scanned_at) }}</span>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useScanner } from '@/composables/useScanner'
import { logger } from '@/services/logger'
import type { ScanResponse, ScanLog, ScanStats } from '@/types'
import QrScanner from 'qr-scanner'

const router = useRouter()
const { locale } = useI18n()
const authStore = useAuthStore()
const { validateTicket, getStats, getHistory, authError } = useScanner()

// State
const videoRef = ref<HTMLVideoElement>()
const isScanning = ref(false)
const currentEventId = ref<string>('')
const currentEventName = ref<string>('')
const stats = ref<ScanStats | null>(null)
const recentScans = ref<ScanLog[]>([])
const scanResult = ref<ScanResponse | null>(null)
const cameraError = ref<string | null>(null)

// Use shallowRef for non-reactive complex objects
const qrScanner = shallowRef<QrScanner | null>(null)
let lastScanTime = 0
const SCAN_DEBOUNCE_MS = 1500 // Prevent scanning same QR within 1.5s

// Reusable AudioContext for sounds (avoid memory leaks)
let audioContext: AudioContext | null = null
function getAudioContext(): AudioContext | null {
  try {
    if (!audioContext || audioContext.state === 'closed') {
      audioContext = new AudioContext()
    }
    return audioContext
  } catch {
    return null
  }
}

// Computed
const canAccessDashboard = computed(() => {
  const role = authStore.user?.role
  return role === 'admin' || role === 'super_admin'
})

const resultClass = computed(() => {
  if (!scanResult.value) return ''
  return scanResult.value.valid ? 'result-display--success' : 'result-display--error'
})

const resultIcon = computed(() => {
  if (!scanResult.value) return ''
  if (scanResult.value.valid) return 'fas fa-check'
  switch (scanResult.value.result) {
    case 'already_used': return 'fas fa-redo'
    case 'expired': return 'fas fa-clock'
    case 'cancelled': return 'fas fa-ban'
    case 'wrong_event': return 'fas fa-calendar-times'
    default: return 'fas fa-times'
  }
})

// Methods
function goToDashboard() {
  router.push('/dashboard')
}

function logout() {
  authStore.logout()
  router.push('/login')
}

async function startScanning() {
  if (!videoRef.value) return

  cameraError.value = null

  try {
    // Check if camera is available before creating scanner
    const hasCamera = await QrScanner.hasCamera()
    if (!hasCamera) {
      cameraError.value = 'Aucune caméra détectée'
      return
    }

    qrScanner.value = new QrScanner(
      videoRef.value,
      (result) => {
        // Debounce: prevent scanning same QR within 1.5s
        const now = Date.now()
        if (now - lastScanTime < SCAN_DEBOUNCE_MS) {
          return
        }
        lastScanTime = now

        if (isScanning.value) {
          isScanning.value = false
          handleScan(result.data)
        }
      },
      {
        returnDetailedScanResult: true,
        highlightScanRegion: true,
        highlightCodeOutline: true
      }
    )

    await qrScanner.value.start()
    isScanning.value = true
  } catch (err) {
    const error = err as Error
    logger.error('Camera error:', error)

    // Provide user-friendly error messages
    if (error.message?.includes('NotAllowedError') || error.message?.includes('Permission')) {
      cameraError.value = 'Accès caméra refusé. Autorisez l\'accès dans les paramètres.'
    } else if (error.message?.includes('NotFoundError')) {
      cameraError.value = 'Aucune caméra trouvée sur cet appareil.'
    } else if (error.message?.includes('https') || error.message?.includes('secure')) {
      cameraError.value = 'HTTPS requis pour accéder à la caméra.'
    } else {
      cameraError.value = 'Erreur lors de l\'accès à la caméra.'
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
  const result = await validateTicket(qrData)

  if (result) {
    scanResult.value = result

    if (result.valid) {
      playSuccessSound()
    } else {
      playErrorSound()
    }

    if (result.event_id) {
      currentEventId.value = result.event_id
      currentEventName.value = result.event_name || ''
    }

    await Promise.all([loadStats(), loadHistory()])
  }
}

function resetScan() {
  scanResult.value = null
  if (qrScanner.value && !isScanning.value) {
    qrScanner.value.start()
    isScanning.value = true
  }
}

async function loadStats() {
  if (!currentEventId.value) {
    stats.value = null
    return
  }
  const result = await getStats(currentEventId.value)
  if (result) stats.value = result
}

async function loadHistory() {
  const result = await getHistory(currentEventId.value || undefined, 8)
  if (result) recentScans.value = result
}

function formatTime(dateString: string) {
  return new Intl.DateTimeFormat(locale.value, {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString))
}

function formatDateTime(dateString: string) {
  return new Intl.DateTimeFormat(locale.value, {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString))
}

function getHistoryIcon(result: string) {
  switch (result) {
    case 'success': return 'fas fa-check'
    case 'already_used': return 'fas fa-redo'
    case 'expired': return 'fas fa-clock'
    case 'cancelled': return 'fas fa-ban'
    case 'wrong_event': return 'fas fa-calendar-times'
    default: return 'fas fa-times'
  }
}

function playSuccessSound() {
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.2)
  } catch { /* ignore */ }
}

function playErrorSound() {
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 220
    osc.type = 'square'
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.3)
  } catch { /* ignore */ }
}

// Rediriger vers login si session expirée
watch(authError, (hasAuthError) => {
  if (hasAuthError) {
    router.push({ path: '/login', query: { redirect: '/scanner' } })
  }
})

onMounted(async () => {
  // Vérifier l'authentification avant de charger
  if (!authStore.isAuthenticated) {
    router.push({ path: '/login', query: { redirect: '/scanner' } })
    return
  }

  // Charger l'historique une seule fois au démarrage
  await loadHistory()
})

onUnmounted(() => {
  // Cleanup QR scanner
  if (qrScanner.value) {
    qrScanner.value.destroy()
    qrScanner.value = null
  }

  // Cleanup AudioContext
  if (audioContext && audioContext.state !== 'closed') {
    audioContext.close().catch(() => {})
    audioContext = null
  }
})
</script>

<style scoped>
/* ============================================
   PROFESSIONAL QR SCANNER - Clean & Focused
   ============================================ */

.scanner-app {
  --bg-dark: #09090b;
  --bg-surface: #18181b;
  --bg-elevated: #27272a;
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-medium: rgba(255, 255, 255, 0.1);
  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
  --text-muted: #71717a;
  --accent: #dc143c;
  --accent-glow: rgba(220, 20, 60, 0.5);
  --success: #22c55e;
  --success-glow: rgba(34, 197, 94, 0.4);
  --error: #ef4444;
  --error-glow: rgba(239, 68, 68, 0.4);

  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--bg-dark);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
}

/* ============================================
   TOP BAR
   ============================================ */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0;
}

.top-bar__spacer {
  width: 80px;
}

.top-bar__btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: 1px solid var(--border-medium);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.top-bar__btn:hover {
  background: var(--bg-elevated);
  color: var(--text-primary);
  border-color: var(--border-medium);
}

.top-bar__btn--back {
  padding-right: 1rem;
}

.top-bar__btn--logout {
  width: 36px;
  height: 36px;
  padding: 0;
  justify-content: center;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: var(--bg-elevated);
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-muted);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-muted);
  transition: all 0.3s ease;
}

.status-indicator--active .status-dot {
  background: var(--success);
  box-shadow: 0 0 8px var(--success);
}

.status-indicator--active .status-text {
  color: var(--success);
}

/* ============================================
   SCANNER AREA
   ============================================ */
.scanner-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 1rem;
  overflow: hidden;
}

/* Event Info */
.event-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: linear-gradient(135deg, rgba(220, 20, 60, 0.15), rgba(220, 20, 60, 0.05));
  border: 1px solid rgba(220, 20, 60, 0.2);
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.event-info i {
  color: var(--accent);
}

/* ============================================
   VIEWPORT
   ============================================ */
.viewport {
  flex: 1;
  position: relative;
  background: var(--bg-surface);
  border-radius: 20px;
  overflow: hidden;
  border: 2px solid var(--border-subtle);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  /* Fix CLS: Reserve minimum aspect ratio */
  min-height: 300px;
  aspect-ratio: 4 / 3;
  contain: layout; /* Improve rendering performance */
}

.viewport--active {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent), 0 0 40px var(--accent-glow);
}

/* Camera Feed */
.camera-feed {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Fix CLS: Prevent video from causing layout shifts */
  position: absolute;
  inset: 0;
}

/* Camera Error */
.camera-error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
  z-index: 10;
  background: var(--bg-surface);
}

.camera-error i {
  font-size: 3rem;
  color: var(--error);
}

.camera-error p {
  font-size: 1rem;
  color: var(--text-secondary);
  max-width: 280px;
  margin: 0;
}

.retry-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--accent);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px var(--accent-glow);
}

/* Scan Overlay */
.scan-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.scan-frame {
  position: relative;
  width: min(280px, 70vw);
  aspect-ratio: 1;
}

.frame-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.frame-corner {
  fill: none;
  stroke: var(--accent);
  stroke-width: 3;
  stroke-linecap: round;
  filter: drop-shadow(0 0 6px var(--accent-glow));
}

.scan-beam {
  position: absolute;
  left: 8%;
  right: 8%;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  box-shadow: 0 0 20px var(--accent-glow), 0 0 40px var(--accent-glow);
  animation: beam-scan 2s ease-in-out infinite;
}

@keyframes beam-scan {
  0%, 100% { top: 10%; opacity: 0.5; }
  50% { top: 85%; opacity: 1; }
}

/* Camera Controls */
.camera-controls {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: auto;
}

.control-btn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.3);
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.control-btn:hover {
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
}

.control-btn--active {
  border-color: var(--accent);
  background: rgba(220, 20, 60, 0.2);
}

.control-btn__inner {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  color: var(--bg-dark);
  transition: all 0.2s ease;
}

.control-btn--active .control-btn__inner {
  background: var(--accent);
  color: white;
}

/* ============================================
   RESULT DISPLAY
   ============================================ */
.result-display {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: var(--bg-surface);
}

.result-icon {
  margin-bottom: 1rem;
}

.result-icon__circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  animation: icon-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes icon-pop {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

.result-display--success .result-icon__circle {
  background: rgba(34, 197, 94, 0.15);
  color: var(--success);
  box-shadow: 0 0 40px var(--success-glow);
}

.result-display--error .result-icon__circle {
  background: rgba(239, 68, 68, 0.15);
  color: var(--error);
  box-shadow: 0 0 40px var(--error-glow);
}

.result-message {
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;
  margin: 0 0 1.25rem 0;
  color: var(--text-primary);
}

/* Ticket Info */
.ticket-info {
  width: 100%;
  max-width: 320px;
  background: var(--bg-elevated);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1.25rem;
}

.ticket-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-subtle);
}

.ticket-row:last-child {
  border-bottom: none;
}

.ticket-row--event {
  background: linear-gradient(135deg, rgba(220, 20, 60, 0.12), rgba(220, 20, 60, 0.05));
  justify-content: flex-start;
  gap: 0.625rem;
  font-weight: 600;
}

.ticket-row__icon {
  color: var(--accent);
}

.ticket-row__label {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.ticket-row__value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.ticket-row__value--mono {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 0.8125rem;
  letter-spacing: 0.02em;
}

/* Next Button */
.next-btn {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.875rem 1.75rem;
  background: var(--accent);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 20px var(--accent-glow);
}

.next-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px var(--accent-glow);
}

.next-btn i {
  font-size: 0.875rem;
  transition: transform 0.2s ease;
}

.next-btn:hover i {
  transform: translateX(3px);
}

/* ============================================
   STATS BAR
   ============================================ */
.stats-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 0.875rem 1.5rem;
  background: var(--bg-surface);
  border-radius: 14px;
  border: 1px solid var(--border-subtle);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
}

.stat__value {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.stat__label {
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: var(--border-medium);
}

/* ============================================
   HISTORY PANEL
   ============================================ */
.history-panel {
  flex-shrink: 0;
  background: var(--bg-surface);
  border-top: 1px solid var(--border-subtle);
  max-height: 180px;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-subtle);
}

.history-count {
  padding: 0.125rem 0.5rem;
  background: var(--bg-elevated);
  border-radius: 10px;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.history-scroll {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  overflow-x: auto;
  scrollbar-width: none;
}

.history-scroll::-webkit-scrollbar {
  display: none;
}

.history-entry {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--bg-elevated);
  border-radius: 10px;
  flex-shrink: 0;
  min-width: 140px;
}

.history-entry__icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 0.75rem;
}

.history-entry--success .history-entry__icon {
  background: rgba(34, 197, 94, 0.15);
  color: var(--success);
}

.history-entry--already_used .history-entry__icon {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.history-entry--invalid .history-entry__icon {
  background: rgba(239, 68, 68, 0.15);
  color: var(--error);
}

.history-entry__info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.history-entry__name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-entry__time {
  font-size: 0.6875rem;
  color: var(--text-muted);
}

/* ============================================
   TRANSITIONS
   ============================================ */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.3s ease;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.result-appear-enter-active {
  animation: result-in 0.35s ease-out;
}

.result-appear-leave-active {
  animation: result-out 0.2s ease-in;
}

@keyframes result-in {
  0% { opacity: 0; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes result-out {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.95); }
}

/* ============================================
   RESPONSIVE & SAFE AREAS
   ============================================ */
@supports (padding-top: env(safe-area-inset-top)) {
  .top-bar {
    padding-top: max(0.75rem, env(safe-area-inset-top));
  }

  .history-panel {
    padding-bottom: env(safe-area-inset-bottom);
  }
}

@media (max-height: 600px) {
  .scanner-area {
    padding: 0.75rem;
    gap: 0.75rem;
  }

  .history-panel {
    max-height: 120px;
  }
}
</style>
