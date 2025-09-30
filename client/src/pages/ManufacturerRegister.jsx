import React, { useState, useEffect } from 'react';
import { useWalletClient, usePublicClient, useAccount } from 'wagmi';
import { prepareRegisterManufacturer } from '../api/manufacturer';
import { useTheme } from '../contexts/ThemeContext';
import {
  Factory,
  User,
  Mail,
  Award,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Shield,
  FileText,
  Clock,
  Zap,
  Info,
  AlertCircle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { addNetworkToMetaMask, switchToNetwork } from '../utils/networks';

export default function ManufacturerRegister() {
  const { darkMode } = useTheme();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { address, chain } = useAccount(); // Add chain info from wagmi
  const [form, setForm] = useState({ 
    manufacturerAddress: address || '', 
    name: '', 
    license: '', 
    email: '' 
  });
  const [tx, setTx] = useState(null);
  const [err, setErr] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle', 'preparing', 'pending', 'confirming', 'success', 'error'

  // Auto-update address when wallet connects - PRESERVED EXACTLY
  useEffect(() => {
    if (address) {
      setForm(f => ({ ...f, manufacturerAddress: address }));
    }
  }, [address]);

  // PRESERVED ORIGINAL FUNCTIONS
  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  async function submit() {
    setErr(null);
    setStatus('preparing');
    setTx(null);
    
    try {
      if (!address) throw new Error('Wallet not connected');
      if (!walletClient) throw new Error('Wallet client not available. Please ensure you are connected to Filecoin Calibration network in MetaMask.');
      if (chain?.id !== 314159) throw new Error('Please switch your wallet to Filecoin Calibration testnet (Chain ID: 314159)');
      
      setStatus('preparing');
      
      const prep = await prepareRegisterManufacturer(form);
      const { contractAddress, abi, method } = prep.transaction;
      let { args } = prep.transaction;

      // Ensure the first argument matches the connected wallet (self-registration requirement)
      if (Array.isArray(args)) {
        args = [...args];
        args[0] = address;
      }
      
      // Preflight: simulate the transaction to catch revert reasons early
      try {
        await publicClient.simulateContract({
          account: address,
          address: contractAddress,
          abi,
          functionName: method,
          args,
        });
      } catch (simErr) {
        const msg = parseBlockchainError(simErr);
        throw new Error(msg || 'Transaction simulation failed. Please check your inputs.');
      }

      setStatus('pending');
      
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi,
        functionName: method,
        args,
        account: address,
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
      setErr(parseBlockchainError(e));
      setStatus('error');
    }
  }

  function parseBlockchainError(error) {
    const fallback = error?.message || String(error) || 'Unknown error';
    const msg = typeof error === 'string' ? error : (error?.shortMessage || error?.message || '');
    if (!msg) return fallback;
    // Common revert reasons mapping
    if (msg.includes('Can only register yourself') || msg.toLowerCase().includes('register yourself')) {
      return 'Registration must be initiated by the same wallet as the manufacturer address. We auto-corrected this, please try again.';
    }
    if (msg.toLowerCase().includes('already registered')) {
      return 'Manufacturer already registered. If you need verification, contact an admin.';
    }
    if (msg.toLowerCase().includes('invalid email')) {
      return 'Invalid email format. Please use a valid email like name@domain.tld';
    }
    if (msg.toLowerCase().includes('missing required fields')) {
      return 'Missing required fields. Please fill in name, license, and email.';
    }
    if (msg.toLowerCase().includes('insufficient funds')) {
      return 'Insufficient funds to pay gas on Filecoin Calibration. Please add some tFIL to your wallet.';
    }
    if (msg.toLowerCase().includes('user rejected')) {
      return 'You rejected the transaction in your wallet.';
    }
    if (msg.toLowerCase().includes('intrinsic gas') || msg.toLowerCase().includes('out of gas')) {
      return 'Transaction ran out of gas. Try again; if it persists, contact support.';
    }
    if (msg.toLowerCase().includes('json-rpc') || msg.toLowerCase().includes('internal')) {
      return 'Internal RPC error from the node. This often indicates a contract revert (e.g., failing require). Please double-check your inputs and try again.';
    }
    // Extract revert reason if present
    const match = msg.match(/revert(?:ed)?(?: with reason string)?[:\s]*["']?([^"']+)["']?/i);
    if (match && match[1]) return match[1];
    return fallback;
  }

  const getStatusMessage = () => {
    switch (status) {
      case 'preparing':
        return 'Preparing registration...';
      case 'pending':
        return 'Please confirm transaction in your wallet...';
      case 'confirming':
        return 'Waiting for blockchain confirmation...';
      case 'success':
        return 'Registration submitted successfully!';
      case 'error':
        return 'Registration failed';
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

      <div className="relative max-w-4xl mx-auto px-6 py-8">
        {/* Hero Header */}
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full mb-6 border ${
            darkMode 
              ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
              : 'bg-blue-50 text-blue-600 border-blue-200'
          }`}>
            <Factory className="w-5 h-5" />
            <span className="font-medium">Manufacturer Registration</span>
          </div>
          
          <h1 className={`text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent`}>
            Register as Manufacturer
          </h1>
          
          <p className={`text-xl max-w-2xl mx-auto ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Join the MedChain network as a verified medicine manufacturer
          </p>
        </div>

        {/* Process Guide */}
        <div className={`p-10 rounded-3xl border-2 mb-12 ${
          darkMode
            ? 'bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/30 backdrop-blur-sm'
            : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
        }`}>
          <div className="flex items-center gap-4 mb-8">
            <Info className="w-10 h-10 text-blue-500" />
            <h2 className={`text-3xl font-bold ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Self-Registration Process
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { step: '1', icon: FileText, text: 'Fill out company details' },
              { step: '2', icon: Zap, text: 'Submit registration transaction' },
              { step: '3', icon: Clock, text: 'Wait for blockchain confirmation' },
              { step: '4', icon: Shield, text: 'Wait for admin verification' },
              { step: '5', icon: CheckCircle2, text: 'Start registering batches' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                  darkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                }`}>
                  <item.icon className="w-8 h-8 text-blue-500" />
                </div>
                <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-bold mb-3 ${
                  darkMode ? 'bg-blue-500 text-white' : 'bg-blue-500 text-white'
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Registration Form */}
          <div className="lg:col-span-2">
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

            {/* Registration Form */}
            <div className={`p-10 rounded-3xl border ${
              darkMode
                ? 'bg-slate-800/60 border-slate-700'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-4 mb-8">
                <FileText className={`w-8 h-8 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <h2 className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Company Information
                </h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-bold mb-3 ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    <Wallet className="w-4 h-4 inline mr-2" />
                    Wallet Address
                  </label>
                  <input 
                    name="manufacturerAddress" 
                    placeholder="Your Wallet Address (auto-filled)" 
                    value={form.manufacturerAddress} 
                    onChange={onChange}
                    disabled={!!address || isProcessing}
                    className={`w-full px-6 py-4 rounded-2xl font-mono transition-all duration-300 ${
                      (!!address || isProcessing)
                        ? (darkMode
                            ? 'bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-100 border-slate-300 text-slate-500 cursor-not-allowed')
                        : (darkMode
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500'
                            : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-emerald-500')
                    } border focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-bold mb-3 ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    <Factory className="w-4 h-4 inline mr-2" />
                    Company Name
                  </label>
                  <input 
                    name="name" 
                    placeholder="e.g., MedCorp Industries" 
                    value={form.name} 
                    onChange={onChange}
                    disabled={isProcessing}
                    className={`w-full px-6 py-4 rounded-2xl font-medium transition-all duration-300 ${
                      darkMode
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 disabled:bg-slate-800 disabled:text-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-400'
                    } border focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-bold mb-3 ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    <Award className="w-4 h-4 inline mr-2" />
                    License Number
                  </label>
                  <input 
                    name="license" 
                    placeholder="e.g., FDA-MFG-2024-001" 
                    value={form.license} 
                    onChange={onChange}
                    disabled={isProcessing}
                    className={`w-full px-6 py-4 rounded-2xl font-medium transition-all duration-300 ${
                      darkMode
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 disabled:bg-slate-800 disabled:text-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-400'
                    } border focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-bold mb-3 ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    <Mail className="w-4 h-4 inline mr-2" />
                    Company Email
                  </label>
                  <input 
                    name="email" 
                    type="email"
                    placeholder="contact@medcorp.com" 
                    value={form.email} 
                    onChange={onChange}
                    disabled={isProcessing}
                    className={`w-full px-6 py-4 rounded-2xl font-medium transition-all duration-300 ${
                      darkMode
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 disabled:bg-slate-800 disabled:text-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-400'
                    } border focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                  />
                </div>
                
                <div className="pt-4">
                  <button 
                    onClick={submit} 
                    disabled={isProcessing || !address || !walletClient || chain?.id !== 314159}
                    className={`w-full px-8 py-6 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-4 ${
                      (isProcessing || !address || !walletClient || chain?.id !== 314159)
                        ? (darkMode ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-slate-300 text-slate-500 cursor-not-allowed')
                        : (darkMode
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25'
                            : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25')
                    }`}
                  >
                    {getStatusIcon()}
                    {isProcessing ? getStatusMessage() : 'Register as Manufacturer'}
                    {!isProcessing && <ArrowRight className="w-5 h-5" />}
                  </button>
                  {!address && (
                    <p className={`mt-4 text-center font-semibold ${
                      darkMode ? 'text-red-400' : 'text-red-600'
                    }`}>
                      Please connect your wallet first
                    </p>
                  )}
                  {address && !walletClient && (
                    <p className={`mt-4 text-center font-semibold ${
                      darkMode ? 'text-red-400' : 'text-red-600'
                    }`}>
                      Wallet client not available. Please ensure you are using MetaMask and are connected to Filecoin Calibration (Chain ID: 314159).
                    </p>
                  )}
                  {address && (!walletClient || chain?.id !== 314159) && (
                    <div className="mt-4 text-center">
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
                            // Attempt to switch after adding
                            await switchToNetwork(314159);
                          } catch (e) {
                            console.error('Network add/switch failed:', e);
                            alert('Failed to add/switch network in MetaMask. Please add Filecoin Calibration manually.');
                          }
                        }}
                        className="px-4 py-2 rounded-lg bg-amber-500 text-white font-semibold"
                      >
                        Add / Switch to Filecoin Calibration
                      </button>
                    </div>
                  )}
                  {address && walletClient && chain?.id !== 314159 && (
                    <p className={`mt-4 text-center font-semibold ${
                      darkMode ? 'text-red-400' : 'text-red-600'
                    }`}>
                      Wrong network. Please switch your wallet to Filecoin Calibration (Chain ID: 314159).
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Error Display */}
            {err && (
              <div className={`p-8 rounded-3xl border-2 mt-8 ${
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
                      Registration Error
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
              <div className={`p-10 rounded-3xl border-2 mt-8 ${
                darkMode
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-emerald-50 border-emerald-200'
              }`}>
                <div className="flex items-center gap-4 mb-8">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  <h4 className={`text-3xl font-bold ${
                    darkMode ? 'text-emerald-400' : 'text-emerald-600'
                  }`}>
                    Registration Submitted Successfully!
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
                        Company
                      </p>
                      <p className={`text-lg font-bold ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        {form.name}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm font-bold mb-2 ${
                        darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        License
                      </p>
                      <p className={`text-lg font-bold ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        {form.license}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm font-bold mb-2 ${
                        darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        Email
                      </p>
                      <p className={`text-lg font-bold ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        {form.email}
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
                  darkMode
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className="flex items-start gap-4">
                    <Clock className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                    <div>
                      <p className={`font-bold text-amber-500 mb-2`}>
                        Next Step
                      </p>
                      <p className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        Your registration is confirmed on the blockchain. Wait for admin verification 
                        before you can register medicine batches.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Help & Info */}
          <div className="space-y-8">
            <div className={`p-8 rounded-3xl border ${
              darkMode
                ? 'bg-slate-800/60 border-slate-700'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <Shield className={`w-8 h-8 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                <h3 className={`text-xl font-bold ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Why Register?
                </h3>
              </div>
              
              <div className="space-y-4">
                {[
                  { icon: CheckCircle2, text: 'Register medicine batches' },
                  { icon: Shield, text: 'Build trust with consumers' },
                  { icon: FileText, text: 'Comply with regulations' },
                  { icon: Zap, text: 'Enable blockchain verification' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-emerald-500" />
                    <p className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-8 rounded-3xl border ${
              darkMode
                ? 'bg-blue-500/10 border-blue-500/30'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle className="w-8 h-8 text-blue-500" />
                <h3 className={`text-xl font-bold ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Important Notes
                </h3>
              </div>
              
              <div className="space-y-4">
                <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  • Ensure all information is accurate
                </p>
                <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  • Your license number will be verified
                </p>
                <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  • Registration requires blockchain transaction
                </p>
                <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  • Admin approval needed before batch registration
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
