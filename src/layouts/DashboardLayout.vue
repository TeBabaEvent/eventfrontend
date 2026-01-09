<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside :class="['admin-sidebar', { 'admin-sidebar--open': isSidebarOpen }]">
      <!-- Sidebar Header - Logo Only -->
      <div class="sidebar-header">
        <router-link to="/dashboard" class="sidebar-brand">
          <img src="/logo.svg" alt="Baba Event" class="sidebar-brand__logo">
        </router-link>
      </div>

      <!-- Sidebar Navigation -->
      <nav class="sidebar-nav">
        <div class="sidebar-nav__section">
          <span class="sidebar-nav__label">Menu</span>
          <div
            v-for="item in navigationItems"
            :key="item.path"
            class="sidebar-nav__item"
          >
            <router-link
              :to="item.path"
              class="sidebar-nav__link"
              :class="{ 'active': isActiveRoute(item.path) }"
              @click="closeSidebar"
            >
              <span class="sidebar-nav__icon-wrap">
                <i :class="['sidebar-nav__icon', item.icon]"></i>
              </span>
              <span class="sidebar-nav__text">{{ item.label }}</span>
              <span v-if="isActiveRoute(item.path)" class="sidebar-nav__indicator"></span>
            </router-link>
          </div>
        </div>
      </nav>

      <!-- Sidebar Footer - User Section -->
      <div class="sidebar-footer">
        <div class="sidebar-user" @click="toggleUserMenu">
          <div class="sidebar-user__avatar">{{ userInitials }}</div>
          <div class="sidebar-user__info">
            <div class="sidebar-user__name">{{ userName }}</div>
            <div class="sidebar-user__role">Administrateur</div>
          </div>
          <i class="fas fa-chevron-down sidebar-user__chevron" :class="{ 'rotated': isUserMenuOpen }"></i>
        </div>

        <!-- User Dropdown Menu -->
        <Transition name="dropdown">
          <div v-if="isUserMenuOpen" class="sidebar-dropdown">
            <button class="sidebar-dropdown__item" @click="handleLogout">
              <i class="fas fa-sign-out-alt"></i>
              <span>Déconnexion</span>
            </button>
          </div>
        </Transition>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="admin-main">
      <!-- Sidebar Toggle (Mobile) - Same as website burger -->
      <button
        class="sidebar-toggle"
        :class="{ 'sidebar-toggle--active': isSidebarOpen }"
        @click="toggleSidebar"
        aria-label="Toggle navigation menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <!-- Content Area -->
      <div class="admin-content">
        <router-view />
      </div>
    </main>

    <!-- Overlay for mobile -->
    <div
      v-if="isSidebarOpen"
      class="sidebar-overlay"
      @click="closeSidebar"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// State
const isSidebarOpen = ref(false)
const isUserMenuOpen = ref(false)

// Navigation items
const navigationItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: 'fas fa-tachometer-alt'
  },
  {
    path: '/dashboard/events',
    label: 'Événements',
    icon: 'fas fa-calendar-alt'
  },
  {
    path: '/dashboard/artists',
    label: 'Artistes',
    icon: 'fas fa-microphone'
  },
  {
    path: '/dashboard/packs',
    label: 'Packs',
    icon: 'fas fa-ticket-alt'
  },
  {
    path: '/dashboard/orders',
    label: 'Commandes',
    icon: 'fas fa-receipt'
  },
  {
    path: '/scanner',
    label: 'Scanner',
    icon: 'fas fa-qrcode'
  },
  {
    path: '/dashboard/users',
    label: 'Utilisateurs',
    icon: 'fas fa-users'
  }
]

// Computed
const userName = computed(() => authStore.user?.name || authStore.user?.email || 'Admin')
const userInitials = computed(() => {
  const name = userName.value
  return name.substring(0, 1).toUpperCase()
})

