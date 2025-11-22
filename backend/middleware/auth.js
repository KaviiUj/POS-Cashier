import jwt from 'jsonwebtoken';
import { TokenBlacklist } from '../models/index.js';
import { logger } from '../utils/logger.js';
import { getJWTSecret } from '../utils/jwt.js';

export const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access token is required'
      });
    }

    // Check if token is blacklisted
    const blacklistedToken = await TokenBlacklist.findOne({ token });
    if (blacklistedToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Token has been invalidated'
      });
    }

    // Verify token
    const secret = getJWTSecret();
    const decoded = jwt.verify(token, secret);

    // Attach user info to request
    req.user = decoded;
    req.token = token;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token - signature verification failed. Please check if the token was signed with the correct secret.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token has expired'
      });
    }

    logger.error('Authentication error', {
      error: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      status: 'error',
      message: 'Authentication failed'
    });
  }
};

