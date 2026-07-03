import React, { createContext, useContext, useState, useCallback } from "react";

export interface AppError {
  id: string;
  title: string;
  message: string;
  type: "error" | "warning" | "info" | "success";
  timestamp: string;
  autoClose?: boolean;
  duration?: number; // milliseconds
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ErrorContextType {
  errors: AppError[];
  addError: (
    message: string,
    options?: Partial<Omit<AppError, "id" | "message" | "timestamp">>
  ) => string;
  addErrorFromApiResponse: (error: any) => void;
  removeError: (id: string) => void;
  clearAllErrors: () => void;
  hasErrors: boolean;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

/**
 * ErrorProvider Component
 * Manages global application errors and notifications
 */
export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [errors, setErrors] = useState<AppError[]>([]);

  /**
   * Add an error to the global error state
   */
  const addError = useCallback(
    (
      message: string,
      options?: Partial<Omit<AppError, "id" | "message" | "timestamp">>
    ): string => {
      const id = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newError: AppError = {
        id,
        title: options?.title || "Error",
        message,
        type: options?.type || "error",
        timestamp: new Date().toISOString(),
        autoClose: options?.autoClose !== false,
        duration: options?.duration || 5000,
        dismissible: options?.dismissible !== false,
        action: options?.action,
      };

      setErrors((prevErrors) => [...prevErrors, newError]);

      // Auto-remove error after duration if autoClose is enabled
      if (newError.autoClose) {
        setTimeout(() => {
          removeError(id);
        }, newError.duration);
      }

      return id;
    },
    []
  );

  /**
   * Add error from API response
   */
  const addErrorFromApiResponse = useCallback((error: any) => {
    let message = "An unexpected error occurred";
    let code = "UNKNOWN_ERROR";

    if (error?.response?.data) {
      const data = error.response.data;
      message = data.message || data.error?.message || message;
      code = data.code || data.error?.code || code;
    } else if (error?.message) {
      message = error.message;
    }

    addError(message, {
      title: "API Error",
      type: "error",
      duration: 6000,
    });
  }, [addError]);

  /**
   * Remove error by ID
   */
  const removeError = useCallback((id: string) => {
    setErrors((prevErrors) => prevErrors.filter((error) => error.id !== id));
  }, []);

  /**
   * Clear all errors
   */
  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const value: ErrorContextType = {
    errors,
    addError,
    addErrorFromApiResponse,
    removeError,
    clearAllErrors,
    hasErrors: errors.length > 0,
  };

  return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>;
};

/**
 * Hook to use error context
 */
export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useError must be used within ErrorProvider");
  }
  return context;
};

export default ErrorContext;
