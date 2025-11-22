import { logger } from '../utils/logger'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002'

class AuthService {
  async login(email, password) {
    try {
      const url = `${API_BASE_URL}/api/staff/login`
      const requestData = { email, password }
      
      logger.logAPIRequest({
        method: 'POST',
        url,
        data: { email, password: '***' }, // Don't log password
      })
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        logger.logAPIError(
          new Error(data.message || 'Login failed'),
          { method: 'POST', url, status: response.status }
        )
        throw new Error(data.message || 'Login failed')
      }
      
      logger.logAPIResponse(
        { status: response.status, statusText: response.statusText, data },
        { method: 'POST', url }
      )
      
      // Store token and staff data in localStorage
      if (data.data?.accessToken) {
        localStorage.setItem('accessToken', data.data.accessToken)
        localStorage.setItem('staff', JSON.stringify(data.data.staff))
      }
      
      return data
    } catch (error) {
      logger.logAPIError(error, { method: 'POST', url: `${API_BASE_URL}/api/staff/login` })
      throw error
    }
  }
  
  logout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('staff')
    logger.logUserAction('logout')
  }
  
  getToken() {
    return localStorage.getItem('accessToken')
  }
  
  getStaff() {
    const staff = localStorage.getItem('staff')
    return staff ? JSON.parse(staff) : null
  }
  
  isAuthenticated() {
    return !!this.getToken()
  }
}

export default new AuthService()

