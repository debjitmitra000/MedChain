import { get, post } from './client';
import { graphqlClient, QUERIES } from './subgraph';

// Write operations - use backend API
export const verifyBatchDeep = (batchId, payload) =>
  post(`/api/verify/${batchId}`, payload);

// Read operations - enhanced with subgraph data
export const getGlobalStats = async () => {
  try {
    // Get stats from subgraph
    const result = await graphqlClient.request(QUERIES.GET_DASHBOARD_STATS);
    
    const manufacturers = result.manufacturers || [];
    const batches = result.medicineBatches || [];
    const verifications = result.batchVerifications || [];
    const detections = result.fakeBatchDetections || [];
    
    const currentTimestamp = Math.floor(Date.now() / 1000);
    
    const stats = {
      totalManufacturers: manufacturers.length,
      verifiedManufacturers: manufacturers.filter(m => m.isVerified).length,
      totalBatches: batches.length,
      activeBatches: batches.filter(b => !b.isRecalled && parseInt(b.expiryDate) > currentTimestamp).length,
      expiredBatches: batches.filter(b => !b.isRecalled && parseInt(b.expiryDate) <= currentTimestamp).length,
      recalledBatches: batches.filter(b => b.isRecalled).length,
      totalVerifications: verifications.length,
      recentVerifications: verifications.filter(v => {
        const dayAgo = currentTimestamp - (24 * 60 * 60);
        return parseInt(v.timestamp) > dayAgo;
      }).length,
      fakeBatchesDetected: detections.length,
      recentDetections: detections.filter(d => {
        const dayAgo = currentTimestamp - (24 * 60 * 60);
        return parseInt(d.timestamp) > dayAgo;
      }).length
    };
    
    return {
      success: true,
      stats,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching stats from subgraph:', error);
    // Fallback to backend API
    return await get('/api/verify/stats/global');
  }
};

export const getExpiredReports = async () => {
  try {
    const currentTimestamp = Math.floor(Date.now() / 1000).toString();
    
    const result = await graphqlClient.request(QUERIES.GET_EXPIRED_BATCHES, {
      currentTimestamp,
      first: 1000
    });
    
    const expiredBatches = result.medicineBatches || [];
    
    // Group by manufacturer
    const byManufacturer = expiredBatches.reduce((acc, batch) => {
      const manufacturerAddress = batch.manufacturer.id;
      if (!acc[manufacturerAddress]) {
        acc[manufacturerAddress] = {
          manufacturer: {
            address: batch.manufacturer.id,
            name: batch.manufacturer.name,
            ensName: batch.manufacturer.ensName,
            isVerified: batch.manufacturer.isVerified
          },
          expiredBatches: []
        };
      }
      
      acc[manufacturerAddress].expiredBatches.push({
        batchId: batch.batchId,
        medicineName: batch.medicineName,
        expiryDate: batch.expiryDate,
        createdAt: batch.createdAt,
        daysSinceExpiry: Math.floor((Date.now() / 1000 - parseInt(batch.expiryDate)) / (24 * 60 * 60))
      });
      
      return acc;
    }, {});
    
    // Convert to array and sort by number of expired batches
    const reports = Object.values(byManufacturer)
      .map(report => ({
        ...report,
        totalExpired: report.expiredBatches.length,
        avgDaysSinceExpiry: report.expiredBatches.reduce((sum, b) => sum + b.daysSinceExpiry, 0) / report.expiredBatches.length
      }))
      .sort((a, b) => b.totalExpired - a.totalExpired);
    
    return {
      success: true,
      reports,
      summary: {
        totalExpiredBatches: expiredBatches.length,
        affectedManufacturers: reports.length,
        averageDaysOverdue: expiredBatches.reduce((sum, b) => {
          const daysOverdue = Math.floor((Date.now() / 1000 - parseInt(b.expiryDate)) / (24 * 60 * 60));
          return sum + daysOverdue;
        }, 0) / expiredBatches.length
      }
    };
  } catch (error) {
    console.error('Error fetching expired reports from subgraph:', error);
    // Fallback to backend API
    return await get('/api/verify/reports/expired');
  }
};

export const getFakeBatchDetections = async (params = {}) => {
  try {
    const { limit = 100 } = params;
    
    const result = await graphqlClient.request(QUERIES.GET_FAKE_BATCH_DETECTIONS, {
      first: limit
    });
    
    return {
      success: true,
      detections: result.fakeBatchDetections?.map(d => ({
        id: d.id,
        batchId: d.batchId,
        detector: d.detector,
        timestamp: d.timestamp,
        transactionHash: d.transactionHash
      })) || []
    };
  } catch (error) {
    console.error('Error fetching fake batch detections from subgraph:', error);
    return { success: false, detections: [] };
  }
};

export const getBatchDetections = async (batchId, params = {}) => {
  try {
    const { limit = 100 } = params;
    
    const result = await graphqlClient.request(QUERIES.GET_BATCH_DETECTIONS, {
      batchId,
      first: limit
    });
    
    return {
      success: true,
      detections: result.fakeBatchDetections?.map(d => ({
        id: d.id,
        batchId: d.batchId,
        detector: d.detector,
        timestamp: d.timestamp,
        transactionHash: d.transactionHash
      })) || []
    };
  } catch (error) {
    console.error('Error fetching batch detections from subgraph:', error);
    return { success: false, detections: [] };
  }
};

// Analytics dashboard function
export const getDashboardAnalytics = async () => {
  try {
    const result = await graphqlClient.request(QUERIES.GET_DASHBOARD_STATS);
    
    const manufacturers = result.manufacturers || [];
    const batches = result.medicineBatches || [];
    const verifications = result.batchVerifications || [];
    const detections = result.fakeBatchDetections || [];
    
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const weekAgo = currentTimestamp - (7 * 24 * 60 * 60);
    const monthAgo = currentTimestamp - (30 * 24 * 60 * 60);
    
    // Time-based analytics
    const recentVerifications = verifications.filter(v => parseInt(v.timestamp) > weekAgo);
    const recentDetections = detections.filter(d => parseInt(d.timestamp) > weekAgo);
    const recentBatches = batches.filter(b => parseInt(b.createdAt) > weekAgo);
    
    // Quality metrics
    const expiredBatches = batches.filter(b => parseInt(b.expiryDate) <= currentTimestamp);
    const recalledBatches = batches.filter(b => b.isRecalled);
    
    return {
      success: true,
      analytics: {
        overview: {
          totalManufacturers: manufacturers.length,
          verifiedManufacturers: manufacturers.filter(m => m.isVerified).length,
          totalBatches: batches.length,
          totalVerifications: verifications.length,
          totalDetections: detections.length
        },
        trends: {
          batchesThisWeek: recentBatches.length,
          verificationsThisWeek: recentVerifications.length,
          detectionsThisWeek: recentDetections.length,
          verificationRate: batches.length > 0 ? (verifications.length / batches.length) : 0
        },
        quality: {
          expiredBatchesCount: expiredBatches.length,
          expiredBatchesPercentage: batches.length > 0 ? (expiredBatches.length / batches.length * 100) : 0,
          recalledBatchesCount: recalledBatches.length,
          recalledBatchesPercentage: batches.length > 0 ? (recalledBatches.length / batches.length * 100) : 0,
          fakeDetectionRate: batches.length > 0 ? (detections.length / batches.length * 100) : 0
        },
        manufacturerInsights: {
          topManufacturersByBatches: manufacturers
            .sort((a, b) => b.totalBatches - a.totalBatches)
            .slice(0, 10)
            .map(m => ({
              address: m.id,
              name: m.name || 'Unknown',
              totalBatches: m.totalBatches,
              isVerified: m.isVerified
            }))
        }
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard analytics from subgraph:', error);
    return { success: false, analytics: null };
  }
};
