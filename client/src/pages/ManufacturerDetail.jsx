import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getManufacturer, getManufacturerBatches } from '../api/manufacturer';
import { useAccount } from 'wagmi';
import { useTheme } from '../contexts/ThemeContext';
import {
  ArrowLeft,
  Factory,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Package,
  Plus,
  Eye,
  Mail,
  Calendar,
  Activity,
  User,
  ExternalLink,
  Award,
  AlertCircle,
  FileText,
  Zap,
  ChevronRight,
  Loader2,
} from 'lucide-react';

export default function ManufacturerDetail() {
  const { address: manufacturerAddress } = useParams();
  const navigate = useNavigate();
  const { address: connectedAddress } = useAccount();
  const { darkMode } = useTheme();
  const [expandedBatch, setExpandedBatch] = useState(null);
  
  const { data: manufacturerInfo, isLoading: mfrLoading, error: mfrError } = useQuery({ 
    queryKey: ['mfr', manufacturerAddress], 
    queryFn: () => getManufacturer(manufacturerAddress),
    enabled: !!manufacturerAddress,
    retry: 1
  });
  
  const { data: batchesInfo, isLoading: batchesLoading, error: batchesError } = useQuery({ 
    queryKey: ['mfr-batches', manufacturerAddress], 
    queryFn: () => getManufacturerBatches(manufacturerAddress),
    enabled: !!manufacturerAddress,
    retry: 1
  });

  if (mfrLoading) {
    return (
      <div className={`min-h-screen font-sans transition-colors duration-500 ${
        darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="relative mb-8">
                <div className={`w-20 h-20 border-4 rounded-full animate-spin ${
                  darkMode ? 'border-slate-600 border-t-blue-400' : 'border-slate-300 border-t-blue-500'
                }`}></div>
                <div className={`absolute inset-0 w-20 h-20 border-4 rounded-full animate-ping ${
                  darkMode ? 'border-blue-400/20' : 'border-blue-500/20'
                }`}></div>
              </div>
              <h3 className={`text-3xl font-bold mb-4 ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Loading Manufacturer Details
              </h3>
              <p className={`text-xl ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Address: <span className="font-mono font-semibold text-blue-500">{manufacturerAddress}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mfrError) {
    return (
      <div className={`min-h-screen font-sans transition-colors duration-500 ${
        darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center py-20">
            <div className="mb-8">
              <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center ${
                darkMode ? 'bg-red-500/20' : 'bg-red-50'
              }`}>
                <XCircle className="w-16 h-16 text-red-500" />
              </div>
            </div>
            
            <h3 className={`text-4xl font-bold mb-6 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Manufacturer Not Found
            </h3>
            
            <div className={`p-10 rounded-3xl border-2 mb-8 ${
              darkMode 
                ? 'bg-red-500/10 border-red-500/30' 
                : 'bg-red-50 border-red-200'
            }`}>
              <p className={`text-xl font-semibold mb-4 ${
                darkMode ? 'text-red-400' : 'text-red-600'
              }`}>
                Error: {mfrError.message}
              </p>
              <p className={`mb-4 text-lg ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Address: <span className="font-mono font-semibold">{manufacturerAddress}</span>
              </p>
              <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                This manufacturer may not be registered in the system.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/manufacturer/list">
                <button className={`px-10 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 ${
                  darkMode
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25'
                }`}>
                  View All Manufacturers
                </button>
              </Link>
              <button 
                onClick={() => navigate('/')}
                className={`px-10 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 ${
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

  const manufacturer = manufacturerInfo?.data?.manufacturer || manufacturerInfo?.manufacturer;
  const batches = batchesInfo?.data?.batches || batchesInfo?.batches || [];
  const isOwnProfile = connectedAddress?.toLowerCase() === manufacturerAddress?.toLowerCase();

  const getStatusInfo = (isVerified, isActive) => {
    if (isVerified && isActive) {
      return {
        icon: CheckCircle2,
        text: 'Verified & Active',
        color: 'emerald',
        bgColor: darkMode ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
      };
    } else if (isVerified && !isActive) {
      return {
        icon: AlertTriangle,
        text: 'Verified but Inactive',
        color: 'amber',
        bgColor: darkMode ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-200'
      };
    } else if (!isVerified && isActive) {
      return {
        icon: Clock,
        text: 'Unverified',
        color: 'amber',
        bgColor: darkMode ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-200'
      };
    } else {
      return {
        icon: XCircle,
        text: 'Inactive',
        color: 'red',
        bgColor: darkMode ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-50 text-red-600 border-red-200'
      };
    }
  };

  const getBatchStatusInfo = (batch) => {
    if (batch.isRecalled) {
      return {
        text: 'RECALLED',
        color: 'red',
        bgColor: darkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
      };
    } else if (batch.isActive) {
      return {
        text: 'ACTIVE',
        color: 'emerald',
        bgColor: darkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
      };
    } else {
      return {
        text: 'INACTIVE',
        color: 'amber',
        bgColor: darkMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'
      };
    }
  };

  const statusInfo = manufacturer ? getStatusInfo(manufacturer.isVerified, manufacturer.isActive) : null;
  const StatusIcon = statusInfo?.icon;

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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
          <div className="mb-4 sm:mb-0">
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
            
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Manufacturer Profile
            </h1>
            
            <p className={`text-xl font-mono ${
              darkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {manufacturerAddress}
            </p>
          </div>
          
          {isOwnProfile && manufacturer?.isVerified && (
            <Link to="/batch/register">
              <button className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-3 ${
                darkMode
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25'
              }`}>
                <Plus className="w-5 h-5" />
                Register New Batch
              </button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Manufacturer Information */}
            {manufacturer && (
              <div className={`p-10 rounded-3xl border ${
                darkMode
                  ? 'bg-slate-800/60 border-slate-700'
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <Factory className={`w-10 h-10 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <h2 className={`text-3xl font-bold ${
                      darkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      {manufacturer.name}
                    </h2>
                  </div>
                  
                  {StatusIcon && (
                    <div className={`px-6 py-3 rounded-2xl border flex items-center gap-3 ${statusInfo.bgColor}`}>
                      <StatusIcon className="w-5 h-5" />
                      <span className="font-bold">{statusInfo.text}</span>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { icon: Award, label: 'License Number', value: manufacturer.license },
                    { icon: Mail, label: 'Email', value: manufacturer.email || 'Not provided' },
                    { icon: Calendar, label: 'Registered', value: manufacturer.registeredDate || 'Unknown' },
                    { icon: Activity, label: 'Status', value: manufacturer.status?.replace(/_/g, ' ').toUpperCase() || 'Unknown' },
                  ].map((item, index) => (
                    <div key={index} className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                      darkMode
                        ? 'bg-slate-700/60 border-slate-600'
                        : 'bg-white border-slate-200 shadow-lg hover:shadow-xl'
                    }`}>
                      <div className="flex items-center gap-3 mb-3">
                        <item.icon className={`w-5 h-5 ${
                          darkMode ? 'text-slate-400' : 'text-slate-500'
                        }`} />
                        <span className={`text-sm font-bold ${
                          darkMode ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          {item.label}
                        </span>
                      </div>
                      <p className={`text-lg font-bold ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Batches Section */}
            <div className={`p-10 rounded-3xl border ${
              darkMode
                ? 'bg-slate-800/60 border-slate-700'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-4 mb-8">
                <Package className={`w-8 h-8 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <h3 className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Medicine Batches ({batches.length})
                </h3>
              </div>
              
              {batchesLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <Loader2 className={`w-10 h-10 animate-spin mb-4 ${
                      darkMode ? 'text-blue-400' : 'text-blue-500'
                    }`} />
                    <p className={`text-lg ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      Loading batches...
                    </p>
                  </div>
                </div>
              ) : batchesError ? (
                <div className={`p-8 rounded-2xl border-2 ${
                  darkMode 
                    ? 'bg-red-500/10 border-red-500/30' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                    <p className={`font-semibold ${
                      darkMode ? 'text-red-400' : 'text-red-600'
                    }`}>
                      Failed to load batches: {batchesError.message}
                    </p>
                  </div>
                </div>
              ) : batches.length === 0 ? (
                <div className={`p-12 text-center rounded-2xl border-2 border-dashed ${
                  darkMode
                    ? 'border-slate-600 bg-slate-700/30'
                    : 'border-slate-300 bg-slate-50'
                }`}>
                  <Package className={`w-16 h-16 mx-auto mb-6 ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`} />
                  <h4 className={`text-xl font-bold mb-4 ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    No Batches Registered
                  </h4>
                  <p className={`text-lg mb-6 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    This manufacturer hasn't registered any medicine batches yet.
                  </p>
                  {isOwnProfile && manufacturer?.isVerified && (
                    <Link to="/batch/register">
                      <button className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-3 mx-auto ${
                        darkMode
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700'
                          : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700'
                      }`}>
                        <Plus className="w-5 h-5" />
                        Register Your First Batch
                      </button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid gap-6">
                  {batches.map((batch, i) => {
                    const batchStatus = getBatchStatusInfo(batch);
                    
                    return (
                      <div 
                        key={i} 
                        className={`p-8 rounded-3xl border-2 transition-all duration-300 hover:scale-[1.02] ${batchStatus.bgColor}`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                              <Package className={`w-6 h-6 text-${batchStatus.color}-500`} />
                              <div>
                                <Link 
                                  to={`/batch/${batch.batchId}`}
                                  className={`text-xl font-bold hover:underline ${
                                    darkMode ? 'text-white hover:text-emerald-400' : 'text-slate-900 hover:text-emerald-600'
                                  }`}
                                >
                                  {batch.batchId}
                                </Link>
                                <p className={`text-lg font-semibold ${
                                  darkMode ? 'text-slate-300' : 'text-slate-600'
                                }`}>
                                  {batch.medicineName}
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className={`text-sm font-bold mb-1 ${
                                  darkMode ? 'text-slate-400' : 'text-slate-500'
                                }`}>
                                  Manufacturing Date
                                </p>
                                <p className={`font-semibold ${
                                  darkMode ? 'text-white' : 'text-slate-900'
                                }`}>
                                  {batch.manufacturingDateFormatted}
                                </p>
                              </div>
                              <div>
                                <p className={`text-sm font-bold mb-1 ${
                                  darkMode ? 'text-slate-400' : 'text-slate-500'
                                }`}>
                                  Expiry Date
                                </p>
                                <p className={`font-semibold ${
                                  darkMode ? 'text-white' : 'text-slate-900'
                                }`}>
                                  {batch.expiryDateFormatted}
                                </p>
                              </div>
                              {batch.expiredScanCount > 0 && (
                                <div>
                                  <p className={`text-sm font-bold mb-1 text-amber-500`}>
                                    Expired Scans
                                  </p>
                                  <p className="text-2xl font-bold text-amber-500">
                                    {batch.expiredScanCount}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className={`px-6 py-3 rounded-2xl border font-bold text-${batchStatus.color}-500 ${
                              darkMode 
                                ? `bg-${batchStatus.color}-500/20 border-${batchStatus.color}-500/30` 
                                : `bg-${batchStatus.color}-50 border-${batchStatus.color}-200`
                            }`}>
                              {batchStatus.text}
                            </div>
                            
                            <Link to={`/batch/${batch.batchId}`}>
                              <button className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
                                darkMode
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                              }`}>
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Quick Actions */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className={`p-8 rounded-3xl border ${
              darkMode
                ? 'bg-slate-800/60 border-slate-700'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <Zap className={`w-8 h-8 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                <h3 className={`text-xl font-bold ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Quick Actions
                </h3>
              </div>
              
              <div className="space-y-4">
                <Link to="/manufacturer/list">
                  <button className={`w-full px-6 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 flex items-center justify-between ${
                    darkMode
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                  }`}>
                    <span>View All Manufacturers</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </Link>
                
                {isOwnProfile && (
                  <Link to="/manufacturer/me">
                    <button className={`w-full px-6 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 flex items-center justify-between ${
                      darkMode
                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300'
                    }`}>
                      <span>Edit Profile</span>
                      <User className="w-5 h-5" />
                    </button>
                  </Link>
                )}
              </div>
            </div>

            {/* Statistics */}
            {manufacturer && (
              <div className={`p-8 rounded-3xl border ${
                darkMode
                  ? 'bg-blue-500/10 border-blue-500/30'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="w-8 h-8 text-blue-500" />
                  <h3 className={`text-xl font-bold ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    Statistics
                  </h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <p className={`text-sm font-bold mb-2 ${
                      darkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      Total Batches
                    </p>
                    <p className={`text-3xl font-bold ${
                      darkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      {batches.length}
                    </p>
                  </div>
                  
                  <div>
                    <p className={`text-sm font-bold mb-2 ${
                      darkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      Active Batches
                    </p>
                    <p className={`text-3xl font-bold text-emerald-500`}>
                      {batches.filter(b => b.isActive && !b.isRecalled).length}
                    </p>
                  </div>
                  
                  {batches.some(b => b.isRecalled) && (
                    <div>
                      <p className={`text-sm font-bold mb-2 ${
                        darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        Recalled Batches
                      </p>
                      <p className="text-3xl font-bold text-red-500">
                        {batches.filter(b => b.isRecalled).length}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
