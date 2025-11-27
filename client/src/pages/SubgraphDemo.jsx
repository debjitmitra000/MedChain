// pages/SubgraphDemo.jsx
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { subgraphTests } from '../utils/subgraphTest';
import { getManufacturerList } from '../api/manufacturer';
import { getAllBatches } from '../api/batch';
import { getDashboardAnalytics } from '../api/verify';
import { Database, Play, CheckCircle, AlertCircle, Clock, BarChart3 } from 'lucide-react';

export default function SubgraphDemo() {
  const [testResults, setTestResults] = useState(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Query data from The Graph subgraph
  const { data: manufacturers, isLoading: loadingManufacturers, error: manufacturersError } = useQuery({
    queryKey: ['subgraph-manufacturers'],
    queryFn: () => getManufacturerList({ limit: 10 }),
    staleTime: 60000 // 1 minute
  });

  const { data: batches, isLoading: loadingBatches, error: batchesError } = useQuery({
    queryKey: ['subgraph-batches'],
    queryFn: () => getAllBatches({ limit: 10 }),
    staleTime: 60000
  });

  const { data: analytics, isLoading: loadingAnalytics, error: analyticsError } = useQuery({
    queryKey: ['subgraph-analytics'],
    queryFn: () => getDashboardAnalytics(),
    staleTime: 60000
  });

  const runTests = async () => {
    setIsRunningTests(true);
    try {
      const results = await subgraphTests.runAllTests();
      setTestResults(results);
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'fail': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warn': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          The Graph Subgraph Integration Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Testing data integration between backend API and The Graph subgraph
        </p>
        <div className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          Endpoint: {import.meta.env.VITE_SUBGRAPH_URL}
        </div>
      </div>

      {/* Test Runner */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Database className="w-5 h-5" />
            Integration Test Suite
          </h2>
          <button
            onClick={runTests}
            disabled={isRunningTests}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className={`w-4 h-4 ${isRunningTests ? 'animate-spin' : ''}`} />
            {isRunningTests ? 'Running Tests...' : 'Run Tests'}
          </button>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{testResults.summary.passed}</div>
                <div className="text-sm text-green-600">Passed</div>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{testResults.summary.failed}</div>
                <div className="text-sm text-red-600">Failed</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{testResults.summary.warned}</div>
                <div className="text-sm text-yellow-600">Warnings</div>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{testResults.summary.duration}ms</div>
                <div className="text-sm text-blue-600">Duration</div>
              </div>
            </div>

            {/* Individual Test Results */}
            <div className="space-y-2">
              <h3 className="font-semibold">Test Results:</h3>
              {testResults.results.map((result, index) => (
                <div key={index} className="flex items-center gap-3 p-2 border rounded-lg dark:border-gray-700">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="font-medium">{result.test}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{result.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Live Data Examples */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Manufacturers */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Latest Manufacturers</h3>
          {loadingManufacturers ? (
            <div className="text-center py-4">Loading...</div>
          ) : manufacturersError ? (
            <div className="text-red-500 text-sm">Error: {manufacturersError.message}</div>
          ) : (
            <div className="space-y-2">
              {manufacturers?.manufacturers?.slice(0, 5).map((manufacturer) => (
                <div key={manufacturer.address} className="flex items-center gap-2 p-2 border rounded dark:border-gray-700">
                  <div className={`w-2 h-2 rounded-full ${manufacturer.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{manufacturer.name}</div>
                    <div className="text-xs text-gray-500 truncate">{manufacturer.address}</div>
                  </div>
                </div>
              )) || <div className="text-gray-500">No manufacturers found</div>}
            </div>
          )}
        </div>

        {/* Batches */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Latest Batches</h3>
          {loadingBatches ? (
            <div className="text-center py-4">Loading...</div>
          ) : batchesError ? (
            <div className="text-red-500 text-sm">Error: {batchesError.message}</div>
          ) : (
            <div className="space-y-2">
              {batches?.batches?.slice(0, 5).map((batch) => (
                <div key={batch.batchId} className="p-2 border rounded dark:border-gray-700">
                  <div className="text-sm font-medium">{batch.medicineName}</div>
                  <div className="text-xs text-gray-500">{batch.batchId}</div>
                  <div className="text-xs text-gray-400">
                    {batch.manufacturer?.name} • {batch.isRecalled ? 'Recalled' : 'Active'}
                  </div>
                </div>
              )) || <div className="text-gray-500">No batches found</div>}
            </div>
          )}
        </div>

        {/* Analytics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Analytics
          </h3>
          {loadingAnalytics ? (
            <div className="text-center py-4">Loading...</div>
          ) : analyticsError ? (
            <div className="text-red-500 text-sm">Error: {analyticsError.message}</div>
          ) : analytics?.analytics ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Manufacturers:</span>
                <span className="font-medium">{analytics.analytics.overview?.totalManufacturers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Batches:</span>
                <span className="font-medium">{analytics.analytics.overview?.totalBatches || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Verifications:</span>
                <span className="font-medium">{analytics.analytics.overview?.totalVerifications || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">This Week:</span>
                <span className="font-medium">{analytics.analytics.trends?.batchesThisWeek || 0} batches</span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">No analytics available</div>
          )}
        </div>
      </div>

      {/* Schema Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Subgraph Schema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Manufacturer', fields: ['id', 'name', 'ensName', 'isVerified', 'registeredAt', 'batches'] },
            { name: 'MedicineBatch', fields: ['id', 'batchId', 'medicineName', 'manufacturer', 'expiryDate', 'isRecalled'] },
            { name: 'BatchVerification', fields: ['id', 'batch', 'verifier', 'timestamp', 'transactionHash'] },
            { name: 'BatchRecall', fields: ['id', 'batch', 'recaller', 'timestamp', 'transactionHash'] },
            { name: 'FakeBatchDetection', fields: ['id', 'batchId', 'detector', 'timestamp'] },
            { name: 'KYCDocument', fields: ['id', 'manufacturer', 'documentHash', 'isVerified'] }
          ].map((entity) => (
            <div key={entity.name} className="p-3 border rounded-lg dark:border-gray-700">
              <div className="font-medium text-blue-600 dark:text-blue-400 mb-2">{entity.name}</div>
              <div className="space-y-1">
                {entity.fields.map((field) => (
                  <div key={field} className="text-xs font-mono text-gray-600 dark:text-gray-400">
                    {field}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}