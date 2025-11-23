import React, { useState, useEffect } from 'react'
import { TableCard } from '../components/table'
import { OrderDetails } from '../components/order'
import { Button } from '../components/ui'
import { useAuth, useSocket } from '../context'
import { tableService, orderService } from '../services'
import { logger } from '../utils/logger'

const TableScreen = () => {
  const { staff, logout } = useAuth()
  const { connectionStatus, onPinGenerated, onOrderCreated, reconnect } = useSocket()
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTable, setSelectedTable] = useState(null)
  const [order, setOrder] = useState(null)
  const [orderLoading, setOrderLoading] = useState(false)
  const [orderError, setOrderError] = useState(null)
  const [settleLoading, setSettleLoading] = useState(false)
  const [notifications, setNotifications] = useState([])

  const fetchTables = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true)
      }
      setError(null)
      
      const response = await tableService.getTables()
      
      if (response.status === 'success' && response.data?.tables) {
        setTables(response.data.tables)
        logger.info('Tables fetched successfully', { count: response.data.tables.length })
      } else {
        throw new Error(response.message || 'Failed to fetch tables')
      }
    } catch (err) {
      if (!silent) {
        setError(err.message || 'An error occurred while fetching tables')
      }
      logger.logError(err, { context: 'TableScreen.fetchTables' })
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }

  const fetchOrder = async (tableId) => {
    try {
      setOrderLoading(true)
      setOrderError(null)
      setOrder(null)
      
      const response = await tableService.getOrderByTableId(tableId)
      
      if (response.status === 'success') {
        setOrder(response.data?.order || null)
        logger.info('Order fetched successfully', { tableId, hasOrder: !!response.data?.order })
      } else {
        setOrder(null)
        logger.warn('No order found', { tableId, message: response.message })
      }
    } catch (err) {
      setOrderError(err.message || 'An error occurred while fetching order')
      setOrder(null)
      logger.logError(err, { context: 'TableScreen.fetchOrder' })
    } finally {
      setOrderLoading(false)
    }
  }

  // Show notification temporarily
  const showNotification = (message, type = 'info') => {
    const id = Date.now()
    setNotifications((prev) => [...prev, { id, message, type }])
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 5000)
  }

  // Handle PIN generated event
  useEffect(() => {
    const unsubscribe = onPinGenerated((eventData) => {
      logger.info('PIN generated event received', eventData)
      const { tableId, tableName, sessionPin, customerMobileNumber } = eventData.data

      // Show notification
      showNotification(
        `PIN for ${tableName}: ${sessionPin} (Customer: ${customerMobileNumber})`,
        'success'
      )

      // Update table status - add sessionPin (will show as "PIN Available" - orange)
      setTables((prevTables) =>
        prevTables.map((table) =>
          table._id === tableId
            ? { ...table, sessionPin, isAvailable: false }
            : table
        )
      )

      // Refresh tables to get latest data
      fetchTables()
    })

    return unsubscribe
  }, [onPinGenerated])

  // Handle order created event
  useEffect(() => {
    const unsubscribe = onOrderCreated((eventData) => {
      logger.info('Order created event received', eventData)
      const order = eventData.data

      // Show notification
      const message = order.isUpdate
        ? `Order ${order.orderNumber} updated - Items added`
        : `New order ${order.orderNumber} from ${order.tableName || 'Customer'}`
      
      showNotification(message, 'success')

      // If order has a table, update table status - set orderId (will show as "Occupied" - red)
      if (order.tableId) {
        logger.info('Updating table with order', { 
          orderTableId: order.tableId, 
          orderNumber: order.orderNumber 
        })
        
        setTables((prevTables) => {
          const updated = prevTables.map((table) => {
            // Compare as strings to handle ObjectId vs string comparison
            const tableIdStr = String(table._id)
            const orderTableIdStr = String(order.tableId)
            
            if (tableIdStr === orderTableIdStr) {
              return { 
                ...table, 
                isAvailable: false, 
                orderId: order.orderId || order.orderNumber,
                orderNumber: order.orderNumber,
                // Keep sessionPin if it exists
                sessionPin: table.sessionPin || ''
              }
            }
            return table
          })
          logger.info('Table state updated', { 
            tablesCount: updated.length,
            foundTable: updated.some(t => String(t._id) === String(order.tableId))
          })
          return updated
        })

        // Refresh tables after a delay to sync with API (silent mode to avoid flicker)
        // This allows the local update to be visible immediately
        setTimeout(() => {
          fetchTables(true) // Silent refresh - no loading state
        }, 2000)
      } else {
        // No table associated, still refresh after delay (silent)
        setTimeout(() => {
          fetchTables(true) // Silent refresh - no loading state
        }, 2000)
      }

      // If the order is for the currently selected table, fetch the order details
      if (selectedTable) {
        const selectedTableIdStr = String(selectedTable._id)
        const orderTableIdStr = String(order.tableId)
        if (selectedTableIdStr === orderTableIdStr) {
          fetchOrder(order.tableId)
        }
      }
    })

    return unsubscribe
  }, [onOrderCreated, selectedTable])

  useEffect(() => {
    fetchTables()
    logger.logPageView('TableScreen')
  }, [])

  const handleTableClick = (table) => {
    logger.logUserAction('table_click', { 
      tableId: table._id, 
      tableName: table.tableName,
      isAvailable: table.isAvailable,
      hasOrderId: !!(table.orderId && table.orderId.trim() !== ''),
      hasSessionPin: !!(table.sessionPin && table.sessionPin.trim() !== '')
    })
    
    setSelectedTable(table)
    // Only fetch order if table has an orderId (occupied state)
    const hasOrderId = table.orderId && table.orderId.trim() !== ''
    if (hasOrderId) {
      fetchOrder(table._id)
    } else {
      setOrder(null)
      setOrderError(null)
    }
  }

  const handleSettle = async () => {
    if (!order?._id) {
      alert('No order selected')
      return
    }

    if (settleLoading) {
      return // Prevent multiple clicks
    }

    try {
      setSettleLoading(true)
      logger.logUserAction('settle_order', { 
        orderId: order._id,
        orderNumber: order.orderNumber,
        tableId: selectedTable?._id
      })

      // Default payment method is 'cash', can be made configurable later
      const paymentMethod = order.paymentMethod || 'cash'
      const tableId = selectedTable?._id
      
      const response = await orderService.settleOrder(order._id, paymentMethod, tableId)
      
      if (response.success) {
        logger.info('Order settled successfully', { 
          orderId: order._id,
          orderNumber: order.orderNumber 
        })
        
        // Refresh the order to get updated status
        if (selectedTable?._id) {
          await fetchOrder(selectedTable._id)
        }
        
        // Optionally refresh tables to update availability
        await fetchTables()
        
        alert(response.message || 'Bill settled successfully')
      } else {
        throw new Error(response.message || 'Failed to settle order')
      }
    } catch (error) {
      logger.logError(error, { context: 'TableScreen.handleSettle' })
      alert(error.message || 'An error occurred while settling the order')
    } finally {
      setSettleLoading(false)
    }
  }

  const handlePrint = () => {
    logger.logUserAction('print_order', { 
      orderId: order?._id,
      orderNumber: order?.orderNumber,
      tableId: selectedTable?._id
    })
    // TODO: Implement print functionality
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tables...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-md flex-shrink-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">POS Cashier</h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome, {staff?.staffName || 'User'}
              </p>
              {/* Connection Status */}
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    connectionStatus.isConnected
                      ? 'bg-green-500'
                      : 'bg-red-500'
                  }`}
                />
                <span className="text-xs text-gray-500">
                  {connectionStatus.isConnected
                    ? 'Connected to POS Mobile'
                    : 'Disconnected - Real-time updates unavailable'}
                </span>
                {!connectionStatus.isConnected && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={reconnect}
                    className="ml-2 text-xs"
                  >
                    Reconnect
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                size="md"
                onClick={fetchTables}
              >
                Refresh
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={logout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`px-4 py-3 rounded-lg shadow-lg max-w-sm animate-fade-in ${
                notification.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : notification.type === 'error'
                  ? 'bg-red-50 border border-red-200 text-red-800'
                  : 'bg-blue-50 border border-blue-200 text-blue-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium">{notification.message}</p>
                <button
                  onClick={() =>
                    setNotifications((prev) =>
                      prev.filter((n) => n.id !== notification.id)
                    )
                  }
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Content - Split Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Side - Tables (70%) */}
        <div className="w-[70%] overflow-y-auto p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={fetchTables}
              >
                Retry
              </Button>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Tables</h2>
            <p className="text-sm text-gray-600">
              Total: {tables.length} | 
              Available: {tables.filter(t => t.isAvailable).length} | 
              Occupied: {tables.filter(t => !t.isAvailable).length}
            </p>
          </div>

          {tables.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No tables found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tables.map((table) => (
                <TableCard
                  key={table._id}
                  table={table}
                  onClick={() => handleTableClick(table)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Side - Order Details (30%) */}
        <div className="w-[30%] bg-white border-l border-gray-200 p-6 flex flex-col overflow-hidden">
          {orderLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 text-sm">Loading order...</p>
              </div>
            </div>
          ) : (
            <OrderDetails
              order={order}
              table={selectedTable}
              onSettle={handleSettle}
              onPrint={handlePrint}
              loading={orderLoading || settleLoading}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default TableScreen

