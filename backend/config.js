// backend/config.js
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const requiredEnvs = ['NETWORK','CHAIN_ID','PRIVATE_KEY','CONTRACT_ADDRESS','SEPOLIA_RPC_URL'];
const missing = requiredEnvs.filter(k => !process.env[k]);
if (missing.length > 0) {
  console.error('❌ Missing required environment variables:', missing);
  process.exit(1);
}

console.log(`🌐 Network: ${process.env.NETWORK}`);
console.log(`⛓️ Chain ID: ${process.env.CHAIN_ID}`);
console.log(`🏠 Contract: ${process.env.CONTRACT_ADDRESS}`);

// Providers
function createProvider(rpcUrl) {
  const p = new ethers.JsonRpcProvider(rpcUrl);
  p.getNetwork().catch(e => console.error('❌ Provider connection test failed:', e.message));
  return p;
}
const readProvider = createProvider(process.env.SEPOLIA_RPC_URL);
const signerProvider = readProvider;

// Default signer wallet (server-signer mode for dev/ops)
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, signerProvider);
console.log(`👛 Wallet Address: ${wallet.address}`);

// Load ABIs
let MEDCHAIN_ABI = [];
let REGISTRY_ABI = [];
try {
  const medchainAbiPath = path.join(__dirname, 'contracts', 'MedChain.json');
  const registryAbiPath = path.join(__dirname, 'contracts', 'ManufacturerRegistry.json');
  if (fs.existsSync(medchainAbiPath)) {
    const medchainJson = JSON.parse(fs.readFileSync(medchainAbiPath, 'utf8'));
    MEDCHAIN_ABI = medchainJson.abi || medchainJson;
    console.log('✅ MedChain ABI loaded successfully');
  } else {
    console.warn('⚠️ MedChain.json not found');
  }
  if (fs.existsSync(registryAbiPath)) {
    const registryJson = JSON.parse(fs.readFileSync(registryAbiPath, 'utf8'));
    REGISTRY_ABI = registryJson.abi || registryJson;
    console.log('✅ Registry ABI loaded successfully');
  } else {
    console.warn('⚠️ ManufacturerRegistry.json not found');
  }
} catch (error) {
  console.error('❌ Failed to load contract ABIs:', error.message);
}

// Read-only contract instances
let medChainRead = null;
let registryRead = null;

if (MEDCHAIN_ABI.length > 0 && process.env.CONTRACT_ADDRESS) {
  try {
    medChainRead = new ethers.Contract(process.env.CONTRACT_ADDRESS, MEDCHAIN_ABI, readProvider);
    console.log('✅ MedChain read-only contract initialized');
  } catch (error) {
    console.error('❌ Failed to init MedChain read contract:', error.message);
  }
} else {
  console.warn('⚠️ MedChain read contract not available');
}

if (REGISTRY_ABI.length > 0 && process.env.REGISTRY_CONTRACT_ADDRESS) {
  try {
    registryRead = new ethers.Contract(process.env.REGISTRY_CONTRACT_ADDRESS, REGISTRY_ABI, readProvider);
    console.log('✅ Registry read-only contract initialized');
  } catch (error) {
    console.error('❌ Failed to init Registry read contract:', error.message);
  }
} else {
  console.warn('⚠️ Registry contract not available');
}

// Network configuration
const networkConfig = {
  chainId: parseInt(process.env.CHAIN_ID, 10),
  name: process.env.NETWORK === 'sepolia' ? 'Sepolia Testnet' : 'Ethereum Mainnet',
  currency: 'ETH',
  explorerUrl: process.env.NETWORK === 'sepolia' ? 'https://sepolia.etherscan.io' : 'https://etherscan.io',
  isTestnet: process.env.NETWORK === 'sepolia'
};

// Gas settings
const gasSettings = {
  gasLimit: 500000,
  gasPrice: ethers.parseUnits('20', 'gwei'),
  maxFeePerGas: ethers.parseUnits('30', 'gwei'),
  maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei')
};

// Startup checks
(async () => {
  try {
    const balanceWei = await readProvider.getBalance(wallet.address);
    const balanceETH = ethers.formatEther(balanceWei);
    console.log(`💰 Wallet Balance: ${balanceETH} ETH`);
    if (balanceWei === 0n) console.warn('⚠️ Wallet has zero balance - writes will fail');
  } catch (error) {
    console.warn('⚠️ Wallet balance check failed:', error.message);
  }
  if (medChainRead) {
    try {
      ['getContractStats','registerMedicineBatch','verifyBatch'].forEach(fn => {
        if (typeof medChainRead[fn] !== 'function') {
          console.warn(`⚠️ Contract at ${process.env.CONTRACT_ADDRESS} missing function: ${fn}`);
        }
      });
    } catch (e) {
      console.warn('⚠️ Contract function check failed:', e.message);
    }
  }
})();

module.exports = {
  readProvider,
  signerProvider,
  wallet,
  MEDCHAIN_ABI,
  REGISTRY_ABI,
  medChainRead,
  registryRead,
  networkConfig,
  gasSettings
};
