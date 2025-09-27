// client/src/components/SubgraphStatus.jsx
import { useMemo } from 'react';
import { useSubgraphHealth } from '../hooks/useSubgraphHealth';

export default function SubgraphStatus() {
  const { isOnline, blockNumber, isLoading, error } = useSubgraphHealth();
  
  const color = useMemo(() => {
    if (isLoading) return '#999';
    if (error) return '#e53e3e';
    return isOnline ? '#38a169' : '#e53e3e';
  }, [isLoading, error, isOnline]);

  const label = useMemo(() => {
    if (isLoading) return 'Subgraph: checking...';
    if (error) return 'Subgraph: offline';
    return isOnline ? `Subgraph: online @ ${blockNumber}` : 'Subgraph: offline';
  }, [isLoading, error, isOnline, blockNumber]);

  // Don't render if there's an error to avoid cluttering the UI
  if (error && !isLoading) {
    return null;
  }

  return (
    <div 
      title={error?.message} 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 6,
        padding: '4px 8px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        fontSize: '12px'
      }}
    >
      <span style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: color,
      }} />
      <span style={{ color: '#4a5568' }}>{label}</span>
    </div>
  );
}
