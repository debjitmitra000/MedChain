// components/SubgraphStatusIndicator.jsx
import React, { useState, useEffect } from 'react';
import { dataSyncService } from '../api/dataSync';
import { graphqlClient } from '../api/subgraph';
import { Activity, Database, Server, Wifi, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react';

export default function SubgraphStatusIndicator() {
  const [status, setStatus] = useState({
    subgraph: { healthy: false, loading: true },
    backend: { healthy: false, loading: true },
    sync: { pendingOperations: [], lastUpdate: null }
  });

  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    try {
      const [healthCheck, syncStatus, stats] = await Promise.all([
        dataSyncService.healthCheck(),
        dataSyncService.getSyncStatus(),
        graphqlClient.getStats()
      ]);

      setStatus({
        subgraph: {
          healthy: healthCheck.subgraph.healthy,
          loading: false,
          details: healthCheck.subgraph.details,
          stats
        },
        backend: {
          healthy: healthCheck.backend.healthy,
          loading: false,
          details: healthCheck.backend.details
        },
        sync: {
          ...syncStatus,
          lastUpdate: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Status check failed:', error);
      setStatus(prev => ({
        ...prev,
        subgraph: { ...prev.subgraph, healthy: false, loading: false },
        backend: { ...prev.backend, healthy: false, loading: false }
      }));
    }
  };

  const getStatusColor = (healthy, loading) => {
    if (loading) return 'text-yellow-500';
    return healthy ? 'text-green-500' : 'text-red-500';
  };

  const getStatusIcon = (healthy, loading) => {
    if (loading) return Activity;
    return healthy ? CheckCircle : AlertTriangle;
  };

  const StatusItem = ({ title, status, icon: Icon, details }) => (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
      <Icon className={`w-4 h-4 ${getStatusColor(status.healthy, status.loading)} ${status.loading ? 'animate-spin' : ''}`} />
      <div className="flex-1">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-slate-500">
          {status.loading ? 'Checking...' : (status.healthy ? 'Online' : 'Offline')}
        </div>
      </div>
      {details && (
        <div className="text-xs text-slate-400">
          {typeof details === 'object' ? JSON.stringify(details).slice(0, 50) + '...' : details}
        </div>
      )}
    </div>
  );

  return (
    <div className="relative">
      {/* Status Indicator */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      >
        <Database className="w-4 h-4" />
        <span className="text-sm font-medium">Subgraph</span>
        <div className="flex gap-1">
          <div className={`w-2 h-2 rounded-full ${status.subgraph.healthy ? 'bg-green-500' : 'bg-red-500'}`} />
          <div className={`w-2 h-2 rounded-full ${status.backend.healthy ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>
      </button>

      {/* Details Panel */}
      {showDetails && (
        <div className="absolute top-full right-0 mt-2 w-80 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Data Infrastructure Status</h3>
              <button
                onClick={checkStatus}
                className="text-xs text-blue-500 hover:text-blue-600"
              >
                Refresh
              </button>
            </div>

            <div className="space-y-2">
              <StatusItem
                title="The Graph Subgraph"
                status={status.subgraph}
                icon={getStatusIcon(status.subgraph.healthy, status.subgraph.loading)}
                details={status.subgraph.stats?.successRate}
              />
              
              <StatusItem
                title="Backend API"
                status={status.backend}
                icon={getStatusIcon(status.backend.healthy, status.backend.loading)}
                details={status.backend.details?.blockchain?.connected ? 'Blockchain Connected' : 'Blockchain Offline'}
              />
            </div>

            {/* Sync Status */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
              <div className="text-sm font-medium mb-2">Synchronization Status</div>
              {status.sync.pendingOperations.length > 0 ? (
                <div className="text-xs text-amber-600 dark:text-amber-400">
                  {status.sync.pendingOperations.length} operations syncing...
                </div>
              ) : (
                <div className="text-xs text-green-600 dark:text-green-400">
                  All operations synchronized
                </div>
              )}
            </div>

            {/* Performance Stats */}
            {status.subgraph.stats && (
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                <div className="text-sm font-medium mb-2">Performance</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-slate-500">Success Rate</div>
                    <div className="font-mono">{status.subgraph.stats.successRate}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Cache Hit Rate</div>
                    <div className="font-mono">{status.subgraph.stats.cacheHitRate}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Avg Response</div>
                    <div className="font-mono">{Math.round(status.subgraph.stats.averageTime)}ms</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Cache Size</div>
                    <div className="font-mono">{status.subgraph.stats.cacheSize} items</div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
              <div className="flex gap-2">
                <button
                  onClick={() => graphqlClient.clearCache()}
                  className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  Clear Cache
                </button>
                <button
                  onClick={() => window.open(import.meta.env.VITE_SUBGRAPH_URL, '_blank')}
                  className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                >
                  Open GraphQL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}