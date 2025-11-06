<template>
  <header :class="headerClasses" id="header">
    <div class="header__blur"></div>
    <div class="container">
      <nav class="nav">
        <!-- Logo -->
        <div class="nav__logo">
          <router-link to="/" class="logo-container">
            <img src="/logo.svg" alt="Baba Event" class="logo-image">
          </router-link>
        </div>
        
        <!-- Navigation Menu Desktop -->
        <ul class="nav__menu nav__menu--desktop" id="navMenu">
          <li v-for="item in navigationItems" :key="item.id" class="nav__item">
            <a 
              :href="item.href" 
              class="nav__link"
              :class="{ 'active': activeSection === item.id }"
              @click="handleNavClick(item.href, $event)"
            >
              <span :data-text="item.label">{{ item.label }}</span>
            </a>
          </li>
          
          <!-- Language Selector -->
          <li class="nav__item nav__item--language">
            <LanguageSelector />
          </li>
        </ul>

        <!-- Mobile Menu Toggle -->
        <button 
          class="nav__toggle" 
          :class="{ 'nav__toggle--active': isMenuOpen }"
          @click="toggleMenu"
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>
    </div>
    
    <!-- Menu Mobile - En dehors du container -->
    <div class="nav__menu nav__menu--mobile" :class="{ 'nav__menu--open': isMenuOpen }">
      <!-- Close Button -->
      <button 
        class="nav__menu-close" 
        @click="closeMenu"
        aria-label="Fermer le menu"
      >
        <i class="fas fa-times"></i>
      </button>

      <ul class="nav__menu-list">
        <li v-for="item in navigationItems" :key="item.id" class="nav__item">
          <a 
            :href="item.href" 
            class="nav__link"
            :class="{ 'active': activeSection === item.id }"
            @click="handleNavClick(item.href, $event)"
          >
            <span :data-text="item.label">{{ item.label }}</span>
          </a>
        </li>
        
        <!-- Language Selector -->
        <li class="nav__item nav__item--language">
          <LanguageSelector />
        </li>
      </ul>
    </div>
    
    <!-- Menu Overlay -->
    <div 
      class="nav__overlay" 
      :class="{ 'nav__overlay--active': isMenuOpen }"
      @click="closeMenu"
    ></div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useScrollSpy } from '@/composables/useScrollSpy'
import { scrollToElement, throttle } from '@/utils'
import { NAVIGATION_ITEMS } from '@/constants'
import LanguageSelector from '@/components/ui/LanguageSelector.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const isMenuOpen = ref(false)
const isScrolled = ref(false)

// Navigation items with translations
const navigationItems = computed(() => 
  NAVIGATION_ITEMS.map(item => ({
    ...item,
    label: t(`nav.${item.id}`)
  }))
)

// Scroll spy pour la navigation active
const { activeSection } = useScrollSpy(['home', 'events', 'team', 'contact'])

// Classes dynamiques pour le header
const headerClasses = computed(() => [
  'header',
  {
    'header--scrolled': isScrolled.value,
    'header--menu-open': isMenuOpen.value
  }
])

// Gestion du scroll
const handleScroll = throttle(() => {
  isScrolled.value = window.scrollY > 50
}, 100)

// Navigation
const handleNavClick = async (href: string, event: Event) => {
  event.preventDefault()
  closeMenu()
  
  if (href.startsWith('#')) {
    // Si on n'est pas sur la page d'accueil, naviguer d'abord vers la home
    if (route.name !== 'home') {
      // Naviguer vers la home avec le hash
      // Le scrollBehavior du router s'occupera du scroll automatiquement
      await router.push({ path: '/', hash: href })
    } else {
      // On est déjà sur la home, juste scroller
      scrollToElement(href)
    }
  }
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  document.body.style.overflow = isMenuOpen.value ? 'hidden' : ''
}

const closeMenu = () => {
  isMenuOpen.value = false
  document.body.style.overflow = ''
}

// Lifecycle
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll() // Initial check
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: var(--z-fixed);
  transition: all var(--transition-normal);
}

.header__blur {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 15, 15, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(220, 20, 60, 0.12);
}

.header--scrolled .header__blur {
  background: rgba(10, 10, 10, 0.95);
  border-bottom: 1px solid rgba(220, 20, 60, 0.2);
  box-shadow: 0 1px 0 rgba(220, 20, 60, 0.05);
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 90px;
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 100%;
}

/* Logo */
.nav__logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 900;
  position: relative;
  cursor: pointer;
  padding: 0.5rem 0;
  text-decoration: none;
}

.logo-image {
  height: 80px;
  width: auto;
  max-width: 100%;
  object-fit: contain;
  transition: all var(--transition-normal);
  filter: drop-shadow(0 2px 8px rgba(220, 20, 60, 0.3));
}

.logo-container:hover .logo-image {
  filter: drop-shadow(0 4px 16px rgba(220, 20, 60, 0.6));
  transform: scale(1.05);
}

