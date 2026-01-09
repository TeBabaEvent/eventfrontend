<template>
  <footer ref="sectionRef" class="footer" id="contact">
    <!-- Background is now handled by GlobalBackground component -->

    <div class="container">
      <!-- CTA Section - Open Style like other sections -->
      <div ref="ctaRef" class="footer__cta">
        <!-- Badge -->
        <div class="footer__cta-badge">
          <span class="footer__cta-badge-icon">
            <i class="fas fa-paper-plane"></i>
          </span>
          <span class="footer__cta-badge-text">{{ t('footer.sections.contact') }}</span>
        </div>

        <!-- Title with accent -->
        <h2 class="footer__cta-title">
          {{ t('footer.cta.title').split('?')[0] }}<span class="footer__cta-title-accent">?</span>
        </h2>

        <!-- Subtitle -->
        <p class="footer__cta-subtitle">{{ t('footer.cta.subtitle') }}</p>

        <!-- CTA Button - Primary Style -->
        <a
          :href="contactLink"
          target="_blank"
          rel="noopener"
          class="footer__cta-button"
        >
          <span>{{ t('footer.cta.button') }}</span>
          <i class="fas fa-arrow-right"></i>
        </a>
      </div>

      <!-- Main Footer Content -->
      <div ref="gridRef" class="footer__main">
        <div class="footer__grid">
          <!-- About -->
          <div class="footer__column footer__column--large gsap-grid-item">
            <div class="footer__logo">
              <img src="/logo.svg" alt="Baba Event" class="logo-image">
            </div>
            <p class="footer__description">
              {{ t('footer.about.description') }}
            </p>
            <div class="footer__social">
              <a
                v-for="(link, platform) in socialLinks"
                :key="platform"
                :href="link"
                class="footer__social-link"
                target="_blank"
                rel="noopener"
                :aria-label="platform"
              >
                <i :class="getSocialIcon(platform)"></i>
              </a>
            </div>
          </div>

          <!-- Navigation -->
          <div class="footer__column gsap-grid-item">
            <h3 class="footer__title">
              <span class="footer__title-dot"></span>
              {{ t('footer.sections.navigation') }}
            </h3>
            <ul class="footer__links">
              <li v-for="item in navigationItems" :key="item.id">
                <a :href="item.href" class="footer__link">{{ item.label }}</a>
              </li>
            </ul>
          </div>

          <!-- Services -->
          <div class="footer__column gsap-grid-item">
            <h3 class="footer__title">
              <span class="footer__title-dot"></span>
              {{ t('footer.sections.services') }}
            </h3>
            <ul class="footer__links">
              <li v-for="service in services" :key="service">
                <a href="#events" class="footer__link">{{ service }}</a>
              </li>
            </ul>
          </div>

          <!-- Contact -->
          <div class="footer__column gsap-grid-item">
            <h3 class="footer__title">
              <span class="footer__title-dot"></span>
              {{ t('footer.sections.contact') }}
            </h3>
            <ul class="footer__contact">
              <li>
                <div class="footer__contact-icon">
                  <i class="fas fa-envelope"></i>
                </div>
                <a :href="`mailto:${contactInfo.email}`">{{ contactInfo.email }}</a>
              </li>
              <li>
                <div class="footer__contact-icon">
                  <i class="fas fa-phone"></i>
                </div>
                <a :href="`tel:${contactInfo.phone.replace(/\s/g, '')}`">{{ contactInfo.phone }}</a>
              </li>
              <li>
                <div class="footer__contact-icon">
                  <i class="fas fa-map-marker-alt"></i>
                </div>
                <span>{{ contactInfo.address }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Footer Bottom -->
      <div class="footer__bottom">
        <p class="footer__copyright">
          &copy; {{ currentYear }} <strong>{{ appName }}</strong>. {{ t('footer.legal.copyright') }}
        </p>
        <div class="footer__legal">
          <router-link :to="{ name: 'mentions-legales' }" class="footer__legal-link">{{ t('footer.legal.terms') }}</router-link>
          <router-link :to="{ name: 'privacy-policy' }" class="footer__legal-link">{{ t('footer.legal.privacy') }}</router-link>
          <router-link :to="{ name: 'sales-terms' }" class="footer__legal-link">{{ t('footer.legal.cgv') }}</router-link>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { APP_CONFIG, CONTACT_INFO, SOCIAL_LINKS, NAVIGATION_ITEMS } from '@/constants'
import { generateWhatsAppLink } from '@/utils'
import { useI18n } from 'vue-i18n'
import { useAnimations } from '@/composables/useAnimations'

const { t } = useI18n()

// Template refs for animations
const sectionRef = ref<HTMLElement | null>(null)
const ctaRef = ref<HTMLElement | null>(null)
const gridRef = ref<HTMLElement | null>(null)

// Animation context
const { createContext, isReady: animationsReady } = useAnimations()
let animationContext: ReturnType<typeof createContext> | null = null

// Data
const appName = APP_CONFIG.name
const contactInfo = CONTACT_INFO
const socialLinks = SOCIAL_LINKS

const currentYear = new Date().getFullYear()

const navigationItems = computed(() =>
  NAVIGATION_ITEMS.filter(item => item.id !== 'contact').map(item => ({
    ...item,
    label: t(`nav.${item.id}`)
  }))
)

const services = computed(() => [
  t('footer.services.concerts'),
  t('footer.services.vip'),
  t('footer.services.festivals'),
  t('footer.services.weddings')
])

// Computed
const contactLink = computed(() => {
  return generateWhatsAppLink(t('footer.cta.whatsappMessage'), CONTACT_INFO.whatsapp)
})

// Methods
const getSocialIcon = (platform: string): string => {
  const icons: Record<string, string> = {
    facebook: 'fab fa-facebook-f',
    instagram: 'fab fa-instagram',
    tiktok: 'fab fa-tiktok',
    youtube: 'fab fa-youtube'
  }
  return icons[platform] || 'fas fa-link'
}

// ═══════════════════════════════════════════════════════════════
// ANIMATIONS - Desktop only for performance
// ═══════════════════════════════════════════════════════════════

const initScrollAnimations = () => {
  // Create scoped animation context (no-op on mobile/reduced motion)
  animationContext = createContext(sectionRef.value || undefined)

  // Skip if animations disabled
  if (!animationContext.gsap) return

  const { gsap, ScrollTrigger } = animationContext
  if (!ScrollTrigger) return

  animationContext.context?.add(() => {
    // ─────────────────────────────────────────────────────────────
    // CTA SECTION - Elegant staggered reveal (desktop only)
    // ─────────────────────────────────────────────────────────────
    const badge = ctaRef.value?.querySelector('.footer__cta-badge')
    const title = ctaRef.value?.querySelector('.footer__cta-title')
    const subtitle = ctaRef.value?.querySelector('.footer__cta-subtitle')
    const button = ctaRef.value?.querySelector('.footer__cta-button')

    const ctaTl = gsap.timeline({
      scrollTrigger: {
        trigger: ctaRef.value,
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    })

    if (badge) {
      gsap.set(badge, { opacity: 0, y: 25 })
      ctaTl.to(badge, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out'
      })
    }

    if (title) {
      gsap.set(title, { opacity: 0, y: 35, clipPath: 'inset(0 0 100% 0)' })
      ctaTl.to(title, {
        opacity: 1,
        y: 0,
        clipPath: 'inset(0 0 0% 0)',
        duration: 1,
        ease: 'power3.out'
      }, '-=0.5')
    }

    if (subtitle) {
      gsap.set(subtitle, { opacity: 0, y: 25 })
      ctaTl.to(subtitle, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out'
      }, '-=0.6')
    }

    if (button) {
      gsap.set(button, { opacity: 0, y: 25 })
      ctaTl.to(button, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out'
      }, '-=0.5')
    }

    // ─────────────────────────────────────────────────────────────
    // FOOTER GRID - Smooth staggered reveal (desktop only)
    // ─────────────────────────────────────────────────────────────
    const gridItems = gridRef.value?.querySelectorAll('.gsap-grid-item')
    if (gridItems && gridItems.length > 0) {
      gsap.set(gridItems, { opacity: 0, y: 35 })
      gsap.to(gridItems, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: {
          amount: 0.5,
          from: 'start' as const
        },
        ease: 'power2.out',
        scrollTrigger: {
          trigger: gridRef.value,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      })
    }
  })
}

