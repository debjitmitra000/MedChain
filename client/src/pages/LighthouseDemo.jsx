// pages/LighthouseDemo.jsx
import React, { useState } from 'react';
import ManufacturerProfilePicture from '../components/ManufacturerProfilePicture';
import { lighthouseService } from '../services/lighthouseService';
import { useToast } from '../components/Toast';
import { useAccount } from 'wagmi';

const LighthouseDemo = () => {
  const { address, isConnected } = useAccount();
  const { addToast } = useToast();
  const [cacheStats, setCacheStats] = useState(null);

  const refreshCacheStats = () => {
    const stats = lighthouseService.getCacheStats();
    setCacheStats(stats);
  };

  const clearCache = () => {
    lighthouseService.clearUploadCache();
    addToast('Cache cleared successfully', 'success');
    refreshCacheStats();
  };

  React.useEffect(() => {
    refreshCacheStats();
  }, []);

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 text-indigo-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please connect your wallet to test the Lighthouse IPFS storage integration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          🌟 Lighthouse IPFS Storage Demo
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Test the complete Lighthouse integration with profile picture uploads, 
          image compression, progress tracking, and IPFS storage.
        </p>
      </div>

      {/* Demo Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Profile Picture Upload Demo */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Profile Picture Upload
          </h2>
          
          <div className="space-y-4">
            <div className="text-center">
              <ManufacturerProfilePicture
                manufacturerAddress={address}
                size="xl"
                onImageUpdate={(result) => {
                  if (result) {
                    addToast(`Image uploaded! Hash: ${result.hash.substring(0, 12)}...`, 'success');
                  }
                  refreshCacheStats();
                }}
              />
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Features:</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>✅ Automatic image compression (&gt;1MB images)</li>
                <li>✅ Real-time upload progress tracking</li>
                <li>✅ File validation (size, type)</li>
                <li>✅ IPFS storage via Lighthouse</li>
                <li>✅ Local caching for performance</li>
                <li>✅ Error handling with retry logic</li>
              </ul>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="space-y-6">
          
          {/* Cache Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              Cache Statistics
            </h2>
            
            {cacheStats && (
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Upload Cache</span>
                  <span className="font-medium text-gray-900 dark:text-white">{cacheStats.uploadCacheSize} items</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Profile Cache</span>
                  <span className="font-medium text-gray-900 dark:text-white">{cacheStats.profileCacheSize} items</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Active Uploads</span>
                  <span className="font-medium text-gray-900 dark:text-white">{cacheStats.activeUploads} uploads</span>
                </div>
              </div>
            )}
            
            <div className="flex space-x-2 mt-4">
              <button
                onClick={refreshCacheStats}
                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Refresh Stats
              </button>
              <button
                onClick={clearCache}
                className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Clear Cache
              </button>
            </div>
          </div>

          {/* Environment Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Environment
            </h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">API Key Status</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  import.meta.env.VITE_LIGHTHOUSE_API_KEY && import.meta.env.VITE_LIGHTHOUSE_API_KEY !== 'your-lighthouse-api-key'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {import.meta.env.VITE_LIGHTHOUSE_API_KEY && import.meta.env.VITE_LIGHTHOUSE_API_KEY !== 'your-lighthouse-api-key' 
                    ? 'Configured' 
                    : 'Not Set'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Connected Address</span>
                <span className="font-mono text-xs text-gray-900 dark:text-white">
                  {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : 'Not connected'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 dark:text-gray-400">IPFS Gateway</span>
                <span className="text-xs text-gray-900 dark:text-white">gateway.lighthouse.storage</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Key Setup Instructions */}
      {(!import.meta.env.VITE_LIGHTHOUSE_API_KEY || import.meta.env.VITE_LIGHTHOUSE_API_KEY === 'your-lighthouse-api-key') && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            Lighthouse API Key Required
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300 mb-3">
            To test the IPFS upload functionality, you need to set up your Lighthouse API key:
          </p>
          <div className="bg-yellow-100 dark:bg-yellow-900 rounded p-3 font-mono text-sm text-yellow-900 dark:text-yellow-100">
            1. Get your API key from <a href="https://files.lighthouse.storage/" target="_blank" rel="noopener noreferrer" className="underline">files.lighthouse.storage</a><br/>
            2. Add to your .env file:<br/>
            <code>VITE_LIGHTHOUSE_API_KEY=your_actual_api_key_here</code><br/>
            3. Restart the development server
          </div>
        </div>
      )}
    </div>
  );
};

export default LighthouseDemo;