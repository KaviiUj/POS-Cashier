import React, { useState } from 'react'
import { LoginForm } from '../components/login'
import { Container } from '../components/ui'
import { useAuth } from '../context'
import { logger } from '../utils/logger'

const LoginScreen = () => {
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const handleLogin = async (formData) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await login(formData.email, formData.password)
      
      if (!result.success) {
        setError(result.error || 'Login failed. Please check your credentials.')
        logger.warn('Login failed', { email: formData.email, error: result.error })
      } else {
        logger.info('Login successful', { staffId: result.data?.staff?._id })
        // Navigation will be handled by App.jsx based on auth state
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.')
      logger.logError(err, { context: 'LoginScreen.handleLogin' })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Container maxWidth="md" className="w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">POS Cashier</h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>
        
        <LoginForm
          onSubmit={handleLogin}
          loading={loading}
          error={error}
        />
      </Container>
    </div>
  )
}

export default LoginScreen

