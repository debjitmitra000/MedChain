import { get, post } from './client';
import { graphqlClient, QUERIES } from './subgraph';

// Write operations - use backend API
export const prepareRegisterBatch = (payload) =>
  post('/api/batch/prepare-registration', payload);

export const prepareRecall = (batchId, payload) =>
  post(`/api/batch/${batchId}/prepare-recall`, payload);

// QR generation - always use backend
export const getBatchQR = (batchId) =>
  get(`/api/batch/${batchId}/qr`);

// Read operations - use The Graph subgraph
export const getBatch = async (batchId) => {
  try {
    const result = await graphqlClient.request(QUERIES.GET_BATCH_BY_BATCH_ID, { 
      batchId: batchId 
    });
    
    if (result.medicineBatches && result.medicineBatches.length > 0) {
      const batch = result.medicineBatches[0];
      return {
        success: true,
        batch: {
          id: batch.id,
          batchId: batch.batchId,
          medicineName: batch.medicineName,
          manufacturer: {
            address: batch.manufacturer.id,
            name: batch.manufacturer.name,
            ensName: batch.manufacturer.ensName,
            isVerified: batch.manufacturer.isVerified,
            registeredAt: batch.manufacturer.registeredAt,
            verifiedAt: batch.manufacturer.verifiedAt
          },
          expiryDate: batch.expiryDate,
          createdAt: batch.createdAt,
          isRecalled: batch.isRecalled,
          recalledAt: batch.recalledAt,
          verifications: batch.verifications?.map(v => ({
            id: v.id,
            verifier: v.verifier,
            timestamp: v.timestamp,
            transactionHash: v.transactionHash
          })) || []
        }
      };
    }
    
    // Fallback to backend API if not found in subgraph
    return await get(`/api/batch/${batchId}`);
  } catch (error) {
    console.error('Error fetching batch from subgraph:', error);
    // Fallback to backend API
    return await get(`/api/batch/${batchId}`);
  }
};

export const getAllBatches = async (params = {}) => {
  try {
    const { limit = 100, offset = 0, orderBy = 'createdAt', orderDirection = 'desc' } = params;
    
    const result = await graphqlClient.request(QUERIES.GET_ALL_BATCHES, {
      first: limit,
      skip: offset,
      orderBy: orderBy,
      orderDirection: orderDirection
    });
    
    return {
      success: true,
      batches: result.medicineBatches?.map(batch => ({
        id: batch.id,
        batchId: batch.batchId,
        medicineName: batch.medicineName,
        manufacturer: {
          address: batch.manufacturer.id,
          name: batch.manufacturer.name,
          ensName: batch.manufacturer.ensName,
          isVerified: batch.manufacturer.isVerified
        },
        expiryDate: batch.expiryDate,
        createdAt: batch.createdAt,
        isRecalled: batch.isRecalled,
        recalledAt: batch.recalledAt,
        recentVerifications: batch.verifications || []
      })) || [],
      pagination: {
        limit,
        offset,
        total: result.medicineBatches?.length || 0
      }
    };
  } catch (error) {
    console.error('Error fetching all batches from subgraph:', error);
    return { success: false, batches: [] };
  }
};

export const getExpiredBatches = async (params = {}) => {
  try {
    const { limit = 100 } = params;
    const currentTimestamp = Math.floor(Date.now() / 1000).toString();
    
    const result = await graphqlClient.request(QUERIES.GET_EXPIRED_BATCHES, {
      currentTimestamp,
      first: limit
    });
    
    return {
      success: true,
      batches: result.medicineBatches?.map(batch => ({
        id: batch.id,
        batchId: batch.batchId,
        medicineName: batch.medicineName,
        manufacturer: {
          address: batch.manufacturer.id,
          name: batch.manufacturer.name,
          ensName: batch.manufacturer.ensName,
          isVerified: batch.manufacturer.isVerified
        },
        expiryDate: batch.expiryDate,
        createdAt: batch.createdAt,
        isRecalled: batch.isRecalled
      })) || []
    };
  } catch (error) {
    console.error('Error fetching expired batches from subgraph:', error);
    return { success: false, batches: [] };
  }
};

export const getRecalledBatches = async (params = {}) => {
  try {
    const { limit = 100, offset = 0 } = params;
    
    const result = await graphqlClient.request(QUERIES.GET_RECALLED_BATCHES, {
      first: limit,
      skip: offset
    });
    
    return {
      success: true,
      batches: result.medicineBatches?.map(batch => ({
        id: batch.id,
        batchId: batch.batchId,
        medicineName: batch.medicineName,
        manufacturer: {
          address: batch.manufacturer.id,
          name: batch.manufacturer.name,
          ensName: batch.manufacturer.ensName,
          isVerified: batch.manufacturer.isVerified
        },
        expiryDate: batch.expiryDate,
        createdAt: batch.createdAt,
        isRecalled: batch.isRecalled,
        recalledAt: batch.recalledAt
      })) || []
    };
  } catch (error) {
    console.error('Error fetching recalled batches from subgraph:', error);
    return { success: false, batches: [] };
  }
};

