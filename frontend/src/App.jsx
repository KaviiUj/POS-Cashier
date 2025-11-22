import { useEffect } from 'react'
import { logger } from './utils/logger'

function App() {
  useEffect(() => {
    logger.info('App mounted', {
      timestamp: new Date().toISOString()
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800">POS Cashier</h1>
        <p className="mt-4 text-gray-600">Welcome to POS Cashier Application</p>
      </div>
    </div>
  )
}

export default App

