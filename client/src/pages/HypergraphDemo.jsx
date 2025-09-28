import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
  useHypergraphManufacturers,
  useHypergraphBatches,
  useHypergraphDashboardStats,
  useHypergraphSpaceOverview,
  useHypergraphSearch,
  useHypergraphCache
} from '../hooks/useHypergraph';
import { useGeoConnect } from '../contexts/GeoConnectContext.jsx';
import {
  Database,
  Search,
  BarChart3,
  Globe,
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Building,
  Package,
  Activity,
  Shield,
  LogOut
} from 'lucide-react';

export default function HypergraphDemo() {
  const { darkMode } = useTheme();
  const geoConnect = useGeoConnect();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('auth');
  
  // Hypergraph hooks
  const { data: spaceData, loading: spaceLoading, error: spaceError } = useHypergraphSpaceOverview();
  const { data: statsData, loading: statsLoading, refetch: refetchStats } = useHypergraphDashboardStats();
  const { data: manufacturersData, loading: manufacturersLoading } = useHypergraphManufacturers({ limit: 10 });
  const { data: batchesData, loading: batchesLoading } = useHypergraphBatches({ limit: 10 });
  const { data: searchData, loading: searchLoading } = useHypergraphSearch(searchTerm);
  const { clearCache, getStats, healthCheck } = useHypergraphCache();
  
  const [cacheStats, setCacheStats] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  
  const handleClearCache = () => {
    clearCache();
    const stats = getStats();
    setCacheStats(stats);
  };
  
  const handleHealthCheck = async () => {
    const status = await healthCheck();
    setHealthStatus(status);
  };
  
  const handleGetStats = () => {
    const stats = getStats();
    setCacheStats(stats);
  };

  const tabs = [
    { id: 'auth', label: 'Authentication', icon: Shield },
    { id: 'overview', label: 'Space Overview', icon: Globe },
    { id: 'stats', label: 'Dashboard Stats', icon: BarChart3 },
    { id: 'manufacturers', label: 'Manufacturers', icon: Building },
    { id: 'batches', label: 'Medicine Batches', icon: Package },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'cache', label: 'Cache Management', icon: Database }
  ];

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${
      darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Hypergraph Integration Demo
          </h1>
          <p className={`text-lg ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            Testing MedChain integration with GeoBrowser Hypergraph API
          </p>
        </div>

        {/* Health Status */}
        <div className={`mb-8 p-6 rounded-2xl border ${
          darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-blue-500" />
              <span className="font-semibold">Hypergraph Health</span>
            </div>
            <button 
              onClick={handleHealthCheck}
              className={`px-4 py-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Check Health
            </button>
          </div>
          
          {healthStatus && (
            <div className={`mt-4 p-4 rounded-lg ${
              healthStatus.healthy 
                ? (darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600')
                : (darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-600')
            }`}>
              {healthStatus.healthy ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Hypergraph is healthy!</span>
                  </div>
                  {healthStatus.space && (
                    <div className="text-sm">
                      <p>Space: {healthStatus.space.name} ({healthStatus.space.id})</p>
                      <p>Description: {healthStatus.space.description}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>Health check failed: {healthStatus.error}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className={`mb-8 p-2 rounded-2xl border ${
          darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  selectedTab === tab.id
                    ? (darkMode 
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                        : 'bg-blue-500 text-white shadow-lg shadow-blue-500/25')
                    : (darkMode 
                        ? 'text-slate-300 hover:bg-slate-700 hover:text-white' 
                        : 'text-slate-600 hover:bg-white hover:text-slate-900')
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className={`p-8 rounded-2xl border ${
          darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          {/* Authentication Tab */}
          {selectedTab === 'auth' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-500" />
                GeoBrowser Authentication
              </h2>
              
              <div className="space-y-6">
                {/* Authentication Status */}
                <div className={`p-6 rounded-xl border ${
                  geoConnect.isAuthenticated 
                    ? (darkMode ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-green-50 border-green-200 text-green-600')
                    : (darkMode ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600')
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    {geoConnect.isAuthenticated ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Clock className="w-6 h-6" />
                    )}
                    <span className="font-semibold text-lg">
                      {geoConnect.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <p><span className="font-medium">Current Space:</span> {geoConnect.currentSpaceInfo.name}</p>
                    <p><span className="font-medium">Space ID:</span> {geoConnect.currentSpaceInfo.id}</p>
                    <p><span className="font-medium">Space Type:</span> {geoConnect.currentSpace}</p>
                    <p><span className="font-medium">Requires Auth:</span> {geoConnect.currentSpaceInfo.requiresAuth ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                {/* Space Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(geoConnect.spaces).map(([key, space]) => (
                    <div key={key} className={`p-6 rounded-xl border ${
                      geoConnect.currentSpace === key
                        ? (darkMode ? 'bg-blue-500/20 border-blue-500/30' : 'bg-blue-50 border-blue-200')
                        : (darkMode ? 'bg-slate-700/60 border-slate-600' : 'bg-slate-50 border-slate-200')
                    }`}>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        {space.name}
                      </h3>
                      <div className="space-y-2 mb-4">
                        <p className="text-sm opacity-75">{space.description}</p>
                        <p className="text-sm"><span className="font-medium">ID:</span> {space.id}</p>
                        <p className="text-sm"><span className="font-medium">Auth Required:</span> {space.requiresAuth ? 'Yes' : 'No'}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        {geoConnect.currentSpace !== key && (
                          <button
                            onClick={() => geoConnect.switchSpace(key)}
                            disabled={space.requiresAuth && !geoConnect.canAccessPrivate}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              space.requiresAuth && !geoConnect.canAccessPrivate
                                ? (darkMode ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed')
                                : (darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white')
                            }`}
                          >
                            Switch to {key}
                          </button>
                        )}
                        {geoConnect.currentSpace === key && (
                          <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
                            darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            Current Space
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Error Display */}
                {geoConnect.error && (
                  <div className={`p-4 rounded-lg ${
                    darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-600'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-semibold">Authentication Error</span>
                    </div>
                    <p>{geoConnect.error}</p>
                  </div>
                )}

                {/* Authentication Actions */}
                <div className="flex gap-4">
                  <button
                    onClick={() => geoConnect.authenticate('private')}
                    disabled={!geoConnect.canAccessPrivate}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      !geoConnect.canAccessPrivate
                        ? (darkMode ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed')
                        : (darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white')
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    Authenticate Private
                  </button>
                  
                  <button
                    onClick={() => geoConnect.authenticate('public')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      darkMode ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    Use Public Space
                  </button>
                  
                  <button
                    onClick={geoConnect.disconnect}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      darkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                    Disconnect
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Space Overview Tab */}
          {selectedTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Globe className="w-6 h-6 text-blue-500" />
                Space Overview
              </h2>
              
              {spaceLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span>Loading space information...</span>
                </div>
              ) : spaceError ? (
                <div className={`p-4 rounded-lg ${
                  darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-600'
                }`}>
                  Error loading space: {spaceError.message}
                </div>
              ) : spaceData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`p-6 rounded-xl ${
                    darkMode ? 'bg-slate-700/60' : 'bg-slate-50'
                  }`}>
                    <h3 className="font-semibold mb-4">Space Information</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">ID:</span> {spaceData.space?.id}</p>
                      <p><span className="font-medium">Name:</span> {spaceData.space?.name}</p>
                      <p><span className="font-medium">Description:</span> {spaceData.space?.description}</p>
                      {spaceData.space?.owner && (
                        <p><span className="font-medium">Owner:</span> {spaceData.space.owner.address}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className={`p-6 rounded-xl ${
                    darkMode ? 'bg-slate-700/60' : 'bg-slate-50'
                  }`}>
                    <h3 className="font-semibold mb-4">Metadata</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Entity Count:</span> {spaceData.space?.entityCount || 'N/A'}</p>
                      <p><span className="font-medium">Created:</span> {spaceData.space?.createdAt || 'N/A'}</p>
                      <p><span className="font-medium">Updated:</span> {spaceData.space?.updatedAt || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p>No space data available</p>
              )}
            </div>
          )}

          {/* Dashboard Stats Tab */}
          {selectedTab === 'stats' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-blue-500" />
                  Dashboard Statistics
                </h2>
                <button
                  onClick={refetchStats}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    darkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
              
              {statsLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span>Loading statistics...</span>
                </div>
              ) : statsData?.stats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-emerald-500/20' : 'bg-emerald-50'}`}>
                    <div className="text-3xl font-bold text-emerald-500 mb-2">
                      {statsData.stats.totalManufacturers}
                    </div>
                    <div className="text-sm font-medium">Total Manufacturers</div>
                  </div>
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
                    <div className="text-3xl font-bold text-blue-500 mb-2">
                      {statsData.stats.verifiedManufacturers}
                    </div>
                    <div className="text-sm font-medium">Verified</div>
                  </div>
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-purple-500/20' : 'bg-purple-50'}`}>
                    <div className="text-3xl font-bold text-purple-500 mb-2">
                      {statsData.stats.totalBatches}
                    </div>
                    <div className="text-sm font-medium">Total Batches</div>
                  </div>
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-green-500/20' : 'bg-green-50'}`}>
                    <div className="text-3xl font-bold text-green-500 mb-2">
                      {statsData.stats.activeBatches}
                    </div>
                    <div className="text-sm font-medium">Active Batches</div>
                  </div>
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-amber-500/20' : 'bg-amber-50'}`}>
                    <div className="text-3xl font-bold text-amber-500 mb-2">
                      {statsData.stats.expiredBatches}
                    </div>
                    <div className="text-sm font-medium">Expired Batches</div>
                  </div>
                </div>
              ) : (
                <p>No statistics data available</p>
              )}
            </div>
          )}

          {/* Manufacturers Tab */}
          {selectedTab === 'manufacturers' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Building className="w-6 h-6 text-blue-500" />
                Manufacturers
              </h2>
              
              {manufacturersLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span>Loading manufacturers...</span>
                </div>
              ) : manufacturersData?.manufacturers ? (
                <div className="space-y-4">
                  {manufacturersData.manufacturers.map((manufacturer) => (
                    <div key={manufacturer.id} className={`p-6 rounded-xl border ${
                      darkMode ? 'bg-slate-700/60 border-slate-600' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{manufacturer.name || 'Unnamed Manufacturer'}</h3>
                          <p className="text-sm opacity-75">License: {manufacturer.license || 'N/A'}</p>
                          <p className="text-sm opacity-75">Email: {manufacturer.email || 'N/A'}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            manufacturer.isVerified 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {manufacturer.isVerified ? 'Verified' : 'Pending'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            manufacturer.isActive 
                              ? 'bg-blue-500/20 text-blue-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {manufacturer.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No manufacturers data available</p>
              )}
            </div>
          )}

          {/* Batches Tab */}
          {selectedTab === 'batches' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Package className="w-6 h-6 text-blue-500" />
                Medicine Batches
              </h2>
              
              {batchesLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span>Loading batches...</span>
                </div>
              ) : batchesData?.batches ? (
                <div className="space-y-4">
                  {batchesData.batches.map((batch) => (
                    <div key={batch.id} className={`p-6 rounded-xl border ${
                      darkMode ? 'bg-slate-700/60 border-slate-600' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{batch.medicineName || 'Unknown Medicine'}</h3>
                          <p className="text-sm opacity-75">Manufacturer: {batch.manufacturer || 'N/A'}</p>
                          <p className="text-sm opacity-75">
                            Manufacturing: {batch.manufacturingDate 
                              ? new Date(batch.manufacturingDate * 1000).toLocaleDateString() 
                              : 'N/A'}
                          </p>
                          <p className="text-sm opacity-75">
                            Expiry: {batch.expiryDate 
                              ? new Date(batch.expiryDate * 1000).toLocaleDateString() 
                              : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            batch.isActive 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {batch.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No batches data available</p>
              )}
            </div>
          )}

          {/* Search Tab */}
          {selectedTab === 'search' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Search className="w-6 h-6 text-blue-500" />
                Search
              </h2>
              
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search manufacturers and batches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                    darkMode 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              
              {searchLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span>Searching...</span>
                </div>
              ) : searchData && searchTerm ? (
                <div className="space-y-6">
                  {searchData.manufacturers.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-4">Manufacturers ({searchData.manufacturers.length})</h3>
                      <div className="space-y-3">
                        {searchData.manufacturers.map((manufacturer) => (
                          <div key={manufacturer.id} className={`p-4 rounded-lg border ${
                            darkMode ? 'bg-slate-700/60 border-slate-600' : 'bg-slate-50 border-slate-200'
                          }`}>
                            <div className="font-medium">{manufacturer.name || 'Unnamed'}</div>
                            <div className="text-sm opacity-75">{manufacturer.email}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {searchData.batches.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-4">Batches ({searchData.batches.length})</h3>
                      <div className="space-y-3">
                        {searchData.batches.map((batch) => (
                          <div key={batch.id} className={`p-4 rounded-lg border ${
                            darkMode ? 'bg-slate-700/60 border-slate-600' : 'bg-slate-50 border-slate-200'
                          }`}>
                            <div className="font-medium">{batch.medicineName || 'Unknown Medicine'}</div>
                            <div className="text-sm opacity-75">Manufacturer: {batch.manufacturer}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {searchData.manufacturers.length === 0 && searchData.batches.length === 0 && (
                    <p className="text-center py-8 opacity-75">No results found for "{searchTerm}"</p>
                  )}
                </div>
              ) : searchTerm ? (
                <p className="text-center py-8 opacity-75">Enter at least 2 characters to search</p>
              ) : (
                <p className="text-center py-8 opacity-75">Enter a search term to find manufacturers and batches</p>
              )}
            </div>
          )}

          {/* Cache Management Tab */}
          {selectedTab === 'cache' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Database className="w-6 h-6 text-blue-500" />
                Cache Management
              </h2>
              
              <div className="flex gap-4 mb-6">
                <button
                  onClick={handleGetStats}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    darkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Get Stats
                </button>
                <button
                  onClick={handleClearCache}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    darkMode 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Cache
                </button>
              </div>
              
              {cacheStats && (
                <div className={`p-6 rounded-xl ${
                  darkMode ? 'bg-slate-700/60' : 'bg-slate-50'
                }`}>
                  <h3 className="font-semibold mb-4">Cache Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p><span className="font-medium">Total Requests:</span> {cacheStats.total}</p>
                      <p><span className="font-medium">Successful:</span> {cacheStats.successful}</p>
                      <p><span className="font-medium">Failed:</span> {cacheStats.failed}</p>
                      <p><span className="font-medium">Success Rate:</span> {cacheStats.successRate}</p>
                    </div>
                    <div>
                      <p><span className="font-medium">Cache Size:</span> {cacheStats.cacheSize}</p>
                      <p><span className="font-medium">Cache Hits:</span> {cacheStats.cacheHits}</p>
                      <p><span className="font-medium">Hit Rate:</span> {cacheStats.cacheHitRate}</p>
                      <p><span className="font-medium">Avg Time:</span> {cacheStats.averageTime.toFixed(2)}ms</p>
                    </div>
                  </div>
                  
                  {cacheStats.recentErrors.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Recent Errors:</h4>
                      <div className="space-y-2">
                        {cacheStats.recentErrors.map((error, index) => (
                          <div key={index} className={`p-3 rounded-lg ${
                            darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-600'
                          }`}>
                            <div className="font-medium">{error.query}</div>
                            <div className="text-sm opacity-75">{error.error}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}