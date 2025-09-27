import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

// Wallet selection modal component
const WalletSelectionModal = ({ isOpen, onClose, connectors, onSelectWallet, isPending }) => {
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

  if (!isVisible) return null;

  const getWalletIcon = (connectorName) => {
    const name = connectorName.toLowerCase();
    if (name.includes('metamask')) return '🦊';
    if (name.includes('coinbase')) return '🔵';
    if (name.includes('walletconnect')) return '🔗';
    if (name.includes('injected')) return '🔌';
    return '💼';
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

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  React.useEffect(() => {
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
  }, [isOpen]);

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={handleBackdropClick}
    >
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
          Select Wallet
        </h3>
        <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '14px' }}>
          Choose your preferred wallet to connect to MedChain
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => onSelectWallet(connector)}
              disabled={isPending}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: isPending ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: isPending ? 0.6 : 1
              }}
              onMouseOver={(e) => {
                if (!isPending) {
                  e.target.style.backgroundColor = '#f8fafc';
                  e.target.style.borderColor = '#4f46e5';
                }
              }}
              onMouseOut={(e) => {
                if (!isPending) {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.borderColor = '#e2e8f0';
                }
              }}
            >
              <span style={{ fontSize: '20px' }}>{getWalletIcon(connector.name)}</span>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontWeight: '500', color: '#1e293b' }}>
                  {getWalletDisplayName(connector.name)}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  {connector.name}
                </div>
              </div>
            </button>
          ))}
        </div>
        
        <button
          onClick={onClose}
          style={{
            marginTop: '16px',
            width: '100%',
            padding: '8px 16px',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            backgroundColor: '#f8fafc',
            color: '#64748b',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [availableConnectors, setAvailableConnectors] = useState([]);

  // Detect available connectors
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
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ 
          fontSize: '14px', 
          color: '#4f46e5', 
          fontWeight: '500',
          backgroundColor: '#e0e7ff',
          padding: '4px 8px',
          borderRadius: '4px'
        }}>
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <button 
          onClick={() => disconnect()}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
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
        style={{
          marginLeft: 'auto',
          padding: '8px 16px',
          backgroundColor: '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: isPending ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          opacity: isPending ? 0.6 : 1,
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => {
          if (!isPending) {
            e.target.style.backgroundColor = '#4338ca';
          }
        }}
        onMouseOut={(e) => {
          if (!isPending) {
            e.target.style.backgroundColor = '#4f46e5';
          }
        }}
      >
        {isPending ? 'Connecting...' : 'Connect Wallet'}
      </button>
      
      <WalletSelectionModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        connectors={availableConnectors}
        onSelectWallet={handleWalletSelect}
        isPending={isPending}
      />
    </>
  );
}