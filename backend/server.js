import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import { logger } from './utils/logger.js';
import routes from './routes/index.js';

// Load environment variables - .env file should be in backend directory
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info('Incoming Request', {
    method: req.method,
    url: req.url,
    query: req.query,
    body: req.body,
    headers: req.headers,
    ip: req.ip
  });

  // Capture response details
  const originalSend = res.send;
  res.send = function (data) {
    logger.info('Outgoing Response', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseBody: data
    });
    originalSend.call(this, data);
  };

  next();
});

// API Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Frontend logs endpoint
app.post('/api/logs/frontend', (req, res) => {
  const logEntry = req.body;
  
  // Log frontend logs using backend logger
  if (logEntry.level === 'error') {
    logger.error('Frontend Error', {
      message: logEntry.message,
      metadata: logEntry,
      userAgent: logEntry.userAgent,
      url: logEntry.url
    });
  } else if (logEntry.level === 'warn') {
    logger.warn('Frontend Warning', {
      message: logEntry.message,
      metadata: logEntry,
      userAgent: logEntry.userAgent,
      url: logEntry.url
    });
  } else {
    logger.info('Frontend Log', {
      message: logEntry.message,
      metadata: logEntry,
      userAgent: logEntry.userAgent,
      url: logEntry.url
    });
  }

  res.status(200).json({ status: 'OK', message: 'Log received' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    body: req.body
  });

  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.url
  });
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

const PORT = process.env.PORT || 5002;

// Start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.info('Server started', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development'
      });
    });
  })
  .catch((error) => {
    logger.error('Failed to start server', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  });

