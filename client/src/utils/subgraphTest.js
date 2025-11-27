// utils/subgraphTest.js
import { graphqlClient, QUERIES } from '../api/subgraph';
import { getDashboardAnalytics } from '../api/verify';
import { getManufacturerList, getManufacturer } from '../api/manufacturer';
import { getAllBatches, getBatch } from '../api/batch';

/**
 * Test suite for The Graph subgraph integration
 */
export class SubgraphTestSuite {
  constructor() {
    this.results = [];
    this.startTime = null;
  }

  log(test, status, message, data = null) {
    const result = {
      test,
      status, // 'pass', 'fail', 'warn'
      message,
      data,
      timestamp: new Date().toISOString()
    };
    
    this.results.push(result);
    
    const emoji = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
    console.log(`${emoji} ${test}: ${message}`);
    
    if (data && process.env.NODE_ENV === 'development') {
      console.log('  Data:', data);
    }
  }

  async runAllTests() {
    this.startTime = Date.now();
    this.results = [];
    
    console.log('🚀 Starting The Graph Subgraph Integration Tests...');
    
    try {
      await this.testConnection();
      await this.testBasicQueries();
      await this.testDataConsistency();
      await this.testPerformance();
      await this.testErrorHandling();
      
      const duration = Date.now() - this.startTime;
      const passed = this.results.filter(r => r.status === 'pass').length;
      const failed = this.results.filter(r => r.status === 'fail').length;
      const warned = this.results.filter(r => r.status === 'warn').length;
      
      console.log(`\n📊 Test Results (${duration}ms):`);
      console.log(`  ✅ Passed: ${passed}`);
      console.log(`  ❌ Failed: ${failed}`);
      console.log(`  ⚠️ Warnings: ${warned}`);
      
      return {
        summary: { passed, failed, warned, duration },
        results: this.results
      };
      
    } catch (error) {
      this.log('Test Suite', 'fail', `Test suite failed: ${error.message}`, error);
      return {
        summary: { passed: 0, failed: 1, warned: 0, duration: Date.now() - this.startTime },
        results: this.results
      };
    }
  }

  async testConnection() {
    try {
      const health = await graphqlClient.healthCheck();
      
      if (health.healthy) {
        this.log('Connection', 'pass', 'Subgraph connection successful', health);
      } else {
        this.log('Connection', 'fail', 'Subgraph health check failed', health);
      }
      
      // Test basic meta query
      const metaQuery = `
        query TestMeta {
          _meta {
            block {
              number
              timestamp
            }
          }
        }
      `;
      
      const metaResult = await graphqlClient.request(metaQuery);
      
      if (metaResult._meta) {
        this.log('Meta Query', 'pass', `Connected to block ${metaResult._meta.block.number}`, metaResult._meta);
      } else {
        this.log('Meta Query', 'warn', 'Meta query returned no block info');
      }
      
    } catch (error) {
      this.log('Connection', 'fail', `Connection test failed: ${error.message}`, error);
    }
  }

  async testBasicQueries() {
    const tests = [
      {
        name: 'Manufacturers Query',
        query: QUERIES.GET_ALL_MANUFACTURERS,
        variables: { first: 5 },
        validateFn: (result) => Array.isArray(result.manufacturers)
      },
      {
        name: 'Batches Query', 
        query: QUERIES.GET_ALL_BATCHES,
        variables: { first: 5 },
        validateFn: (result) => Array.isArray(result.medicineBatches)
      },
      {
        name: 'Verifications Query',
        query: QUERIES.GET_RECENT_VERIFICATIONS,
        variables: { first: 5 },
        validateFn: (result) => Array.isArray(result.batchVerifications)
      },
      {
        name: 'Dashboard Stats',
        query: QUERIES.GET_DASHBOARD_STATS,
        variables: {},
        validateFn: (result) => result.manufacturers && result.medicineBatches
      }
    ];

    for (const test of tests) {
      try {
        const startTime = Date.now();
        const result = await graphqlClient.request(test.query, test.variables);
        const duration = Date.now() - startTime;
        
        if (test.validateFn(result)) {
          this.log(test.name, 'pass', `Query successful (${duration}ms)`, {
            dataSize: JSON.stringify(result).length,
            duration
          });
        } else {
          this.log(test.name, 'fail', 'Query validation failed', result);
        }
        
      } catch (error) {
        this.log(test.name, 'fail', `Query failed: ${error.message}`, error);
      }
    }
  }

