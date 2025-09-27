// api/subgraph.js
import { GraphQLClient, gql } from 'graphql-request';

const SUBGRAPH_URL = import.meta.env.VITE_SUBGRAPH_URL || 'https://api.studio.thegraph.com/query/119916/med/version/latest';

// Advanced GraphQL client with optimizations
class OptimizedGraphQLClient {
  constructor(url, options = {}) {
    this.client = new GraphQLClient(url, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
      ...options
    });
    
    // Enhanced caching system
    this.cache = new Map();
    this.cacheTimestamps = new Map();
    this.cacheTTL = 60000; // 1 minute default
    
    // Request batching
    this.batchQueue = [];
    this.batchTimeout = null;
    this.batchDelay = 50; // 50ms delay for batching
    
    // Performance monitoring
    this.requestStats = {
      total: 0,
      successful: 0,
      failed: 0,
      cacheHits: 0,
      averageTime: 0
    };
    
    // Error tracking
    this.errorHistory = [];
    this.maxErrorHistory = 50;
    
    // Request deduplication
    this.pendingRequests = new Map();
  }
  
  // Generate cache key from query and variables
  getCacheKey(query, variables = {}) {
    const normalizedQuery = query.replace(/\s+/g, ' ').trim();
    const sortedVars = JSON.stringify(variables, Object.keys(variables).sort());
    return `${normalizedQuery}:${sortedVars}`;
  }
  
  // Check if cached data is still valid
  isCacheValid(key, customTTL) {
    const ttl = customTTL || this.cacheTTL;
    const timestamp = this.cacheTimestamps.get(key);
    return timestamp && (Date.now() - timestamp < ttl);
  }
  
  // Set cache with timestamp
  setCache(key, data, customTTL) {
    this.cache.set(key, data);
    this.cacheTimestamps.set(key, Date.now());
    
    // Cleanup old cache entries (keep last 100)
    if (this.cache.size > 100) {
      const entries = Array.from(this.cacheTimestamps.entries())
        .sort(([,a], [,b]) => a - b)
        .slice(0, this.cache.size - 100);
      
      entries.forEach(([key]) => {
        this.cache.delete(key);
        this.cacheTimestamps.delete(key);
      });
    }
  }
  
  // Request with enhanced error handling and caching
  async request(query, variables = {}, options = {}) {
    const startTime = Date.now();
    const cacheKey = this.getCacheKey(query, variables);
    const { cacheTTL, skipCache = false, retries = 3 } = options;
    
    try {
      // Check cache first
      if (!skipCache && this.isCacheValid(cacheKey, cacheTTL)) {
        this.requestStats.cacheHits++;
        console.log('📋 Cache hit for query:', query.match(/query\s+(\w+)/)?.[1] || 'Unknown');
        return this.cache.get(cacheKey);
      }
      
      // Check for pending identical requests (deduplication)
      if (this.pendingRequests.has(cacheKey)) {
        console.log('🔄 Deduplicating request for:', query.match(/query\s+(\w+)/)?.[1] || 'Unknown');
        return await this.pendingRequests.get(cacheKey);
      }
      
      // Create request promise
      const requestPromise = this.retryRequest(
        () => this.client.request(query, variables), 
        retries
      );
      
      // Store pending request for deduplication
      this.pendingRequests.set(cacheKey, requestPromise);
      
      const result = await requestPromise;
      
      // Remove from pending requests
      this.pendingRequests.delete(cacheKey);
      
      // Cache the result
      if (!skipCache) {
        this.setCache(cacheKey, result, cacheTTL);
      }
      
      // Update stats
      this.requestStats.successful++;
      this.requestStats.total++;
      
      const duration = Date.now() - startTime;
      this.requestStats.averageTime = 
        (this.requestStats.averageTime * (this.requestStats.total - 1) + duration) / this.requestStats.total;
      
      console.log(`✅ Query completed in ${duration}ms:`, query.match(/query\s+(\w+)/)?.[1] || 'Unknown');
      
      return result;
      
    } catch (error) {
      // Remove from pending requests on error
      this.pendingRequests.delete(cacheKey);
      
      // Track error
      this.requestStats.failed++;
      this.requestStats.total++;
      
      // Store error in history
      this.errorHistory.push({
        query: query.match(/query\s+(\w+)/)?.[1] || 'Unknown',
        variables,
        error: error.message,
        timestamp: Date.now()
      });
      
      if (this.errorHistory.length > this.maxErrorHistory) {
        this.errorHistory.shift();
      }
      
      console.error('❌ GraphQL query failed:', error);
      throw this.enhanceError(error, query, variables);
    }
  }
  
  // Enhanced error with context
  enhanceError(error, query, variables) {
    const queryName = query.match(/query\s+(\w+)/)?.[1] || 'Unknown';
    
    const enhancedError = new Error(`GraphQL Error in ${queryName}: ${error.message}`);
    enhancedError.originalError = error;
    enhancedError.query = queryName;
    enhancedError.variables = variables;
    enhancedError.timestamp = Date.now();
    
    // Add user-friendly messages
    if (error.message.includes('timeout')) {
      enhancedError.userMessage = 'The request timed out. Please check your connection and try again.';
    } else if (error.message.includes('network')) {
      enhancedError.userMessage = 'Network error. Please check your internet connection.';
    } else if (error.message.includes('subgraph')) {
      enhancedError.userMessage = 'The data service is currently unavailable. Please try again later.';
    } else {
      enhancedError.userMessage = 'An unexpected error occurred while fetching data.';
    }
    
    return enhancedError;
  }
  
  // Retry mechanism with exponential backoff
  async retryRequest(fn, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          break;
        }
        
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Cap at 10s
        console.log(`🔄 Retry attempt ${attempt}/${maxRetries} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }
  
  // Clear cache
  clearCache(pattern) {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const [key] of this.cache) {
        if (regex.test(key)) {
          this.cache.delete(key);
          this.cacheTimestamps.delete(key);
        }
      }
    } else {
      this.cache.clear();
      this.cacheTimestamps.clear();
    }
    console.log('🧹 Cache cleared:', pattern || 'all');
  }
  
  // Get performance statistics
  getStats() {
    const cacheSize = this.cache.size;
    const successRate = this.requestStats.total > 0 
      ? (this.requestStats.successful / this.requestStats.total * 100).toFixed(1)
      : 0;
    
    return {
      ...this.requestStats,
      successRate: `${successRate}%`,
      cacheSize,
      cacheHitRate: this.requestStats.total > 0 
        ? `${(this.requestStats.cacheHits / this.requestStats.total * 100).toFixed(1)}%`
        : '0%',
      recentErrors: this.errorHistory.slice(-5)
    };
  }
  
  // Health check
  async healthCheck() {
    try {
      const query = `
        query HealthCheck {
          _meta {
            block {
              number
              timestamp
            }
          }
        }
      `;
      
      const result = await this.request(query, {}, { skipCache: true, retries: 1 });
      return {
        healthy: true,
        blockNumber: result._meta?.block?.number,
        timestamp: result._meta?.block?.timestamp,
        latency: Date.now() - Date.now()
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }
}

// Create optimized client instance
export const graphqlClient = new OptimizedGraphQLClient(SUBGRAPH_URL);

// Legacy compatibility function
export async function querySubgraph(query, variables = {}, options = {}) {
  return await graphqlClient.request(query, variables, options);
}

// Export gql and client methods
export { gql };
export const { clearCache, getStats, healthCheck } = graphqlClient;

// Import and re-export all queries
import subgraphQueries from './subgraphQueries.js';
export const QUERIES = subgraphQueries;