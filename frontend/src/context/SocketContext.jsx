import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import socketService from '../services/socketService'
import { logger } from '../utils/logger'

const SocketContext = createContext(null)

export const SocketProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: false,
    socketId: null,
  })
  const [recentEvents, setRecentEvents] = useState([])

  useEffect(() => {
    if (!isAuthenticated) {
      // Disconnect when not authenticated
      socketService.disconnect()
      setConnectionStatus({ isConnected: false, socketId: null })
      return
    }

    // Connect when authenticated
    socketService.connect()

    // Listen for connection status changes
    const unsubscribeConnected = socketService.on('connected', () => {
      setConnectionStatus(socketService.getConnectionStatus())
    })

    const unsubscribeDisconnected = socketService.on('disconnected', () => {
      setConnectionStatus(socketService.getConnectionStatus())
    })

    const unsubscribeConnectionError = socketService.on('connection_error', (error) => {
      logger.logError(error, { context: 'SocketContext.connection_error' })
      setConnectionStatus(socketService.getConnectionStatus())
    })

    // Update initial connection status
    setConnectionStatus(socketService.getConnectionStatus())

    // Cleanup on unmount or when authentication changes
    return () => {
      unsubscribeConnected()
      unsubscribeDisconnected()
      unsubscribeConnectionError()
    }
  }, [isAuthenticated])

  // Listen for business events and provide callbacks
  const onPinGenerated = useCallback((callback) => {
    return socketService.on('pin_generated', (eventData) => {
      setRecentEvents((prev) => [
        { type: 'pin_generated', data: eventData, timestamp: new Date() },
        ...prev.slice(0, 9), // Keep last 10 events
      ])
      callback(eventData)
    })
  }, [])

  const onOrderCreated = useCallback((callback) => {
    return socketService.on('order_created', (eventData) => {
      setRecentEvents((prev) => [
        { type: 'order_created', data: eventData, timestamp: new Date() },
        ...prev.slice(0, 9), // Keep last 10 events
      ])
      callback(eventData)
    })
  }, [])

  const value = {
    connectionStatus,
    recentEvents,
    onPinGenerated,
    onOrderCreated,
    reconnect: () => {
      socketService.disconnect()
      setTimeout(() => {
        socketService.connect()
      }, 1000)
    },
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

