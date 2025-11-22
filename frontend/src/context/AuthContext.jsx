import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services'
import { logger } from '../utils/logger'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [staff, setStaff] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  useEffect(() => {
    // Check if user is already logged in
    const storedStaff = authService.getStaff()
    const token = authService.getToken()
    
    if (storedStaff && token) {
      setStaff(storedStaff)
      setIsAuthenticated(true)
      logger.info('User session restored', { staffId: storedStaff._id })
    }
    
    setLoading(false)
  }, [])
  
  const login = async (email, password) => {
    try {
      setLoading(true)
      const response = await authService.login(email, password)
      
      if (response.status === 'success' && response.data) {
        setStaff(response.data.staff)
        setIsAuthenticated(true)
        logger.logUserAction('login_success', { staffId: response.data.staff._id })
        return { success: true, data: response.data }
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (error) {
      logger.logError(error, { context: 'AuthContext.login' })
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }
  
  const logout = () => {
    authService.logout()
    setStaff(null)
    setIsAuthenticated(false)
    logger.info('User logged out')
  }
  
  const value = {
    staff,
    loading,
    isAuthenticated,
    login,
    logout,
  }
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

