import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import apiRoutes from './routes/api.js';
import { initDatabase } from './database/db.js';
import cacheService from './services/cache.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Currency Exchange Rate API',
    version: '1.0.0',
    currency: process.env.CURRENCY || 'ARS',
    endpoints: {
      quotes: '/quotes',
      average: '/average',
      slippage: '/slippage',
      health: '/health',
      refresh: '/refresh (POST)'
    },
    documentation: 'See README.md for full API documentation'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: ['/quotes', '/average', '/slippage', '/health', '/refresh']
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('Initializing database...');
    await initDatabase();
    console.log('Database initialized successfully!');
    
    // Pre-populate cache
    console.log('Pre-populating cache...');
    await cacheService.refresh();
    console.log('Cache pre-populated!');
    
    // Schedule automatic cache refresh every 60 seconds
    cron.schedule('*/60 * * * * *', async () => {
      console.log('Auto-refreshing cache (scheduled)...');
      try {
        await cacheService.refresh();
      } catch (error) {
        console.error('Error in scheduled refresh:', error.message);
      }
    });
    
    // Start server
    app.listen(PORT, () => {
      console.log('');
      console.log('='.repeat(50));
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Currency: ${process.env.CURRENCY || 'ARS'}`);
      console.log(`🔄 Cache duration: ${process.env.CACHE_DURATION || 60}s`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log('='.repeat(50));
      console.log('');
      console.log('Available endpoints:');
      console.log(`  GET  http://localhost:${PORT}/quotes`);
      console.log(`  GET  http://localhost:${PORT}/average`);
      console.log(`  GET  http://localhost:${PORT}/slippage`);
      console.log(`  GET  http://localhost:${PORT}/health`);
      console.log(`  POST http://localhost:${PORT}/refresh`);
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();
