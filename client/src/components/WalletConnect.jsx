import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

// Wallet selection modal component
const WalletSelectionModal = ({ isOpen, onClose, connectors, onSelectWallet, isPending, darkMode = true }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      // Delay hiding to allow for smooth transition
      const timer = setTimeout(() => setIsVisible(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isVisible) return null;

  const getWalletIcon = (connectorName) => {
    const name = connectorName.toLowerCase();
    if (name.includes('metamask')) return '🦊';
    if (name.includes('coinbase')) return '🔵';
    if (name.includes('walletconnect')) return '🔗';
    if (name.includes('injected')) return '💎';
    return '👛';
  };

  const getWalletDisplayName = (connectorName) => {
    const name = connectorName.toLowerCase();
    if (name.includes('metamask')) return 'MetaMask';
    if (name.includes('coinbase')) return 'Coinbase Wallet';
    if (name.includes('walletconnect')) return 'WalletConnect';
    if (name.includes('injected')) return 'Browser Wallet';
    return connectorName;
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className={`rounded-2xl p-6 max-w-md w-11/12 shadow-2xl transform transition-all duration-300 ${
          darkMode
            ? 'bg-slate-800 border border-slate-700'
            : 'bg-white border border-slate-200'
        }`}
        style={{
          transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
        }}
      >
        <h3 className={`text-xl font-bold mb-2 ${
          darkMode ? 'text-white' : 'text-slate-900'
        }`}>
          Connect Wallet
        </h3>
        <p className={`text-sm mb-6 ${
          darkMode ? 'text-slate-400' : 'text-slate-600'
        }`}>
          Choose your preferred wallet to connect to MedChain
        </p>
        
        <div className="space-y-3">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => onSelectWallet(connector)}
              disabled={isPending}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                darkMode
                  ? 'border-slate-600 bg-slate-700 hover:border-emerald-500 hover:bg-slate-600'
                  : 'border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50'
              }`}
            >
              <span className="text-2xl">{getWalletIcon(connector.name)}</span>
              <div className="flex-1 text-left">
                <div className={`font-semibold ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  {getWalletDisplayName(connector.name)}
                </div>
                <div className={`text-xs ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {connector.name}
                </div>
              </div>
            </button>
          ))}
        </div>
        
        <button
          onClick={onClose}
          className={`mt-6 w-full py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
            darkMode
              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300'
          }`}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default function WalletConnect({ darkMode = true }) {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [availableConnectors, setAvailableConnectors] = useState([]);

  // Detect available connectors - always call this hook
  useEffect(() => {
    const detectAvailableConnectors = async () => {
      const available = [];
      try {
        for (const connector of connectors) {
          try {
            // Check if connector is available
            if (connector.name.toLowerCase().includes('injected')) {
              // For injected connector, check if any wallet is available
              if (typeof window !== 'undefined' && window.ethereum) {
                available.push(connector);
              }
            } else if (connector.name.toLowerCase().includes('metamask')) {
              // Check specifically for MetaMask
              if (typeof window !== 'undefined' && window.ethereum?.isMetaMask) {
                available.push(connector);
              }
            } else if (connector.name.toLowerCase().includes('coinbase')) {
              // Check for Coinbase Wallet
              if (typeof window !== 'undefined' && window.ethereum?.isCoinbaseWallet) {
                available.push(connector);
              }
            } else {
              // For other connectors like WalletConnect, assume they're available
              available.push(connector);
            }
          } catch (error) {
            console.log(`Connector ${connector.name} not available:`, error);
          }
        }
      } catch (error) {
        console.error('Error detecting connectors:', error);
      }
      setAvailableConnectors(available);
    };

    detectAvailableConnectors();
  }, [connectors]);

  const handleConnectClick = () => {
    if (availableConnectors.length === 0) {
      alert('No wallet extensions found. Please install MetaMask or another compatible wallet.');
      return;
    }

    if (availableConnectors.length === 1) {
      // If only one wallet is available, connect directly
      connect({ connector: availableConnectors[0] });
    } else {
      // If multiple wallets are available, show selection modal
      setShowWalletModal(true);
    }
  };

  const handleWalletSelect = (connector) => {
    setShowWalletModal(false);
    connect({ connector });
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
          darkMode
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
        }`}>
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </div>
        <a
          href="/profile/edit"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
            darkMode
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
              : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'
          }`}
          style={{ textDecoration: 'none' }}
        >
          Edit Profile
        </a>
        <button
          onClick={() => disconnect()}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
            darkMode
              ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
              : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
          }`}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleConnectClick}
        disabled={isPending}
        className={`px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
          darkMode
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/20'
            : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/20'
        }`}
      >
        {isPending ? 'Connecting...' : 'Connect Wallet'}
      </button>
      
      <WalletSelectionModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        connectors={availableConnectors}
        onSelectWallet={handleWalletSelect}
        isPending={isPending}
        darkMode={darkMode}
      />
    </>
  );
}
