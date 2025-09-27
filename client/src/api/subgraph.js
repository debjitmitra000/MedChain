// client/src/api/subgraph.js
import { GraphQLClient, gql } from 'graphql-request';

// Subgraph endpoint - update this with your actual subgraph URL
const SUBGRAPH_URL = import.meta.env.VITE_SUBGRAPH_URL || 'https://api.studio.thegraph.com/query/your-subgraph-id/medchain/version/latest';

// Create GraphQL client
const client = new GraphQLClient(SUBGRAPH_URL, {
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Execute a GraphQL query against the subgraph
 * @param {string | import('graphql-request').TypedDocumentNode} query - GraphQL query
 * @param {Record<string, any>} variables - Query variables
 * @returns {Promise<any>} Query result
 */
export async function querySubgraph(query, variables = {}) {
  try {
    console.log('🔍 Executing subgraph query:', { query: typeof query === 'string' ? query : query?.definitions?.[0]?.name?.value, variables });
    
    const result = await client.request(query, variables);
    
    console.log('✅ Subgraph query successful:', result);
    return result;
  } catch (error) {
    console.error('❌ Subgraph query failed:', error);
    throw new Error(`Subgraph query failed: ${error.message}`);
  }
}

// Export gql for use in components
export { gql };

// Common queries for MedChain
export const QUERIES = {
  // Get all manufacturers
  GET_MANUFACTURERS: gql`
    query GetManufacturers($first: Int = 100, $skip: Int = 0, $orderBy: String = "registeredAt", $orderDirection: String = "desc") {
      manufacturers(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
        id
        address
        name
        email
        license
        isVerified
        isActive
        registeredAt
        kycDocuments {
          id
          documentHash
          documentType
          uploadedAt
          isVerified
        }
        batches {
          id
          batchId
          medicineName
          manufacturingDate
          expiryDate
          isActive
          isRecalled
          createdAt
          expiredScanCount
        }
      }
    }
  `,

  // Get manufacturer by address
  GET_MANUFACTURER_BY_ADDRESS: gql`
    query GetManufacturerByAddress($address: String!) {
      manufacturer(id: $address) {
        id
        address
        name
        email
        license
        isVerified
        isActive
        registeredAt
        kycDocuments {
          id
          documentHash
          documentType
          uploadedAt
          isVerified
        }
        batches {
          id
          batchId
          medicineName
          manufacturingDate
          expiryDate
          isActive
          isRecalled
          createdAt
          expiredScanCount
        }
      }
    }
  `,

  // Get all batches
  GET_BATCHES: gql`
    query GetBatches($first: Int = 100, $skip: Int = 0, $orderBy: String = "createdAt", $orderDirection: String = "desc") {
      medicineBatches(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
        id
        batchId
        medicineName
        manufacturingDate
        expiryDate
        isActive
        isRecalled
        createdAt
        expiredScanCount
        manufacturer {
          id
          address
          name
          email
          isVerified
          isActive
        }
      }
    }
  `,

  // Get batch by ID
  GET_BATCH_BY_ID: gql`
    query GetBatchById($batchId: String!) {
      medicineBatch(id: $batchId) {
        id
        batchId
        medicineName
        manufacturingDate
        expiryDate
        isActive
        isRecalled
        createdAt
        expiredScanCount
        manufacturer {
          id
          address
          name
          email
          isVerified
          isActive
        }
      }
    }
  `,

  // Get recent events
  GET_RECENT_EVENTS: gql`
    query GetRecentEvents($first: Int = 50) {
      manufacturerRegisteredEvents(first: $first, orderBy: "timestamp", orderDirection: "desc") {
        id
        manufacturer {
          id
          address
          name
        }
        name
        email
        timestamp
        blockNumber
        transactionHash
      }
      
      medicineBatchRegisteredEvents(first: $first, orderBy: "timestamp", orderDirection: "desc") {
        id
        batchId
        medicineName
        expiryDate
        timestamp
        blockNumber
        transactionHash
        manufacturer {
          id
          address
          name
        }
      }
      
      batchVerifiedEvents(first: $first, orderBy: "timestamp", orderDirection: "desc") {
        id
        batchId
        verifier
        timestamp
        blockNumber
        transactionHash
      }
      
      batchRecalledEvents(first: $first, orderBy: "timestamp", orderDirection: "desc") {
        id
        batchId
        timestamp
        blockNumber
        transactionHash
        manufacturer {
          id
          address
          name
        }
      }
      
      fakeBatchDetectedEvents(first: $first, orderBy: "timestamp", orderDirection: "desc") {
        id
        batchId
        detector
        timestamp
        blockNumber
        transactionHash
      }
      
      expiredBatchScannedEvents(first: $first, orderBy: "timestamp", orderDirection: "desc") {
        id
        batchId
        scanner
        scanCount
        timestamp
        blockNumber
        transactionHash
      }
    }
  `,

  // Subgraph health check
  GET_SUBGRAPH_HEALTH: gql`
    query SubgraphHealth {
      _meta {
        block {
          number
          hash
          timestamp
        }
        deployment
        hasIndexingErrors
      }
    }
  `,
};