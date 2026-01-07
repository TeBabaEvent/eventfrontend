<template>
  <div class="users-view">
    <!-- Page Header - Always visible -->
    <div class="page-header">
      <div class="page-header__left">
        <h1 class="page-header__title">{{ $t('dashboard.users.title') }}</h1>
        <p class="page-header__count">{{ filteredUsers.length }} {{ $t('dashboard.users.count') }}</p>
      </div>
      <div class="page-header__actions">
        <!-- Compact Filters -->
        <div class="header-filters">
          <select v-model="selectedRoleFilter" class="header-filter">
          <option value="">{{ $t('dashboard.users.allRoles') }}</option>
          <option value="super_admin">{{ $t('dashboard.users.roles.super_admin') }}</option>
          <option value="admin">{{ $t('dashboard.users.roles.admin') }}</option>
          <option value="steward">{{ $t('dashboard.users.roles.steward') }}</option>
        </select>
          <select v-model="selectedStatusFilter" class="header-filter">
          <option value="">{{ $t('dashboard.users.allStatuses') }}</option>
          <option value="active">{{ $t('dashboard.users.statusActive') }}</option>
          <option value="inactive">{{ $t('dashboard.users.statusInactive') }}</option>
        </select>
        </div>
        <button class="create-btn" @click="showCreateModal">
          <i class="fas fa-plus"></i>
          <span>{{ $t('dashboard.users.createNew') }}</span>
        </button>
      </div>
    </div>

    <!-- Skeleton Loading State -->
    <div v-if="isInitialLoading" class="users-grid">
      <SkeletonCard v-for="n in 4" :key="n" variant="artist" />
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredUsers.length === 0 && !isInitialLoading" class="empty-state">
      <div class="empty-state__icon">
        <i class="fas fa-users-slash"></i>
      </div>
      <h3 class="empty-state__title">{{ $t('dashboard.users.noUsers') }}</h3>
      <p class="empty-state__text">{{ $t('dashboard.users.noUsersDesc') }}</p>
      <button class="empty-state__btn" @click="showCreateModal">
        <i class="fas fa-plus"></i>
        {{ $t('dashboard.users.createFirst') }}
      </button>
    </div>

    <!-- Users Grid -->
    <div v-else class="users-grid">
      <article v-for="user in filteredUsers" :key="user.id" class="user-card">
        <!-- Avatar (left side) -->
        <div class="user-card__avatar">
          <div class="avatar-circle" :class="`avatar-circle--${user.role}`">
            <i class="fas fa-user"></i>
          </div>
        </div>

        <!-- Content (right side) -->
        <div class="user-card__content">
          <!-- Top Row: Role + Status -->
          <div class="user-card__header">
            <div :class="['role-badge', `role-badge--${user.role}`]">
              <i :class="getRoleIcon(user.role)"></i>
              <span>{{ getRoleLabel(user.role) }}</span>
            </div>
            <span :class="['status-indicator', user.is_active ? 'status-indicator--active' : 'status-indicator--inactive']">
              <i class="fas fa-circle"></i>
              {{ user.is_active ? $t('dashboard.users.active') : $t('dashboard.users.inactive') }}
            </span>
          </div>

          <!-- Name -->
          <h3 class="user-card__name">{{ user.name }}</h3>
          <p class="user-card__username">@{{ user.username }}</p>

          <!-- Details -->
          <div class="user-card__details">
            <div class="detail">
              <i class="fas fa-envelope"></i>
              <span>{{ user.email }}</span>
            </div>
            <div class="detail" v-if="user.phone">
              <i class="fas fa-phone"></i>
              <span>{{ user.phone }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="user-card__actions">
            <button
              class="btn-action btn-action--secondary"
              @click="editUser(user)"
              :disabled="user.id === currentUserId && user.role === 'super_admin'"
            >
              <i class="fas fa-pen"></i>
              {{ $t('common.edit') }}
            </button>
            <button
              class="btn-action btn-action--icon"
              @click="deleteUser(user)"
              :title="$t('common.delete')"
              :disabled="user.id === currentUserId"
            >
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </article>
    </div>

    <!-- Create/Edit Modal -->
    <Transition name="modal">
      <div v-if="isModalOpen" class="modal" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">{{ editingUser ? $t('dashboard.users.editUser') : $t('dashboard.users.createNew') }}</h2>
            <button class="modal-close" @click="closeModal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="user-form">
            <!-- Username & Email -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-user"></i>
                  {{ $t('dashboard.users.form.username') }}
                  <span class="required">*</span>
                </label>
                <input
                  v-model="formData.username"
                  type="text"
                  class="form-input"
                  :placeholder="$t('dashboard.users.form.usernamePlaceholder')"
                  required
                  :disabled="!!editingUser"
                >
                <small class="form-help">{{ $t('dashboard.users.form.usernameHint') }}</small>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-envelope"></i>
                  {{ $t('dashboard.users.form.email') }}
                  <span class="required">*</span>
                </label>
                <input
                  v-model="formData.email"
                  type="email"
                  class="form-input"
                  :placeholder="$t('dashboard.users.form.emailPlaceholder')"
                  required
                >
              </div>
            </div>

            <!-- Name & Phone -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-id-card"></i>
                  {{ $t('dashboard.users.form.name') }}
                  <span class="required">*</span>
                </label>
                <input
                  v-model="formData.name"
                  type="text"
                  class="form-input"
                  :placeholder="$t('dashboard.users.form.namePlaceholder')"
                  required
                >
              </div>

              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-phone"></i>
                  {{ $t('dashboard.users.form.phone') }}
                </label>
                <input
                  v-model="formData.phone"
                  type="tel"
                  class="form-input"
                  :placeholder="$t('dashboard.users.form.phonePlaceholder')"
                >
              </div>
            </div>

            <!-- Password (required for create, optional for edit) -->
            <div class="form-row form-row--single" v-if="!editingUser">
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-lock"></i>
                  {{ $t('dashboard.users.form.password') }}
                  <span class="required">*</span>
                </label>
                <input
                  v-model="formData.password"
                  type="password"
                  class="form-input"
                  :placeholder="$t('dashboard.users.form.passwordPlaceholder')"
                  :required="!editingUser"
                  minlength="8"
                >

                <!-- Password Strength Indicator -->
                <div v-if="formData.password" class="password-strength">
                  <div class="password-requirements">
                    <div class="requirement" :class="{ met: passwordChecks.hasMinLength }">
                      <i :class="passwordChecks.hasMinLength ? 'fas fa-check' : 'fas fa-times'"></i>
                      {{ $t('dashboard.users.form.passwordReq.minLength') }}
                    </div>
                    <div class="requirement" :class="{ met: passwordChecks.hasUpperCase }">
                      <i :class="passwordChecks.hasUpperCase ? 'fas fa-check' : 'fas fa-times'"></i>
                      {{ $t('dashboard.users.form.passwordReq.uppercase') }}
                    </div>
                    <div class="requirement" :class="{ met: passwordChecks.hasLowerCase }">
                      <i :class="passwordChecks.hasLowerCase ? 'fas fa-check' : 'fas fa-times'"></i>
                      {{ $t('dashboard.users.form.passwordReq.lowercase') }}
                    </div>
                    <div class="requirement" :class="{ met: passwordChecks.hasNumber }">
                      <i :class="passwordChecks.hasNumber ? 'fas fa-check' : 'fas fa-times'"></i>
                      {{ $t('dashboard.users.form.passwordReq.number') }}
                    </div>
                    <div class="requirement" :class="{ met: passwordChecks.hasSpecialChar }">
                      <i :class="passwordChecks.hasSpecialChar ? 'fas fa-check' : 'fas fa-times'"></i>
                      {{ $t('dashboard.users.form.passwordReq.special') }}
                    </div>
                  </div>
                  <div class="strength-meter">
                    <div class="strength-bar" :class="passwordStrengthClass" :style="{ width: passwordStrengthWidth }"></div>
                  </div>
                  <span class="strength-label" :class="passwordStrengthClass">{{ passwordStrengthLabel }}</span>
                </div>

                <small v-else class="form-help">{{ $t('dashboard.users.form.passwordHint') }}</small>
              </div>
            </div>

            <!-- Role -->
            <div class="form-row form-row--single">
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-user-tag"></i>
                  {{ $t('dashboard.users.form.role') }}
                  <span class="required">*</span>
                </label>
                <select v-model="formData.role" class="form-select" required>
                  <option value="">{{ $t('dashboard.users.form.selectRole') }}</option>
                  <option value="steward">{{ $t('dashboard.users.roles.steward') }}</option>
                  <option value="admin">{{ $t('dashboard.users.roles.admin') }}</option>
                  <option value="super_admin" :disabled="currentUserRole !== 'super_admin'">
                    {{ $t('dashboard.users.roles.super_admin') }}
                  </option>
                </select>
                <small class="form-help">{{ $t('dashboard.users.form.roleHint') }}</small>
              </div>
            </div>

            <!-- Status Toggle (edit only) -->
            <div class="form-row form-row--single" v-if="editingUser">
              <label class="checkbox-label">
                <span class="checkbox-label__content">
                  <i class="fas fa-toggle-on"></i>
                  {{ $t('dashboard.users.form.isActive') }}
                </span>
                <input v-model="formData.is_active" type="checkbox">
              </label>
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
              <button type="button" class="btn btn--outline" @click="closeModal">
                {{ $t('common.cancel') }}
              </button>
              <button type="submit" class="btn btn--primary" :disabled="isSubmitting">
                {{ isSubmitting ? $t('common.loading') : (editingUser ? $t('common.save') : $t('common.create')) }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useAdminDataStore } from '@/stores/adminData'
import { useToast } from '@/composables/useToast'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'
import { buildApiUrl, getAuthHeaders, API_ENDPOINTS } from '@/config/api'
import { logger } from '@/services/logger'
import type { User } from '@/types'

// Types
interface UserCreatePayload {
  username: string
  email: string
  password: string
  name: string
  role: string
  phone: string | null
}

interface UserUpdatePayload {
  email: string
  name: string
  role: string
  phone: string | null
  is_active: boolean
}

const { t } = useI18n()
const authStore = useAuthStore()
const adminDataStore = useAdminDataStore()
const toast = useToast()

// State
const isModalOpen = ref(false)
const isSubmitting = ref(false)
const editingUser = ref<User | null>(null)
const selectedRoleFilter = ref('')
const selectedStatusFilter = ref('')

// Current user info
const currentUserId = computed(() => authStore.user?.id)
const currentUserRole = computed(() => authStore.user?.role)

// Form data
const formData = ref({
  username: '',
  email: '',
  password: '',
  name: '',
  role: '',
  phone: '',
  is_active: true
})

// Computed properties
const isInitialLoading = computed(() => adminDataStore.isUsersLoading && !adminDataStore.usersLoaded)

// Password validation computed properties
const passwordChecks = computed(() => ({
  hasMinLength: formData.value.password.length >= 8,
  hasUpperCase: /[A-Z]/.test(formData.value.password),
  hasLowerCase: /[a-z]/.test(formData.value.password),
  hasNumber: /[0-9]/.test(formData.value.password),
  hasSpecialChar: /[!@#$%^&*(),.?":{}|<>\-_=+\[\]\\;'`~]/.test(formData.value.password)
}))

const passwordStrengthScore = computed(() => {
  const checks = passwordChecks.value
  return [
    checks.hasMinLength,
    checks.hasUpperCase,
    checks.hasLowerCase,
    checks.hasNumber,
    checks.hasSpecialChar
  ].filter(Boolean).length
})

const isPasswordValid = computed(() => passwordStrengthScore.value === 5)

const passwordStrengthClass = computed(() => {
  const score = passwordStrengthScore.value
  if (score <= 2) return 'weak'
  if (score <= 4) return 'medium'
  return 'strong'
})

const passwordStrengthWidth = computed(() => {
  return `${(passwordStrengthScore.value / 5) * 100}%`
})

const passwordStrengthLabel = computed(() => {
  const score = passwordStrengthScore.value
  if (score <= 2) return t('dashboard.users.form.passwordStrength.weak')
  if (score <= 4) return t('dashboard.users.form.passwordStrength.medium')
  return t('dashboard.users.form.passwordStrength.strong')
})

// Filtered users
const filteredUsers = computed(() => {
  let filtered = adminDataStore.users

  // Filter by role
  if (selectedRoleFilter.value) {
    filtered = filtered.filter(u => u.role === selectedRoleFilter.value)
  }

  // Filter by status
  if (selectedStatusFilter.value) {
    const isActive = selectedStatusFilter.value === 'active'
    filtered = filtered.filter(u => u.is_active === isActive)
  }

  return filtered
})

// Methods
async function loadUsers() {
  try {
    await adminDataStore.fetchUsers()
  } catch (error) {
    logger.error('Error loading users:', error)
    toast.error(t('dashboard.users.loadError'))
  }
}

function showCreateModal() {
  editingUser.value = null
  formData.value = {
    username: '',
    email: '',
    password: '',
    name: '',
    role: '',
    phone: '',
    is_active: true
  }
  isModalOpen.value = true
}

function editUser(user: User) {
  editingUser.value = user
  formData.value = {
    username: user.username,
    email: user.email,
    password: '',
    name: user.name,
    role: user.role,
    phone: user.phone || '',
    is_active: user.is_active
  }
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  editingUser.value = null
}

async function handleSubmit() {
  // Validate password strength for new users
  if (!editingUser.value && !isPasswordValid.value) {
    toast.error(t('dashboard.users.form.passwordTooWeak'))
    return
  }

  isSubmitting.value = true

  try {
    const endpoint = editingUser.value
      ? API_ENDPOINTS.ADMIN_USER_BY_ID(editingUser.value.id)
      : API_ENDPOINTS.ADMIN_USERS

    const method = editingUser.value ? 'PUT' : 'POST'

    // Prepare payload with proper typing
    let payload: UserCreatePayload | UserUpdatePayload

    if (!editingUser.value) {
      // Create payload
      payload = {
        username: formData.value.username,
        email: formData.value.email,
        password: formData.value.password,
        name: formData.value.name,
        role: formData.value.role,
        phone: formData.value.phone || null
      } as UserCreatePayload
    } else {
      // Update payload
      payload = {
        email: formData.value.email,
        name: formData.value.name,
        role: formData.value.role,
        phone: formData.value.phone || null,
        is_active: formData.value.is_active
      } as UserUpdatePayload
    }

    const response = await fetch(buildApiUrl(endpoint), {
      method,
      credentials: 'include',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({})) as { detail?: string | Array<{ msg: string }> }
      // Handle Pydantic validation errors (422)
      if (error.detail && Array.isArray(error.detail)) {
        const errorMessages = error.detail.map((err) => err.msg).join(', ')
        throw new Error(errorMessages)
      }
      throw new Error((error.detail as string) || 'Failed to save user')
    }

    await response.json()

    // Invalidate cache and refresh users
    adminDataStore.invalidateUsers()
    await adminDataStore.fetchUsers(true)

    // Show success message
    if (editingUser.value) {
      toast.success(t('dashboard.users.updateSuccess'))
    } else {
      toast.success(t('dashboard.users.createSuccess'))
    }

    closeModal()
  } catch (error) {
    logger.error('Error saving user:', error)
    const message = error instanceof Error ? error.message : t('dashboard.users.saveError')
    toast.error(message)
  } finally {
    isSubmitting.value = false
  }
}

async function deleteUser(user: User) {
  if (user.id === currentUserId.value) {
    toast.error(t('dashboard.users.cannotDeleteSelf'))
    return
  }

  if (!confirm(t('dashboard.users.confirmDelete', { name: user.name }))) {
    return
  }

  try {
    const response = await fetch(buildApiUrl(API_ENDPOINTS.ADMIN_USER_BY_ID(user.id)), {
      method: 'DELETE',
      credentials: 'include',
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to delete user')
    }

    // Invalidate cache and refresh users
    adminDataStore.invalidateUsers()
    await adminDataStore.fetchUsers(true)

    toast.success(t('dashboard.users.deleteSuccess'))
  } catch (error) {
    logger.error('Error deleting user:', error)
    toast.error(t('dashboard.users.deleteError'))
  }
}

function getRoleIcon(role: string) {
  const icons: Record<string, string> = {
    super_admin: 'fas fa-crown',
    admin: 'fas fa-user-shield',
    steward: 'fas fa-user-check'
  }
  return icons[role] || 'fas fa-user'
}

function getRoleLabel(role: string) {
  return t(`dashboard.users.roles.${role}`)
}

// Lifecycle
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
@import '@/assets/styles/dashboard-modals.css';

/* ============================================
   USERS VIEW - Matching Dashboard Style
   ============================================ */
.users-view {
  max-width: 1400px;
  animation: pageIn 0.6s ease-out;
}

@keyframes pageIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ============================================
   PAGE HEADER - Premium Style
   ============================================ */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.page-header__left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.page-header__title {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-white);
  letter-spacing: -0.3px;
  margin: 0;
}

.page-header__count {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.45);
  margin: 0;
}

.page-header__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Header Filters - Compact inline style */
.header-filters {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-filter {
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  color: var(--color-white);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s ease;
  min-width: 110px;
}

.header-filter:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
}

.header-filter:focus {
  outline: none;
  border-color: var(--color-primary);
}

.header-filter option {
  background: #141416;
  color: var(--color-white);
}

/* Create Button - Premium Style */
.create-btn {
  padding: 0.625rem 1.25rem;
  background: var(--color-primary);
  border: none;
  border-radius: 8px;
  color: var(--color-white);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.create-btn:hover {
  background: #c41e3a;
}

.create-btn:active {
  transform: scale(0.97);
}

.create-btn i {
  font-size: 0.65rem;
}

/* ============================================
   USERS GRID
   ============================================ */
.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1rem;
}

/* ============================================
   USER CARD - Matching Event/Artist Card Style
   ============================================ */
.user-card {
  display: flex;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.2s ease;
  min-height: 180px;
}

.user-card:hover {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
}

/* Avatar Section (replaces image) */
.user-card__avatar {
  width: 160px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
}

.avatar-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  border: 3px solid;
  transition: transform 0.4s ease;
}

