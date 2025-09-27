const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchain');
const notificationService = require('../services/notification');

router.post('/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const { scannerAddress, location } = req.body;

    let verificationResult = {
      batchId,
      timestamp: new Date().toISOString(),
      scannerAddress: scannerAddress || 'anonymous',
      location: location || 'unknown'
    };

    try {
      // Try to verify batch on blockchain
      const batch = await blockchainService.verifyBatch(batchId);
      
      // Check if batch is valid
      const isValid = await blockchainService.isBatchValid(batchId);
      const isExpired = await blockchainService.isBatchExpired(batchId);

      // Get manufacturer details (updated to get email instead of ensName)
      const manufacturer = await blockchainService.getManufacturer(batch.manufacturer);

      verificationResult = {
        ...verificationResult,
        status: 'found',
        isValid,
        isExpired,
        isRecalled: batch.isRecalled,
        batch: {
          ...batch,
          manufacturerName: manufacturer.name,
          manufacturerEmail: manufacturer.email
        },
        message: isValid ? '✅ Authentic Medicine - Safe to Use' :
                isExpired ? '⚠️ Medicine Expired - Do Not Use' :
                batch.isRecalled ? '🚫 Batch Recalled - Return to Pharmacy' :
                '❌ Invalid Batch'
      };

      // Record expired scan and send email notification for expired batch
      if (isExpired) {
        try {
          // Record the expired scan on blockchain
          await blockchainService.recordExpiredScan(batchId);
          console.log(`📊 Recorded expired scan for batch: ${batchId}`);
        } catch (error) {
          console.warn(`⚠️ Failed to record expired scan: ${error.message}`);
        }

        // Send email notification directly to manufacturer's email
        if (process.env.SEND_EMAILS === 'true' && manufacturer.email) {
          await notificationService.sendExpiredBatchNotification(
            batch, 
            manufacturer.email
          );
        }
      }

    } catch (error) {
      // Batch not found - could be fake
      verificationResult = {
        ...verificationResult,
        status: 'not_found',
        isValid: false,
        isFake: true,
        message: '🚨 WARNING: Unregistered Product - Possibly Fake!',
        error: error.message
      };

      // Send fake batch notification
      if (process.env.SEND_EMAILS === 'true') {
        await notificationService.sendFakeBatchNotification(batchId, {
          scannerAddress: scannerAddress || 'anonymous',
          location: location || 'unknown'
        });
      }
    }

    console.log('Verification attempt:', verificationResult);

    res.json({
      success: true,
      verification: verificationResult
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// NEW: Get expired medicine reports endpoint
router.get('/reports/expired', async (req, res) => {
  try {
    console.log('📊 Fetching expired medicine reports');
    const reports = await blockchainService.getExpiredMedicineReports();
    
    res.json({
      success: true,
      data: {
        totalReports: reports.length,
        reports: reports,
        summary: {
          totalExpiredScans: reports.reduce((sum, report) => sum + report.expiredScanCount, 0),
          mostScannedBatch: reports.length > 0 ? reports[0] : null
        }
      }
    });
  } catch (error) {
    console.error('❌ Failed to get expired medicine reports:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Updated global stats to include expired scans count
router.get('/stats/global', async (req, res) => {
  try {
    const stats = await blockchainService.getContractStats();
    
    res.json({
      success: true,
      stats: {
        totalBatches: parseInt(stats.totalBatches),
        totalManufacturers: parseInt(stats.totalManufacturers),
        totalRecalledBatches: parseInt(stats.totalRecalledBatches),
        totalExpiredScans: parseInt(stats.totalExpiredScans || 0),
        adminAddress: stats.adminAddress,
        activeBatches: stats.activeBatches,
        recallRate: `${stats.recallRate}%`,
        network: process.env.NETWORK,
        chainId: process.env.CHAIN_ID
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;
