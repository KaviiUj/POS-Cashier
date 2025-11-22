import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

// Load environment variables - already loaded in server.js, but ensure it's loaded here too
dotenv.config();

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // MongoDB connection options
    });

    logger.info('MongoDB connected', {
      host: conn.connection.host,
      database: conn.connection.name,
      readyState: conn.connection.readyState
    });

    // Log connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error', {
        error: err.message,
        stack: err.stack
      });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    logger.error('MongoDB connection failed', {
      error: error.message,
      stack: error.stack,
      uri: process.env.MONGODB_URI ? 'MongoDB URI is set' : 'MongoDB URI is missing'
    });
    throw error;
  }
};

