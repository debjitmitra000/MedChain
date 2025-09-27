import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';
import { getGlobalStats, getExpiredReports } from '../api/verify';
import { getUnverifiedManufacturers } from '../api/manufacturer';

export default function AdminDashboard() {
  const { address } = useAccount();
  
  const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['stats'],
    queryFn: getGlobalStats,
    retry: false, // Don't retry on error
    staleTime: 30000, // Cache for 30 seconds
  });
  
  const { data: reportsData, isLoading: reportsLoading, error: reportsError } = useQuery({
    queryKey: ['expired-reports'],
    queryFn: getExpiredReports,
    retry: false,
    staleTime: 30000,
  });

  const { data: unverifiedData, isLoading: unverifiedLoading, error: unverifiedError } = useQuery({
    queryKey: ['unverified-manufacturers'],
    queryFn: getUnverifiedManufacturers,
    retry: false,
    staleTime: 30000,
  });

  // Mock data for demonstration when API is not available
  const mockStats = {
    totalBatches: 1247,
    totalManufacturers: 23,
    totalRecalledBatches: 3,
    totalExpiredScans: 15,
    network: 'Sepolia Testnet',
    chainId: '11155111',
    adminAddress: address || '0x0000000000000000000000000000000000000000'
  };

  const mockReports = [
    { batchId: 'BATCH-001', medicineName: 'Aspirin 100mg', expiredScanCount: 5 },
    { batchId: 'BATCH-002', medicineName: 'Paracetamol 500mg', expiredScanCount: 3 },
    { batchId: 'BATCH-003', medicineName: 'Ibuprofen 200mg', expiredScanCount: 2 }
  ];

  const mockUnverifiedManufacturers = [
    { name: 'PharmaCorp Ltd', license: 'PH-2024-001', wallet: '0x1234...5678', email: 'contact@pharmacorp.com' },
    { name: 'MedSupply Inc', license: 'MS-2024-002', wallet: '0x8765...4321', email: 'info@medsupply.com' }
  ];

  // Use mock data if API is not available
  const stats = statsData?.stats || mockStats;
  const reports = reportsData?.data?.reports || mockReports;
  const unverifiedManufacturers = unverifiedData?.data?.manufacturers || mockUnverifiedManufacturers;
  
  // Check if user is admin
  const isAdmin = address && stats?.adminAddress && 
    address.toLowerCase() === stats.adminAddress.toLowerCase();

  // Show loading state
  if (statsLoading || reportsLoading || unverifiedLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ 
          display: 'inline-block',
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #4f46e5',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '16px', color: '#666' }}>Loading admin dashboard...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Show API error warning if backend is not available
  const hasApiError = statsError || reportsError || unverifiedError;
  const isBackendUnavailable = hasApiError && (
    statsError?.message?.includes('ECONNREFUSED') ||
    reportsError?.message?.includes('ECONNREFUSED') ||
    unverifiedError?.message?.includes('ECONNREFUSED')
  );

  if (!isAdmin) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        margin: '20px'
      }}>
        <h3 style={{ color: '#dc2626', marginBottom: '16px' }}>🚫 Access Denied</h3>
        <p style={{ color: '#7f1d1d', marginBottom: '8px' }}>Only admins can access this dashboard.</p>
        <p style={{ color: '#7f1d1d' }}>Connect with admin wallet to continue.</p>
        <div style={{ marginTop: '20px' }}>
          <Link to="/">
            <button style={{ 
              backgroundColor: '#4f46e5', 
              color: 'white', 
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}>
              ← Back to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* API Status Warning */}
      {isBackendUnavailable && (
        <div style={{ 
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#fef3c7',
          border: '2px solid #f59e0b',
          borderRadius: '8px'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#92400e' }}>
            ⚠️ Backend Server Not Available
          </h4>
          <p style={{ margin: '0 0 8px 0', color: '#92400e' }}>
            The backend API server is not running. Showing demo data for demonstration purposes.
          </p>
          <p style={{ margin: '0', color: '#92400e', fontSize: '14px' }}>
            To connect to real data, start the backend server on port 5000.
          </p>
        </div>
      )}

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '32px',
        paddingBottom: '16px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <h2 style={{ margin: 0, color: '#1f2937' }}>🔧 Admin Dashboard</h2>
        <div style={{ 
          padding: '8px 16px', 
          backgroundColor: '#dcfce7', 
          color: '#166534',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          Admin Mode Active
        </div>
      </div>
      
      {/* Quick Actions */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '16px', color: '#374151' }}>Quick Actions</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px' 
        }}>
          <Link to="/manufacturer/verify">
            <button style={{ 
              backgroundColor: '#10b981', 
              color: 'white', 
              padding: '16px 24px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              width: '100%',
              fontSize: '16px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
            >
              ✅ Verify Manufacturers
            </button>
          </Link>
          <Link to="/manufacturer/list?status=unverified">
            <button style={{ 
              backgroundColor: '#f59e0b', 
              color: 'white', 
              padding: '16px 24px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              width: '100%',
              fontSize: '16px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#d97706'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#f59e0b'}
            >
              <span>⏳ Pending Approvals</span>
              {unverifiedManufacturers.length > 0 && (
                <span style={{ 
                  backgroundColor: '#dc2626', 
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {unverifiedManufacturers.length}
                </span>
              )}
            </button>
          </Link>
          <Link to="/reports/expired">
            <button style={{ 
              backgroundColor: '#ef4444', 
              color: 'white', 
              padding: '16px 24px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              width: '100%',
              fontSize: '16px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
            >
              📊 Expired Reports
            </button>
          </Link>
        </div>
      </div>

      {/* Pending Verifications Alert */}
      {unverifiedManufacturers.length > 0 && (
        <div style={{ 
          marginBottom: '32px',
          padding: '20px',
          backgroundColor: '#fef3c7',
          border: '2px solid #f59e0b',
          borderRadius: '12px'
        }}>
          <h4 style={{ margin: '0 0 16px 0', color: '#92400e', fontSize: '18px' }}>
            ⚠️ {unverifiedManufacturers.length} Manufacturer{unverifiedManufacturers.length > 1 ? 's' : ''} Awaiting Verification
          </h4>
          <div style={{ display: 'grid', gap: '12px' }}>
            {unverifiedManufacturers.slice(0, 3).map((mfr, i) => (
              <div key={i} style={{ 
                padding: '16px', 
                backgroundColor: 'white', 
                borderRadius: '8px',
                border: '1px solid #fbbf24',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h5 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '16px' }}>
                      {mfr.name}
                    </h5>
                    <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '14px' }}>
                      License: {mfr.license}
                    </p>
                    <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '14px' }}>
                      Wallet: {mfr.wallet?.slice(0, 10)}...{mfr.wallet?.slice(-8)}
                    </p>
                    <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>
                      Email: {mfr.email}
                    </p>
                  </div>
                  <Link to="/manufacturer/verify">
                    <button style={{ 
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                    >
                      Verify Now
                    </button>
                  </Link>
                </div>
              </div>
            ))}
            {unverifiedManufacturers.length > 3 && (
              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <Link to="/manufacturer/list?status=unverified">
                  <button style={{ 
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}>
                    View All {unverifiedManufacturers.length} Pending
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* System Statistics */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '20px', color: '#374151' }}>System Statistics</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px' 
        }}>
          <div style={{ 
            padding: '24px', 
            backgroundColor: 'white',
            border: '2px solid #10b981', 
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#10b981', fontSize: '16px' }}>Total Batches</h4>
            <p style={{ margin: 0, fontSize: '36px', fontWeight: 'bold', color: '#1f2937' }}>
              {stats.totalBatches || 0}
            </p>
          </div>
          
          <div style={{ 
            padding: '24px', 
            backgroundColor: 'white',
            border: '2px solid #3b82f6', 
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#3b82f6', fontSize: '16px' }}>Total Manufacturers</h4>
            <p style={{ margin: 0, fontSize: '36px', fontWeight: 'bold', color: '#1f2937' }}>
              {stats.totalManufacturers || 0}
            </p>
            {unverifiedManufacturers.length > 0 && (
              <p style={{ margin: '8px 0 0 0', color: '#f59e0b', fontSize: '14px', fontWeight: '500' }}>
                ({unverifiedManufacturers.length} pending)
              </p>
            )}
          </div>
          
          <div style={{ 
            padding: '24px', 
            backgroundColor: 'white',
            border: '2px solid #ef4444', 
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#ef4444', fontSize: '16px' }}>Recalled Batches</h4>
            <p style={{ margin: 0, fontSize: '36px', fontWeight: 'bold', color: '#ef4444' }}>
              {stats.totalRecalledBatches || 0}
            </p>
          </div>
          
          <div style={{ 
            padding: '24px', 
            backgroundColor: 'white',
            border: '2px solid #f59e0b', 
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#f59e0b', fontSize: '16px' }}>Expired Scans</h4>
            <p style={{ margin: 0, fontSize: '36px', fontWeight: 'bold', color: '#f59e0b' }}>
              {stats.totalExpiredScans || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Expired Medicine Reports */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '20px', color: '#374151' }}>Recent Expired Medicine Reports</h3>
        {reports.length === 0 ? (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center',
            backgroundColor: '#f9fafb',
            border: '2px dashed #d1d5db',
            borderRadius: '12px'
          }}>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '16px' }}>
              ✅ No expired medicine reports found
            </p>
          </div>
        ) : (
          <div>
            <p style={{ marginBottom: '16px', color: '#6b7280' }}>
              Showing latest {Math.min(5, reports.length)} expired reports:
            </p>
            <div style={{ display: 'grid', gap: '12px' }}>
              {reports.slice(0, 5).map((report, i) => (
                <div key={i} style={{ 
                  padding: '16px', 
                  backgroundColor: 'white',
                  border: '2px solid #f59e0b', 
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Link to={`/batch/${report.batchId}`} style={{ 
                        fontWeight: 'bold', 
                        color: '#1f2937',
                        textDecoration: 'none',
                        fontSize: '16px'
                      }}>
                        {report.batchId}
                      </Link>
                      <span style={{ color: '#6b7280', margin: '0 8px' }}>-</span>
                      <span style={{ color: '#374151' }}>{report.medicineName}</span>
                    </div>
                    <span style={{ 
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      {report.expiredScanCount} scans
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {reports.length > 5 && (
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <Link to="/reports/expired">
                  <button style={{ 
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}>
                    View All Reports
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Network Info */}
      <div style={{ 
        padding: '24px',
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '12px'
      }}>
        <h3 style={{ marginBottom: '16px', color: '#374151' }}>Network Information</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          fontSize: '14px'
        }}>
          <div>
            <strong style={{ color: '#6b7280' }}>Network:</strong>
            <p style={{ margin: '4px 0 0 0', color: '#1f2937' }}>{stats.network}</p>
          </div>
          <div>
            <strong style={{ color: '#6b7280' }}>Chain ID:</strong>
            <p style={{ margin: '4px 0 0 0', color: '#1f2937' }}>{stats.chainId}</p>
          </div>
          <div>
            <strong style={{ color: '#6b7280' }}>Admin Address:</strong>
            <p style={{ margin: '4px 0 0 0', color: '#1f2937', fontFamily: 'monospace', fontSize: '12px' }}>
              {stats.adminAddress}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