// Methods
const isActiveRoute = (path: string) => {
  if (path === '/dashboard') {
    return route.path === path
  }
  return route.path.startsWith(path)
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
/* ============================================
   DASHBOARD LAYOUT - Professional Design
   ============================================ */

.admin-layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-black);
}

/* ============================================
   SIDEBAR - Clean Professional Design
   ============================================ */
.admin-sidebar {
  width: 260px;
  background: #0d0d0f;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  transition: transform var(--transition-normal);
  overflow: hidden;
}

/* ============================================
   SIDEBAR HEADER - Logo Only
   ============================================ */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.sidebar-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: opacity var(--transition-fast);
}

.sidebar-brand:hover {
  opacity: 0.85;
}

.sidebar-brand__logo {
  height: 50px;
  width: auto;
}

/* ============================================
   SIDEBAR NAVIGATION - Professional
   ============================================ */
.sidebar-nav {
  flex: 1;
  padding: 1rem 0.75rem;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.sidebar-nav__section {
  margin-bottom: 1.5rem;
}

.sidebar-nav__label {
  display: block;
  padding: 0 0.75rem;
  margin-bottom: 0.5rem;
  font-size: 0.65rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.35);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.sidebar-nav__item {
  margin-bottom: 2px;
}

.sidebar-nav__link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  font-weight: 500;
  border-radius: 8px;
  transition: all var(--transition-fast);
  position: relative;
  text-decoration: none;
}

.sidebar-nav__link:hover {
  color: var(--color-white);
  background: rgba(255, 255, 255, 0.04);
}

.sidebar-nav__link.active {
  color: var(--color-white);
  background: rgba(var(--color-primary-rgb), 0.1);
}

/* Icon wrapper */
.sidebar-nav__icon-wrap {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 6px;
  transition: all var(--transition-fast);
}

.sidebar-nav__icon {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  transition: color var(--transition-fast);
}

.sidebar-nav__link:hover .sidebar-nav__icon-wrap {
  background: rgba(var(--color-primary-rgb), 0.1);
}

.sidebar-nav__link:hover .sidebar-nav__icon {
  color: var(--color-primary);
}

.sidebar-nav__link.active .sidebar-nav__icon-wrap {
  background: rgba(var(--color-primary-rgb), 0.15);
}

.sidebar-nav__link.active .sidebar-nav__icon {
  color: var(--color-primary);
}

.sidebar-nav__text {
  flex: 1;
}

/* Active indicator dot */
.sidebar-nav__indicator {
  width: 6px;
  height: 6px;
  background: var(--color-primary);
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(var(--color-primary-rgb), 0.5);
}

/* ============================================
   SIDEBAR FOOTER - User Section
   ============================================ */
.sidebar-footer {
  padding: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.625rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.sidebar-user:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
}

.sidebar-user__avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--color-primary) 0%, #b01030 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  font-weight: 600;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.sidebar-user__info {
  flex: 1;
  min-width: 0;
}

.sidebar-user__name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-white);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-user__role {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.2;
}

.sidebar-user__chevron {
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.4);
  transition: transform var(--transition-fast);
}

.sidebar-user__chevron.rotated {
  transform: rotate(180deg);
}

/* Dropdown Menu */
.sidebar-dropdown {
  margin-top: 0.5rem;
  padding: 0.25rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
}

.sidebar-dropdown__item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.sidebar-dropdown__item i {
  font-size: 0.75rem;
  width: 16px;
}

.sidebar-dropdown__item:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* Dropdown Transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ============================================
   MAIN CONTENT
   ============================================ */
.admin-main {
  flex: 1;
  margin-left: 260px;
  min-height: 100vh;
  background: var(--color-black);
}

