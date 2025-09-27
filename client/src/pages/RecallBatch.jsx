import { useParams, useNavigate } from 'react-router-dom';
import { useWalletClient, usePublicClient } from 'wagmi';
import { useState } from 'react';
import { prepareRecall } from '../api/batch';

export default function RecallBatch() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [meta, setMeta] = useState({ reason: 'Quality issue', urgent: false });
  const [tx, setTx] = useState(null);
  const [err, setErr] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle', 'preparing', 'pending', 'confirming', 'success', 'error'

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMeta((s) => ({ ...s, [name]: type === 'checkbox' ? checked : value }));
  };

  async function submit() {
    setErr(null);
    setStatus('preparing');
    setTx(null);
    
    try {
      if (!walletClient) throw new Error('Connect wallet first');
      
      setStatus('preparing');
      
      const prep = await prepareRecall(batchId, meta);
      const { contractAddress, abi, method, args } = prep.transaction;
      
      setStatus('pending');
      
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi,
        functionName: method,
        args,
      });
      
      console.log('Recall transaction submitted:', hash);
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
          meta: prep.meta,
          status: 'confirmed'
        });
        setStatus('success');
      } else {
        throw new Error('Transaction failed during mining');
      }
      
    } catch (e) {
      console.error('Recall transaction error:', e);
      setErr(e?.message || String(e));
      setStatus('error');
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case 'preparing':
        return '🔄 Preparing recall...';
      case 'pending':
        return '📝 Please confirm transaction in your wallet...';
      case 'confirming':
        return '⏳ Waiting for blockchain confirmation...';
      case 'success':
        return '✅ Batch recalled successfully!';
      case 'error':
        return '❌ Recall failed';
      default:
        return '';
    }
  };

  const isProcessing = ['preparing', 'pending', 'confirming'].includes(status);

  return (
    <div>
      <h3>Recall Batch: {batchId}</h3>
      
      <div style={{ 
        padding: 16, 
        backgroundColor: '#fff3cd', 
        border: '1px solid #ffeaa7',
        borderRadius: 4,
        marginBottom: 20 
      }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#856404' }}>⚠️ Batch Recall Process</h4>
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          <li>Specify the recall reason below</li>
          <li>Mark as urgent if immediate action is required</li>
          <li>Submit recall transaction</li>
          <li>Wait for blockchain confirmation</li>
          <li>Batch will be marked as recalled and inactive</li>
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
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400, marginBottom: 20 }}>
        <input 
          name="reason" 
          value={meta.reason} 
          onChange={onChange} 
          placeholder="Recall reason"
          disabled={isProcessing}
        />
        
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input 
            type="checkbox" 
            name="urgent" 
            checked={meta.urgent} 
            onChange={onChange}
            disabled={isProcessing}
          />
          Mark as urgent recall
        </label>
        
        <button 
          onClick={submit} 
          disabled={isProcessing}
          style={{ 
            backgroundColor: isProcessing ? '#ccc' : '#ff4444', 
            color: 'white',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            padding: '12px'
          }}
        >
          {isProcessing ? getStatusMessage() : 'Submit Recall'}
        </button>
      </div>
      
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
      
      {/* Success Details */}
      {status === 'success' && tx && (
        <div style={{
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          padding: 16,
          borderRadius: 4,
          marginBottom: 20
        }}>
          <h4 style={{ color: '#155724', margin: '0 0 12px 0' }}>
            ✅ Batch Recalled Successfully!
          </h4>
          <div style={{ fontSize: '14px', color: '#155724' }}>
            <p><strong>Batch ID:</strong> {batchId}</p>
            <p><strong>Reason:</strong> {tx.meta?.reason}</p>
            <p><strong>Urgent:</strong> {tx.meta?.urgent ? 'Yes' : 'No'}</p>
            <p><strong>Transaction Hash:</strong> {tx.hash}</p>
            <p><strong>Block Number:</strong> {tx.blockNumber}</p>
            {tx.gasUsed && <p><strong>Gas Used:</strong> {tx.gasUsed}</p>}
          </div>
          <div style={{ marginTop: 16 }}>
            <button 
              onClick={() => navigate(`/batch/${batchId}`)}
              style={{ 
                backgroundColor: '#28a745', 
                color: 'white',
                marginRight: 8
              }}
            >
              View Batch Details
            </button>
            <button 
              onClick={() => navigate('/')}
              style={{ backgroundColor: '#6c757d', color: 'white' }}
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
