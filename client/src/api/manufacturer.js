import { get, post } from './client';
import { graphqlClient, QUERIES } from './subgraph';

// Write operations - use backend API
export const prepareRegisterManufacturer = (payload) =>
  post('/api/manufacturer/prepare-register', payload);

export const prepareVerifyManufacturer = (payload) =>
  post('/api/manufacturer/prepare-verify', payload);

export const prepareDeactivateManufacturer = (payload) =>
  post('/api/manufacturer/prepare-deactivate', payload);

// Read operations - use The Graph subgraph
export const getManufacturer = async (address) => {
  try {
    const result = await graphqlClient.request(QUERIES.GET_MANUFACTURER_BY_ID, { 
      id: address.toLowerCase() 
    });
    
    if (result.manufacturer) {
      // Transform subgraph data to match backend API format
      const manufacturer = result.manufacturer;
      return {
        success: true,
        manufacturer: {
          address: manufacturer.id,
          name: manufacturer.name,
          ensName: manufacturer.ensName,
          isVerified: manufacturer.isVerified,
          registeredAt: manufacturer.registeredAt,
          verifiedAt: manufacturer.verifiedAt,
          totalBatches: manufacturer.totalBatches,
          batches: manufacturer.batches?.map(batch => ({
            batchId: batch.batchId,
            medicineName: batch.medicineName,
            expiryDate: batch.expiryDate,
            createdAt: batch.createdAt,
            isRecalled: batch.isRecalled,
            recalledAt: batch.recalledAt
          }))
        }
      };
    }
    
    // Fallback to backend API if not found in subgraph
    return await get(`/api/manufacturer/${address}`);
  } catch (error) {
    console.error('Error fetching manufacturer from subgraph:', error);
    // Fallback to backend API
    return await get(`/api/manufacturer/${address}`);
  }
};

export const getManufacturerBatches = async (address) => {
  try {
    const result = await graphqlClient.request(QUERIES.GET_MANUFACTURER_BATCHES, { 
      manufacturerId: address.toLowerCase(),
      first: 1000 
    });
    
    return {
      success: true,
      batches: result.medicineBatches?.map(batch => ({
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
        verifications: batch.verifications?.map(v => ({
          verifier: v.verifier,
          timestamp: v.timestamp,
          transactionHash: v.transactionHash
        }))
      })) || []
    };
  } catch (error) {
    console.error('Error fetching manufacturer batches from subgraph:', error);
    // Fallback to backend API
    return await get(`/api/manufacturer/${address}/batches`);
  }
};

export const getManufacturerList = async (params = {}) => {
  try {
    const { status = 'all', limit = 100, offset = 0 } = params;
    
    let query, variables;
    
    if (status === 'verified') {
      query = QUERIES.GET_VERIFIED_MANUFACTURERS;
      variables = { first: limit, skip: offset };
    } else if (status === 'unverified') {
      query = QUERIES.GET_ALL_MANUFACTURERS;
      variables = { 
        first: limit, 
        skip: offset,
        orderBy: 'registeredAt',
        orderDirection: 'desc'
      };
    } else {
      query = QUERIES.GET_ALL_MANUFACTURERS;
      variables = { 
        first: limit, 
        skip: offset,
        orderBy: 'registeredAt',
        orderDirection: 'desc'
      };
    }
    
    const result = await graphqlClient.request(query, variables);
    
    let manufacturers = result.manufacturers || [];
    
    // Filter unverified if requested
    if (status === 'unverified') {
      manufacturers = manufacturers.filter(m => !m.isVerified);
    }
    
    return {
      success: true,
      manufacturers: manufacturers.map(manufacturer => ({
        address: manufacturer.id,
        name: manufacturer.name,
        ensName: manufacturer.ensName,
        isVerified: manufacturer.isVerified,
        registeredAt: manufacturer.registeredAt,
        verifiedAt: manufacturer.verifiedAt,
        totalBatches: manufacturer.totalBatches,
        recentBatches: manufacturer.batches?.map(batch => ({
          batchId: batch.batchId,
          medicineName: batch.medicineName,
          expiryDate: batch.expiryDate,
          createdAt: batch.createdAt,
          isRecalled: batch.isRecalled
        })) || []
      })),
      pagination: {
        limit,
        offset,
        total: manufacturers.length // Note: This is approximate for subgraph
      }
    };
  } catch (error) {
    console.error('Error fetching manufacturer list from subgraph:', error);
    // Fallback to backend API
    const queryParams = new URLSearchParams();
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    
    const queryString = queryParams.toString();
    return get(`/api/manufacturer${queryString ? `?${queryString}` : ''}`);
  }
};

export const getUnverifiedManufacturers = async () => {
  return await getManufacturerList({ status: 'unverified' });
};

export const searchManufacturers = async (searchTerm, limit = 20) => {
  try {
    const result = await graphqlClient.request(QUERIES.SEARCH_MANUFACTURERS, { 
      searchTerm,
      first: limit 
    });
    
    return {
      success: true,
      manufacturers: result.manufacturers?.map(manufacturer => ({
        address: manufacturer.id,
        name: manufacturer.name,
        ensName: manufacturer.ensName,
        isVerified: manufacturer.isVerified,
        registeredAt: manufacturer.registeredAt,
        verifiedAt: manufacturer.verifiedAt,
        totalBatches: manufacturer.totalBatches
      })) || []
    };
  } catch (error) {
    console.error('Error searching manufacturers:', error);
    return { success: false, manufacturers: [] };
  }
};

// Analytics function for manufacturer insights
export const getManufacturerAnalytics = async (address) => {
  try {
    const result = await graphqlClient.request(QUERIES.GET_MANUFACTURER_ANALYTICS, { 
      manufacturerId: address.toLowerCase() 
    });
    
    if (result.manufacturer) {
      const manufacturer = result.manufacturer;
      const batches = manufacturer.batches || [];
      
      const analytics = {
        totalBatches: manufacturer.totalBatches,
        verifiedBatches: batches.filter(b => b.verifications?.length > 0).length,
        recalledBatches: batches.filter(b => b.isRecalled).length,
        expiredBatches: batches.filter(b => {
          const now = Math.floor(Date.now() / 1000);
          return parseInt(b.expiryDate) < now;
        }).length,
        totalVerifications: batches.reduce((sum, b) => sum + (b.verifications?.length || 0), 0),
        registrationDate: manufacturer.registeredAt,
        verificationDate: manufacturer.verifiedAt,
        isVerified: manufacturer.isVerified
      };
      
      return {
        success: true,
        analytics
      };
    }
    
    return { success: false, error: 'Manufacturer not found' };
  } catch (error) {
    console.error('Error fetching manufacturer analytics:', error);
    return { success: false, error: error.message };
  }
};
