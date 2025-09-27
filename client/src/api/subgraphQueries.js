// api/subgraphQueries.js
import { gql } from 'graphql-request';

// ===============================
// MANUFACTURER QUERIES
// ===============================

export const GET_ALL_MANUFACTURERS = gql`
  query GetAllManufacturers($first: Int = 100, $skip: Int = 0, $orderBy: Manufacturer_orderBy, $orderDirection: OrderDirection) {
    manufacturers(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
      id
      name
      ensName
      isVerified
      registeredAt
      verifiedAt
      totalBatches
      batches(first: 5, orderBy: createdAt, orderDirection: desc) {
        id
        batchId
        medicineName
        expiryDate
        createdAt
        isRecalled
      }
    }
  }
`;

export const GET_MANUFACTURER_BY_ID = gql`
  query GetManufacturerById($id: ID!) {
    manufacturer(id: $id) {
      id
      name
      ensName
      isVerified
      registeredAt
      verifiedAt
      totalBatches
      batches(orderBy: createdAt, orderDirection: desc) {
        id
        batchId
        medicineName
        expiryDate
        createdAt
        isRecalled
        recalledAt
        verifications(orderBy: timestamp, orderDirection: desc) {
          id
          verifier
          timestamp
          transactionHash
        }
      }
    }
  }
`;

export const GET_VERIFIED_MANUFACTURERS = gql`
  query GetVerifiedManufacturers($first: Int = 100, $skip: Int = 0) {
    manufacturers(
      first: $first, 
      skip: $skip, 
      where: { isVerified: true }, 
      orderBy: verifiedAt, 
      orderDirection: desc
    ) {
      id
      name
      ensName
      isVerified
      registeredAt
      verifiedAt
      totalBatches
    }
  }
`;

export const SEARCH_MANUFACTURERS = gql`
  query SearchManufacturers($searchTerm: String!, $first: Int = 20) {
    manufacturers(
      first: $first,
      where: {
        or: [
          { name_contains_nocase: $searchTerm },
          { ensName_contains_nocase: $searchTerm }
        ]
      },
      orderBy: registeredAt,
      orderDirection: desc
    ) {
      id
      name
      ensName
      isVerified
      registeredAt
      verifiedAt
      totalBatches
    }
  }
`;

// ===============================
// BATCH QUERIES
// ===============================

export const GET_ALL_BATCHES = gql`
  query GetAllBatches($first: Int = 100, $skip: Int = 0, $orderBy: MedicineBatch_orderBy, $orderDirection: OrderDirection) {
    medicineBatches(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
      id
      batchId
      medicineName
      manufacturer {
        id
        name
        ensName
        isVerified
      }
      expiryDate
      createdAt
      isRecalled
      recalledAt
      verifications(first: 1, orderBy: timestamp, orderDirection: desc) {
        id
        verifier
        timestamp
      }
    }
  }
`;

export const GET_BATCH_BY_ID = gql`
  query GetBatchById($id: ID!) {
    medicineBatch(id: $id) {
      id
      batchId
      medicineName
      manufacturer {
        id
        name
        ensName
        isVerified
        registeredAt
        verifiedAt
      }
      expiryDate
      createdAt
      isRecalled
      recalledAt
      verifications(orderBy: timestamp, orderDirection: desc) {
        id
        verifier
        timestamp
        transactionHash
      }
    }
  }
`;

export const GET_BATCH_BY_BATCH_ID = gql`
  query GetBatchByBatchId($batchId: String!) {
    medicineBatches(where: { batchId: $batchId }) {
      id
      batchId
      medicineName
      manufacturer {
        id
        name
        ensName
        isVerified
      }
      expiryDate
      createdAt
      isRecalled
      recalledAt
      verifications(orderBy: timestamp, orderDirection: desc) {
        id
        verifier
        timestamp
        transactionHash
      }
    }
  }
`;

export const GET_EXPIRED_BATCHES = gql`
  query GetExpiredBatches($currentTimestamp: BigInt!, $first: Int = 100) {
    medicineBatches(
      first: $first,
      where: { 
        expiryDate_lt: $currentTimestamp,
        isRecalled: false
      },
      orderBy: expiryDate,
      orderDirection: desc
    ) {
      id
      batchId
      medicineName
      manufacturer {
        id
        name
        ensName
        isVerified
      }
      expiryDate
      createdAt
      isRecalled
    }
  }
`;

export const GET_RECALLED_BATCHES = gql`
  query GetRecalledBatches($first: Int = 100, $skip: Int = 0) {
    medicineBatches(
      first: $first,
      skip: $skip,
      where: { isRecalled: true },
      orderBy: recalledAt,
      orderDirection: desc
    ) {
      id
      batchId
      medicineName
      manufacturer {
        id
        name
        ensName
        isVerified
      }
      expiryDate
      createdAt
      isRecalled
      recalledAt
    }
  }
`;

