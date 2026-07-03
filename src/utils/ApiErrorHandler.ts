import { AxiosError } from "axios";
import i18n from "./i18n";

/**
 * Standardized API Error class
 */
export class StandardApiError extends Error {
  code: string;
  statusCode: number;
  details?: Record<string, any>;

  constructor(
    code: string,
    statusCode: number,
    details?: Record<string, any>,
    message?: string
  ) {
    super(message || i18n.getErrorMessage(code));
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * API Error Handler
 * Standardizes error handling across all API calls
 */
export class ApiErrorHandler {
  /**
   * Parse API error response
   */
  static parseError(error: unknown): StandardApiError {
    // Network/connection error
    if (!error) {
      return new StandardApiError(
        "networkError",
        0,
        undefined,
        i18n.t("errors.networkError")
      );
    }

    // Axios error
    if (error instanceof AxiosError) {
      return this.handleAxiosError(error);
    }

    // Generic error
    if (error instanceof Error) {
      return new StandardApiError(
        "unknown",
        500,
        { originalMessage: error.message },
        error.message
      );
    }

    // Unknown error
    return new StandardApiError(
      "unknown",
      500,
      { error },
      i18n.t("errors.unknown")
    );
  }

  /**
   * Handle Axios error specifically
   */
  private static handleAxiosError(error: AxiosError): StandardApiError {
    const status = error.response?.status || 0;
    const data = error.response?.data as any;

    // Extract error information from response
    const code = data?.code || this.getErrorCodeByStatus(status);
    const message = data?.message || this.getErrorMessageByStatus(status);
    const details = {
      statusCode: status,
      response: data,
      url: error.config?.url,
      method: error.config?.method,
    };

    return new StandardApiError(code, status, details, message);
  }

  /**
   * Get error code by HTTP status
   */
  private static getErrorCodeByStatus(status: number): string {
    const errorMap: Record<number, string> = {
      400: "badRequest",
      401: "unauthorized",
      403: "forbidden",
      404: "notFound",
      409: "conflict",
      500: "serverError",
      503: "serviceUnavailable",
      0: "networkError",
    };

    return errorMap[status] || "unknown";
  }

  /**
   * Get user-friendly error message by HTTP status
   */
  private static getErrorMessageByStatus(status: number): string {
    const messageMap: Record<number, string> = {
      400: i18n.t("errors.badRequest"),
      401: i18n.t("errors.unauthorized"),
      403: i18n.t("errors.forbidden"),
      404: i18n.t("errors.notFound"),
      409: i18n.t("errors.conflict"),
      500: i18n.t("errors.serverError"),
      503: i18n.t("errors.serviceUnavailable"),
      0: i18n.t("errors.networkError"),
    };

    return messageMap[status] || i18n.t("errors.unknown");
  }

  /**
   * Check if error is due to authentication issues
   */
  static isAuthError(error: StandardApiError): boolean {
    return error.code === "unauthorized" || error.code === "tokenExpired";
  }

  /**
   * Check if error is retriable
   */
  static isRetriable(error: StandardApiError): boolean {
    return (
      error.statusCode === 0 || // Network error
      error.statusCode === 408 || // Request timeout
      error.statusCode === 429 || // Too many requests
      error.statusCode === 500 || // Server error
      error.statusCode === 503 // Service unavailable
    );
  }

  /**
   * Get formatted error message for display
   */
  static getDisplayMessage(error: StandardApiError): string {
    const message = i18n.t(`errors.${error.code}`, error.message);

    // Append helpful context
    if (this.isRetriable(error)) {
      return `${message}. ${i18n.t("errors.tryAgain")}`;
    }

    return message;
  }
}

/**
 * Hook for handling API errors in React components
 */
export const handleApiError = (
  error: unknown,
  context?: string
): StandardApiError => {
  const parsedError = ApiErrorHandler.parseError(error);

  // You can add additional context logging here
  if (context) {
    console.error(`[${context}]`, parsedError);
  }

  return parsedError;
};

export default ApiErrorHandler;
