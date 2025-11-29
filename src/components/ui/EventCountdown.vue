<template>
  <div class="countdown" v-if="!isExpired">
    <div class="countdown__item">
      <div class="countdown__number">{{ days }}</div>
      <div class="countdown__label">{{ t('countdown.days') }}</div>
    </div>
    <div class="countdown__separator">:</div>
    <div class="countdown__item">
      <div class="countdown__number">{{ hours }}</div>
      <div class="countdown__label">{{ t('countdown.hours') }}</div>
    </div>
    <div class="countdown__separator">:</div>
    <div class="countdown__item">
      <div class="countdown__number">{{ minutes }}</div>
      <div class="countdown__label">{{ t('countdown.minutes') }}</div>
    </div>
    <div class="countdown__separator">:</div>
    <div class="countdown__item">
      <div class="countdown__number">{{ seconds }}</div>
      <div class="countdown__label">{{ t('countdown.seconds') }}</div>
    </div>
  </div>
  <div v-else class="countdown__expired">
    {{ t('countdown.started') }}
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  eventDate: {
    type: String,
    required: true
  }
})

const { t } = useI18n()

const days = ref('00')
const hours = ref('00')
const minutes = ref('00')
const seconds = ref('00')
const isExpired = ref(false)

let intervalId: number | null = null

const updateCountdown = () => {
  const now = new Date().getTime()
  const eventTime = new Date(props.eventDate).getTime()
  const distance = eventTime - now
  
  if (distance < 0) {
    isExpired.value = true
    if (intervalId) clearInterval(intervalId)
    return
  }
  
  const d = Math.floor(distance / (1000 * 60 * 60 * 24))
  const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
  const s = Math.floor((distance % (1000 * 60)) / 1000)
  
  days.value = String(d).padStart(2, '0')
  hours.value = String(h).padStart(2, '0')
  minutes.value = String(m).padStart(2, '0')
  seconds.value = String(s).padStart(2, '0')
}

onMounted(() => {
  updateCountdown()
  intervalId = setInterval(updateCountdown, 1000) as unknown as number
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<style scoped>
.countdown {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 1.25rem 0;
}

.countdown__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  position: relative;
  padding: 0.875rem 0.5rem;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  min-width: 72px;
  width: 72px;
  max-width: 72px;
  flex-shrink: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Gradient border */
.countdown__item::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 14px;
  padding: 1px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.02) 50%,
    rgba(220, 20, 60, 0.15) 100%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.countdown__item:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(220, 20, 60, 0.2);
}

.countdown__item:hover::before {
  opacity: 1;
}

.countdown__number {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
  letter-spacing: -0.5px;
}

.countdown__label {
  font-size: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 600;
  white-space: nowrap;
  text-align: center;
  width: 100%;
}

.countdown__separator {
  display: none;
}

.countdown__expired {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(var(--color-primary-rgb), 0.1);
  border: 1px solid rgba(var(--color-primary-rgb), 0.2);
  border-radius: 50px;
  font-family: var(--font-heading);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary);
  text-align: center;
}

@media (max-width: 768px) {
  .countdown {
    gap: 0.375rem;
    margin: 1rem 0;
  }
  
  .countdown__item {
    min-width: 60px;
    width: 60px;
    max-width: 60px;
    padding: 0.75rem 0.375rem;
    border-radius: 12px;
  }

  .countdown__item::before {
    border-radius: 12px;
  }
  
  .countdown__number {
    font-size: 1.375rem;
  }
  
  .countdown__label {
    font-size: 0.4375rem;
    letter-spacing: 1px;
  }
}

@media (max-width: 480px) {
  .countdown {
    gap: 0.25rem;
    margin: 0.875rem 0;
  }
  
  .countdown__item {
    min-width: 52px;
    width: 52px;
    max-width: 52px;
    padding: 0.625rem 0.25rem;
    border-radius: 10px;
  }

  .countdown__item::before {
    border-radius: 10px;
  }
  
  .countdown__number {
    font-size: 1.125rem;
  }
  
  .countdown__label {
    font-size: 0.375rem;
    letter-spacing: 0.5px;
  }
}
</style>

