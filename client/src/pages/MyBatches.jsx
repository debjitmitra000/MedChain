import { Link } from 'react-router-dom';
import { useRole } from '../hooks/useRole';
import { useQuery } from '@tanstack/react-query';
import { getManufacturerBatches } from '../api/manufacturer';

export default function MyBatches() {
  const { 
    isConnected, 
    isManufacturer, 
    address,
    canRegisterBatch 
  } = useRole();

  const { data: batchesInfo, isLoading, error } = useQuery({
    queryKey: ['my-batches', address],
    queryFn: () => getManufacturerBatches(address),
    enabled: isManufacturer && !!address,
    retry: 1
  });

  if (!isConnected) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <h3>Connect Wallet Required</h3>
        <p>Please connect your MetaMask wallet to view your batches.</p>
      </div>
    );
  }

  if (!isManufacturer) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <h3>Manufacturer Access Required</h3>
        <p>You need to be a registered manufacturer to view this page.</p>
        <Link to="/manufacturer/register">
          <button style={{ backgroundColor: '#0088aa', color: 'white', padding: '12px 24px' }}>
            Register as Manufacturer
          </button>
        </Link>
      </div>
    );
  }

  if (isLoading) return <p>Loading your batches...</p>;
  if (error) return <p>Error loading batches: {error.message}</p>;

  const batches = batchesInfo?.data?.batches || [];

  const getStatusColor = (batch) => {
    if (batch.isRecalled) return '#e53e3e';
    if (!batch.isActive) return '#d69e2e';
    return '#38a169';
  };

  const getStatusText = (batch) => {
    if (batch.isRecalled) return 'RECALLED';
    if (!batch.isActive) return 'INACTIVE';
    return 'ACTIVE';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h3>My Medicine Batches ({batches.length})</h3>
        {canRegisterBatch && (
          <Link to="/batch/register">
            <button style={{ backgroundColor: '#38a169', color: 'white', padding: '8px 16px' }}>
              + Register New Batch
            </button>
          </Link>
        )}
      </div>

      {/* Summary Stats */}
      <div style={{ 
        marginBottom: 24,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 12
      }}>
        <div style={{ padding: 12, backgroundColor: '#f0fff4', border: '1px solid #38a169', borderRadius: 4, textAlign: 'center' }}>
          <h5 style={{ margin: '0 0 8px 0', color: '#38a169' }}>Active Batches</h5>
          <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#38a169' }}>
            {batches.filter(b => b.isActive && !b.isRecalled).length}
          </p>
        </div>
        
        <div style={{ padding: 12, backgroundColor: '#fff8f0', border: '1px solid #d69e2e', borderRadius: 4, textAlign: 'center' }}>
          <h5 style={{ margin: '0 0 8px 0', color: '#d69e2e' }}>Inactive</h5>
          <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#d69e2e' }}>
            {batches.filter(b => !b.isActive && !b.isRecalled).length}
          </p>
        </div>
        
        <div style={{ padding: 12, backgroundColor: '#fff5f5', border: '1px solid #e53e3e', borderRadius: 4, textAlign: 'center' }}>
          <h5 style={{ margin: '0 0 8px 0', color: '#e53e3e' }}>Recalled</h5>
          <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#e53e3e' }}>
            {batches.filter(b => b.isRecalled).length}
          </p>
        </div>
        
        <div style={{ padding: 12, backgroundColor: '#fff8f0', border: '1px solid #ff8800', borderRadius: 4, textAlign: 'center' }}>
          <h5 style={{ margin: '0 0 8px 0', color: '#ff8800' }}>Expired Scans</h5>
          <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#ff8800' }}>
            {batches.reduce((sum, b) => sum + (b.expiredScanCount || 0), 0)}
          </p>
        </div>
      </div>

      {batches.length === 0 ? (
        <div style={{ 
          padding: 40, 
          textAlign: 'center', 
          backgroundColor: '#f7fafc', 
          border: '1px solid #e2e8f0',
          borderRadius: 8 
        }}>
          <h4>No Batches Yet</h4>
          <p>You haven't registered any medicine batches yet.</p>
          {canRegisterBatch ? (
            <Link to="/batch/register">
              <button style={{ backgroundColor: '#38a169', color: 'white', padding: '12px 24px' }}>
                Register Your First Batch
              </button>
            </Link>
          ) : (
            <div>
              <p style={{ color: '#666', fontSize: '14px' }}>
                Complete manufacturer verification to register batches.
              </p>
              <Link to="/manufacturer/me">
                <button style={{ backgroundColor: '#0088aa', color: 'white', padding: '12px 24px' }}>
                  View Profile Status
                </button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Batch List */}
          <div style={{ display: 'grid', gap: 16 }}>
            {batches.map((batch, i) => (
              <div key={i} style={{ 
                padding: 20, 
                border: `2px solid ${getStatusColor(batch)}`, 
                borderRadius: 8,
                backgroundColor: batch.isRecalled ? '#fff5f5' : 
                               batch.isActive ? '#f0fff4' : '#fff8f0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <h4 style={{ margin: 0 }}>
                        <Link to={`/batch/${batch.batchId}`} style={{ color: '#3182ce', textDecoration: 'none' }}>
                          {batch.batchId}
                        </Link>
                      </h4>
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: 12, 
                        fontSize: '12px',
                        backgroundColor: getStatusColor(batch),
                        color: 'white',
                        fontWeight: 'bold'
                      }}>
                        {getStatusText(batch)}
                      </span>
                    </div>
                    
                    <p style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 'bold', color: '#2d3748' }}>
                      {batch.medicineName}
                    </p>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                      gap: 12,
                      fontSize: '14px',
                      color: '#4a5568'
                    }}>
                      <div>
                        <strong>Manufacturing:</strong><br />
                        {batch.manufacturingDateFormatted}
                      </div>
                      <div>
                        <strong>Expiry:</strong><br />
                        {batch.expiryDateFormatted}
                      </div>
                      <div>
                        <strong>Created:</strong><br />
                        {batch.createdAtFormatted}
                      </div>
                      {batch.expiredScanCount > 0 && (
                        <div>
                          <strong>Expired Scans:</strong><br />
                          <span style={{ color: '#ff8800', fontWeight: 'bold' }}>
                            {batch.expiredScanCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Link to={`/batch/${batch.batchId}`}>
                      <button style={{ 
                        backgroundColor: '#3182ce',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}>
                        View Details
                      </button>
                    </Link>
                    
                    {!batch.isRecalled && batch.isActive && (
                      <Link to={`/batch/${batch.batchId}/recall`}>
                        <button style={{ 
                          backgroundColor: '#e53e3e',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: 4,
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}>
                          🚨 Recall
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
