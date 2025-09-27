// client/src/api/subgraph.js
// Lightweight GraphQL client for The Graph subgraph
import { GraphQLClient, gql } from 'graphql-request';

// Configure via env; falls back to the provided endpoint
const SUBGRAPH_URL = import.meta.env.VITE_SUBGRAPH_URL ||
  'https://api.studio.thegraph.com/query/119916/med/version/latest';

export const subgraphClient = new GraphQLClient(SUBGRAPH_URL, {
  headers: { 'content-type': 'application/json' },
});

/**
 * Execute a GraphQL query against the configured subgraph.
 * @param {import('graphql-request').TypedDocumentNode | string} query
 * @param {Record<string, any>} variables
 * @returns {Promise<any>}
 */
export const querySubgraph = async (query, variables = {}) => {
  try {
    const data = await subgraphClient.request(query, variables);
    return data;
  } catch (error) {
    // Normalize the error shape to match the axios api client style
    const normalized = new Error(error.response?.errors?.[0]?.message || error.message || 'Subgraph request failed');
    normalized.status = error.response?.status;
    normalized.data = error.response?.errors;
    throw normalized;
  }
};

// Re-export gql for convenience when writing queries
export { gql };

/*
Example usage:

import { gql, querySubgraph } from '@/api/subgraph';

const QUERY = gql`
  query Example($first: Int = 10, $skip: Int = 0) {
    manufacturers(first: $first, skip: $skip) {
      id
      # add fields according to your subgraph schema
    }
  }
`;

const data = await querySubgraph(QUERY, { first: 10, skip: 0 });
*/
