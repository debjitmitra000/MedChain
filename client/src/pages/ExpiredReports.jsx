import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getExpiredReports } from '../api/verify';

export default function ExpiredReports() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['expired-reports'],
    queryFn: getExpiredReports,
  });

  if (isLoading) return <p>Loading expired medicine reports...</p>;
  if (error) return <p>Error loading reports: {error.message}</p>;

  const reports = data?.data?.reports || [];
  const summary = data?.data?.summary || {};

  return (
    <div>
      <h3>Expired Medicine Reports</h3>
      
      <div style={{ 
        marginBottom: 20, 
        padding: 16, 
        backgroundColor: '#fff3cd', 
        border: '1px solid #ffeaa7',
        borderRadius: 4 
      }}>
        <h4>Summary</h4>
        <p><strong>Total Reports:</strong> {data?.data?.totalReports || 0}</p>
        <p><strong>Total Expired Scans:</strong> {summary.totalExpiredScans || 0}</p>
        {summary.mostScannedBatch && (
          <p>
            <strong>Most Scanned Batch:</strong> 
            <Link to={`/batch/${summary.mostScannedBatch.batchId}`}>
              {summary.mostScannedBatch.batchId}
            </Link> 
            ({summary.mostScannedBatch.expiredScanCount} scans)
          </p>
        )}
      </div>

      {reports.length === 0 ? (
        <p>No expired medicine reports found.</p>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {reports.map((report, i) => (
            <div key={i} style={{ 
              border: '1px solid #ff8800', 
              padding: 12, 
              borderRadius: 4,
              backgroundColor: '#fff8f0'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#ff8800' }}>
                <Link to={`/batch/${report.batchId}`}>
                  {report.batchId}
                </Link>
              </h4>
              <p style={{ margin: '4px 0' }}>
                <strong>Medicine:</strong> {report.medicineName}
              </p>
              <p style={{ margin: '4px 0' }}>
                <strong>Manufacturer:</strong> {report.manufacturer?.slice(0, 10)}...{report.manufacturer?.slice(-8)}
              </p>
              <p style={{ margin: '4px 0' }}>
                <strong>Expired Scan Count:</strong> 
                <span style={{ 
                  color: '#ff4444', 
                  fontWeight: 'bold',
                  marginLeft: 8 
                }}>
                  {report.expiredScanCount}
                </span>
              </p>
              {report.lastScannedAtFormatted && (
                <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                  Last scanned: {report.lastScannedAtFormatted}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
