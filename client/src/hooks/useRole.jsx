import { useAccount, useConnect } from 'wagmi'; // NEW: Added useConnect
import { useQuery } from '@tanstack/react-query';
import { getGlobalStats } from '../api/verify';
import { getManufacturer } from '../api/manufacturer';

export function useRole() {
  const { address, isConnected, isConnecting } = useAccount(); // NEW: Added isConnecting for UI feedback
  const { connect, connectors } = useConnect(); // NEW: This hook provides the tools to connect

  // Get global stats to check admin address
  const { data: statsData } = useQuery({
    queryKey: ['stats'],
    queryFn: getGlobalStats,
    enabled: isConnected,
    retry: false, // Don't retry on error
    staleTime: 30000, // Cache for 30 seconds
  });

  // Get manufacturer details if connected
  const { data: manufacturerData } = useQuery({
    queryKey: ['manufacturer', address],
    queryFn: () => getManufacturer(address),
    enabled: isConnected && !!address,
    retry: false, // Don't retry if manufacturer not found
    staleTime: 30000, // Cache for 30 seconds
  });

  // Determine role
  const role = (() => {
    if (!isConnected) return 'guest';

    if (
      address &&
      statsData?.stats?.adminAddress &&
      address.toLowerCase() === statsData.stats.adminAddress.toLowerCase()
    ) {
      return 'admin';
    }

    if (manufacturerData?.data?.manufacturer) {
      return 'manufacturer';
    }

    return 'user';
  })();

  const manufacturer = manufacturerData?.data?.manufacturer || null;

  // Enhanced wallet connection function that detects multiple wallets
  const connectWallet = () => {
    // Check for available connectors
    const availableConnectors = connectors.filter(connector => {
      try {
        if (connector.name.toLowerCase().includes('injected')) {
          return !!window.ethereum;
        } else if (connector.name.toLowerCase().includes('metamask')) {
          return !!window.ethereum?.isMetaMask;
        } else if (connector.name.toLowerCase().includes('coinbase')) {
          return !!window.ethereum?.isCoinbaseWallet;
        }
        return true; // For other connectors like WalletConnect
      } catch (error) {
        return false;
      }
    });

    if (availableConnectors.length === 0) {
      alert('No wallet extensions found. Please install MetaMask or another compatible wallet.');
      return;
    }
    
    if (availableConnectors.length === 1) {
      // If only one wallet is available, connect directly
      connect({ connector: availableConnectors[0] });
    } else {
      // If multiple wallets are available, show a simple selection
      const walletNames = availableConnectors.map(c => {
        const name = c.name.toLowerCase();
        if (name.includes('metamask')) return 'MetaMask';
        if (name.includes('coinbase')) return 'Coinbase Wallet';
        if (name.includes('walletconnect')) return 'WalletConnect';
        if (name.includes('injected')) return 'Browser Wallet';
        return c.name;
      });
      
      const selectedWallet = prompt(
        `Multiple wallets detected. Please choose:\n${walletNames.map((name, index) => `${index + 1}. ${name}`).join('\n')}\n\nEnter the number of your preferred wallet:`
      );
      
      const walletIndex = parseInt(selectedWallet) - 1;
      if (walletIndex >= 0 && walletIndex < availableConnectors.length) {
        connect({ connector: availableConnectors[walletIndex] });
      }
    }
  };

  return {
    role,
    isAdmin: role === 'admin',
    isManufacturer: role === 'manufacturer',
    isUser: role === 'user',
    isGuest: role === 'guest',
    isConnected,
    isConnecting, // NEW: Export isConnecting
    address,
    manufacturer,
    isVerified: manufacturer?.isVerified || false,
    isActive: manufacturer?.isActive || false,
    canRegisterBatch: role === 'manufacturer' && manufacturer?.isVerified && manufacturer?.isActive,
    canRegisterAsManufacturer: role === 'user' || (role === 'manufacturer' && !manufacturer?.wallet),
    adminAddress: statsData?.stats?.adminAddress,
    connectWallet, // NEW: Export the connect function
  };
}