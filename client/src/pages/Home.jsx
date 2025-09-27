import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getGlobalStats } from '../api/verify';
import { useRole } from '../hooks/useRole';

export default function Home() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['stats'],
    queryFn: getGlobalStats,
    retry: false, // Don't retry on error
    staleTime: 30000, // Cache for 30 seconds
  });

  const { 
    role, 
    isAdmin, 
    isManufacturer, 
    isUser, 
    isConnected, 
    manufacturer,
    canRegisterBatch,
    canRegisterAsManufacturer
  } = useRole();

  // Use real data from API
  const stats = data?.stats || {};
  const isBackendUnavailable = error && error.message?.includes('ECONNREFUSED');

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ 
          display: 'inline-block',
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #4f46e5',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '16px', color: '#666' }}>Loading system stats...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const renderRoleBasedActions = () => {
    if (isAdmin) {
      return (
        <div style={{ marginBottom: 24 }}>
          <h3>Admin Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <Link to="/admin">
              <button style={{ backgroundColor: '#ff6600', color: 'white', padding: '12px 24px', width: '100%' }}>
                🔧 Admin Dashboard
              </button>
            </Link>
            <Link to="/manufacturer/verify">
              <button style={{ backgroundColor: '#00aa00', color: 'white', padding: '12px 24px', width: '100%' }}>
                ✅ Verify Manufacturers
              </button>
            </Link>
            <Link to="/manufacturer/list?status=unverified">
              <button style={{ backgroundColor: '#ff8800', color: 'white', padding: '12px 24px', width: '100%' }}>
                ⏳ Pending Approvals
              </button>
            </Link>
            <Link to="/reports/expired">
              <button style={{ backgroundColor: '#ff4444', color: 'white', padding: '12px 24px', width: '100%' }}>
                📊 Expired Reports
              </button>
            </Link>
          </div>
        </div>
      );
    }
    
    if (isManufacturer) {
      return (
        <div style={{ marginBottom: 24 }}>
          <h3>Manufacturer Dashboard</h3>
          
          {/* Status Alert */}
          <div style={{ 
            marginBottom: 16,
            padding: 12,
            backgroundColor: manufacturer?.isVerified ? '#d4edda' : '#fff3cd',
            border: `1px solid ${manufacturer?.isVerified ? '#c3e6cb' : '#ffeaa7'}`,
            borderRadius: 4
          }}>
            <p style={{ margin: 0, color: manufacturer?.isVerified ? '#155724' : '#856404' }}>
              <strong>Status:</strong> {manufacturer?.isVerified ? '✅ Verified & Active' : '⏳ Pending Admin Verification'}
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <Link to="/manufacturer/me">
              <button style={{ backgroundColor: '#0088aa', color: 'white', padding: '12px 24px', width: '100%' }}>
                👤 My Profile
              </button>
            </Link>
            <Link to="/manufacturer/me/batches">
              <button style={{ backgroundColor: '#3182ce', color: 'white', padding: '12px 24px', width: '100%' }}>
                📦 My Batches
              </button>
            </Link>
            {canRegisterBatch && (
              <Link to="/batch/register">
                <button style={{ backgroundColor: '#38a169', color: 'white', padding: '12px 24px', width: '100%' }}>
                  + Register Batch
                </button>
              </Link>
            )}
            {!manufacturer?.isVerified && (
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ 
                  padding: 12, 
                  backgroundColor: '#e7f3ff',
                  border: '1px solid #b3d9ff',
                  borderRadius: 4,
                  textAlign: 'center'
                }}>
                  <p style={{ margin: 0, color: '#0056b3' }}>
                    ⏳ Awaiting verification to register medicine batches
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    // User or Guest actions
    return (
      <div style={{ marginBottom: 24 }}>
        <h3>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <Link to="/verify">
            <button style={{ backgroundColor: '#00aa00', color: 'white', padding: '12px 24px', width: '100%' }}>
              🔍 Verify Medicine
            </button>
          </Link>
          <Link to="/manufacturer/list">
            <button style={{ backgroundColor: '#0088aa', color: 'white', padding: '12px 24px', width: '100%' }}>
              🏭 View Manufacturers
            </button>
          </Link>
          <Link to="/reports/expired">
            <button style={{ backgroundColor: '#ff8800', color: 'white', padding: '12px 24px', width: '100%' }}>
              📊 Expired Reports
            </button>
          </Link>
          {canRegisterAsManufacturer && isConnected && (
            <Link to="/manufacturer/register">
              <button style={{ backgroundColor: '#6366f1', color: 'white', padding: '12px 24px', width: '100%' }}>
                🏭 Register as Manufacturer
              </button>
            </Link>
          )}
        </div>
        
        {!isConnected && (
          <div style={{ 
            marginTop: 16, 
            padding: 12, 
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: 4,
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, color: '#6c757d' }}>
              💡 Connect your wallet to access manufacturer features
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* API Error */}
      {isBackendUnavailable && (
        <div style={{ 
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#fef2f2',
          border: '2px solid #ef4444',
          borderRadius: '8px'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#dc2626' }}>
            ❌ Backend Server Not Available
          </h4>
          <p style={{ margin: '0 0 8px 0', color: '#dc2626' }}>
            Cannot connect to backend server. Please start the backend server on port 5000.
          </p>
          <p style={{ margin: '0', color: '#dc2626', fontSize: '14px' }}>
            Run: <code style={{ backgroundColor: '#f3f4f6', padding: '2px 4px', borderRadius: '3px' }}>npm run backend</code>
          </p>
        </div>
      )}

      <h2 style={{ marginBottom: '24px', color: '#1f2937' }}>🏥 Medicine Verification System</h2>
      
      {/* Role-based greeting */}
      <div style={{ marginBottom: '24px' }}>
        {isConnected && (
          <div style={{ 
            padding: '16px', 
            backgroundColor: '#f0f9ff',
            border: '1px solid #0ea5e9',
            borderRadius: '8px' 
          }}>
            <p style={{ margin: 0, color: '#0c4a6e' }}>
              Welcome back, <strong>{role === 'admin' ? 'Admin' : role === 'manufacturer' ? manufacturer?.name || 'Manufacturer' : 'User'}</strong>! 
              {role === 'admin' && ' You have full system access.'}
              {role === 'manufacturer' && manufacturer?.isVerified && ' You can register medicine batches.'}
              {role === 'manufacturer' && !manufacturer?.isVerified && ' Pending verification to register batches.'}
              {role === 'user' && ' You can verify medicines and register as a manufacturer.'}
            </p>
          </div>
        )}
      </div>

      {renderRoleBasedActions()}
      
      {/* System Overview */}
      <div style={{ marginBottom: 24 }}>
        <h3>System Overview</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 20
        }}>
          <div style={{ padding: 16, border: '2px solid #00aa00', borderRadius: 8, textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#00aa00' }}>Total Batches</h4>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>
              {stats.totalBatches || 0}
            </p>
          </div>
          
          <div style={{ padding: 16, border: '2px solid #0088aa', borderRadius: 8, textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#0088aa' }}>Manufacturers</h4>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>
              {stats.totalManufacturers || 0}
            </p>
          </div>
          
          <div style={{ padding: 16, border: '2px solid #ff8800', borderRadius: 8, textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#ff8800' }}>Expired Scans</h4>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>
              {stats.totalExpiredScans || 0}
            </p>
          </div>
          
          <div style={{ padding: 16, border: '2px solid #ff4444', borderRadius: 8, textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#ff4444' }}>Recalled Batches</h4>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>
              {stats.totalRecalledBatches || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Common Actions */}
      <div style={{ marginBottom: 24 }}>
        <h3>Common Actions</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/verify">
            <button style={{ backgroundColor: '#00aa00', color: 'white', padding: '12px 24px' }}>
              🔍 Verify Medicine
            </button>
          </Link>
          <Link to="/manufacturer/list">
            <button style={{ backgroundColor: '#0088aa', color: 'white', padding: '12px 24px' }}>
              🏭 View Manufacturers
            </button>
          </Link>
          <Link to="/reports/expired">
            <button style={{ backgroundColor: '#ff8800', color: 'white', padding: '12px 24px' }}>
              📊 Expired Reports
            </button>
          </Link>
        </div>
      </div>

      <details style={{ marginTop: 20 }}>
        <summary>System Technical Details</summary>
        <div style={{ marginTop: 12, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
          <pre>{JSON.stringify(stats, null, 2)}</pre>
        </div>
      </details>
    </div>
  );
}
