import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { buildApiUrl, getAuthHeaders, API_ENDPOINTS } from '@/config/api'
import { logger } from '@/services/logger'

export interface User {
  id: string
  email: string
  name?: string
  role?: 'admin' | 'super_admin' | 'steward' | 'user'
}

// Key for localStorage to remember if user was logged in (survives page reload)
const WAS_LOGGED_IN_KEY = 'wasLoggedIn'

export const useAuthStore = defineStore('auth', () => {
  // State - no token stored (in httpOnly cookie now)
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)
  
  // Check if user was previously logged in (survives page reload)
  const wasLoggedIn = (): boolean => localStorage.getItem(WAS_LOGGED_IN_KEY) === 'true'
  const setWasLoggedIn = (value: boolean): void => {
    if (value) {
      localStorage.setItem(WAS_LOGGED_IN_KEY, 'true')
    } else {
      localStorage.removeItem(WAS_LOGGED_IN_KEY)
    }
  }

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => {
    return user.value?.role === 'admin' || user.value?.role === 'super_admin'
  })

  function setUser(newUser: User | null) {
    user.value = newUser
    setWasLoggedIn(!!newUser) // Persist login state for page reload
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading
  }

  /**
   * Automatically refreshes the access token using the refresh token cookie.
   * Called when API returns 401 and we have a user (token expired).
   */
  async function refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.REFRESH), {
        method: 'POST',
        credentials: 'include', // Send cookies
        headers: getAuthHeaders()
      })

      if (response.ok) {
        logger.log('Token refreshed successfully')
        return true
      }

      // Refresh failed - user needs to login again
      logger.warn('Token refresh failed')
      return false
    } catch (error) {
      logger.error('Token refresh error:', error)
      return false
    }
  }

  async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    setLoading(true)

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.LOGIN), {
        method: 'POST',
        credentials: 'include', // ✅ Include cookies in request/response
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

      // ✅ Backend now sets httpOnly cookies (access_token, refresh_token)
      // ✅ Only user data is returned in response body
      if (!data.user) {
        throw new Error('Invalid response data')
      }

      setUser(data.user)

      return { success: true }
    } catch (error) {
      logger.error('Login error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'auth.loginError'
      }
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    try {
      // ✅ Backend will clear httpOnly cookies
      await fetch(buildApiUrl(API_ENDPOINTS.LOGOUT), {
        method: 'POST',
        credentials: 'include', // ✅ Send cookies to be cleared
        headers: getAuthHeaders()
      })
    } catch (error) {
      logger.error('Logout backend error:', error)
    }

    // Clear user state and persistent login flag
    setUser(null)
    setWasLoggedIn(false)
  }

  function setInitialized(value: boolean) {
    isInitialized.value = value
  }

  /**
   * Check if user is authenticated by calling /me endpoint
   * @param retryCount - Internal counter to prevent infinite loops (max 1 retry after token refresh)
   */
  async function checkAuth(retryCount = 0): Promise<boolean> {
    setLoading(true)

    try {
      // ✅ Token is in httpOnly cookie, sent automatically
      const response = await fetch(buildApiUrl(API_ENDPOINTS.ME), {
        method: 'GET',
        credentials: 'include', // ✅ Include cookies
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        // Token might be expired, try refresh ONLY if:
        // 1. User was logged in before (survives page reload via localStorage)
        // 2. We haven't already retried (prevent infinite loop)
        if (response.status === 401 && wasLoggedIn() && retryCount < 1) {
          const refreshed = await refreshToken()
          if (refreshed) {
            // Retry with new token (increment retryCount to prevent loop)
            return await checkAuth(retryCount + 1)
          }
          // Refresh failed - clear persistent login state
          setWasLoggedIn(false)
        }

        // Not authenticated (normal for non-logged users)
        setUser(null)
        setInitialized(true)
        return false
      }

      const userData = await response.json()
      setUser(userData)
      setInitialized(true)
      return true
    } catch (error) {
      logger.error('Auth check error:', error)
      setUser(null)
      setInitialized(true)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    isLoading,
    isInitialized,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    checkAuth,
    refreshToken,
    setUser,
    setLoading,
    setInitialized
  }
})

