import React from 'react'
import { Card, Button } from '../ui'
import OrderItem from './OrderItem'
import OrderSummary from './OrderSummary'

const OrderDetails = ({ order, table, onSettle, onPrint, loading = false }) => {
  if (!order && !table) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-lg">Select a table to view order details</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-lg">No order found for this table</p>
          <p className="text-sm mt-2">Table: {table?.tableName}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="mb-4 flex-shrink-0">
        <h2 className="text-xl font-bold text-gray-800 mb-1">
          {order.tableName || table?.tableName}
        </h2>
        <p className="text-sm text-gray-600">
          Order: {order.orderNumber}
        </p>
        {order.customer?.phone && (
          <p className="text-sm text-gray-600">
            Phone: {order.customer.phone}
          </p>
        )}
      </div>

      {/* Order Items - Scrollable */}
      <div className="flex-1 overflow-y-auto mb-4 min-h-0">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Items:</h3>
        {order.items && order.items.length > 0 ? (
          <div>
            {order.items.map((item) => (
              <OrderItem key={item._id} item={item} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No items in this order</p>
        )}
      </div>

      {/* Order Summary and Buttons - Fixed at bottom */}
      <div className="flex-shrink-0 border-t border-gray-200 pt-4 bg-white">
        <OrderSummary order={order} />
        
        {/* Action Buttons */}
        <div className="mt-4 space-y-2">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={onSettle}
            disabled={loading || order.billIsSettle}
          >
            {order.billIsSettle ? 'Already Settled' : 'Settle'}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={onPrint}
            disabled={loading}
          >
            Print
          </Button>
        </div>
      </div>
    </div>
  )
}

export default OrderDetails

