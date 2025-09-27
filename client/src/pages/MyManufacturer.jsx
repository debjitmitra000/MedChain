import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRole } from '../hooks/useRole';
import { useQuery } from '@tanstack/react-query';
import { getManufacturerBatches } from '../api/manufacturer';
import { useTheme } from '../contexts/ThemeContext';
import {
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
  Award,
  Calendar,
  Activity,
  User,
  BarChart3,
  TrendingUp,
  Loader2,
  ArrowRight,
  AlertCircle,
  Zap,
} from 'lucide-react';

export default function MyManufacturer() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { 
    isConnected, 
    isManufacturer, 
    manufacturer, 
    address,
    canRegisterBatch,
    isVerified,
    isActive
  } = useRole();

  const { data: batchesInfo, isLoading: batchesLoading } = useQuery({
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
              Please connect your MetaMask wallet to view your manufacturer profile.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isManufacturer || !manufacturer) {
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
              Not Registered as Manufacturer
            </h3>
            <p className={`text-xl mb-8 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              You are not registered as a manufacturer in the system.
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

  const batches = batchesInfo?.data?.batches || [];

  // PRESERVED ORIGINAL FUNCTION
  const getStatusBadge = (isVerified, isActive) => {
    let color, text;
    if (isVerified && isActive) {
      color = '#38a169'; text = '✅ Verified & Active';
    } else if (isVerified && !isActive) {
      color = '#d69e2e'; text = '⚠️ Verified but Inactive';
    } else if (!isVerified && isActive) {
      color = '#ed8936'; text = '⏳ Awaiting Verification';
    } else {
      color = '#e53e3e'; text = '❌ Inactive';
    }
    
    return { color, text };
  };

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
        text: 'Awaiting Verification',
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

  const statusInfo = getStatusInfo(manufacturer.isVerified, manufacturer.isActive);
  const StatusIcon = statusInfo.icon;

  // Calculate statistics
  const activeCount = batches.filter(b => b.isActive && !b.isRecalled).length;
  const recalledCount = batches.filter(b => b.isRecalled).length;
  const totalExpiredScans = batches.reduce((sum, b) => sum + (b.expiredScanCount || 0), 0);

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
            <User className="w-5 h-5" />
            <span className="font-medium">My Profile</span>
          </div>
          
          <h1 className={`text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent`}>
            My Manufacturer Profile
          </h1>
          
          <p className={`text-xl max-w-2xl mx-auto ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Manage your manufacturer account and medicine batch portfolio
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Card */}
            <div className={`p-10 rounded-3xl border ${
              darkMode
                ? 'bg-slate-800/60 border-slate-700'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
                <div className="flex items-center gap-6">
                  <Factory className={`w-16 h-16 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <div>
                    <h2 className={`text-3xl font-bold mb-2 ${
                      darkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      {manufacturer.name}
                    </h2>
                    <p className={`text-lg font-mono ${
                      darkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {address}
                    </p>
                  </div>
                </div>
                
                <div className={`px-6 py-3 rounded-2xl border flex items-center gap-3 ${statusInfo.bgColor}`}>
                  <StatusIcon className="w-6 h-6" />
                  <span className="font-bold">{statusInfo.text}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { icon: Award, label: 'License Number', value: manufacturer.license },
                  { icon: Mail, label: 'Email', value: manufacturer.email },
                  { icon: Calendar, label: 'Registered', value: manufacturer.registeredDate },
                  { icon: Package, label: 'Total Batches', value: batches.length, highlight: true },
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
                    <p className={`text-xl font-bold ${
                      item.highlight 
                        ? 'text-blue-500' 
                        : (darkMode ? 'text-white' : 'text-slate-900')
                    }`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-8">
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
                
                <Link to="/manufacturer/me/batches">
                  <button className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-3 ${
                    darkMode
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25'
                  }`}>
                    <Eye className="w-5 h-5" />
                    View All My Batches ({batches.length})
                  </button>
                </Link>
              </div>
              
              {!manufacturer.isVerified && (
                <div className={`mt-6 p-6 rounded-2xl border ${
                  darkMode
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className="flex items-start gap-4">
                    <Clock className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                    <div>
                      <p className={`font-bold text-amber-500 mb-2`}>
                        Verification Pending
                      </p>
                      <p className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        Contact admin to verify your manufacturer account before you can register batches.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats Dashboard */}
            <div className={`p-10 rounded-3xl border ${
              darkMode
                ? 'bg-slate-800/60 border-slate-700'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-4 mb-8">
                <BarChart3 className={`w-8 h-8 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <h2 className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Portfolio Statistics
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            {/* Recent Batches */}
            <div className={`p-10 rounded-3xl border ${
              darkMode
                ? 'bg-slate-800/60 border-slate-700'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-4 mb-8">
                <Package className={`w-8 h-8 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                <h2 className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Recent Batches
                </h2>
              </div>
              
              {batchesLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <Loader2 className={`w-10 h-10 animate-spin mb-4 ${
                      darkMode ? 'text-blue-400' : 'text-blue-500'
                    }`} />
                    <p className={`text-lg ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      Loading your batches...
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
                  <h3 className={`text-2xl font-bold mb-4 ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    No Batches Registered Yet
                  </h3>
                  <p className={`text-lg mb-6 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Start building your medicine portfolio by registering your first batch.
                  </p>
                  {canRegisterBatch ? (
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
                  ) : (
                    <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Complete verification to start registering batches
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {batches.slice(0, 3).map((batch, i) => {
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

                    const batchStatusInfo = getBatchStatusInfo(batch);
                    
                    return (
                      <div 
                        key={i} 
                        className={`p-8 rounded-3xl border-2 transition-all duration-300 hover:scale-[1.02] ${batchStatusInfo.bgColor}`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                              <Package className={`w-6 h-6 text-${batchStatusInfo.color}-500`} />
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
                            
                            <div className="flex flex-wrap gap-6">
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
                                  <p className={`text-sm font-bold mb-1 text-orange-500`}>
                                    Expired Scans
                                  </p>
                                  <p className="text-xl font-bold text-orange-500">
                                    {batch.expiredScanCount}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-4 items-end">
                            <div className={`px-6 py-3 rounded-2xl border font-bold text-${batchStatusInfo.color}-500 ${
                              darkMode 
                                ? `bg-${batchStatusInfo.color}-500/20 border-${batchStatusInfo.color}-500/30` 
                                : `bg-${batchStatusInfo.color}-50 border-${batchStatusInfo.color}-200`
                            }`}>
                              {batchStatusInfo.text}
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
                  
                  {batches.length > 3 && (
                    <div className="text-center pt-6">
                      <Link to="/manufacturer/me/batches">
                        <button className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-3 mx-auto ${
                          darkMode
                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700'
                            : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700'
                        }`}>
                          <Package className="w-5 h-5" />
                          View All {batches.length} Batches
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Quick Actions & Info */}
          <div className="space-y-8">
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
                {canRegisterBatch && (
                  <Link to="/batch/register">
                    <button className={`w-full px-6 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 flex items-center justify-between ${
                      darkMode
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700'
                        : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700'
                    }`}>
                      <span>Register Batch</span>
                      <Plus className="w-5 h-5" />
                    </button>
                  </Link>
                )}
                
                <Link to="/manufacturer/me/batches">
                  <button className={`w-full px-6 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 flex items-center justify-between ${
                    darkMode
                      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300'
                  }`}>
                    <span>View All Batches</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Profile Status */}
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
                  Account Status
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {manufacturer.isVerified ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-500" />
                  )}
                  <span className={`font-semibold ${
                    manufacturer.isVerified ? 'text-emerald-500' : 'text-amber-500'
                  }`}>
                    {manufacturer.isVerified ? 'Verified Account' : 'Pending Verification'}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  {manufacturer.isActive ? (
                    <Activity className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className={`font-semibold ${
                    manufacturer.isActive ? 'text-emerald-500' : 'text-red-500'
                  }`}>
                    {manufacturer.isActive ? 'Active Status' : 'Inactive Status'}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  {canRegisterBatch ? (
                    <Shield className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                  )}
                  <span className={`font-semibold ${
                    canRegisterBatch ? 'text-emerald-500' : 'text-amber-500'
                  }`}>
                    {canRegisterBatch ? 'Can Register Batches' : 'Cannot Register Batches'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
