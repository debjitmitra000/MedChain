import { useState } from 'react';
import { useWalletClient, usePublicClient, useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { prepareVerifyManufacturer, prepareDeactivateManufacturer, getUnverifiedManufacturers } from '../api/manufacturer';
import { getGlobalStats } from '../api/verify';

export default function ManufacturerVerify() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const [manufacturerAddress, setManufacturerAddress] = useState('');
  const [action, setAction] = useState('verify'); // 'verify' or 'deactivate'
  const [tx, setTx] = useState(null);
  const [err, setErr] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle', 'preparing', 'pending', 'confirming', 'success', 'error'

  // Check admin status
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: getGlobalStats,
  });

  // Load unverified manufacturers for easy selection
  const { data: unverifiedData } = useQuery({
    queryKey: ['unverified-manufacturers'],
    queryFn: getUnverifiedManufacturers,
  });

  const isAdmin = address && stats?.stats?.adminAddress && 
    address.toLowerCase() === stats.stats.adminAddress.toLowerCase();

  if (!isAdmin) {
    return (
      <div>
        <h3>Access Denied</h3>
        <p>Only admins can verify or deactivate manufacturers.</p>
        <p>Connect with admin wallet to continue.</p>
      </div>
    );
  }

  const unverifiedManufacturers = unverifiedData?.data?.manufacturers || [];

  async function submit() {
    setErr(null);
    setStatus('preparing');
    setTx(null);
    
    try {
      if (!walletClient) throw new Error('Connect wallet first');
      if (!manufacturerAddress.trim()) throw new Error('Enter manufacturer address');
      
      setStatus('preparing');
      
      const prepareFunction = action === 'verify' ? prepareVerifyManufacturer : prepareDeactivateManufacturer;
      const prep = await prepareFunction({ manufacturerAddress: manufacturerAddress.trim() });
      
      const { contractAddress, abi, method, args } = prep.transaction;
      
      setStatus('pending');
      
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi,
        functionName: method,
        args,
      });
      
      console.log('Admin transaction submitted:', hash);
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
          gasUsed: receipt.gasUsed?.toString(),
          action,
          manufacturerAddress: manufacturerAddress.trim(),
          status: 'confirmed'
        });
        setStatus('success');
        setManufacturerAddress(''); // Clear form
      } else {
        throw new Error('Transaction failed during mining');
      }
      
    } catch (e) {
      console.error('Admin transaction error:', e);
      setErr(e?.message || String(e));
      setStatus('error');
    }
  }

  const selectManufacturer = (address) => {
    setManufacturerAddress(address);
    setAction('verify'); // Default to verify for pending manufacturers
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'preparing':
        return `🔄 Preparing ${action}...`;
      case 'pending':
        return '📝 Please confirm transaction in your wallet...';
      case 'confirming':
        return '⏳ Waiting for blockchain confirmation...';
      case 'success':
        return `✅ ${action === 'verify' ? 'Verification' : 'Deactivation'} successful!`;
      case 'error':
        return `❌ ${action === 'verify' ? 'Verification' : 'Deactivation'} failed`;
      default:
        return '';
    }
  };

  const isProcessing = ['preparing', 'pending', 'confirming'].includes(status);

  return (
    <div>
      <h3>Manufacturer Verification (Admin)</h3>
      
      {/* Quick select from unverified manufacturers */}
      {unverifiedManufacturers.length > 0 && (
        <div style={{ 
          marginBottom: 24,
          padding: 16,
          backgroundColor: '#e7f3ff',
          border: '1px solid #b3d9ff',
          borderRadius: 8
        }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#0056b3' }}>
            📋 {unverifiedManufacturers.length} Manufacturer{unverifiedManufacturers.length > 1 ? 's' : ''} Awaiting Verification
          </h4>
          <div style={{ display: 'grid', gap: 8 }}>
            {unverifiedManufacturers.map((mfr, i) => (
              <div key={i} style={{ 
                padding: 12, 
                backgroundColor: 'white', 
                borderRadius: 4,
                border: '1px solid #d4edda',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong>{mfr.name}</strong>
                  <br />
                  <small style={{ color: '#666' }}>
                    License: {mfr.license} | Email: {mfr.email}
                  </small>
                  <br />
                  <small style={{ color: '#666' }}>
                    Address: {mfr.wallet?.slice(0, 10)}...{mfr.wallet?.slice(-8)}
                  </small>
                  <br />
                  <small style={{ color: '#666' }}>
                    Registered: {mfr.registeredDate}
                  </small>
                </div>
                <button 
                  onClick={() => selectManufacturer(mfr.wallet)}
                  disabled={isProcessing}
                  style={{ 
                    backgroundColor: isProcessing ? '#ccc' : '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: 4,
                    cursor: isProcessing ? 'not-allowed' : 'pointer'
                  }}
                >
                  Select to Verify
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
        <input 
          placeholder="Manufacturer Address (0x...)" 
          value={manufacturerAddress} 
          onChange={(e) => setManufacturerAddress(e.target.value)}
          disabled={isProcessing}
        />
        
        <div style={{ display: 'flex', gap: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input 
              type="radio" 
              name="action" 
              value="verify"
              checked={action === 'verify'}
              onChange={(e) => setAction(e.target.value)}
              disabled={isProcessing}
            />
            Verify Manufacturer
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input 
              type="radio" 
              name="action" 
              value="deactivate"
              checked={action === 'deactivate'}
              onChange={(e) => setAction(e.target.value)}
              disabled={isProcessing}
            />
            Deactivate Manufacturer
          </label>
        </div>
        
        <button 
          onClick={submit} 
          disabled={isProcessing || !manufacturerAddress.trim()}
          style={{ 
            backgroundColor: isProcessing || !manufacturerAddress.trim() ? '#ccc' : 
                            action === 'verify' ? '#00aa00' : '#ff4444',
            color: 'white',
            cursor: isProcessing || !manufacturerAddress.trim() ? 'not-allowed' : 'pointer',
            padding: '12px'
          }}
        >
          {isProcessing ? getStatusMessage() : `${action === 'verify' ? 'Verify' : 'Deactivate'} Manufacturer`}
        </button>
      </div>
      
      {err && (
        <div style={{ 
          color: '#721c24',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          padding: 12,
          borderRadius: 4,
          marginTop: 16
        }}>
          <strong>Error:</strong> {err}
        </div>
      )}
      
      {/* Success Details */}
      {status === 'success' && tx && (
        <div style={{ 
          marginTop: 16,
          padding: 12,
          backgroundColor: action === 'verify' ? '#d4edda' : '#f8d7da',
          border: `1px solid ${action === 'verify' ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: 4
        }}>
          <h4 style={{ color: action === 'verify' ? '#155724' : '#721c24', margin: '0 0 12px 0' }}>
            ✅ {action === 'verify' ? 'Verification' : 'Deactivation'} Completed!
          </h4>
          <div style={{ fontSize: '14px', color: action === 'verify' ? '#155724' : '#721c24' }}>
            <p><strong>Action:</strong> {tx.action}</p>
            <p><strong>Manufacturer:</strong> {tx.manufacturerAddress}</p>
            <p><strong>Transaction Hash:</strong> {tx.hash}</p>
            <p><strong>Block Number:</strong> {tx.blockNumber}</p>
            {tx.gasUsed && <p><strong>Gas Used:</strong> {tx.gasUsed}</p>}
          </div>
          <p style={{ color: action === 'verify' ? '#155724' : '#721c24', margin: '8px 0 0 0' }}>
            {tx.action === 'verify' ? 
              'Manufacturer verification completed successfully! They can now register medicine batches.' :
              'Manufacturer deactivated successfully! They can no longer register medicine batches.'
            }
          </p>
        </div>
      )}
    </div>
  );
}
