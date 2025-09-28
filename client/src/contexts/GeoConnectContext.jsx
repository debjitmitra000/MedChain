// contexts/GeoConnectContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

const GeoConnectContext = createContext();

export const useGeoConnect = () => {
  const context = useContext(GeoConnectContext);
  if (!context) {
    throw new Error('useGeoConnect must be used within a GeoConnectProvider');
  }
  return context;
};

export const GeoConnectProvider = ({ children }) => {
  const { address, isConnected } = useAccount();
  const [currentSpace, setCurrentSpace] = useState('private');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [error, setError] = useState(null);

  // Space configuration
  const spaces = {
    private: {
      id: import.meta.env.VITE_HYPERGRAPH_PRIVATE_SPACE_ID,
      name: 'Private MedChain Space',
      description: 'Private space for authenticated users',
      requiresAuth: true
    },
    public: {
      id: import.meta.env.VITE_HYPERGRAPH_PUBLIC_SPACE_ID,
      name: 'Public MedChain Space', 
      description: 'Public space for general access',
      requiresAuth: false
    }
  };

  // Generate authentication headers based on connected wallet
  const generateAuthHeaders = async (spaceId) => {
    if (!address || !isConnected) {
      throw new Error('Wallet must be connected for authentication');
    }

    try {
      // For GeoBrowser, we need to create a signed message or use API keys
      // Since we don't have the official SDK, we'll use the wallet address as auth
      const timestamp = Date.now();
      const authMessage = `MedChain:${address}:${spaceId}:${timestamp}`;
      
      // In a real implementation, you would sign this message with the wallet
      // For now, we'll use a basic auth approach
      const basicAuth = btoa(`${address}:${authMessage}`);
      
      return {
        'Authorization': `Bearer ${basicAuth}`,
        'X-Space-ID': spaceId,
        'X-User-Address': address,
        'X-Timestamp': timestamp.toString(),
        'Content-Type': 'application/json'
      };
    } catch (error) {
      console.error('Failed to generate auth headers:', error);
      throw new Error('Authentication failed');
    }
  };

  // Authenticate with a specific space
  const authenticate = async (spaceType = 'private') => {
    setError(null);
    
    try {
      const space = spaces[spaceType];
      if (!space) {
        throw new Error(`Invalid space type: ${spaceType}`);
      }

      // If space doesn't require auth, just set as authenticated
      if (!space.requiresAuth) {
        setIsAuthenticated(true);
        setCurrentSpace(spaceType);
        setAuthToken(null);
        return true;
      }

      // For spaces requiring auth, check wallet connection
      if (!isConnected || !address) {
        throw new Error('Wallet connection required for private spaces');
      }

      // Generate auth headers
      const headers = await generateAuthHeaders(space.id);
      setAuthToken(headers.Authorization);
      setIsAuthenticated(true);
      setCurrentSpace(spaceType);
      
      console.log(`🔐 Authenticated with ${space.name}`);
      return true;

    } catch (error) {
      console.error('Authentication failed:', error);
      setError(error.message);
      setIsAuthenticated(false);
      setAuthToken(null);
      return false;
    }
  };

  // Disconnect from current space
  const disconnect = () => {
    setIsAuthenticated(false);
    setAuthToken(null);
    setCurrentSpace('public');
    setError(null);
    console.log('🔓 Disconnected from GeoBrowser');
  };

  // Switch between spaces
  const switchSpace = async (spaceType) => {
    if (spaceType === currentSpace) {
      return true;
    }

    return await authenticate(spaceType);
  };

  // Get current space info
  const getCurrentSpace = () => {
    return {
      ...spaces[currentSpace],
      type: currentSpace
    };
  };

  // Get auth headers for API calls
  const getAuthHeaders = async () => {
    const space = spaces[currentSpace];
    
    if (!space.requiresAuth) {
      return {
        'Content-Type': 'application/json',
        'X-Space-ID': space.id
      };
    }

    if (!isAuthenticated || !authToken) {
      throw new Error('Not authenticated. Please authenticate first.');
    }

    return await generateAuthHeaders(space.id);
  };

  // Auto-authenticate when wallet connects
  useEffect(() => {
    if (isConnected && address && !isAuthenticated) {
      authenticate('private').catch(() => {
        // Fall back to public space if private auth fails
        authenticate('public');
      });
    } else if (!isConnected) {
      // Switch to public space when wallet disconnects
      authenticate('public');
    }
  }, [isConnected, address]);

  // Validate current authentication periodically
  useEffect(() => {
    const validateAuth = async () => {
      if (isAuthenticated && spaces[currentSpace].requiresAuth) {
        try {
          await getAuthHeaders();
        } catch (error) {
          console.warn('Auth validation failed, re-authenticating...');
          authenticate(currentSpace);
        }
      }
    };

    const interval = setInterval(validateAuth, 5 * 60 * 1000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, [isAuthenticated, currentSpace]);

  const contextValue = {
    // State
    isAuthenticated,
    currentSpace,
    authToken,
    error,
    spaces,
    
    // Methods
    authenticate,
    disconnect,
    switchSpace,
    getCurrentSpace,
    getAuthHeaders,
    
    // Computed values
    isPrivateSpace: currentSpace === 'private',
    isPublicSpace: currentSpace === 'public',
    canAccessPrivate: isConnected && address,
    currentSpaceInfo: getCurrentSpace()
  };

  return (
    <GeoConnectContext.Provider value={contextValue}>
      {children}
    </GeoConnectContext.Provider>
  );
};