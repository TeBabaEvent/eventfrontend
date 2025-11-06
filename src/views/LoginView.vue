<template>
  <section class="login-page">
    <div class="container">
      <div class="login-container">
        <!-- Login Card -->
        <div class="login-card">
          <!-- Logo -->
          <div class="login-card__logo">
            <router-link to="/">
              <img src="/logo.svg" alt="Baba Event">
            </router-link>
          </div>
          
          <!-- Messages -->
          <Transition name="fade">
            <div v-if="errorMessage" class="form-message form-message--error">
              <i class="fas fa-exclamation-circle"></i>
              <span>{{ errorMessage }}</span>
            </div>
          </Transition>
          
          <!-- Login Form -->
          <form class="login-form" @submit.prevent="handleLogin">
            <div class="form-group">
              <label class="form-label" for="loginEmail">
                <i class="fas fa-envelope"></i>
                {{ t('auth.email') }}
              </label>
              <input 
                v-model="formData.email"
                type="email" 
                id="loginEmail" 
                class="form-input" 
                :placeholder="t('auth.emailPlaceholder')"
                required
                :disabled="authStore.isLoading"
              >
            </div>
            
            <div class="form-group">
              <label class="form-label" for="loginPassword">
                <i class="fas fa-lock"></i>
                {{ t('auth.password') }}
              </label>
              <div class="form-input-wrapper">
                <input 
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'" 
                  id="loginPassword" 
                  class="form-input" 
                  :placeholder="t('auth.passwordPlaceholder')"
                  required
                  :disabled="authStore.isLoading"
                >
                <button 
                  type="button" 
                  class="password-toggle" 
                  @click="togglePassword"
                  :disabled="authStore.isLoading"
                >
                  <i :class="['fas', showPassword ? 'fa-eye-slash' : 'fa-eye']"></i>
                </button>
              </div>
            </div>
            
            <BaseButton 
              type="submit" 
              variant="primary" 
              size="large" 
              class="form-submit"
              :loading="authStore.isLoading"
              :disabled="authStore.isLoading"
            >
              {{ t('auth.login') }}
            </BaseButton>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { isValidEmail } from '@/utils'
import BaseButton from '@/components/ui/BaseButton.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// State
const showPassword = ref(false)
const errorMessage = ref('')

const formData = reactive({
  email: '',
  password: ''
})

// Methods
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const showError = (message: string) => {
  errorMessage.value = message
  
  setTimeout(() => {
    errorMessage.value = ''
  }, 5000)
}

const handleLogin = async () => {
  // Validation
  if (!formData.email || !formData.password) {
    showError(t('auth.fillAllFields'))
    return
  }
  
  // Validation de l'email
  if (!isValidEmail(formData.email)) {
    showError(t('auth.invalidCredentials'))
    return
  }
  
  errorMessage.value = ''
  
  const result = await authStore.login(formData.email, formData.password)
  
  if (result.success) {
    // Redirection instantanée vers le dashboard
    const redirectPath = (route.query.redirect as string) || '/dashboard'
    router.push(redirectPath)
  } else {
    showError(t(result.error || 'auth.loginError'))
  }
}
</script>

<style scoped>
/* ============================================
   LOGIN PAGE STYLES
   ============================================ */

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  position: relative;
  background: var(--color-black);
  overflow: hidden;
}

.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 450px;
  margin: 0 auto;
}

/* Login Card */
.login-card {
  background: rgba(20, 20, 30, 0.6);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  transition: all var(--transition-normal);
}

.login-card:hover {
  border-color: rgba(220, 20, 60, 0.4);
  box-shadow: 
    0 12px 48px rgba(0, 0, 0, 0.5),
    0 0 24px rgba(220, 20, 60, 0.15);
}

/* Logo */
.login-card__logo {
  text-align: center;
  margin-bottom: 2.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card__logo img {
  height: 100px;
  width: auto;
  filter: drop-shadow(0 4px 16px rgba(220, 20, 60, 0.3));
  transition: all var(--transition-normal);
  display: inline-block;
  cursor: pointer;
}

.login-card__logo img:hover {
  filter: drop-shadow(0 6px 24px rgba(220, 20, 60, 0.5));
  transform: scale(1.02);
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-label i {
  color: var(--color-primary);
  font-size: 0.875rem;
}

.form-input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-sm);
  color: var(--color-white);
  font-family: var(--font-body);
  font-size: 1rem;
  outline: none;
  transition: all var(--transition-normal);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-input:focus {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(220, 20, 60, 0.1);
}

.form-input:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.2);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Password Toggle */
.password-toggle {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 0.5rem;
  transition: color var(--transition-fast);
}

.password-toggle:hover:not(:disabled) {
  color: var(--color-primary);
}

.password-toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Submit Button */
.form-submit {
  width: 100%;
  margin-top: 1rem;
}

/* Error Message */
.form-message {
  padding: 1rem 1.25rem;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.form-message--error {
  background: rgba(220, 53, 69, 0.15);
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: #ff6b6b;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: all var(--transition-normal);
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive */
@media (max-width: 768px) {
  .login-page {
    padding: 30px 20px;
  }
  
  .login-container {
    max-width: 500px;
  }
  
  .login-card {
    padding: 3rem 2.5rem;
  }
  
  .login-card__logo img {
    height: 95px;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 15px;
  }
  
  .login-container {
    max-width: 100%;
  }
  
  .login-card {
    padding: 3rem 2rem;
  }
  
  .login-card__logo {
    margin-bottom: 2.5rem;
  }
  
  .login-card__logo img {
    height: 90px;
  }
  
  .form-input {
    padding: 1.125rem 1.25rem;
    font-size: 1rem;
  }
  
  .form-label {
    font-size: 0.9375rem;
  }
  
  .form-group {
    gap: 0.75rem;
  }
}

@media (max-width: 360px) {
  .login-card {
    padding: 2.5rem 1.75rem;
  }
  
  .login-card__logo img {
    height: 85px;
  }
}
</style>

