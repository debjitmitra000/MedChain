import React, { useState, useEffect } from 'react';
import { NETWORKS, getNetworkByChainId, switchToNetwork } from '../utils/networks';

function NetworkSelector() {
  const [currentNetwork, setCurrentNetwork] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get current network on component mount
    getCurrentNetwork();
    
    // Listen for network changes
    if (window.ethereum) {
      window.ethereum.on('chainChanged', handleNetworkChange);
      window.ethereum.on('accountsChanged', handleAccountsChange);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', handleNetworkChange);
        window.ethereum.removeListener('accountsChanged', handleAccountsChange);
      }
    };
  }, []);

  const getCurrentNetwork = async () => {
    if (!window.ethereum) return;

    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const network = getNetworkByChainId(parseInt(chainId, 16));
      setCurrentNetwork(network);
      
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      setIsConnected(accounts.length > 0);
    } catch (error) {
      console.error('Error getting current network:', error);
    }
  };

  const handleNetworkChange = (chainId) => {
    const network = getNetworkByChainId(parseInt(chainId, 16));
    setCurrentNetwork(network);
  };

  const handleAccountsChange = (accounts) => {
    setIsConnected(accounts.length > 0);
    if (accounts.length === 0) {
      setCurrentNetwork(null);
    }
  };

  const handleNetworkSwitch = async (networkKey) => {
    const network = NETWORKS[networkKey];
    if (!network) return;

    setLoading(true);
    try {
      await switchToNetwork(network.chainId);
    } catch (error) {
      console.error('Failed to switch network:', error);
      alert(`Failed to switch to ${network.name}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!window.ethereum) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded text-sm">
        MetaMask not detected
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="bg-gray-100 border border-gray-300 text-gray-600 px-3 py-2 rounded text-sm">
        Wallet not connected
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">Network:</span>
      
      {currentNetwork ? (
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            currentNetwork.type === 'ethereum' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-purple-100 text-purple-800'
          }`}>
            {currentNetwork.name}
          </div>
          
          <select
            value={Object.keys(NETWORKS).find(key => 
              NETWORKS[key].chainId === currentNetwork.chainId
            ) || ''}
            onChange={(e) => handleNetworkSwitch(e.target.value)}
            disabled={loading}
            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
          >
            {Object.entries(NETWORKS).map(([key, network]) => (
              <option key={key} value={key}>
                {network.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-1 rounded text-sm">
          Unsupported network
        </div>
      )}
      
      {loading && (
        <div className="text-sm text-gray-500">
          Switching...
        </div>
      )}
    </div>
  );
}

export default NetworkSelector;