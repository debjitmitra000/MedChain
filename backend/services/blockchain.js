// backend/services/blockchain.js
const { ethers } = require('ethers');
const moment = require('moment');
const {
  readProvider,
  signerProvider,
  wallet,
  MEDCHAIN_ABI,
  REGISTRY_ABI,
  medChainRead,
  registryRead,
  networkConfig,
  gasSettings
} = require('../config');

const DEV_ALLOW_SERVER_WRITES = String(process.env.DEV_ALLOW_SERVER_WRITES || 'false') === 'true';

class BlockchainService {
  constructor() {
    this.initialized = false;
    this.medChainRead = medChainRead;
    this.registryRead = registryRead;
    console.log('🔗 Blockchain Service initializing...');
    this.initializeContracts();
  }

  initializeContracts() {
    try {
      if (this.medChainRead) {
        console.log('✅ MedChain read contract connected');
      } else {
        console.warn('⚠️ MedChain read contract not available');
      }
      if (this.registryRead) {
        console.log('✅ Registry read contract connected');
      } else {
        console.warn('⚠️ Registry read contract not available');
      }
      this.initialized = true;
      console.log('✅ Blockchain Service initialized');
    } catch (error) {
      console.error('❌ Contract initialization failed:', error.message);
      throw error;
    }
  }

  ensureReady() {
    if (!this.initialized) throw new Error('Blockchain service not initialized');
    if (!this.medChainRead) throw new Error('MedChain contract not available. Check ABI/address.');
  }

