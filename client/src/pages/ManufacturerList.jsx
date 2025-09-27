import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getManufacturerList } from '../api/manufacturer';

export default function ManufacturerList() {
  const [filters, setFilters] = useState({ status: 'all', limit: 20, offset: 0 });
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['manufacturer-list', filters],
    queryFn: () => getManufacturerList(filters),
  });

  if (isLoading) return <p>Loading manufacturers...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const manufacturers = data?.data?.manufacturers || [];
  const pagination = data?.data?.pagination || {};

  return (
    <div>
      <h3>Manufacturers</h3>
      
      {/* Filter controls */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
        <select 
          value={filters.status} 
          onChange={(e) => setFilters(f => ({ ...f, status: e.target.value, offset: 0 }))}
        >
          <option value="all">All</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        
        <select 
          value={filters.limit} 
          onChange={(e) => setFilters(f => ({ ...f, limit: Number(e.target.value), offset: 0 }))}
        >
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>

      {/* Results */}
      <p>Showing {manufacturers.length} of {pagination.total} manufacturers</p>
      
      {manufacturers.length === 0 ? (
        <p>No manufacturers found</p>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {manufacturers.map((mfr, i) => (
            <div key={i} style={{ 
              border: '1px solid #ddd', 
              padding: 12, 
              borderRadius: 4,
              backgroundColor: mfr.isVerified ? '#f0f8f0' : '#fff8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: 0 }}>{mfr.name}</h4>
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                    {mfr.wallet?.slice(0, 10)}...{mfr.wallet?.slice(-8)}
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}>
                    License: {mfr.license}
                  </p>
                  {mfr.email && (
                    <p style={{ margin: '4px 0', fontSize: '14px' }}>
                      Email: {mfr.email}
                    </p>
                  )}
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: 4, 
                    fontSize: '12px',
                    backgroundColor: mfr.isVerified ? '#00aa00' : '#ff8800',
                    color: 'white'
                  }}>
                    {mfr.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                  <br />
                  <Link 
                    to={`/manufacturer/${mfr.wallet}`}
                    style={{ fontSize: '14px', marginTop: '8px', display: 'inline-block' }}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.total > filters.limit && (
        <div style={{ marginTop: 20, display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button 
            disabled={filters.offset === 0}
            onClick={() => setFilters(f => ({ ...f, offset: Math.max(0, f.offset - f.limit) }))}
          >
            Previous
          </button>
          <span>Page {Math.floor(filters.offset / filters.limit) + 1}</span>
          <button 
            disabled={!pagination.hasMore}
            onClick={() => setFilters(f => ({ ...f, offset: f.offset + f.limit }))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
