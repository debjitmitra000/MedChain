import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useNavigate, Link } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import { User, X, Wallet, ChevronRight, ExternalLink } from 'lucide-react';

// Wallet selection modal component
const WalletSelectionModal = ({ isOpen, onClose, connectors, onSelectWallet, isPending, darkMode = true }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      // Delay hiding to allow for smooth transition
      const timer = setTimeout(() => setIsVisible(false), 300);
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

  const getWalletDescription = (connectorName) => {
    const name = connectorName.toLowerCase();
    if (name.includes('metamask')) return 'Connect to your MetaMask wallet';
    if (name.includes('coinbase')) return 'Connect to your Coinbase Wallet';
    if (name.includes('walletconnect')) return 'Scan with WalletConnect to connect';
    if (name.includes('injected')) return 'Connect with your browser wallet';
    return 'Connect securely';
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-300 ${
        isOpen ? 'bg-black/60 backdrop-blur-sm opacity-100' : 'bg-black/0 backdrop-blur-none opacity-0 pointer-events-none'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`relative w-full max-w-md mx-4 overflow-hidden rounded-3xl shadow-2xl transform transition-all duration-300 ${
          isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-10 opacity-0'
        } ${
          darkMode
            ? 'bg-slate-900/90 border border-slate-700/50 text-white'
            : 'bg-white/90 border border-slate-200/50 text-slate-900'
        }`}
        style={{
          backdropFilter: 'blur(20px)',
          boxShadow: darkMode 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
            : '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative p-6 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
              <Wallet size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Connect Wallet</h3>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Select your preferred method
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              darkMode 
                ? 'hover:bg-slate-800 text-slate-400 hover:text-white' 
                : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
            }`}
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Wallet List */}
        <div className="relative p-6 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => onSelectWallet(connector)}
              disabled={isPending}
              className={`group w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                darkMode
                  ? 'border-slate-700/50 bg-slate-800/50 hover:bg-slate-800 hover:border-emerald-500/50'
                  : 'border-slate-200/50 bg-slate-50/50 hover:bg-white hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {/* Hover gradient effect */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r ${
                darkMode ? 'from-emerald-500/10 to-transparent' : 'from-emerald-500/5 to-transparent'
              }`} />
              
              <span className="text-3xl relative z-10 filter drop-shadow-md transition-transform duration-300 group-hover:scale-110">
                {getWalletIcon(connector.name)}
              </span>
              
              <div className="flex-1 text-left relative z-10">
                <div className={`font-bold text-lg ${
                  darkMode ? 'text-white group-hover:text-emerald-400' : 'text-slate-900 group-hover:text-emerald-600'
                } transition-colors`}>
                  {getWalletDisplayName(connector.name)}
                </div>
                <div className={`text-xs ${
                  darkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-500 group-hover:text-slate-600'
                } transition-colors`}>
                  {getWalletDescription(connector.name)}
                </div>
              </div>

              <div className={`relative z-10 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ${
                darkMode ? 'text-emerald-400' : 'text-emerald-600'
              }`}>
                <ChevronRight size={20} />
              </div>
            </button>
          ))}
        </div>
        
        {/* Footer */}
        <div className={`relative p-4 text-center border-t ${
          darkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'
        }`}>
          <a 
            href="https://ethereum.org/en/wallets/" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${
              darkMode ? 'text-slate-500 hover:text-emerald-400' : 'text-slate-500 hover:text-emerald-600'
            }`}
          >
            New to Ethereum? Learn about wallets <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default function WalletConnect({ darkMode = true }) {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [availableConnectors, setAvailableConnectors] = useState([]);
  const { displayName, profilePicture } = useUserProfile(isConnected ? address : null);

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

  // Handle disconnect and navigate to landing page
  const handleDisconnect = () => {
    disconnect();
    navigate('/'); // Navigate to landing page after disconnect
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        {/* Profile Picture */}
        <div className="flex-shrink-0 group relative">
          <div className={`absolute -inset-0.5 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500 ${
            darkMode ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : 'bg-gradient-to-r from-emerald-400 to-cyan-400'
          }`}></div>
          {profilePicture ? (
            <img 
              src={profilePicture} 
              alt="Profile" 
              className="relative w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm" 
            />
          ) : (
            <div className={`relative w-10 h-10 rounded-full flex items-center justify-center border-2 ${
              darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            }`}>
              <User className={`w-5 h-5 ${
                darkMode ? 'text-emerald-400' : 'text-emerald-600'
              }`} />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex flex-col">
          <div className={`text-sm font-bold ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            {displayName}
          </div>
          <div className={`text-xs font-mono ${
            darkMode
              ? 'text-emerald-400'
              : 'text-emerald-600'
          }`}>
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-2">
          <Link
            to="/app/profile/edit"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 hover:scale-105 ${
              darkMode
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200 shadow-sm'
            }`}
            style={{ textDecoration: 'none' }}
          >
            Edit
          </Link>
          <button
            onClick={handleDisconnect}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 hover:scale-105 ${
              darkMode
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
            }`}
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleConnectClick}
        disabled={isPending}
        className={`group relative px-8 py-4 rounded-full text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden ${
          darkMode
            ? 'bg-slate-900 text-white shadow-emerald-500/20'
            : 'bg-white text-slate-900 shadow-emerald-500/20'
        }`}
      >
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r ${
          darkMode 
            ? 'from-emerald-600 to-cyan-600' 
            : 'from-emerald-400 to-cyan-400'
        }`} />
        
        <div className={`absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity duration-500 bg-gradient-to-r ${
          darkMode 
            ? 'from-emerald-500 to-cyan-500' 
            : 'from-emerald-500 to-cyan-500'
        }`} />
        
        <span className="relative z-10 flex items-center gap-2">
          {isPending ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5" />
              <span>Connect Wallet</span>
            </>
          )}
        </span>
        
        {/* Shine effect */}
        <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-shine" />
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
