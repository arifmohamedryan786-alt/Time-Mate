/**
 * TIME-MATE - Backend Application Server
 * 
 * Express REST API server providing authentication, task management,
 * daily scheduling, focus session tracking, distraction self-reports,
 * and user settings for the Time-Mate hostel student productivity platform.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import { initDb } from './db/database.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// ==========================================
// 1. CORE MIDDLEWARE PIPELINE
// ==========================================

// Enable Cross-Origin Resource Sharing (CORS) for frontend client
app.use(cors({
  origin: '*',
  credentials: true
}));

// Parse incoming requests with JSON payloads (max 10MB limit)
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded application/x-www-form-urlencoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging for development & debugging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    // Log non-healthcheck requests with status code and duration
    if (!req.originalUrl.includes('/health')) {
      console.log(`[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// ==========================================
// 2. HEALTH CHECK & ROOT PROBE
// ==========================================

/**
 * Health check endpoint for automated uptime monitors and container orchestration.
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Time-Mate API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 3. API ROUTE MOUNTING
// ==========================================

// Mount all modular application routes under the /api prefix
app.use('/api', apiRoutes);

// ==========================================
// 4. ERROR BOUNDARIES & ERROR HANDLING
// ==========================================

// Catch 404 routes that don't match any registered handlers
app.use(notFoundHandler);

// Global centralized error handling middleware
app.use(errorHandler);

// ==========================================
// 5. DATABASE INITIALIZATION & SERVER STARTUP
// ==========================================

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 TIME MATE API Server running on port ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🛠  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`====================================================`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to initialize database on startup:', err);
    process.exit(1);
  });

export default app;
