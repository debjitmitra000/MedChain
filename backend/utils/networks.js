// utils/networks.js
export const NETWORKS = {
  filecoin: {
    chainId: 314159,
    name: 'Filecoin Calibration Testnet',
    rpcUrl: process.env.RPC_URL || 'https://api.calibration.node.glif.io/rpc/v1',
    explorerUrl: process.env.FILECOIN_EXPLORER_URL || 'https://calibration.filfox.info',
    currency: 'tFIL',
    type: 'filecoin'
  },
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: process.env.SEPOLIA_RPC_URL,
    explorerUrl: 'https://sepolia.etherscan.io',
    currency: 'SepoliaETH',
    type: 'ethereum'
  }
};

export const DEFAULT_NETWORK = process.env.NETWORK || 'filecoin';

export function getNetworkConfig(network = DEFAULT_NETWORK) {
  return NETWORKS[network] || NETWORKS.filecoin;
}

export function getNetworkByChainId(chainId) {
  return Object.values(NETWORKS).find(network => network.chainId === chainId);
}

export function isFilecoinNetwork(network = DEFAULT_NETWORK) {
  return NETWORKS[network]?.type === 'filecoin';
}

export function getExplorerUrl(network = DEFAULT_NETWORK, txHash = null, address = null) {
  const config = getNetworkConfig(network);
  const baseUrl = config.explorerUrl;
  
  if (txHash) {
    return `${baseUrl}/tx/${txHash}`;
  }
  if (address) {
    return `${baseUrl}/address/${address}`;
  }
  return baseUrl;
}

export function formatChainId(chainId) {
  return `0x${chainId.toString(16)}`;
}

// Network switching for MetaMask
export async function switchToNetwork(chainId) {
  if (!window.ethereum) {
    throw new Error('MetaMask not found');
  }

  const network = getNetworkByChainId(chainId);
  if (!network) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: formatChainId(chainId) }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      await addNetworkToMetaMask(network);
    } else {
      throw switchError;
    }
  }
}

// Add network to MetaMask
export async function addNetworkToMetaMask(network) {
  if (!window.ethereum) {
    throw new Error('MetaMask not found');
  }

  await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [
      {
        chainId: formatChainId(network.chainId),
        chainName: network.name,
        rpcUrls: [network.rpcUrl],
        blockExplorerUrls: [network.explorerUrl],
        nativeCurrency: {
          name: network.currency,
          symbol: network.currency,
          decimals: 18,
        },
      },
    ],
  });
}