export const getBatchVerifications = async (batchId, params = {}) => {
  try {
    const { limit = 100 } = params;
    
    // First get the batch to get its ID
    const batchResult = await graphqlClient.request(QUERIES.GET_BATCH_BY_BATCH_ID, { batchId });
    
    if (!batchResult.medicineBatches || batchResult.medicineBatches.length === 0) {
      return { success: false, verifications: [] };
    }
    
    const batch = batchResult.medicineBatches[0];
    
    const result = await graphqlClient.request(QUERIES.GET_BATCH_VERIFICATIONS, {
      batchId: batch.id,
      first: limit
    });
    
    return {
      success: true,
      verifications: result.batchVerifications?.map(v => ({
        id: v.id,
        batch: {
          id: v.batch.id,
          batchId: v.batch.batchId,
          medicineName: v.batch.medicineName
        },
        verifier: v.verifier,
        timestamp: v.timestamp,
        transactionHash: v.transactionHash
      })) || []
    };
  } catch (error) {
    console.error('Error fetching batch verifications from subgraph:', error);
    return { success: false, verifications: [] };
  }
};

export const getRecentVerifications = async (params = {}) => {
  try {
    const { limit = 50 } = params;
    
    const result = await graphqlClient.request(QUERIES.GET_RECENT_VERIFICATIONS, {
      first: limit
    });
    
    return {
      success: true,
      verifications: result.batchVerifications?.map(v => ({
        id: v.id,
        batch: {
          id: v.batch.id,
          batchId: v.batch.batchId,
          medicineName: v.batch.medicineName,
          manufacturer: {
            address: v.batch.manufacturer.id,
            name: v.batch.manufacturer.name,
            ensName: v.batch.manufacturer.ensName
          }
        },
        verifier: v.verifier,
        timestamp: v.timestamp,
        transactionHash: v.transactionHash
      })) || []
    };
  } catch (error) {
    console.error('Error fetching recent verifications from subgraph:', error);
    return { success: false, verifications: [] };
  }
};

export const getUserVerifications = async (userAddress, params = {}) => {
  try {
    const { limit = 100 } = params;
    
    const result = await graphqlClient.request(QUERIES.GET_USER_VERIFICATIONS, {
      verifier: userAddress.toLowerCase(),
      first: limit
    });
    
    return {
      success: true,
      verifications: result.batchVerifications?.map(v => ({
        id: v.id,
        batch: {
          id: v.batch.id,
          batchId: v.batch.batchId,
          medicineName: v.batch.medicineName,
          manufacturer: {
            address: v.batch.manufacturer.id,
            name: v.batch.manufacturer.name,
            ensName: v.batch.manufacturer.ensName
          }
        },
        verifier: v.verifier,
        timestamp: v.timestamp,
        transactionHash: v.transactionHash
      })) || []
    };
  } catch (error) {
    console.error('Error fetching user verifications from subgraph:', error);
    return { success: false, verifications: [] };
  }
};

export const getBatchRecalls = async (params = {}) => {
  try {
    const { limit = 100 } = params;
    
    const result = await graphqlClient.request(QUERIES.GET_BATCH_RECALLS, {
      first: limit
    });
    
    return {
      success: true,
      recalls: result.batchRecalls?.map(r => ({
        id: r.id,
        batch: {
          id: r.batch.id,
          batchId: r.batch.batchId,
          medicineName: r.batch.medicineName,
          manufacturer: {
            address: r.batch.manufacturer.id,
            name: r.batch.manufacturer.name,
            ensName: r.batch.manufacturer.ensName
          }
        },
        recaller: r.recaller,
        timestamp: r.timestamp,
        transactionHash: r.transactionHash
      })) || []
    };
  } catch (error) {
    console.error('Error fetching batch recalls from subgraph:', error);
    return { success: false, recalls: [] };
  }
};

// Global search function
export const globalSearch = async (searchTerm, params = {}) => {
  try {
    const { limit = 20 } = params;
    
    const result = await graphqlClient.request(QUERIES.GLOBAL_SEARCH, {
      searchTerm,
      first: limit
    });
    
    return {
      success: true,
      manufacturers: result.manufacturers?.map(m => ({
        address: m.id,
        name: m.name,
        ensName: m.ensName,
        isVerified: m.isVerified
      })) || [],
      batches: result.batches?.map(b => ({
        id: b.id,
        batchId: b.batchId,
        medicineName: b.medicineName,
        manufacturer: {
          address: b.manufacturer.id,
          name: b.manufacturer.name,
          ensName: b.manufacturer.ensName
        }
      })) || []
    };
  } catch (error) {
    console.error('Error performing global search:', error);
    return { success: false, manufacturers: [], batches: [] };
  }
};