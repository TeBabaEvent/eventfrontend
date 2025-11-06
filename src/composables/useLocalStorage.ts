/**
 * Composable pour gérer localStorage avec réactivité
 * 
 * @description
 * Ce composable permet de stocker et synchroniser des données avec localStorage
 * tout en maintenant la réactivité Vue. Les changements sont automatiquement
 * persistés dans localStorage.
 * 
 * @example
 * ```ts
 * // Dans un composant
 * import { useLocalStorage } from '@/composables/useLocalStorage'
 * 
 * const [theme, setTheme] = useLocalStorage('theme', 'dark')
 * 
 * // Modifier la valeur
 * setTheme('light')
 * // ou
 * theme.value = 'light'
 * ```
 * 
 * @param key - Clé du localStorage
 * @param defaultValue - Valeur par défaut si aucune valeur n'existe
 * @param serializer - Objet avec parse/stringify (par défaut JSON)
 * @returns [Ref, setValue] - Référence réactive et fonction pour modifier la valeur
 */
import { ref, watch, type Ref } from 'vue'

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  serializer = JSON
): [Ref<T>, (value: T) => void] {
  const storedValue = localStorage.getItem(key)
  
  const initialValue = storedValue !== null 
    ? serializer.parse(storedValue) 
    : defaultValue

  const state = ref(initialValue) as Ref<T>

  const setValue = (value: T) => {
    state.value = value
    localStorage.setItem(key, serializer.stringify(value))
  }

  // Synchroniser avec localStorage quand la valeur change
  watch(
    state,
    (newValue) => {
      localStorage.setItem(key, serializer.stringify(newValue))
    },
    { deep: true }
  )

  return [state, setValue]
}
