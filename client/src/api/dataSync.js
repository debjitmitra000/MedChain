// api/dataSync.js
import { graphqlClient, QUERIES } from './subgraph';
import { get, post } from './client';

/**
 * Data synchronization utility to ensure consistency between backend API and subgraph
 */
class DataSyncService {
  constructor() {
    this.syncInterval = 30000; // 30 seconds
    this.syncTimers = new Map();
    this.lastSyncTimes = new Map();
    this.pendingOperations = new Set();
  }

  /**
   * Wait for a transaction to be indexed in the subgraph
   */
  async waitForIndexing(transactionHash, maxWait = 30000) {
    const startTime = Date.now();
    const checkInterval = 2000; // Check every 2 seconds

    while (Date.now() - startTime < maxWait) {
      try {
        // Check if transaction exists in any entity
        const queries = [
          `{ batchVerifications(where: {transactionHash: "${transactionHash}"}) { id } }`,
          `{ batchRecalls(where: {transactionHash: "${transactionHash}"}) { id } }`,
          `{ fakeBatchDetections(where: {transactionHash: "${transactionHash}"}) { id } }`,
          `{ kycDocuments(where: {id_contains: "${transactionHash}"}) { id } }`,
          `{ ensRegistrations(where: {id_contains: "${transactionHash}"}) { id } }`
        ];

        for (const query of queries) {
          try {
            const result = await graphqlClient.request(query);
            const hasResults = Object.values(result).some(arr => arr.length > 0);
            if (hasResults) {
              console.log(`✅ Transaction ${transactionHash} indexed in subgraph`);
              return true;
            }
          } catch (error) {
            // Continue checking other queries
          }
        }

        await new Promise(resolve => setTimeout(resolve, checkInterval));
      } catch (error) {
        console.error('Error checking indexing status:', error);
        await new Promise(resolve => setTimeout(resolve, checkInterval));
      }
    }

    console.warn(`⚠️ Transaction ${transactionHash} not indexed after ${maxWait}ms`);
    return false;
  }

  /**
   * Hybrid data fetcher - tries subgraph first, falls back to backend
   */
  async fetchWithFallback(subgraphQuery, subgraphVariables, backendEndpoint, transformFn) {
    try {
      const result = await graphqlClient.request(subgraphQuery, subgraphVariables);
      return transformFn ? transformFn(result) : result;
    } catch (error) {
      console.warn('Subgraph query failed, falling back to backend:', error.message);
      try {
        return await get(backendEndpoint);
      } catch (backendError) {
        console.error('Backend fallback also failed:', backendError);
        throw new Error('Both subgraph and backend queries failed');
      }
    }
  }

  /**
   * Write operation with indexing verification
   */
  async writeWithVerification(writeOperation, verificationFn, options = {}) {
    const { waitForIndexing = true, maxWait = 30000, retries = 3 } = options;

    try {
      // Execute write operation
      const result = await writeOperation();
      
      if (!result.success || !result.transactionHash) {
        throw new Error(result.error || 'Write operation failed');
      }

      const txHash = result.transactionHash;
      this.pendingOperations.add(txHash);

      // Wait for indexing if requested
      if (waitForIndexing) {
        const indexed = await this.waitForIndexing(txHash, maxWait);
        
        if (indexed && verificationFn) {
          // Verify the data was indexed correctly
          const verified = await verificationFn(result);
          if (!verified) {
            console.warn(`⚠️ Data verification failed for transaction ${txHash}`);
          }
        }
      }

      this.pendingOperations.delete(txHash);
      return result;

    } catch (error) {
      console.error('Write operation with verification failed:', error);
      throw error;
    }
  }

  /**
   * Get synchronization status
   */
  getSyncStatus() {
    return {
      pendingOperations: Array.from(this.pendingOperations),
      lastSyncTimes: Object.fromEntries(this.lastSyncTimes),
      activeSyncers: Array.from(this.syncTimers.keys())
    };
  }

