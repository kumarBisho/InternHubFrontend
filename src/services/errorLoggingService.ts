/**
 * Error Logging Service
 * Handles centralized error logging with support for console, file, and external services like Sentry
 */

export interface LoggedError {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  context?: string;
  stack?: string;
  metadata?: Record<string, any>;
  userId?: string;
  url?: string;
  userAgent?: string;
}

interface ErrorLoggerConfig {
  isDevelopment: boolean;
  maxStoredErrors: number;
  sentryDsn?: string;
  enableConsoleLogging: boolean;
  enableLocalStorage: boolean;
}

class ErrorLoggingService {
  private config: ErrorLoggerConfig;
  private errors: LoggedError[] = [];
  private readonly STORAGE_KEY = 'internhub_error_logs';

  constructor(config: Partial<ErrorLoggerConfig> = {}) {
    this.config = {
      isDevelopment: import.meta.env.DEV,
      maxStoredErrors: 50,
      enableConsoleLogging: import.meta.env.DEV,
      enableLocalStorage: true,
      ...config,
    };

    // Load persisted errors from localStorage
    this.loadPersistedErrors();

    // Initialize Sentry if DSN provided
    if (this.config.sentryDsn && !this.config.isDevelopment) {
      this.initializeSentry();
    }
  }

  /**
   * Initialize Sentry for production error tracking
   * (Commented out by default - uncomment and install @sentry/react when ready)
   */
  private initializeSentry(): void {
    // import * as Sentry from "@sentry/react";
    // Sentry.init({
    //   dsn: this.config.sentryDsn,
    //   environment: this.config.isDevelopment ? 'development' : 'production',
    //   tracesSampleRate: 1.0,
    //   integrations: [
    //     new Sentry.Replay({
    //       maskAllText: true,
    //       blockAllMedia: true,
    //     }),
    //   ],
    // });
  }

  /**
   * Log an error
   */
  logError(
    message: string,
    error?: Error | unknown,
    context?: string,
    metadata?: Record<string, any>
  ): LoggedError {
    const loggedError: LoggedError = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      context,
      stack: error instanceof Error ? error.stack : undefined,
      metadata: {
        ...metadata,
        ...(error instanceof Error && { originalError: error.message }),
      },
      userId: this.getUserId(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };

    this.storeError(loggedError);
    this.outputLog(loggedError);

    // Send to Sentry if production
    // if (!this.config.isDevelopment) {
    //   import * as Sentry from "@sentry/react";
    //   Sentry.captureException(error, { contexts: { message, context } });
    // }

    return loggedError;
  }

  /**
   * Log a warning
   */
  logWarning(
    message: string,
    context?: string,
    metadata?: Record<string, any>
  ): LoggedError {
    const loggedError: LoggedError = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level: 'warning',
      message,
      context,
      metadata,
      userId: this.getUserId(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };

    this.storeError(loggedError);
    this.outputLog(loggedError);

    return loggedError;
  }

  /**
   * Log info
   */
  logInfo(
    message: string,
    context?: string,
    metadata?: Record<string, any>
  ): LoggedError {
    const loggedError: LoggedError = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context,
      metadata,
      userId: this.getUserId(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };

    if (this.config.isDevelopment) {
      this.outputLog(loggedError);
    }

    return loggedError;
  }

  /**
   * Handle unhandled promise rejections
   */
  handleUnhandledRejection(event: PromiseRejectionEvent): void {
    const error = event.reason;
    const message = error?.message || 'Unhandled Promise Rejection';
    const stack = error?.stack;

    this.logError(
      `Unhandled Promise Rejection: ${message}`,
      error,
      'unhandledRejection',
      { isUnhandled: true, stack }
    );
  }

  /**
   * Handle global errors
   */
  handleGlobalError(event: ErrorEvent): void {
    const { error, message, lineno, colno, filename } = event;

    this.logError(
      `Global Error: ${message}`,
      error,
      'globalError',
      { lineno, colno, filename }
    );
  }

  /**
   * Get all logged errors
   */
  getErrors(): LoggedError[] {
    return [...this.errors];
  }

  /**
   * Get errors by level
   */
  getErrorsByLevel(level: 'error' | 'warning' | 'info'): LoggedError[] {
    return this.errors.filter((e) => e.level === level);
  }

  /**
   * Get recent errors
   */
  getRecentErrors(count: number = 10): LoggedError[] {
    return this.errors.slice(-count);
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errors = [];
    if (this.config.enableLocalStorage) {
      try {
        localStorage.removeItem(this.STORAGE_KEY);
      } catch (e) {
        // localStorage may be unavailable
      }
    }
  }

  /**
   * Get error statistics
   */
  getStatistics(): {
    total: number;
    errors: number;
    warnings: number;
    info: number;
  } {
    return {
      total: this.errors.length,
      errors: this.errors.filter((e) => e.level === 'error').length,
      warnings: this.errors.filter((e) => e.level === 'warning').length,
      info: this.errors.filter((e) => e.level === 'info').length,
    };
  }

  /**
   * Export errors as JSON for debugging
   */
  exportErrors(): string {
    return JSON.stringify(this.getErrors(), null, 2);
  }

  /**
   * Private: Store error in memory and localStorage
   */
  private storeError(loggedError: LoggedError): void {
    this.errors.push(loggedError);

    // Keep only recent errors in memory
    if (this.errors.length > this.config.maxStoredErrors) {
      this.errors = this.errors.slice(-this.config.maxStoredErrors);
    }

    // Persist to localStorage for debugging
    if (this.config.enableLocalStorage) {
      this.persistErrors();
    }
  }

  /**
   * Private: Output log to console or alternative
   */
  private outputLog(loggedError: LoggedError): void {
    if (!this.config.enableConsoleLogging) return;

    const icon = {
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    }[loggedError.level];

    const message = `${icon} [${loggedError.level.toUpperCase()}] ${loggedError.message}`;
    const groupStyle = (
      {
        error: 'color: red; font-weight: bold;',
        warning: 'color: orange; font-weight: bold;',
        info: 'color: blue;',
      } as const
    )[loggedError.level];

    console.group(`%c${message}`, groupStyle);
    if (loggedError.context) console.log('Context:', loggedError.context);
    if (loggedError.stack) console.log('Stack:', loggedError.stack);
    if (loggedError.metadata) console.log('Metadata:', loggedError.metadata);
    console.log('Timestamp:', loggedError.timestamp);
    console.groupEnd();
  }

  /**
   * Private: Persist errors to localStorage
   */
  private persistErrors(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.errors));
    } catch (e) {
      // localStorage may be full or unavailable
    }
  }

  /**
   * Private: Load errors from localStorage
   */
  private loadPersistedErrors(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.errors = JSON.parse(stored);
      }
    } catch (e) {
      // localStorage may be unavailable or corrupted
    }
  }

  /**
   * Private: Generate unique error ID
   */
  private generateId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Private: Get current user ID from token or storage
   */
  private getUserId(): string | undefined {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        // Decode JWT to get user ID
        const parts = token.split('.');
        const payload = parts[1] ? JSON.parse(atob(parts[1])) : null;
        return payload?.sub || payload?.id;
      }
    } catch (e) {
      // Unable to extract user ID
    }
    return undefined;
  }
}

// Create and export singleton instance
const errorLogger = new ErrorLoggingService({
  sentryDsn: import.meta.env['VITE_SENTRY_DSN'],
});

// Add global error handlers
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorLogger.handleGlobalError(event);
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorLogger.handleUnhandledRejection(event);
  });
}

export default errorLogger;
