// hooks/useHypergraph.js
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { hypergraphClient } from '../api/hypergraph.js';
import QUERIES from '../api/hypergraphQueries.js';
import { useGeoConnect } from '../contexts/GeoConnectContext.jsx';

// Hook options interface
const DEFAULT_OPTIONS = {
  pollInterval: 0, // No polling by default
  fetchPolicy: 'cache-first', // cache-first, cache-and-network, network-only
  errorPolicy: 'none', // none, ignore, all
  retryAttempts: 3,
  enabled: true,
  onError: null,
  onCompleted: null
};

// Base hook for Hypergraph queries
function useHypergraphQuery(query, variables = {}, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const geoConnect = useGeoConnect();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(opts.enabled && geoConnect.isAuthenticated);
  const [error, setError] = useState(null);
  const [networkStatus, setNetworkStatus] = useState('idle'); // idle, loading, error, ready
  
  const abortControllerRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const requestIdRef = useRef(0);
  
  // Set GeoConnect context in client when it changes
  useEffect(() => {
    hypergraphClient.setGeoConnectContext(geoConnect);
  }, [geoConnect]);
  
  // Memoize variables to prevent unnecessary re-renders
  const memoizedVariables = useMemo(() => ({
    spaceId: geoConnect.currentSpaceInfo?.id,
    ...variables
  }), [JSON.stringify(variables), geoConnect.currentSpaceInfo?.id]);
  
  const executeQuery = useCallback(async (skipCache = false) => {
    if (!opts.enabled || !geoConnect.isAuthenticated) {
      if (!geoConnect.isAuthenticated) {
        setError(new Error('Not authenticated with GeoBrowser. Please connect your wallet.'));
        setLoading(false);
        setNetworkStatus('error');
      }
      return;
    }
    
    const currentRequestId = ++requestIdRef.current;
    
    try {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      setLoading(true);
      setNetworkStatus('loading');
      setError(null);
      
      const cachePolicy = opts.fetchPolicy === 'network-only' || skipCache ? { skipCache: true } : {};
      const result = await hypergraphClient.request(query, memoizedVariables, {
        ...cachePolicy,
        retries: opts.retryAttempts
      });
      
      // Check if this is still the current request
      if (currentRequestId === requestIdRef.current) {
        setData(result);
        setLoading(false);
        setNetworkStatus('ready');
        opts.onCompleted?.(result);
      }
      
    } catch (err) {
      if (currentRequestId === requestIdRef.current && err.name !== 'AbortError') {
        setError(err);
        setLoading(false);
        setNetworkStatus('error');
        
        if (opts.errorPolicy !== 'ignore') {
          opts.onError?.(err);
        }
      }
    }
  }, [query, memoizedVariables, opts.enabled, opts.fetchPolicy, opts.retryAttempts]);
  
  // Refetch function
  const refetch = useCallback((newVariables) => {
    if (newVariables) {
      return executeQuery(true);
    }
    return executeQuery(true);
  }, [executeQuery]);
  
  // Start polling
  const startPolling = useCallback((interval) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    
    if (interval > 0) {
      pollIntervalRef.current = setInterval(() => {
        executeQuery(false);
      }, interval);
    }
  }, [executeQuery]);
  
  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);
  
  // Initial fetch and polling setup
  useEffect(() => {
    executeQuery(false);
    
    if (opts.pollInterval > 0) {
      startPolling(opts.pollInterval);
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      stopPolling();
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [executeQuery, opts.pollInterval, startPolling, stopPolling]);
  
  return {
    data,
    loading,
    error,
    networkStatus,
    refetch,
    startPolling,
    stopPolling
  };
}

// Utility function to parse entity data
function parseEntityData(entity) {
  if (!entity || !entity.data) return null;
  
  try {
    return {
      id: entity.id,
      type: entity.type,
      ...JSON.parse(entity.data),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  } catch (error) {
    console.error('Failed to parse entity data:', error);
    return {
      id: entity.id,
      type: entity.type,
      rawData: entity.data,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }
}

// ===============================
// MANUFACTURER HOOKS
// ===============================

export function useHypergraphManufacturers(options = {}) {
  const variables = {
    first: options.limit || 100,
    skip: options.skip || 0
  };
  
  const { data, loading, error, ...rest } = useHypergraphQuery(
    QUERIES.GET_ALL_MANUFACTURERS_HG, 
    variables, 
    options
  );
  
  const parsedData = useMemo(() => {
    if (!data?.space?.entities) return null;
    
    return {
      space: data.space,
      manufacturers: data.space.entities.map(parseEntityData).filter(Boolean)
    };
  }, [data]);
  
  return {
    data: parsedData,
    loading,
    error,
    ...rest
  };
}

export function useHypergraphManufacturer(id, options = {}) {
  const { data, loading, error, ...rest } = useHypergraphQuery(
    QUERIES.GET_MANUFACTURER_BY_ID_HG, 
    { entityId: id }, 
    { ...options, enabled: !!id && options.enabled !== false }
  );
  
  const parsedData = useMemo(() => {
    if (!data?.space?.entity) return null;
    
    return {
      space: data.space,
      manufacturer: parseEntityData(data.space.entity)
    };
  }, [data]);
  
  return {
    data: parsedData,
    loading,
    error,
    ...rest
  };
}

export function useHypergraphVerifiedManufacturers(options = {}) {
  const variables = {
    first: options.limit || 100,
    skip: options.skip || 0
  };
  
  const { data, loading, error, ...rest } = useHypergraphQuery(
    QUERIES.GET_VERIFIED_MANUFACTURERS_HG, 
    variables, 
    options
  );
  
  const parsedData = useMemo(() => {
    if (!data?.space?.entities) return null;
    
    return {
      space: data.space,
      manufacturers: data.space.entities.map(parseEntityData).filter(Boolean)
    };
  }, [data]);
  
  return {
    data: parsedData,
    loading,
    error,
    ...rest
  };
}

// ===============================
// BATCH HOOKS
// ===============================

export function useHypergraphBatches(options = {}) {
  const variables = {
    first: options.limit || 100,
    skip: options.skip || 0
  };
  
  const { data, loading, error, ...rest } = useHypergraphQuery(
    QUERIES.GET_ALL_BATCHES_HG, 
    variables, 
    options
  );
  
  const parsedData = useMemo(() => {
    if (!data?.space?.entities) return null;
    
    return {
      space: data.space,
      batches: data.space.entities.map(parseEntityData).filter(Boolean)
    };
  }, [data]);
  
  return {
    data: parsedData,
    loading,
    error,
    ...rest
  };
}

export function useHypergraphBatch(id, options = {}) {
  const { data, loading, error, ...rest } = useHypergraphQuery(
    QUERIES.GET_BATCH_BY_ID_HG, 
    { entityId: id }, 
    { ...options, enabled: !!id && options.enabled !== false }
  );
  
  const parsedData = useMemo(() => {
    if (!data?.space?.entity) return null;
    
    return {
      space: data.space,
      batch: parseEntityData(data.space.entity)
    };
  }, [data]);
  
  return {
    data: parsedData,
    loading,
    error,
    ...rest
  };
}

export function useHypergraphManufacturerBatches(manufacturerId, options = {}) {
  const variables = {
    manufacturer: manufacturerId,
    first: options.limit || 100
  };
  
  const { data, loading, error, ...rest } = useHypergraphQuery(
    QUERIES.GET_BATCHES_BY_MANUFACTURER_HG, 
    variables, 
    { ...options, enabled: !!manufacturerId && options.enabled !== false }
  );
  
  const parsedData = useMemo(() => {
    if (!data?.space?.entities) return null;
    
    return {
      space: data.space,
      batches: data.space.entities.map(parseEntityData).filter(Boolean)
    };
  }, [data]);
  
  return {
    data: parsedData,
    loading,
    error,
    ...rest
  };
}

// ===============================
// DASHBOARD HOOKS
// ===============================

export function useHypergraphDashboardStats(options = {}) {
  const { data, loading, error, ...rest } = useHypergraphQuery(
    QUERIES.GET_DASHBOARD_STATS_HG, 
    {}, 
    options
  );
  
  const parsedData = useMemo(() => {
    if (!data?.space) return null;
    
    const manufacturers = data.space.manufacturers?.map(parseEntityData).filter(Boolean) || [];
    const batches = data.space.batches?.map(parseEntityData).filter(Boolean) || [];
    
    // Calculate statistics
    const verifiedManufacturers = manufacturers.filter(m => m.isVerified);
    const activeBatches = batches.filter(b => b.isActive);
    const expiredBatches = batches.filter(b => {
      const now = Math.floor(Date.now() / 1000);
      return b.expiryDate && b.expiryDate < now;
    });
    
    return {
      space: data.space,
      stats: {
        totalManufacturers: manufacturers.length,
        verifiedManufacturers: verifiedManufacturers.length,
        totalBatches: batches.length,
        activeBatches: activeBatches.length,
        expiredBatches: expiredBatches.length,
      },
      manufacturers,
      batches
    };
  }, [data]);
  
  return {
    data: parsedData,
    loading,
    error,
    ...rest
  };
}

export function useHypergraphSpaceOverview(options = {}) {
  return useHypergraphQuery(QUERIES.GET_SPACE_OVERVIEW_HG, {}, options);
}

// ===============================
// SEARCH HOOKS
// ===============================

export function useHypergraphSearch(searchTerm, options = {}) {
  const variables = {
    searchTerm,
    first: options.limit || 20
  };
  
  const { data, loading, error, ...rest } = useHypergraphQuery(
    QUERIES.GLOBAL_SEARCH_HG, 
    variables, 
    { ...options, enabled: !!searchTerm && searchTerm.length >= 2 && options.enabled !== false }
  );
  
  const parsedData = useMemo(() => {
    if (!data?.space) return null;
    
    return {
      space: data.space,
      manufacturers: data.space.manufacturers?.map(parseEntityData).filter(Boolean) || [],
      batches: data.space.batches?.map(parseEntityData).filter(Boolean) || []
    };
  }, [data]);
  
  return {
    data: parsedData,
    loading,
    error,
    ...rest
  };
}

// ===============================
// UTILITY HOOKS
// ===============================

// Hook for cache management
export function useHypergraphCache() {
  const clearCache = useCallback((pattern) => {
    hypergraphClient.clearCache(pattern);
  }, []);
  
  const getStats = useCallback(() => {
    return hypergraphClient.getStats();
  }, []);
  
  const healthCheck = useCallback(async () => {
    return await hypergraphClient.healthCheck();
  }, []);
  
  return {
    clearCache,
    getStats,
    healthCheck
  };
}