/* Burger Toggle - Same as website */
.sidebar-toggle {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1001;
  width: 48px;
  height: 48px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-toggle:hover {
  background: rgba(220, 20, 60, 0.15);
  border-color: rgba(220, 20, 60, 0.3);
}

.sidebar-toggle:hover span {
  background: var(--color-primary);
}

.sidebar-toggle span {
  position: absolute;
  width: 20px;
  height: 1.5px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 2px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-toggle span:nth-child(1) {
  top: calc(50% - 6px);
}

.sidebar-toggle span:nth-child(2) {
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
}

.sidebar-toggle span:nth-child(3) {
  bottom: calc(50% - 6px);
}

/* Toggle Active State - X animation */
.sidebar-toggle--active {
  background: rgba(220, 20, 60, 0.1);
  border-color: rgba(220, 20, 60, 0.3);
}

.sidebar-toggle--active span {
  background: var(--color-primary);
  width: 20px;
}

.sidebar-toggle--active span:nth-child(1) {
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
}

.sidebar-toggle--active span:nth-child(2) {
  opacity: 0;
  transform: translateY(-50%) scaleX(0);
}

.sidebar-toggle--active span:nth-child(3) {
  bottom: 50%;
  transform: translateY(50%) rotate(-45deg);
}

.admin-content {
  padding: 2rem;
}

.sidebar-overlay {
  display: none;
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 1024px) {
  .admin-sidebar {
    transform: translateX(-100%);
  }

  .admin-sidebar--open {
    transform: translateX(0);
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.6);
  }

  .admin-main {
    margin-left: 0;
  }

  .sidebar-toggle {
    display: flex;
  }

  .admin-content {
    padding: 5rem 1.5rem 2rem 1.5rem;
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 999;
  }
}

@media (max-width: 768px) {
  .sidebar-toggle {
    top: 0.875rem;
    left: 0.875rem;
    width: 44px;
    height: 44px;
  }

  .sidebar-toggle span {
    width: 18px;
  }

  .sidebar-toggle span:nth-child(2) {
    width: 12px;
  }

  .admin-content {
    padding: 5.5rem 1.25rem 1.5rem 1.25rem;
  }

  .sidebar-header {
    padding: 1rem;
  }

  .sidebar-brand__logo {
    height: 42px;
  }

  .sidebar-nav {
    padding: 0.75rem 0.5rem;
  }

  .sidebar-nav__label {
    font-size: 0.6rem;
    padding: 0 0.625rem;
  }

  .sidebar-nav__link {
    padding: 0.55rem 0.625rem;
    font-size: 0.8rem;
    gap: 0.625rem;
  }

  .sidebar-nav__icon-wrap {
    width: 26px;
    height: 26px;
  }

  .sidebar-nav__icon {
    font-size: 0.75rem;
  }

  .sidebar-footer {
    padding: 0.625rem;
  }

  .sidebar-user {
    padding: 0.4rem 0.5rem;
    gap: 0.5rem;
  }

  .sidebar-user__avatar {
    width: 28px;
    height: 28px;
    font-size: 0.7rem;
    border-radius: 6px;
  }

  .sidebar-user__name {
    font-size: 0.75rem;
  }

  .sidebar-user__role {
    font-size: 0.6rem;
  }

  .sidebar-dropdown__item {
    padding: 0.4rem 0.625rem;
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .sidebar-toggle {
    top: 0.75rem;
    left: 0.75rem;
    width: 42px;
    height: 42px;
    border-radius: 12px;
  }

  .sidebar-toggle span {
    width: 18px;
  }

  .sidebar-toggle span:nth-child(2) {
    width: 12px;
  }

  .admin-content {
    padding: 5rem 1rem 1rem 1rem;
  }

  .admin-sidebar {
    width: 100%;
    border-left: none;
  }

  .sidebar-header {
    padding: 1rem 0.875rem;
  }

  .sidebar-brand__logo {
    height: 40px;
  }

  .sidebar-nav__link {
    padding: 0.5rem 0.5rem;
    font-size: 0.75rem;
    border-radius: 6px;
  }

  .sidebar-nav__icon-wrap {
    width: 24px;
    height: 24px;
    border-radius: 5px;
  }

  .sidebar-nav__icon {
    font-size: 0.7rem;
  }

  .sidebar-nav__indicator {
    width: 5px;
    height: 5px;
  }
}
</style>

