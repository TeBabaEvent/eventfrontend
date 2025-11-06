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
.language-selector {
  position: relative;
  z-index: 100;
}

/* Trigger Button - Style cohérent avec nav links */
.language-selector__trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9375rem;
  font-weight: 600;
  font-family: var(--font-heading);
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
  letter-spacing: 0.5px;
}

/* Effet de fond au hover - similaire aux nav links */
.language-selector__trigger::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(220, 20, 60, 0.1);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(220, 20, 60, 0.2);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.language-selector__trigger:hover::before,
.language-selector__trigger:focus::before {
  opacity: 1;
}

.language-selector__trigger:hover {
  color: var(--color-white);
}

.language-selector__code {
  position: relative;
  z-index: 1;
}

.language-selector__trigger i {
  font-size: 0.625rem;
  transition: transform var(--transition-normal);
  position: relative;
  z-index: 1;
  opacity: 0.7;
}

.language-selector__trigger:hover i {
  opacity: 1;
}

.language-selector__trigger i.rotated {
  transform: rotate(180deg);
}

/* Dropdown Menu */
.language-selector__dropdown {
  position: absolute;
  top: calc(100% + 0.75rem);
  right: 0;
  min-width: 200px;
  background: rgba(15, 15, 15, 0.98);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(220, 20, 60, 0.2);
  border-radius: var(--radius-sm);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(220, 20, 60, 0.1);
  overflow: hidden;
  list-style: none;
  padding: 0.5rem;
  margin: 0;
}

.language-selector__item {
  margin: 0;
}

/* Options */
.language-selector__option {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.875rem 1rem;
  background: transparent;
  border: none;
  border-radius: calc(var(--radius-sm) - 2px);
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
  position: relative;
}

.language-selector__option:hover {
  background: rgba(220, 20, 60, 0.08);
  color: var(--color-white);
  transform: translateX(2px);
}

.language-selector__option.active {
  background: rgba(220, 20, 60, 0.15);
  color: var(--color-white);
}

.language-selector__option.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 60%;
  background: var(--color-primary);
  border-radius: 0 2px 2px 0;
}

.language-selector__name {
  flex: 1;
  font-weight: 500;
}

.language-selector__code-small {
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgba(220, 20, 60, 0.8);
  font-family: var(--font-heading);
  letter-spacing: 0.5px;
}

.language-selector__option.active .language-selector__code-small {
  color: var(--color-primary);
}

/* Transitions */
.dropdown-enter-active {
  transition: all 0.25s ease-out;
}

.dropdown-leave-active {
  transition: all 0.2s ease-in;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

/* Responsive */
@media (max-width: 768px) {
  .language-selector {
    width: 100%;
    z-index: 10;
  }
  
  .language-selector__trigger {
    width: 100%;
    justify-content: center;
    padding: 1.25rem 1.5rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--radius-sm);
  }
  
  .language-selector__trigger::before {
    opacity: 0;
  }
  
  .language-selector__trigger:hover {
    background: rgba(220, 20, 60, 0.12);
    border-color: rgba(220, 20, 60, 0.35);
  }
  
  .language-selector__trigger:hover::before {
    opacity: 0;
  }

  .language-selector__dropdown {
    right: auto;
    left: 50%;
    transform: translateX(-50%);
    min-width: min(280px, 90%);
    width: 100%;
    max-width: 100%;
  }
}
</style>

