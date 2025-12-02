<template>
  <header :class="headerClasses" id="header">
    <div class="header__blur"></div>
    <div class="container">
      <nav class="nav">
        <!-- Logo -->
        <div ref="logoRef" class="nav__logo nav__animate">
          <router-link to="/" class="logo-container">
            <img src="/logo.svg" alt="Baba Event" class="logo-image">
          </router-link>
        </div>

        <!-- Navigation Menu Desktop -->
        <ul ref="navMenuRef" class="nav__menu nav__menu--desktop" id="navMenu">
          <li v-for="item in navigationItems" :key="item.id" class="nav__item nav__animate">
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
          <li class="nav__item nav__item--language nav__animate">
            <LanguageSelector />
          </li>
        </ul>

        <!-- Mobile Menu Toggle -->
        <button
          ref="toggleRef"
          class="nav__toggle nav__animate"
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
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useScrollSpy } from '@/composables/useScrollSpy'
import { scrollToElement } from '@/utils'
import { NAVIGATION_ITEMS } from '@/constants'
import LanguageSelector from '@/components/ui/LanguageSelector.vue'
import { useI18n } from 'vue-i18n'
import { useAnimations } from '@/composables/useAnimations'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const isMenuOpen = ref(false)
const isScrolled = ref(false)

// Template refs for GSAP
const logoRef = ref<HTMLElement | null>(null)
const navMenuRef = ref<HTMLElement | null>(null)
const toggleRef = ref<HTMLElement | null>(null)

// Animation context
const { createContext, isReady: animationsReady } = useAnimations()
let animationContext: ReturnType<typeof createContext> | null = null

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

// Gestion du scroll optimisée
const handleScroll = () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      isScrolled.value = window.scrollY > 50
      ticking = false
    })
    ticking = true
  }
}
let ticking = false

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

// GSAP Nav entrance animation
const initNavAnimations = () => {
  animationContext = createContext()
  if (!animationContext.gsap) return

  const { gsap } = animationContext

  animationContext.context?.add(() => {
    const tl = gsap.timeline({
      defaults: {
        ease: 'power2.out'
      }
    })

    // Logo - simple fade in
    tl.to(logoRef.value, {
      opacity: 1,
      duration: 0.4
    })

    // Nav items - staggered fade in
    const navItems = navMenuRef.value?.querySelectorAll('.nav__item')
    if (navItems && navItems.length > 0) {
      tl.to(navItems, {
        opacity: 1,
        duration: 0.3,
        stagger: 0.05
      }, '-=0.2')
    }

    // Mobile toggle - fade in
    if (toggleRef.value) {
      tl.to(toggleRef.value, {
        opacity: 1,
        duration: 0.3
      }, '-=0.2')
    }
  })
}