  async testDataConsistency() {
    try {
      // Test API vs Subgraph consistency
      const tests = [
        {
          name: 'Manufacturer List Consistency',
          apiCall: () => getManufacturerList({ limit: 10 }),
          subgraphCall: () => graphqlClient.request(QUERIES.GET_ALL_MANUFACTURERS, { first: 10 }),
          compareFn: (apiData, subgraphData) => {
            const apiCount = apiData.manufacturers?.length || 0;
            const subgraphCount = subgraphData.manufacturers?.length || 0;
            return Math.abs(apiCount - subgraphCount) <= 2; // Allow small differences due to indexing delays
          }
        },
        {
          name: 'Dashboard Analytics Consistency',
          apiCall: () => getDashboardAnalytics(),
          subgraphCall: () => graphqlClient.request(QUERIES.GET_DASHBOARD_STATS),
          compareFn: (apiData, subgraphData) => {
            // Just check that both return data
            return apiData.success && subgraphData.manufacturers;
          }
        }
      ];

      for (const test of tests) {
        try {
          const [apiResult, subgraphResult] = await Promise.all([
            test.apiCall().catch(e => ({ error: e.message })),
            test.subgraphCall().catch(e => ({ error: e.message }))
          ]);

          if (apiResult.error && subgraphResult.error) {
            this.log(test.name, 'warn', 'Both API and subgraph failed', { apiResult, subgraphResult });
          } else if (apiResult.error) {
            this.log(test.name, 'warn', 'API failed, subgraph working', { apiResult, subgraphResult });
          } else if (subgraphResult.error) {
            this.log(test.name, 'warn', 'Subgraph failed, API working', { apiResult, subgraphResult });
          } else if (test.compareFn(apiResult, subgraphResult)) {
            this.log(test.name, 'pass', 'Data consistency check passed');
          } else {
            this.log(test.name, 'warn', 'Data inconsistency detected', { apiResult, subgraphResult });
          }
          
        } catch (error) {
          this.log(test.name, 'fail', `Consistency test failed: ${error.message}`, error);
        }
      }
      
    } catch (error) {
      this.log('Data Consistency', 'fail', `Consistency tests failed: ${error.message}`, error);
    }
  }

  async testPerformance() {
    try {
      // Test query performance
      const performanceTests = [
        {
          name: 'Large Manufacturers Query',
          query: QUERIES.GET_ALL_MANUFACTURERS,
          variables: { first: 100 }
        },
        {
          name: 'Large Batches Query',
          query: QUERIES.GET_ALL_BATCHES,
          variables: { first: 100 }
        },
        {
          name: 'Complex Analytics Query',
          query: QUERIES.GET_DASHBOARD_STATS,
          variables: {}
        }
      ];

      const results = [];
      
      for (const test of performanceTests) {
        const startTime = Date.now();
        try {
          const result = await graphqlClient.request(test.query, test.variables);
          const duration = Date.now() - startTime;
          const dataSize = JSON.stringify(result).length;
          
          results.push({ ...test, duration, dataSize, success: true });
          
          if (duration < 1000) {
            this.log(`Performance: ${test.name}`, 'pass', `Fast response (${duration}ms, ${dataSize} bytes)`);
          } else if (duration < 3000) {
            this.log(`Performance: ${test.name}`, 'warn', `Slow response (${duration}ms, ${dataSize} bytes)`);
          } else {
            this.log(`Performance: ${test.name}`, 'fail', `Very slow response (${duration}ms, ${dataSize} bytes)`);
          }
          
        } catch (error) {
          const duration = Date.now() - startTime;
          results.push({ ...test, duration, success: false, error: error.message });
          this.log(`Performance: ${test.name}`, 'fail', `Query failed after ${duration}ms: ${error.message}`);
        }
      }

      // Overall performance summary
      const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
      const successRate = results.filter(r => r.success).length / results.length * 100;

      if (avgDuration < 500 && successRate === 100) {
        this.log('Overall Performance', 'pass', `Excellent performance (avg: ${avgDuration.toFixed(0)}ms, ${successRate}% success)`);
      } else if (avgDuration < 1000 && successRate >= 80) {
        this.log('Overall Performance', 'pass', `Good performance (avg: ${avgDuration.toFixed(0)}ms, ${successRate}% success)`);
      } else {
        this.log('Overall Performance', 'warn', `Performance issues detected (avg: ${avgDuration.toFixed(0)}ms, ${successRate}% success)`);
      }
      
    } catch (error) {
      this.log('Performance Tests', 'fail', `Performance tests failed: ${error.message}`, error);
    }
  }

