import { fetchAllARSQuotes } from '../scrapers/ars.js';
import { fetchAllBRLQuotes } from '../scrapers/brl.js';
import { saveQuote } from '../database/db.js';

class CacheService {
  constructor() {
    this.cache = {
      quotes: null,
      timestamp: null
    };
    this.cacheDuration = parseInt(process.env.CACHE_DURATION || '60') * 1000; // Convert to milliseconds
    this.currency = process.env.CURRENCY || 'ARS';
  }

  /**
   * Check if cache is still valid (less than 60 seconds old)
   */
  isCacheValid() {
    if (!this.cache.timestamp || !this.cache.quotes) {
      return false;
    }
    
    const now = Date.now();
    const age = now - this.cache.timestamp;
    
    return age < this.cacheDuration;
  }

  /**
   * Fetch fresh quotes from all sources
   */
  async fetchFreshQuotes() {
    console.log(`Fetching fresh ${this.currency} quotes...`);
    
    let quotes;
    if (this.currency === 'ARS') {
      quotes = await fetchAllARSQuotes();
    } else if (this.currency === 'BRL') {
      quotes = await fetchAllBRLQuotes();
    } else {
      throw new Error(`Unsupported currency: ${this.currency}`);
    }
    
    // Save quotes to database
    for (const quote of quotes) {
      try {
        await saveQuote(quote, this.currency);
      } catch (error) {
        console.error('Error saving quote to database:', error.message);
      }
    }
    
    // Update cache
    this.cache = {
      quotes,
      timestamp: Date.now()
    };
    
    console.log(`Cached ${quotes.length} quotes at ${new Date().toISOString()}`);
    
    return quotes;
  }

  /**
   * Get quotes (from cache if valid, otherwise fetch fresh)
   */
  async getQuotes() {
    if (this.isCacheValid()) {
      console.log('Returning cached quotes');
      return this.cache.quotes;
    }
    
    return await this.fetchFreshQuotes();
  }

  /**
   * Calculate average buy and sell prices
   */
  async getAverage() {
    const quotes = await this.getQuotes();
    
    const totalBuy = quotes.reduce((sum, quote) => sum + quote.buy_price, 0);
    const totalSell = quotes.reduce((sum, quote) => sum + quote.sell_price, 0);
    
    return {
      average_buy_price: parseFloat((totalBuy / quotes.length).toFixed(2)),
      average_sell_price: parseFloat((totalSell / quotes.length).toFixed(2)),
      currency: this.currency,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calculate slippage for each source compared to average
   */
  async getSlippage() {
    const quotes = await this.getQuotes();
    const average = await this.getAverage();
    
    return quotes.map(quote => {
      const buySlippage = ((quote.buy_price - average.average_buy_price) / average.average_buy_price);
      const sellSlippage = ((quote.sell_price - average.average_sell_price) / average.average_sell_price);
      
      return {
        buy_price_slippage: parseFloat(buySlippage.toFixed(4)),
        sell_price_slippage: parseFloat(sellSlippage.toFixed(4)),
        source: quote.source,
        buy_price: quote.buy_price,
        sell_price: quote.sell_price
      };
    });
  }

  /**
   * Force refresh cache
   */
  async refresh() {
    return await this.fetchFreshQuotes();
  }

  /**
   * Get cache info
   */
  getCacheInfo() {
    return {
      isValid: this.isCacheValid(),
      timestamp: this.cache.timestamp ? new Date(this.cache.timestamp).toISOString() : null,
      age: this.cache.timestamp ? Math.floor((Date.now() - this.cache.timestamp) / 1000) : null,
      quotesCount: this.cache.quotes ? this.cache.quotes.length : 0
    };
  }
}

// Singleton instance
const cacheService = new CacheService();

export default cacheService;
