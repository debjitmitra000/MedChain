const { getNetworkConfig } = require('./utils/networks');

async function testFilecoinConnection() {
  console.log('Testing Filecoin Calibration network connection...');

  const filecoinConfig = getNetworkConfig('filecoin');
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

async function runNetworkTests() {
  console.log('=== Network Connectivity Tests ===\n');

  const filecoinOk = await testFilecoinConnection();

  console.log('\n=== Test Results ===');
  console.log(`Filecoin Calibration: ${filecoinOk ? '✅ Connected' : '❌ Failed'}`);

  if (filecoinOk) {
    console.log('\n🎉 Filecoin Calibration is accessible!');
  } else {
    console.log('\n⚠️  Filecoin Calibration connectivity failed.');
  }
}

// Run tests if called directly
runNetworkTests().catch(console.error);

module.exports = { testFilecoinConnection, runNetworkTests };