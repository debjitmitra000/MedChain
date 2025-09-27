import React, { useState } from 'react';
import { useWalletClient, usePublicClient } from 'wagmi';
import { prepareRegisterBatch, getBatchQR } from '../api/batch';
import { useRole } from '../hooks/useRole';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import {
  Shield,
  Package,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  Download,
  Eye,
  QrCode,
  Loader2,
  ChevronDown,
  ChevronRight,
  Activity,
  Factory,
  FileText,
  ExternalLink,
  Zap,
} from 'lucide-react';

export default function BatchRegister() {
  const { darkMode } = useTheme();
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
  const [expandedSection, setExpandedSection] = useState(null);

  // Role-based access control - PRESERVED EXACTLY
  if (!isConnected) {
    return (
      <div className={`min-h-screen font-sans transition-colors duration-500 ${
        darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
      }`}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center py-20">
            <div className="mb-8">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
                darkMode ? 'bg-blue-500/20' : 'bg-blue-50'
              }`}>
                <Shield className="w-12 h-12 text-blue-500" />
              </div>
            </div>
            
            <h3 className={`text-3xl font-bold mb-6 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Connect Wallet Required
            </h3>
            <p className={`text-xl ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Please connect your MetaMask wallet to register batches.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isManufacturer) {
    return (
      <div className={`min-h-screen font-sans transition-colors duration-500 ${
        darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
      }`}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center py-20">
            <div className="mb-8">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
                darkMode ? 'bg-amber-500/20' : 'bg-amber-50'
              }`}>
                <Factory className="w-12 h-12 text-amber-500" />
              </div>
            </div>
            
            <h3 className={`text-3xl font-bold mb-6 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Manufacturer Registration Required
            </h3>
            <p className={`text-xl mb-8 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              You need to be a registered manufacturer to register medicine batches.
            </p>
            <Link to="/manufacturer/register">
              <button className={`px-10 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 ${
                darkMode
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25'
              }`}>
                Register as Manufacturer
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!canRegisterBatch) {
    return (
      <div className={`min-h-screen font-sans transition-colors duration-500 ${
        darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
      }`}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center py-20">
            <div className="mb-8">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
                darkMode ? 'bg-amber-500/20' : 'bg-amber-50'
              }`}>
                <Clock className="w-12 h-12 text-amber-500" />
              </div>
            </div>
            
            <h3 className={`text-3xl font-bold mb-6 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Verification Required
            </h3>
            <p className={`text-xl mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Your manufacturer account needs admin verification before you can register batches.
            </p>
            <p className={`text-lg mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Status: <span className="font-bold text-amber-500">Pending Verification</span>
            </p>
            <Link to="/manufacturer/me">
              <button className={`px-10 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 ${
                darkMode
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25'
              }`}>
                View My Profile
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // PRESERVED ALL ORIGINAL LOGIC
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
        return 'Preparing transaction...';
      case 'pending':
        return 'Please confirm transaction in your wallet...';
      case 'confirming':
        return 'Waiting for blockchain confirmation...';
      case 'success':
        return 'Batch registered successfully!';
      case 'error':
        return 'Transaction failed';
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
    <div className={`min-h-screen font-sans transition-colors duration-500 ${
      darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
    }`}>
      {/* Floating Geometric Shapes Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-16 h-16 bg-emerald-500/5 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-8 h-8 bg-blue-500/10 rotate-45 animate-spin" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-32 left-20 w-12 h-12 bg-purple-500/5 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 right-10 w-6 h-6 bg-amber-500/10 rotate-12 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-8">
        {/* Hero Header */}
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full mb-6 border ${
            darkMode 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
              : 'bg-emerald-50 text-emerald-600 border-emerald-200'
          }`}>
            <Package className="w-5 h-5" />
            <span className="font-medium">Batch Registration</span>
          </div>
          
          <h1 className={`text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent`}>
            Register New Batch
          </h1>
          
          <p className={`text-xl max-w-2xl mx-auto ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Add a new medicine batch to the blockchain for secure verification
          </p>
        </div>

        {/* Manufacturer Info */}
        {manufacturer && (
          <div className={`p-6 rounded-3xl border mb-12 ${
            darkMode
              ? 'bg-blue-500/10 border-blue-500/30'
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center gap-4">
              <Factory className="w-6 h-6 text-blue-500" />
              <div>
                <p className={`font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  Registering as:
                </p>
                <p className={`text-lg font-semibold ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  {manufacturer.name} ({manufacturer.license})
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Registration Form */}
        <div className={`p-10 rounded-3xl border mb-8 ${
          darkMode
            ? 'bg-slate-800/60 border-slate-700'
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-4 mb-8">
            <FileText className={`w-8 h-8 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <h2 className={`text-2xl font-bold ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Batch Information
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-bold mb-3 ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <Package className="w-4 h-4 inline mr-2" />
                Batch ID
              </label>
              <input 
                name="batchId" 
                placeholder="e.g., BATCH-001_ABC" 
                value={form.batchId} 
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
                <Shield className="w-4 h-4 inline mr-2" />
                Medicine Name
              </label>
              <input 
                name="medicineName" 
                placeholder="e.g., Paracetamol 500mg" 
                value={form.medicineName} 
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
                <Calendar className="w-4 h-4 inline mr-2" />
                Manufacturing Date
              </label>
              <input 
                name="manufacturingDate" 
                type="date" 
                value={form.manufacturingDate} 
                onChange={onChange}
                disabled={isProcessing}
                className={`w-full px-6 py-4 rounded-2xl font-medium transition-all duration-300 ${
                  darkMode
                    ? 'bg-slate-700 border-slate-600 text-white focus:border-emerald-500 disabled:bg-slate-800 disabled:text-slate-500'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-400'
                } border focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-bold mb-3 ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <Clock className="w-4 h-4 inline mr-2" />
                Expiry Date
              </label>
              <input 
                name="expiryDate" 
                type="date" 
                value={form.expiryDate} 
                onChange={onChange}
                disabled={isProcessing}
                className={`w-full px-6 py-4 rounded-2xl font-medium transition-all duration-300 ${
                  darkMode
                    ? 'bg-slate-700 border-slate-600 text-white focus:border-emerald-500 disabled:bg-slate-800 disabled:text-slate-500'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-400'
                } border focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
              />
            </div>
          </div>
          
          <div className="mt-8">
            <button 
              onClick={prepareTx} 
              disabled={isProcessing}
              className={`w-full px-8 py-6 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-4 ${
                isProcessing
                  ? (darkMode ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-slate-300 text-slate-500 cursor-not-allowed')
                  : (darkMode
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25'
                      : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25')
              }`}
            >
              {getStatusIcon()}
              {isProcessing ? getStatusMessage() : 'Register Batch'}
            </button>
          </div>
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

        {/* Error Display */}
        {err && (
          <div className={`p-8 rounded-3xl border-2 mb-8 ${
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
        
        {/* Success Details with QR Code - ONLY after success */}
        {status === 'success' && tx && (
          <div className={`p-10 rounded-3xl border-2 mb-8 ${
            darkMode
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-emerald-50 border-emerald-200'
          }`}>
            <div className="flex items-center gap-4 mb-8">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              <h4 className={`text-3xl font-bold ${
                darkMode ? 'text-emerald-400' : 'text-emerald-600'
              }`}>
                Batch Registered Successfully!
              </h4>
            </div>
            
            <div className={`p-8 rounded-2xl ${
              darkMode ? 'bg-slate-700/60' : 'bg-white'
            } mb-8`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className={`text-sm font-bold mb-2 ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Batch ID
                  </p>
                  <p className={`text-lg font-bold font-mono ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {form.batchId}
                  </p>
                </div>
                <div>
                  <p className={`text-sm font-bold mb-2 ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Medicine
                  </p>
                  <p className={`text-lg font-bold ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {form.medicineName}
                  </p>
                </div>
                <div>
                  <p className={`text-sm font-bold mb-2 ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Manufacturing Date
                  </p>
                  <p className={`text-lg font-bold ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {form.manufacturingDate}
                  </p>
                </div>
                <div>
                  <p className={`text-sm font-bold mb-2 ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Expiry Date
                  </p>
                  <p className={`text-lg font-bold ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {form.expiryDate}
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

            {/* QR Code - ONLY shown after successful registration */}
            {qrCode ? (
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <QrCode className="w-8 h-8 text-emerald-500" />
                  <h4 className={`text-2xl font-bold ${
                    darkMode ? 'text-emerald-400' : 'text-emerald-600'
                  }`}>
                    QR Code Generated Successfully!
                  </h4>
                </div>
                
                <div className={`p-8 rounded-2xl border-2 border-emerald-500 mb-6 ${
                  darkMode ? 'bg-slate-700/60' : 'bg-white'
                }`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="text-center">
                      <img 
                        src={qrCode.qrCodeImage} 
                        alt="Batch QR Code" 
                        width={250} 
                        height={250}
                        className="mx-auto rounded-2xl border-4 border-emerald-500"
                      />
                    </div>
                    <div>
                      <div className="space-y-4 mb-6">
                        <div>
                          <p className={`text-sm font-bold mb-2 ${
                            darkMode ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            QR Code for Batch
                          </p>
                          <p className={`text-lg font-bold font-mono ${
                            darkMode ? 'text-white' : 'text-slate-900'
                          }`}>
                            {form.batchId}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm font-bold mb-2 ${
                            darkMode ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            Format
                          </p>
                          <p className={`text-lg font-bold ${
                            darkMode ? 'text-white' : 'text-slate-900'
                          }`}>
                            {qrCode.format}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm font-bold mb-2 ${
                            darkMode ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            Size
                          </p>
                          <p className={`text-lg font-bold ${
                            darkMode ? 'text-white' : 'text-slate-900'
                          }`}>
                            {qrCode.size}
                          </p>
                        </div>
                      </div>
                      
                      <p className={`text-sm mb-6 ${
                        darkMode ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        This QR code can be used to verify the authenticity of this medicine batch.
                      </p>
                      
                      <button 
                        onClick={downloadQRCode}
                        className={`w-full px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 ${
                          darkMode
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25'
                            : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25'
                        }`}
                      >
                        <Download className="w-5 h-5" />
                        Download QR Code
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Technical Details - Collapsible */}
                <div className={`rounded-2xl border ${
                  darkMode
                    ? 'bg-slate-700/60 border-slate-600'
                    : 'bg-white border-slate-200'
                }`}>
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'qr' ? null : 'qr')}
                    className={`w-full p-6 flex items-center justify-between hover:${
                      darkMode ? 'bg-slate-600/60' : 'bg-slate-50'
                    } rounded-2xl transition-colors`}
                  >
                    <span className={`font-bold ${
                      darkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      View QR Data (Technical Details)
                    </span>
                    {expandedSection === 'qr' ? (
                      <ChevronDown className={`w-6 h-6 ${
                        darkMode ? 'text-slate-400' : 'text-slate-600'
                      }`} />
                    ) : (
                      <ChevronRight className={`w-6 h-6 ${
                        darkMode ? 'text-slate-400' : 'text-slate-600'
                      }`} />
                    )}
                  </button>
                  {expandedSection === 'qr' && (
                    <div className="px-6 pb-6">
                      <pre className={`p-6 rounded-xl text-sm font-mono overflow-auto ${
                        darkMode ? 'bg-slate-900/60 text-slate-300' : 'bg-slate-50 text-slate-700'
                      }`}>
                        {qrCode.qrData}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Loading QR or failed */
              <div className={`p-8 rounded-2xl border ${
                darkMode
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-center gap-4">
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                  <p className={`text-lg font-bold ${
                    darkMode ? 'text-amber-400' : 'text-amber-600'
                  }`}>
                    Generating QR code... Please wait.
                  </p>
                </div>
              </div>
            )}

            {/* If QR generation failed */}
            {status === 'success' && !qrCode && tx && (
              <div className={`p-8 rounded-2xl border ${
                darkMode
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                  <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>
                    Batch registered successfully, but QR code generation failed. 
                    You can generate it later from the batch details page.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation buttons after success */}
            <div className="flex flex-wrap gap-6 mt-8">
              <Link to="/manufacturer/me">
                <button className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-3 ${
                  darkMode
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25'
                }`}>
                  <User className="w-5 h-5" />
                  View My Profile
                </button>
              </Link>
              <Link to={`/batch/${form.batchId}`}>
                <button className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-3 ${
                  darkMode
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25'
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25'
                }`}>
                  <Eye className="w-5 h-5" />
                  View Batch Details
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
