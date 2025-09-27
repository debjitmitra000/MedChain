// frontend/src/pages/BatchDetail.jsx
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBatch, getBatchQR } from '../api/batch';
import { useAccount } from 'wagmi';

export default function BatchDetail() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const { address } = useAccount();
  
  const { data: batchInfo, isLoading: batchLoading, error: batchError } = useQuery({ 
    queryKey: ['batch', batchId], 
    queryFn: () => getBatch(batchId),
    enabled: !!batchId,
    retry: 1
  });
  
  const { data: qrInfo, isLoading: qrLoading, error: qrError } = useQuery({ 
    queryKey: ['batch-qr', batchId], 
    queryFn: () => getBatchQR(batchId),
    enabled: !!batchId,
    retry: 1
  });

  const downloadQRCode = () => {
    const qrCode = qrInfo?.data?.qr?.qrCode;
    if (qrCode) {
      const link = document.createElement('a');
      link.href = qrCode;
      link.download = `QR_${batchId}_${new Date().getTime()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (batchLoading) return (
    <div>
      <h3>Loading Batch Details...</h3>
      <p>Fetching information for batch: <strong>{batchId}</strong></p>
    </div>
  );

  if (batchError) {
    return (
      <div>
        <h3>Batch Not Found</h3>
        <div style={{ 
          padding: 16, 
          backgroundColor: '#fff5f5', 
          border: '1px solid #feb2b2', 
          borderRadius: 4,
          marginBottom: 20 
        }}>
          <p style={{ color: '#c53030' }}>
            <strong>Error:</strong> {batchError.message}
          </p>
          <p>Batch ID: <strong>{batchId}</strong></p>
          <p>This batch may not exist in the system or the ID might be incorrect.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/verify')} 
                  style={{ backgroundColor: '#3182ce', color: 'white' }}>
            Try Different Batch
          </button>
          <button onClick={() => navigate('/')}
                  style={{ backgroundColor: '#38a169', color: 'white' }}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Extract batch data consistently
  const batch = batchInfo?.data?.batch || batchInfo?.batch;
  const status = batchInfo?.data?.status;
  const verification = batchInfo?.data?.verification;

  // Check if current user owns this batch
  const isOwner = address && batch?.manufacturer?.toLowerCase() === address.toLowerCase();

  const getStatusColor = () => {
    if (status?.isRecalled) return '#e53e3e';
    if (status?.isExpired) return '#d69e2e';
    if (status?.isValid) return '#38a169';
    return '#718096';
  };

  const getStatusText = () => {
    if (status?.isRecalled) return '🚫 RECALLED';
    if (status?.isExpired) return '⚠️ EXPIRED';
    if (status?.isValid) return '✅ VALID';
    if (status?.isActive === false) return '⏸️ INACTIVE';
    return '❓ UNKNOWN';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3>Batch Details: {batchId}</h3>
        {isOwner && !status?.isRecalled && (
          <Link to={`/batch/${batchId}/recall`}>
            <button style={{ 
              backgroundColor: '#e53e3e', 
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              🚨 Recall This Batch
            </button>
          </Link>
        )}
      </div>

      {/* Batch Status Card */}
      <div style={{ 
        padding: 16, 
        backgroundColor: '#f7fafc', 
        border: `2px solid ${getStatusColor()}`,
        borderRadius: 8,
        marginBottom: 20 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, color: getStatusColor() }}>
            Status: {getStatusText()}
          </h4>
          {verification?.message && (
            <p style={{ margin: 0, fontSize: '14px', color: '#4a5568' }}>
              {verification.message}
            </p>
          )}
        </div>
      </div>

      {/* Batch Information */}
      {batch && (
        <div style={{ marginBottom: 20 }}>
          <h4>Batch Information</h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: 16,
            padding: 16,
            backgroundColor: '#f7fafc',
            borderRadius: 8,
            border: '1px solid #e2e8f0'
          }}>
            <div>
              <strong>Medicine Name:</strong><br />
              {batch.medicineName}
            </div>
            <div>
              <strong>Batch ID:</strong><br />
              {batch.batchId}
            </div>
            <div>
              <strong>Manufacturer:</strong><br />
              <Link to={`/manufacturer/${batch.manufacturer}`} style={{ color: '#3182ce' }}>
                {batch.manufacturer?.slice(0, 10)}...{batch.manufacturer?.slice(-8)}
              </Link>
            </div>
            <div>
              <strong>Manufacturing Date:</strong><br />
              {batch.manufacturingDateFormatted || 'Unknown'}
            </div>
            <div>
              <strong>Expiry Date:</strong><br />
              {batch.expiryDateFormatted || 'Unknown'}
            </div>
            <div>
              <strong>Created:</strong><br />
              {batch.createdAtFormatted || 'Unknown'}
            </div>
            {batch.expiredScanCount > 0 && (
              <div>
                <strong>Expired Scans:</strong><br />
                <span style={{ color: '#d69e2e', fontWeight: 'bold' }}>
                  {batch.expiredScanCount}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* QR Code Section */}
      <div>
        <h4>QR Code</h4>
        {qrLoading ? (
          <p>Loading QR code...</p>
        ) : qrError ? (
          <div style={{ 
            padding: 12, 
            backgroundColor: '#fff5f5', 
            border: '1px solid #feb2b2', 
            borderRadius: 4 
          }}>
            <p style={{ color: '#c53030' }}>
              Failed to load QR code: {qrError.message}
            </p>
          </div>
        ) : qrInfo?.data?.qr?.qrCode ? (
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 20, 
              marginBottom: 16,
              padding: 16,
              backgroundColor: '#f7fafc',
              borderRadius: 8,
              border: '1px solid #e2e8f0'
            }}>
              <img 
                src={qrInfo.data.qr.qrCode} 
                width={200} 
                height={200} 
                alt="Batch QR Code"
                style={{ border: '2px solid #e2e8f0', borderRadius: 8 }}
              />
              <div>
                <p><strong>QR Code for Batch:</strong> {batchId}</p>
                <p><strong>Format:</strong> {qrInfo.data.qr.format || 'PNG'}</p>
                <p><strong>Size:</strong> {qrInfo.data.qr.size || '200x200'}</p>
                <button 
                  onClick={downloadQRCode}
                  style={{ 
                    backgroundColor: '#38a169', 
                    color: 'white', 
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: 8
                  }}
                >
                  📥 Download QR Code
                </button>
              </div>
            </div>
            
            <details style={{ marginTop: 16 }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                View QR Data (Technical)
              </summary>
              <pre style={{ 
                marginTop: 8, 
                padding: 12, 
                backgroundColor: '#f1f5f9', 
                borderRadius: 4,
                fontSize: '12px',
                overflow: 'auto'
              }}>
                {qrInfo.data.qr.qrData}
              </pre>
            </details>
          </div>
        ) : (
          <p>No QR code available for this batch.</p>
        )}
      </div>

      {/* Actions */}
      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
        <Link to={`/verify/${batchId}`}>
          <button style={{ backgroundColor: '#3182ce', color: 'white' }}>
            🔍 Verify This Batch
          </button>
        </Link>
        <button 
          onClick={() => navigate(-1)}
          style={{ backgroundColor: '#718096', color: 'white' }}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
