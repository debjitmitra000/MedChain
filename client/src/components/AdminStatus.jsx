import React, { useState } from 'react';
import { useRole } from '../hooks/useRole';
import { useTheme } from '../contexts/ThemeContext';
import { Shield, Users, Settings, CheckCircle, AlertCircle, Copy, Eye, EyeOff } from 'lucide-react';

export default function AdminStatus() {
  const { darkMode } = useTheme();
  const { 
    isAdmin, 
    address, 
    adminAddress, 
    configuredAdmins, 
    totalAdmins,
    isConnected 
  } = useRole();
  
  const [showAddresses, setShowAddresses] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(null);

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(type);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const truncateAddress = (addr) => {
    if (!addr) return 'N/A';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className={`p-6 rounded-2xl border ${
      darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-3">
          <Shield className="w-6 h-6 text-blue-500" />
          Admin Configuration
        </h3>
        
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            isAdmin 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
          }`}>
            {isAdmin ? 'Admin Access' : 'Standard User'}
          </span>
          
          <button
            onClick={() => setShowAddresses(!showAddresses)}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
            }`}
          >
            {showAddresses ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Current User Status */}
        <div className={`p-4 rounded-xl ${
          isAdmin 
            ? (darkMode ? 'bg-green-500/20 border border-green-500/30' : 'bg-green-50 border border-green-200')
            : (darkMode ? 'bg-slate-700/60 border border-slate-600' : 'bg-slate-50 border border-slate-200')
        }`}>
          <div className="flex items-center gap-3 mb-3">
            {isAdmin ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-500" />
            )}
            <span className="font-semibold">Current User Status</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm opacity-75">Connected Address:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">
                  {isConnected ? truncateAddress(address) : 'Not Connected'}
                </span>
                {address && (
                  <button
                    onClick={() => copyToClipboard(address, 'current')}
                    className={`p-1 rounded hover:bg-black/10 ${
                      copiedAddress === 'current' ? 'text-green-500' : 'opacity-60'
                    }`}
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm opacity-75">Admin Status:</span>
              <span className={`text-sm font-medium ${
                isAdmin ? 'text-green-500' : 'text-amber-500'
              }`}>
                {isAdmin ? 'Admin Access Granted' : 'Standard User Access'}
              </span>
            </div>
          </div>
        </div>

        {/* Admin Configuration Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl border ${
            darkMode ? 'bg-slate-700/60 border-slate-600' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="font-medium">Environment Admins</span>
            </div>
            <div className="text-2xl font-bold text-blue-500">{configuredAdmins.length}</div>
            <div className="text-sm opacity-75">Configured in .env</div>
          </div>
          
          <div className={`p-4 rounded-xl border ${
            darkMode ? 'bg-slate-700/60 border-slate-600' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4 text-purple-500" />
              <span className="font-medium">Contract Admin</span>
            </div>
            <div className="text-sm font-mono">
              {adminAddress ? truncateAddress(adminAddress) : 'Loading...'}
            </div>
            <div className="text-sm opacity-75">From smart contract</div>
          </div>
        </div>

        {/* Admin Addresses List (Collapsible) */}
        {showAddresses && (
          <div className={`p-4 rounded-xl border ${
            darkMode ? 'bg-slate-700/60 border-slate-600' : 'bg-slate-50 border-slate-200'
          }`}>
            <h4 className="font-medium mb-3">Admin Addresses</h4>
            
            <div className="space-y-3">
              {/* Contract Admin */}
              {adminAddress && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div>
                    <div className="font-mono text-sm">{adminAddress}</div>
                    <div className="text-xs opacity-75">Contract Admin</div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(adminAddress, 'contract')}
                    className={`p-2 rounded hover:bg-black/10 ${
                      copiedAddress === 'contract' ? 'text-green-500' : 'opacity-60'
                    }`}
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Environment Admins */}
              {configuredAdmins.map((addr, index) => (
                <div key={addr} className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div>
                    <div className="font-mono text-sm">{addr}</div>
                    <div className="text-xs opacity-75">Environment Admin #{index + 1}</div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(addr, `env-${index}`)}
                    className={`p-2 rounded hover:bg-black/10 ${
                      copiedAddress === `env-${index}` ? 'text-green-500' : 'opacity-60'
                    }`}
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {configuredAdmins.length === 0 && !adminAddress && (
              <div className="text-center py-4 opacity-75">
                No admin addresses configured
              </div>
            )}
          </div>
        )}

        {/* Configuration Info */}
        <div className={`p-4 rounded-xl border ${
          darkMode ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="text-sm space-y-1">
            <p><strong>Total Admins:</strong> {totalAdmins}</p>
            <p><strong>Access Method:</strong> Environment Config + Smart Contract</p>
            <p className="opacity-75">
              Admin access is granted to addresses configured in VITE_ADMIN_ADDRESSES 
              or the contract admin address.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}