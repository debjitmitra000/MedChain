import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWalletClient, usePublicClient } from 'wagmi';
import { prepareRecall } from '../api/batch';
import { useTheme } from '../contexts/ThemeContext';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Package,
  Shield,
  Eye,
  Home,
  FileText,
  Zap,
  AlertCircle,
  Info,
  ExternalLink,
} from 'lucide-react';
import { addNetworkToMetaMask, switchToNetwork } from '../utils/networks';

export default function RecallBatch() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [meta, setMeta] = useState({ reason: 'Quality issue', urgent: false });
  const [tx, setTx] = useState(null);
  const [err, setErr] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle', 'preparing', 'pending', 'confirming', 'success', 'error'

  // PRESERVED ORIGINAL FUNCTIONS
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
        return 'Preparing recall...';
      case 'pending':
        return 'Please confirm transaction in your wallet...';
      case 'confirming':
        return 'Waiting for blockchain confirmation...';
      case 'success':
        return 'Batch recalled successfully!';
      case 'error':
        return 'Recall failed';
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'preparing':
      case 'pending':
      case 'confirming':
        return <Loader2 className="w-5 h-5 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const isProcessing = ['preparing', 'pending', 'confirming'].includes(status);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${
      darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
    }`}>
      {/* Floating Geometric Shapes Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-16 h-16 bg-red-500/5 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-8 h-8 bg-amber-500/10 rotate-45 animate-spin" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-32 left-20 w-12 h-12 bg-orange-500/5 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 right-10 w-6 h-6 bg-yellow-500/10 rotate-12 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 mb-6 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 ${
              darkMode
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <div className="text-center">
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full mb-6 border ${
              darkMode 
                ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                : 'bg-red-50 text-red-600 border-red-200'
            }`}>
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Batch Recall</span>
            </div>
            
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Recall Batch
            </h1>
            
            <p className={`text-2xl font-mono font-bold mb-6 ${
              darkMode ? 'text-red-400' : 'text-red-600'
            }`}>
              {batchId}
            </p>
            
            <p className={`text-xl max-w-2xl mx-auto ${
              darkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Initiate an emergency recall for this medicine batch
            </p>
            <div className="mt-6 text-center">
              <button
                onClick={async () => {
                  try {
                    await addNetworkToMetaMask({
                      chainId: 314159,
                      name: 'Filecoin Calibration Testnet',
                      rpcUrl: import.meta.env.VITE_FILECOIN_RPC_URL || 'https://api.calibration.node.glif.io/rpc/v1',
                      explorerUrl: import.meta.env.VITE_FILECOIN_EXPLORER_URL || 'https://calibration.filfox.info',
                      currency: 'tFIL'
                    });
                    await switchToNetwork(314159);
                  } catch (e) {
                    console.error('Add/switch failed:', e);
                    alert('Failed to add/switch Filecoin Calibration in MetaMask. Please add it manually.');
                  }
                }}
                className="mt-4 px-4 py-2 rounded-lg bg-amber-500 text-white font-semibold"
              >
                Add / Switch to Filecoin Calibration
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Process Guide */}
            <div className={`p-10 rounded-3xl border-2 ${
              darkMode
                ? 'bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-amber-500/30 backdrop-blur-sm'
                : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200'
            }`}>
              <div className="flex items-center gap-4 mb-8">
                <Info className="w-10 h-10 text-amber-500" />
                <h2 className={`text-3xl font-bold ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Batch Recall Process
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {[
                  { step: '1', icon: FileText, text: 'Specify recall reason' },
                  { step: '2', icon: AlertTriangle, text: 'Mark urgency level' },
                  { step: '3', icon: Zap, text: 'Submit transaction' },
                  { step: '4', icon: Clock, text: 'Wait for confirmation' },
                  { step: '5', icon: XCircle, text: 'Batch marked inactive' },
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                      darkMode ? 'bg-amber-500/20' : 'bg-amber-100'
                    }`}>
                      <item.icon className="w-8 h-8 text-amber-500" />
                    </div>
                    <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-bold mb-3 ${
                      darkMode ? 'bg-amber-500 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {item.step}
                    </div>
                    <p className={`text-sm font-semibold ${
                      darkMode ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Display */}
            {status !== 'idle' && (
              <div className={`p-8 rounded-3xl border-2 ${
                status === 'success' 
                  ? (darkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200')
                  : status === 'error' 
                    ? (darkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200')
                    : (darkMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200')
              }`}>
                <div className="flex items-center gap-4">
                  {getStatusIcon()}
                  <div>
                    <p className={`text-xl font-bold ${
                      status === 'success' ? 'text-emerald-500' :
                      status === 'error' ? 'text-red-500' :
                      'text-amber-500'
                    }`}>
                      {getStatusMessage()}
                    </p>
                    {tx?.hash && (
                      <p className={`mt-2 font-mono text-sm ${
                        darkMode ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        Transaction: {tx.hash}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Recall Form */}
            <div className={`p-10 rounded-3xl border ${
              darkMode
                ? 'bg-slate-800/60 border-slate-700'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-4 mb-8">
                <FileText className={`w-8 h-8 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                <h2 className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Recall Details
                </h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-bold mb-3 ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    Recall Reason
                  </label>
                  <input 
                    name="reason" 
                    value={meta.reason} 
                    onChange={onChange} 
                    placeholder="e.g., Quality issue, Contamination, Packaging defect"
                    disabled={isProcessing}
                    className={`w-full px-6 py-4 rounded-2xl font-medium transition-all duration-300 ${
                      darkMode
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-red-500 disabled:bg-slate-800 disabled:text-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-red-500 disabled:bg-slate-100 disabled:text-slate-400'
                    } border focus:outline-none focus:ring-2 focus:ring-red-500/20`}
                  />
                </div>
                
                <div className={`p-6 rounded-2xl border ${
                  meta.urgent
                    ? (darkMode ? 'bg-red-500/20 border-red-500/50' : 'bg-red-50 border-red-500')
                    : (darkMode ? 'bg-slate-700/60 border-slate-600' : 'bg-white border-slate-200')
                }`}>
                  <label className={`flex items-center gap-4 cursor-pointer ${
                    isProcessing ? 'cursor-not-allowed opacity-50' : ''
                  }`}>
                    <input 
                      type="checkbox" 
                      name="urgent" 
                      checked={meta.urgent} 
                      onChange={onChange}
                      disabled={isProcessing}
                      className="w-5 h-5 text-red-500 rounded"
                    />
                    <div>
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`w-6 h-6 ${
                          meta.urgent ? 'text-red-500' : (darkMode ? 'text-slate-400' : 'text-slate-500')
                        }`} />
                        <span className={`text-lg font-bold ${
                          darkMode ? 'text-white' : 'text-slate-900'
                        }`}>
                          Mark as Urgent Recall
                        </span>
                      </div>
                      <p className={`text-sm mt-1 ${
                        darkMode ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        Check this if immediate action is required for public safety
                      </p>
                    </div>
                  </label>
                </div>
                
                <button 
                  onClick={submit} 
                  disabled={isProcessing}
                  className={`w-full px-8 py-6 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-4 ${
                    isProcessing
                      ? (darkMode ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-slate-300 text-slate-500 cursor-not-allowed')
                      : (darkMode
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25'
                          : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25')
                  }`}
                >
                  {getStatusIcon()}
                  {isProcessing ? getStatusMessage() : 'Submit Recall'}
                  {!isProcessing && <AlertTriangle className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Display */}
            {err && (
              <div className={`p-8 rounded-3xl border-2 ${
                darkMode 
                  ? 'bg-red-500/10 border-red-500/30' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0" />
                  <div>
                    <h4 className={`text-xl font-bold mb-2 ${
                      darkMode ? 'text-red-400' : 'text-red-600'
                    }`}>
                      Recall Error
                    </h4>
                    <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>
                      {err}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Details */}
            {status === 'success' && tx && (
              <div className={`p-10 rounded-3xl border-2 ${
                darkMode
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-emerald-50 border-emerald-200'
              }`}>
                <div className="flex items-center gap-4 mb-8">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  <h4 className={`text-3xl font-bold ${
                    darkMode ? 'text-emerald-400' : 'text-emerald-600'
                  }`}>
                    Batch Recalled Successfully!
                  </h4>
                </div>
                
                <div className={`p-8 rounded-2xl mb-6 ${
                  darkMode ? 'bg-slate-700/60' : 'bg-white'
                }`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className={`text-sm font-bold mb-2 ${
                        darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        Batch ID
                      </p>
                      <p className={`text-lg font-mono font-bold ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        {batchId}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm font-bold mb-2 ${
                        darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        Reason
                      </p>
                      <p className={`text-lg font-bold ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        {tx.meta?.reason}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm font-bold mb-2 ${
                        darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        Urgent
                      </p>
                      <div className={`inline-flex px-4 py-2 rounded-full text-sm font-bold ${
                        tx.meta?.urgent
                          ? 'bg-red-500/20 text-red-500'
                          : 'bg-emerald-500/20 text-emerald-500'
                      }`}>
                        {tx.meta?.urgent ? 'Yes - Immediate Action Required' : 'No'}
                      </div>
                    </div>
                    <div>
                      <p className={`text-sm font-bold mb-2 ${
                        darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        Block Number
                      </p>
                      <p className={`text-lg font-bold ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        {tx.blockNumber}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className={`text-sm font-bold mb-2 ${
                        darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        Transaction Hash
                      </p>
                      <p className={`text-sm font-mono break-all ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        {tx.hash}
                      </p>
                    </div>
                    {tx.gasUsed && (
                      <div>
                        <p className={`text-sm font-bold mb-2 ${
                          darkMode ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          Gas Used
                        </p>
                        <p className={`text-lg font-bold ${
                          darkMode ? 'text-white' : 'text-slate-900'
                        }`}>
                          {tx.gasUsed}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-6">
                  <button 
                    onClick={() => navigate(`/app/batch/${batchId}`)}
                    className={`flex-1 px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 ${
                      darkMode
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700'
                        : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700'
                    }`}
                  >
                    <Eye className="w-5 h-5" />
                    View Batch Details
                  </button>
                  <button 
                    onClick={() => navigate('/app/home')}
                    className={`flex-1 px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 ${
                      darkMode
                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300'
                    }`}
                  >
                    <Home className="w-5 h-5" />
                    Back to Home
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Warning & Info */}
          <div className="space-y-8">
            <div className={`p-8 rounded-3xl border ${
              darkMode
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="w-8 h-8 text-red-500" />
                <h3 className={`text-xl font-bold ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Important Warning
                </h3>
              </div>
              
              <div className="space-y-4">
                <p className={`text-sm font-semibold ${
                  darkMode ? 'text-red-400' : 'text-red-600'
                }`}>
                  ⚠️ This action cannot be undone
                </p>
                <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  • Batch will be permanently marked as recalled
                </p>
                <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  • All future scans will show recall status
                </p>
                <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  • This will be recorded on the blockchain
                </p>
                <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  • Ensure you have proper authorization
                </p>
              </div>
            </div>

            <div className={`p-8 rounded-3xl border ${
              darkMode
                ? 'bg-blue-500/10 border-blue-500/30'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-8 h-8 text-blue-500" />
                <h3 className={`text-xl font-bold ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Recall Types
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className={`font-bold text-red-500 mb-1`}>
                    Urgent Recall
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    Immediate public safety risk requiring instant action
                  </p>
                </div>
                <div>
                  <p className={`font-bold text-amber-500 mb-1`}>
                    Standard Recall
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    Quality issues that require controlled removal
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