export const GET_MANUFACTURER_BATCHES = gql`
  query GetManufacturerBatches($manufacturerId: ID!, $first: Int = 100, $skip: Int = 0) {
    medicineBatches(
      first: $first,
      skip: $skip,
      where: { manufacturer: $manufacturerId },
      orderBy: createdAt,
      orderDirection: desc
    ) {
      id
      batchId
      medicineName
      manufacturer {
        id
        name
        ensName
        isVerified
      }
      expiryDate
      createdAt
      isRecalled
      recalledAt
      verifications(first: 3, orderBy: timestamp, orderDirection: desc) {
        id
        verifier
        timestamp
      }
    }
  }
`;

// ===============================
// VERIFICATION QUERIES
// ===============================

export const GET_BATCH_VERIFICATIONS = gql`
  query GetBatchVerifications($batchId: ID!, $first: Int = 100) {
    batchVerifications(
      first: $first,
      where: { batch: $batchId },
      orderBy: timestamp,
      orderDirection: desc
    ) {
      id
      batch {
        id
        batchId
        medicineName
      }
      verifier
      timestamp
      transactionHash
    }
  }
`;

export const GET_RECENT_VERIFICATIONS = gql`
  query GetRecentVerifications($first: Int = 50) {
    batchVerifications(
      first: $first,
      orderBy: timestamp,
      orderDirection: desc
    ) {
      id
      batch {
        id
        batchId
        medicineName
        manufacturer {
          id
          name
          ensName
        }
      }
      verifier
      timestamp
      transactionHash
    }
  }
`;

export const GET_USER_VERIFICATIONS = gql`
  query GetUserVerifications($verifier: Bytes!, $first: Int = 100) {
    batchVerifications(
      first: $first,
      where: { verifier: $verifier },
      orderBy: timestamp,
      orderDirection: desc
    ) {
      id
      batch {
        id
        batchId
        medicineName
        manufacturer {
          id
          name
          ensName
        }
      }
      verifier
      timestamp
      transactionHash
    }
  }
`;

// ===============================
// RECALL QUERIES
// ===============================

export const GET_BATCH_RECALLS = gql`
  query GetBatchRecalls($first: Int = 100) {
    batchRecalls(
      first: $first,
      orderBy: timestamp,
      orderDirection: desc
    ) {
      id
      batch {
        id
        batchId
        medicineName
        manufacturer {
          id
          name
          ensName
        }
      }
      recaller
      timestamp
      transactionHash
    }
  }
`;

export const GET_MANUFACTURER_RECALLS = gql`
  query GetManufacturerRecalls($manufacturerId: ID!, $first: Int = 100) {
    batchRecalls(
      first: $first,
      where: { 
        batch_: { manufacturer: $manufacturerId }
      },
      orderBy: timestamp,
      orderDirection: desc
    ) {
      id
      batch {
        id
        batchId
        medicineName
      }
      recaller
      timestamp
      transactionHash
    }
  }
`;

// ===============================
// FAKE BATCH DETECTION QUERIES
// ===============================

export const GET_FAKE_BATCH_DETECTIONS = gql`
  query GetFakeBatchDetections($first: Int = 100) {
    fakeBatchDetections(
      first: $first,
      orderBy: timestamp,
      orderDirection: desc
    ) {
      id
      batchId
      detector
      timestamp
      transactionHash
    }
  }
`;

export const GET_BATCH_DETECTIONS = gql`
  query GetBatchDetections($batchId: String!, $first: Int = 100) {
    fakeBatchDetections(
      first: $first,
      where: { batchId: $batchId },
      orderBy: timestamp,
      orderDirection: desc
    ) {
      id
      batchId
      detector
      timestamp
      transactionHash
    }
  }
`;

// ===============================
// KYC DOCUMENT QUERIES
// ===============================

export const GET_MANUFACTURER_KYC_DOCUMENTS = gql`
  query GetManufacturerKYCDocuments($manufacturerId: ID!) {
    kycDocuments(
      where: { manufacturer: $manufacturerId },
      orderBy: uploadedAt,
      orderDirection: desc
    ) {
      id
      manufacturer {
        id
        name
        ensName
      }
      documentHash
      documentType
      uploadedAt
      isVerified
      verifiedAt
    }
  }
`;

