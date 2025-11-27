// backend/routes/manufacturer.js
const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchain');
const { ethers } = require('ethers');
const { isAdmin, requireAdmin, getAdminAddresses } = require('../utils/adminAuth');

// Utils
const isValidEthereumAddress = (address) => {
  try { return ethers.isAddress(address); } catch { return false; }
};
const normalizeAddress = (address) => {
  try { return ethers.getAddress(address); } catch { return null; }
};
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
const logRequest = (req, _res, next) => {
  const ts = new Date().toISOString();
  console.log(`${ts} - ${req.method} ${req.originalUrl} - IP: ${req.ip || req.connection?.remoteAddress}`);
  next();
};
router.use(logRequest);

// Simple in-memory cache for addresses known to be NOT_REGISTERED to avoid
// repeatedly calling the blockchain for addresses that don't exist yet.
// Key: normalized address, Value: timestamp (ms) when the entry expires
const NOT_REGISTERED_CACHE = new Map();
const NOT_REGISTERED_TTL_MS = parseInt(process.env.NOT_REGISTERED_TTL_MS || '60000', 10); // default 60s

function isAddressNotRegisteredCached(address) {
  try {
    const key = address.toLowerCase();
    const expires = NOT_REGISTERED_CACHE.get(key);
    if (!expires) return false;
    if (Date.now() > expires) {
      NOT_REGISTERED_CACHE.delete(key);
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

function cacheAddressAsNotRegistered(address) {
  try {
    const key = address.toLowerCase();
    NOT_REGISTERED_CACHE.set(key, Date.now() + NOT_REGISTERED_TTL_MS);
  } catch (e) {
    // ignore cache failures
  }
}

// Guidance for GET /register (method guard) - Updated to show email requirement
router.get('/register', (_req, res) => {
  res.status(405).json({
    success: false,
    error: 'Method Not Allowed. Use POST to register a manufacturer.',
    allowedMethods: ['POST'],
    correctEndpoint: 'POST /api/manufacturer/register',
    requiredFields: ['manufacturerAddress', 'name', 'license', 'email'],
    example: {
      manufacturerAddress: '0x1234567890abcdef1234567890abcdef12345678',
      name: 'MediCare Pvt Ltd',
      license: 'LIC-987654',
      email: 'admin@medicare.com'
    }
  });
});

// NEW: Prepare register (frontend-signed write) - Updated to use email
router.post('/prepare-register', async (req, res) => {
  try {
    const { manufacturerAddress, name, license, email } = req.body || {};
    if (!manufacturerAddress || !name || !license || !email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['manufacturerAddress', 'name', 'license', 'email']
      });
    }
    if (!isValidEthereumAddress(manufacturerAddress)) {
      return res.status(400).json({ success: false, error: 'Invalid Ethereum address format' });
    }
    const normalizedAddress = normalizeAddress(manufacturerAddress);
    if (!normalizedAddress) {
      return res.status(400).json({ success: false, error: 'Invalid Ethereum address - unable to normalize' });
    }
    if (name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({ success: false, error: 'Name must be between 2 and 100 characters' });
    }
    if (license.trim().length < 5 || license.trim().length > 50) {
      return res.status(400).json({ success: false, error: 'License must be between 5 and 50 characters' });
    }
    if (!isValidEmail(email.trim())) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    const txPayload = blockchainService.prepareRegisterManufacturer(
      normalizedAddress, name.trim(), license.trim(), email.trim()
    );

    return res.json({
      success: true,
      message: 'Prepared manufacturer registration transaction',
      transaction: txPayload
    });
  } catch (error) {
    console.error('❌ Prepare register failed:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Updated server registration endpoint to allow self-registration
router.post('/register', async (req, res) => {
  try {
    console.log('📝 Manufacturer registration request received');
    const { manufacturerAddress, name, license, email } = req.body;

    if (!manufacturerAddress || !name || !license || !email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['manufacturerAddress', 'name', 'license', 'email']
      });
    }
    
    if (typeof manufacturerAddress !== 'string' || typeof name !== 'string' || 
        typeof license !== 'string' || typeof email !== 'string') {
      return res.status(400).json({ success: false, error: 'All fields must be strings' });
    }
    
    if (!isValidEthereumAddress(manufacturerAddress)) {
      return res.status(400).json({ success: false, error: 'Invalid Ethereum address format' });
    }
    
    const normalizedAddress = normalizeAddress(manufacturerAddress);
    if (!normalizedAddress) {
      return res.status(400).json({ success: false, error: 'Invalid Ethereum address - unable to normalize' });
    }
    
    if (name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({ success: false, error: 'Name must be between 2 and 100 characters' });
    }
    
    if (license.trim().length < 5 || license.trim().length > 50) {
      return res.status(400).json({ success: false, error: 'License must be between 5 and 50 characters' });
    }
    
    if (!isValidEmail(email.trim())) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    // UPDATED: Use regular server write instead of dev-only write
    // This allows self-registration while still requiring server signature for security
    const result = await blockchainService.devRegisterManufacturer(
      normalizedAddress, name.trim(), license.trim(), email.trim()
    );

    res.json({
      success: true,
      message: 'Manufacturer registered successfully. Awaiting admin verification.',
      data: {
        manufacturerAddress: normalizedAddress,
        name: name.trim(),
        license: license.trim(),
        email: email.trim(),
        status: 'registered_pending_verification',
        txHash: result.txHash,
        blockNumber: result.blockNumber,
        gasUsed: result.gasUsed,
        explorerUrl: result.explorerUrl,
        note: 'Your registration is complete but you need admin verification before you can register medicine batches.'
      }
    });
  } catch (error) {
    console.error('❌ Manufacturer registration failed:', error.message);
    if (error.message.includes('Manufacturer already registered')) {
      return res.status(409).json({ 
        success: false, 
        error: 'Manufacturer already registered', 
        code: 'ALREADY_REGISTERED',
        message: 'This address has already been registered. If you need verification, please contact admin.'
      });
    }
    if (error.message.includes('insufficient funds')) {
      return res.status(400).json({ success: false, error: 'Insufficient funds for gas fees', code: 'INSUFFICIENT_FUNDS' });
    }
    res.status(500).json({ success: false, error: error.message, code: 'REGISTRATION_FAILED' });
  }
});


// Keep all other existing endpoints unchanged...
router.post('/prepare-verify', async (req, res) => {
  try {
    const { manufacturerAddress } = req.body || {};
    if (!manufacturerAddress) {
      return res.status(400).json({ success: false, error: 'manufacturerAddress is required' });
    }
    if (!isValidEthereumAddress(manufacturerAddress)) {
      return res.status(400).json({ success: false, error: 'Invalid Ethereum address format' });
    }
    const normalizedAddress = normalizeAddress(manufacturerAddress);
    if (!normalizedAddress) {
      return res.status(400).json({ success: false, error: 'Invalid Ethereum address - unable to normalize' });
    }

    const txPayload = blockchainService.prepareVerifyManufacturer(normalizedAddress);
    return res.json({
      success: true,
      message: 'Prepared manufacturer verification transaction',
      transaction: txPayload
    });
  } catch (error) {
    console.error('❌ Prepare verify failed:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/prepare-deactivate', async (req, res) => {
  try {
    const { manufacturerAddress } = req.body || {};
    if (!manufacturerAddress) {
      return res.status(400).json({ success: false, error: 'manufacturerAddress is required' });
    }
    if (!isValidEthereumAddress(manufacturerAddress)) {
      return res.status(400).json({ success: false, error: 'Invalid Ethereum address format' });
    }
    const normalizedAddress = normalizeAddress(manufacturerAddress);
    if (!normalizedAddress) {
      return res.status(400).json({ success: false, error: 'Invalid Ethereum address - unable to normalize' });
    }
    const txPayload = blockchainService.prepareDeactivateManufacturer(normalizedAddress);
    return res.json({
      success: true,
      message: 'Prepared manufacturer deactivation transaction',
      transaction: txPayload
    });
  } catch (error) {
    console.error('❌ Prepare deactivate failed:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/verify', async (req, res) => {
  try {
    console.log('🔍 Manufacturer verification request received');
    const { manufacturerAddress, adminAddress } = req.body;
    
    // Check admin authentication
    if (!adminAddress) {
      return res.status(400).json({ 
        success: false, 
        error: 'adminAddress is required for verification', 
        code: 'MISSING_ADMIN_ADDRESS' 
      });
    }
    
    if (!isAdmin(adminAddress)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Unauthorized. Only admin can verify manufacturers.', 
        code: 'UNAUTHORIZED_ADMIN',
        configuredAdmins: getAdminAddresses().length
      });
    }
    
    if (!manufacturerAddress) {
      return res.status(400).json({ success: false, error: 'manufacturerAddress is required' });
    }
    if (!isValidEthereumAddress(manufacturerAddress)) {
      return res.status(400).json({ success: false, error: 'Invalid Ethereum address format' });
    }
    const normalizedAddress = normalizeAddress(manufacturerAddress);
    if (!normalizedAddress) {
      return res.status(400).json({ success: false, error: 'Invalid Ethereum address - unable to normalize' });
    }
    const result = await blockchainService.devVerifyManufacturer(normalizedAddress);
    res.json({
      success: true,
      message: 'Manufacturer verified successfully',
      data: {
        manufacturerAddress: normalizedAddress,
        txHash: result.txHash,
        blockNumber: result.blockNumber,
        gasUsed: result.gasUsed,
        explorerUrl: result.explorerUrl
      }
    });
  } catch (error) {
    console.error('❌ Manufacturer verification failed:', error.message);
    if (error.message.includes('Manufacturer not registered')) {
      return res.status(404).json({ success: false, error: 'Manufacturer not found. Please register first.', code: 'NOT_REGISTERED' });
    }
    if (error.message.includes('Already verified')) {
      return res.status(409).json({ success: false, error: 'Manufacturer already verified', code: 'ALREADY_VERIFIED' });
    }
    res.status(500).json({ success: false, error: error.message, code: 'VERIFICATION_FAILED' });
  }
});

router.post('/deactivate', async (req, res) => {
  try {
    console.log('⚠️ Manufacturer deactivation request received');
    const { manufacturerAddress, reason, adminAddress } = req.body;
    
    // Check admin authentication
    if (!adminAddress) {
      return res.status(400).json({ 
        success: false, 
        error: 'adminAddress is required for deactivation', 
        code: 'MISSING_ADMIN_ADDRESS' 
      });
    }
    
    if (!isAdmin(adminAddress)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Unauthorized. Only admin can deactivate manufacturers.', 
        code: 'UNAUTHORIZED_ADMIN',
        configuredAdmins: getAdminAddresses().length
      });
    }
    
    if (!manufacturerAddress) {
      return res.status(400).json({
        success: false,
        error: 'manufacturerAddress is required',
        example: { manufacturerAddress: '0x1234567890abcdef1234567890abcdef12345678', reason: 'License expired' }
      });
    }
    if (!isValidEthereumAddress(manufacturerAddress)) {
      return res.status(400).json({ success: false, error: 'Invalid Ethereum address format' });
    }
    const normalizedAddress = normalizeAddress(manufacturerAddress);
    if (!normalizedAddress) {
      return res.status(400).json({ success: false, error: 'Invalid Ethereum address - unable to normalize' });
    }
    const result = await blockchainService.devDeactivateManufacturer(normalizedAddress);
    res.json({
      success: true,
      message: 'Manufacturer deactivated successfully',
      data: {
        manufacturerAddress: normalizedAddress,
        reason: reason || 'Administrative decision',
        txHash: result.txHash,
        blockNumber: result.blockNumber,
        gasUsed: result.gasUsed,
        explorerUrl: result.explorerUrl,
        deactivatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Manufacturer deactivation failed:', error.message);
    if (error.message.includes('Manufacturer not registered')) {
      return res.status(404).json({ success: false, error: 'Manufacturer not found. Cannot deactivate unregistered manufacturer.', code: 'NOT_REGISTERED' });
    }
    if (error.message.includes('Only admin')) {
      return res.status(403).json({ success: false, error: 'Unauthorized. Only admin can deactivate manufacturers.', code: 'UNAUTHORIZED' });
    }
    if (error.message.includes('insufficient funds')) {
      return res.status(400).json({ success: false, error: 'Insufficient funds for gas fees', code: 'INSUFFICIENT_FUNDS' });
    }
    res.status(500).json({ success: false, error: error.message, code: 'DEACTIVATION_FAILED' });
  }
});

// Keep all remaining endpoints unchanged...
router.get('/:address/batches', async (req, res) => {
  try {
    const { address } = req.params;
    console.log(`📋 Fetching batches for manufacturer: ${address}`);
    if (!isValidEthereumAddress(address)) {
      return res.status(400).json({ success: false, error: 'Invalid Ethereum address format', received: address });
    }
    const normalizedAddress = normalizeAddress(address);
    if (isAddressNotRegisteredCached(normalizedAddress)) {
      console.log(`⏱️ Cached: Address ${normalizedAddress} recently marked as NOT_REGISTERED, returning 404`);
      return res.status(404).json({ success: false, error: 'Manufacturer not found (cached)', code: 'NOT_REGISTERED_CACHED', address: normalizedAddress });
    }
    const batches = await blockchainService.getManufacturerBatches(normalizedAddress);
    console.log(`✅ Found ${batches.length} batches for manufacturer`);
    res.json({ success: true, data: { manufacturerAddress: normalizedAddress, totalBatches: batches.length, batches } });
  } catch (error) {
    console.error('❌ Failed to get manufacturer batches:', error.message);
    if (error.message && error.message.includes('Manufacturer not registered')) {
      // Cache the negative result so we don't hammer the chain
      try { cacheAddressAsNotRegistered(normalizeAddress(req.params.address)); } catch (e) {}
      return res.status(404).json({ success: false, error: 'Manufacturer not found', code: 'NOT_REGISTERED' });
    }
    if (error.message.includes('Manufacturer not registered')) {
      return res.status(404).json({ success: false, error: 'Manufacturer not found', code: 'NOT_REGISTERED' });
    }
    res.status(500).json({ success: false, error: error.message, code: 'FETCH_BATCHES_FAILED' });
  }
});

// Get admin configuration (for debugging/frontend use)
router.get('/admin/config', async (req, res) => {
  try {
    const adminAddresses = getAdminAddresses();
    const stats = await blockchainService.getContractStats();
    
    res.json({
      success: true,
      data: {
        configuredAdmins: adminAddresses.length,
        contractAdmin: stats.adminAddress,
        environmentAdmins: adminAddresses,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Failed to get admin config:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message, 
      code: 'ADMIN_CONFIG_FAILED' 
    });
  }
});

router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;
    console.log(`🔍 Fetching manufacturer details: ${address}`);
    if (!isValidEthereumAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Ethereum address format',
        received: address,
        expected: '42-character hexadecimal string starting with 0x (e.g., 0x1234567890abcdef1234567890abcdef12345678)'
      });
    }
    const normalized = normalizeAddress(address);
    if (!normalized) {
      return res.status(400).json({ success: false, error: 'Invalid Ethereum address - unable to normalize', received: address });
    }
      if (isAddressNotRegisteredCached(normalized)) {
        console.log(`⏱️ Cached: Address ${normalized} recently marked as NOT_REGISTERED, returning 404`);
        return res.status(404).json({ success: false, error: 'Manufacturer not found (cached)', code: 'NOT_REGISTERED_CACHED', address: normalized });
      }
      const manufacturer = await blockchainService.getManufacturer(normalized);
    console.log(`✅ Manufacturer details retrieved: ${manufacturer.name}`);
    res.json({ success: true, data: { manufacturer, address: normalized } });
  } catch (error) {
    console.error('❌ Failed to get manufacturer:', error.message);
    if (error.message.includes('Manufacturer not registered')) {
        // Cache the negative result so we don't hammer the chain
        try { cacheAddressAsNotRegistered(normalizeAddress(req.params.address)); } catch (e) {}
        return res.status(404).json({
          success: false,
          error: 'Manufacturer not found. This address has not been registered.',
          code: 'NOT_REGISTERED',
          address: req.params.address
        });
    }
    res.status(500).json({ success: false, error: error.message, code: 'FETCH_FAILED' });
  }
});

router.get('/', async (req, res) => {
  try {
    console.log('📋 Fetching all manufacturers list');
    const { limit = 50, offset = 0, status = 'all' } = req.query;
    const limitNum = parseInt(limit); const offsetNum = parseInt(offset);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
      return res.status(400).json({ success: false, error: 'Invalid limit parameter. Must be between 1 and 1000.', received: limit });
    }
    if (isNaN(offsetNum) || offsetNum < 0) {
      return res.status(400).json({ success: false, error: 'Invalid offset parameter. Must be 0 or greater.', received: offset });
    }
    if (!['all', 'active', 'inactive', 'verified', 'unverified'].includes(status)) {
      return res.status(400).json({
        success: false, error: 'Invalid status parameter.',
        allowed: ['all', 'active', 'inactive', 'verified', 'unverified'], received: status
      });
    }
    const all = await blockchainService.getAllManufacturers();
    let filtered = all;
    if (status === 'active') filtered = all.filter(m => m.isActive);
    else if (status === 'inactive') filtered = all.filter(m => !m.isActive);
    else if (status === 'verified') filtered = all.filter(m => m.isVerified);
    else if (status === 'unverified') filtered = all.filter(m => !m.isVerified);
    const total = filtered.length;
    const page = filtered.slice(offsetNum, offsetNum + limitNum);
    console.log(`✅ Retrieved ${page.length} of ${total} manufacturers`);
    res.json({
      success: true,
      data: {
        manufacturers: page,
        pagination: {
          total,
          limit: limitNum,
          offset: offsetNum,
          hasMore: offsetNum + limitNum < total,
          nextOffset: offsetNum + limitNum < total ? offsetNum + limitNum : null
        },
        filters: { status, applied: status !== 'all' },
        summary: {
          totalActive: all.filter(m => m.isActive).length,
          totalInactive: all.filter(m => !m.isActive).length,
          totalVerified: all.filter(m => m.isVerified).length,
          totalUnverified: all.filter(m => !m.isVerified).length
        }
      }
    });
  } catch (error) {
    console.error('❌ Failed to list manufacturers:', error.message);
    if (error.message.includes('getAllManufacturers is not a function')) {
      return res.status(501).json({
        success: false,
        error: 'Manufacturer listing requires blockchain service implementation',
        code: 'SERVICE_NOT_IMPLEMENTED',
        suggestion: 'The getAllManufacturers method needs to be implemented in the blockchain service',
        workaround: 'Use GET /api/manufacturer/{address} for specific manufacturer details'
      });
    }
    res.status(500).json({ success: false, error: error.message, code: 'LIST_FAILED' });
  }
});

router.use((error, _req, res, _next) => {
  console.error('❌ Manufacturer route error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error in manufacturer routes',
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
