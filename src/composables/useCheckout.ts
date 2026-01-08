// Composable pour gérer le processus de paiement
import { ref } from 'vue'
import { buildApiUrl, API_ENDPOINTS } from '@/config/api'
import type { CheckoutData, CheckoutResponse, Order, CartCheckoutData, CartCheckoutResponse } from '@/types'
import { logger } from '@/services/logger'

export function useCheckout() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Initie une session de paiement
   *
   * @param data - Données de la réservation
   * @returns Promise avec les informations de paiement
   */
  async function initiatePayment(data: CheckoutData): Promise<CheckoutResponse | null> {
    isLoading.value = true
    error.value = null

    try {
      const url = buildApiUrl(API_ENDPOINTS.CHECKOUT_CREATE)

      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include', // Important pour les cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Erreur inconnue' }))
        throw new Error(errorData.detail || `Erreur HTTP: ${response.status}`)
      }

      const result: CheckoutResponse = await response.json()

      logger.log('Checkout session created:', result)

      // Rediriger automatiquement vers la page de paiement PayPal
      if (result.pay_url) {
        window.location.href = result.pay_url
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de la session de paiement'
      error.value = errorMessage
      logger.error('Checkout error:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Récupère les détails d'une commande par son numéro
   *
   * @param orderNumber - Numéro de commande (ex: BABA-ABC123)
   * @returns Promise avec les détails de la commande
   */
  async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
    isLoading.value = true
    error.value = null

    try {
      const url = buildApiUrl(API_ENDPOINTS.ORDER_BY_NUMBER(orderNumber))

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Erreur inconnue' }))
        throw new Error(errorData.detail || `Erreur HTTP: ${response.status}`)
      }

      const order: Order = await response.json()

      logger.log('Order fetched:', order)

      return order
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération de la commande'
      error.value = errorMessage
      logger.error('Get order error:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Initie une session de paiement pour un panier multi-pack
   *
   * @param data - Données du panier (items + customer)
   * @returns Promise avec les informations de paiement
   */
  async function initiateCartPayment(data: CartCheckoutData, autoRedirect: boolean = true): Promise<CartCheckoutResponse | null> {
    isLoading.value = true
    error.value = null

    try {
      const url = buildApiUrl(API_ENDPOINTS.CART_CHECKOUT_CREATE)

      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include', // Important pour les cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Erreur inconnue' }))
        throw new Error(errorData.detail || `Erreur HTTP: ${response.status}`)
      }

      const result: CartCheckoutResponse = await response.json()

      logger.log('Cart checkout session created:', result)

      // Pour les paiements cash, on redirige toujours (c'est une page de confirmation)
      if (result.is_pending_cash) {
        // Rediriger vers la page de confirmation avec indication cash
        if (autoRedirect) window.location.href = result.pay_url
        return result
      }

      // Rediriger automatiquement vers la page de paiement PayPal (si demandé)
      if (result.pay_url && autoRedirect) {
        window.location.href = result.pay_url
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de la session de paiement'
      error.value = errorMessage
      logger.error('Cart checkout error:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Polling pour vérifier le statut d'une commande
   * Utile pour les paiements en attente
   *
   * @param orderNumber - Numéro de commande
   * @param maxAttempts - Nombre maximum de tentatives (défaut: 40)
   * @param interval - Intervalle entre les tentatives en ms (défaut: 3000)
   * @param onUpdate - Callback appelé à chaque mise à jour
   * @returns Promise avec la commande finale
   */
  async function pollOrderStatus(
    orderNumber: string,
    maxAttempts = 40,
    interval = 3000,
    onUpdate?: (order: Order) => void
  ): Promise<Order | null> {
    let attempts = 0

    while (attempts < maxAttempts) {
      const order = await getOrderByNumber(orderNumber)

      if (!order) {
        return null
      }

      // Appeler le callback si fourni
      if (onUpdate) {
        onUpdate(order)
      }

      // Si le paiement est terminé (succès ou échec), arrêter le polling
      if (order.status === 'completed' || order.status === 'failed' || order.status === 'cancelled') {
        return order
      }

      // Attendre avant la prochaine tentative
      await new Promise(resolve => setTimeout(resolve, interval))
      attempts++
    }

    // Timeout atteint
    logger.warn(`Polling timeout for order ${orderNumber} after ${maxAttempts} attempts`)
    logger.warn(`Polling timeout for order ${orderNumber} after ${maxAttempts} attempts`)
    return null
  }

  /**
   * Capture le paiement PayPal et finalise la commande
   *
   * @param orderNumber - Numéro de commande local
   * @param paypalOrderId - ID de commande PayPal
   */
  async function capturePayment(orderNumber: string, paypalOrderId: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const url = buildApiUrl(API_ENDPOINTS.CHECKOUT_CAPTURE(orderNumber))

      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paypal_order_id: paypalOrderId }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Erreur inconnue' }))
        throw new Error(errorData.detail || `Erreur HTTP: ${response.status}`)
      }

      logger.log('Payment captured successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la capture du paiement'
      error.value = errorMessage
      logger.error('Capture payment error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    initiatePayment,
    initiateCartPayment,
    getOrderByNumber,
    pollOrderStatus,
    capturePayment,
  }
}