// Wait for animations to be ready before initializing
watch(animationsReady, async (ready) => {
  if (ready) {
    await nextTick()
    requestAnimationFrame(() => {
      initScrollAnimations()
    })
  }
}, { immediate: true })

onUnmounted(() => {
  // 🚀 FIXED: Proper cleanup with tween killing
  if (animationContext) {
    animationContext.cleanup()
    animationContext = null
  }
})
</script>

<style scoped>
/* ============================================
   FOOTER - PREMIUM DESIGN
   Matching Hero, Events & Team Sections
   ============================================ */

/* ===== GSAP SCROLL ANIMATION ===== */
/* Desktop: Elements start hidden for GSAP animation */
@media (min-width: 1025px) {
  .gsap-grid-item {
    opacity: 0;
  }
}

/* Mobile/Tablet: Elements visible by default (no GSAP animations) */
@media (max-width: 1024px) {
  .gsap-grid-item {
    opacity: 1 !important;
  }
}

.footer {
  position: relative;
  background: transparent;
  color: #fff;
  overflow: hidden;
}

/* Background is now handled by GlobalBackground component */

/* ===== CTA SECTION - Open Style like other sections ===== */
.footer__cta {
  position: relative;
  z-index: 1;
  padding: 100px 0 80px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* CTA Badge - Same as section badges */
.footer__cta-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50px;
  margin-bottom: 24px;
}

.footer__cta-badge-icon {
  color: var(--color-primary);
  font-size: 12px;
  animation: badge-pulse 2s ease-in-out infinite;
}

.footer__cta-badge-text {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 2px;
}

