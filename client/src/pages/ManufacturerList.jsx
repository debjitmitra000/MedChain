import { Link, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useManufacturers, useVerifiedManufacturers, usePagination, useRealTimeUpdates } from '../hooks/useSubgraph';
import ManufacturerCard from '../components/ManufacturerCard';
import { useToast } from '../components/Toast';

export default function ManufacturerList() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [filters, setFilters] = useState({ 
    status: 'all', 
    orderBy: 'registeredAt', 
    orderDirection: 'desc',
    realTimeEnabled: false
  });
  
  // Pagination hook
  const pagination = usePagination(0, 20);
  
  // Choose appropriate query based on filter
  const queryOptions = useMemo(() => ({
    limit: pagination.pageSize,
    skip: pagination.currentPage * pagination.pageSize,
    orderBy: filters.orderBy,
    orderDirection: filters.orderDirection,
    pollInterval: filters.realTimeEnabled ? 30000 : 0,
    onError: (error) => {
      addToast(`Failed to load manufacturers: ${error.userMessage || error.message}`, 'error');
    },
    onCompleted: (data) => {
      if (filters.realTimeEnabled && pagination.currentPage === 0) {
        addToast('Manufacturer list updated', 'info');
      }
    }
  }), [pagination, filters, addToast]);
  
  // Get data based on filter status
  const { data, loading, error, refetch, networkStatus } = filters.status === 'verified' 
    ? useVerifiedManufacturers(queryOptions)
    : useManufacturers(queryOptions);
    
  const handleManufacturerClick = (manufacturer) => {
    const id = manufacturer.address || manufacturer.wallet || manufacturer.id;
    if (id) {
      navigate(`/manufacturer/${id}`);
    } else {
      // Optionally show a toast or do nothing
      addToast('Manufacturer does not have a valid address or ID.', 'error');
    }
  } 

  const toggleRealTime = () => {
    setFilters(f => ({ ...f, realTimeEnabled: !f.realTimeEnabled }));
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manufacturers</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Loading manufacturers...</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 text-red-400 dark:text-red-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Manufacturers</h3>
          <p className="text-gray-600 dark:text-gray-400">{error.message}</p>
        </div>
      </div>
    );
  }

  // Extract manufacturers from the subgraph response
  const manufacturerList = data?.manufacturers || [];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manufacturers</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Browse verified pharmaceutical manufacturers in the MedChain network
        </p>
      </div>
      
      {/* Filter controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select 
              value={filters.status} 
              onChange={(e) => {
                setFilters(f => ({ ...f, status: e.target.value }));
                pagination.goToPage(0);
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Manufacturers</option>
              <option value="verified">Verified Only</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sort By
            </label>
            <select 
              value={`${filters.orderBy}-${filters.orderDirection}`}
              onChange={(e) => {
                const [orderBy, orderDirection] = e.target.value.split('-');
                setFilters(f => ({ ...f, orderBy, orderDirection }));
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="registeredAt-desc">Newest First</option>
              <option value="registeredAt-asc">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="totalBatches-desc">Most Batches</option>
              <option value="totalBatches-asc">Least Batches</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-400">
          Showing {manufacturerList.length} of {pagination.total} manufacturers
        </p>
      </div>
      
      {manufacturerList.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 text-gray-400 dark:text-gray-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m5 0v-4a1 1 0 011-1h2a1 1 0 011 1v4M7 7h10M7 11h6"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No manufacturers found</h3>
          <p className="text-gray-600 dark:text-gray-400">No manufacturers match your current filter criteria.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
          {manufacturerList.map((mfr, i) => (
            <ManufacturerCard
              key={i}
              manufacturer={{
                ...mfr,
                address: mfr.address || mfr.wallet || mfr.id,
              }}
              onClick={handleManufacturerClick}
              showProfilePicture={true}
              size="medium"
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.total > filters.limit && (
        <div className="mt-8 flex items-center justify-center space-x-4">
          <button 
            disabled={filters.offset === 0}
            onClick={() => setFilters(f => ({ ...f, offset: Math.max(0, f.offset - f.limit) }))}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {Math.floor(filters.offset / filters.limit) + 1} of {Math.ceil(pagination.total / filters.limit)}
          </span>
          <button 
            disabled={!pagination.hasMore}
            onClick={() => setFilters(f => ({ ...f, offset: f.offset + f.limit }))}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
