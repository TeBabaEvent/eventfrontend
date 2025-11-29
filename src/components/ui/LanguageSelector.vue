<template>
  <div class="language-selector" ref="selectorRef">
    <button
      class="language-selector__trigger"
      @click="toggleDropdown"
      :aria-label="`Change language - Current: ${currentLocaleName}`"
    >
      <span class="language-selector__code">{{ currentLocale.toUpperCase() }}</span>
      <i class="fas fa-chevron-down" :class="{ 'rotated': isOpen }"></i>
    </button>

    <Transition name="dropdown">
      <ul v-if="isOpen" class="language-selector__dropdown">
        <li
          v-for="lang in availableLocales"
          :key="lang.code"
          class="language-selector__item"
        >
          <button
            class="language-selector__option"
            :class="{ 'active': currentLocale === lang.code }"
            @click="selectLanguage(lang.code)"
          >
            <span class="language-selector__name">{{ lang.name }}</span>
            <span class="language-selector__code-small">{{ lang.code.toUpperCase() }}</span>
          </button>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import type { LocaleCode } from '@/i18n/locales'

const { currentLocale, currentLocaleName, availableLocales, changeLocale } = useLanguage()

const isOpen = ref(false)
const selectorRef = ref<HTMLElement>()

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}


const selectLanguage = (locale: LocaleCode) => {
  changeLocale(locale)
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (selectorRef.value && !selectorRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* ========================================
   LANGUAGE SELECTOR - Premium Minimal Style
   ======================================== */

.language-selector {
  position: relative;
  z-index: 100;
}

/* Trigger Button - Matching navbar links */
.language-selector__trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  font-weight: 500;
  font-family: var(--font-heading);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  letter-spacing: 0.5px;
}

.language-selector__trigger:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.language-selector__code {
  position: relative;
  z-index: 1;
}

.language-selector__trigger i {
  font-size: 8px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
  opacity: 0.6;
}

.language-selector__trigger:hover i {
  opacity: 1;
}

.language-selector__trigger i.rotated {
  transform: rotate(180deg);
}

/* Dropdown Menu - Premium Glass Style */
.language-selector__dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  min-width: 200px;
  background: rgba(8, 8, 8, 0.92);
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  box-shadow:
    0 25px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.03) inset;
  overflow: hidden;
  list-style: none;
  padding: 6px;
  margin: 0;
}

.language-selector__item {
  margin: 0;
}

/* Options - Premium Pill Style */
.language-selector__option {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-radius: 14px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  position: relative;
}

.language-selector__option:hover {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.95);
}

.language-selector__option.active {
  background: rgba(220, 20, 60, 0.1);
  color: #fff;
}

.language-selector__option.active::before {
  content: '';
  position: absolute;
  left: 4px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 18px;
  background: var(--color-primary);
  border-radius: 2px;
  box-shadow: 0 0 8px rgba(220, 20, 60, 0.5);
}

.language-selector__name {
  flex: 1;
  font-weight: 500;
  letter-spacing: 0.2px;
}

.language-selector__code-small {
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.3);
  font-family: var(--font-heading);
  letter-spacing: 1px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 6px;
}

.language-selector__option:hover .language-selector__code-small {
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.06);
}

.language-selector__option.active .language-selector__code-small {
  color: var(--color-primary);
  background: rgba(220, 20, 60, 0.15);
}

/* Transitions */
.dropdown-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

/* Responsive */
@media (max-width: 768px) {
  .language-selector {
    width: 100%;
    max-width: 200px;
    z-index: 10;
    position: relative;
  }

  .language-selector__trigger {
    width: 100%;
    justify-content: center;
    padding: 14px 24px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 50px;
    font-size: 13px;
    gap: 10px;
  }

  .language-selector__trigger:hover {
    background: rgba(220, 20, 60, 0.1);
    border-color: rgba(220, 20, 60, 0.2);
  }

  .language-selector__dropdown {
    position: absolute;
    right: auto;
    left: 50%;
    transform: translateX(-50%);
    min-width: 200px;
    width: auto;
    max-width: 220px;
    bottom: calc(100% + 8px);
    top: auto;
    border-radius: 16px;
    padding: 6px;
  }

  .dropdown-enter-from {
    opacity: 0;
    transform: translateX(-50%) translateY(8px) scale(0.95);
  }

  .dropdown-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(8px) scale(0.95);
  }
}
</style>

