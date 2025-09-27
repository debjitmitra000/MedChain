// client/src/hooks/useSubgraphHealth.js
import { gql } from '../api/subgraph';
import { useSubgraphQuery } from './useSubgraphQuery';

const HEALTH_QUERY = gql`
  query SubgraphHealth {
    _meta {
      block { number }
      deployment
    }
  }
`;

export function useSubgraphHealth({ enabled = true } = {}) {
  const { data, isLoading, error, refetch, isFetching } = useSubgraphQuery({
    query: HEALTH_QUERY,
    key: ['subgraph-health'],
    enabled,
    staleTime: 15_000,
    retry: false, // Don't retry on error
  });

  const meta = data?._meta;
  const isOnline = Boolean(meta?.block?.number);

  return {
    isOnline,
    blockNumber: meta?.block?.number,
    deployment: meta?.deployment,
    isLoading,
    isFetching,
    error,
    refetch,
  };
}