  // FIXED: Improved balance fetching with error handling
  async getWalletBalance(address = null) {
    try {
      const addr = address || wallet.address;
      const balance = await readProvider.getBalance(addr);
      const balanceEth = ethers.formatEther(balance);
      console.log(`💰 Balance for ${addr}: ${balanceEth} ETH`);
      return {
        address: addr,
        balance: balance.toString(),
        balanceEth: parseFloat(balanceEth).toFixed(6),
        currency: networkConfig.currency
      };
    } catch (error) {
      console.error('❌ Failed to get wallet balance:', error.message);
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  // FIXED: Consistent contract stats handling
  async getContractStats() {
    this.ensureReady();
    try {
      console.log('📊 Fetching contract statistics...');
      const stats = await this.medChainRead.getContractStats();
      
      // Handle both tuple and object returns consistently
      const totalBatches = parseInt(stats[0]?.toString() || stats._totalBatches?.toString() || '0');
      const totalManufacturers = parseInt(stats[1]?.toString() || stats._totalManufacturers?.toString() || '0');
      const totalRecalled = parseInt(stats[2]?.toString() || stats._totalRecalledBatches?.toString() || '0');
      const totalExpiredScans = parseInt(stats[3]?.toString() || stats._totalExpiredScans?.toString() || '0');
      const adminAddress = stats[4] || stats._admin || stats.adminAddress;

      const activeBatches = totalBatches - totalRecalled;
      const recallRate = totalBatches > 0 ? ((totalRecalled / totalBatches) * 100).toFixed(2) : '0.00';

      const formatted = {
        totalBatches,
        totalManufacturers,
        totalRecalledBatches: totalRecalled,
        totalExpiredScans,
        activeBatches,
        recallRate,
        adminAddress,
        networkName: networkConfig.name,
        chainId: networkConfig.chainId
      };
      
      console.log(`✅ Stats: ${totalBatches} batches, ${totalManufacturers} manufacturers, ${totalExpiredScans} expired scans`);
      return formatted;
    } catch (error) {
      console.error('❌ Failed to get contract stats:', error.message);
      throw new Error(`Failed to fetch stats: ${this.parseError(error)}`);
    }
  }

  // FIXED: Consistent manufacturer data access
  async getManufacturer(manufacturerAddress) {
    this.ensureReady();
    try {
      console.log(`🔍 Fetching manufacturer: ${manufacturerAddress}`);
      const m = await this.medChainRead.getManufacturer(manufacturerAddress);
      
      // Handle both tuple and struct returns consistently
      const registeredAt = (m[6] || m.registeredAt || 0).toString();
      
      const formatted = {
        wallet: m[0] || m.wallet,
        name: m[1] || m.name,
        license: m[2] || m.license,
        email: m[3] || m.email, // Fixed: now uses email field
        isVerified: m[4] !== undefined ? m[4] : m.isVerified,
        isActive: m[5] !== undefined ? m[5] : m.isActive,
        registeredAt,
        registeredDate: registeredAt !== '0' ? 
          moment.unix(parseInt(registeredAt)).format('DD/MM/YYYY HH:mm:ss') : 'Unknown',
        status: this.getManufacturerStatus(
          m[5] !== undefined ? m[5] : m.isActive, 
          m[4] !== undefined ? m[4] : m.isVerified
        )
      };
      
      console.log(`✅ Manufacturer data: ${formatted.name} (${formatted.email})`);
      return formatted;
    } catch (error) {
      console.error('❌ Failed to get manufacturer:', error.message);
      throw new Error(`Manufacturer not registered: ${this.parseError(error)}`);
    }
  }

  // FIXED: Improved manufacturer enumeration with proper fallbacks
  async getAllManufacturers() {
    this.ensureReady();
    try {
      console.log('📋 Fetching all manufacturers from blockchain...');
      
      // Try contract enumeration first (if updated contract is deployed)
      try {
        return await this.getAllManufacturersFromContract();
      } catch (contractError) {
        console.warn('⚠️ Contract enumeration failed, trying events method:', contractError.message);
        
        // Fallback to events method
        try {
          return await this.getAllManufacturersFromEvents();
        } catch (eventsError) {
          console.warn('⚠️ Events method failed, using fallback:', eventsError.message);
          return await this.getAllManufacturersFallback();
        }
      }
    } catch (error) {
      console.error('❌ Failed to get all manufacturers:', error.message);
      throw new Error(`Failed to fetch manufacturers: ${this.parseError(error)}`);
    }
  }

  async getAllManufacturersFromContract() {
    console.log('🔧 Using contract enumeration method...');
    try {
      // This will work once the updated contract is deployed
      const addresses = await this.medChainRead.getAllManufacturerAddresses();
      console.log(`🏭 Found ${addresses.length} manufacturer addresses`);
      
      const manufacturers = [];
      for (const addr of addresses) {
        try {
          const manufacturer = await this.getManufacturer(addr);
          manufacturers.push(manufacturer);
        } catch (e) {
          console.warn(`⚠️ Failed to get details for manufacturer ${addr}:`, e.message);
        }
      }
      
      // Sort by registration date (newest first)
      manufacturers.sort((a, b) => parseInt(b.registeredAt) - parseInt(a.registeredAt));
      console.log(`✅ Retrieved ${manufacturers.length} manufacturers`);
      return manufacturers;
    } catch (error) {
      throw new Error(`Contract enumeration failed: ${error.message}`);
    }
  }

  async getAllManufacturersFromEvents() {
    console.log('📊 Querying ManufacturerRegistered events...');
    try {
      const currentBlock = await readProvider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 50000); // Increased range
      
      let filter;
      try {
        filter = this.medChainRead.filters.ManufacturerRegistered();
      } catch {
        // Fallback for older ethers versions
        filter = {
          address: this.medChainRead.address,
          topics: [ethers.id("ManufacturerRegistered(address,string,string,uint256)")]
        };
      }
      
      const events = await this.medChainRead.queryFilter(filter, fromBlock, 'latest');
      console.log(`📊 Found ${events.length} registration events`);
      
      // Extract unique addresses
      const addresses = [...new Set(events.map(e => {
        if (e.args && e.args.manufacturer) return e.args.manufacturer;
        if (e.args && e.args[0]) return e.args[0];
        return null;
      }).filter(Boolean))];
      
      console.log(`👥 Unique manufacturers: ${addresses.length}`);
      
      const manufacturers = [];
      for (const addr of addresses) {
        try {
          const manufacturer = await this.getManufacturer(addr);
          manufacturers.push(manufacturer);
        } catch (e) {
          console.warn(`⚠️ Failed to load manufacturer ${addr}:`, e.message);
        }
      }
      
      manufacturers.sort((a, b) => parseInt(b.registeredAt) - parseInt(a.registeredAt));
      console.log(`✅ Retrieved ${manufacturers.length} manufacturers from events`);
      return manufacturers;
    } catch (error) {
      throw new Error(`Events method failed: ${error.message}`);
    }
  }

  async getAllManufacturersFallback() {
    console.log('⚠️ Using fallback method - limited data available');
    try {
      const stats = await this.getContractStats();
      const total = stats.totalManufacturers;
      
      return [{
        wallet: 'enumeration_not_available',
        name: `${total} manufacturers registered`,
        license: 'Use specific address lookup',
        email: 'admin@system.local',
        isVerified: false,
        isActive: true,
        registeredAt: '0',
        registeredDate: 'Unknown',
        status: 'enumeration_limited',
        note: 'Complete list unavailable. Deploy updated contract for full enumeration.'
      }];
    } catch (error) {
      throw new Error(`Fallback failed: ${error.message}`);
    }
  }

  getManufacturerStatus(isActive, isVerified) {
    if (isActive && isVerified) return 'active_verified';
    if (isActive && !isVerified) return 'active_unverified';
    if (!isActive && isVerified) return 'inactive_verified';
    return 'inactive_unverified';
  }

  // FIXED: Consistent batch data handling
  async verifyBatch(batchId) {
    this.ensureReady();
    try {
      console.log(`🔍 Verifying batch: ${batchId}`);
      const b = await this.medChainRead.verifyBatch(batchId);
      
      // Handle both tuple and struct returns consistently
      const manufacturingDate = (b[3] || b.manufacturingDate || 0).toString();
      const expiryDate = (b[4] || b.expiryDate || 0).toString();
      const createdAt = (b[7] || b.createdAt || 0).toString();
      const expiredScanCount = parseInt((b[8] || b.expiredScanCount || 0).toString());

      const formatted = {
        batchId: b[0] || b.batchId,
        medicineName: b[1] || b.medicineName,
        manufacturer: b[2] || b.manufacturer,
        manufacturingDate,
        expiryDate,
        isActive: b[5] !== undefined ? b[5] : b.isActive,
        isRecalled: b[6] !== undefined ? b[6] : b.isRecalled,
        createdAt,
        expiredScanCount,
        manufacturingDateFormatted: manufacturingDate !== '0' ? 
          moment.unix(parseInt(manufacturingDate)).format('DD/MM/YYYY') : 'Unknown',
        expiryDateFormatted: expiryDate !== '0' ? 
          moment.unix(parseInt(expiryDate)).format('DD/MM/YYYY') : 'Unknown',
        createdAtFormatted: createdAt !== '0' ? 
          moment.unix(parseInt(createdAt)).format('DD/MM/YYYY HH:mm:ss') : 'Unknown'
      };
      
      console.log(`✅ Batch verified: ${formatted.medicineName} (Expired scans: ${expiredScanCount})`);
      return formatted;
    } catch (error) {
      console.error('❌ Batch verification failed:', error.message);
      throw new Error(`Batch not found: ${this.parseError(error)}`);
    }
  }

  // FIXED: Improved expired reports handling
  async getExpiredMedicineReports() {
    this.ensureReady();
    try {
      console.log('📊 Fetching expired medicine reports...');
      const reports = await this.medChainRead.getExpiredMedicineReports();
      
      const formatted = reports.map(report => ({
        batchId: report[0] || report.batchId,
        medicineName: report[1] || report.medicineName,
        manufacturer: report[2] || report.manufacturer,
        expiredScanCount: parseInt((report[3] || report.expiredScanCount || 0).toString()),
        lastScannedAt: (report[4] || report.lastScannedAt || 0).toString(),
        lastScannedAtFormatted: (report[4] || report.lastScannedAt || 0).toString() !== '0' ? 
          moment.unix(parseInt((report[4] || report.lastScannedAt).toString())).format('DD/MM/YYYY HH:mm:ss') : 'Unknown'
      }));
      
      console.log(`✅ Retrieved ${formatted.length} expired medicine reports`);
      return formatted.sort((a, b) => b.expiredScanCount - a.expiredScanCount);
    } catch (error) {
      console.error('❌ Failed to get expired medicine reports:', error.message);
      throw new Error(`Failed to fetch expired reports: ${this.parseError(error)}`);
    }
  }

  // FIXED: Record expired scan with proper validation
  async recordExpiredScan(batchId) {
    this.ensureReady();
    try {
      console.log(`📊 Recording expired scan for batch: ${batchId}`);
      if (DEV_ALLOW_SERVER_WRITES) {
        return await this.serverWrite('recordExpiredScan', [batchId]);
      } else {
        throw new Error('Server writes disabled - use frontend signer');
      }
    } catch (error) {
      console.error('❌ Failed to record expired scan:', error.message);
      throw new Error(`Failed to record expired scan: ${this.parseError(error)}`);
    }
  }

  // Existing methods with consistent error handling
  async isBatchExpired(batchId) {
    this.ensureReady();
    try {
      const result = await this.medChainRead.isBatchExpired(batchId);
      console.log(`🕐 Batch ${batchId} expired: ${result}`);
      return result;
    } catch (error) {
      console.error('❌ Expiry check failed:', error.message);
      throw new Error(`Failed to check expiry: ${this.parseError(error)}`);
    }
  }

  async isBatchValid(batchId) {
    this.ensureReady();
    try {
      const result = await this.medChainRead.isBatchValid(batchId);
      console.log(`✅ Batch ${batchId} valid: ${result}`);
      return result;
    } catch (error) {
      console.error('❌ Validity check failed:', error.message);
      throw new Error(`Failed to check validity: ${this.parseError(error)}`);
    }
  }

  async getManufacturerBatches(manufacturerAddress) {
    this.ensureReady();
    try {
      console.log(`📋 Fetching batches for manufacturer: ${manufacturerAddress}`);
      const batches = await this.medChainRead.getBatchesByManufacturer(manufacturerAddress);
      
      const formatted = batches.map(b => {
        const manufacturingDate = (b[3] || b.manufacturingDate || 0).toString();
        const expiryDate = (b[4] || b.expiryDate || 0).toString();
        const createdAt = (b[7] || b.createdAt || 0).toString();
        const expiredScanCount = parseInt((b[8] || b.expiredScanCount || 0).toString());
        
        return {
          batchId: b[0] || b.batchId,
          medicineName: b[1] || b.medicineName,
          manufacturer: b[2] || b.manufacturer,
          manufacturingDate,
          expiryDate,
          isActive: b[5] !== undefined ? b[5] : b.isActive,
          isRecalled: b[6] !== undefined ? b[6] : b.isRecalled,
          createdAt,
          expiredScanCount,
          manufacturingDateFormatted: manufacturingDate !== '0' ? 
            moment.unix(parseInt(manufacturingDate)).format('DD/MM/YYYY') : 'Unknown',
          expiryDateFormatted: expiryDate !== '0' ? 
            moment.unix(parseInt(expiryDate)).format('DD/MM/YYYY') : 'Unknown',
          createdAtFormatted: createdAt !== '0' ? 
            moment.unix(parseInt(createdAt)).format('DD/MM/YYYY HH:mm:ss') : 'Unknown'
        };
      });
      
      console.log(`✅ Found ${formatted.length} batches`);
      return formatted;
    } catch (error) {
      console.error('❌ Failed to get manufacturer batches:', error.message);
      throw new Error(`Failed to fetch batches: ${this.parseError(error)}`);
    }
  }

  // Transaction preparation methods (unchanged but with consistent structure)
  prepareRegisterManufacturer(manufacturerAddress, name, license, email = '') {
    this.ensureReady();
    return {
      contractAddress: process.env.CONTRACT_ADDRESS,
      abi: MEDCHAIN_ABI,
      method: 'registerManufacturer',
      args: [manufacturerAddress, name, license, email]
    };
  }

  prepareVerifyManufacturer(manufacturerAddress) {
    this.ensureReady();
    return {
      contractAddress: process.env.CONTRACT_ADDRESS,
      abi: MEDCHAIN_ABI,
      method: 'verifyManufacturer',
      args: [manufacturerAddress]
    };
  }

  prepareDeactivateManufacturer(manufacturerAddress) {
    this.ensureReady();
    return {
      contractAddress: process.env.CONTRACT_ADDRESS,
      abi: MEDCHAIN_ABI,
      method: 'deactivateManufacturer',
      args: [manufacturerAddress]
    };
  }

  prepareRegisterBatch(batchId, medicineName, manufacturingDate, expiryDate) {
    this.ensureReady();
    return {
      contractAddress: process.env.CONTRACT_ADDRESS,
      abi: MEDCHAIN_ABI,
      method: 'registerMedicineBatch',
      args: [batchId, medicineName, manufacturingDate, expiryDate]
    };
  }

  prepareMarkBatchRecalled(batchId) {
    this.ensureReady();
    return {
      contractAddress: process.env.CONTRACT_ADDRESS,
      abi: MEDCHAIN_ABI,
      method: 'markBatchRecalled',
      args: [batchId]
    };
  }

  prepareRecordExpiredScan(batchId) {
    this.ensureReady();
    return {
      contractAddress: process.env.CONTRACT_ADDRESS,
      abi: MEDCHAIN_ABI,
      method: 'recordExpiredScan',
      args: [batchId]
    };
  }

  // DEV-ONLY SERVER WRITES (with improved error handling)
  async devRegisterManufacturer(...args) {
    if (!DEV_ALLOW_SERVER_WRITES) throw new Error('Server writes disabled - set DEV_ALLOW_SERVER_WRITES=true');
    return await this.serverWrite('registerManufacturer', args);
  }

  async devVerifyManufacturer(...args) {
    if (!DEV_ALLOW_SERVER_WRITES) throw new Error('Server writes disabled - set DEV_ALLOW_SERVER_WRITES=true');
    return await this.serverWrite('verifyManufacturer', args);
  }

  async devDeactivateManufacturer(...args) {
    if (!DEV_ALLOW_SERVER_WRITES) throw new Error('Server writes disabled - set DEV_ALLOW_SERVER_WRITES=true');
    return await this.serverWrite('deactivateManufacturer', args);
  }

  async devRegisterBatch(...args) {
    if (!DEV_ALLOW_SERVER_WRITES) throw new Error('Server writes disabled - set DEV_ALLOW_SERVER_WRITES=true');
    return await this.serverWrite('registerMedicineBatch', args);
  }

  async devMarkBatchRecalled(...args) {
    if (!DEV_ALLOW_SERVER_WRITES) throw new Error('Server writes disabled - set DEV_ALLOW_SERVER_WRITES=true');
    return await this.serverWrite('markBatchRecalled', args);
  }

  // FIXED: Improved server write with better gas estimation and error handling
  async serverWrite(method, args) {
    this.ensureReady();
    const writeContract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS, 
      MEDCHAIN_ABI, 
      wallet.connect(signerProvider)
    );
    
    try {
      console.log(`📝 Server write ${method} with args:`, args);
      
      // Improved gas estimation
      let gasLimit;
      try {
        const estimatedGas = await writeContract[method].estimateGas(...args);
        gasLimit = (estimatedGas * 130n) / 100n; // 30% buffer
        console.log(`⛽ Estimated gas: ${estimatedGas}, using: ${gasLimit}`);
      } catch (gasError) {
        console.warn(`⚠️ Gas estimation failed: ${gasError.message}, using default`);
        gasLimit = BigInt(gasSettings.gasLimit);
      }
      
      const tx = await writeContract[method](...args, {
        gasLimit,
        gasPrice: gasSettings.gasPrice
      });
      
      console.log(`⏳ Transaction submitted: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`✅ Transaction mined in block ${receipt.blockNumber}`);
      
      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString() || '0',
        explorerUrl: `${networkConfig.explorerUrl}/tx/${tx.hash}`
      };
    } catch (error) {
      console.error(`❌ Server write ${method} failed:`, error.message);
      throw new Error(this.parseError(error));
    }
  }

  // FIXED: Enhanced error parsing
  parseError(error) {
    if (!error) return 'Unknown error';
    
    // Handle different error types
    if (error.reason) return error.reason;
    if (error.shortMessage) return error.shortMessage;
    if (error.data?.message) return error.data.message;
    
    if (typeof error.message === 'string') {
      const message = error.message;
      
      // Extract revert reason
      const revertMatch = message.match(/revert (.+?)(?:\s|$|"|')/);
      if (revertMatch) return revertMatch[1];
      
      // Handle common error patterns
      if (message.includes('Manufacturer not registered')) return 'Manufacturer not registered';
      if (message.includes('Batch not found')) return 'Batch not found';
      if (message.includes('Already verified')) return 'Already verified';
      if (message.includes('insufficient funds')) return 'Insufficient funds for gas';
      if (message.includes('nonce too low')) return 'Transaction nonce error';
      if (message.includes('replacement transaction')) return 'Transaction replacement issue';
      if (message.includes('already known')) return 'Transaction already submitted';
      if (message.includes('underpriced')) return 'Gas price too low';
      if (message.includes('network')) return 'Network connection error';
      if (message.includes('timeout')) return 'Transaction timeout';
      
      return message;
    }
    
    return 'Unknown blockchain error';
  }
}

module.exports = new BlockchainService();
