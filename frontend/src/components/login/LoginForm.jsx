import React, { useState } from 'react'
import { Button, Input, Card } from '../ui'
import { logger } from '../../utils/logger'

const LoginForm = ({ onSubmit, loading = false, error = null }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
  })
  
  const validateForm = () => {
    const errors = {}
    let isValid = true
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid'
      isValid = false
    }
    
    if (!formData.password.trim()) {
      errors.password = 'Password is required'
      isValid = false
    }
    
    setFormErrors(errors)
    return isValid
  }
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      logger.logUserAction('login_form_submit', { email: formData.email })
      onSubmit(formData)
    } else {
      logger.warn('Login form validation failed', { errors: formErrors })
    }
  }
  
  return (
    <Card className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Staff Login
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          error={formErrors.email}
          required
          disabled={loading}
        />
        
        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          error={formErrors.password}
          required
          disabled={loading}
        />
        
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            Sign In
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default LoginForm

