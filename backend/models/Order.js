import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  restaurantCode: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  cartId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart',
    default: null
  },
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true
  },
  tableName: {
    type: String,
    required: true,
    trim: true
  },
  items: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true
    },
    itemName: {
      type: String,
      required: true,
      trim: true
    },
    itemImage: {
      type: String,
      default: ''
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    actualPrice: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    selectedModifiers: {
      type: Array,
      default: []
    },
    itemTotal: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  subtotal: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentMethod: {
    type: String,
    default: 'cash',
    trim: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    default: 'new',
    trim: true
  },
  customer: {
    phone: {
      type: String,
      default: '',
      trim: true
    }
  },
  notes: {
    type: String,
    default: ''
  },
  billIsSettle: {
    type: Boolean,
    default: false
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
}, {
  timestamps: true
});

export const Order = mongoose.model('Order', orderSchema);

