// client/src/hooks/useSubgraphQuery.js
import { useQuery } from '@tanstack/react-query';
import { querySubgraph } from '../api/subgraph';

/**
 * React Query wrapper for executing GraphQL queries against The Graph subgraph.
 *
 * @param {Object} params
 * @param {import('graphql-request').TypedDocumentNode | string} params.query - GraphQL query document or string
 * @param {Record<string, any>} [params.variables] - Variables for the GraphQL query
 * @param {Array<any>} [params.key] - Optional custom query key for caching
 * @param {boolean} [params.enabled] - Whether the query is enabled
 * @param {number} [params.staleTime] - React Query stale time
 * @param {number} [params.gcTime] - React Query garbage collection time
 */
export function useSubgraphQuery({
  query,
  variables = {},
  key,
  enabled = true,
  staleTime = 30_000,
  gcTime = 5 * 60_000,
}) {
  const queryKey = key || [
    'subgraph',
    typeof query === 'string' ? query : query?.kind || 'query',
    variables,
  ];

  return useQuery({
    queryKey,
    enabled,
    staleTime,
    gcTime,
    queryFn: () => querySubgraph(query, variables),
  });
}
