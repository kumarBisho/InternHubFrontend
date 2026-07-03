import { useState, useCallback, useRef, useEffect } from 'react';

interface AsyncState<T> {
  status: 'idle' | 'pending' | 'success' | 'error';
  data: T | null;
  error: Error | null;
}

interface UseAsyncOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  onFinally?: () => void;
}

interface UseAsyncReturn<T> extends AsyncState<T> {
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
}

/**
 * useAsync Hook
 * 
 * Generic async operation handler with proper error handling and state management.
 * More flexible than useFetch - works with any async function.
 * 
 * Features:
 * - ✅ Full TypeScript generic support
 * - ✅ Status tracking (idle, pending, success, error)
 * - ✅ Error handling with proper typing
 * - ✅ Memory leak prevention
 * - ✅ Success/error callbacks
 * - ✅ Promise-based execute function
 * - ✅ Reset capability
 * 
 * @typeParam T - Type of async operation result
 * @typeParam A - Type of arguments array
 * @param asyncFunction - Async function to execute
 * @param options - Callback options
 * @returns {UseAsyncReturn<T>} Async state and execute method
 * 
 * @example
 * // Basic usage
 * const { data, status, error, execute } = useAsync(
 *   async (userId: string) => {
 *     const response = await api.get(`/users/${userId}`);
 *     return response.data;
 *   }
 * );
 * 
 * const handleClick = async () => {
 *   try {
 *     await execute('user-123');
 *   } catch (error) {
 *     console.error('Failed:', error);
 *   }
 * };
 * 
 * @example
 * // With callbacks
 * const { data, execute, reset } = useAsync(
 *   async (projectId: string) => projectService.getProject(projectId),
 *   {
 *     onSuccess: (data) => console.log('Loaded:', data),
 *     onError: (error) => setErrorMessage(error.message),
 *     onFinally: () => setIsLoading(false)
 *   }
 * );
 */
export const useAsync = <T, A extends any[] = []>(
  asyncFunction: (...args: A) => Promise<T>,
  options?: UseAsyncOptions<T>
): UseAsyncReturn<T> => {
  const [state, setState] = useState<AsyncState<T>>({
    status: 'idle',
    data: null,
    error: null,
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Execute the async function
   */
  const execute = useCallback(
    async (...args: A) => {
      if (!isMountedRef.current) {
        throw new Error('Component unmounted');
      }

      setState({ status: 'pending', data: null, error: null });

      try {
        const result = await asyncFunction(...args);

        if (isMountedRef.current) {
          setState({ status: 'success', data: result, error: null });
          options?.onSuccess?.(result);
        }

        return result;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));

        if (isMountedRef.current) {
          setState({ status: 'error', data: null, error: errorObj });
          options?.onError?.(errorObj);
        }

        throw errorObj;
      } finally {
        if (isMountedRef.current) {
          options?.onFinally?.();
        }
      }
    },
    [asyncFunction, options]
  );

  /**
   * Reset to idle state
   */
  const reset = useCallback(() => {
    setState({ status: 'idle', data: null, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
};
