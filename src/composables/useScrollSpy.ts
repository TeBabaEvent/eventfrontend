/**
 * Composable pour le scroll spy - détecte la section visible et met à jour la navigation
 * 
 * @description
 * Permet de mettre en surbrillance l'élément de navigation correspondant à la section
 * actuellement visible dans le viewport. Utilisé pour la navigation sticky.
 * 
 * @example
 * ```ts
 * // Dans AppHeader.vue
 * import { useScrollSpy } from '@/composables/useScrollSpy'
 * 
 * const sections = ['home', 'events', 'team', 'gallery', 'contact']
 * const { activeSection } = useScrollSpy(sections, 100)
 * 
 * // Dans le template
 * <a :class="{ active: activeSection === 'home' }" href="#home">Accueil</a>
 * ```
 * 
 * @param sectionIds - Liste des IDs des sections à surveiller
 * @param offset - Décalage en pixels pour la détection (défaut: 100)
 * @returns Object avec activeSection (Ref)
 */
import { ref, onMounted, onUnmounted } from 'vue'
import { throttle } from '@/utils'

export function useScrollSpy(sectionIds: string[], offset: number = 100) {
  const activeSection = ref('')

  const updateActiveSection = throttle(() => {
    const scrollPosition = window.scrollY + offset

    for (const sectionId of sectionIds) {
      const element = document.getElementById(sectionId)
      if (element) {
        const { offsetTop, offsetHeight } = element
        
        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
          activeSection.value = sectionId
          break
        }
      }
    }
  }, 100)

  onMounted(() => {
    window.addEventListener('scroll', updateActiveSection)
    updateActiveSection() // Initial check
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', updateActiveSection)
  })

  return {
    activeSection
  }
}
