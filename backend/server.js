const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Environment validation
function validateEnvironment() {
  const required = [
    'PORT', 'NETWORK', 'CHAIN_ID', 'PRIVATE_KEY',
    'CONTRACT_ADDRESS', 'SEPOLIA_RPC_URL'
  ];

  const missing = required.filter(env => !process.env[env]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    console.error('Please check your .env file and ensure all required variables are set');
    process.exit(1);
  }

  // Validate private key format
  if (!process.env.PRIVATE_KEY.startsWith('0x')) {
    console.error('❌ PRIVATE_KEY must start with 0x');
    process.exit(1);
  }

  // Validate contract address format
  if (!process.env.CONTRACT_ADDRESS.startsWith('0x') || process.env.CONTRACT_ADDRESS.length !== 42) {
    console.error('❌ CONTRACT_ADDRESS must be a valid Ethereum address (0x...)');
    process.exit(1);
  }

  console.log('✅ Environment validation passed');
}

// Run validation before starting server
validateEnvironment();

const manufacturerRoutes = require('./routes/manufacturer');
const batchRoutes = require('./routes/batch');
const verifyRoutes = require('./routes/verify');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:", "wss:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Body parsing middleware with increased limits for QR codes
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      if (buf?.length) JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ error: 'Invalid JSON format' });
      // Throw to abort further middlewares
      throw e;
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection?.remoteAddress;

  console.log(`${timestamp} - ${method} ${url} - IP: ${ip}`);

  // Log request body for POST/PUT requests (excluding sensitive data)
  if ((method === 'POST' || method === 'PUT') && req.body) {
    const logBody = { ...req.body };
    // Don't log sensitive information
    if (logBody.privateKey) logBody.privateKey = '[REDACTED]';
    if (logBody.password) logBody.password = '[REDACTED]';
    if (logBody.email) logBody.email = '[REDACTED]';
    console.log('Request body:', JSON.stringify(logBody, null, 2));
  }

  next();
});

// Routes
app.use('/api/manufacturer', manufacturerRoutes);
app.use('/api/batch', batchRoutes);
app.use('/api/verify', verifyRoutes);

// Enhanced health check with blockchain status (Updated to include expired scans)
app.get('/health', async (req, res) => {
  try {
    const blockchainService = require('./services/blockchain');

    // Test blockchain connection
    const stats = await blockchainService.getContractStats();
    const balance = await blockchainService.getWalletBalance();

    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '2.2.0', // Updated version to reflect new features
      network: {
        name: process.env.NETWORK,
        chainId: process.env.CHAIN_ID,
        rpcUrl: process.env.SEPOLIA_RPC_URL ? 'Connected' : 'Not configured'
      },
      blockchain: {
        connected: true,
        contractAddress: process.env.CONTRACT_ADDRESS,
        totalBatches: stats.totalBatches,
        totalManufacturers: stats.totalManufacturers,
        totalRecalled: stats.totalRecalledBatches,
        totalExpiredScans: stats.totalExpiredScans || 0
      },
      wallet: {
        address: balance.address,
        balance: `${balance.balanceEth} ETH`,
        hasBalance: parseFloat(balance.balanceEth) > 0
      },
      features: {
        ipfs: false,
        email: process.env.SEND_EMAILS === 'true',
        qr: true,
        expiredTracking: true,
        directManufacturerNotifications: true,
        verifiedOnlyBatchRegistration: true,
        registry: !!process.env.REGISTRY_CONTRACT_ADDRESS
      },
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('Health check failed:', error.message);

    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message,
      blockchain: {
        connected: false,
        error: error.message
      },
      network: {
        name: process.env.NETWORK,
        chainId: process.env.CHAIN_ID
      }
    });
  }
});

