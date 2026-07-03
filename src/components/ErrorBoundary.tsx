import React, { type ReactNode } from "react";
import errorLogger from "../services/errorLoggingService";
import ErrorDisplay from "./ErrorDisplay";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId?: string;
}

/**
 * ErrorBoundary Component
 * Catches React component errors and displays a user-friendly error UI
 * Logs errors to the error logging service for debugging
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error logging service
    const loggedError = errorLogger.logError(
      `React Component Error: ${error.message}`,
      error,
      "componentError",
      {
        componentStack: errorInfo.componentStack,
      }
    );

    // Update state
    this.setState({
      error,
      errorInfo,
      errorId: loggedError.id,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: undefined,
    });
  };

  override render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <ErrorDisplay
            error={this.state.error}
            errorId={this.state.errorId}
            onReset={this.handleReset}
            isDevelopment={import.meta.env.DEV}
            componentStack={this.state.errorInfo?.componentStack || undefined}
          />
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
