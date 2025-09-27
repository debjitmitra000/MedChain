import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getManufacturerList } from '../api/manufacturer';
import ManufacturerCard from '../components/ManufacturerCard';

export default function ManufacturerList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ status: 'all', limit: 20, offset: 0 });
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['manufacturer-list', filters],
    queryFn: () => getManufacturerList(filters),
  });

  const handleManufacturerClick = (manufacturer) => {
    navigate(`/manufacturer/${manufacturer.wallet || manufacturer.address}`);
  };

  if (isLoading) {
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

  const manufacturers = data?.data?.manufacturers || [];
  const pagination = data?.data?.pagination || {};

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
              onChange={(e) => setFilters(f => ({ ...f, status: e.target.value, offset: 0 }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Manufacturers</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Per Page
            </label>
            <select 
              value={filters.limit} 
              onChange={(e) => setFilters(f => ({ ...f, limit: Number(e.target.value), offset: 0 }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-400">
          Showing {manufacturers.length} of {pagination.total} manufacturers
        </p>
      </div>
      
      {manufacturers.length === 0 ? (
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
          {manufacturers.map((mfr, i) => (
            <ManufacturerCard
              key={i}
              manufacturer={{
                ...mfr,
                address: mfr.wallet || mfr.address,
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