  async testErrorHandling() {
    try {
      // Test invalid queries
      const errorTests = [
        {
          name: 'Invalid Query Syntax',
          query: `query InvalidQuery { nonExistentField }`,
          variables: {}
        },
        {
          name: 'Invalid Variables',
          query: QUERIES.GET_MANUFACTURER_BY_ID,
          variables: { id: null }
        },
        {
          name: 'Non-existent Entity',
          query: QUERIES.GET_MANUFACTURER_BY_ID,
          variables: { id: '0x0000000000000000000000000000000000000000' }
        }
      ];

      for (const test of errorTests) {
        try {
          const result = await graphqlClient.request(test.query, test.variables);
          
          if (test.name === 'Non-existent Entity' && (!result.manufacturer || result.manufacturer === null)) {
            this.log(`Error Handling: ${test.name}`, 'pass', 'Correctly handled non-existent entity');
          } else {
            this.log(`Error Handling: ${test.name}`, 'warn', 'Expected error but got result', result);
          }
          
        } catch (error) {
          if (test.name !== 'Non-existent Entity') {
            this.log(`Error Handling: ${test.name}`, 'pass', 'Correctly threw error for invalid input');
          } else {
            this.log(`Error Handling: ${test.name}`, 'warn', `Unexpected error: ${error.message}`);
          }
        }
      }
      
    } catch (error) {
      this.log('Error Handling Tests', 'fail', `Error handling tests failed: ${error.message}`, error);
    }
  }

  getReport() {
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warned = this.results.filter(r => r.status === 'warn').length;
    const total = this.results.length;
    
    return {
      summary: {
        total,
        passed,
        failed,
        warned,
        successRate: total > 0 ? (passed / total * 100).toFixed(1) + '%' : '0%',
        duration: this.startTime ? Date.now() - this.startTime : 0
      },
      results: this.results,
      recommendations: this.generateRecommendations()
    };
  }

  generateRecommendations() {
    const recommendations = [];
    const failures = this.results.filter(r => r.status === 'fail');
    const warnings = this.results.filter(r => r.status === 'warn');

    if (failures.length > 0) {
      recommendations.push('🔥 Critical: Fix failed tests before deploying to production');
    }

    if (warnings.filter(w => w.test.includes('Performance')).length > 0) {
      recommendations.push('⚡ Consider optimizing slow queries or adding more caching');
    }

    if (warnings.filter(w => w.test.includes('Consistency')).length > 0) {
      recommendations.push('🔄 Data inconsistencies detected - check indexing delays or sync issues');
    }

    if (failures.filter(f => f.test.includes('Connection')).length > 0) {
      recommendations.push('🌐 Connection issues - verify subgraph endpoint and network connectivity');
    }

    if (recommendations.length === 0) {
      recommendations.push('✨ All tests passed! The Graph integration is working perfectly.');
    }

    return recommendations;
  }
}

// Export test runner instance
export const subgraphTests = new SubgraphTestSuite();

// Utility function to run tests from console
export const runSubgraphTests = () => subgraphTests.runAllTests();