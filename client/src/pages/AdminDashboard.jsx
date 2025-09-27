import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';
import {
  useDashboardStats,
  useExpiredBatches,
  useManufacturer,
  useVerifiedManufacturers,
} from '../hooks/useSubgraph';
import {
  Sun,
  Moon,
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
  ExternalLink,
  ArrowRight,
  AlertCircle,
  Database,
  Wifi,
  WifiOff,
} from 'lucide-react';

export default function AdminDashboard() {
  const { address } = useAccount();
  const [darkMode, setDarkMode] = useState(true);

  // Subgraph hooks
  const { data: statsData, loading: statsLoading, error: statsError } = useDashboardStats();
  const { data: reportsData, loading: reportsLoading, error: reportsError } = useExpiredBatches();
  const { data: verifiedData, loading: verifiedLoading, error: verifiedError } = useVerifiedManufacturers();

  // Use real data from subgraph
  const stats = statsData || {};
  const reports = reportsData?.medicineBatches || [];
  const unverifiedManufacturers = verifiedData?.manufacturers || [];
  
  // Check if user is admin
  const isAdmin = address && stats?.adminAddress && 
    address.toLowerCase() === stats.adminAddress.toLowerCase();

  // Toggle theme
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Show loading state
  if (statsLoading || reportsLoading || verifiedLoading) {
    return (
      <div className={`min-h-screen font-sans transition-colors duration-500 ${
        darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
      }`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative">
              <div className={`w-16 h-16 border-4 rounded-full animate-spin ${
                darkMode ? 'border-slate-600 border-t-emerald-400' : 'border-slate-300 border-t-emerald-500'
              }`}></div>
            </div>
            <p className={`mt-6 text-lg ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Loading admin dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show API error if backend is not available
  const hasApiError = statsError || reportsError || verifiedError;
  const isBackendUnavailable = hasApiError && (
    statsError?.message?.includes('ECONNREFUSED') ||
    reportsError?.message?.includes('ECONNREFUSED') ||
    verifiedError?.message?.includes('ECONNREFUSED')
  );

  if (!isAdmin) {
    return (
      <div className={`min-h-screen font-sans transition-colors duration-500 ${
        darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
      }`}>
        <div className="flex items-center justify-center min-h-screen p-6">
          <div className={`max-w-md w-full text-center p-8 rounded-2xl shadow-2xl ${
            darkMode 
              ? 'bg-slate-800 border border-slate-700' 
              : 'bg-white border border-slate-200'
          }`}>
            <div className="mb-6">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                darkMode ? 'bg-red-500/20' : 'bg-red-50'
              }`}>
                <Shield className="w-10 h-10 text-red-500" />
              </div>
            </div>
            <h3 className={`text-2xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Access Denied
            </h3>
            <p className={`mb-6 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Only admins can access this dashboard. Please connect with an admin wallet to continue.
            </p>
            <Link to="/">
              <button className={`px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 ${
                darkMode
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700'
              }`}>
                ← Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${
      darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
    }`}>
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={`fixed top-6 right-6 z-50 p-3 rounded-full transition-all duration-300 backdrop-blur-sm hover:scale-105 ${
          darkMode
            ? 'bg-slate-800/80 hover:bg-slate-700/80 text-cyan-400 shadow-lg shadow-cyan-400/20'
            : 'bg-white/80 hover:bg-slate-50/80 text-slate-700 shadow-lg shadow-slate-300/30'
        }`}
      >
        {darkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* API Error Alert */}
        {isBackendUnavailable && (
          <div className={`mb-8 p-6 rounded-2xl border-2 ${
            darkMode 
              ? 'bg-red-500/10 border-red-500/30 backdrop-blur-sm' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-4">
              <WifiOff className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-red-500 mb-2">
                  Backend Server Unavailable
                </h4>
                <p className={`mb-3 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Cannot connect to the backend server. Please start the backend server on port 5000.
                </p>
                <code className={`px-3 py-1 rounded-lg text-sm font-mono ${
                  darkMode ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-slate-700'
                }`}>
                  npm run backend
                </code>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
          <div className="mb-4 sm:mb-0">
            <h1 className={`text-4xl font-bold mb-2 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Admin Dashboard
            </h1>
            <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Monitor and manage the MedChain ecosystem
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full font-medium ${
            darkMode 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
              : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
          }`}>
            <Activity className="w-4 h-4 inline mr-2" />
            Admin Mode Active
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className={`text-2xl font-bold mb-6 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/manufacturer/verify" className="group">
              <div className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                darkMode
                  ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border-emerald-500/30 hover:border-emerald-500/50'
                  : 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:border-emerald-300'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  <ArrowRight className="w-5 h-5 text-emerald-500 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Verify Manufacturers
                </h3>
                <p className={`text-sm ${
                  darkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Review and approve manufacturer applications
                </p>
              </div>
            </Link>

            <Link to="/manufacturer/list?status=unverified" className="group">
              <div className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                darkMode
                  ? 'bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-amber-500/30 hover:border-amber-500/50'
                  : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:border-amber-300'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-8 h-8 text-amber-500" />
                    {unverifiedManufacturers.length > 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        darkMode ? 'bg-red-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {unverifiedManufacturers.length}
                      </span>
                    )}
                  </div>
                  <ArrowRight className="w-5 h-5 text-amber-500 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Pending Approvals
                </h3>
                <p className={`text-sm ${
                  darkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {unverifiedManufacturers.length} manufacturers awaiting verification
                </p>
              </div>
            </Link>

            <Link to="/reports/expired" className="group">
              <div className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                darkMode
                  ? 'bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/30 hover:border-red-500/50'
                  : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:border-red-300'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <BarChart3 className="w-8 h-8 text-red-500" />
                  <ArrowRight className="w-5 h-5 text-red-500 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Expired Reports
                </h3>
                <p className={`text-sm ${
                  darkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  View expired medicine scan reports
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Pending Verifications Alert */}
        {unverifiedManufacturers.length > 0 && (
          <div className={`mb-12 p-8 rounded-2xl border-2 ${
            darkMode
              ? 'bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-amber-500/30 backdrop-blur-sm'
              : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200'
          }`}>
            <div className="flex items-start gap-4 mb-6">
              <AlertTriangle className="w-8 h-8 text-amber-500 flex-shrink-0" />
              <div>
                <h3 className={`text-2xl font-bold mb-2 ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  {unverifiedManufacturers.length} Manufacturer{unverifiedManufacturers.length > 1 ? 's' : ''} Awaiting Verification
                </h3>
                <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Review and approve these pending manufacturer applications
                </p>
              </div>
            </div>
            
            <div className="grid gap-4">
              {unverifiedManufacturers.slice(0, 3).map((mfr, i) => (
                <div key={i} className={`p-6 rounded-xl border ${
                  darkMode
                    ? 'bg-slate-800/60 border-slate-700'
                    : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className={`text-lg font-semibold mb-2 ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        {mfr.name}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div className={darkMode ? 'text-slate-300' : 'text-slate-600'}>
                          <span className="font-medium">License:</span> {mfr.license}
                        </div>
                        <div className={`font-mono ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          <span className="font-medium">Wallet:</span> {mfr.wallet?.slice(0, 10)}...{mfr.wallet?.slice(-8)}
                        </div>
                        <div className={darkMode ? 'text-slate-300' : 'text-slate-600'}>
                          <span className="font-medium">Email:</span> {mfr.email}
                        </div>
                      </div>
                    </div>
                    <Link to="/manufacturer/verify">
                      <button className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                        darkMode
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700'
                          : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700'
                      }`}>
                        Verify Now
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {unverifiedManufacturers.length > 3 && (
              <div className="text-center mt-6">
                <Link to="/manufacturer/list?status=unverified">
                  <button className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
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
        <div className="mb-12">
          <h2 className={`text-2xl font-bold mb-6 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            System Statistics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={`p-8 rounded-2xl border shadow-lg hover:scale-105 transition-all duration-300 ${
              darkMode
                ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border-emerald-500/30'
                : 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <Database className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className={`text-sm font-medium mb-2 ${
                darkMode ? 'text-emerald-400' : 'text-emerald-600'
              }`}>
                Total Batches
              </h3>
              <p className={`text-3xl font-bold ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                {stats.totalBatches || 0}
              </p>
            </div>

            <div className={`p-8 rounded-2xl border shadow-lg hover:scale-105 transition-all duration-300 ${
              darkMode
                ? 'bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/30'
                : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <Users className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className={`text-sm font-medium mb-2 ${
                darkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>
                Total Manufacturers
              </h3>
              <p className={`text-3xl font-bold ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                {stats.totalManufacturers || 0}
              </p>
              {unverifiedManufacturers.length > 0 && (
                <p className="text-sm text-amber-500 font-medium mt-2">
                  ({unverifiedManufacturers.length} pending)
                </p>
              )}
            </div>

            <div className={`p-8 rounded-2xl border shadow-lg hover:scale-105 transition-all duration-300 ${
              darkMode
                ? 'bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/30'
                : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className={`text-sm font-medium mb-2 ${
                darkMode ? 'text-red-400' : 'text-red-600'
              }`}>
                Recalled Batches
              </h3>
              <p className={`text-3xl font-bold ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                {stats.totalRecalledBatches || 0}
              </p>
            </div>

            <div className={`p-8 rounded-2xl border shadow-lg hover:scale-105 transition-all duration-300 ${
              darkMode
                ? 'bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-amber-500/30'
                : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-10 h-10 text-amber-500" />
              </div>
              <h3 className={`text-sm font-medium mb-2 ${
                darkMode ? 'text-amber-400' : 'text-amber-600'
              }`}>
                Expired Scans
              </h3>
              <p className={`text-3xl font-bold ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                {stats.totalExpiredScans || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Expired Medicine Reports */}
        <div className="mb-12">
          <h2 className={`text-2xl font-bold mb-6 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Recent Expired Medicine Reports
          </h2>
          {reports.length === 0 ? (
            <div className={`p-12 text-center rounded-2xl border-2 border-dashed ${
              darkMode
                ? 'border-slate-600 bg-slate-800/30'
                : 'border-slate-300 bg-slate-50'
            }`}>
              <CheckCircle2 className={`w-16 h-16 mx-auto mb-4 ${
                darkMode ? 'text-emerald-400' : 'text-emerald-500'
              }`} />
              <p className={`text-lg ${
                darkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                No expired medicine reports found
              </p>
            </div>
          ) : (
            <div>
              <p className={`mb-6 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Showing latest {Math.min(5, reports.length)} expired reports
              </p>
              <div className="grid gap-4">
                {reports.slice(0, 5).map((report, i) => (
                  <div key={i} className={`p-6 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                    darkMode
                      ? 'bg-slate-800/60 border-slate-700 hover:border-amber-500/50'
                      : 'bg-white border-slate-200 hover:border-amber-300'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <AlertTriangle className="w-6 h-6 text-amber-500" />
                        <div>
                          <Link to={`/batch/${report.batchId}`} className={`text-lg font-semibold hover:underline ${
                            darkMode ? 'text-white hover:text-emerald-400' : 'text-slate-900 hover:text-emerald-600'
                          }`}>
                            {report.batchId}
                          </Link>
                          <p className={`text-sm ${
                            darkMode ? 'text-slate-400' : 'text-slate-600'
                          }`}>
                            {report.medicineName}
                          </p>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
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
                <div className="text-center mt-6">
                  <Link to="/reports/expired">
                    <button className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
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
        <div className={`p-8 rounded-2xl border ${
          darkMode
            ? 'bg-slate-800/60 border-slate-700'
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3 mb-6">
            <Globe className={`w-6 h-6 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
            <h3 className={`text-xl font-bold ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Network Information
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className={`text-sm font-medium mb-2 ${
                darkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Network
              </p>
              <p className={`font-semibold ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                {stats.network || 'Unknown'}
              </p>
            </div>
            <div>
              <p className={`text-sm font-medium mb-2 ${
                darkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Chain ID
              </p>
              <p className={`font-semibold ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                {stats.chainId || 'Unknown'}
              </p>
            </div>
            <div>
              <p className={`text-sm font-medium mb-2 ${
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
