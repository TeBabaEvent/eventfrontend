<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside :class="['admin-sidebar', { 'admin-sidebar--open': isSidebarOpen }]">
      <!-- Sidebar Header -->
      <div class="sidebar-header">
        <router-link to="/" class="sidebar-logo">
          <img src="/logo.svg" alt="Baba Event">
        </router-link>
        <h2 class="sidebar-title">Baba Event</h2>
        <p class="sidebar-subtitle">Admin Panel</p>
      </div>

      <!-- Sidebar Navigation -->
      <nav class="sidebar-nav">
        <div
          v-for="item in navigationItems"
          :key="item.path"
          class="sidebar-nav__item"
        >
          <router-link
            :to="item.path"
            class="sidebar-nav__link"
            :class="{ 'active': isActiveRoute(item.path) }"
          >
            <i :class="['sidebar-nav__icon', item.icon]"></i>
            <span>{{ item.label }}</span>
          </router-link>
        </div>
      </nav>

      <!-- Sidebar Footer -->
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="sidebar-user__avatar">{{ userInitials }}</div>
          <div class="sidebar-user__info">
            <div class="sidebar-user__name">{{ userName }}</div>
            <div class="sidebar-user__role">Administrateur</div>
          </div>
        </div>
        <button class="logout-btn" @click="handleLogout">
          <i class="fas fa-sign-out-alt"></i>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="admin-main">
      <!-- Sidebar Toggle (Mobile) -->
      <button class="sidebar-toggle" @click="toggleSidebar">
        <i class="fas fa-bars"></i>
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

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
/* ============================================
   DASHBOARD LAYOUT
   ============================================ */

.admin-layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-black);
}

/* ============================================
   SIDEBAR
   ============================================ */
.admin-sidebar {
  width: 280px;
  background: #1a1a1a;
  border-right: 1px solid rgba(220, 20, 60, 0.3);
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 1000;
  transition: transform 0.3s ease;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(220, 20, 60, 0.5) transparent;
}

.admin-sidebar::-webkit-scrollbar {
  width: 6px;
}

.admin-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.admin-sidebar::-webkit-scrollbar-thumb {
  background: rgba(220, 20, 60, 0.3);
  border-radius: 3px;
}

.admin-sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(220, 20, 60, 0.5);
}

/* Sidebar Header */
.sidebar-header {
  padding: 2rem;
  border-bottom: 1px solid rgba(220, 20, 60, 0.2);
  text-align: center;
}

.sidebar-logo {
  display: inline-block;
}

.sidebar-logo img {
  height: 60px;
  width: auto;
}

.sidebar-title {
  font-family: var(--font-heading);
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-white);
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.sidebar-subtitle {
  font-size: 0.8rem;
  color: var(--color-primary);
  font-weight: 500;
}

/* Sidebar Navigation */
.sidebar-nav {
  padding: 2rem 1rem;
}

.sidebar-nav__item {
  margin-bottom: 0.5rem;
}

.sidebar-nav__link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1.5rem;
  margin: 0 0.5rem 0.5rem 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.2s ease;
  position: relative;
  text-decoration: none;
}

.sidebar-nav__link::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--color-primary);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.sidebar-nav__link:hover {
  color: var(--color-white);
  background: rgba(220, 20, 60, 0.1);
}

.sidebar-nav__link.active {
  color: var(--color-white);
  background: rgba(220, 20, 60, 0.15);
}

.sidebar-nav__link.active::before {
  opacity: 1;
}

.sidebar-nav__icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: var(--color-primary);
}

/* Sidebar Footer */
.sidebar-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.5rem;
  border-top: 1px solid rgba(220, 20, 60, 0.2);
  background: #1a1a1a;
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-user__avatar {
  width: 40px;
  height: 40px;
  background: var(--color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  font-weight: 600;
  font-size: 1rem;
}

.sidebar-user__info {
  flex: 1;
}

.sidebar-user__name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-white);
  margin-bottom: 0.25rem;
}

.sidebar-user__role {
  font-size: 0.75rem;
  color: var(--color-primary);
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(220, 20, 60, 0.1);
  border: 1px solid rgba(220, 20, 60, 0.3);
  border-radius: 6px;
  color: var(--color-primary);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: rgba(220, 20, 60, 0.2);
  border-color: var(--color-primary);
}

/* ============================================
   MAIN CONTENT
   ============================================ */
.admin-main {
  flex: 1;
  margin-left: 280px;
  min-height: 100vh;
  background: var(--color-black);
}

.sidebar-toggle {
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1001;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(220, 20, 60, 0.95) 0%, rgba(176, 16, 48, 0.95) 100%);
  border: 1px solid rgba(220, 20, 60, 0.5);
  border-radius: 10px;
  color: var(--color-white);
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(220, 20, 60, 0.3);
}

.sidebar-toggle:hover {
  background: linear-gradient(135deg, rgba(196, 30, 58, 0.95) 0%, rgba(158, 15, 42, 0.95) 100%);
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(220, 20, 60, 0.4);
}

.sidebar-toggle:active {
  transform: scale(0.95);
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
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.5);
  }

  .admin-main {
    margin-left: 0;
  }

  .sidebar-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .admin-content {
    padding: 6rem 1.5rem 2rem 1.5rem;
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    z-index: 999;
  }
}

@media (max-width: 768px) {
  .sidebar-toggle {
    top: 1rem;
    left: 1rem;
    width: 44px;
    height: 44px;
    font-size: 1.15rem;
  }

  .admin-content {
    padding: 5.5rem 1rem 1.5rem 1rem;
  }

  .sidebar-footer {
    padding: 1rem;
  }

  .sidebar-user {
    padding: 0.65rem;
  }

  .sidebar-user__avatar {
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }

  .sidebar-user__name {
    font-size: 0.85rem;
  }

  .logout-btn {
    padding: 0.65rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .sidebar-toggle {
    top: 0.875rem;
    left: 0.875rem;
    width: 42px;
    height: 42px;
    font-size: 1.1rem;
    border-radius: 8px;
  }

  .admin-content {
    padding: 5rem 0.875rem 1.25rem 0.875rem;
  }

  .sidebar-header {
    padding: 1.5rem 1rem;
  }

  .sidebar-logo img {
    height: 50px;
  }

  .sidebar-title {
    font-size: 1.1rem;
  }

  .sidebar-nav {
    padding: 1.5rem 0.75rem;
  }

  .sidebar-nav__link {
    padding: 0.75rem 1.25rem;
    font-size: 0.875rem;
  }
}
</style>

