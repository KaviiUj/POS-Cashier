// Browser-compatible logger with Winston-like API
class Logger {
  constructor(level = 'info', apiUrl = null) {
    this.level = level;
    this.apiUrl = apiUrl;
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    };
  }

  formatTimestamp() {
    return new Date().toISOString().replace('T', ' ').slice(0, 19);
  }

  formatMessage(level, message, metadata = {}) {
    const timestamp = this.formatTimestamp();
    let formatted = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (Object.keys(metadata).length > 0) {
      formatted += `\n${JSON.stringify(metadata, null, 2)}`;
    }
    
    return formatted;
  }

  shouldLog(level) {
    return this.levels[level] <= this.levels[this.level];
  }

  async log(level, message, metadata = {}) {
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry = {
      level,
      message,
      ...metadata,
      timestamp: new Date().toISOString(),
      service: 'pos-cashier-frontend',
      source: 'frontend',
      userAgent: navigator?.userAgent || 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    };

    // Log to browser console
    const formatted = this.formatMessage(level, message, metadata);
    
    switch (level) {
      case 'error':
        console.error(formatted, metadata);
        break;
      case 'warn':
        console.warn(formatted, metadata);
        break;
      case 'info':
        console.info(formatted, metadata);
        break;
      case 'debug':
        console.debug(formatted, metadata);
        break;
      default:
        console.log(formatted, metadata);
    }

    // Send to backend if API URL is configured
    if (this.apiUrl && (import.meta.env.MODE === 'production' || logEntry.sendToBackend)) {
      this.sendToBackend(logEntry).catch(() => {
        // Fail silently to avoid infinite loops
      });
    }
  }

  async sendToBackend(logEntry) {
    try {
      const apiUrl = this.apiUrl || import.meta.env.VITE_API_URL || 'http://localhost:5002/api/logs';
      await fetch(`${apiUrl}/frontend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry),
      });
    } catch (error) {
      // Fail silently to avoid infinite loops
    }
  }

  error(message, metadata = {}) {
    return this.log('error', message, metadata);
  }

  warn(message, metadata = {}) {
    return this.log('warn', message, metadata);
  }

  info(message, metadata = {}) {
    return this.log('info', message, metadata);
  }

  debug(message, metadata = {}) {
    return this.log('debug', message, metadata);
  }
}

// Create logger instance
const logLevel = import.meta.env.VITE_LOG_LEVEL || 'info';
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002';
export const logger = new Logger(logLevel, apiUrl);

// Helper methods for structured logging
logger.logAPIRequest = (config) => {
  logger.info('API Request', {
    method: config.method || 'GET',
    url: config.url,
    data: config.data,
    headers: config.headers,
    timestamp: new Date().toISOString(),
  });
};

logger.logAPIResponse = (response, config) => {
  logger.info('API Response', {
    method: config?.method || 'GET',
    url: config?.url,
    status: response.status,
    statusText: response.statusText,
    data: response.data,
    timestamp: new Date().toISOString(),
  });
};

logger.logAPIError = (error, config = null) => {
  const errorInfo = {
    message: error.message,
    name: error.name,
    timestamp: new Date().toISOString(),
  };

  if (error.response) {
    errorInfo.response = {
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data,
    };
  }

  if (error.request) {
    errorInfo.request = {
      url: config?.url,
      method: config?.method,
    };
  }

  if (config) {
    errorInfo.config = {
      method: config.method,
      url: config.url,
      data: config.data,
    };
  }

  logger.error('API Error', errorInfo);
};

logger.logUserAction = (action, details = {}) => {
  logger.info('User Action', {
    action,
    ...details,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  });
};

logger.logPageView = (pageName) => {
  logger.info('Page View', {
    page: pageName,
    url: window.location.href,
    timestamp: new Date().toISOString(),
  });
};

logger.logError = (error, context = {}) => {
  const errorInfo = {
    message: error.message,
    name: error.name,
    stack: error.stack,
    ...context,
    timestamp: new Date().toISOString(),
    url: window.location.href,
  };

  logger.error('Application Error', errorInfo);
};

// Log initial load
logger.info('Frontend logger initialized', {
  environment: import.meta.env.MODE || 'development',
  timestamp: new Date().toISOString(),
});

export default logger;

