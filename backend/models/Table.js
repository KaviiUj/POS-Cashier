import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema({
  tableName: {
    type: String,
    required: true,
    trim: true
  },
  pax: {
    type: Number,
    required: true,
    min: 1
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  orderId: {
    type: String,
    default: ''
  },
  sessionPin: {
    type: String,
    default: ''
  },
  pinGeneratedAt: {
    type: Date
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null
  }
}, {
  timestamps: true
});

export const Table = mongoose.model('Table', tableSchema);

