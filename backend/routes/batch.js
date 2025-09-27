// backend/routes/batch.js
const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchain');
const qrService = require('../services/qr');

// Validation middleware (unchanged)
function validateBatchInput(req, res, next) {
  const { batchId, medicineName, manufacturingDate, expiryDate } = req.body;
  if (!batchId || !medicineName || !manufacturingDate || !expiryDate) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['batchId', 'medicineName', 'manufacturingDate', 'expiryDate'],
      received: {
        batchId: !!batchId,
        medicineName: !!medicineName,
        manufacturingDate: !!manufacturingDate,
        expiryDate: !!expiryDate
      }
    });
  }
  if (!/^[a-zA-Z0-9-_]+$/.test(batchId)) {
    return res.status(400).json({
      error: 'Invalid batch ID format',
      message: 'Batch ID can only contain alphanumeric characters, hyphens, and underscores',
      example: 'BATCH-001_ABC'
    });
  }
  if (batchId.length < 3 || batchId.length > 50) {
    return res.status(400).json({
      error: 'Invalid batch ID length',
      message: 'Batch ID must be between 3 and 50 characters'
    });
  }
  if (medicineName.length < 2 || medicineName.length > 100) {
    return res.status(400).json({
      error: 'Invalid medicine name length',
      message: 'Medicine name must be between 2 and 100 characters'
    });
  }
  const mfgDate = new Date(manufacturingDate);
  const expDate = new Date(expiryDate);
  const now = new Date();
  if (isNaN(mfgDate.getTime()) || isNaN(expDate.getTime())) {
    return res.status(400).json({
      error: 'Invalid date format',
      message: 'Use ISO 8601 format (YYYY-MM-DD) or JavaScript Date format',
      examples: ['2024-01-15', '2024-01-15T10:30:00Z']
    });
  }
  if (mfgDate >= expDate) {
    return res.status(400).json({
      error: 'Invalid date relationship',
      message: 'Manufacturing date must be before expiry date'
    });
  }
  if (mfgDate > now) {
    return res.status(400).json({
      error: 'Invalid manufacturing date',
      message: 'Manufacturing date cannot be in the future'
    });
  }
  if (expDate <= now) {
    return res.status(400).json({
      error: 'Invalid expiry date',
      message: 'Expiry date must be in the future'
    });
  }
  next();
}

// NEW: Prepare registration (frontend-signed transaction)
router.post('/prepare-registration', validateBatchInput, async (req, res) => {
  try {
    const { batchId, medicineName, manufacturingDate, expiryDate } = req.body;
    console.log(`🧾 Prepare batch registration: ${batchId}`);
    const mfgTimestamp = Math.floor(new Date(manufacturingDate).getTime() / 1000);
    const expTimestamp = Math.floor(new Date(expiryDate).getTime() / 1000);

    const txPayload = blockchainService.prepareRegisterBatch(
      batchId, medicineName, mfgTimestamp, expTimestamp
    );

    // Optional: also prepare QR data so UI can show preview
    const qrPreview = await qrService.generateBatchQR(batchId, {
      medicineName,
      manufacturingDate: mfgTimestamp,
      expiryDate: expTimestamp
    });

    return res.json({
      success: true,
      message: 'Prepared batch registration transaction',
      transaction: txPayload,
      qrPreview: {
        qrCode: qrPreview.qrCode,
        qrData: qrPreview.qrData
      }
    });
  } catch (error) {
    console.error(`❌ Prepare batch registration failed: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: error.message,
      code: 'PREPARE_BATCH_REGISTRATION_FAILED'
    });
  }
});

// Existing: Register new batch (server-signer dev only via service guard)
router.post('/register', validateBatchInput, async (req, res) => {
  try {
    const { batchId, medicineName, manufacturingDate, expiryDate } = req.body;
    console.log(`📦 New batch registration request: ${batchId}`);
    const mfgTimestamp = Math.floor(new Date(manufacturingDate).getTime() / 1000);
    const expTimestamp = Math.floor(new Date(expiryDate).getTime() / 1000);

    const blockchainResult = await blockchainService.devRegisterBatch(
      batchId, medicineName, mfgTimestamp, expTimestamp
    );

    const qrResult = await qrService.generateBatchQR(batchId, {
      medicineName,
      manufacturingDate: mfgTimestamp,
      expiryDate: expTimestamp
    });

    console.log(`✅ Batch ${batchId} registered successfully`);

    res.json({
      success: true,
      message: 'Batch registered successfully',
      data: {
        batchId,
        medicineName,
        manufacturingDate,
        expiryDate,
        blockchain: {
          txHash: blockchainResult.txHash,
          blockNumber: blockchainResult.blockNumber,
          gasUsed: blockchainResult.gasUsed,
          explorerUrl: blockchainResult.explorerUrl
        },
        qr: {
          qrCode: qrResult.qrCode,
          qrData: qrResult.qrData
        }
      }
    });
  } catch (error) {
    console.error(`❌ Batch registration failed: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'batch_registration_error',
      timestamp: new Date().toISOString()
    });
  }
});