/* Navigation Menu */
.nav__menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
  margin-left: auto;
}

.nav__item {
  margin: 0;
}

.nav__item--language {
  display: flex;
  align-items: center;
  margin-left: var(--spacing-2);
}

.nav__link {
  font-size: 0.9375rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  position: relative;
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-sm);
  transition: all var(--transition-normal);
  text-decoration: none;
  display: inline-block;
}

/* Effet de fond au hover */
.nav__link::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(220, 20, 60, 0.1);
  border-radius: var(--radius-sm);
  opacity: 0;
  transition: opacity var(--transition-normal);
  border: 1px solid rgba(220, 20, 60, 0.2);
}

.nav__link:hover::before {
  opacity: 1;
}

.nav__link span {
  position: relative;
  z-index: 1;
  transition: color var(--transition-fast);
}

.nav__link:hover,
.nav__link.active {
  color: var(--color-white);
}

/* Effet de texte gradient au hover/active */
.nav__link.active span {
  background: linear-gradient(135deg, var(--color-primary) 0%, #FF1744 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Indicateur actif sous le lien */
.nav__link::after {
  content: '';
  position: absolute;
  bottom: 0.25rem;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 20px;
  height: 2px;
  background: var(--color-primary);
  border-radius: 2px;
  box-shadow: 0 0 8px rgba(220, 20, 60, 0.6);
  transition: transform var(--transition-normal);
}

.nav__link.active::after {
  transform: translateX(-50%) scaleX(1);
}

/* Toggle mobile premium */
.nav__toggle {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  cursor: pointer;
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-sm);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all var(--transition-normal);
}

.nav__toggle:hover {
  background: rgba(220, 20, 60, 0.1);
  border-color: rgba(220, 20, 60, 0.3);
  box-shadow: 0 4px 16px rgba(220, 20, 60, 0.2);
}

.nav__toggle span {
  position: absolute;
  width: 24px;
  height: 2px;
  background: var(--color-white);
  border-radius: 2px;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 2px 8px rgba(220, 20, 60, 0.3);
}

.nav__toggle span:nth-child(1) {
  top: calc(50% - 8px);
}

.nav__toggle span:nth-child(2) {
  top: 50%;
  transform: translateY(-50%);
}

.nav__toggle span:nth-child(3) {
  bottom: calc(50% - 8px);
}

/* Animation toggle active - X Premium */
.nav__toggle--active {
  background: rgba(220, 20, 60, 0.15);
  border-color: var(--color-primary);
  box-shadow: 0 6px 24px rgba(220, 20, 60, 0.4);
}

.nav__toggle--active span {
  background: var(--color-primary);
}

.nav__toggle--active span:nth-child(1) {
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
}

.nav__toggle--active span:nth-child(2) {
  opacity: 0;
  transform: translateY(-50%) scale(0);
}

.nav__toggle--active span:nth-child(3) {
  bottom: 50%;
  transform: translateY(50%) rotate(-45deg);
}

/* Menu Overlay */
.nav__overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  opacity: 0;
  visibility: hidden;
  transition: all var(--transition-normal);
  z-index: var(--z-sticky);
}

.nav__overlay--active {
  opacity: 1;
  visibility: visible;
}

/* Menu mobile hidden par défaut */
.nav__menu--mobile {
  display: none;
}

/* Tablet Styles */
@media (max-width: 1024px) {
  .nav__menu--desktop {
    gap: 0.25rem;
  }
  
  .nav__link {
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
  }
}

