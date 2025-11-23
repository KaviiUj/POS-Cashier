# POS Cashier - MERN Application

A Point of Sale (POS) Cashier application built with MongoDB, Express, React, and Node.js.

## Project Structure

```
POS-Cashier/
├── backend/              # Express.js backend
│   ├── config/           # Configuration files
│   │   └── database.js   # MongoDB connection
│   ├── middleware/       # Custom middleware
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions and logger
│   │   └── logger.js     # Winston logger configuration
│   ├── logs/             # Log files (auto-created)
│   ├── server.js         # Entry point
│   └── package.json
├── frontend/             # React frontend with Vite
│   └── src/
│       ├── components/   # React components
│       ├── context/      # React context
│       ├── hooks/        # Custom hooks
│       ├── services/     # API services
│       ├── utils/        # Utility functions and logger
│       │   └── logger.js # Browser-compatible logger
│       ├── App.jsx       # Main App component
│       ├── main.jsx      # Entry point
│       └── index.css     # Tailwind CSS imports
└── package.json          # Root package.json with dev scripts
```

## Setup Instructions

1. **Install all dependencies** (root, backend, and frontend):
   ```bash
   npm run install:all
   ```

2. **Set up environment variables**:
   
   **Backend** - Create `.env` file in `backend/` directory:
   ```
   
   **Frontend** - Create `.env` file in `frontend/` directory:
   ```
   VITE_API_URL=http://localhost:5002
   VITE_LOG_LEVEL=info
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

   This will start both:
   - Backend server on **port 5002** (http://localhost:5002)
   - Frontend development server on **port 4000** (http://localhost:4000)

## Available Scripts

- `npm run dev` - Start both backend and frontend concurrently
- `npm run dev:backend` - Start only backend server
- `npm run dev:frontend` - Start only frontend server
- `npm run install:all` - Install dependencies for root, backend, and frontend

## Features

### Comprehensive Logging System

**Backend (Winston Logger)**:
- Logs to files in `backend/logs/` directory:
  - `combined.log` - All logs
  - `error.log` - Error logs only
  - `info.log` - Info logs only
  - `warn.log` - Warning logs only
  - `exceptions.log` - Uncaught exceptions
  - `rejections.log` - Unhandled promise rejections
- Console output in development mode
- Automatic request/response logging for all API calls
- Detailed error logging with stack traces
- MongoDB connection event logging

**Frontend (Custom Browser Logger)**:
- Browser console logging with formatted output
- Can send logs to backend API for storage
- Helper methods for:
  - API request/response logging
  - API error logging
  - User action logging
  - Page view tracking
  - Application error logging

### MongoDB Connection
- Configured with connection pooling
- Automatic reconnection handling
- Connection event logging
- Error handling with detailed logging

### Tailwind CSS
- Utility-first CSS framework
- Fully configured and ready to use
- Custom configuration in `tailwind.config.js`

## Ports

- **Backend**: 5002
- **Frontend**: 4000

## Environment Variables

### Backend (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5002 |
| `MONGODB_URI` | MongoDB connection string | - |
| `SECRET_KEY` | Secret key for JWT/encryption | - |
| `NODE_ENV` | Environment (development/production) | development |
| `LOG_LEVEL` | Log level (error/warn/info/debug) | info |

### Frontend (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | http://localhost:5002 |
| `VITE_LOG_LEVEL` | Log level (error/warn/info/debug) | info |

## Logger Usage Examples

### Backend Logger
```javascript
import { logger } from './utils/logger.js';

// Basic logging
logger.info('Server started', { port: 5002 });
logger.warn('Warning message');
logger.error('Error occurred', { error: error.message });

// Structured logging
logger.logRequest(req);
logger.logResponse(req, res, data);
logger.logError(error, req);
```

### Frontend Logger
```javascript
import { logger } from './utils/logger.js';

// Basic logging
logger.info('App mounted');
logger.warn('Warning message');
logger.error('Error occurred');

// API logging
logger.logAPIRequest({ method: 'GET', url: '/api/users' });
logger.logAPIResponse(response, config);
logger.logAPIError(error, config);

// User actions
logger.logUserAction('button_click', { buttonId: 'submit' });
logger.logPageView('Dashboard');
logger.logError(error, { context: 'UserComponent' });
```

## Next Steps

- Add API routes in `backend/routes/`
- Create MongoDB models in `backend/models/`
- Build React components in `frontend/src/components/`
- Create API services in `frontend/src/services/`
- Add custom middleware in `backend/middleware/`

