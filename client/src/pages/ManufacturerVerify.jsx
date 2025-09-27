import React, { useState } from 'react';
import { useWalletClient, usePublicClient, useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { prepareVerifyManufacturer, prepareDeactivateManufacturer, getUnverifiedManufacturers } from '../api/manufacturer';
import { getGlobalStats } from '../api/verify';
import { useTheme } from '../contexts/ThemeContext';
import {
  Shield,
  CheckCircle2,
  XCircle,
  User,
  Mail,
  Award,
  Calendar,
  AlertTriangle,
  Loader2,
  Settings,
  Factory,
  Clock,
  Activity,
  FileText,
  Eye,
  Zap,
  UserCheck,
  UserX,
  AlertCircle,
} from 'lucide-react';

export default function ManufacturerVerify() {
  const { darkMode } = useTheme();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const [manufacturerAddress, setManufacturerAddress] = useState('');
  const [action, setAction] = useState('verify'); // 'verify' or 'deactivate'
  const [tx, setTx] = useState(null);
  const [err, setErr] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle', 'preparing', 'pending', 'confirming', 'success', 'error'

  // Check admin status - PRESERVED EXACTLY
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: getGlobalStats,
  });

  // Load unverified manufacturers for easy selection - PRESERVED EXACTLY
  const { data: unverifiedData } = useQuery({
    queryKey: ['unverified-manufacturers'],
    queryFn: getUnverifiedManufacturers,
  });

  const isAdmin = address && stats?.stats?.adminAddress && 
    address.toLowerCase() === stats.stats.adminAddress.toLowerCase();

  if (!isAdmin) {
    return (
      <div className={`min-h-screen font-sans transition-colors duration-500 ${
        darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
      }`}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center py-20">
            <div className="mb-8">
              <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center ${
                darkMode ? 'bg-red-500/20' : 'bg-red-50'
              }`}>
                <Shield className="w-16 h-16 text-red-500" />
              </div>
            </div>
            
            <h3 className={`text-4xl font-bold mb-6 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Access Denied
            </h3>
            
            <div className={`p-10 rounded-3xl border-2 mb-8 ${
              darkMode 
                ? 'bg-red-500/10 border-red-500/30' 
                : 'bg-red-50 border-red-200'
            }`}>
              <p className={`text-xl mb-4 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                Only admins can verify or deactivate manufacturers.
              </p>
              <p className={`text-lg ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Connect with admin wallet to continue.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const unverifiedManufacturers = unverifiedData?.data?.manufacturers || [];

  // PRESERVED ALL ORIGINAL FUNCTIONS
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
        return `Preparing ${action}...`;
      case 'pending':
        return 'Please confirm transaction in your wallet...';
      case 'confirming':
        return 'Waiting for blockchain confirmation...';
      case 'success':
        return `${action === 'verify' ? 'Verification' : 'Deactivation'} successful!`;
      case 'error':
        return `${action === 'verify' ? 'Verification' : 'Deactivation'} failed`;
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
        <div className="absolute top-20 left-10 w-16 h-16 bg-blue-500/5 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-8 h-8 bg-emerald-500/10 rotate-45 animate-spin" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-32 left-20 w-12 h-12 bg-purple-500/5 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 right-10 w-6 h-6 bg-amber-500/10 rotate-12 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-8">
        {/* Hero Header */}
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full mb-6 border ${
            darkMode 
              ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
              : 'bg-blue-50 text-blue-600 border-blue-200'
          }`}>
            <Settings className="w-5 h-5" />
            <span className="font-medium">Admin Panel</span>
          </div>
          
          <h1 className={`text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent`}>
            Manufacturer Verification
          </h1>
          
          <p className={`text-xl max-w-2xl mx-auto ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Verify or deactivate manufacturer accounts as system administrator
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Pending Manufacturers List */}
            {unverifiedManufacturers.length > 0 && (
              <div className={`p-10 rounded-3xl border ${
                darkMode
                  ? 'bg-slate-800/60 border-slate-700'
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-4 mb-8">
                  <Clock className={`w-8 h-8 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                  <h2 className={`text-2xl font-bold ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {unverifiedManufacturers.length} Manufacturer{unverifiedManufacturers.length > 1 ? 's' : ''} Awaiting Verification
                  </h2>
                </div>
                
                <div className="grid gap-6">
                  {unverifiedManufacturers.map((mfr, i) => (
                    <div 
                      key={i} 
                      className={`p-8 rounded-3xl border-2 transition-all duration-300 hover:scale-[1.02] ${
                        darkMode
                          ? 'bg-amber-500/10 border-amber-500/30'
                          : 'bg-amber-50 border-amber-200'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <Factory className="w-8 h-8 text-amber-500" />
                            <h3 className={`text-2xl font-bold ${
                              darkMode ? 'text-white' : 'text-slate-900'
                            }`}>
                              {mfr.name}
                            </h3>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className={`p-6 rounded-2xl ${
                              darkMode ? 'bg-slate-700/60' : 'bg-white'
                            }`}>
                              <div className="flex items-center gap-3 mb-3">
                                <Award className={`w-5 h-5 ${
                                  darkMode ? 'text-slate-400' : 'text-slate-500'
                                }`} />
                                <span className={`text-sm font-bold ${
                                  darkMode ? 'text-slate-400' : 'text-slate-500'
                                }`}>
                                  License
                                </span>
                              </div>
                              <p className={`text-lg font-bold ${
                                darkMode ? 'text-white' : 'text-slate-900'
                              }`}>
                                {mfr.license}
                              </p>
                            </div>

                            <div className={`p-6 rounded-2xl ${
                              darkMode ? 'bg-slate-700/60' : 'bg-white'
                            }`}>
                              <div className="flex items-center gap-3 mb-3">
                                <Mail className={`w-5 h-5 ${
                                  darkMode ? 'text-slate-400' : 'text-slate-500'
                                }`} />
                                <span className={`text-sm font-bold ${
                                  darkMode ? 'text-slate-400' : 'text-slate-500'
                                }`}>
                                  Email
                                </span>
                              </div>
                              <p className={`text-lg font-bold ${
                                darkMode ? 'text-white' : 'text-slate-900'
                              }`}>
                                {mfr.email}
                              </p>
                            </div>

                            <div className={`p-6 rounded-2xl ${
                              darkMode ? 'bg-slate-700/60' : 'bg-white'
                            }`}>
                              <div className="flex items-center gap-3 mb-3">
                                <User className={`w-5 h-5 ${
                                  darkMode ? 'text-slate-400' : 'text-slate-500'
                                }`} />
                                <span className={`text-sm font-bold ${
                                  darkMode ? 'text-slate-400' : 'text-slate-500'
                                }`}>
                                  Address
                                </span>
                              </div>
                              <p className={`text-lg font-mono font-bold ${
                                darkMode ? 'text-white' : 'text-slate-900'
                              }`}>
                                {mfr.wallet?.slice(0, 10)}...{mfr.wallet?.slice(-8)}
                              </p>
                            </div>

                            <div className={`p-6 rounded-2xl ${
                              darkMode ? 'bg-slate-700/60' : 'bg-white'
                            }`}>
                              <div className="flex items-center gap-3 mb-3">
                                <Calendar className={`w-5 h-5 ${
                                  darkMode ? 'text-slate-400' : 'text-slate-500'
                                }`} />
                                <span className={`text-sm font-bold ${
                                  darkMode ? 'text-slate-400' : 'text-slate-500'
                                }`}>
                                  Registered
                                </span>
                              </div>
                              <p className={`text-lg font-bold ${
                                darkMode ? 'text-white' : 'text-slate-900'
                              }`}>
                                {mfr.registeredDate}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-4">
                          <button 
                            onClick={() => selectManufacturer(mfr.wallet)}
                            disabled={isProcessing}
                            className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-3 ${
                              isProcessing
                                ? (darkMode ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-slate-300 text-slate-500 cursor-not-allowed')
                                : (darkMode
                                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700'
                                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700')
                            }`}
                          >
                            <UserCheck className="w-5 h-5" />
                            Select to Verify
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Manual Verification Form */}
            <div className={`p-10 rounded-3xl border ${
              darkMode
                ? 'bg-slate-800/60 border-slate-700'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-4 mb-8">
                <Settings className={`w-8 h-8 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <h2 className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Manual Verification
                </h2>
              </div>

              {/* Status Display */}
              {status !== 'idle' && (
                <div className={`p-8 rounded-3xl border-2 mb-8 ${
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
              
              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-bold mb-3 ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    <User className="w-4 h-4 inline mr-2" />
                    Manufacturer Address
                  </label>
                  <input 
                    placeholder="0x..." 
                    value={manufacturerAddress} 
                    onChange={(e) => setManufacturerAddress(e.target.value)}
                    disabled={isProcessing}
                    className={`w-full px-6 py-4 rounded-2xl font-mono transition-all duration-300 ${
                      darkMode
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 disabled:bg-slate-800 disabled:text-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-400'
                    } border focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-bold mb-4 ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Action Type
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                      action === 'verify'
                        ? (darkMode 
                            ? 'bg-emerald-500/20 border-emerald-500/50 shadow-lg shadow-emerald-500/25' 
                            : 'bg-emerald-50 border-emerald-500 shadow-lg shadow-emerald-500/25')
                        : (darkMode
                            ? 'bg-slate-700/60 border-slate-600 hover:border-slate-500'
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-lg hover:shadow-xl')
                    }`}>
                      <div className="flex items-center gap-4">
                        <input 
                          type="radio" 
                          name="action" 
                          value="verify"
                          checked={action === 'verify'}
                          onChange={(e) => setAction(e.target.value)}
                          disabled={isProcessing}
                          className="w-4 h-4 text-emerald-500"
                        />
                        <div>
                          <UserCheck className={`w-6 h-6 mb-2 ${
                            action === 'verify' ? 'text-emerald-500' : (darkMode ? 'text-slate-400' : 'text-slate-500')
                          }`} />
                          <p className={`font-bold ${
                            darkMode ? 'text-white' : 'text-slate-900'
                          }`}>
                            Verify Manufacturer
                          </p>
                          <p className={`text-sm ${
                            darkMode ? 'text-slate-400' : 'text-slate-600'
                          }`}>
                            Enable batch registration
                          </p>
                        </div>
                      </div>
                    </label>
                    
                    <label className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                      action === 'deactivate'
                        ? (darkMode 
                            ? 'bg-red-500/20 border-red-500/50 shadow-lg shadow-red-500/25' 
                            : 'bg-red-50 border-red-500 shadow-lg shadow-red-500/25')
                        : (darkMode
                            ? 'bg-slate-700/60 border-slate-600 hover:border-slate-500'
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-lg hover:shadow-xl')
                    }`}>
                      <div className="flex items-center gap-4">
                        <input 
                          type="radio" 
                          name="action" 
                          value="deactivate"
                          checked={action === 'deactivate'}
                          onChange={(e) => setAction(e.target.value)}
                          disabled={isProcessing}
                          className="w-4 h-4 text-red-500"
                        />
                        <div>
                          <UserX className={`w-6 h-6 mb-2 ${
                            action === 'deactivate' ? 'text-red-500' : (darkMode ? 'text-slate-400' : 'text-slate-500')
                          }`} />
                          <p className={`font-bold ${
                            darkMode ? 'text-white' : 'text-slate-900'
                          }`}>
                            Deactivate Manufacturer
                          </p>
                          <p className={`text-sm ${
                            darkMode ? 'text-slate-400' : 'text-slate-600'
                          }`}>
                            Suspend account access
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
                
                <button 
                  onClick={submit} 
                  disabled={isProcessing || !manufacturerAddress.trim()}
                  className={`w-full px-8 py-6 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-4 ${
                    (isProcessing || !manufacturerAddress.trim())
                      ? (darkMode ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-slate-300 text-slate-500 cursor-not-allowed')
                      : action === 'verify'
                        ? (darkMode
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25'
                            : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25')
                        : (darkMode
                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25'
                            : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25')
                  }`}
                >
                  {getStatusIcon()}
                  {isProcessing ? getStatusMessage() : `${action === 'verify' ? 'Verify' : 'Deactivate'} Manufacturer`}
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
                      Transaction Error
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
                tx.action === 'verify'
                  ? (darkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200')
                  : (darkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200')
              }`}>
                <div className="flex items-center gap-4 mb-8">
                  {tx.action === 'verify' ? (
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  ) : (
                    <XCircle className="w-10 h-10 text-red-500" />
                  )}
                  <h4 className={`text-3xl font-bold ${
                    tx.action === 'verify'
                      ? (darkMode ? 'text-emerald-400' : 'text-emerald-600')
                      : (darkMode ? 'text-red-400' : 'text-red-600')
                  }`}>
                    {tx.action === 'verify' ? 'Verification' : 'Deactivation'} Completed!
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
                        Action
                      </p>
                      <p className={`text-lg font-bold ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        {tx.action}
                      </p>
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
                        Manufacturer Address
                      </p>
                      <p className={`text-sm font-mono break-all ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        {tx.manufacturerAddress}
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
                
                <div className={`p-8 rounded-2xl border ${
                  tx.action === 'verify'
                    ? (darkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200')
                    : (darkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200')
                }`}>
                  <div className="flex items-start gap-4">
                    <Zap className={`w-6 h-6 flex-shrink-0 mt-1 ${
                      tx.action === 'verify' ? 'text-emerald-500' : 'text-red-500'
                    }`} />
                    <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>
                      {tx.action === 'verify' ? 
                        'Manufacturer verification completed successfully! They can now register medicine batches.' :
                        'Manufacturer deactivated successfully! They can no longer register medicine batches.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Admin Info */}
          <div className="space-y-8">
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
                  Admin Actions
                </h3>
              </div>
              
              <div className="space-y-4">
                {[
                  { icon: UserCheck, text: 'Verify new manufacturers' },
                  { icon: UserX, text: 'Deactivate accounts' },
                  { icon: Activity, text: 'Monitor system activity' },
                  { icon: FileText, text: 'Review applications' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-blue-500" />
                    <p className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-8 rounded-3xl border ${
              darkMode
                ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle className="w-8 h-8 text-amber-500" />
                <h3 className={`text-xl font-bold ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Important Notes
                </h3>
              </div>
              
              <div className="space-y-4">
                <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  • Verify manufacturer credentials before approval
                </p>
                <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  • Check license validity and company registration
                </p>
                <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  • Deactivation prevents batch registration
                </p>
                <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  • All actions are recorded on blockchain
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
