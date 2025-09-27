import { Link, useNavigate } from 'react-router-dom';
import { useRole } from '../hooks/useRole';
import { useQuery } from '@tanstack/react-query';
import { getManufacturerBatches } from '../api/manufacturer';

export default function MyManufacturer() {
  const navigate = useNavigate();
  const { 
    isConnected, 
    isManufacturer, 
    manufacturer, 
    address,
    canRegisterBatch,
    isVerified,
    isActive
  } = useRole();

  const { data: batchesInfo, isLoading: batchesLoading } = useQuery({
    queryKey: ['my-batches', address],
    queryFn: () => getManufacturerBatches(address),
    enabled: isManufacturer && !!address,
    retry: 1
  });

  if (!isConnected) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <h3>Connect Wallet Required</h3>
        <p>Please connect your MetaMask wallet to view your manufacturer profile.</p>
      </div>
    );
  }

  if (!isManufacturer || !manufacturer) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <h3>Not Registered as Manufacturer</h3>
        <p>You are not registered as a manufacturer in the system.</p>
        <Link to="/manufacturer/register">
          <button style={{ backgroundColor: '#0088aa', color: 'white', padding: '12px 24px' }}>
            Register as Manufacturer
          </button>
        </Link>
      </div>
    );
  }

  const batches = batchesInfo?.data?.batches || [];

  const getStatusBadge = (isVerified, isActive) => {
    let color, text;
    if (isVerified && isActive) {
      color = '#38a169'; text = '✅ Verified & Active';
    } else if (isVerified && !isActive) {
      color = '#d69e2e'; text = '⚠️ Verified but Inactive';
    } else if (!isVerified && isActive) {
      color = '#ed8936'; text = '⏳ Awaiting Verification';
    } else {
      color = '#e53e3e'; text = '❌ Inactive';
    }
    
    return (
      <span style={{ 
        padding: '6px 14px', 
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
      <h3>My Manufacturer Profile</h3>
      
      {/* Profile Card */}
      <div style={{ 
        padding: 24, 
        backgroundColor: '#f7fafc', 
        borderRadius: 12,
        border: '1px solid #e2e8f0',
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>{manufacturer.name}</h4>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#4a5568' }}>
              {address}
            </p>
          </div>
          <div>
            {getStatusBadge(manufacturer.isVerified, manufacturer.isActive)}
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 16,
          marginBottom: 20
        }}>
          <div>
            <strong>License Number:</strong><br />
            <span style={{ fontSize: '16px' }}>{manufacturer.license}</span>
          </div>
          <div>
            <strong>Email:</strong><br />
            <span style={{ fontSize: '16px' }}>{manufacturer.email}</span>
          </div>
          <div>
            <strong>Registered:</strong><br />
            <span style={{ fontSize: '16px' }}>{manufacturer.registeredDate}</span>
          </div>
          <div>
            <strong>Total Batches:</strong><br />
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#0088aa' }}>
              {batches.length}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {canRegisterBatch && (
            <Link to="/batch/register">
              <button style={{ 
                backgroundColor: '#38a169', 
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}>
                + Register New Batch
              </button>
            </Link>
          )}
          
          <Link to="/manufacturer/me/batches">
            <button style={{ 
              backgroundColor: '#0088aa', 
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}>
              View All My Batches ({batches.length})
            </button>
          </Link>
          
          {!manufacturer.isVerified && (
            <div style={{ 
              padding: '10px 20px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              <strong>⏳ Verification Pending</strong><br />
              Contact admin to verify your manufacturer account
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        <div style={{ padding: 16, border: '2px solid #38a169', borderRadius: 8, textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#38a169' }}>Active Batches</h4>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
            {batches.filter(b => b.isActive && !b.isRecalled).length}
          </p>
        </div>
        
        <div style={{ padding: 16, border: '2px solid #e53e3e', borderRadius: 8, textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#e53e3e' }}>Recalled</h4>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
            {batches.filter(b => b.isRecalled).length}
          </p>
        </div>
        
        <div style={{ padding: 16, border: '2px solid #ff8800', borderRadius: 8, textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#ff8800' }}>Expired Scans</h4>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
            {batches.reduce((sum, b) => sum + (b.expiredScanCount || 0), 0)}
          </p>
        </div>
      </div>

      {/* Recent Batches Preview */}
      <div>
        <h4>Recent Batches</h4>
        {batchesLoading ? (
          <p>Loading your batches...</p>
        ) : batches.length === 0 ? (
          <div style={{ 
            padding: 40, 
            textAlign: 'center', 
            backgroundColor: '#f7fafc', 
            border: '1px solid #e2e8f0',
            borderRadius: 8 
          }}>
            <p style={{ fontSize: '18px', marginBottom: 16 }}>No batches registered yet</p>
            {canRegisterBatch ? (
              <Link to="/batch/register">
                <button style={{ backgroundColor: '#38a169', color: 'white', padding: '12px 24px' }}>
                  Register Your First Batch
                </button>
              </Link>
            ) : (
              <p style={{ color: '#666' }}>
                Complete verification to start registering batches
              </p>
            )}
          </div>
        ) : (
          <div>
            <div style={{ display: 'grid', gap: 12 }}>
              {batches.slice(0, 3).map((batch, i) => (
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
                        <span><strong>Exp:</strong> {batch.expiryDateFormatted}</span>
                        {batch.expiredScanCount > 0 && (
                          <span style={{ marginLeft: 16, color: '#d69e2e' }}>
                            <strong>Expired Scans:</strong> {batch.expiredScanCount}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: 16, 
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: batch.isRecalled ? '#e53e3e' : 
                                     batch.isActive ? '#38a169' : '#d69e2e',
                      color: 'white'
                    }}>
                      {batch.isRecalled ? 'RECALLED' : 
                       batch.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {batches.length > 3 && (
              <Link to="/manufacturer/me/batches">
                <button style={{ 
                  marginTop: 16,
                  backgroundColor: '#0088aa', 
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}>
                  View All {batches.length} Batches
                </button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}