// API documentation endpoint (Updated to reflect new features)
app.get('/api', (req, res) => {
  res.json({
    name: 'MedChain API - Blockchain Medicine Authentication',
    version: '2.2.0',
    description: 'Secure blockchain-based medicine authentication system with expired medicine tracking',
    documentation: 'https://github.com/medchain/api-docs',
    network: {
      name: process.env.NETWORK,
      chainId: process.env.CHAIN_ID,
      explorer: process.env.NETWORK === 'sepolia' ? 'https://sepolia.etherscan.io' : 'https://etherscan.io'
    },
    features: {
      blockchain: 'Ethereum/Sepolia',
      smartContracts: true,
      qrGeneration: true,
      batchTracking: true,
      manufacturerVerification: true,
      realTimeValidation: true,
      expiredMedicineTracking: true,
      directManufacturerNotifications: true,
      verifiedOnlyBatchRegistration: true,
      ipfs: false,
      emailNotifications: process.env.SEND_EMAILS === 'true'
    },
    endpoints: {
      health: {
        method: 'GET',
        path: '/health',
        description: 'System health check with blockchain status'
      },
      manufacturer: {
        register: {
          method: 'POST',
          path: '/api/manufacturer/register',
          description: 'Register new manufacturer',
          body: ['manufacturerAddress', 'name', 'license', 'email']
        },
        prepareRegister: {
          method: 'POST',
          path: '/api/manufacturer/prepare-register',
          description: 'Prepare manufacturer registration for frontend signing',
          body: ['manufacturerAddress', 'name', 'license', 'email']
        },
        verify: {
          method: 'POST',
          path: '/api/manufacturer/verify',
          description: 'Verify manufacturer (admin only)',
          body: ['manufacturerAddress']
        },
        prepareVerify: {
          method: 'POST',
          path: '/api/manufacturer/prepare-verify',
          description: 'Prepare manufacturer verification for frontend signing',
          body: ['manufacturerAddress']
        },
        deactivate: {
          method: 'POST',
          path: '/api/manufacturer/deactivate',
          description: 'Deactivate manufacturer (admin only)',
          body: ['manufacturerAddress', 'reason?']
        },
        prepareDeactivate: {
          method: 'POST',
          path: '/api/manufacturer/prepare-deactivate',
          description: 'Prepare manufacturer deactivation for frontend signing',
          body: ['manufacturerAddress']
        },
        get: {
          method: 'GET',
          path: '/api/manufacturer/:address',
          description: 'Get manufacturer details'
        },
        list: {
          method: 'GET',
          path: '/api/manufacturer',
          description: 'List all manufacturers with pagination and filtering',
          query: ['limit?', 'offset?', 'status?']
        },
        batches: {
          method: 'GET',
          path: '/api/manufacturer/:address/batches',
          description: 'Get all batches by manufacturer'
        }
      },
      batch: {
        register: {
          method: 'POST',
          path: '/api/batch/register',
          description: 'Register new medicine batch (verified manufacturers only)',
          body: ['batchId', 'medicineName', 'manufacturingDate', 'expiryDate']
        },
        prepareRegister: {
          method: 'POST',
          path: '/api/batch/prepare-registration',
          description: 'Prepare batch registration for frontend signing',
          body: ['batchId', 'medicineName', 'manufacturingDate', 'expiryDate']
        },
        get: {
          method: 'GET',
          path: '/api/batch/:batchId',
          description: 'Get batch details'
        },
        recall: {
          method: 'POST',
          path: '/api/batch/:batchId/recall',
          description: 'Recall a batch',
          body: ['reason?', 'urgent?']
        },
        prepareRecall: {
          method: 'POST',
          path: '/api/batch/:batchId/prepare-recall',
          description: 'Prepare batch recall for frontend signing',
          body: ['reason?', 'urgent?']
        },
        qr: {
          method: 'GET',
          path: '/api/batch/:batchId/qr',
          description: 'Generate QR code for batch',
          query: ['format?', 'size?']
        },
        validate: {
          method: 'POST',
          path: '/api/batch/:batchId/validate',
          description: 'Validate batch authenticity'
        },
        history: {
          method: 'GET',
          path: '/api/batch/:batchId/history',
          description: 'Get batch history'
        }
      },
      verify: {
        batch: {
          method: 'POST',
          path: '/api/verify/:batchId',
          description: 'Comprehensive batch verification with expired scan tracking',
          body: ['scannerAddress?', 'location?']
        },
        stats: {
          method: 'GET',
          path: '/api/verify/stats/global',
          description: 'Global system statistics including expired scans'
        },
        expiredReports: {
          method: 'GET',
          path: '/api/verify/reports/expired',
          description: 'Get expired medicine reports and analytics'
        }
      }
    },
    examples: {
      batchRegistration: {
        batchId: 'BATCH-001_PARACETAMOL',
        medicineName: 'Paracetamol 500mg',
        manufacturingDate: '2024-01-15',
        expiryDate: '2026-01-15'
      },
      manufacturerRegistration: {
        manufacturerAddress: '0x1234567890123456789012345678901234567890',
        name: 'Pharma Corp Ltd',
        license: 'PH-2024-001',
        email: 'admin@pharmacorp.com'
      },
      batchVerification: {
        scannerAddress: '0x9876543210abcdef9876543210abcdef98765432',
        location: 'Mumbai Pharmacy, India'
      }
    },
    notes: {
      authentication: 'Only verified manufacturers can register batches',
      notifications: 'Direct email notifications sent to manufacturer emails for expired batches',
      tracking: 'System tracks all expired medicine scans for analytics',
      security: 'All transactions can be signed by frontend wallets for enhanced security'
    }
  });
});

// Wallet info endpoint
app.get('/api/wallet', async (req, res) => {
  try {
    const blockchainService = require('./services/blockchain');
    const balance = await blockchainService.getWalletBalance();

    res.json({
      success: true,
      wallet: {
        address: balance.address,
        balance: balance.balance,
        balanceEth: balance.balanceEth,
        currency: balance.currency,
        network: process.env.NETWORK,
        chainId: process.env.CHAIN_ID
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled server error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Don't leak sensitive information in production
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(err.status || 500).json({
    success: false,
    error: message,
    type: 'server_error',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    })
  });
});

// 404 handler with helpful information (Express v5-safe)
app.all('/{*splat}', (req, res) => {
  // If this is an API path, respond with structured API 404
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      error: 'Route not found',
      message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
      availableRoutes: {
        health: 'GET /health',
        documentation: 'GET /api',
        wallet: 'GET /api/wallet',
        manufacturer: 'POST|GET /api/manufacturer/*',
        batch: 'POST|GET /api/batch/*',
        verify: 'POST|GET /api/verify/*'
      },
      timestamp: new Date().toISOString()
    });
  }

  // Non-API fallback (if serving SPA, you can send index.html here)
  return res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

  setTimeout(() => {
    console.log('❌ Forceful shutdown due to timeout');
    process.exit(1);
  }, 10000);

  // Close server and cleanup
  console.log('✅ MedChain API server shutdown complete');
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server (Updated startup message)
const server = app.listen(PORT, () => {
  console.log('\n🚀 MedChain Backend Server Started Successfully!');
  console.log('================================================');
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⛓️ Network: ${process.env.NETWORK} (Chain ID: ${process.env.CHAIN_ID})`);
  console.log(`🏠 Contract: ${process.env.CONTRACT_ADDRESS}`);
  console.log(`📧 Email notifications: ${process.env.SEND_EMAILS === 'true' ? 'Enabled' : 'Disabled'}`);
  console.log(`💾 IPFS: Disabled (Direct blockchain storage)`);
  console.log(`📊 Expired tracking: Enabled`);
  console.log(`✅ Verified-only batch registration: Enabled`);
  console.log('================================================');
  console.log('\n📚 Available endpoints:');
  console.log(`   Health check: GET http://localhost:${PORT}/health`);
  console.log(`   Documentation: GET http://localhost:${PORT}/api`);
  console.log(`   Manufacturer: POST http://localhost:${PORT}/api/manufacturer/register`);
  console.log(`   Batch: POST http://localhost:${PORT}/api/batch/register`);
  console.log(`   Verify: POST http://localhost:${PORT}/api/verify/:batchId`);
  console.log(`   Expired Reports: GET http://localhost:${PORT}/api/verify/reports/expired`);
  console.log('\n✅ Ready to process requests...\n');
});

module.exports = app;
