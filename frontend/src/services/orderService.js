import { logger } from '../utils/logger'
import authService from './authService'

// Separate base URL for order service (will be configurable in the future)
const ORDER_API_BASE_URL = import.meta.env.VITE_ORDER_API_URL || 'http://localhost:5001'

class OrderService {
  getAuthHeaders() {
    const token = authService.getToken()
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async settleOrder(orderId, paymentMethod = 'cash', tableId = null) {
    try {
      let url = `${ORDER_API_BASE_URL}/api/v1/order/settle?orderId=${orderId}&paymentMethod=${paymentMethod}`
      if (tableId) {
        url += `&tableId=${tableId}`
      }
      
      logger.logAPIRequest({
        method: 'PATCH',
        url,
        data: { orderId, paymentMethod, tableId },
      })
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        logger.logAPIError(
          new Error(data.message || 'Failed to settle order'),
          { method: 'PATCH', url, status: response.status }
        )
        throw new Error(data.message || 'Failed to settle order')
      }
      
      logger.logAPIResponse(
        { status: response.status, statusText: response.statusText, data },
        { method: 'PATCH', url }
      )
      
      return data
    } catch (error) {
      logger.logAPIError(error, { method: 'PATCH', url: `${ORDER_API_BASE_URL}/api/v1/order/settle` })
      throw error
    }
  }
}

export default new OrderService()

