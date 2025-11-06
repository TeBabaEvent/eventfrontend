<template>
  <footer class="footer" id="contact">
    <div class="footer__bg-grid"></div>
    
    <div class="container">
      <!-- CTA Section -->
      <div class="footer__cta" data-aos="fade-up">
        <div class="footer__cta-content">
          <h2 class="footer__cta-title">{{ t('footer.cta.title') }}</h2>
          <p class="footer__cta-subtitle">{{ t('footer.cta.subtitle') }}</p>
        </div>
        <BaseButton 
          variant="primary" 
          size="large" 
          icon="fas fa-arrow-right"
          tag="a"
          :href="contactLink"
          target="_blank"
          rel="noopener"
        >
          {{ t('footer.cta.button') }}
        </BaseButton>
      </div>

      <!-- Main Footer Content -->
      <div class="footer__main">
        <div class="footer__grid">
          <!-- About -->
          <div class="footer__column footer__column--large">
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
          <div class="footer__column">
            <h3 class="footer__title">{{ t('footer.sections.navigation') }}</h3>
            <ul class="footer__links">
              <li v-for="item in navigationItems" :key="item.id">
                <a :href="item.href" class="footer__link">{{ item.label }}</a>
              </li>
            </ul>
          </div>

          <!-- Services -->
          <div class="footer__column">
            <h3 class="footer__title">{{ t('footer.sections.services') }}</h3>
            <ul class="footer__links">
              <li v-for="service in services" :key="service">
                <a href="#events" class="footer__link">{{ service }}</a>
              </li>
            </ul>
          </div>

          <!-- Contact -->
          <div class="footer__column">
            <h3 class="footer__title">{{ t('footer.sections.contact') }}</h3>
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
          <a href="#" class="footer__legal-link">{{ t('footer.legal.terms') }}</a>
          <span class="footer__separator">•</span>
          <a href="#" class="footer__legal-link">{{ t('footer.legal.privacy') }}</a>
          <span class="footer__separator">•</span>
          <a href="#" class="footer__legal-link">{{ t('footer.legal.cgv') }}</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { APP_CONFIG, CONTACT_INFO, SOCIAL_LINKS, NAVIGATION_ITEMS, WHATSAPP_MESSAGES } from '@/constants'
import { generateWhatsAppLink } from '@/utils'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

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
  return generateWhatsAppLink(WHATSAPP_MESSAGES.contact, CONTACT_INFO.whatsapp)
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
</script>

<style scoped>
.footer {
  position: relative;
  background: var(--color-dark);
  color: var(--color-white);
  padding: 0;
  overflow: hidden;
}

.footer__bg-grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(220, 20, 60, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(220, 20, 60, 0.02) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}

/* CTA Section */
.footer__cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl) 0;
  margin-bottom: var(--spacing-xl);
  position: relative;
  flex-wrap: wrap;
}

.footer__cta::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(220, 20, 60, 0.3) 50%,
    transparent 100%
  );
}

.footer__cta-content {
  flex: 1;
  min-width: 300px;
}

.footer__cta-title {
  font-family: var(--font-heading);
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--color-white);
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.footer__cta-subtitle {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.7);
}

/* Main Content */
.footer__main {
  padding: var(--spacing-xl) 0;
  position: relative;
}

.footer__grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: var(--spacing-xl);
}

.footer__column {
  position: relative;
}

.footer__logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-family: var(--font-heading);
  font-size: 1.75rem;
}

.footer__logo .logo-image {
  height: 100px;
  width: auto;
  margin-bottom: var(--spacing-md);
}

.footer__description {
  color: rgba(255, 255, 255, 0.75);
  margin-bottom: var(--spacing-lg);
  line-height: 1.8;
  max-width: 400px;
}

/* Social Links Premium */
.footer__social {
  display: flex;
  gap: 0.75rem;
}

.footer__social-link {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  color: var(--color-white);
  transition: all var(--transition-normal);
  position: relative;
  text-decoration: none;
}

.footer__social-link::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  border-radius: 50%;
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.footer__social-link i {
  position: relative;
  z-index: 1;
}

.footer__social-link:hover {
  border-color: var(--color-primary);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(220, 20, 60, 0.4);
}

.footer__social-link:hover::before {
  opacity: 1;
}

.footer__title {
  font-family: var(--font-heading);
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: var(--spacing-md);
  color: var(--color-white);
  position: relative;
  padding-bottom: 0.75rem;
}

.footer__title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 2px;
  background: var(--color-primary);
  border-radius: 2px;
}

