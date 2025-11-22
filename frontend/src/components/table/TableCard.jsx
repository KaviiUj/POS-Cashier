import React from 'react'
import { Card, Badge } from '../ui'

const TableCard = ({ table, onClick }) => {
  const isAvailable = table.isAvailable
  const statusColor = isAvailable ? 'green' : 'red'
  const statusText = isAvailable ? 'Available' : 'Occupied'
  const badgeVariant = isAvailable ? 'success' : 'danger'
  
  return (
    <Card
      className={`
        cursor-pointer transition-all duration-200 hover:shadow-lg
        border-2 ${isAvailable ? 'border-green-500' : 'border-red-500'}
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
        
        {!isAvailable && table.orderId && table.orderId.trim() !== '' && (
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">Order ID:</p>
            <p className="text-sm font-semibold text-gray-700 break-all">
              {table.orderId}
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}

export default TableCard