.user-card:hover .avatar-circle {
  transform: scale(1.05);
}

.avatar-circle--super_admin {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 237, 78, 0.15) 100%);
  border-color: #ffd700;
  color: #ffd700;
}

.avatar-circle--admin {
  background: linear-gradient(135deg, rgba(220, 20, 60, 0.15) 0%, rgba(255, 107, 107, 0.15) 100%);
  border-color: #dc143c;
  color: #dc143c;
}

.avatar-circle--steward {
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.15) 0%, rgba(122, 184, 255, 0.15) 100%);
  border-color: #4a90e2;
  color: #4a90e2;
}

/* Content Section */
.user-card__content {
  flex: 1;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

/* Header Row */
.user-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.25rem;
}

.role-badge {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.role-badge--super_admin {
  background: rgba(255, 215, 0, 0.15);
  color: #ffd700;
}

.role-badge--admin {
  background: rgba(var(--color-primary-rgb), 0.12);
  color: var(--color-primary);
}

.role-badge--steward {
  background: rgba(74, 144, 226, 0.15);
  color: #4a90e2;
}

.role-badge i {
  font-size: 0.55rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.status-indicator i {
  font-size: 0.35rem;
}

.status-indicator--active {
  color: #22c55e;
}

.status-indicator--active i {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.status-indicator--inactive {
  color: rgba(255, 255, 255, 0.35);
}

/* Name & Username */
.user-card__name {
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-white);
  margin: 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.user-card__username {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.45);
  margin: 0;
}

/* Details */
.user-card__details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.25rem;
}

.detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.45);
}

