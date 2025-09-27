import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          backgroundColor: '#fef2f2',
          border: '2px solid #ef4444',
          borderRadius: '8px',
          margin: '20px',
          maxWidth: '600px',
          margin: '20px auto'
        }}>
          <h2 style={{ color: '#dc2626', marginBottom: '16px' }}>
            ⚠️ Something went wrong
          </h2>
          <p style={{ color: '#7f1d1d', marginBottom: '16px' }}>
            The application encountered an unexpected error. Please refresh the page to try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            🔄 Refresh Page
          </button>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginTop: '20px', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', color: '#dc2626', fontWeight: '500' }}>
                Error Details (Development)
              </summary>
              <pre style={{
                backgroundColor: '#f3f4f6',
                padding: '16px',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px',
                marginTop: '8px',
                color: '#374151'
              }}>
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