  /**
   * Force sync for a specific entity type
   */
  async forceSync(entityType, identifier) {
    console.log(`🔄 Force syncing ${entityType}:${identifier}`);
    
    switch (entityType) {
      case 'manufacturer':
        return this.syncManufacturer(identifier);
      case 'batch':
        return this.syncBatch(identifier);
      default:
        throw new Error(`Unknown entity type: ${entityType}`);
    }
  }

  async syncManufacturer(address) {
    try {
      const [subgraphData, backendData] = await Promise.allSettled([
        graphqlClient.request(QUERIES.GET_MANUFACTURER_BY_ID, { id: address.toLowerCase() }),
        get(`/api/manufacturer/${address}`)
      ]);

      return {
        subgraph: subgraphData.status === 'fulfilled' ? subgraphData.value : null,
        backend: backendData.status === 'fulfilled' ? backendData.value : null,
        synced: Date.now()
      };
    } catch (error) {
      console.error('Manufacturer sync failed:', error);
      return null;
    }
  }

  async syncBatch(batchId) {
    try {
      const [subgraphData, backendData] = await Promise.allSettled([
        graphqlClient.request(QUERIES.GET_BATCH_BY_BATCH_ID, { batchId }),
        get(`/api/batch/${batchId}`)
      ]);

      return {
        subgraph: subgraphData.status === 'fulfilled' ? subgraphData.value : null,
        backend: backendData.status === 'fulfilled' ? backendData.value : null,
        synced: Date.now()
      };
    } catch (error) {
      console.error('Batch sync failed:', error);
      return null;
    }
  }

  /**
   * Health check for both backend and subgraph
   */
  async healthCheck() {
    try {
      const [subgraphHealth, backendHealth] = await Promise.allSettled([
        graphqlClient.healthCheck(),
        get('/health')
      ]);

      return {
        subgraph: {
          healthy: subgraphHealth.status === 'fulfilled' && subgraphHealth.value.healthy,
          details: subgraphHealth.status === 'fulfilled' ? subgraphHealth.value : { error: subgraphHealth.reason }
        },
        backend: {
          healthy: backendHealth.status === 'fulfilled' && backendHealth.value.status === 'OK',
          details: backendHealth.status === 'fulfilled' ? backendHealth.value : { error: backendHealth.reason }
        }
      };
    } catch (error) {
      return {
        subgraph: { healthy: false, details: { error: 'Health check failed' } },
        backend: { healthy: false, details: { error: 'Health check failed' } }
      };
    }
  }
}

// Export singleton instance
export const dataSyncService = new DataSyncService();

// Helper functions for common operations
export const writeManufacturer = async (payload) => {
  return dataSyncService.writeWithVerification(
    () => post('/api/manufacturer/register', payload),
    async (result) => {
      // Verify manufacturer was indexed
      const syncResult = await dataSyncService.syncManufacturer(payload.manufacturerAddress);
      return syncResult?.subgraph?.manufacturer != null;
    }
  );
};

export const writeBatch = async (payload) => {
  return dataSyncService.writeWithVerification(
    () => post('/api/batch/register', payload),
    async (result) => {
      // Verify batch was indexed
      const syncResult = await dataSyncService.syncBatch(payload.batchId);
      return syncResult?.subgraph?.medicineBatches?.length > 0;
    }
  );
};

export const verifyBatchWithSync = async (batchId, payload) => {
  return dataSyncService.writeWithVerification(
    () => post(`/api/verify/${batchId}`, payload),
    async (result) => {
      // Verify verification was indexed
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait a bit
      const verifications = await graphqlClient.request(
        QUERIES.GET_RECENT_VERIFICATIONS, 
        { first: 10 }
      );
      return verifications.batchVerifications?.some(v => 
        v.transactionHash === result.transactionHash
      ) || false;
    }
  );
};

export default dataSyncService;