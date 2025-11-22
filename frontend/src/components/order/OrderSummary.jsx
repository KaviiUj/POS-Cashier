import React from 'react'
import { Card } from '../ui'

const OrderSummary = ({ order }) => {
  if (!order) return null

  return (
    <Card className="mt-4" padding="md">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-medium text-gray-800">
            LKR {order.subtotal?.toFixed(2) || '0.00'}
          </span>
        </div>
        
        {order.discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount:</span>
            <span className="font-medium text-red-600">
              -LKR {order.discount?.toFixed(2) || '0.00'}
            </span>
          </div>
        )}
        
        {order.tax > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax:</span>
            <span className="font-medium text-gray-800">
              LKR {order.tax?.toFixed(2) || '0.00'}
            </span>
          </div>
        )}
        
        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex justify-between">
            <span className="text-lg font-bold text-gray-800">Total:</span>
            <span className="text-lg font-bold text-gray-800">
              LKR {order.total?.toFixed(2) || '0.00'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default OrderSummary

