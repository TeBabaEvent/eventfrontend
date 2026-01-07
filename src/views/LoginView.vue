<template>
  <section class="login-page">
    <!-- Background similaire à la homepage -->
    <div class="login-background">
      <div class="login-background__gradient"></div>
      <div class="login-background__grain"></div>
    </div>

    <div class="container">
      <div class="login-wrapper">
        <!-- Logo avec animation -->
        <router-link to="/" class="login-logo">
          <img src="/logo.svg" alt="Baba Event" class="login-logo__image">
        </router-link>

        <!-- Login Card Premium -->
        <div class="login-card">
          <!-- Header -->
          <div class="login-header">
            <h1 class="login-title">{{ t('auth.welcome') }}</h1>
            <p class="login-subtitle">{{ t('auth.adminAccess') }}</p>
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
            <!-- Email Input -->
            <div class="form-group">
              <label class="form-label" for="loginEmail">
                <i class="fas fa-envelope"></i>
                <span>{{ t('auth.email') }}</span>
              </label>
              <div class="form-input-wrapper">
                <input
                  v-model="formData.email"
                  type="email"
                  id="loginEmail"
                  class="form-input"
                  :placeholder="t('auth.emailPlaceholder')"
                  required
                  :disabled="authStore.isLoading"
                  autocomplete="email"
                >
              </div>
            </div>

            <!-- Password Input -->
            <div class="form-group">
              <label class="form-label" for="loginPassword">
                <i class="fas fa-lock"></i>
                <span>{{ t('auth.password') }}</span>
              </label>
              <div class="form-input-wrapper">
                <input
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  id="loginPassword"
                  class="form-input form-input--password"
                  :placeholder="t('auth.passwordPlaceholder')"
                  required
                  :disabled="authStore.isLoading"
                  autocomplete="current-password"
                >
                <button
                  type="button"
                  class="password-toggle"
                  @click="togglePassword"
                  :disabled="authStore.isLoading"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                >
                  <i :class="['fas', showPassword ? 'fa-eye-slash' : 'fa-eye']"></i>
                </button>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="form-submit"
              :disabled="authStore.isLoading"
            >
              <span v-if="authStore.isLoading" class="form-submit__spinner">
                <i class="fas fa-spinner fa-spin"></i>
              </span>
              <span v-else class="form-submit__content">
                <span>{{ t('auth.login') }}</span>
                <i class="fas fa-arrow-right"></i>
              </span>
            </button>
          </form>

          <!-- Footer -->
          <div class="login-footer">
            <router-link to="/" class="login-footer__link">
              <i class="fas fa-arrow-left"></i>
              <span>{{ t('auth.backToHome') }}</span>
            </router-link>
          </div>
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
// BaseButton import removed - using custom CTA button matching homepage style

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
    // Redirection basée sur le rôle
    let defaultPath = '/dashboard'

    // Si steward, rediriger vers le scanner
    if (authStore.user?.role === 'steward') {
      defaultPath = '/scanner'
    }

    const redirectPath = (route.query.redirect as string) || defaultPath
    router.push(redirectPath)
  } else {
    showError(t(result.error || 'auth.loginError'))
  }
}
</script>

<style scoped>
/* ============================================
   LOGIN PAGE - PREMIUM DESIGN
   ============================================ */

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-8) var(--spacing-4);
  position: relative;
  overflow: hidden;
}

/* Background - Similar to homepage */
.login-background {
  position: fixed;
  inset: 0;
  z-index: 0;
  background: var(--color-black);
}

.login-background__gradient {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 80% 50% at 50% -20%,
    rgba(220, 20, 60, 0.15),
    transparent 70%
  );
  opacity: 0.6;
}

.login-background__grain {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.03;
  pointer-events: none;
}

/* Container */
.container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
}

.login-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
  animation: fadeInUp 0.6s var(--ease-smooth);
}

/* Logo */
.login-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
}

.login-logo__image {
  height: 100px;
  width: auto;
  filter: drop-shadow(0 4px 16px rgba(220, 20, 60, 0.3));
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
              filter 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.login-logo:hover .login-logo__image {
  transform: translateY(-3px) scale(1.02);
  filter: drop-shadow(0 8px 24px rgba(220, 20, 60, 0.4));
}

/* Login Card - Premium Glass Effect (matching EventCard) */
.login-card {
  background: rgba(15, 15, 15, 0.8);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: var(--spacing-10) var(--spacing-10);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
}

.login-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(220, 20, 60, 0.4),
    transparent
  );
}