export const GET_PENDING_KYC_DOCUMENTS = gql`
  query GetPendingKYCDocuments($first: Int = 100) {
    kycDocuments(
      first: $first,
      where: { isVerified: false },
      orderBy: uploadedAt,
      orderDirection: asc
    ) {
      id
      manufacturer {
        id
        name
        ensName
      }
      documentHash
      documentType
      uploadedAt
      isVerified
      verifiedAt
    }
  }
`;

export const GET_VERIFIED_KYC_DOCUMENTS = gql`
  query GetVerifiedKYCDocuments($first: Int = 100) {
    kycDocuments(
      first: $first,
      where: { isVerified: true },
      orderBy: verifiedAt,
      orderDirection: desc
    ) {
      id
      manufacturer {
        id
        name
        ensName
      }
      documentHash
      documentType
      uploadedAt
      isVerified
      verifiedAt
    }
  }
`;

// ===============================
// ENS REGISTRATION QUERIES
// ===============================

export const GET_ENS_REGISTRATIONS = gql`
  query GetENSRegistrations($first: Int = 100) {
    ensRegistrations(
      first: $first,
      orderBy: registeredAt,
      orderDirection: desc
    ) {
      id
      manufacturer {
        id
        name
        ensName
        isVerified
      }
      ensName
      registeredAt
    }
  }
`;

export const GET_MANUFACTURER_ENS_REGISTRATIONS = gql`
  query GetManufacturerENSRegistrations($manufacturerId: ID!) {
    ensRegistrations(
      where: { manufacturer: $manufacturerId },
      orderBy: registeredAt,
      orderDirection: desc
    ) {
      id
      manufacturer {
        id
        name
        ensName
      }
      ensName
      registeredAt
    }
  }
`;

// ===============================
// ANALYTICS & DASHBOARD QUERIES
// ===============================

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    manufacturers(first: 1000) {
      id
      isVerified
      totalBatches
    }
    medicineBatches(first: 1000) {
      id
      isRecalled
      expiryDate
      createdAt
    }
    batchVerifications(first: 100, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
    }
    fakeBatchDetections(first: 100, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
    }
  }
`;

export const GET_MANUFACTURER_ANALYTICS = gql`
  query GetManufacturerAnalytics($manufacturerId: ID!) {
    manufacturer(id: $manufacturerId) {
      id
      name
      ensName
      isVerified
      registeredAt
      verifiedAt
      totalBatches
      batches {
        id
        isRecalled
        expiryDate
        createdAt
        verifications {
          id
          timestamp
        }
      }
    }
  }
`;

// ===============================
// SEARCH & FILTER QUERIES
// ===============================

export const GLOBAL_SEARCH = gql`
  query GlobalSearch($searchTerm: String!, $first: Int = 20) {
    manufacturers: manufacturers(
      first: $first,
      where: {
        or: [
          { name_contains_nocase: $searchTerm },
          { ensName_contains_nocase: $searchTerm }
        ]
      }
    ) {
      id
      name
      ensName
      isVerified
    }
    batches: medicineBatches(
      first: $first,
      where: {
        or: [
          { batchId_contains_nocase: $searchTerm },
          { medicineName_contains_nocase: $searchTerm }
        ]
      }
    ) {
      id
      batchId
      medicineName
      manufacturer {
        id
        name
        ensName
      }
    }
  }
`;

export default {
  // Manufacturers
  GET_ALL_MANUFACTURERS,
  GET_MANUFACTURER_BY_ID,
  GET_VERIFIED_MANUFACTURERS,
  SEARCH_MANUFACTURERS,
  
  // Batches
  GET_ALL_BATCHES,
  GET_BATCH_BY_ID,
  GET_BATCH_BY_BATCH_ID,
  GET_EXPIRED_BATCHES,
  GET_RECALLED_BATCHES,
  GET_MANUFACTURER_BATCHES,
  
  // Verifications
  GET_BATCH_VERIFICATIONS,
  GET_RECENT_VERIFICATIONS,
  GET_USER_VERIFICATIONS,
  
  // Recalls
  GET_BATCH_RECALLS,
  GET_MANUFACTURER_RECALLS,
  
  // Fake Detections
  GET_FAKE_BATCH_DETECTIONS,
  GET_BATCH_DETECTIONS,
  
  // KYC Documents
  GET_MANUFACTURER_KYC_DOCUMENTS,
  GET_PENDING_KYC_DOCUMENTS,
  GET_VERIFIED_KYC_DOCUMENTS,
  
  // ENS Registrations
  GET_ENS_REGISTRATIONS,
  GET_MANUFACTURER_ENS_REGISTRATIONS,
  
  // Analytics
  GET_DASHBOARD_STATS,
  GET_MANUFACTURER_ANALYTICS,
  
  // Search
  GLOBAL_SEARCH
};