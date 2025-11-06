import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  // État
  const isLoading = ref(false)
  const loadingMessage = ref('')

  // Actions
  function startLoading(message = '') {
    isLoading.value = true
    loadingMessage.value = message
  }

  function stopLoading() {
    isLoading.value = false
    loadingMessage.value = ''
  }

  return {
    // State
    isLoading,
    loadingMessage,
    
    // Actions
    startLoading,
    stopLoading
  }
})