// Wait for animations to be ready before initializing
watch(animationsReady, async (ready) => {
  if (ready) {
    await nextTick()
    requestAnimationFrame(() => {
      initNavAnimations()
    })
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll() // Initial check
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.body.style.overflow = ''

  // Cleanup GSAP
  if (animationContext) {
    animationContext.cleanup()
    animationContext = null
  }
})
</script>

<style scoped>
/* ========================================
   HEADER - Premium Awwwards Quality
   ======================================== */

.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: var(--z-fixed);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  /* Force GPU layer for stable positioning */
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* Blur Background - Initially transparent */
.header__blur {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
  border-bottom: 1px solid transparent;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Scrolled State - Glass Morphism */
.header--scrolled .header__blur {
  background: rgba(5, 5, 5, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow:
    0 4px 30px rgba(0, 0, 0, 0.3),
    0 1px 0 rgba(220, 20, 60, 0.1);
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: clamp(70px, 9vh, 90px);
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 100%;
  transition: height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.header--scrolled .nav {
  height: clamp(60px, 7vh, 70px);
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
  height: clamp(55px, 7vh, 70px);
  width: auto;
  max-width: 100%;
  object-fit: contain;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 2px 12px rgba(220, 20, 60, 0.25));
}

.header--scrolled .logo-image {
  height: clamp(45px, 5.5vh, 55px);
}

.logo-container:hover .logo-image {
  filter: drop-shadow(0 4px 20px rgba(220, 20, 60, 0.5));
  transform: scale(1.03);
}

/* ===== GSAP ANIMATION SETUP ===== */
/* Desktop: Hide elements initially for GSAP animation */
@media (min-width: 1025px) {
  .nav__logo.nav__animate {
    opacity: 0;
  }

  .nav__item.nav__animate {
    opacity: 0;
  }

  .nav__toggle.nav__animate {
    opacity: 0;
  }
}

/* Mobile/Tablet: All elements visible by default (no GSAP animations) */
@media (max-width: 1024px) {
  .nav__logo.nav__animate,
  .nav__item.nav__animate,
  .nav__toggle.nav__animate {
    opacity: 1 !important;
  }
}

/* Navigation Menu */
.nav__menu {
  display: flex;
  align-items: center;
  gap: 4px;
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
  margin-left: 12px;
  padding-left: 12px;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

/* Navigation Links - Minimal & Elegant */
.nav__link {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  position: relative;
  padding: 10px 18px;
  border-radius: 50px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  display: inline-block;
  letter-spacing: 0.3px;
}

/* Hover Background - Subtle Glass */
.nav__link::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 50px;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.nav__link:hover::before {
  opacity: 1;
}

.nav__link span {
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.nav__link:hover {
  color: rgba(255, 255, 255, 0.95);
}

/* Active State - Primary Accent */
.nav__link.active {
  color: #fff;
}

.nav__link.active::before {
  opacity: 1;
  background: rgba(220, 20, 60, 0.12);
  border-color: rgba(220, 20, 60, 0.25);
}

/* Active Indicator Line */
.nav__link::after {
  content: '';
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 4px;
  height: 4px;
  background: var(--color-primary);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(220, 20, 60, 0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
}

.nav__link.active::after {
  transform: translateX(-50%) scaleX(1);
  opacity: 1;
}

/* Toggle Mobile - Minimal Design */
.nav__toggle {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  cursor: pointer;
  position: relative;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav__toggle:hover {
  background: rgba(220, 20, 60, 0.15);
  border-color: rgba(220, 20, 60, 0.3);
}

.nav__toggle:hover span {
  background: var(--color-primary);
}

.nav__toggle span {
  position: absolute;
  width: 20px;
  height: 1.5px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 2px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav__toggle span:nth-child(1) {
  top: calc(50% - 6px);
}

.nav__toggle span:nth-child(2) {
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
}

.nav__toggle span:nth-child(3) {
  bottom: calc(50% - 6px);
}

/* Toggle Active State */
.nav__toggle--active {
  background: rgba(220, 20, 60, 0.1);
  border-color: rgba(220, 20, 60, 0.3);
}

.nav__toggle--active span {
  background: var(--color-primary);
  width: 20px;
}

.nav__toggle--active span:nth-child(1) {
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
}

.nav__toggle--active span:nth-child(2) {
  opacity: 0;
  transform: translateY(-50%) scaleX(0);
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
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  opacity: 0;
  visibility: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: var(--z-sticky);
}

.nav__overlay--active {
  opacity: 1;
  visibility: visible;
}

/* Menu mobile hidden by default */
.nav__menu--mobile {
  display: none;
}

/* Tablet Styles */
@media (max-width: 1024px) {
  .nav__menu--desktop {
    gap: 2px;
  }

  .nav__link {
    padding: 8px 14px;
    font-size: 12px;
  }
}

/* Mobile Styles */
@media (max-width: 768px) {
  .nav {
    height: 70px;
  }

  .header--scrolled .nav {
    height: 60px;
  }

  .logo-image {
    height: 50px;
  }

  .header--scrolled .logo-image {
    height: 42px;
  }

  .nav__toggle {
    display: flex;
    z-index: var(--z-modal);
    width: 44px;
    height: 44px;
  }

  .header--scrolled .nav__toggle {
    width: 40px;
    height: 40px;
  }

  .nav__menu--desktop {
    display: none;
  }

  /* Mobile Menu - Premium Glass Panel */
  .nav__menu--mobile {
    display: flex;
    position: fixed;
    top: 0;
    right: -100%;
    width: min(85%, 360px);
    height: 100vh;
    height: 100dvh;
    /* 🚀 CRITICAL PERFORMANCE FIX: Disable backdrop-filter on mobile */
    background: #0a0a0a;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    padding: 0;
    box-shadow:
      -20px 0 80px rgba(0, 0, 0, 0.6),
      -1px 0 0 rgba(220, 20, 60, 0.1);
    transition: right 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    overflow-y: auto;
    overflow-x: hidden;
    z-index: var(--z-modal-backdrop);
    border-left: 1px solid rgba(220, 20, 60, 0.15);
  }

  .nav__menu--mobile::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: radial-gradient(
      ellipse at top right,
      rgba(220, 20, 60, 0.08) 0%,
      transparent 70%
    );
    pointer-events: none;
  }

  .nav__menu--mobile.nav__menu--open {
    right: 0;
  }

  /* Close Button - Minimal */
  .nav__menu-close {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 18px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 2;
    opacity: 0;
    transform: scale(0.8);
  }

  .nav__menu--open .nav__menu-close {
    opacity: 1;
    transform: scale(1);
    transition-delay: 0.2s;
  }

  .nav__menu-close:hover {
    background: rgba(220, 20, 60, 0.15);
    border-color: rgba(220, 20, 60, 0.3);
    color: #fff;
  }

  /* Menu List */
  .nav__menu-list {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    padding: 90px 24px 40px;
    gap: 8px;
    margin: 0;
    list-style: none;
  }

  .nav__menu--mobile .nav__item {
    width: 100%;
    opacity: 0;
    transform: translateX(20px);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .nav__menu--mobile.nav__menu--open .nav__item {
    opacity: 1;
    transform: translateX(0);
  }

  .nav__menu--mobile.nav__menu--open .nav__item:nth-child(1) { transition-delay: 0.1s; }
  .nav__menu--mobile.nav__menu--open .nav__item:nth-child(2) { transition-delay: 0.15s; }
  .nav__menu--mobile.nav__menu--open .nav__item:nth-child(3) { transition-delay: 0.2s; }
  .nav__menu--mobile.nav__menu--open .nav__item:nth-child(4) { transition-delay: 0.25s; }
  .nav__menu--mobile.nav__menu--open .nav__item:nth-child(5) { transition-delay: 0.3s; }
  .nav__menu--mobile.nav__menu--open .nav__item:nth-child(6) { transition-delay: 0.35s; }

  .nav__menu--mobile .nav__link {
    display: block;
    width: 100%;
    padding: 18px 24px;
    font-size: 16px;
    font-weight: 500;
    text-align: left;
    border-radius: 16px;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .nav__menu--mobile .nav__link span {
    color: inherit;
    position: relative;
    display: block;
    font-weight: 500;
    letter-spacing: 0.5px;
  }

  .nav__menu--mobile .nav__link:hover {
    background: rgba(255, 255, 255, 0.04);
    color: #fff;
    padding-left: 28px;
  }

  .nav__menu--mobile .nav__link::before,
  .nav__menu--mobile .nav__link::after {
    display: none;
  }

  .nav__menu--mobile .nav__link.active {
    background: linear-gradient(
      90deg,
      rgba(220, 20, 60, 0.15) 0%,
      rgba(220, 20, 60, 0.05) 100%
    );
    color: #fff;
  }

  .nav__menu--mobile .nav__link.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 28px;
    background: var(--color-primary);
    border-radius: 0 4px 4px 0;
    display: block;
    box-shadow: 0 0 12px rgba(220, 20, 60, 0.5);
  }

  .nav__menu--mobile .nav__link.active span {
    color: #fff;
    font-weight: 600;
  }

  .nav__menu--mobile .nav__item--language {
    width: 100%;
    margin-left: 0;
    margin-top: auto;
    padding: 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    border-left: none;
    justify-content: center;
    display: flex;
  }

  .nav__overlay {
    z-index: var(--z-sticky);
  }

  .nav__logo {
    z-index: var(--z-modal);
    position: relative;
  }

  .header {
    z-index: var(--z-fixed);
  }

  .header__blur {
    background: rgba(5, 5, 5, 0.98);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  /* Extra stability for mobile scroll */
  .header {
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
  }

  .nav {
    transform: translateZ(0);
  }
}

@media (max-width: 480px) {
  .nav {
    height: 65px;
  }

  .header--scrolled .nav {
    height: 56px;
  }

  .logo-image {
    height: 46px;
  }

  .header--scrolled .logo-image {
    height: 38px;
  }

  .nav__menu--mobile {
    width: 100%;
    border-left: none;
  }

  .nav__menu-list {
    padding: 80px 16px 24px;
  }

  .nav__menu-close {
    width: 42px;
    height: 42px;
    font-size: 16px;
    top: 14px;
    right: 14px;
    border-radius: 12px;
  }

  .nav__menu--mobile .nav__link {
    padding: 16px 20px;
    font-size: 15px;
    border-radius: 14px;
  }

  .nav__toggle {
    width: 42px;
    height: 42px;
    border-radius: 12px;
  }

  .header--scrolled .nav__toggle {
    width: 38px;
    height: 38px;
  }

  .nav__toggle span {
    width: 18px;
  }

  .nav__toggle span:nth-child(2) {
    width: 12px;
  }

  .nav__menu--mobile .nav__item--language {
    padding: 20px 16px;
  }
}
</style>
