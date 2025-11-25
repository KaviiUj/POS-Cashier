import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
  restaurantCode: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  staffName: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: Number,
    required: true
  },
  mobileNumber: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  nic: {
    type: String,
    required: true,
    trim: true
  },
  profileImageUrl: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export const Staff = mongoose.model('Staff', staffSchema);

