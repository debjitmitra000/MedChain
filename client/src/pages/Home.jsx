import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getGlobalStats } from '../api/verify';
import { useRole } from '../hooks/useRole';
import { useTheme } from '../contexts/ThemeContext'; // Add this import
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
  ExternalLink,
  ArrowRight,
  AlertCircle,
  Database,
  Wifi,
  WifiOff,
  Settings,
  Package,
  UserPlus,
  Search,
  Factory,
  Eye,
  Plus,
  Wallet,
  Home as HomeIcon,
  Bell,
  ChevronRight,
} from 'lucide-react';

export default function Home() {
  const { darkMode } = useTheme(); // Use shared theme context
  const [expandedCard, setExpandedCard] = useState(null);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['stats'],
    queryFn: getGlobalStats,
    retry: false,
    staleTime: 30000,
  });

  const { 
    role, 
    isAdmin, 
    isManufacturer, 
    isUser, 
    isConnected, 
    manufacturer,
    canRegisterBatch,
    canRegisterAsManufacturer
  } = useRole();

  const stats = data?.stats || {};
  const isBackendUnavailable = error && error.message?.includes('ECONNREFUSED');

  if (isLoading) {
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
              Loading system dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Role-based welcome messages and colors
  const getRoleInfo = () => {
    if (isAdmin) {
      return {
        title: 'Admin Control Center',
        subtitle: 'Complete system oversight and management',
        color: 'from-purple-500 to-purple-600',
        icon: Shield,
        badge: 'Admin',
        badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      };
    }
    if (isManufacturer) {
      return {
        title: 'Manufacturer Dashboard',
        subtitle: manufacturer?.isVerified 
          ? 'Manage your medicine batches and production'
          : 'Complete verification to start registering batches',
        color: 'from-blue-500 to-blue-600',
        icon: Factory,
        badge: manufacturer?.isVerified ? 'Verified Manufacturer' : 'Pending Verification',
        badgeColor: manufacturer?.isVerified 
          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      };
    }
    return {
      title: 'Medicine Verification System',
      subtitle: 'Verify medicines and explore the healthcare ecosystem',
      color: 'from-emerald-500 to-emerald-600',
      icon: HomeIcon,
      badge: isConnected ? 'Connected User' : 'Guest User',
      badgeColor: isConnected
        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    };
  };

  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.icon;

  const renderQuickActions = () => {
    const actions = [];
    
    if (isAdmin) {
      actions.push(
        { to: '/admin', icon: Settings, title: 'Admin Dashboard', desc: 'Full system management', color: 'purple' },
        { to: '/manufacturer/verify', icon: CheckCircle2, title: 'Verify Manufacturers', desc: 'Review pending applications', color: 'emerald' },
        { to: '/manufacturer/list?status=unverified', icon: Clock, title: 'Pending Approvals', desc: 'Manufacturers awaiting verification', color: 'amber' },
        { to: '/reports/expired', icon: BarChart3, title: 'System Reports', desc: 'View expired medicine reports', color: 'red' }
      );
    } else if (isManufacturer) {
      actions.push(
        { to: '/manufacturer/me', icon: Users, title: 'My Profile', desc: 'Manage manufacturer details', color: 'blue' },
        { to: '/manufacturer/me/batches', icon: Package, title: 'My Batches', desc: 'View registered medicine batches', color: 'cyan' }
      );
      
      if (canRegisterBatch) {
        actions.push(
          { to: '/batch/register', icon: Plus, title: 'Register Batch', desc: 'Add new medicine batch', color: 'emerald' }
        );
      }
    } else {
      actions.push(
        { to: '/verify', icon: Search, title: 'Verify Medicine', desc: 'Scan and verify medicine authenticity', color: 'emerald' },
        { to: '/manufacturer/list', icon: Factory, title: 'Manufacturers', desc: 'Browse registered manufacturers', color: 'blue' },
        { to: '/reports/expired', icon: BarChart3, title: 'Safety Reports', desc: 'View expired medicine alerts', color: 'amber' }
      );
      
      if (canRegisterAsManufacturer && isConnected) {
        actions.push(
          { to: '/manufacturer/register', icon: UserPlus, title: 'Register as Manufacturer', desc: 'Join the manufacturer network', color: 'indigo' }
        );
      }
    }
    
    return actions;
  };

  const getColorClasses = (color) => {
    const colors = {
      purple: 'from-purple-500/10 to-purple-600/10 border-purple-500/30 hover:border-purple-500/50',
      emerald: 'from-emerald-500/10 to-emerald-600/10 border-emerald-500/30 hover:border-emerald-500/50',
      amber: 'from-amber-500/10 to-amber-600/10 border-amber-500/30 hover:border-amber-500/50',
      red: 'from-red-500/10 to-red-600/10 border-red-500/30 hover:border-red-500/50',
      blue: 'from-blue-500/10 to-blue-600/10 border-blue-500/30 hover:border-blue-500/50',
      cyan: 'from-cyan-500/10 to-cyan-600/10 border-cyan-500/30 hover:border-cyan-500/50',
      indigo: 'from-indigo-500/10 to-indigo-600/10 border-indigo-500/30 hover:border-indigo-500/50',
    };
    return colors[color] || colors.emerald;
  };

  const getIconColor = (color) => {
    const colors = {
      purple: 'text-purple-500',
      emerald: 'text-emerald-500',
      amber: 'text-amber-500',
      red: 'text-red-500',
      blue: 'text-blue-500',
      cyan: 'text-cyan-500',
      indigo: 'text-indigo-500',
    };
    return colors[color] || colors.emerald;
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${
      darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
    }`}>
      {/* Floating Geometric Shapes Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-16 h-16 bg-emerald-500/5 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-8 h-8 bg-blue-500/10 rotate-45 animate-spin" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-32 left-20 w-12 h-12 bg-purple-500/5 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 right-10 w-6 h-6 bg-amber-500/10 rotate-12 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-8">
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

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full mb-6 border ${
            darkMode 
              ? roleInfo.badgeColor
              : roleInfo.badgeColor
          }`}>
            <RoleIcon className="w-5 h-5" />
            <span className="font-medium">{roleInfo.badge}</span>
          </div>
          
          <h1 className={`text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r ${roleInfo.color} bg-clip-text text-transparent`}>
            {roleInfo.title}
          </h1>
          
          <p className={`text-xl max-w-2xl mx-auto ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            {roleInfo.subtitle}
          </p>

          {/* Welcome Message for Connected Users */}
          {isConnected && (
            <div className={`mt-8 p-6 rounded-2xl border ${
              darkMode
                ? 'bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border-emerald-500/30'
                : 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200'
            }`}>
              <div className="flex items-center justify-center gap-3 mb-3">
                <Wallet className="w-5 h-5 text-emerald-500" />
                <span className={`font-semibold ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Welcome back, {role === 'admin' ? 'Admin' : role === 'manufacturer' ? manufacturer?.name || 'Manufacturer' : 'User'}!
                </span>
              </div>
              <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {role === 'admin' && 'You have complete system access and can manage all aspects of MedChain.'}
                {role === 'manufacturer' && manufacturer?.isVerified && 'Your manufacturer account is verified and active. You can register new batches.'}
                {role === 'manufacturer' && !manufacturer?.isVerified && 'Your manufacturer account is pending admin verification.'}
                {role === 'user' && 'You can verify medicines and apply to become a manufacturer.'}
              </p>
            </div>
          )}

          {/* Connection Prompt for Guests */}
          {!isConnected && (
            <div className={`mt-8 p-6 rounded-2xl border ${
              darkMode
                ? 'bg-slate-800/60 border-slate-700'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <Bell className={`w-8 h-8 mx-auto mb-3 ${
                darkMode ? 'text-amber-400' : 'text-amber-500'
              }`} />
              <p className={`font-medium mb-2 ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Connect Your Wallet
              </p>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Connect your wallet to access manufacturer features and personalized dashboard
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-16">
          <h2 className={`text-3xl font-bold mb-8 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {renderQuickActions().map((action, index) => (
              <Link key={index} to={action.to} className="group">
                <div className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                  darkMode
                    ? `bg-gradient-to-br ${getColorClasses(action.color)}`
                    : `bg-gradient-to-br ${getColorClasses(action.color)}`
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <action.icon className={`w-8 h-8 ${getIconColor(action.color)}`} />
                    <ArrowRight className={`w-5 h-5 ${getIconColor(action.color)} group-hover:translate-x-1 transition-transform`} />
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {action.title}
                  </h3>
                  <p className={`text-sm ${
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {action.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Manufacturer Status Alert */}
        {isManufacturer && !manufacturer?.isVerified && (
          <div className={`mb-16 p-8 rounded-2xl border-2 ${
            darkMode
              ? 'bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-amber-500/30 backdrop-blur-sm'
              : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200'
          }`}>
            <div className="flex items-start gap-4">
              <Clock className="w-8 h-8 text-amber-500 flex-shrink-0" />
              <div>
                <h3 className={`text-2xl font-bold mb-2 ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Verification Pending
                </h3>
                <p className={`mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Your manufacturer application is under review by our admin team. You'll be able to register medicine batches once verified.
                </p>
                <div className="flex gap-3">
                  <Link to="/manufacturer/me">
                    <button className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                      darkMode
                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-300'
                    }`}>
                      View Profile
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Statistics */}
        <div className="mb-16">
          <h2 className={`text-3xl font-bold mb-8 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            System Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Database, title: 'Total Batches', value: stats.totalBatches || 0, color: 'emerald', desc: 'Registered medicine batches' },
              { icon: Factory, title: 'Manufacturers', value: stats.totalManufacturers || 0, color: 'blue', desc: 'Verified manufacturers' },
              { icon: AlertTriangle, title: 'Expired Scans', value: stats.totalExpiredScans || 0, color: 'amber', desc: 'Medicines past expiry' },
              { icon: AlertCircle, title: 'Recalled Batches', value: stats.totalRecalledBatches || 0, color: 'red', desc: 'Safety recalls issued' }
            ].map((stat, index) => (
              <div
                key={index}
                className={`p-8 rounded-2xl border shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer ${
                  darkMode
                    ? `bg-gradient-to-br ${getColorClasses(stat.color)}`
                    : `bg-gradient-to-br ${getColorClasses(stat.color)}`
                }`}
                onMouseEnter={() => setExpandedCard(index)}
                onMouseLeave={() => setExpandedCard(null)}
              >
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className={`w-10 h-10 ${getIconColor(stat.color)}`} />
                  <ChevronRight className={`w-5 h-5 transition-transform ${
                    expandedCard === index ? 'rotate-90' : ''
                  } ${getIconColor(stat.color)}`} />
                </div>
                <h3 className={`text-sm font-medium mb-2 ${
                  darkMode ? `${stat.color === 'emerald' ? 'text-emerald-400' : stat.color === 'blue' ? 'text-blue-400' : stat.color === 'amber' ? 'text-amber-400' : 'text-red-400'}` 
                  : `${stat.color === 'emerald' ? 'text-emerald-600' : stat.color === 'blue' ? 'text-blue-600' : stat.color === 'amber' ? 'text-amber-600' : 'text-red-600'}`
                }`}>
                  {stat.title}
                </h3>
                <p className={`text-3xl font-bold mb-2 ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  {stat.value.toLocaleString()}
                </p>
                <p className={`text-xs transition-all duration-300 ${
                  expandedCard === index ? 'opacity-100' : 'opacity-60'
                } ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {stat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Common Actions Section */}
        <div className="mb-16">
          <h2 className={`text-3xl font-bold mb-8 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Essential Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { to: '/verify', icon: Search, title: 'Verify Medicine', desc: 'Scan QR codes to verify authenticity', color: 'emerald' },
              { to: '/manufacturer/list', icon: Factory, title: 'Browse Manufacturers', desc: 'Explore verified manufacturers', color: 'blue' },
              { to: '/reports/expired', icon: BarChart3, title: 'Safety Reports', desc: 'View expired medicine alerts', color: 'amber' }
            ].map((action, index) => (
              <Link key={index} to={action.to} className="group">
                <div className={`p-8 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                  darkMode
                    ? `bg-gradient-to-br ${getColorClasses(action.color)}`
                    : `bg-gradient-to-br ${getColorClasses(action.color)}`
                }`}>
                  <div className="flex items-center justify-between mb-6">
                    <action.icon className={`w-10 h-10 ${getIconColor(action.color)}`} />
                    <ArrowRight className={`w-5 h-5 ${getIconColor(action.color)} group-hover:translate-x-1 transition-transform`} />
                  </div>
                  <h3 className={`text-xl font-semibold mb-3 ${
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

        {/* System Technical Details - Collapsible */}
        <div className={`rounded-2xl border transition-all duration-500 ${
          darkMode
            ? 'bg-slate-800/60 border-slate-700'
            : 'bg-slate-50 border-slate-200'
        }`}>
          <details className="group">
            <summary className={`cursor-pointer p-6 flex items-center justify-between hover:${
              darkMode ? 'bg-slate-700/60' : 'bg-slate-100'
            } rounded-2xl transition-colors`}>
              <div className="flex items-center gap-3">
                <Server className={`w-6 h-6 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                <h3 className={`text-lg font-semibold ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  System Technical Details
                </h3>
              </div>
              <ChevronRight className={`w-5 h-5 transition-transform group-open:rotate-90 ${
                darkMode ? 'text-slate-400' : 'text-slate-600'
              }`} />
            </summary>
            <div className="p-6 pt-0">
              <div className={`p-4 rounded-xl font-mono text-sm overflow-auto ${
                darkMode ? 'bg-slate-900/60 text-slate-300' : 'bg-white text-slate-700'
              }`}>
                <pre>{JSON.stringify(stats, null, 2)}</pre>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
