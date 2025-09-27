// components/LighthouseErrorBoundary.jsx
import React from 'react';

class LighthouseErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details
    console.error('Lighthouse Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // In production, you might want to report this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Report to error tracking service
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      const isLighthouseError = this.state.error?.message?.includes('Lighthouse') || 
                               this.state.error?.message?.includes('IPFS') ||
                               this.state.error?.message?.includes('upload');

      return (
        <div className="min-h-[200px] flex items-center justify-center p-4">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-red-400 dark:text-red-600">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {isLighthouseError ? 'Storage Upload Error' : 'Something went wrong'}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {isLighthouseError 
                ? 'There was an issue uploading to IPFS storage. This might be due to network connectivity or API key configuration.'
                : 'An unexpected error occurred while loading this component.'
              }
            </p>

            {process.env.NODE_ENV === 'development' && (
              <details className="text-left mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
                <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Error Details (Development)
                </summary>
                <pre className="whitespace-pre-wrap text-red-600 dark:text-red-400 text-xs">
                  {this.state.error && this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="flex space-x-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                Reload Page
              </button>
            </div>

            {isLighthouseError && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>💡 Tip:</strong> Make sure your Lighthouse API key is configured correctly in the environment variables.
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default LighthouseErrorBoundary;