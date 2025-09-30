import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getExpiredReports } from '../api/verify';
import { useTheme } from '../contexts/ThemeContext';
import {
  AlertTriangle,
  Package,
  Factory,
  Calendar,
  TrendingUp,
  Eye,
  Shield,
  Activity,
  BarChart3,
  Clock,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  FileText,
  Zap,
} from 'lucide-react';

export default function ExpiredReports() {
  const { darkMode } = useTheme();
  const [expandedCard, setExpandedCard] = useState(null);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['expired-reports'],
    queryFn: getExpiredReports,
  });

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
                  darkMode ? 'border-slate-600 border-t-amber-400' : 'border-slate-300 border-t-amber-500'
                }`}></div>
                <div className={`absolute inset-0 w-20 h-20 border-4 rounded-full animate-ping ${
                  darkMode ? 'border-amber-400/20' : 'border-amber-500/20'
                }`}></div>
              </div>
              <h3 className={`text-3xl font-bold mb-4 ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Loading Expired Reports
              </h3>
              <p className={`text-xl ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Analyzing expired medicine scan data...
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
              Error Loading Reports
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

  const reports = data?.data?.reports || [];
  const summary = data?.data?.summary || {};

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${
      darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
    }`}>
      {/* Floating Geometric Shapes Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-16 h-16 bg-amber-500/5 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-8 h-8 bg-red-500/10 rotate-45 animate-spin" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-32 left-20 w-12 h-12 bg-orange-500/5 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 right-10 w-6 h-6 bg-yellow-500/10 rotate-12 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-8">
        {/* Hero Header */}
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full mb-6 border ${
            darkMode 
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
              : 'bg-amber-50 text-amber-600 border-amber-200'
          }`}>
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Expired Medicine Reports</span>
          </div>
          
          <h1 className={`text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent`}>
            Expired Reports
          </h1>
          
          <p className={`text-xl max-w-2xl mx-auto ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Monitor and analyze expired medicine scan incidents across the network
          </p>
        </div>

        {/* Summary Dashboard */}
        <div className={`p-10 rounded-3xl border-2 mb-12 ${
          darkMode
            ? 'bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-amber-500/30 backdrop-blur-sm'
            : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200'
        }`}>
          <div className="flex items-center gap-4 mb-8">
            <BarChart3 className="w-10 h-10 text-amber-500" />
            <h2 className={`text-3xl font-bold ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Summary Dashboard
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`p-8 rounded-3xl border transition-all duration-300 hover:scale-105 ${
              darkMode
                ? 'bg-slate-800/60 border-slate-700'
                : 'bg-white border-slate-200 shadow-lg hover:shadow-xl'
            }`}>
              <div className="flex items-center gap-4 mb-4">
                <FileText className="w-8 h-8 text-blue-500" />
                <span className={`text-sm font-bold ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Total Reports
                </span>
              </div>
              <p className={`text-4xl font-bold ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                {data?.data?.totalReports || 0}
              </p>
            </div>

            <div className={`p-8 rounded-3xl border transition-all duration-300 hover:scale-105 ${
              darkMode
                ? 'bg-slate-800/60 border-slate-700'
                : 'bg-white border-slate-200 shadow-lg hover:shadow-xl'
            }`}>
              <div className="flex items-center gap-4 mb-4">
                <TrendingUp className="w-8 h-8 text-red-500" />
                <span className={`text-sm font-bold ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Total Expired Scans
                </span>
              </div>
              <p className={`text-4xl font-bold ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                {summary.totalExpiredScans || 0}
              </p>
            </div>

            {summary.mostScannedBatch ? (
              <div className={`p-8 rounded-3xl border-2 transition-all duration-300 hover:scale-105 ${
                darkMode
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-4 mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                  <span className={`text-sm font-bold ${
                    darkMode ? 'text-red-400' : 'text-red-600'
                  }`}>
                    Most Scanned Batch
                  </span>
                </div>
                <Link 
                  to={`/app/batch/${summary.mostScannedBatch.batchId}`}
                  className={`block text-lg font-bold font-mono hover:underline ${
                    darkMode ? 'text-white hover:text-red-400' : 'text-slate-900 hover:text-red-600'
                  }`}
                >
                  {summary.mostScannedBatch.batchId}
                </Link>
                <p className="text-2xl font-bold text-red-500 mt-2">
                  {summary.mostScannedBatch.expiredScanCount} scans
                </p>
              </div>
            ) : (
              <div className={`p-8 rounded-3xl border transition-all duration-300 ${
                darkMode
                  ? 'bg-slate-800/60 border-slate-700'
                  : 'bg-white border-slate-200 shadow-lg'
              }`}>
                <div className="flex items-center gap-4 mb-4">
                  <Shield className="w-8 h-8 text-emerald-500" />
                  <span className={`text-sm font-bold ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Status
                  </span>
                </div>
                <p className={`text-lg font-bold text-emerald-500`}>
                  No Critical Cases
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Reports List */}
        <div className="mb-12">
          <h2 className={`text-3xl font-bold mb-8 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Detailed Reports
          </h2>
          
          {reports.length === 0 ? (
            <div className={`p-16 text-center rounded-3xl border-2 border-dashed ${
              darkMode
                ? 'border-slate-600 bg-slate-800/30'
                : 'border-slate-300 bg-slate-50'
            }`}>
              <Shield className={`w-20 h-20 mx-auto mb-6 ${
                darkMode ? 'text-emerald-400' : 'text-emerald-500'
              }`} />
              <h3 className={`text-2xl font-bold mb-4 ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                No Expired Medicine Reports Found
              </h3>
              <p className={`text-lg ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Great news! All medicines are being scanned within their validity period.
              </p>
            </div>
          ) : (
            <div className="grid gap-8">
              {reports.map((report, i) => (
                <div 
                  key={i} 
                  className={`p-8 rounded-3xl border-2 transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                    darkMode
                      ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50 backdrop-blur-sm'
                      : 'bg-amber-50 border-amber-200 hover:border-amber-300 shadow-lg hover:shadow-xl'
                  }`}
                  onClick={() => setExpandedCard(expandedCard === i ? null : i)}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <AlertTriangle className="w-8 h-8 text-amber-500" />
                        <div>
                          <Link 
                            to={`/app/batch/${report.batchId}`}
                            className={`text-2xl font-bold hover:underline ${
                              darkMode ? 'text-white hover:text-amber-400' : 'text-slate-900 hover:text-amber-600'
                            }`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {report.batchId}
                          </Link>
                          <p className={`text-lg font-semibold ${
                            darkMode ? 'text-slate-300' : 'text-slate-600'
                          }`}>
                            {report.medicineName}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className={`p-6 rounded-2xl ${
                          darkMode ? 'bg-slate-700/60' : 'bg-white'
                        }`}>
                          <div className="flex items-center gap-3 mb-3">
                            <Factory className={`w-5 h-5 ${
                              darkMode ? 'text-slate-400' : 'text-slate-500'
                            }`} />
                            <span className={`text-sm font-bold ${
                              darkMode ? 'text-slate-400' : 'text-slate-500'
                            }`}>
                              Manufacturer
                            </span>
                          </div>
                          <p className={`font-mono text-lg font-bold ${
                            darkMode ? 'text-white' : 'text-slate-900'
                          }`}>
                            {report.manufacturer?.slice(0, 5)}...{report.manufacturer?.slice(-5)}
                          </p>
                        </div>

                        <div className={`p-6 rounded-2xl border-2 ${
                          darkMode
                            ? 'bg-red-500/20 border-red-500/30'
                            : 'bg-red-50 border-red-200'
                        }`}>
                          <div className="flex items-center gap-3 mb-3">
                            <TrendingUp className="w-5 h-5 text-red-500" />
                            <span className="text-sm font-bold text-red-500">
                              Expired Scans
                            </span>
                          </div>
                          <p className="text-3xl font-bold text-red-500">
                            {report.expiredScanCount}
                          </p>
                        </div>

                        {report.lastScannedAtFormatted && (
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
                                Last Scanned
                              </span>
                            </div>
                            <p className={`text-lg font-bold ${
                              darkMode ? 'text-white' : 'text-slate-900'
                            }`}>
                              {report.lastScannedAtFormatted}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link 
                        to={`/app/batch/${report.batchId}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-3 ${
                          darkMode
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/25'
                            : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/25'
                        }`}>
                          <Eye className="w-5 h-5" />
                          View Details
                        </button>
                      </Link>
                      
                      <div className="flex items-center gap-2">
                        <ChevronRight className={`w-6 h-6 transition-transform ${
                          expandedCard === i ? 'rotate-90' : ''
                        } ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                        <span className={`text-sm font-medium ${
                          darkMode ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          {expandedCard === i ? 'Less' : 'More'} Info
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Content */}
                  {expandedCard === i && (
                    <div className={`mt-8 pt-8 border-t ${
                      darkMode ? 'border-amber-500/30' : 'border-amber-200'
                    }`}>
                      <div className={`p-8 rounded-2xl ${
                        darkMode ? 'bg-slate-700/60' : 'bg-white'
                      }`}>
                        <h4 className={`text-xl font-bold mb-6 ${
                          darkMode ? 'text-white' : 'text-slate-900'
                        }`}>
                          Additional Information
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <p className={`text-sm font-bold mb-2 ${
                              darkMode ? 'text-slate-400' : 'text-slate-500'
                            }`}>
                              Risk Level
                            </p>
                            <div className={`inline-flex px-4 py-2 rounded-full text-sm font-bold ${
                              report.expiredScanCount > 10
                                ? 'bg-red-500/20 text-red-500'
                                : report.expiredScanCount > 5
                                  ? 'bg-amber-500/20 text-amber-500'
                                  : 'bg-yellow-500/20 text-yellow-600'
                            }`}>
                              {report.expiredScanCount > 10 ? 'High Risk' : 
                               report.expiredScanCount > 5 ? 'Medium Risk' : 'Low Risk'}
                            </div>
                          </div>
                          
                          <div>
                            <p className={`text-sm font-bold mb-2 ${
                              darkMode ? 'text-slate-400' : 'text-slate-500'
                            }`}>
                              Batch Status
                            </p>
                            <p className={`text-lg font-bold ${
                              darkMode ? 'text-white' : 'text-slate-900'
                            }`}>
                              Expired & Active
                            </p>
                          </div>
                        </div>
                        
                        <div className={`mt-6 p-6 rounded-2xl border ${
                          darkMode
                            ? 'bg-amber-500/10 border-amber-500/30'
                            : 'bg-amber-50 border-amber-200'
                        }`}>
                          <div className="flex items-start gap-3">
                            <Zap className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
                            <div>
                              <p className={`font-bold text-amber-500 mb-2`}>
                                Recommended Action
                              </p>
                              <p className={`text-sm ${
                                darkMode ? 'text-slate-300' : 'text-slate-600'
                              }`}>
                                This batch has been scanned after expiry {report.expiredScanCount} time(s). 
                                Consider investigating the distribution chain and issuing alerts to prevent further expired usage.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
