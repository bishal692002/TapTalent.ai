import express from 'express';
import cacheService from '../services/cache.js';

const router = express.Router();

/**
 * GET /quotes
 * Returns an array of USD quotes from all sources
 */
router.get('/quotes', async (req, res) => {
  try {
    const quotes = await cacheService.getQuotes();
    
    res.json({
      success: true,
      currency: process.env.CURRENCY || 'ARS',
      count: quotes.length,
      data: quotes,
      cache: cacheService.getCacheInfo()
    });
  } catch (error) {
    console.error('Error in /quotes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quotes',
      message: error.message
    });
  }
});

/**
 * GET /average
 * Returns the average buy and sell prices from all sources
 */
router.get('/average', async (req, res) => {
  try {
    const average = await cacheService.getAverage();
    
    res.json({
      success: true,
      data: average,
      cache: cacheService.getCacheInfo()
    });
  } catch (error) {
    console.error('Error in /average:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate average',
      message: error.message
    });
  }
});

/**
 * GET /slippage
 * Returns slippage percentage for each source compared to average
 */
router.get('/slippage', async (req, res) => {
  try {
    const slippage = await cacheService.getSlippage();
    
    res.json({
      success: true,
      currency: process.env.CURRENCY || 'ARS',
      count: slippage.length,
      data: slippage,
      cache: cacheService.getCacheInfo()
    });
  } catch (error) {
    console.error('Error in /slippage:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate slippage',
      message: error.message
    });
  }
});

/**
 * POST /refresh
 * Force refresh the cache
 */
router.post('/refresh', async (req, res) => {
  try {
    const quotes = await cacheService.refresh();
    
    res.json({
      success: true,
      message: 'Cache refreshed successfully',
      data: quotes,
      cache: cacheService.getCacheInfo()
    });
  } catch (error) {
    console.error('Error in /refresh:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh cache',
      message: error.message
    });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    currency: process.env.CURRENCY || 'ARS',
    cache: cacheService.getCacheInfo()
  });
});

export default router;
