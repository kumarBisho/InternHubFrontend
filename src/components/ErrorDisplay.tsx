import React from "react";

interface ErrorDisplayProps {
  error?: Error | null;
  errorId?: string | null;
  onReset?: () => void;
  isDevelopment?: boolean;
  componentStack?: string;
  message?: string;
}

/**
 * ErrorDisplay Component
 * User-friendly error display UI with development details
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  errorId,
  onReset,
  isDevelopment,
  componentStack,
  message,
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="text-6xl">⚠️</div>
        </div>

        {/* Error Title */}
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Oops! Something went wrong
        </h1>

        {/* Error Message */}
        <p className="text-center text-gray-600 mb-6">
          {message || "We encountered an unexpected error. Our team has been notified."}
        </p>

        {/* Error ID for support */}
        {errorId && (
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <p className="text-sm font-mono text-gray-700">
              <span className="font-semibold">Error ID:</span>
              <br />
              <code className="text-xs break-all">{errorId}</code>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Please share this ID with support if the issue persists.
            </p>
          </div>
        )}

        {/* Development Details */}
        {isDevelopment && error && (
          <details className="mb-6 bg-red-50 rounded-lg p-4 border border-red-200">
            <summary className="cursor-pointer font-semibold text-red-900 mb-2">
              Development Details
            </summary>
            <div className="mt-2">
              <p className="text-sm font-mono text-red-800 break-words mb-2">
                <span className="font-semibold">Error:</span> {error.message}
              </p>
              {error.stack && (
                <details className="mt-2">
                  <summary className="text-xs text-red-700 cursor-pointer">Stack Trace</summary>
                  <pre className="text-xs text-red-800 bg-white rounded p-2 mt-2 overflow-auto max-h-32 whitespace-pre-wrap break-words">
                    {error.stack}
                  </pre>
                </details>
              )}
              {componentStack && (
                <details className="mt-2">
                  <summary className="text-xs text-red-700 cursor-pointer">Component Stack</summary>
                  <pre className="text-xs text-red-800 bg-white rounded p-2 mt-2 overflow-auto max-h-32 whitespace-pre-wrap break-words">
                    {componentStack}
                  </pre>
                </details>
              )}
            </div>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {onReset && (
            <button
              onClick={onReset}
              className="cursor-pointer flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Try Again
            </button>
          )}
          <button
            onClick={() => {
              window.location.href = "/";
            }}
            className="cursor-pointer flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>

        {/* Support Link */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Need help?{" "}
          <a href="mailto:support@internhub.com" className="text-blue-500 hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
};

export default ErrorDisplay;
