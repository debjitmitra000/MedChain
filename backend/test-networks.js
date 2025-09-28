import { getNetworkConfig } from './utils/networks.js';

async function testFilecoinConnection() {
  console.log('Testing Filecoin Calibration network connection...');
  
  const filecoinConfig = getNetworkConfig('filecoinCalibration');
  console.log('Network config:', filecoinConfig);
  
  try {
    const response = await fetch(filecoinConfig.rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'Filecoin.ChainHead',
        params: [],
        id: 1
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Filecoin connection successful!');
    console.log('Latest block height:', data.result?.Height || 'Unknown');
    
    return true;
  } catch (error) {
    console.error('❌ Filecoin connection failed:', error.message);
    return false;
  }
}

async function testSepoliaConnection() {
  console.log('\nTesting Sepolia network connection...');
  
  const sepoliaConfig = getNetworkConfig('sepolia');
  console.log('Network config:', sepoliaConfig);
  
  try {
    const response = await fetch(sepoliaConfig.rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Sepolia connection successful!');
    console.log('Latest block number:', parseInt(data.result, 16));
    
    return true;
  } catch (error) {
    console.error('❌ Sepolia connection failed:', error.message);
    return false;
  }
}

async function runNetworkTests() {
  console.log('=== Network Connectivity Tests ===\n');
  
  const filecoinOk = await testFilecoinConnection();
  const sepoliaOk = await testSepoliaConnection();
  
  console.log('\n=== Test Results ===');
  console.log(`Filecoin Calibration: ${filecoinOk ? '✅ Connected' : '❌ Failed'}`);
  console.log(`Sepolia Testnet: ${sepoliaOk ? '✅ Connected' : '❌ Failed'}`);
  
  if (filecoinOk && sepoliaOk) {
    console.log('\n🎉 All networks are accessible!');
  } else {
    console.log('\n⚠️  Some networks have connectivity issues.');
  }
}

// Run tests if called directly
runNetworkTests().catch(console.error);

export { testFilecoinConnection, testSepoliaConnection, runNetworkTests };