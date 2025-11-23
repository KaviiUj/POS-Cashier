import { useEffect } from 'react'
import { AuthProvider, useAuth, SocketProvider } from './context'
import { LoginScreen, TableScreen } from './screens'
import { logger } from './utils/logger'

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    logger.info('App mounted', {
      timestamp: new Date().toISOString(),
      isAuthenticated,
    })
  }, [isAuthenticated])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginScreen />
  }

  return <TableScreen />
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </AuthProvider>
  )
}

export default App