/* CTA Title - Same style as section titles */
.footer__cta-title {
  font-family: var(--font-heading);
  font-size: clamp(36px, 5vw, 52px);
  font-weight: 800;
  color: #fff;
  line-height: 1.1;
  margin: 0 0 16px 0;
  letter-spacing: -0.03em;
}

.footer__cta-title-accent {
  background: linear-gradient(135deg, var(--color-primary) 0%, #ff4d6d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* CTA Subtitle */
.footer__cta-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 32px 0;
  max-width: 450px;
  line-height: 1.6;
}

/* CTA Button - Primary Gradient Style */
.footer__cta-button {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 18px 36px;
  background: linear-gradient(135deg, var(--color-primary) 0%, #b01030 100%);
  border: none;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(220, 20, 60, 0.3);
}

.footer__cta-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #ff4d6d 0%, var(--color-primary) 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.footer__cta-button span,
.footer__cta-button i {
  position: relative;
  z-index: 1;
}

.footer__cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(220, 20, 60, 0.5);
}

.footer__cta-button:hover::before {
  opacity: 1;
}

.footer__cta-button i {
  font-size: 11px;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.footer__cta-button:hover i {
  transform: translateX(4px);
}

/* ===== MAIN FOOTER ===== */
.footer__main {
  position: relative;
  z-index: 1;
  padding: 60px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.footer__grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 48px;
}

.footer__column {
  position: relative;
}

/* Logo */
.footer__logo {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.footer__logo .logo-image {
  height: 80px;
  width: auto;
}

/* Description */
.footer__description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.8;
  margin-bottom: 24px;
  max-width: 350px;
}

/* Social Links - Glass Style */
.footer__social {
  display: flex;
  gap: 12px;
}

.footer__social-link {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.footer__social-link:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(220, 20, 60, 0.3);
  color: #fff;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

/* Column Titles */
.footer__title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 24px;
}

.footer__title-dot {
  width: 6px;
  height: 6px;
  background: var(--color-primary);
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(220, 20, 60, 0.6);
}

/* Links */
.footer__links {
  display: flex;
  flex-direction: column;
  gap: 14px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer__link {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-block;
}

.footer__link:hover {
  color: #fff;
  transform: translateX(6px);
}

/* Contact Items */
.footer__contact {
  display: flex;
  flex-direction: column;
  gap: 16px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer__contact li {
  display: flex;
  align-items: center;
  gap: 12px;
}

.footer__contact-icon {
  width: 36px;
  height: 36px;
  min-width: 36px;
  background: rgba(220, 20, 60, 0.1);
  border: 1px solid rgba(220, 20, 60, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.footer__contact-icon i {
  color: var(--color-primary);
  font-size: 12px;
}

.footer__contact li:hover .footer__contact-icon {
  background: rgba(220, 20, 60, 0.15);
  border-color: var(--color-primary);
  box-shadow: 0 0 16px rgba(220, 20, 60, 0.25);
}

.footer__contact a,
.footer__contact span {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer__contact a:hover {
  color: #fff;
}

/* ===== FOOTER BOTTOM ===== */
.footer__bottom {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.footer__copyright {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}

.footer__copyright strong {
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
}

.footer__legal {
  display: flex;
  align-items: center;
  gap: 24px;
}

.footer__legal-link {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: color 0.3s ease;
}

.footer__legal-link:hover {
  color: rgba(255, 255, 255, 0.8);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .footer__cta {
    padding: 80px 0 60px;
  }

  .footer__grid {
    grid-template-columns: 1fr 1fr 1fr;
    gap: 40px;
  }

  .footer__column--large {
    grid-column: span 3;
    text-align: center;
  }

  .footer__logo {
    justify-content: center;
  }

  .footer__description {
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }

  .footer__social {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .footer__cta {
    padding: 60px 0 48px;
  }

  .footer__cta-badge {
    padding: 8px 16px;
  }

  .footer__cta-badge-text {
    font-size: 10px;
  }

  .footer__cta-subtitle {
    font-size: 14px;
    padding: 0 20px;
  }

  .footer__cta-button {
    padding: 16px 32px;
    font-size: 11px;
  }

  .footer__main {
    padding: 48px 0;
  }

  .footer__grid {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }

  .footer__column--large {
    grid-column: span 2;
  }

  .footer__logo .logo-image {
    height: 70px;
  }

  .footer__title {
    justify-content: flex-start;
  }

  .footer__bottom {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .footer__cta {
    padding: 48px 0 40px;
  }

  .footer__cta-title {
    font-size: clamp(28px, 8vw, 36px);
  }

  .footer__cta-subtitle {
    font-size: 13px;
  }

  .footer__cta-button {
    padding: 14px 28px;
    font-size: 10px;
    width: calc(100% - 40px);
    justify-content: center;
  }

  .footer__main {
    padding: 40px 0;
  }

  .footer__grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .footer__column--large {
    grid-column: span 1;
  }

  .footer__logo .logo-image {
    height: 60px;
  }

  .footer__social-link {
    width: 40px;
    height: 40px;
    font-size: 14px;
    border-radius: 8px;
  }

  .footer__legal {
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px;
  }

  .footer__bottom {
    padding: 20px 0;
  }
}
</style>
