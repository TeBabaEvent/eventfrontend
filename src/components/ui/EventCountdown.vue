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
  gap: 1rem;
  margin: 2.5rem 0;
}

.countdown__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  padding: 1.25rem 1rem;
  background: rgba(20, 20, 30, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  min-width: 115px;
  width: 115px;
  max-width: 115px;
  flex-shrink: 0;
  backdrop-filter: blur(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.countdown__item:hover {
  transform: translateY(-3px);
  border-color: rgba(var(--color-primary-rgb), 0.3);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4);
}

.countdown__number {
  font-family: var(--font-heading);
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
  letter-spacing: -1px;
  text-shadow: 0 2px 10px rgba(var(--color-primary-rgb), 0.3);
}

.countdown__label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.65);
  font-weight: 600;
  white-space: nowrap;
  text-align: center;
  width: 100%;
}

.countdown__separator {
  font-size: 1.75rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.3);
  margin: 0 -0.25rem;
  user-select: none;
}

.countdown__expired {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-primary);
  text-align: center;
  padding: 2rem;
  text-shadow: 0 2px 10px rgba(var(--color-primary-rgb), 0.4);
}

@media (max-width: 1024px) {
  .countdown {
    gap: 0.875rem;
  }
  
  .countdown__item {
    min-width: 85px;
    width: 85px;
    max-width: 85px;
    padding: 1.125rem 0.875rem;
  }
  
  .countdown__number {
    font-size: 2.25rem;
  }
}

@media (max-width: 768px) {
  .countdown {
    gap: 0.75rem;
    margin: 2rem 0;
  }
  
  .countdown__item {
    min-width: 75px;
    width: 75px;
    max-width: 75px;
    padding: 1rem 0.75rem;
  }
  
  .countdown__number {
    font-size: 2rem;
  }
  
  .countdown__label {
    font-size: 0.6875rem;
    letter-spacing: 1px;
  }
  
  .countdown__separator {
    font-size: 1.5rem;
    margin: 0 -0.375rem;
  }
}

@media (max-width: 480px) {
  .countdown {
    gap: 0.5rem;
  }
  
  .countdown__item {
    min-width: 70px;
    width: 70px;
    max-width: 70px;
    padding: 0.875rem 0.5rem;
  }
  
  .countdown__number {
    font-size: 1.75rem;
  }
  
  .countdown__label {
    font-size: 0.625rem;
    letter-spacing: 0.5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }
  
  .countdown__separator {
    display: none;
  }
}

@media (max-width: 380px) {
  .countdown__item {
    min-width: 65px;
    width: 65px;
    max-width: 65px;
    padding: 0.75rem 0.375rem;
  }
  
  .countdown__number {
    font-size: 1.5rem;
  }
  
  .countdown__label {
    font-size: 0.5625rem;
    letter-spacing: 0.25px;
  }
}
</style>