.footer__links {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer__link {
  color: rgba(255, 255, 255, 0.7);
  transition: all var(--transition-fast);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  text-decoration: none;
}

.footer__link::before {
  content: '';
  width: 0;
  height: 2px;
  background: var(--color-primary);
  transition: width var(--transition-normal);
  border-radius: 2px;
}

.footer__link:hover {
  color: var(--color-primary);
  transform: translateX(4px);
}

.footer__link:hover::before {
  width: 16px;
}

/* Contact Items */
.footer__contact {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer__contact li {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  color: rgba(255, 255, 255, 0.75);
  transition: all var(--transition-fast);
}

.footer__contact li:hover {
  color: var(--color-white);
}

.footer__contact-icon {
  width: 40px;
  height: 40px;
  min-width: 40px;
  max-width: 40px;
  background: rgba(220, 20, 60, 0.1);
  border: 1px solid rgba(220, 20, 60, 0.2);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--transition-normal);
}

.footer__contact-icon i {
  color: var(--color-primary);
  font-size: 0.875rem;
  width: 1em;
  text-align: center;
  display: inline-block;
}

.footer__contact li:hover .footer__contact-icon {
  background: rgba(220, 20, 60, 0.15);
  border-color: var(--color-primary);
  box-shadow: 0 0 20px rgba(220, 20, 60, 0.3);
}

.footer__contact a {
  color: inherit;
  transition: color var(--transition-fast);
  text-decoration: none;
}

.footer__contact a:hover {
  color: var(--color-primary);
}

/* Footer Bottom */
.footer__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  flex-wrap: wrap;
  gap: var(--spacing-md);
  position: relative;
}

.footer__copyright {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  margin: 0;
}

.footer__copyright strong {
  color: var(--color-white);
  font-weight: 700;
}

.footer__legal {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.footer__separator {
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.875rem;
}

.footer__legal-link {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  transition: color var(--transition-fast);
  position: relative;
  text-decoration: none;
}

.footer__legal-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--color-primary);
  transition: width var(--transition-normal);
}

.footer__legal-link:hover {
  color: var(--color-white);
}

.footer__legal-link:hover::after {
  width: 100%;
}

/* Responsive - Tablette Landscape */
@media (max-width: 1024px) {
  .footer__grid {
    grid-template-columns: 1fr 1fr 1fr;
    gap: var(--spacing-lg);
  }

  .footer__column--large {
    grid-column: span 3;
    max-width: 100%;
  }
}

/* Responsive - Tablette Portrait */
@media (max-width: 768px) {
  .footer__cta {
    padding: 3rem 0;
    margin-bottom: 3rem;
    flex-direction: column;
    text-align: center;
    gap: 2rem;
  }

  .footer__cta-content {
    min-width: auto;
    width: 100%;
  }

  .footer__cta-title {
    font-size: 2rem;
  }

  .footer__cta-subtitle {
    font-size: 1rem;
  }

  .footer__main {
    padding: 3rem 0;
  }

  .footer__grid {
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem 2rem;
  }

  .footer__column--large {
    grid-column: span 2;
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
  }

  .footer__logo {
    justify-content: center;
  }

  .footer__logo .logo-image {
    height: 80px;
  }

  .footer__description {
    max-width: 100%;
  }

  .footer__social {
    justify-content: center;
  }

  .footer__social-link {
    width: 44px;
    height: 44px;
    font-size: 1rem;
  }

  .footer__contact-icon {
    width: 36px;
    height: 36px;
    min-width: 36px;
    max-width: 36px;
  }

  .footer__title {
    text-align: left;
  }

  .footer__title::after {
    left: 0;
  }

  .footer__links {
    align-items: flex-start;
  }

  .footer__bottom {
    padding: 2rem 0;
    gap: 1.5rem;
  }
}

/* Responsive - Mobile */
@media (max-width: 480px) {
  .footer__cta {
    padding: 2.5rem 0;
    margin-bottom: 2.5rem;
  }

  .footer__cta-title {
    font-size: 1.75rem;
  }

  .footer__cta-subtitle {
    font-size: 0.9375rem;
  }

  .footer__main {
    padding: 2.5rem 0;
  }

  .footer__grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .footer__column--large {
    grid-column: span 1;
  }

  .footer__logo .logo-image {
    height: 70px;
  }

  .footer__social-link {
    width: 42px;
    height: 42px;
  }

  .footer__contact-icon {
    width: 34px;
    height: 34px;
    min-width: 34px;
    max-width: 34px;
  }

  .footer__bottom {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem 0;
    gap: 1rem;
  }

  .footer__copyright,
  .footer__legal {
    width: 100%;
    justify-content: center;
  }

  .footer__legal {
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
  }

  .footer__separator {
    display: none;
  }

  .footer__legal-link {
    font-size: 0.8125rem;
  }
}
</style>

