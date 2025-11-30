import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-mesh-light dark:bg-mesh-dark flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-8 max-w-lg w-full text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-display font-bold text-navy-800 dark:text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-navy-600 dark:text-navy-300 mb-6">
              An unexpected error occurred. Your data is safe in the backup storage.
            </p>

            {this.state.error && (
              <details className="text-left mb-6 bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-sm">
                <summary className="cursor-pointer font-semibold text-red-700 dark:text-red-400 mb-2">
                  Error Details
                </summary>
                <pre className="overflow-auto text-xs text-red-600 dark:text-red-300 whitespace-pre-wrap">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 bg-navy-100 dark:bg-navy-700 hover:bg-navy-200 dark:hover:bg-navy-600
                           text-navy-700 dark:text-navy-200 rounded-xl font-semibold transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="px-5 py-2.5 btn-primary text-white rounded-xl font-semibold"
              >
                Reload App
              </button>
            </div>

            <p className="mt-6 text-xs text-navy-400 dark:text-navy-500">
              If this problem persists, try clearing browser cache or contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
