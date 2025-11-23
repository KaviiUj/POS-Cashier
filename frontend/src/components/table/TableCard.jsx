import React from 'react'
import { Card, Badge } from '../ui'

const TableCard = ({ table, onClick }) => {
  // Determine table state: Available, PIN Available, or Occupied
  const hasOrderId = table.orderId && table.orderId.trim() !== ''
  const hasSessionPin = table.sessionPin && table.sessionPin.trim() !== ''
  
  let statusColor = 'green'
  let statusText = 'Available'
  let badgeVariant = 'success'
  let borderColor = 'border-green-500'
  
  if (hasOrderId) {
    // Occupied - has order
    statusColor = 'red'
    statusText = 'Occupied'
    badgeVariant = 'danger'
    borderColor = 'border-red-500'
  } else if (hasSessionPin) {
    // PIN Available - has PIN but no order yet
    statusColor = 'orange'
    statusText = 'PIN Available'
    badgeVariant = 'orange'
    borderColor = 'border-orange-500'
  }
  // else: Available (default)
  
  return (
    <Card
      className={`
        cursor-pointer transition-all duration-200 hover:shadow-lg
        border-2 ${borderColor}
        ${onClick ? 'hover:scale-105' : ''}
      `}
      onClick={onClick}
      padding="md"
    >
      <div className="flex flex-col items-center justify-center h-full min-h-[120px]">
        <div className="text-center mb-3">
          <h3 className="text-xl font-bold text-gray-800 mb-1">
            {table.tableName}
          </h3>
          <p className="text-sm text-gray-600">
            PAX: {table.pax}
          </p>
        </div>
        
        <div className="mt-2">
          <Badge variant={badgeVariant}>
            {statusText}
          </Badge>
        </div>
        
        {hasSessionPin && !hasOrderId && (
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">PIN:</p>
            <p className="text-sm font-semibold text-orange-700">
              {table.sessionPin}
            </p>
          </div>
        )}
        
        {hasOrderId && (
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">Order:</p>
            <p className="text-sm font-semibold text-gray-700 break-all">
              {table.orderNumber || table.orderId}
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}

export default TableCard

