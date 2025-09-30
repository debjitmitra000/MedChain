import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getManufacturerList } from '../api/manufacturer';
import { useTheme } from '../contexts/ThemeContext';
import {
  Factory,
  Users,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Eye,
  Mail,
  Wallet,
  Award,
  AlertTriangle,
  User,
  Globe,
  ArrowRight,
} from 'lucide-react';

export default function ManufacturerList() {
  const { darkMode } = useTheme();
  const [filters, setFilters] = useState({ status: 'all', limit: 20, offset: 0 });
  const [expandedCard, setExpandedCard] = useState(null);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['manufacturer-list', filters],
    queryFn: () => getManufacturerList(filters),
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
                <div className={`w-16 h-16 border-4 rounded-full animate-spin ${
                  darkMode ? 'border-slate-600 border-t-blue-400' : 'border-slate-300 border-t-blue-500'
                }`}></div>
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Loading Manufacturers
              </h3>
              <p className={`text-lg ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Fetching manufacturer directory...
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
          <div className="text-center">
            <div className="mb-8">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
                darkMode ? 'bg-red-500/20' : 'bg-red-50'
              }`}>
                <AlertTriangle className="w-12 h-12 text-red-500" />
              </div>
            </div>
            
            <h3 className={`text-3xl font-bold mb-6 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Error Loading Manufacturers
            </h3>
            
            <div className={`p-8 rounded-3xl border-2 mb-8 ${
              darkMode 
                ? 'bg-red-500/10 border-red-500/30' 
                : 'bg-red-50 border-red-200'
            }`}>
              <p className={`text-lg ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                {error.message}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const manufacturers = data?.data?.manufacturers || [];
  const pagination = data?.data?.pagination || {};

  const getStatusInfo = (manufacturer) => {
    if (manufacturer.isVerified) {
      return {
        icon: CheckCircle2,
        text: 'Verified',
        color: 'emerald',
        bgColor: darkMode ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
      };
    }
    return {
      icon: Clock,
      text: 'Unverified',
      color: 'amber',
      bgColor: darkMode ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-200'
    };
  };

  const filterOptions = [
    { value: 'all', label: 'All Manufacturers' },
    { value: 'verified', label: 'Verified Only' },
    { value: 'unverified', label: 'Unverified Only' },
    { value: 'active', label: 'Active Only' },
    { value: 'inactive', label: 'Inactive Only' },
  ];

  const limitOptions = [
    { value: 10, label: '10 per page' },
    { value: 20, label: '20 per page' },
    { value: 50, label: '50 per page' },
  ];

  const currentPage = Math.floor(filters.offset / filters.limit) + 1;
  const totalPages = Math.ceil(pagination.total / filters.limit);

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
            <Factory className="w-5 h-5" />
            <span className="font-medium">Manufacturer Directory</span>
          </div>
          
          <h1 className={`text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent`}>
            Manufacturers
          </h1>
          
          <p className={`text-xl max-w-2xl mx-auto ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Browse verified and registered manufacturers in the MedChain network
          </p>
        </div>

        {/* Filters & Controls */}
        <div className={`p-8 rounded-3xl border mb-8 ${
          darkMode
            ? 'bg-slate-800/60 border-slate-700'
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`} />
                <select 
                  value={filters.status} 
                  onChange={(e) => setFilters(f => ({ ...f, status: e.target.value, offset: 0 }))}
                  className={`pl-12 pr-8 py-3 rounded-2xl font-medium transition-all duration-300 appearance-none ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                >
                  {filterOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`} />
              </div>
              
              <div className="relative">
                <Users className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`} />
                <select 
                  value={filters.limit} 
                  onChange={(e) => setFilters(f => ({ ...f, limit: Number(e.target.value), offset: 0 }))}
                  className={`pl-12 pr-8 py-3 rounded-2xl font-medium transition-all duration-300 appearance-none ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                >
                  {limitOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`} />
              </div>
            </div>
            
            <div className={`px-6 py-3 rounded-2xl border ${
              darkMode 
                ? 'bg-slate-700/60 border-slate-600 text-slate-300' 
                : 'bg-white border-slate-200 text-slate-600'
            }`}>
              Showing {manufacturers.length} of {pagination.total || 0} manufacturers
            </div>
          </div>
        </div>

        {/* Manufacturer Grid */}
        {manufacturers.length === 0 ? (
          <div className={`p-16 text-center rounded-3xl border-2 border-dashed ${
            darkMode
              ? 'border-slate-600 bg-slate-800/30'
              : 'border-slate-300 bg-slate-50'
          }`}>
            <Factory className={`w-20 h-20 mx-auto mb-6 ${
              darkMode ? 'text-slate-400' : 'text-slate-500'
            }`} />
            <h3 className={`text-2xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              No Manufacturers Found
            </h3>
            <p className={`text-lg ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Try adjusting your filters to see more results
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {manufacturers.map((mfr, i) => {
              const statusInfo = getStatusInfo(mfr);
              const StatusIcon = statusInfo.icon;
              const isExpanded = expandedCard === i;
              
              return (
                <div 
                  key={i} 
                  className={`p-8 rounded-3xl border transition-all duration-300 hover:scale-105 cursor-pointer ${
                    darkMode
                      ? 'bg-slate-800/60 border-slate-700 hover:border-blue-500/50'
                      : 'bg-white border-slate-200 hover:border-blue-300 shadow-lg hover:shadow-xl'
                  }`}
                  onClick={() => setExpandedCard(isExpanded ? null : i)}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Factory className={`w-6 h-6 ${
                          darkMode ? 'text-blue-400' : 'text-blue-600'
                        }`} />
                        <h3 className={`text-xl font-bold ${
                          darkMode ? 'text-white' : 'text-slate-900'
                        }`}>
                          {mfr.name}
                        </h3>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Wallet className={`w-4 h-4 ${
                            darkMode ? 'text-slate-400' : 'text-slate-500'
                          }`} />
                          <span className={`font-mono text-sm ${
                            darkMode ? 'text-slate-300' : 'text-slate-600'
                          }`}>
                            {mfr.wallet?.slice(0, 10)}...{mfr.wallet?.slice(-8)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Award className={`w-4 h-4 ${
                            darkMode ? 'text-slate-400' : 'text-slate-500'
                          }`} />
                          <span className={`text-sm ${
                            darkMode ? 'text-slate-300' : 'text-slate-600'
                          }`}>
                            License: {mfr.license}
                          </span>
                        </div>
                        
                        {mfr.email && (
                          <div className="flex items-center gap-3">
                            <Mail className={`w-4 h-4 ${
                              darkMode ? 'text-slate-400' : 'text-slate-500'
                            }`} />
                            <span className={`text-sm ${
                              darkMode ? 'text-slate-300' : 'text-slate-600'
                            }`}>
                              {mfr.email}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-4">
                      <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${statusInfo.bgColor}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span className="text-sm font-semibold">{statusInfo.text}</span>
                      </div>
                      
                      <Link 
                        to={`/app/manufacturer/${mfr.wallet}`}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 ${
                          darkMode
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.total > filters.limit && (
          <div className={`p-8 rounded-3xl border ${
            darkMode
              ? 'bg-slate-800/60 border-slate-700'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className={`text-lg font-semibold ${
                darkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Page {currentPage} of {totalPages}
              </div>
              
              <div className="flex items-center gap-4">
                <button 
                  disabled={filters.offset === 0}
                  onClick={() => setFilters(f => ({ ...f, offset: Math.max(0, f.offset - f.limit) }))}
                  className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                    filters.offset === 0
                      ? (darkMode 
                          ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed')
                      : (darkMode
                          ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:scale-105'
                          : 'bg-white text-slate-600 hover:bg-slate-50 hover:scale-105 shadow-lg')
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                
                <button 
                  disabled={!pagination.hasMore}
                  onClick={() => setFilters(f => ({ ...f, offset: f.offset + f.limit }))}
                  className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                    !pagination.hasMore
                      ? (darkMode 
                          ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed')
                      : (darkMode
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-105'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-105')
                  }`}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
