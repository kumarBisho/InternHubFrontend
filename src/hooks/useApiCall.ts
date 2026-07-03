import { useState, useCallback } from "react";
import errorLogger from "../services/errorLoggingService";
import { ApiErrorHandler, StandardApiError, handleApiError } from "../utils/ApiErrorHandler";
import { useError } from "../context/ErrorContext";

interface UseFetchOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: StandardApiError) => void;
  showErrorToast?: boolean;
  context?: string;
}

interface UseFetchReturn<T> {
  data: T | null;
  error: StandardApiError | null;
  loading: boolean;
  execute: (fn: () => Promise<T>) => Promise<T | null>;
  retry: () => Promise<T | null>;
}

/**
 * Custom hook for handling API calls with consistent error handling
 */
export const useApiCall = <T,>(
  options: UseFetchOptions<T> = {}
): UseFetchReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<StandardApiError | null>(null);
  const [loading, setLoading] = useState(false);
  const { addError } = useError();

  const { onSuccess, onError, showErrorToast = true, context = "API Call" } = options;

  const execute = useCallback(
    async (fn: () => Promise<T>): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await fn();
        setData(result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const parsedError = handleApiError(err, context);
        setError(parsedError);

        // Log to error logger
        errorLogger.logError(
          `API Error: ${parsedError.message}`,
          err instanceof Error ? err : new Error(String(err)),
          context,
          { errorCode: parsedError.code, statusCode: parsedError.statusCode }
        );

        // Show toast notification if enabled
        if (showErrorToast) {
          addError(ApiErrorHandler.getDisplayMessage(parsedError), {
            title: "Error",
            type: "error",
            duration: 6000,
            dismissible: true,
          });
        }

        onError?.(parsedError);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, onError, showErrorToast, context, addError]
  );

  const lastFnRef = useCallback(() => Promise.resolve(null as T), []);
  const retry = useCallback(
    () => execute(lastFnRef) as Promise<T | null>,
    [execute, lastFnRef]
  );

  return {
    data,
    error,
    loading,
    execute,
    retry,
  };
};

/**
 * Hook for form submissions with error handling
 */
interface UseFormSubmitOptions<T> extends UseFetchOptions<T> {
  onSubmit: () => Promise<T>;
}

export const useFormSubmit = <T,>(options: UseFormSubmitOptions<T>) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<StandardApiError | null>(null);
  const { addError } = useError();

  const { onSubmit, onSuccess, onError, showErrorToast = true, context = "Form Submit" } = options;

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      setIsSubmitting(true);
      setError(null);

      try {
        const result = await onSubmit();
        onSuccess?.(result);
        return result;
      } catch (err) {
        const parsedError = handleApiError(err, context);
        setError(parsedError);

        // Log to error logger
        errorLogger.logError(
          `Form Submit Error: ${parsedError.message}`,
          err instanceof Error ? err : new Error(String(err)),
          context,
          { errorCode: parsedError.code }
        );

        // Show toast notification
        if (showErrorToast) {
          addError(ApiErrorHandler.getDisplayMessage(parsedError), {
            title: "Error",
            type: "error",
            duration: 6000,
            dismissible: true,
          });
        }

        onError?.(parsedError);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, onSuccess, onError, showErrorToast, context, addError]
  );

  return {
    isSubmitting,
    error,
    handleSubmit,
  };
};

export default useApiCall;
