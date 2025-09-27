import { useState } from 'react';
import { useWalletClient, usePublicClient } from 'wagmi';
import { prepareRegisterBatch, getBatchQR } from '../api/batch';
import { useRole } from '../hooks/useRole';
import { Link } from 'react-router-dom';

export default function BatchRegister() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { 
    isConnected, 
    isManufacturer, 
    canRegisterBatch,
    manufacturer 
  } = useRole();

  const [form, setForm] = useState({
    batchId: '',
    medicineName: '',
    manufacturingDate: '',
    expiryDate: '',
  });
  const [qrCode, setQrCode] = useState(null);
  const [tx, setTx] = useState(null);
  const [err, setErr] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle', 'preparing', 'pending', 'confirming', 'success', 'error'

  // Role-based access control
  if (!isConnected) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <h3>Connect Wallet Required</h3>
        <p>Please connect your MetaMask wallet to register batches.</p>
      </div>
    );
  }

  if (!isManufacturer) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <h3>Manufacturer Registration Required</h3>
        <p>You need to be a registered manufacturer to register medicine batches.</p>
        <Link to="/manufacturer/register">
          <button style={{ backgroundColor: '#0088aa', color: 'white', padding: '12px 24px' }}>
            Register as Manufacturer
          </button>
        </Link>
      </div>
    );
  }

  if (!canRegisterBatch) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <h3>Verification Required</h3>
        <p>Your manufacturer account needs admin verification before you can register batches.</p>
        <p>Status: <span style={{ color: '#ff8800' }}>Pending Verification</span></p>
        <Link to="/manufacturer/me">
          <button style={{ backgroundColor: '#0088aa', color: 'white', padding: '12px 24px' }}>
            View My Profile
          </button>
        </Link>
      </div>
    );
  }

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  async function prepareTx() {
    setErr(null);
    setStatus('preparing');
    setTx(null);
    setQrCode(null); // Clear any existing QR code
    
    try {
      if (!walletClient) throw new Error('Connect wallet first');
      
      setStatus('preparing');
      
      // Only prepare transaction data - no QR generation yet
      const prep = await prepareRegisterBatch(form);
      
      setStatus('pending');
      
      const { contractAddress, abi, method, args } = prep.transaction;
      
      // Submit transaction
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi,
        functionName: method,
        args,
      });
      
      console.log('Transaction submitted:', hash);
      setStatus('confirming');
      
      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        confirmations: 1
      });
      
      if (receipt.status === 'success') {
        setTx({ 
          hash, 
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed?.toString()
        });
        setStatus('success');
        
        // NOW generate the final QR code after successful confirmation
        try {
          console.log('Generating QR code for batch:', form.batchId);
          const qrResult = await getBatchQR(form.batchId);
          setQrCode({
            qrCodeImage: qrResult.data.qr.qrCode,
            qrData: qrResult.data.qr.qrData,
            format: qrResult.data.qr.format || 'PNG',
            size: qrResult.data.qr.size || '512x512'
          });
          console.log('QR code generated successfully');
        } catch (qrError) {
          console.warn('QR generation failed:', qrError.message);
          // Don't fail the whole process if QR generation fails
        }
        
      } else {
        throw new Error('Transaction failed during mining');
      }
      
    } catch (e) {
      console.error('Transaction error:', e);
      setErr(e?.message || String(e));
      setStatus('error');
      setQrCode(null);
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case 'preparing':
        return '🔄 Preparing transaction...';
      case 'pending':
        return '📝 Please confirm transaction in your wallet...';
      case 'confirming':
        return '⏳ Waiting for blockchain confirmation...';
      case 'success':
        return '✅ Batch registered successfully!';
      case 'error':
        return '❌ Transaction failed';
      default:
        return '';
    }
  };

  const isProcessing = ['preparing', 'pending', 'confirming'].includes(status);

  const downloadQRCode = () => {
    if (qrCode?.qrCodeImage) {
      try {
        // Create a link element and trigger download
        const link = document.createElement('a');
        link.href = qrCode.qrCodeImage;
        link.download = `QR_${form.batchId}_${new Date().getTime()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('QR code download initiated');
      } catch (error) {
        console.error('Download failed:', error);
        // Fallback: open in new tab if download fails
        window.open(qrCode.qrCodeImage, '_blank');
      }
    }
  };

  return (
    <div>
      <h3>Register Batch</h3>
      
      {/* Manufacturer Info */}
      {manufacturer && (
        <div style={{ 
          marginBottom: 20,
          padding: 12,
          backgroundColor: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: 4
        }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            <strong>Registering as:</strong> {manufacturer.name} ({manufacturer.license})
          </p>
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400, marginBottom: 20 }}>
        <input 
          name="batchId" 
          placeholder="Batch ID (e.g., BATCH-001_ABC)" 
          value={form.batchId} 
          onChange={onChange}
          disabled={isProcessing}
        />
        <input 
          name="medicineName" 
          placeholder="Medicine Name (e.g., Paracetamol 500mg)" 
          value={form.medicineName} 
          onChange={onChange}
          disabled={isProcessing}
        />
        <input 
          name="manufacturingDate" 
          type="date" 
          placeholder="Manufacturing Date"
          value={form.manufacturingDate} 
          onChange={onChange}
          disabled={isProcessing}
        />
        <input 
          name="expiryDate" 
          type="date" 
          placeholder="Expiry Date"
          value={form.expiryDate} 
          onChange={onChange}
          disabled={isProcessing}
        />
        
        <button 
          onClick={prepareTx} 
          disabled={isProcessing}
          style={{
            backgroundColor: isProcessing ? '#ccc' : '#007bff',
            color: 'white',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            padding: '12px'
          }}
        >
          {isProcessing ? getStatusMessage() : 'Register Batch'}
        </button>
      </div>

      {/* Status Display */}
      {status !== 'idle' && (
        <div style={{ 
          marginBottom: 20,
          padding: 12,
          borderRadius: 4,
          backgroundColor: 
            status === 'success' ? '#d4edda' :
            status === 'error' ? '#f8d7da' :
            '#fff3cd',
          border: `1px solid ${
            status === 'success' ? '#c3e6cb' :
            status === 'error' ? '#f5c6cb' :
            '#ffeaa7'
          }`
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>
            {getStatusMessage()}
          </p>
          {tx?.hash && (
            <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
              Transaction: {tx.hash}
            </p>
          )}
        </div>
      )}

      {err && (
        <div style={{ 
          color: '#721c24', 
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          padding: 12,
          borderRadius: 4,
          marginBottom: 20
        }}>
          <strong>Error:</strong> {err}
        </div>
      )}
      
      {/* Success Details with QR Code - ONLY after success */}
      {status === 'success' && tx && (
        <div style={{
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          padding: 16,
          borderRadius: 4,
          marginBottom: 20
        }}>
          <h4 style={{ color: '#155724', margin: '0 0 12px 0' }}>
            ✅ Batch Registered Successfully!
          </h4>
          <div style={{ fontSize: '14px', color: '#155724' }}>
            <p><strong>Batch ID:</strong> {form.batchId}</p>
            <p><strong>Medicine:</strong> {form.medicineName}</p>
            <p><strong>Manufacturing Date:</strong> {form.manufacturingDate}</p>
            <p><strong>Expiry Date:</strong> {form.expiryDate}</p>
            <p><strong>Transaction Hash:</strong> {tx.hash}</p>
            <p><strong>Block Number:</strong> {tx.blockNumber}</p>
            {tx.gasUsed && <p><strong>Gas Used:</strong> {tx.gasUsed}</p>}
          </div>

          {/* QR Code - ONLY shown after successful registration */}
          {qrCode ? (
            <div style={{ marginTop: 20 }}>
              <h4 style={{ color: '#155724', margin: '0 0 12px 0' }}>
                📱 QR Code Generated Successfully!
              </h4>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 20,
                padding: 16,
                backgroundColor: '#f8f9fa',
                borderRadius: 8,
                border: '2px solid #28a745'
              }}>
                <img 
                  src={qrCode.qrCodeImage} 
                  alt="Batch QR Code" 
                  width={200} 
                  height={200}
                  style={{ 
                    border: '2px solid #28a745', 
                    borderRadius: 8,
                    backgroundColor: 'white'
                  }}
                />
                <div>
                  <p style={{ margin: '0 0 8px 0' }}>
                    <strong>QR Code for Batch:</strong> {form.batchId}
                  </p>
                  <p style={{ margin: '0 0 8px 0' }}>
                    <strong>Format:</strong> {qrCode.format}
                  </p>
                  <p style={{ margin: '0 0 8px 0' }}>
                    <strong>Size:</strong> {qrCode.size}
                  </p>
                  <p style={{ fontSize: '14px', color: '#666', margin: '8px 0 12px 0' }}>
                    This QR code can be used to verify the authenticity of this medicine batch.
                  </p>
                  <button 
                    onClick={downloadQRCode}
                    style={{ 
                      backgroundColor: '#28a745', 
                      color: 'white', 
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    📥 Download QR Code
                  </button>
                </div>
              </div>
              
              <details style={{ marginTop: 12 }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                  View QR Data (Technical Details)
                </summary>
                <pre style={{ 
                  marginTop: 8, 
                  padding: 12, 
                  backgroundColor: '#f1f5f9', 
                  borderRadius: 4,
                  fontSize: '12px',
                  overflow: 'auto',
                  border: '1px solid #d1d5db'
                }}>
                  {qrCode.qrData}
                </pre>
              </details>
            </div>
          ) : (
            /* Loading QR or failed */
            <div style={{ 
              marginTop: 16, 
              padding: 12, 
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: 4 
            }}>
              <p style={{ margin: 0, color: '#856404' }}>
                📱 Generating QR code... Please wait.
              </p>
            </div>
          )}

          {/* If QR generation failed */}
          {status === 'success' && !qrCode && tx && (
            <div style={{ 
              marginTop: 16, 
              padding: 12, 
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: 4 
            }}>
              <p style={{ margin: 0, color: '#856404' }}>
                ⚠️ Batch registered successfully, but QR code generation failed. 
                You can generate it later from the batch details page.
              </p>
            </div>
          )}

          {/* Navigation buttons after success */}
          <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
            <Link to="/manufacturer/me">
              <button style={{ 
                backgroundColor: '#0088aa', 
                color: 'white', 
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                View My Profile
              </button>
            </Link>
            <Link to={`/batch/${form.batchId}`}>
              <button style={{ 
                backgroundColor: '#28a745', 
                color: 'white', 
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                View Batch Details
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}