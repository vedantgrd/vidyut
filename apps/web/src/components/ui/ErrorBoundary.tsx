import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import styles from './ErrorBoundary.module.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.iconWrapper}>
              <AlertTriangle className={styles.icon} />
            </div>
            <h2 className={styles.title}>Something went wrong</h2>
            <p className={styles.description}>
              We've encountered an unexpected error. Please try refreshing the page.
            </p>
            {this.state.error && (
              <pre className={styles.errorDetails}>
                {this.state.error.message}
              </pre>
            )}
            <div className={styles.actions}>
              <Button onClick={() => window.location.reload()} variant="primary">
                Reload Page
              </Button>
              <Button onClick={this.handleRetry} variant="secondary">
                <RefreshCw size={16} />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
