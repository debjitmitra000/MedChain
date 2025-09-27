import { useState, useEffect } from 'react';
import { useWalletClient, usePublicClient, useAccount } from 'wagmi';
import { prepareRegisterManufacturer } from '../api/manufacturer';

export default function ManufacturerRegister() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const [form, setForm] = useState({ 
    manufacturerAddress: address || '', 
    name: '', 
    license: '', 
    email: '' 
  });
  const [tx, setTx] = useState(null);
  const [err, setErr] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle', 'preparing', 'pending', 'confirming', 'success', 'error'

  // Auto-update address when wallet connects
  useEffect(() => {
    if (address) {
      setForm(f => ({ ...f, manufacturerAddress: address }));
    }
  }, [address]);

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  async function submit() {
    setErr(null);
    setStatus('preparing');
    setTx(null);
    
    try {
      if (!walletClient) throw new Error('Connect wallet first');
      
      setStatus('preparing');
      
      const prep = await prepareRegisterManufacturer(form);
      const { contractAddress, abi, method, args } = prep.transaction;
      
      setStatus('pending');
      
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
          gasUsed: receipt.gasUsed?.toString(),
          status: 'confirmed'
        });
        setStatus('success');
      } else {
        throw new Error('Transaction failed during mining');
      }
      
    } catch (e) {
      console.error('Transaction error:', e);
      setErr(e?.message || String(e));
      setStatus('error');
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case 'preparing':
        return '🔄 Preparing registration...';
      case 'pending':
        return '📝 Please confirm transaction in your wallet...';
      case 'confirming':
        return '⏳ Waiting for blockchain confirmation...';
      case 'success':
        return '✅ Registration submitted successfully!';
      case 'error':
        return '❌ Registration failed';
      default:
        return '';
    }
  };

  const isProcessing = ['preparing', 'pending', 'confirming'].includes(status);

  return (
    <div>
      <h3>Register as Manufacturer</h3>
      
      <div style={{ 
        padding: 16, 
        backgroundColor: '#e7f3ff', 
        border: '1px solid #b3d9ff',
        borderRadius: 4,
        marginBottom: 20 
      }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#0056b3' }}>📝 Self-Registration Process</h4>
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          <li>Fill out your company details below</li>
          <li>Submit registration transaction</li>
          <li>Wait for blockchain confirmation</li>
          <li>Wait for admin verification</li>
          <li>Once verified, you can register medicine batches</li>
        </ol>
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
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400 }}>
        <input 
          name="manufacturerAddress" 
          placeholder="Your Wallet Address (auto-filled)" 
          value={form.manufacturerAddress} 
          onChange={onChange}
          disabled={!!address || isProcessing}
          style={{ backgroundColor: address ? '#f5f5f5' : 'white' }}
        />
        <input 
          name="name" 
          placeholder="Company Name" 
          value={form.name} 
          onChange={onChange}
          disabled={isProcessing}
        />
        <input 
          name="license" 
          placeholder="License Number" 
          value={form.license} 
          onChange={onChange}
          disabled={isProcessing}
        />
        <input 
          name="email" 
          type="email"
          placeholder="Company Email" 
          value={form.email} 
          onChange={onChange}
          disabled={isProcessing}
        />
        
        <button 
          onClick={submit} 
          disabled={isProcessing || !address}
          style={{
            backgroundColor: isProcessing ? '#ccc' : !address ? '#ccc' : '#007bff',
            color: 'white',
            cursor: isProcessing || !address ? 'not-allowed' : 'pointer',
            padding: '12px'
          }}
        >
          {isProcessing ? getStatusMessage() : 'Register as Manufacturer'}
        </button>
        
        {!address && (
          <p style={{ color: '#dc3545', fontSize: '14px' }}>
            Please connect your wallet first
          </p>
        )}
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
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: 4
        }}>
          <h4 style={{ color: '#155724', margin: '0 0 12px 0' }}>
            ✅ Registration Submitted Successfully!
          </h4>
          <div style={{ fontSize: '14px', color: '#155724' }}>
            <p><strong>Company:</strong> {form.name}</p>
            <p><strong>License:</strong> {form.license}</p>
            <p><strong>Email:</strong> {form.email}</p>
            <p><strong>Transaction Hash:</strong> {tx.hash}</p>
            <p><strong>Block Number:</strong> {tx.blockNumber}</p>
            {tx.gasUsed && <p><strong>Gas Used:</strong> {tx.gasUsed}</p>}
          </div>
          <div style={{ 
            marginTop: 8, 
            padding: 8, 
            backgroundColor: '#fff3cd', 
            border: '1px solid #ffeaa7',
            borderRadius: 4 
          }}>
            <p style={{ margin: 0, color: '#856404' }}>
              <strong>Next Step:</strong> Your registration is confirmed on the blockchain. 
              Wait for admin verification before you can register medicine batches.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
