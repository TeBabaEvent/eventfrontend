import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { buildApiUrl, getAuthHeaders, API_ENDPOINTS } from '@/config/api'

export interface User {
  id: string
  email: string
  name?: string
  role?: 'admin' | 'user'
}

export const useAuthStore = defineStore('auth', () => {
  // Helper sécurisé pour localStorage
  const getStorageItem = (key: string): string | null => {
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.error('localStorage access error:', error)
      return null
    }
  }
  
  const setStorageItem = (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.error('localStorage write error:', error)
    }
  }
  
  const removeStorageItem = (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('localStorage remove error:', error)
    }
  }
  
  // État
  const token = ref<string | null>(getStorageItem('auth_token'))
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Actions
  function setToken(newToken: string | null) {
    token.value = newToken
    if (newToken) {
      setStorageItem('auth_token', newToken)
    } else {
      removeStorageItem('auth_token')
    }
  }

  function setUser(newUser: User | null) {
    user.value = newUser
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading
  }

  async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    setLoading(true)
    
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.LOGIN), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        if (response.status === 401) {
          return { success: false, error: 'auth.invalidCredentials' }
        }
        if (response.status === 429) {
          return { success: false, error: 'auth.tooManyAttempts' }
        }
        if (response.status >= 500) {
          return { success: false, error: 'auth.serverError' }
        }
        const errorData = await response.json().catch(() => ({}))
        return { success: false, error: errorData.message || 'auth.loginError' }
      }

      const data = await response.json()
      
      // Validation des données reçues
      if (!data.access_token || !data.user) {
        throw new Error('Invalid response data')
      }
      
      // Stocker le token et l'utilisateur
      setToken(data.access_token)
      setUser(data.user)
      
      // Stocker aussi l'email pour checkAuth
      if (data.user.email) {
        setStorageItem('user_email', data.user.email)
      }
      
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'auth.loginError' 
      }
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    // Appeler le backend pour logger la déconnexion
    if (token.value) {
      try {
        await fetch(buildApiUrl(API_ENDPOINTS.LOGOUT), {
          method: 'POST',
          headers: getAuthHeaders(token.value)
        })
      } catch (error) {
        // Continuer même si l'appel échoue (token invalide, serveur down, etc.)
        console.error('Logout backend error:', error)
      }
    }
    
    // Nettoyer le state local
    setToken(null)
    setUser(null)
    removeStorageItem('user_email')
    // Redirection sera gérée par le composant
  }

  function setInitialized(value: boolean) {
    isInitialized.value = value
  }

  async function checkAuth(): Promise<boolean> {
    if (!token.value) {
      setInitialized(true)
      return false
    }

    setLoading(true)
    
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.ME), {
        method: 'GET',
        headers: getAuthHeaders(token.value)
      })

      if (!response.ok) {
        throw new Error('Token invalid')
      }

      const userData = await response.json()
      setUser(userData)
      setInitialized(true)
      return true
    } catch (error) {
      console.error('Auth check error:', error)
      logout()
      setInitialized(true)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    // State
    token,
    user,
    isLoading,
    isInitialized,
    
    // Getters
    isAuthenticated,
    isAdmin,
    
    // Actions
    login,
    logout,
    checkAuth,
    setToken,
    setUser,
    setLoading,
    setInitialized
  }
})

