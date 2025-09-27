// hooks/useSubgraph.js
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { graphqlClient } from '../api/subgraph.js';
import QUERIES from '../api/subgraphQueries.js';

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

// Base hook for GraphQL queries
function useQuery(query, variables = {}, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(opts.enabled);
  const [error, setError] = useState(null);
  const [networkStatus, setNetworkStatus] = useState('idle'); // idle, loading, error, ready
  
  const abortControllerRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const requestIdRef = useRef(0);
  
  // Memoize variables to prevent unnecessary re-renders
  const memoizedVariables = useMemo(() => variables, [JSON.stringify(variables)]);
  
  const executeQuery = useCallback(async (skipCache = false) => {
    if (!opts.enabled) return;
    
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
      const result = await graphqlClient.request(query, memoizedVariables, {
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

// ===============================
// MANUFACTURER HOOKS
// ===============================

export function useManufacturers(options = {}) {
  const variables = {
    first: options.limit || 100,
    skip: options.skip || 0,
    orderBy: options.orderBy || 'registeredAt',
    orderDirection: options.orderDirection || 'desc'
  };
  
  return useQuery(QUERIES.GET_ALL_MANUFACTURERS, variables, options);
}

export function useManufacturer(id, options = {}) {
  return useQuery(QUERIES.GET_MANUFACTURER_BY_ID, { id }, { ...options, enabled: !!id });
}

export function useVerifiedManufacturers(options = {}) {
  const variables = {
    first: options.limit || 100,
    skip: options.skip || 0
  };
  
  return useQuery(QUERIES.GET_VERIFIED_MANUFACTURERS, variables, options);
}

export function useSearchManufacturers(searchTerm, options = {}) {
  const variables = {
    searchTerm,
    first: options.limit || 20
  };
  
  return useQuery(QUERIES.SEARCH_MANUFACTURERS, variables, { 
    ...options, 
    enabled: !!searchTerm && searchTerm.length >= 2 
  });
}

// ===============================
// BATCH HOOKS
// ===============================

export function useBatches(options = {}) {
  const variables = {
    first: options.limit || 100,
    skip: options.skip || 0,
    orderBy: options.orderBy || 'createdAt',
    orderDirection: options.orderDirection || 'desc'
  };
  
  return useQuery(QUERIES.GET_ALL_BATCHES, variables, options);
}

export function useBatch(id, options = {}) {
  return useQuery(QUERIES.GET_BATCH_BY_ID, { id }, { ...options, enabled: !!id });
}

export function useBatchByBatchId(batchId, options = {}) {
  return useQuery(QUERIES.GET_BATCH_BY_BATCH_ID, { batchId }, { 
    ...options, 
    enabled: !!batchId 
  });
}

export function useExpiredBatches(options = {}) {
  const variables = {
    currentTimestamp: Math.floor(Date.now() / 1000).toString(),
    first: options.limit || 100
  };
  
  return useQuery(QUERIES.GET_EXPIRED_BATCHES, variables, options);
}

export function useRecalledBatches(options = {}) {
  const variables = {
    first: options.limit || 100,
    skip: options.skip || 0
  };
  
  return useQuery(QUERIES.GET_RECALLED_BATCHES, variables, options);
}

export function useManufacturerBatches(manufacturerId, options = {}) {
  const variables = {
    manufacturerId,
    first: options.limit || 100,
    skip: options.skip || 0
  };
  
  return useQuery(QUERIES.GET_MANUFACTURER_BATCHES, variables, { 
    ...options, 
    enabled: !!manufacturerId 
  });
}

// ===============================
// VERIFICATION HOOKS
// ===============================

export function useBatchVerifications(batchId, options = {}) {
  const variables = {
    batchId,
    first: options.limit || 100
  };
  
  return useQuery(QUERIES.GET_BATCH_VERIFICATIONS, variables, { 
    ...options, 
    enabled: !!batchId 
  });
}

export function useRecentVerifications(options = {}) {
  const variables = {
    first: options.limit || 50
  };
  
  return useQuery(QUERIES.GET_RECENT_VERIFICATIONS, variables, options);
}

export function useUserVerifications(verifier, options = {}) {
  const variables = {
    verifier,
    first: options.limit || 100
  };
  
  return useQuery(QUERIES.GET_USER_VERIFICATIONS, variables, { 
    ...options, 
    enabled: !!verifier 
  });
}

// ===============================
// RECALL HOOKS
// ===============================

export function useBatchRecalls(options = {}) {
  const variables = {
    first: options.limit || 100
  };
  
  return useQuery(QUERIES.GET_BATCH_RECALLS, variables, options);
}

export function useManufacturerRecalls(manufacturerId, options = {}) {
  const variables = {
    manufacturerId,
    first: options.limit || 100
  };
  
  return useQuery(QUERIES.GET_MANUFACTURER_RECALLS, variables, { 
    ...options, 
    enabled: !!manufacturerId 
  });
}

// ===============================
// FAKE DETECTION HOOKS
// ===============================

export function useFakeBatchDetections(options = {}) {
  const variables = {
    first: options.limit || 100
  };
  
  return useQuery(QUERIES.GET_FAKE_BATCH_DETECTIONS, variables, options);
}

export function useBatchDetections(batchId, options = {}) {
  const variables = {
    batchId,
    first: options.limit || 100
  };
  
  return useQuery(QUERIES.GET_BATCH_DETECTIONS, variables, { 
    ...options, 
    enabled: !!batchId 
  });
}

// ===============================
// KYC DOCUMENT HOOKS
// ===============================

export function useManufacturerKYCDocuments(manufacturerId, options = {}) {
  return useQuery(QUERIES.GET_MANUFACTURER_KYC_DOCUMENTS, { manufacturerId }, { 
    ...options, 
    enabled: !!manufacturerId 
  });
}

export function usePendingKYCDocuments(options = {}) {
  const variables = {
    first: options.limit || 100
  };
  
  return useQuery(QUERIES.GET_PENDING_KYC_DOCUMENTS, variables, options);
}

export function useVerifiedKYCDocuments(options = {}) {
  const variables = {
    first: options.limit || 100
  };
  
  return useQuery(QUERIES.GET_VERIFIED_KYC_DOCUMENTS, variables, options);
}

// ===============================
// ENS REGISTRATION HOOKS
// ===============================

export function useENSRegistrations(options = {}) {
  const variables = {
    first: options.limit || 100
  };
  
  return useQuery(QUERIES.GET_ENS_REGISTRATIONS, variables, options);
}

export function useManufacturerENSRegistrations(manufacturerId, options = {}) {
  return useQuery(QUERIES.GET_MANUFACTURER_ENS_REGISTRATIONS, { manufacturerId }, { 
    ...options, 
    enabled: !!manufacturerId 
  });
}

// ===============================
// ANALYTICS HOOKS
// ===============================

export function useDashboardStats(options = {}) {
  return useQuery(QUERIES.GET_DASHBOARD_STATS, {}, options);
}

export function useManufacturerAnalytics(manufacturerId, options = {}) {
  return useQuery(QUERIES.GET_MANUFACTURER_ANALYTICS, { manufacturerId }, { 
    ...options, 
    enabled: !!manufacturerId 
  });
}

// ===============================
// SEARCH HOOKS
// ===============================

export function useGlobalSearch(searchTerm, options = {}) {
  const variables = {
    searchTerm,
    first: options.limit || 20
  };
  
  return useQuery(QUERIES.GLOBAL_SEARCH, variables, { 
    ...options, 
    enabled: !!searchTerm && searchTerm.length >= 2 
  });
}

// ===============================
// UTILITY HOOKS
// ===============================

// Hook for pagination
export function usePagination(initialPage = 0, pageSize = 20) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  const variables = {
    first: pageSize,
    skip: currentPage * pageSize
  };
  
  const goToPage = useCallback((page) => {
    setCurrentPage(Math.max(0, page));
  }, []);
  
  const nextPage = useCallback(() => {
    setCurrentPage(prev => prev + 1);
  }, []);
  
  const previousPage = useCallback(() => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  }, []);
  
  return {
    currentPage,
    pageSize,
    variables,
    goToPage,
    nextPage,
    previousPage
  };
}

// Hook for real-time updates (polling-based)
export function useRealTimeUpdates(queryHook, interval = 30000) {
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);
  
  const result = queryHook({
    pollInterval: isRealTimeEnabled ? interval : 0,
    fetchPolicy: isRealTimeEnabled ? 'cache-and-network' : 'cache-first'
  });
  
  const enableRealTime = useCallback(() => {
    setIsRealTimeEnabled(true);
  }, []);
  
  const disableRealTime = useCallback(() => {
    setIsRealTimeEnabled(false);
  }, []);
  
  return {
    ...result,
    isRealTimeEnabled,
    enableRealTime,
    disableRealTime
  };
}

// Hook for cache management
export function useSubgraphCache() {
  const clearCache = useCallback((pattern) => {
    graphqlClient.clearCache(pattern);
  }, []);
  
  const getStats = useCallback(() => {
    return graphqlClient.getStats();
  }, []);
  
  const healthCheck = useCallback(async () => {
    return await graphqlClient.healthCheck();
  }, []);
  
  return {
    clearCache,
    getStats,
    healthCheck
  };
}