.detail i {
  width: 12px;
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.25);
  flex-shrink: 0;
}

.detail span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Actions */
.user-card__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.btn-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
}

.btn-action i {
  font-size: 0.6rem;
}

.btn-action--primary {
  background: var(--color-primary);
  color: white;
}

.btn-action--primary:hover {
  background: #b91c3a;
}

.btn-action--secondary {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.btn-action--secondary:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
  color: white;
}

.btn-action--secondary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-action--icon {
  width: 30px;
  height: 30px;
  padding: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.3);
  margin-left: auto;
  border-radius: 6px;
}

.btn-action--icon:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.btn-action--icon:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* ============================================
   PASSWORD STRENGTH INDICATOR
   ============================================ */
.password-strength {
  margin-top: 0.75rem;
  padding: 0.875rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.password-requirements {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.375rem;
  margin-bottom: 0.75rem;
}

.requirement {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
  transition: color 0.2s ease;
}

.requirement i {
  font-size: 0.55rem;
  width: 12px;
}

.requirement.met {
  color: #22c55e;
}

.requirement.met i {
  color: #22c55e;
}

.requirement:not(.met) i {
  color: rgba(255, 255, 255, 0.3);
}

.strength-meter {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.strength-bar {
  height: 100%;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.strength-bar.weak {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.strength-bar.medium {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.strength-bar.strong {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}

.strength-label {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.strength-label.weak {
  color: #ef4444;
}

.strength-label.medium {
  color: #f59e0b;
}

.strength-label.strong {
  color: #22c55e;
}

@media (max-width: 480px) {
  .password-requirements {
    grid-template-columns: 1fr;
  }
}

/* ============================================
   EMPTY STATE - Glass Effect
   ============================================ */
.empty-state {
  text-align: center;
  padding: 5rem 2rem;
  background: rgba(15, 15, 15, 0.5);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-lg);
  margin: 2rem 0;
}

.empty-state__icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  color: rgba(var(--color-primary-rgb), 0.4);
  animation: pulse-subtle 3s ease-in-out infinite;
}

@keyframes pulse-subtle {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.05); }
}

.empty-state__title {
  font-family: var(--font-heading);
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: var(--color-white);
  letter-spacing: -0.3px;
}

.empty-state__text {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 1.5rem;
}

.empty-state__btn {
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  border: none;
  border-radius: 8px;
  color: var(--color-white);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.empty-state__btn:hover {
  background: #c41e3a;
}

.empty-state__btn i {
  font-size: 0.7rem;
}

/* ============================================
   RESPONSIVE - UNIFIED
   ============================================ */
@media (max-width: 1024px) {
  .users-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .header-filters {
    display: none;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
    margin-bottom: 1.75rem;
    padding-bottom: 0;
    border-bottom: none;
  }

  .page-header__left {
    gap: 0.5rem;
  }

  .page-header__title {
    font-size: 1.5rem;
    font-weight: 700;
  }

  .page-header__count {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .page-header__actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .header-filters {
    display: flex;
    width: 100%;
  }

  .header-filter {
    flex: 1;
    font-size: 0.8rem;
    padding: 0.625rem 0.75rem;
  }

  /* Premium Create Button - Mobile */
  .create-btn {
    width: 100%;
    justify-content: center;
    padding: 1rem 1.5rem;
    font-size: 0.9rem;
    font-weight: 600;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--color-primary) 0%, #e01a3d 100%);
    box-shadow: 0 4px 15px rgba(220, 20, 60, 0.3);
    gap: 0.625rem;
  }

  .create-btn:hover {
    background: linear-gradient(135deg, #e01a3d 0%, var(--color-primary) 100%);
  }

  .create-btn:active {
    transform: scale(0.98);
    box-shadow: 0 2px 10px rgba(220, 20, 60, 0.2);
  }

  .create-btn i {
    font-size: 0.75rem;
  }

  .users-grid {
    grid-template-columns: 1fr;
    gap: 0.875rem;
  }

  .user-card {
    border-radius: 12px;
    min-height: 140px;
  }

  .user-card:active {
    transform: scale(0.99);
  }

  .user-card:hover {
    transform: none;
  }

  .user-card__avatar {
    width: 110px;
    min-height: 140px;
  }

  .avatar-circle {
    width: 70px;
    height: 70px;
    font-size: 1.5rem;
  }

  .user-card__content {
    padding: 0.875rem 1rem;
  }

  .user-card__name {
    font-size: 0.95rem;
  }

  /* Actions - Touch friendly */
  .user-card__actions {
    gap: 0.5rem;
    margin-top: 0.875rem;
    padding-top: 0.875rem;
  }

  .btn-action {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    min-height: 36px;
    border-radius: 8px;
  }

  .btn-action i {
    font-size: 0.65rem;
  }

  .btn-action--icon {
    width: 36px;
    height: 36px;
  }

  .empty-state {
    padding: 3.5rem 1.5rem;
    border-radius: 12px;
  }

  .empty-state__icon {
    font-size: 3rem;
  }

  .empty-state__title {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .page-header {
    gap: 1.25rem;
  }

  .page-header__title {
    font-size: 1.35rem;
  }

  .header-filters {
    flex-direction: column;
    gap: 0.5rem;
  }

  .header-filter {
    min-width: 100%;
  }

  .create-btn {
    padding: 0.875rem 1.25rem;
    font-size: 0.85rem;
    border-radius: 10px;
  }

  /* Stack card vertically */
  .user-card {
    flex-direction: column;
  }

  .user-card__avatar {
    width: 100%;
    height: 120px;
    min-height: auto;
  }

  .avatar-circle {
    width: 64px;
    height: 64px;
    font-size: 1.35rem;
  }

  .user-card__content {
    padding: 1rem 1.125rem;
  }

  .user-card__header {
    margin-bottom: 0.375rem;
  }

  .role-badge {
    font-size: 0.6rem;
    padding: 0.25rem 0.5rem;
  }

  .user-card__name {
    font-size: 1.05rem;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    margin-bottom: 0.25rem;
  }

  .user-card__username {
    font-size: 0.7rem;
  }

  .detail {
    font-size: 0.75rem;
  }

  .detail i {
    font-size: 0.65rem;
    width: 14px;
  }

  /* Buttons - Extra touch friendly on small screens */
  .user-card__actions {
    gap: 0.625rem;
  }

  .btn-action {
    flex: 1;
    padding: 0.625rem 0.75rem;
    font-size: 0.8rem;
    min-height: 40px;
    justify-content: center;
  }

  .btn-action i {
    font-size: 0.7rem;
  }

  .btn-action--icon {
    flex: 0;
    width: 40px;
    height: 40px;
  }

  .empty-state {
    padding: 3rem 1rem;
  }

  .empty-state__title {
    font-size: 1.1rem;
  }

  .empty-state__text {
    font-size: 0.85rem;
  }
}
</style>