/* Mobile Styles - Optimisé pour la visibilité */
@media (max-width: 768px) {
  .header {
    height: 70px;
  }
  
  .nav {
    height: 70px;
  }

  .logo-image {
    height: 60px;
  }
  
  .nav__toggle {
    display: flex;
    z-index: var(--z-modal);
  }
  
  /* Cacher le menu desktop */
  .nav__menu--desktop {
    display: none;
  }
  
  /* Afficher le menu mobile */
  .nav__menu--mobile {
    display: flex;
    position: fixed;
    top: 0;
    right: -100%;
    width: min(85%, 400px);
    height: 100vh;
    background: linear-gradient(180deg, rgba(8, 8, 8, 0.98) 0%, rgba(12, 12, 12, 0.98) 100%);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    padding: 0;
    box-shadow: 
      -4px 0 24px rgba(0, 0, 0, 0.5),
      inset 1px 0 0 rgba(220, 20, 60, 0.2);
    transition: right 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    overflow-y: auto;
    overflow-x: hidden;
    z-index: var(--z-modal-backdrop);
    border-left: 1px solid rgba(220, 20, 60, 0.15);
  }
  
  .nav__menu--mobile.nav__menu--open {
    right: 0;
  }

  /* Close Button */
  .nav__menu-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(220, 20, 60, 0.1);
    border: 1px solid rgba(220, 20, 60, 0.3);
    border-radius: var(--radius-sm);
    color: var(--color-white);
    font-size: 1.25rem;
    cursor: pointer;
    transition: all var(--transition-normal);
    z-index: 2;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    opacity: 0;
    transform: rotate(-90deg) scale(0.8);
  }

  .nav__menu--open .nav__menu-close {
    opacity: 1;
    transform: rotate(0) scale(1);
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.15s;
  }

  .nav__menu-close:hover {
    background: rgba(220, 20, 60, 0.2);
    border-color: var(--color-primary);
    transform: rotate(90deg) scale(1.1);
    box-shadow: 0 4px 16px rgba(220, 20, 60, 0.3);
  }

  .nav__menu-close:active {
    transform: rotate(90deg) scale(0.95);
  }

  /* Menu List */
  .nav__menu-list {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    padding: 5rem 1.5rem 2rem;
    gap: 0.75rem;
    margin: 0;
    list-style: none;
  }
  
  .nav__menu--mobile .nav__item {
    width: 100%;
    max-width: 100%;
    opacity: 0;
    transform: translateX(30px);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
  }
  
  .nav__menu--mobile.nav__menu--open .nav__item {
    opacity: 1;
    transform: translateX(0);
  }
  
  .nav__menu--mobile.nav__menu--open .nav__item:nth-child(1) { transition-delay: 0.08s; }
  .nav__menu--mobile.nav__menu--open .nav__item:nth-child(2) { transition-delay: 0.12s; }
  .nav__menu--mobile.nav__menu--open .nav__item:nth-child(3) { transition-delay: 0.16s; }
  .nav__menu--mobile.nav__menu--open .nav__item:nth-child(4) { transition-delay: 0.2s; }
  .nav__menu--mobile.nav__menu--open .nav__item:nth-child(5) { transition-delay: 0.24s; }
  .nav__menu--mobile.nav__menu--open .nav__item:nth-child(6) { transition-delay: 0.28s; }
  
  .nav__menu--mobile .nav__link {
    display: block;
    width: 100%;
    padding: 1.25rem 1.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    text-align: left;
    border-radius: var(--radius-sm);
    margin-bottom: 0;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.9);
    position: relative;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .nav__menu--mobile .nav__link span {
    color: rgba(255, 255, 255, 0.9);
    position: relative;
    display: block;
    font-weight: 600;
    letter-spacing: 0.3px;
  }
  
  .nav__menu--mobile .nav__link:hover {
    background: rgba(220, 20, 60, 0.12);
    border-color: rgba(220, 20, 60, 0.35);
    color: #ffffff;
    transform: translateX(4px);
    box-shadow: 
      0 4px 16px rgba(220, 20, 60, 0.15),
      0 2px 8px rgba(0, 0, 0, 0.2);
  }
  
  .nav__menu--mobile .nav__link:hover span {
    color: #ffffff;
  }
  
  .nav__menu--mobile .nav__link::before {
    display: none;
  }
  
  .nav__menu--mobile .nav__link::after {
    display: none;
  }
  
  .nav__menu--mobile .nav__link.active {
    background: linear-gradient(135deg, rgba(220, 20, 60, 0.18) 0%, rgba(220, 20, 60, 0.12) 100%);
    border-color: rgba(220, 20, 60, 0.5);
    color: #ffffff;
    box-shadow: 
      0 4px 20px rgba(220, 20, 60, 0.25),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }
  
  .nav__menu--mobile .nav__link.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 50%;
    background: var(--color-primary);
    border-radius: 0 2px 2px 0;
    display: block;
  }
  
  .nav__menu--mobile .nav__link.active span {
    color: #ffffff;
    background: none;
    -webkit-background-clip: unset;
    -webkit-text-fill-color: #ffffff;
    background-clip: unset;
    font-weight: 700;
  }
  
  .nav__menu--mobile .nav__item--language {
    width: 100%;
    max-width: 100%;
    margin-left: 0;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(220, 20, 60, 0.2);
    justify-content: stretch;
    display: flex;
  }
  
  .nav__overlay {
    z-index: var(--z-sticky);
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }
  
  /* Assurer que le logo et toggle restent visibles */
  .nav__logo {
    z-index: var(--z-modal);
    position: relative;
  }
  
  .header {
    z-index: var(--z-fixed);
  }
}

@media (max-width: 480px) {
  .logo-image {
    height: 50px;
  }
  
  .nav__menu--mobile {
    width: 90%;
  }

  .nav__menu-list {
    padding: 4.5rem 1.25rem 2rem;
  }

  .nav__menu-close {
    width: 44px;
    height: 44px;
    font-size: 1.125rem;
  }
  
  .nav__menu--mobile .nav__link {
    padding: 1.125rem 1.25rem;
    font-size: 1.05rem;
  }
  
  .nav__toggle {
    width: 45px;
    height: 45px;
  }
  
  .nav__toggle span {
    width: 22px;
  }
}
</style>