.login-card:hover {
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow:
    0 24px 64px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}


/* Header */
.login-header {
  text-align: center;
  margin-bottom: var(--spacing-8);
}

.login-title {
  font-family: var(--font-heading);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-white);
  margin: 0 0 var(--spacing-3) 0;
  letter-spacing: -0.02em;
  background: linear-gradient(
    135deg,
    var(--color-white),
    rgba(255, 255, 255, 0.8)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-subtitle {
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
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
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: var(--color-white);
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  outline: none;
  transition: all 0.2s ease;
}

.form-input--password {
  padding-right: 3.5rem;
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.form-input:focus {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(220, 20, 60, 0.08);
}

.form-input:hover:not(:disabled):not(:focus) {
  border-color: rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.04);
}

.form-input:disabled {
  opacity: 0.5;
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
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  padding: 0.625rem;
  border-radius: 6px;
  transition: all var(--transition-fast);
  z-index: 2;
}

.password-toggle:hover:not(:disabled) {
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.06);
}

.password-toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Submit Button - Glass Style matching EventCard CTA */
.form-submit {
  width: 100%;
  margin-top: var(--spacing-4);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 24px;
  background: linear-gradient(135deg, var(--color-primary) 0%, #b01030 100%);
  border: none;
  border-radius: 50px;
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(220, 20, 60, 0.3);
}

.form-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(220, 20, 60, 0.4);
}

.form-submit:active:not(:disabled) {
  transform: translateY(0);
}

.form-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-submit__content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-submit__content i {
  font-size: 11px;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-submit:hover:not(:disabled) .form-submit__content i {
  transform: translateX(4px);
}

.form-submit__spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-submit__spinner i {
  font-size: 16px;
}

/* Error Message */
.form-message {
  padding: 1rem 1.25rem;
  border-radius: 8px;
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-4);
  animation: shake 0.4s var(--ease-smooth);
}

.form-message--error {
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: #ff6b6b;
}

.form-message i {
  font-size: 1.125rem;
}

/* Footer */
.login-footer {
  margin-top: var(--spacing-6);
  padding-top: var(--spacing-6);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
}

.login-footer__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
}

.login-footer__link:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  color: var(--color-white);
  transform: translateY(-2px);
}

.login-footer__link i {
  font-size: 10px;
  transition: transform 0.3s ease;
}

.login-footer__link:hover i {
  transform: translateX(-3px);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: all var(--transition-normal);
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}

/* Responsive */
@media (max-width: 768px) {
  .login-page {
    padding: var(--spacing-6) var(--spacing-4);
  }

  .login-wrapper {
    gap: var(--spacing-6);
  }

  .login-logo__image {
    height: 100px;
  }

  .login-card {
    padding: var(--spacing-10);
  }

  .login-title {
    font-size: var(--font-size-3xl);
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: var(--spacing-4) var(--spacing-4);
  }

  .login-card {
    padding: var(--spacing-8);
    border-radius: 16px;
  }

  .login-logo__image {
    height: 90px;
  }

  .login-title {
    font-size: var(--font-size-2xl);
  }

  .login-subtitle {
    font-size: var(--font-size-sm);
  }

  .form-input {
    padding: 0.875rem 1rem;
    font-size: 16px; /* Prevent iOS zoom */
    min-height: 48px;
  }

  .form-input--password {
    padding-right: 3rem;
  }

  .form-label {
    font-size: 0.75rem;
  }

  .login-header {
    margin-bottom: var(--spacing-6);
  }

  .form-submit {
    padding: 14px 20px;
    font-size: 12px;
    min-height: 48px;
  }

  .login-footer {
    margin-top: var(--spacing-6);
    padding-top: var(--spacing-6);
  }

  .login-footer__link {
    padding: 10px 20px;
    font-size: 10px;
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 360px) {
  .login-card {
    padding: var(--spacing-6);
  }

  .login-logo__image {
    height: 80px;
  }
}
</style>
