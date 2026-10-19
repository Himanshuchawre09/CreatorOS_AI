import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-screen flex flex-col items-center justify-center p-6 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-6 shadow-sm">
            <AlertTriangle className="w-8 h-8" aria-hidden="true" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-50">
            Something went wrong
          </h1>

          <p className="mt-2 text-sm text-surface-600 dark:text-surface-400 max-w-md">
            An unexpected error occurred while rendering this view. Your session and saved data are safe.
          </p>

          {import.meta.env.DEV && this.state.error && (
            <div className="mt-4 p-4 rounded-xl bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-left max-w-xl overflow-x-auto text-xs font-mono text-rose-600 dark:text-rose-400">
              {this.state.error.message}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="primary"
              onClick={this.handleReset}
              leftIcon={<RefreshCw className="w-4 h-4" aria-hidden="true" />}
            >
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                this.handleReset();
                window.location.href = '/dashboard';
              }}
              leftIcon={<Home className="w-4 h-4" aria-hidden="true" />}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
