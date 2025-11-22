import React from 'react'

const OrderItem = ({ item }) => {
  return (
    <div className="flex gap-2 py-2 border-b border-gray-100 last:border-b-0">
      {item.itemImage && (
        <img
          src={item.itemImage}
          alt={item.itemName}
          className="w-12 h-12 object-cover rounded"
          onError={(e) => {
            e.target.style.display = 'none'
          }}
        />
      )}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-gray-800 truncate">{item.itemName}</h4>
        <div className="flex items-center justify-between mt-1">
          <div className="text-xs text-gray-600">
            <span>Qty: {item.quantity}</span>
            {item.discount > 0 && (
              <span className="ml-2 text-red-600">
                -{item.discount}%
              </span>
            )}
          </div>
          <div className="text-right">
            {item.discount > 0 && (
              <p className="text-xs text-gray-400 line-through">
                LKR {(item.actualPrice * item.quantity).toFixed(2)}
              </p>
            )}
            <p className="font-semibold text-sm text-gray-800">
              LKR {(item.itemTotal || (item.price * item.quantity)).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderItem

