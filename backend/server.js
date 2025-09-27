const express = require('express');
const cors = require('cors');
const { createPublicClient, http } = require('viem');
const { sepolia, mainnet } = require('viem/chains');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure blockchain client
const chainId = Number(process.env.CHAIN_ID || 11155111);
const chains = chainId === sepolia.id ? [sepolia] : [mainnet];
const chain = chains[0];

const publicClient = createPublicClient({
  chain,
  transport: http(process.env.RPC_URL || `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`)
});

// Contract ABI for MedChain
const medChainABI = [
  {
    "inputs": [],
    "name": "admin",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalBatches",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalManufacturers",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalRecalledBatches",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalExpiredScans",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "manufacturers",
    "outputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "license", "type": "string"},
      {"internalType": "string", "name": "email", "type": "string"},
      {"internalType": "address", "name": "wallet", "type": "address"},
      {"internalType": "bool", "name": "isVerified", "type": "bool"},
      {"internalType": "bool", "name": "isActive", "type": "bool"},
      {"internalType": "uint256", "name": "registeredAt", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "manufacturerAddresses",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "manufacturerBatches",
    "outputs": [{"internalType": "string[]", "name": "", "type": "string[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "", "type": "string"}],
    "name": "batches",
    "outputs": [
      {"internalType": "string", "name": "batchId", "type": "string"},
      {"internalType": "string", "name": "medicineName", "type": "string"},
      {"internalType": "address", "name": "manufacturer", "type": "address"},
      {"internalType": "uint256", "name": "expiryDate", "type": "uint256"},
      {"internalType": "uint256", "name": "registeredAt", "type": "uint256"},
      {"internalType": "bool", "name": "isRecalled", "type": "bool"},
      {"internalType": "uint256", "name": "scanCount", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "expiredBatchIds",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "isManufacturer",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "", "type": "string"}],
    "name": "batchExists",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// Contract addresses (you'll need to deploy and update these)
const MEDCHAIN_CONTRACT = process.env.MEDCHAIN_CONTRACT || '0x0000000000000000000000000000000000000000';

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get global statistics
app.get('/api/verify/stats/global', async (req, res) => {
  try {
    if (MEDCHAIN_CONTRACT === '0x0000000000000000000000000000000000000000') {
      return res.status(503).json({ 
        error: 'Contract not deployed', 
        message: 'MedChain contract address not configured' 
      });
    }

    const [admin, totalBatches, totalManufacturers, totalRecalledBatches, totalExpiredScans] = await Promise.all([
      publicClient.readContract({
        address: MEDCHAIN_CONTRACT,
        abi: medChainABI,
        functionName: 'admin'
      }),
      publicClient.readContract({
        address: MEDCHAIN_CONTRACT,
        abi: medChainABI,
        functionName: 'totalBatches'
      }),
      publicClient.readContract({
        address: MEDCHAIN_CONTRACT,
        abi: medChainABI,
        functionName: 'totalManufacturers'
      }),
      publicClient.readContract({
        address: MEDCHAIN_CONTRACT,
        abi: medChainABI,
        functionName: 'totalRecalledBatches'
      }),
      publicClient.readContract({
        address: MEDCHAIN_CONTRACT,
        abi: medChainABI,
        functionName: 'totalExpiredScans'
      })
    ]);

    res.json({
      stats: {
        adminAddress: admin,
        totalBatches: Number(totalBatches),
        totalManufacturers: Number(totalManufacturers),
        totalRecalledBatches: Number(totalRecalledBatches),
        totalExpiredScans: Number(totalExpiredScans),
        network: chain.name,
        chainId: chain.id.toString()
      }
    });
  } catch (error) {
    console.error('Error fetching global stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch stats', 
      message: error.message 
    });
  }
});

// Get manufacturer details
app.get('/api/manufacturer/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (MEDCHAIN_CONTRACT === '0x0000000000000000000000000000000000000000') {
      return res.status(503).json({ 
        error: 'Contract not deployed', 
        message: 'MedChain contract address not configured' 
      });
    }

    const manufacturer = await publicClient.readContract({
      address: MEDCHAIN_CONTRACT,
      abi: medChainABI,
      functionName: 'manufacturers',
      args: [address]
    });

    if (!manufacturer.name) {
      return res.status(404).json({ 
        error: 'Manufacturer not found' 
      });
    }

    res.json({
      data: {
        manufacturer: {
          name: manufacturer.name,
          license: manufacturer.license,
          email: manufacturer.email,
          wallet: manufacturer.wallet,
          isVerified: manufacturer.isVerified,
          isActive: manufacturer.isActive,
          registeredAt: Number(manufacturer.registeredAt)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching manufacturer:', error);
    res.status(500).json({ 
      error: 'Failed to fetch manufacturer', 
      message: error.message 
    });
  }
});

// Get manufacturer list
app.get('/api/manufacturer', async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;
    
    if (MEDCHAIN_CONTRACT === '0x0000000000000000000000000000000000000000') {
      return res.status(503).json({ 
        error: 'Contract not deployed', 
        message: 'MedChain contract address not configured' 
      });
    }

    // Get total manufacturers count
    const totalManufacturers = await publicClient.readContract({
      address: MEDCHAIN_CONTRACT,
      abi: medChainABI,
      functionName: 'totalManufacturers'
    });

    const manufacturers = [];
    const totalCount = Number(totalManufacturers);
    const startIndex = Number(offset);
    const endIndex = Math.min(startIndex + Number(limit), totalCount);

    // Fetch manufacturers
    for (let i = startIndex; i < endIndex; i++) {
      try {
        const address = await publicClient.readContract({
          address: MEDCHAIN_CONTRACT,
          abi: medChainABI,
          functionName: 'manufacturerAddresses',
          args: [BigInt(i)]
        });

        const manufacturer = await publicClient.readContract({
          address: MEDCHAIN_CONTRACT,
          abi: medChainABI,
          functionName: 'manufacturers',
          args: [address]
        });

        if (manufacturer.name) {
          const manufacturerData = {
            name: manufacturer.name,
            license: manufacturer.license,
            email: manufacturer.email,
            wallet: manufacturer.wallet,
            isVerified: manufacturer.isVerified,
            isActive: manufacturer.isActive,
            registeredAt: Number(manufacturer.registeredAt)
          };

          // Filter by status if specified
          if (!status || status === 'all' || 
              (status === 'verified' && manufacturerData.isVerified) ||
              (status === 'unverified' && !manufacturerData.isVerified)) {
            manufacturers.push(manufacturerData);
          }
        }
      } catch (error) {
        console.warn(`Error fetching manufacturer at index ${i}:`, error.message);
      }
    }

    res.json({
      data: {
        manufacturers,
        total: totalCount,
        limit: Number(limit),
        offset: Number(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching manufacturer list:', error);
    res.status(500).json({ 
      error: 'Failed to fetch manufacturer list', 
      message: error.message 
    });
  }
});

// Get expired reports
app.get('/api/verify/reports/expired', async (req, res) => {
  try {
    if (MEDCHAIN_CONTRACT === '0x0000000000000000000000000000000000000000') {
      return res.status(503).json({ 
        error: 'Contract not deployed', 
        message: 'MedChain contract address not configured' 
      });
    }

    // For now, return empty array since we need to implement expired batch tracking
    res.json({
      data: {
        reports: []
      }
    });
  } catch (error) {
    console.error('Error fetching expired reports:', error);
    res.status(500).json({ 
      error: 'Failed to fetch expired reports', 
      message: error.message 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: error.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MedChain Backend Server running on port ${PORT}`);
  console.log(`📡 Connected to ${chain.name} (Chain ID: ${chain.id})`);
  console.log(`📋 Contract: ${MEDCHAIN_CONTRACT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
