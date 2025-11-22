import { logger } from '../utils/logger'
import authService from './authService'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002'

class TableService {
  getAuthHeaders() {
    const token = authService.getToken()
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async getTables() {
    try {
      const url = `${API_BASE_URL}/api/table`
      
      logger.logAPIRequest({
        method: 'GET',
        url,
      })
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        logger.logAPIError(
          new Error(data.message || 'Failed to fetch tables'),
          { method: 'GET', url, status: response.status }
        )
        throw new Error(data.message || 'Failed to fetch tables')
      }
      
      logger.logAPIResponse(
        { status: response.status, statusText: response.statusText, data },
        { method: 'GET', url }
      )
      
      return data
    } catch (error) {
      logger.logAPIError(error, { method: 'GET', url: `${API_BASE_URL}/api/table` })
      throw error
    }
  }

  async getOrderByTableId(tableId) {
    try {
      const url = `${API_BASE_URL}/api/table/order?tableId=${tableId}`
      
      logger.logAPIRequest({
        method: 'GET',
        url,
      })
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        logger.logAPIError(
          new Error(data.message || 'Failed to fetch order'),
          { method: 'GET', url, status: response.status }
        )
        throw new Error(data.message || 'Failed to fetch order')
      }
      
      logger.logAPIResponse(
        { status: response.status, statusText: response.statusText, data },
        { method: 'GET', url }
      )
      
      return data
    } catch (error) {
      logger.logAPIError(error, { method: 'GET', url: `${API_BASE_URL}/api/table/order` })
      throw error
    }
  }
}

export default new TableService()