// Get batch details (unchanged)
router.get('/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    if (!batchId || batchId.trim() === '') {
      return res.status(400).json({ error: 'Batch ID is required' });
    }
    console.log(`🔍 Fetching batch details: ${batchId}`);
    const batch = await blockchainService.verifyBatch(batchId);
    const isValid = await blockchainService.isBatchValid(batchId);
    const isExpired = await blockchainService.isBatchExpired(batchId);
    console.log(`✅ Batch ${batchId} details retrieved`);
    res.json({
      success: true,
      data: {
        batch,
        status: {
          isValid,
          isExpired,
          isActive: batch.isActive,
          isRecalled: batch.isRecalled
        },
        verification: {
          timestamp: new Date().toISOString(),
          message: isValid ? 'Batch is valid and authentic' :
                   isExpired ? 'Batch is expired' :
                   batch.isRecalled ? 'Batch has been recalled' :
                   'Batch is not valid'
        }
      }
    });
  } catch (error) {
    console.error(`❌ Failed to fetch batch ${req.params.batchId}: ${error.message}`);
    if (error.message.includes('Batch not found')) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found',
        message: 'The requested batch ID does not exist in the system',
        batchId: req.params.batchId
      });
    }
    res.status(500).json({ success: false, error: error.message, type: 'batch_fetch_error' });
  }
});

// NEW: Prepare recall (frontend-signed transaction)
router.post('/:batchId/prepare-recall', async (req, res) => {
  try {
    const { batchId } = req.params;
    const { reason, urgent } = req.body || {};
    if (!batchId || batchId.trim() === '') {
      return res.status(400).json({ error: 'Batch ID is required' });
    }
    console.log(`🧾 Prepare recall for batch: ${batchId}`);

    // Ensure batch exists before preparing
    const batch = await blockchainService.verifyBatch(batchId);
    if (batch.isRecalled) {
      return res.status(400).json({
        success: false,
        error: 'Batch already recalled',
        message: 'This batch has already been recalled',
        recalledAt: batch.createdAtFormatted
      });
    }

    const txPayload = blockchainService.prepareMarkBatchRecalled(batchId);
    return res.json({
      success: true,
      message: 'Prepared recall transaction',
      transaction: txPayload,
      meta: { reason: reason || 'Quality issue', urgent: urgent || false }
    });
  } catch (error) {
    console.error(`❌ Prepare recall failed: ${error.message}`);
    if (error.message.includes('Batch not found')) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found',
        message: 'Cannot prepare recall for non-existent batch'
      });
    }
    res.status(500).json({ success: false, error: error.message, code: 'PREPARE_RECALL_FAILED' });
  }
});

