import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRole } from '../hooks/useRole';
import { useQuery } from '@tanstack/react-query';
import { getManufacturerBatches } from '../api/manufacturer';
import { useTheme } from '../contexts/ThemeContext';
import {
  Package,
  Plus,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  Calendar,
  Activity,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Factory,
  User,
  Zap,
  FileText,
  Loader2,
} from 'lucide-react';

export default function MyBatches() {
  const { darkMode } = useTheme();
  const { 
    isConnected, 
    isManufacturer, 
    address,
    canRegisterBatch 
  } = useRole();

  const { data: batchesInfo, isLoading, error } = useQuery({
    queryKey: ['my-batches', address],
    queryFn: () => getManufacturerBatches(address),
    enabled: isManufacturer && !!address,
    retry: 1
  });

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
              Please connect your MetaMask wallet to view your batches.
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
              Manufacturer Access Required
            </h3>
            <p className={`text-xl mb-8 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              You need to be a registered manufacturer to view this page.
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

  if (isLoading) {
    return (
      <div className={`min-h-screen font-sans transition-colors duration-500 ${
        darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="relative mb-8">
                <div className={`w-20 h-20 border-4 rounded-full animate-spin ${
                  darkMode ? 'border-slate-600 border-t-emerald-400' : 'border-slate-300 border-t-emerald-500'
                }`}></div>
                <div className={`absolute inset-0 w-20 h-20 border-4 rounded-full animate-ping ${
                  darkMode ? 'border-emerald-400/20' : 'border-emerald-500/20'
                }`}></div>
              </div>
              <h3 className={`text-3xl font-bold mb-4 ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Loading Your Batches
              </h3>
              <p className={`text-xl ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Retrieving your medicine batch portfolio...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
                <AlertCircle className="w-16 h-16 text-red-500" />
              </div>
            </div>
            
            <h3 className={`text-4xl font-bold mb-6 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Error Loading Batches
            </h3>
            
            <div className={`p-10 rounded-3xl border-2 mb-8 ${
              darkMode 
                ? 'bg-red-500/10 border-red-500/30' 
                : 'bg-red-50 border-red-200'
            }`}>
              <p className={`text-xl ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                {error.message}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const batches = batchesInfo?.data?.batches || [];

  // PRESERVED ORIGINAL FUNCTIONS
  const getStatusColor = (batch) => {
    if (batch.isRecalled) return '#e53e3e';
    if (!batch.isActive) return '#d69e2e';
    return '#38a169';
  };

  const getStatusText = (batch) => {
    if (batch.isRecalled) return 'RECALLED';
    if (!batch.isActive) return 'INACTIVE';
    return 'ACTIVE';
  };

  const getStatusInfo = (batch) => {
    if (batch.isRecalled) {
      return {
        icon: XCircle,
        text: 'RECALLED',
        color: 'red',
        bgColor: darkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
      };
    } else if (!batch.isActive) {
      return {
        icon: AlertTriangle,
        text: 'INACTIVE',
        color: 'amber',
        bgColor: darkMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'
      };
    } else {
      return {
        icon: CheckCircle2,
        text: 'ACTIVE',
        color: 'emerald',
        bgColor: darkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
      };
    }
  };

  // Calculate statistics
  const activeCount = batches.filter(b => b.isActive && !b.isRecalled).length;
  const inactiveCount = batches.filter(b => !b.isActive && !b.isRecalled).length;
  const recalledCount = batches.filter(b => b.isRecalled).length;
  const totalExpiredScans = batches.reduce((sum, b) => sum + (b.expiredScanCount || 0), 0);

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
        {/* Hero Header */}
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full mb-6 border ${
            darkMode 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
              : 'bg-emerald-50 text-emerald-600 border-emerald-200'
          }`}>
            <Package className="w-5 h-5" />
            <span className="font-medium">My Batch Portfolio</span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="text-left sm:text-center mb-6 sm:mb-0">
              <h1 className={`text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent`}>
                My Medicine Batches
              </h1>
              <p className={`text-2xl font-bold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                ({batches.length} Total)
              </p>
            </div>
            
            {canRegisterBatch && (
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
        </div>

        {/* Summary Stats Dashboard */}
        <div className={`p-10 rounded-3xl border mb-12 ${
          darkMode
            ? 'bg-slate-800/60 border-slate-700'
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-4 mb-8">
            <BarChart3 className={`w-8 h-8 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <h2 className={`text-2xl font-bold ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Portfolio Overview
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={`p-8 rounded-3xl border-2 transition-all duration-300 hover:scale-105 ${
              darkMode
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-emerald-50 border-emerald-200'
            }`}>
              <div className="flex items-center gap-4 mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <span className={`text-sm font-bold ${
                  darkMode ? 'text-emerald-400' : 'text-emerald-600'
                }`}>
                  Active Batches
                </span>
              </div>
              <p className="text-4xl font-bold text-emerald-500">
                {activeCount}
              </p>
            </div>

            <div className={`p-8 rounded-3xl border-2 transition-all duration-300 hover:scale-105 ${
              darkMode
                ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-center gap-4 mb-4">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
                <span className={`text-sm font-bold ${
                  darkMode ? 'text-amber-400' : 'text-amber-600'
                }`}>
                  Inactive
                </span>
              </div>
              <p className="text-4xl font-bold text-amber-500">
                {inactiveCount}
              </p>
            </div>

            <div className={`p-8 rounded-3xl border-2 transition-all duration-300 hover:scale-105 ${
              darkMode
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-4 mb-4">
                <XCircle className="w-8 h-8 text-red-500" />
                <span className={`text-sm font-bold ${
                  darkMode ? 'text-red-400' : 'text-red-600'
                }`}>
                  Recalled
                </span>
              </div>
              <p className="text-4xl font-bold text-red-500">
                {recalledCount}
              </p>
            </div>

            <div className={`p-8 rounded-3xl border-2 transition-all duration-300 hover:scale-105 ${
              darkMode
                ? 'bg-orange-500/10 border-orange-500/30'
                : 'bg-orange-50 border-orange-200'
            }`}>
              <div className="flex items-center gap-4 mb-4">
                <TrendingUp className="w-8 h-8 text-orange-500" />
                <span className={`text-sm font-bold ${
                  darkMode ? 'text-orange-400' : 'text-orange-600'
                }`}>
                  Expired Scans
                </span>
              </div>
              <p className="text-4xl font-bold text-orange-500">
                {totalExpiredScans}
              </p>
            </div>
          </div>
        </div>

        {/* Batch List or Empty State */}
        {batches.length === 0 ? (
          <div className={`p-16 text-center rounded-3xl border-2 border-dashed ${
            darkMode
              ? 'border-slate-600 bg-slate-800/30'
              : 'border-slate-300 bg-slate-50'
          }`}>
            <Package className={`w-20 h-20 mx-auto mb-8 ${
              darkMode ? 'text-slate-400' : 'text-slate-500'
            }`} />
            <h3 className={`text-3xl font-bold mb-6 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              No Batches Yet
            </h3>
            <p className={`text-xl mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              You haven't registered any medicine batches yet.
            </p>
            
            {canRegisterBatch ? (
              <Link to="/batch/register">
                <button className={`px-10 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-3 mx-auto ${
                  darkMode
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700'
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700'
                }`}>
                  <Plus className="w-5 h-5" />
                  Register Your First Batch
                </button>
              </Link>
            ) : (
              <div className="space-y-4">
                <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Complete manufacturer verification to register batches.
                </p>
                <Link to="/manufacturer/me">
                  <button className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 ${
                    darkMode
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                  }`}>
                    View Profile Status
                  </button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <h2 className={`text-3xl font-bold ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Batch Details
            </h2>
            
            <div className="grid gap-8">
              {batches.map((batch, i) => {
                const statusInfo = getStatusInfo(batch);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <div 
                    key={i} 
                    className={`p-8 rounded-3xl border-2 transition-all duration-300 hover:scale-[1.02] ${statusInfo.bgColor}`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <StatusIcon className={`w-8 h-8 text-${statusInfo.color}-500`} />
                          <div>
                            <Link 
                              to={`/batch/${batch.batchId}`}
                              className={`text-2xl font-bold hover:underline ${
                                darkMode ? 'text-white hover:text-emerald-400' : 'text-slate-900 hover:text-emerald-600'
                              }`}
                            >
                              {batch.batchId}
                            </Link>
                            <div className={`inline-flex px-4 py-1 rounded-full text-sm font-bold ml-4 text-${statusInfo.color}-500 ${
                              darkMode 
                                ? `bg-${statusInfo.color}-500/20` 
                                : `bg-${statusInfo.color}-50`
                            }`}>
                              {statusInfo.text}
                            </div>
                          </div>
                        </div>
                        
                        <p className={`text-xl font-bold mb-6 ${
                          darkMode ? 'text-slate-300' : 'text-slate-600'
                        }`}>
                          {batch.medicineName}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                                Manufacturing
                              </span>
                            </div>
                            <p className={`text-lg font-bold ${
                              darkMode ? 'text-white' : 'text-slate-900'
                            }`}>
                              {batch.manufacturingDateFormatted}
                            </p>
                          </div>

                          <div className={`p-6 rounded-2xl ${
                            darkMode ? 'bg-slate-700/60' : 'bg-white'
                          }`}>
                            <div className="flex items-center gap-3 mb-3">
                              <Clock className={`w-5 h-5 ${
                                darkMode ? 'text-slate-400' : 'text-slate-500'
                              }`} />
                              <span className={`text-sm font-bold ${
                                darkMode ? 'text-slate-400' : 'text-slate-500'
                              }`}>
                                Expiry
                              </span>
                            </div>
                            <p className={`text-lg font-bold ${
                              darkMode ? 'text-white' : 'text-slate-900'
                            }`}>
                              {batch.expiryDateFormatted}
                            </p>
                          </div>

                          <div className={`p-6 rounded-2xl ${
                            darkMode ? 'bg-slate-700/60' : 'bg-white'
                          }`}>
                            <div className="flex items-center gap-3 mb-3">
                              <Activity className={`w-5 h-5 ${
                                darkMode ? 'text-slate-400' : 'text-slate-500'
                              }`} />
                              <span className={`text-sm font-bold ${
                                darkMode ? 'text-slate-400' : 'text-slate-500'
                              }`}>
                                Created
                              </span>
                            </div>
                            <p className={`text-lg font-bold ${
                              darkMode ? 'text-white' : 'text-slate-900'
                            }`}>
                              {batch.createdAtFormatted}
                            </p>
                          </div>

                          {batch.expiredScanCount > 0 && (
                            <div className={`p-6 rounded-2xl border-2 ${
                              darkMode
                                ? 'bg-orange-500/10 border-orange-500/30'
                                : 'bg-orange-50 border-orange-200'
                            }`}>
                              <div className="flex items-center gap-3 mb-3">
                                <TrendingUp className="w-5 h-5 text-orange-500" />
                                <span className="text-sm font-bold text-orange-500">
                                  Expired Scans
                                </span>
                              </div>
                              <p className="text-2xl font-bold text-orange-500">
                                {batch.expiredScanCount}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Link to={`/batch/${batch.batchId}`}>
                          <button className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-3 ${
                            darkMode
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                              : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                          }`}>
                            <Eye className="w-5 h-5" />
                            View Details
                          </button>
                        </Link>
                        
                        {!batch.isRecalled && batch.isActive && (
                          <Link to={`/batch/${batch.batchId}/recall`}>
                            <button className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-3 ${
                              darkMode
                                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                                : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                            }`}>
                              <AlertTriangle className="w-5 h-5" />
                              Recall
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
