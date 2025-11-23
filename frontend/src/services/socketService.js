import io from 'socket.io-client'
import { logger } from '../utils/logger'

const SOCKET_URL = 'http://192.168.1.4:5001'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.listeners = new Map()
  }

  connect() {
    if (this.socket?.connected) {
      logger.info('Socket already connected')
      return
    }

    try {
      logger.info('Connecting to Socket.io server', { url: SOCKET_URL })

      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })

      this.setupConnectionListeners()
    } catch (error) {
      logger.logError(error, { context: 'SocketService.connect' })
    }
  }

  setupConnectionListeners() {
    this.socket.on('connect', () => {
      this.isConnected = true
      logger.info('✅ Connected to POS Mobile real-time server')
      this.emit('connected')
    })

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false
      logger.warn('❌ Disconnected from POS Mobile server', { reason })
      this.emit('disconnected', reason)
    })

    this.socket.on('connect_error', (error) => {
      logger.logError(error, { context: 'SocketService.connect_error' })
      this.emit('connection_error', error)
    })

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      logger.info(`Reconnection attempt ${attemptNumber}`)
    })

    this.socket.on('reconnect_failed', () => {
      logger.error('Failed to reconnect to Socket.io server')
      this.emit('reconnect_failed')
    })

    // Listen for business events
    this.socket.on('pin_generated', (eventData) => {
      logger.info('PIN generated event received', eventData)
      this.emit('pin_generated', eventData)
    })

    this.socket.on('order_created', (eventData) => {
      logger.info('Order created event received', eventData)
      this.emit('order_created', eventData)
    })
  }

  // Custom event emitter for React components
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event).add(callback)

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event)
      if (callbacks) {
        callbacks.delete(callback)
      }
    }
  }

  // Emit custom events to listeners
  emit(event, data) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          logger.logError(error, { context: `SocketService.emit.${event}` })
        }
      })
    }
  }

  disconnect() {
    if (this.socket) {
      logger.info('Disconnecting from Socket.io server')
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      this.listeners.clear()
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected && this.socket?.connected,
      socketId: this.socket?.id || null,
    }
  }
}

export default new SocketService()