// Recall batch (server-signer dev only via service guard)
router.post('/:batchId/recall', async (req, res) => {
  try {
    const { batchId } = req.params;
    const { reason, urgent } = req.body;
    if (!batchId || batchId.trim() === '') {
      return res.status(400).json({ error: 'Batch ID is required' });
    }
    console.log(`⚠️ Batch recall request: ${batchId}`);
    const batch = await blockchainService.verifyBatch(batchId);
    if (batch.isRecalled) {
      return res.status(400).json({
        success: false,
        error: 'Batch already recalled',
        message: 'This batch has already been recalled',
        recalledAt: batch.createdAtFormatted
      });
    }
    const result = await blockchainService.devMarkBatchRecalled(batchId);
    console.log(`✅ Batch ${batchId} recalled successfully`);
    res.json({
      success: true,
      message: 'Batch recalled successfully',
      data: {
        batchId,
        reason: reason || 'Quality issue',
        urgent: urgent || false,
        blockchain: {
          txHash: result.txHash,
          blockNumber: result.blockNumber,
          gasUsed: result.gasUsed,
          explorerUrl: result.explorerUrl
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error(`❌ Batch recall failed: ${error.message}`);
    if (error.message.includes('Batch not found')) {
      return res.status(404).json({ success: false, error: 'Batch not found', message: 'Cannot recall a batch that does not exist' });
    }
    if (error.message.includes('Not the batch owner')) {
      return res.status(403).json({ success: false, error: 'Unauthorized', message: 'Only the manufacturer can recall their own batches' });
    }
    res.status(500).json({ success: false, error: error.message, type: 'batch_recall_error' });
  }
});

// QR/History/Validate (unchanged)
router.get('/:batchId/qr', async (req, res) => {
  try {
    const { batchId } = req.params;
    const { format, size } = req.query;
    if (!batchId || batchId.trim() === '') {
      return res.status(400).json({ error: 'Batch ID is required' });
    }
    console.log(`🏷️ QR code request for batch: ${batchId}`);
    const batch = await blockchainService.verifyBatch(batchId);
    const qrResult = await qrService.generateBatchQR(batchId, {
      medicineName: batch.medicineName,
      manufacturer: batch.manufacturer,
      manufacturingDate: batch.manufacturingDate,
      expiryDate: batch.expiryDate,
      format: format || 'json',
      size: size || 512
    });
    console.log(`✅ QR code generated for batch: ${batchId}`);
    res.json({
      success: true,
      data: {
        batchId,
        batch: {
          medicineName: batch.medicineName,
          manufacturingDate: batch.manufacturingDateFormatted,
          expiryDate: batch.expiryDateFormatted,
          isActive: batch.isActive,
          isRecalled: batch.isRecalled
        },
        qr: {
          qrCode: qrResult.qrCode,
          qrData: qrResult.qrData,
          format: qrResult.format,
          size: qrResult.size || '512x512'
        },
        generated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error(`❌ QR generation failed for batch ${req.params.batchId}: ${error.message}`);
    if (error.message.includes('Batch not found')) {
      return res.status(404).json({ success: false, error: 'Batch not found', message: 'Cannot generate QR code for non-existent batch' });
    }
    res.status(500).json({ success: false, error: error.message, type: 'qr_generation_error' });
  }
});

router.get('/:batchId/history', async (req, res) => {
  try {
    const { batchId } = req.params;
    const batch = await blockchainService.verifyBatch(batchId);
    res.json({
      success: true,
      message: 'Batch history (basic info)',
      data: {
        batchId,
        events: [
          {
            type: 'batch_created',
            timestamp: batch.createdAtFormatted,
            details: { medicineName: batch.medicineName, manufacturer: batch.manufacturer }
          },
          ...(batch.isRecalled ? [{
            type: 'batch_recalled',
            timestamp: 'Unknown',
            details: { reason: 'See blockchain events' }
          }] : [])
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:batchId/validate', async (req, res) => {
  try {
    const { batchId } = req.params;
    const { scanLocation, scannerInfo } = req.body;
    const batch = await blockchainService.verifyBatch(batchId);
    const isValid = await blockchainService.isBatchValid(batchId);
    const isExpired = await blockchainService.isBatchExpired(batchId);
    const validation = {
      batchId,
      isAuthentic: true,
      isValid,
      isExpired,
      isRecalled: batch.isRecalled,
      batch,
      scan: {
        location: scanLocation || 'Unknown',
        scanner: scannerInfo || 'Unknown',
        timestamp: new Date().toISOString()
      },
      recommendation: isValid ? 'Safe to use' :
                     isExpired ? 'Expired - Do not use' :
                     batch.isRecalled ? 'Recalled - Return immediately' :
                     'Invalid - Do not use'
    };
    res.json({ success: true, validation });
  } catch (error) {
    res.json({
      success: true,
      validation: {
        batchId: req.params.batchId,
        isAuthentic: false,
        isValid: false,
        isFake: true,
        recommendation: 'WARNING: Unregistered product - Potentially fake!',
        scan: { timestamp: new Date().toISOString() }
      }
    });
  }
});

module.exports = router;
