import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBatch, getBatchQR } from '../api/batch';
import { useAccount } from 'wagmi';
import { useTheme } from '../contexts/ThemeContext';
import {
  ArrowLeft,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  Factory,
  Calendar,
  Shield,
  QrCode,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  User,
  AlertCircle,
  Info,
  Zap,
  Activity,
} from 'lucide-react';

export default function BatchDetail() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const { address } = useAccount();
  const { darkMode } = useTheme();
  const [expandedSection, setExpandedSection] = useState(null);
  
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

  if (batchLoading) {
    return (
      <div className={`min-h-screen font-sans transition-colors duration-500 ${
        darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
      }`}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="relative mb-8">
                <div className={`w-16 h-16 border-4 rounded-full animate-spin ${
                  darkMode ? 'border-slate-600 border-t-emerald-400' : 'border-slate-300 border-t-emerald-500'
                }`}></div>
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Loading Batch Details
              </h3>
              <p className={`text-lg ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Fetching information for batch: <span className="font-mono font-semibold text-emerald-500">{batchId}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (batchError) {
    return (
      <div className={`min-h-screen font-sans transition-colors duration-500 ${
        darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
      }`}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="mb-8">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
                darkMode ? 'bg-red-500/20' : 'bg-red-50'
              }`}>
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
            </div>
            
            <h3 className={`text-3xl font-bold mb-6 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Batch Not Found
            </h3>
            
            <div className={`p-8 rounded-3xl border-2 mb-8 ${
              darkMode 
                ? 'bg-red-500/10 border-red-500/30' 
                : 'bg-red-50 border-red-200'
            }`}>
              <p className={`text-lg font-semibold mb-4 ${
                darkMode ? 'text-red-400' : 'text-red-600'
              }`}>
                Error: {batchError.message}
              </p>
              <p className={`mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Batch ID: <span className="font-mono font-semibold">{batchId}</span>
              </p>
              <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>
                This batch may not exist in the system or the ID might be incorrect.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/verify')}
                className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 ${
                  darkMode
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                }`}
              >
                Try Different Batch
              </button>
              <button 
                onClick={() => navigate('/')}
                className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 ${
                  darkMode
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300'
                }`}
              >
                Back to Home
              </button>
            </div>
          </div>
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

  const getStatusInfo = () => {
    if (status?.isRecalled) {
      return {
        icon: XCircle,
        text: 'RECALLED',
        color: 'red',
        bgColor: darkMode ? 'bg-red-500/20 border-red-500/30' : 'bg-red-50 border-red-200',
        textColor: 'text-red-500'
      };
    }
    if (status?.isExpired) {
      return {
        icon: AlertTriangle,
        text: 'EXPIRED',
        color: 'amber',
        bgColor: darkMode ? 'bg-amber-500/20 border-amber-500/30' : 'bg-amber-50 border-amber-200',
        textColor: 'text-amber-500'
      };
    }
    if (status?.isValid) {
      return {
        icon: CheckCircle2,
        text: 'VALID',
        color: 'emerald',
        bgColor: darkMode ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200',
        textColor: 'text-emerald-500'
      };
    }
    return {
      icon: Clock,
      text: status?.isActive === false ? 'INACTIVE' : 'UNKNOWN',
      color: 'slate',
      bgColor: darkMode ? 'bg-slate-500/20 border-slate-500/30' : 'bg-slate-50 border-slate-200',
      textColor: 'text-slate-500'
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

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

      <div className="relative max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
          <div className="mb-4 sm:mb-0">
            <button
              onClick={() => navigate(-1)}
              className={`flex items-center gap-2 mb-4 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                darkMode
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            
            <h1 className={`text-4xl font-bold mb-2 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Batch Details
            </h1>
            <p className={`text-xl font-mono ${
              darkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {batchId}
            </p>
          </div>
          
          {isOwner && !status?.isRecalled && (
            <Link to={`/batch/${batchId}/recall`}>
              <button className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
                darkMode
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25'
                  : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25'
              }`}>
                <AlertTriangle className="w-5 h-5" />
                Recall This Batch
              </button>
            </Link>
          )}
        </div>

        {/* Status Card */}
        <div className={`p-8 rounded-3xl border-2 mb-12 ${statusInfo.bgColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <StatusIcon className={`w-12 h-12 ${statusInfo.textColor}`} />
              <div>
                <h2 className={`text-2xl font-bold ${statusInfo.textColor}`}>
                  {statusInfo.text}
                </h2>
                {verification?.message && (
                  <p className={`text-lg mt-2 ${
                    darkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {verification.message}
                  </p>
                )}
              </div>
            </div>
            
            <div className={`px-4 py-2 rounded-full border ${
              darkMode 
                ? 'bg-slate-800/60 border-slate-700 text-slate-300' 
                : 'bg-white border-slate-200 text-slate-600'
            }`}>
              <Activity className="w-5 h-5 inline mr-2" />
              Status Active
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Batch Information */}
            {batch && (
              <div className={`p-8 rounded-3xl border ${
                darkMode
                  ? 'bg-slate-800/60 border-slate-700'
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-3 mb-8">
                  <Package className={`w-8 h-8 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  <h3 className={`text-2xl font-bold ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    Batch Information
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { icon: Shield, label: 'Medicine Name', value: batch.medicineName },
                    { icon: Package, label: 'Batch ID', value: batch.batchId, mono: true },
                    { icon: Factory, label: 'Manufacturer', value: `${batch.manufacturer?.slice(0, 10)}...${batch.manufacturer?.slice(-8)}`, mono: true, link: `/manufacturer/${batch.manufacturer}` },
                    { icon: Calendar, label: 'Manufacturing Date', value: batch.manufacturingDateFormatted || 'Unknown' },
                    { icon: Clock, label: 'Expiry Date', value: batch.expiryDateFormatted || 'Unknown' },
                    { icon: Activity, label: 'Created', value: batch.createdAtFormatted || 'Unknown' },
                  ].map((item, index) => (
                    <div key={index} className={`p-6 rounded-2xl border ${
                      darkMode
                        ? 'bg-slate-700/60 border-slate-600'
                        : 'bg-white border-slate-200'
                    }`}>
                      <div className="flex items-center gap-3 mb-3">
                        <item.icon className={`w-5 h-5 ${
                          darkMode ? 'text-slate-400' : 'text-slate-500'
                        }`} />
                        <span className={`text-sm font-semibold ${
                          darkMode ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          {item.label}
                        </span>
                      </div>
                      {item.link ? (
                        <Link to={item.link} className={`text-lg font-semibold hover:underline ${
                          darkMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'
                        }`}>
                          {item.value}
                        </Link>
                      ) : (
                        <p className={`text-lg font-semibold ${item.mono ? 'font-mono' : ''} ${
                          darkMode ? 'text-white' : 'text-slate-900'
                        }`}>
                          {item.value}
                        </p>
                      )}
                    </div>
                  ))}
                  
                  {batch.expiredScanCount > 0 && (
                    <div className={`p-6 rounded-2xl border-2 ${
                      darkMode
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-amber-50 border-amber-200'
                    }`}>
                      <div className="flex items-center gap-3 mb-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <span className="text-sm font-semibold text-amber-500">
                          Expired Scans
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-amber-500">
                        {batch.expiredScanCount}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              <Link to={`/verify/${batchId}`}>
                <button className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-3 ${
                  darkMode
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25'
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25'
                }`}>
                  <Eye className="w-5 h-5" />
                  Verify This Batch
                </button>
              </Link>
            </div>
          </div>

          {/* Sidebar - QR Code */}
          <div className="space-y-8">
            <div className={`p-8 rounded-3xl border ${
              darkMode
                ? 'bg-slate-800/60 border-slate-700'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-3 mb-8">
                <QrCode className={`w-8 h-8 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                <h3 className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  QR Code
                </h3>
              </div>
              
              {qrLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className={`w-8 h-8 border-4 rounded-full animate-spin ${
                    darkMode ? 'border-slate-600 border-t-cyan-400' : 'border-slate-300 border-t-cyan-500'
                  }`}></div>
                </div>
              ) : qrError ? (
                <div className={`p-6 rounded-2xl border-2 ${
                  darkMode 
                    ? 'bg-red-500/10 border-red-500/30' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <p className={`font-semibold ${
                    darkMode ? 'text-red-400' : 'text-red-600'
                  }`}>
                    Failed to load QR code: {qrError.message}
                  </p>
                </div>
              ) : qrInfo?.data?.qr?.qrCode ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <img 
                      src={qrInfo.data.qr.qrCode} 
                      width={200} 
                      height={200} 
                      alt="Batch QR Code"
                      className={`mx-auto rounded-2xl border-2 ${
                        darkMode ? 'border-slate-600' : 'border-slate-200'
                      }`}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className={`p-4 rounded-xl ${
                      darkMode ? 'bg-slate-700/60' : 'bg-white'
                    }`}>
                      <p className={`text-sm font-semibold mb-2 ${
                        darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        Format: {qrInfo.data.qr.format || 'PNG'}
                      </p>
                      <p className={`text-sm font-semibold ${
                        darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        Size: {qrInfo.data.qr.size || '200x200'}
                      </p>
                    </div>
                    
                    <button 
                      onClick={downloadQRCode}
                      className={`w-full px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 ${
                        darkMode
                          ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white hover:from-cyan-600 hover:to-cyan-700'
                          : 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white hover:from-cyan-600 hover:to-cyan-700'
                      }`}
                    >
                      <Download className="w-5 h-5" />
                      Download QR Code
                    </button>
                  </div>
                  
                  {/* Technical Details - Collapsible */}
                  <div className={`rounded-2xl border transition-all duration-500 ${
                    darkMode
                      ? 'bg-slate-700/60 border-slate-600'
                      : 'bg-white border-slate-200'
                  }`}>
                    <button
                      onClick={() => setExpandedSection(expandedSection === 'qr' ? null : 'qr')}
                      className={`w-full p-4 flex items-center justify-between hover:${
                        darkMode ? 'bg-slate-600/60' : 'bg-slate-50'
                      } rounded-2xl transition-colors`}
                    >
                      <span className={`font-semibold ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        Technical Details
                      </span>
                      {expandedSection === 'qr' ? (
                        <ChevronDown className={`w-5 h-5 ${
                          darkMode ? 'text-slate-400' : 'text-slate-600'
                        }`} />
                      ) : (
                        <ChevronRight className={`w-5 h-5 ${
                          darkMode ? 'text-slate-400' : 'text-slate-600'
                        }`} />
                      )}
                    </button>
                    {expandedSection === 'qr' && (
                      <div className="px-4 pb-4">
                        <pre className={`p-4 rounded-xl text-xs font-mono overflow-auto ${
                          darkMode ? 'bg-slate-900/60 text-slate-300' : 'bg-slate-50 text-slate-700'
                        }`}>
                          {qrInfo.data.qr.qrData}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className={`p-8 text-center rounded-2xl border-2 border-dashed ${
                  darkMode
                    ? 'border-slate-600 bg-slate-700/30'
                    : 'border-slate-300 bg-slate-50'
                }`}>
                  <QrCode className={`w-12 h-12 mx-auto mb-4 ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`} />
                  <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>
                    No QR code available for this batch
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
