// frontend/src/pages/ManufacturerDetail.jsx
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getManufacturer, getManufacturerBatches } from '../api/manufacturer';
import { useAccount } from 'wagmi';

export default function ManufacturerDetail() {
  const { address: manufacturerAddress } = useParams();
  const navigate = useNavigate();
  const { address: connectedAddress } = useAccount();
  
  const { data: manufacturerInfo, isLoading: mfrLoading, error: mfrError } = useQuery({ 
    queryKey: ['mfr', manufacturerAddress], 
    queryFn: () => getManufacturer(manufacturerAddress),
    enabled: !!manufacturerAddress,
    retry: 1
  });
  
  const { data: batchesInfo, isLoading: batchesLoading, error: batchesError } = useQuery({ 
    queryKey: ['mfr-batches', manufacturerAddress], 
    queryFn: () => getManufacturerBatches(manufacturerAddress),
    enabled: !!manufacturerAddress,
    retry: 1
  });

  if (mfrLoading) return (
    <div>
      <h3>Loading Manufacturer Details...</h3>
      <p>Address: <strong>{manufacturerAddress}</strong></p>
    </div>
  );

  if (mfrError) {
    return (
      <div>
        <h3>Manufacturer Not Found</h3>
        <div style={{ 
          padding: 16, 
          backgroundColor: '#fff5f5', 
          border: '1px solid #feb2b2', 
          borderRadius: 4,
          marginBottom: 20 
        }}>
          <p style={{ color: '#c53030' }}>
            <strong>Error:</strong> {mfrError.message}
          </p>
          <p>Address: <strong>{manufacturerAddress}</strong></p>
          <p>This manufacturer may not be registered in the system.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/manufacturer/list">
            <button style={{ backgroundColor: '#3182ce', color: 'white' }}>
              View All Manufacturers
            </button>
          </Link>
          <button onClick={() => navigate('/')}
                  style={{ backgroundColor: '#38a169', color: 'white' }}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const manufacturer = manufacturerInfo?.data?.manufacturer || manufacturerInfo?.manufacturer;
  const batches = batchesInfo?.data?.batches || batchesInfo?.batches || [];
  const isOwnProfile = connectedAddress?.toLowerCase() === manufacturerAddress?.toLowerCase();

  const getStatusBadge = (isVerified, isActive) => {
    let color, text;
    if (isVerified && isActive) {
      color = '#38a169'; text = '✅ Verified & Active';
    } else if (isVerified && !isActive) {
      color = '#d69e2e'; text = '⚠️ Verified but Inactive';
    } else if (!isVerified && isActive) {
      color = '#ed8936'; text = '⏳ Unverified';
    } else {
      color = '#e53e3e'; text = '❌ Inactive';
    }
    
    return (
      <span style={{ 
        padding: '4px 12px', 
        backgroundColor: color, 
        color: 'white', 
        borderRadius: 16,
        fontSize: '14px',
        fontWeight: 'bold'
      }}>
        {text}
      </span>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3>Manufacturer Profile</h3>
          {isOwnProfile && (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/batch/register">
                <button style={{ backgroundColor: '#38a169', color: 'white' }}>
                  + Register New Batch
                </button>
              </Link>
            </div>
          )}
        </div>

        {manufacturer && (
          <div style={{ 
            padding: 20, 
            backgroundColor: '#f7fafc', 
            borderRadius: 8,
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h4 style={{ margin: '0 0 8px 0' }}>{manufacturer.name}</h4>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#4a5568' }}>
                  {manufacturerAddress}
                </p>
              </div>
              <div>
                {getStatusBadge(manufacturer.isVerified, manufacturer.isActive)}
              </div>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: 16 
            }}>
              <div>
                <strong>License Number:</strong><br />
                {manufacturer.license}
              </div>
              {manufacturer.email && (
                <div>
                  <strong>Email:</strong><br />
                  {manufacturer.email}
                </div>
              )}
              <div>
                <strong>Registered:</strong><br />
                {manufacturer.registeredDate || 'Unknown'}
              </div>
              <div>
                <strong>Status:</strong><br />
                {manufacturer.status?.replace(/_/g, ' ').toUpperCase() || 'Unknown'}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Batches Section */}
      <div>
        <h4>Medicine Batches ({batches.length})</h4>
        
        {batchesLoading ? (
          <p>Loading batches...</p>
        ) : batchesError ? (
          <div style={{ 
            padding: 12, 
            backgroundColor: '#fff5f5', 
            border: '1px solid #feb2b2', 
            borderRadius: 4 
          }}>
            <p style={{ color: '#c53030' }}>
              Failed to load batches: {batchesError.message}
            </p>
          </div>
        ) : batches.length === 0 ? (
          <div style={{ 
            padding: 20, 
            textAlign: 'center', 
            backgroundColor: '#f7fafc', 
            border: '1px solid #e2e8f0',
            borderRadius: 8 
          }}>
            <p>No batches registered yet.</p>
            {isOwnProfile && manufacturer?.isVerified && (
              <Link to="/batch/register">
                <button style={{ backgroundColor: '#38a169', color: 'white' }}>
                  Register Your First Batch
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {batches.map((batch, i) => (
              <div key={i} style={{ 
                padding: 16, 
                border: '1px solid #e2e8f0', 
                borderRadius: 8,
                backgroundColor: batch.isRecalled ? '#fff5f5' : 
                               batch.isActive ? '#f0fff4' : '#fff8f0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h5 style={{ margin: '0 0 8px 0' }}>
                      <Link to={`/batch/${batch.batchId}`} style={{ color: '#3182ce' }}>
                        {batch.batchId}
                      </Link>
                    </h5>
                    <p style={{ margin: '4px 0', fontWeight: 'bold' }}>
                      {batch.medicineName}
                    </p>
                    <div style={{ fontSize: '14px', color: '#4a5568' }}>
                      <p style={{ margin: '2px 0' }}>
                        <strong>Mfg:</strong> {batch.manufacturingDateFormatted}
                      </p>
                      <p style={{ margin: '2px 0' }}>
                        <strong>Exp:</strong> {batch.expiryDateFormatted}
                      </p>
                      {batch.expiredScanCount > 0 && (
                        <p style={{ margin: '2px 0', color: '#d69e2e' }}>
                          <strong>Expired Scans:</strong> {batch.expiredScanCount}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: 12, 
                      fontSize: '12px',
                      backgroundColor: batch.isRecalled ? '#e53e3e' : 
                                     batch.isActive ? '#38a169' : '#d69e2e',
                      color: 'white'
                    }}>
                      {batch.isRecalled ? 'RECALLED' : 
                       batch.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ backgroundColor: '#718096', color: 'white' }}
        >
          ← Back
        </button>
        <Link to="/manufacturer/list">
          <button style={{ backgroundColor: '#3182ce', color: 'white' }}>
            View All Manufacturers
          </button>
        </Link>
      </div>
    </div>
  );
}
