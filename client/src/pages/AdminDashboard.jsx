import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';
import {
  useDashboardStats,
  useExpiredBatches,
  useManufacturer,
  useVerifiedManufacturers,
} from '../hooks/useSubgraph';
import { getGlobalStats, getExpiredReports } from '../api/verify';
import { getUnverifiedManufacturers } from '../api/manufacturer';
import { useTheme } from '../contexts/ThemeContext';

import {
  Shield,
  Users,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  TrendingUp,
  Activity,
  Server,
  Globe,
  ArrowRight,
  AlertCircle,
  Database,
  WifiOff,
  Settings,
  Eye,
  ChevronRight,
  Bell,
  Zap,
  FileText,
} from 'lucide-react';

export default function AdminDashboard() {
  const { address } = useAccount();
  
  const { darkMode } = useTheme();
  const [expandedCard, setExpandedCard] = useState(null);
  
  // API-based data fetching (renamed to avoid conflicts)
  const { data: apiStatsData, isLoading: apiStatsLoading, error: apiStatsError } = useQuery({
    queryKey: ['stats'],
    queryFn: getGlobalStats,
    retry: false,
    staleTime: 30000,
  });
  
  const { data: apiReportsData, isLoading: apiReportsLoading, error: apiReportsError } = useQuery({
    queryKey: ['expired-reports'],
    queryFn: getExpiredReports,
    retry: false,
    staleTime: 30000,
  });

  const { data: unverifiedData, isLoading: unverifiedLoading, error: unverifiedError } = useQuery({
    queryKey: ['unverified-manufacturers'],
    queryFn: getUnverifiedManufacturers,
    retry: false,
    staleTime: 30000,
  });

  // Subgraph hooks (keeping original names)
  const { data: statsData, loading: statsLoading, error: statsError } = useDashboardStats();
  const { data: reportsData, loading: reportsLoading, error: reportsError } = useExpiredBatches();
  const { data: verifiedData, loading: verifiedLoading, error: verifiedError } = useVerifiedManufacturers();

  // Use subgraph data as primary source, fallback to API data
  const stats = statsData || apiStatsData?.stats || {};
  const reports = reportsData?.medicineBatches || apiReportsData?.data?.reports || [];
  const unverifiedManufacturers = unverifiedData?.data?.manufacturers || [];
  
  // Check if user is admin
  const isAdmin = address && stats?.adminAddress && 
    address.toLowerCase() === stats.adminAddress.toLowerCase();

  // Show loading state
  if (statsLoading || reportsLoading || verifiedLoading || apiStatsLoading || apiReportsLoading || unverifiedLoading) {
    return (
      <div className={`min-h-screen font-sans transition-colors duration-500 ${
        darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
      }`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative">
              <div className={`w-20 h-20 border-4 rounded-full animate-spin ${
                darkMode ? 'border-slate-600 border-t-emerald-400' : 'border-slate-300 border-t-emerald-500'
              }`}></div>
            </div>
            <p className={`mt-6 text-xl ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Loading admin dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show API error if backend is not available
  const hasApiError = apiStatsError || apiReportsError || unverifiedError;
  const isBackendUnavailable = hasApiError && (
    apiStatsError?.message?.includes('ECONNREFUSED') ||
    apiReportsError?.message?.includes('ECONNREFUSED') ||
    unverifiedError?.message?.includes('ECONNREFUSED')
  );

  if (!isAdmin) {
    return (
      <div className={`min-h-screen font-sans transition-colors duration-500 ${
        darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
      }`}>
        <div className="flex items-center justify-center min-h-screen p-6">
          <div className={`max-w-lg w-full text-center p-12 rounded-3xl shadow-2xl ${
            darkMode 
              ? 'bg-slate-800 border border-slate-700' 
              : 'bg-white border border-slate-200'
          }`}>
            <div className="mb-8">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
                darkMode ? 'bg-red-500/20' : 'bg-red-50'
              }`}>
                <Shield className="w-12 h-12 text-red-500" />
              </div>
            </div>
            <h3 className={`text-3xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Access Denied
            </h3>
            <p className={`text-lg mb-8 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Only admins can access this dashboard. Please connect with an admin wallet to continue.
            </p>
            <Link to="/">
              <button className={`px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg ${
                darkMode
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/25'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/25'
              }`}>
                ← Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getColorClasses = (color) => {
    const colors = {
      emerald: 'from-emerald-500/10 to-emerald-600/10 border-emerald-500/30 hover:border-emerald-500/50',
      amber: 'from-amber-500/10 to-amber-600/10 border-amber-500/30 hover:border-amber-500/50',
      red: 'from-red-500/10 to-red-600/10 border-red-500/30 hover:border-red-500/50',
      blue: 'from-blue-500/10 to-blue-600/10 border-blue-500/30 hover:border-blue-500/50',
      purple: 'from-purple-500/10 to-purple-600/10 border-purple-500/30 hover:border-purple-500/50',
    };
    return colors[color] || colors.emerald;
  };

  const getIconColor = (color) => {
    const colors = {
      emerald: 'text-emerald-500',
      amber: 'text-amber-500',
      red: 'text-red-500',
      blue: 'text-blue-500',
      purple: 'text-purple-500',
    };
    return colors[color] || colors.emerald;
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

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* API Error Alert */}
        {isBackendUnavailable && (
          <div className={`mb-8 p-8 rounded-3xl border-2 ${
            darkMode 
              ? 'bg-red-500/10 border-red-500/30 backdrop-blur-sm' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-6">
              <WifiOff className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-xl font-bold text-red-500 mb-3">
                  Backend Server Unavailable
                </h4>
                <p className={`mb-4 text-lg ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Cannot connect to the backend server. Please start the backend server on port 5000.
                </p>
                <code className={`px-4 py-2 rounded-xl text-sm font-mono ${
                  darkMode ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-slate-700'
                }`}>
                  npm run backend
                </code>
              </div>
            </div>
          </div>
        )}

        {/* Hero Header */}
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full mb-6 border ${
            darkMode 
              ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' 
              : 'bg-purple-50 text-purple-600 border-purple-200'
          }`}>
            <Shield className="w-5 h-5" />
            <span className="font-medium">Admin Mode Active</span>
          </div>
          
          <h1 className={`text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent`}>
            Admin Control Center
          </h1>
          
          <p className={`text-xl max-w-2xl mx-auto ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Complete system oversight and management of the MedChain ecosystem
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-16">
          <h2 className={`text-3xl font-bold mb-8 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { to: '/manufacturer/verify', icon: CheckCircle2, title: 'Verify Manufacturers', desc: 'Review and approve manufacturer applications', color: 'emerald' },
              { to: '/manufacturer/list?status=unverified', icon: Clock, title: 'Pending Approvals', desc: `${unverifiedManufacturers.length} manufacturers awaiting verification`, color: 'amber', badge: unverifiedManufacturers.length },
              { to: '/reports/expired', icon: BarChart3, title: 'Expired Reports', desc: 'View expired medicine scan reports', color: 'red' }
            ].map((action, index) => (
              <Link key={index} to={action.to} className="group">
                <div className={`p-8 rounded-3xl border transition-all duration-300 hover:scale-105 ${
                  darkMode
                    ? `bg-gradient-to-br ${getColorClasses(action.color)}`
                    : `bg-gradient-to-br ${getColorClasses(action.color)}`
                }`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <action.icon className={`w-10 h-10 ${getIconColor(action.color)}`} />
                      {action.badge && action.badge > 0 && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white">
                          {action.badge}
                        </span>
                      )}
                    </div>
                    <ArrowRight className={`w-6 h-6 ${getIconColor(action.color)} group-hover:translate-x-1 transition-transform`} />
                  </div>
                  <h3 className={`text-xl font-bold mb-3 ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {action.title}
                  </h3>
                  <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {action.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Pending Verifications Alert */}
        {unverifiedManufacturers.length > 0 && (
          <div className={`mb-16 p-8 rounded-3xl border-2 ${
            darkMode
              ? 'bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-amber-500/30 backdrop-blur-sm'
              : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200'
          }`}>
            <div className="flex items-start gap-6 mb-8">
              <Bell className="w-10 h-10 text-amber-500 flex-shrink-0" />
              <div>
                <h3 className={`text-3xl font-bold mb-3 ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  {unverifiedManufacturers.length} Manufacturer{unverifiedManufacturers.length > 1 ? 's' : ''} Awaiting Verification
                </h3>
                <p className={`text-lg ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Review and approve these pending manufacturer applications
                </p>
              </div>
            </div>
            
            <div className="grid gap-6">
              {unverifiedManufacturers.slice(0, 3).map((mfr, i) => (
                <div key={i} className={`p-8 rounded-2xl border ${
                  darkMode
                    ? 'bg-slate-800/60 border-slate-700'
                    : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className={`text-xl font-bold mb-4 ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        {mfr.name}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          <span className="font-semibold">License:</span> {mfr.license}
                        </div>
                        <div className={`font-mono ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          <span className="font-semibold">Wallet:</span> {mfr.wallet?.slice(0, 10)}...{mfr.wallet?.slice(-8)}
                        </div>
                        <div className={darkMode ? 'text-slate-300' : 'text-slate-600'}>
                          <span className="font-semibold">Email:</span> {mfr.email}
                        </div>
                      </div>
                    </div>
                    <Link to="/manufacturer/verify">
                      <button className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 ${
                        darkMode
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25'
                          : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25'
                      }`}>
                        Verify Now
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {unverifiedManufacturers.length > 3 && (
              <div className="text-center mt-8">
                <Link to="/manufacturer/list?status=unverified">
                  <button className={`px-10 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 ${
                    darkMode
                      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300'
                  }`}>
                    View All {unverifiedManufacturers.length} Pending
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* System Statistics */}
        <div className="mb-16">
          <h2 className={`text-3xl font-bold mb-8 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            System Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Database, title: 'Total Batches', value: stats.totalBatches || 0, color: 'emerald', desc: 'Registered medicine batches' },
              { icon: Users, title: 'Manufacturers', value: stats.totalManufacturers || 0, color: 'blue', desc: 'Verified manufacturers', extra: unverifiedManufacturers.length > 0 ? `${unverifiedManufacturers.length} pending` : null },
              { icon: AlertCircle, title: 'Recalled Batches', value: stats.totalRecalledBatches || 0, color: 'red', desc: 'Safety recalls issued' },
              { icon: TrendingUp, title: 'Expired Scans', value: stats.totalExpiredScans || 0, color: 'amber', desc: 'Medicines past expiry' }
            ].map((stat, index) => (
              <div
                key={index}
                className={`p-8 rounded-3xl border shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer ${
                  darkMode
                    ? `bg-gradient-to-br ${getColorClasses(stat.color)}`
                    : `bg-gradient-to-br ${getColorClasses(stat.color)}`
                }`}
                onMouseEnter={() => setExpandedCard(index)}
                onMouseLeave={() => setExpandedCard(null)}
              >
                <div className="flex items-center justify-between mb-6">
                  <stat.icon className={`w-12 h-12 ${getIconColor(stat.color)}`} />
                </div>
                <h3 className={`text-sm font-bold mb-3 ${
                  darkMode ? `${stat.color === 'emerald' ? 'text-emerald-400' : stat.color === 'blue' ? 'text-blue-400' : stat.color === 'amber' ? 'text-amber-400' : 'text-red-400'}` 
                  : `${stat.color === 'emerald' ? 'text-emerald-600' : stat.color === 'blue' ? 'text-blue-600' : stat.color === 'amber' ? 'text-amber-600' : 'text-red-600'}`
                }`}>
                  {stat.title}
                </h3>
                <p className={`text-4xl font-bold mb-3 ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  {stat.value.toLocaleString()}
                </p>
                {stat.extra && (
                  <p className="text-sm text-amber-500 font-semibold mb-2">
                    ({stat.extra})
                  </p>
                )}
                <p className={`text-sm transition-all duration-300 ${
                  expandedCard === index ? 'opacity-100' : 'opacity-70'
                } ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {stat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expired Medicine Reports */}
        <div className="mb-16">
          <h2 className={`text-3xl font-bold mb-8 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Recent Expired Medicine Reports
          </h2>
          {reports.length === 0 ? (
            <div className={`p-16 text-center rounded-3xl border-2 border-dashed ${
              darkMode
                ? 'border-slate-600 bg-slate-800/30'
                : 'border-slate-300 bg-slate-50'
            }`}>
              <CheckCircle2 className={`w-20 h-20 mx-auto mb-6 ${
                darkMode ? 'text-emerald-400' : 'text-emerald-500'
              }`} />
              <p className={`text-xl font-semibold ${
                darkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                No expired medicine reports found
              </p>
              <p className={`text-sm mt-2 ${
                darkMode ? 'text-slate-500' : 'text-slate-500'
              }`}>
                All medicines are within their validity period
              </p>
            </div>
          ) : (
            <div>
              <p className={`mb-8 text-lg ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Showing latest {Math.min(5, reports.length)} expired reports
              </p>
              <div className="grid gap-6">
                {reports.slice(0, 5).map((report, i) => (
                  <div key={i} className={`p-8 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
                    darkMode
                      ? 'bg-slate-800/60 border-slate-700 hover:border-amber-500/50'
                      : 'bg-white border-slate-200 hover:border-amber-300'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <AlertTriangle className="w-8 h-8 text-amber-500" />
                        <div>
                          <Link to={`/batch/${report.batchId}`} className={`text-xl font-bold hover:underline ${
                            darkMode ? 'text-white hover:text-emerald-400' : 'text-slate-900 hover:text-emerald-600'
                          }`}>
                            {report.batchId}
                          </Link>
                          <p className={`text-sm mt-1 ${
                            darkMode ? 'text-slate-400' : 'text-slate-600'
                          }`}>
                            {report.medicineName}
                          </p>
                        </div>
                      </div>
                      <div className={`px-6 py-3 rounded-full font-bold ${
                        darkMode
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-red-50 text-red-600'
                      }`}>
                        {report.expiredScanCount} scans
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {reports.length > 5 && (
                <div className="text-center mt-8">
                  <Link to="/reports/expired">
                    <button className={`px-10 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 ${
                      darkMode
                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300'
                    }`}>
                      View All Reports
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Network Information */}
        <div className={`p-10 rounded-3xl border ${
          darkMode
            ? 'bg-slate-800/60 border-slate-700'
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-4 mb-8">
            <Globe className={`w-8 h-8 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
            <h3 className={`text-2xl font-bold ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Network Information
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className={`text-sm font-semibold mb-3 ${
                darkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Network
              </p>
              <p className={`text-lg font-bold ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                {stats.network || 'Unknown'}
              </p>
            </div>
            <div>
              <p className={`text-sm font-semibold mb-3 ${
                darkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Chain ID
              </p>
              <p className={`text-lg font-bold ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                {stats.chainId || 'Unknown'}
              </p>
            </div>
            <div>
              <p className={`text-sm font-semibold mb-3 ${
                darkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Admin Address
              </p>
              <p className={`font-mono text-sm break-all ${
                darkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                {stats.adminAddress || 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
