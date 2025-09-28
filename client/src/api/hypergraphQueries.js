// api/hypergraphQueries.js
import { gql } from 'graphql-request';

// ===============================
// MANUFACTURER QUERIES
// ===============================

export const GET_ALL_MANUFACTURERS_HG = gql`
  query GetAllManufacturers($spaceId: ID!, $first: Int = 100, $skip: Int = 0) {
    space(id: $spaceId) {
      id
      name
      entities(
        first: $first, 
        skip: $skip,
        where: { type: "Manufacturer" }
      ) {
        id
        type
        data
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_MANUFACTURER_BY_ID_HG = gql`
  query GetManufacturerById($spaceId: ID!, $entityId: ID!) {
    space(id: $spaceId) {
      id
      entity(id: $entityId) {
        id
        type
        data
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_VERIFIED_MANUFACTURERS_HG = gql`
  query GetVerifiedManufacturers($spaceId: ID!, $first: Int = 100, $skip: Int = 0) {
    space(id: $spaceId) {
      id
      entities(
        first: $first, 
        skip: $skip,
        where: { 
          type: "Manufacturer",
          data_contains: "\"isVerified\":true"
        }
      ) {
        id
        type
        data
        createdAt
        updatedAt
      }
    }
  }
`;

export const SEARCH_MANUFACTURERS_HG = gql`
  query SearchManufacturers($spaceId: ID!, $searchTerm: String!, $first: Int = 20) {
    space(id: $spaceId) {
      id
      entities(
        first: $first,
        where: {
          type: "Manufacturer",
          data_contains: $searchTerm
        }
      ) {
        id
        type
        data
        createdAt
        updatedAt
      }
    }
  }
`;

// ===============================
// MEDICINE BATCH QUERIES
// ===============================

export const GET_ALL_BATCHES_HG = gql`
  query GetAllBatches($spaceId: ID!, $first: Int = 100, $skip: Int = 0) {
    space(id: $spaceId) {
      id
      entities(
        first: $first, 
        skip: $skip,
        where: { type: "MedicineBatch" }
      ) {
        id
        type
        data
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_BATCH_BY_ID_HG = gql`
  query GetBatchById($spaceId: ID!, $entityId: ID!) {
    space(id: $spaceId) {
      id
      entity(id: $entityId) {
        id
        type
        data
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_BATCHES_BY_MANUFACTURER_HG = gql`
  query GetBatchesByManufacturer($spaceId: ID!, $manufacturer: String!, $first: Int = 100) {
    space(id: $spaceId) {
      id
      entities(
        first: $first,
        where: {
          type: "MedicineBatch",
          data_contains: $manufacturer
        }
      ) {
        id
        type
        data
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_EXPIRED_BATCHES_HG = gql`
  query GetExpiredBatches($spaceId: ID!, $currentTimestamp: String!, $first: Int = 100) {
    space(id: $spaceId) {
      id
      entities(
        first: $first,
        where: {
          type: "MedicineBatch",
          data_contains: "\"isActive\":true"
        }
      ) {
        id
        type
        data
        createdAt
        updatedAt
      }
    }
  }
`;

export const SEARCH_BATCHES_HG = gql`
  query SearchBatches($spaceId: ID!, $searchTerm: String!, $first: Int = 20) {
    space(id: $spaceId) {
      id
      entities(
        first: $first,
        where: {
          type: "MedicineBatch",
          data_contains: $searchTerm
        }
      ) {
        id
        type
        data
        createdAt
        updatedAt
      }
    }
  }
`;

// ===============================
// DASHBOARD & ANALYTICS QUERIES
// ===============================

export const GET_DASHBOARD_STATS_HG = gql`
  query GetDashboardStats($spaceId: ID!) {
    space(id: $spaceId) {
      id
      name
      description
      manufacturers: entities(where: { type: "Manufacturer" }) {
        id
        data
      }
      batches: entities(where: { type: "MedicineBatch" }) {
        id
        data
      }
    }
  }
`;

export const GET_SPACE_OVERVIEW_HG = gql`
  query GetSpaceOverview($spaceId: ID!) {
    space(id: $spaceId) {
      id
      name
      description
      owner {
        id
        address
      }
      entityCount
      createdAt
      updatedAt
    }
  }
`;

// ===============================
// GLOBAL SEARCH QUERY
// ===============================

export const GLOBAL_SEARCH_HG = gql`
  query GlobalSearch($spaceId: ID!, $searchTerm: String!, $first: Int = 20) {
    space(id: $spaceId) {
      id
      manufacturers: entities(
        first: $first,
        where: {
          type: "Manufacturer",
          data_contains: $searchTerm
        }
      ) {
        id
        type
        data
        createdAt
      }
      batches: entities(
        first: $first,
        where: {
          type: "MedicineBatch",
          data_contains: $searchTerm
        }
      ) {
        id
        type
        data
        createdAt
      }
    }
  }
`;

export default {
  // Manufacturers
  GET_ALL_MANUFACTURERS_HG,
  GET_MANUFACTURER_BY_ID_HG,
  GET_VERIFIED_MANUFACTURERS_HG,
  SEARCH_MANUFACTURERS_HG,
  
  // Batches
  GET_ALL_BATCHES_HG,
  GET_BATCH_BY_ID_HG,
  GET_BATCHES_BY_MANUFACTURER_HG,
  GET_EXPIRED_BATCHES_HG,
  SEARCH_BATCHES_HG,
  
  // Analytics
  GET_DASHBOARD_STATS_HG,
  GET_SPACE_OVERVIEW_HG,
  
  // Search
  GLOBAL_SEARCH_HG
};