import mongoose from 'mongoose';

const tokenBlacklistSchema = new mongoose.Schema({
  restaurantCode: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'userType'
  },
  userType: {
    type: String,
    enum: ['User', 'Staff'],
    required: true
  },
  reason: {
    type: String,
    default: 'logout'
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true
});

// Index for faster lookups
tokenBlacklistSchema.index({ token: 1 });

export const TokenBlacklist = mongoose.model('TokenBlacklist', tokenBlacklistSchema);

