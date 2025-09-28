// api/hypergraph.js
import { GraphQLClient, gql } from 'graphql-request';

const HYPERGRAPH_URL = import.meta.env.VITE_HYPERGRAPH_URL || 'https://api-testnet.geobrowser.io/graphql';

// Hypergraph GraphQL client for GeoBrowser API with GeoConnect authentication
class HypergraphClient {
  constructor(url, options = {}) {
    this.url = url;
    this.baseHeaders = {
      'Content-Type': 'application/json',
    };
    
    // Create client without headers initially - we'll set them per request
    this.client = new GraphQLClient(url, {
      timeout: 15000,
      ...options
    });
    
    this.geoConnectContext = null; // Will be set by the provider
    
    // Enhanced caching system
    this.cache = new Map();
    this.cacheTimestamps = new Map();
    this.cacheTTL = 60000; // 1 minute default
    
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
  
  // Set GeoConnect context for authentication
  setGeoConnectContext(context) {
    this.geoConnectContext = context;
  }

  // Get authenticated headers
  async getAuthenticatedHeaders() {
    if (!this.geoConnectContext) {
      throw new Error('GeoConnect context not set. Please wrap your app with GeoConnectProvider.');
    }

    try {
      const authHeaders = await this.geoConnectContext.getAuthHeaders();
      return {
        ...this.baseHeaders,
        ...authHeaders
      };
    } catch (error) {
      console.error('Failed to get auth headers:', error);
      throw new Error('Authentication required. Please connect your wallet and authenticate.');
    }
  }

  // Request with enhanced error handling, authentication, and caching
  async request(query, variables = {}, options = {}) {
    const startTime = Date.now();
    const cacheKey = this.getCacheKey(query, variables);
    const { cacheTTL, skipCache = false, retries = 3 } = options;
    
    try {
      // Check cache first
      if (!skipCache && this.isCacheValid(cacheKey, cacheTTL)) {
        this.requestStats.cacheHits++;
        console.log('📋 Hypergraph cache hit for query:', query.match(/query\s+(\w+)/)?.[1] || 'Unknown');
        return this.cache.get(cacheKey);
      }
      
      // Get authenticated headers
      const headers = await this.getAuthenticatedHeaders();
      
      // Create a new client instance with auth headers for this request
      const authenticatedClient = new GraphQLClient(this.url, {
        timeout: 15000,
        headers
      });
      
      const result = await this.retryRequest(
        () => authenticatedClient.request(query, variables), 
        retries
      );
      
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
      
      console.log(`✅ Hypergraph query completed in ${duration}ms:`, query.match(/query\s+(\w+)/)?.[1] || 'Unknown');
      
      return result;
      
    } catch (error) {
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
      
      console.error('❌ Hypergraph query failed:', error);
      throw this.enhanceError(error, query, variables);
    }
  }
  
  // Enhanced error with context
  enhanceError(error, query, variables) {
    const queryName = query.match(/query\s+(\w+)/)?.[1] || 'Unknown';
    
    const enhancedError = new Error(`Hypergraph Error in ${queryName}: ${error.message}`);
    enhancedError.originalError = error;
    enhancedError.query = queryName;
    enhancedError.variables = variables;
    enhancedError.timestamp = Date.now();
    
    // Add user-friendly messages
    if (error.message.includes('timeout')) {
      enhancedError.userMessage = 'The request timed out. Please check your connection and try again.';
    } else if (error.message.includes('network')) {
      enhancedError.userMessage = 'Network error. Please check your internet connection.';
    } else if (error.message.includes('space')) {
      enhancedError.userMessage = 'The Hypergraph space is currently unavailable. Please try again later.';
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
        console.log(`🔄 Hypergraph retry attempt ${attempt}/${maxRetries} in ${delay}ms...`);
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
    console.log('🧹 Hypergraph cache cleared:', pattern || 'all');
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
      if (!this.geoConnectContext) {
        return {
          healthy: false,
          error: 'GeoConnect context not available'
        };
      }

      const spaceId = this.geoConnectContext.currentSpaceInfo.id;
      const query = `
        query HealthCheck($id: ID!) {
          space(id: $id) {
            id
            name
            description
          }
        }
      `;
      
      const result = await this.request(query, { id: spaceId }, { skipCache: true, retries: 1 });
      return {
        healthy: true,
        space: result.space,
        currentSpace: this.geoConnectContext.currentSpaceInfo
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        currentSpace: this.geoConnectContext?.currentSpaceInfo || null
      };
    }
  }
  
  // Get current space information
  async getSpaceInfo() {
    if (!this.geoConnectContext) {
      throw new Error('GeoConnect context not available');
    }

    const spaceId = this.geoConnectContext.currentSpaceInfo.id;
    const query = `
      query GetSpaceInfo($id: ID!) {
        space(id: $id) {
          id
          name
          description
          owner {
            id
            address
          }
        }
      }
    `;
    
    return await this.request(query, { id: spaceId });
  }
}

// Create optimized client instance
export const hypergraphClient = new HypergraphClient(HYPERGRAPH_URL);

// Legacy compatibility function
export async function queryHypergraph(query, variables = {}, options = {}) {
  return await hypergraphClient.request(query, variables, options);
}

// Export gql and client methods
export { gql };
export const { clearCache, getStats, healthCheck, getSpaceInfo } = hypergraphClient;