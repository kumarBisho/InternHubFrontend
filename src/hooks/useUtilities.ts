import { useEffect, useRef, useState } from 'react';

/**
 * useDebounce Hook
 * 
 * Debounces a value, only updating after a delay without changes.
 * Useful for search inputs, API calls on value change, etc.
 * 
 * Features:
 * - ✅ Generic type support
 * - ✅ Configurable delay
 * - ✅ Prevents frequent updates
 * - ✅ Perfect for search inputs
 * - ✅ Cleanup on unmount
 * 
 * @typeParam T - Type of debounced value
 * @param value - Value to debounce
 * @param delay - Debounce delay in milliseconds
 * @returns {T} Debounced value
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 300);
 * 
 * useEffect(() => {
 *   // Only search when debounced term changes
 *   if (debouncedSearchTerm) {
 *     searchUsers(debouncedSearchTerm);
 *   }
 * }, [debouncedSearchTerm]);
 */
export const useDebounce = <T,>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * usePrevious Hook
 * 
 * Stores the previous value of a prop or state.
 * Useful for detecting changes or comparing current vs previous.
 * 
 * Features:
 * - ✅ Full TypeScript support
 * - ✅ Tracks any type of value
 * - ✅ Minimal memory overhead
 * - ✅ Perfect for detecting changes
 * 
 * @typeParam T - Type of value being tracked
 * @param value - Current value
 * @returns {T | undefined} Previous value or undefined on first render
 * 
 * @example
 * const { count } = props;
 * const prevCount = usePrevious(count);
 * 
 * useEffect(() => {
 *   if (prevCount !== count) {
 *     console.log(`Count changed from ${prevCount} to ${count}`);
 *   }
 * }, [count, prevCount]);
 */
export const usePrevious = <T,>(value: T): T | undefined => {
  const ref = useRef<T>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

/**
 * useEffectOnce Hook
 * 
 * Runs an effect function only once when component mounts.
 * Shorthand for useEffect with empty dependency array.
 * 
 * Features:
 * - ✅ Executes only once on mount
 * - ✅ Supports cleanup function
 * - ✅ Cleaner syntax than useEffect
 * - ✅ Prevents accidental multiple executions
 * 
 * @param effect - Effect function to run once
 * @param cleanup - Optional cleanup function
 * 
 * @example
 * useEffectOnce(() => {
 *   console.log('Component mounted');
 *   
 *   return () => {
 *     console.log('Component unmounting');
 *   };
 * });
 */
export const useEffectOnce = (
  effect: () => void | (() => void),
  cleanup?: () => void
): void => {
  useEffect(() => {
    const cleanupFn = effect();

    return () => {
      if (typeof cleanupFn === 'function') {
        cleanupFn();
      }
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

/**
 * useMount Hook
 * 
 * Executes a function when component mounts.
 * 
 * Features:
 * - ✅ Clear intent - "run on mount"
 * - ✅ Cleaner than useEffect
 * - ✅ No accidental reruns
 * 
 * @param callback - Function to run on mount
 * 
 * @example
 * useMount(() => {
 *   console.log('Component mounted');
 *   fetchInitialData();
 * });
 */
export const useMount = (callback: (() => void) | (() => () => void)): void => {
  useEffectOnce(callback);
};

/**
 * useUnmount Hook
 * 
 * Executes a function when component unmounts.
 * Perfect for cleanup operations.
 * 
 * Features:
 * - ✅ Clear intent - "cleanup on unmount"
 * - ✅ Cleaner than useEffect
 * - ✅ Dedicated cleanup function
 * 
 * @param callback - Function to run on unmount
 * 
 * @example
 * useUnmount(() => {
 *   // Cancel subscriptions
 *   unsubscribe();
 * });
 */
export const useUnmount = (callback: () => void): void => {
  useEffectOnce(() => {
    return callback;
  });
};

/**
 * useIsMounted Hook
 * 
 * Returns whether component is currently mounted.
 * Useful for async operations that shouldn't update unmounted components.
 * 
 * Features:
 * - ✅ Prevents memory leak warnings
 * - ✅ Safe for async operations
 * - ✅ Prevents state updates on unmounted components
 * 
 * @returns {() => boolean} Function that returns current mounted state
 * 
 * @example
 * const isMounted = useIsMounted();
 * 
 * const fetchData = async () => {
 *   const data = await api.fetch();
 *   // Only update state if still mounted
 *   if (isMounted()) {
 *     setData(data);
 *   }
 * };
 */
export const useIsMounted = (): (() => boolean) => {
  const isMountedRef = useRef(true);

  useEffectOnce(() => {
    return () => {
      isMountedRef.current = false;
    };
  });

  return () => isMountedRef.current;
};

/**
 * useToggle Hook
 * 
 * Manages a boolean state that can be toggled.
 * Perfect for UI toggles, modals, dropdowns, etc.
 * 
 * Features:
 * - ✅ Simple boolean management
 * - ✅ Convenient toggle method
 * - ✅ Set to specific value
 * - ✅ Reset to initial
 * 
 * @param initialValue - Initial boolean value
 * @returns {Object} Current value and control methods
 * 
 * @example
 * const { value: isOpen, toggle, set } = useToggle(false);
 * 
 * return (
 *   <>
 *     <button onClick={toggle}>
 *       {isOpen ? 'Close' : 'Open'} Menu
 *     </button>
 *     {isOpen && <Menu />}
 *   </>
 * );
 */
export const useToggle = (initialValue: boolean = false) => {
  const [value, setValue] = useState(initialValue);

  const toggle = () => setValue(prev => !prev);
  const set = (newValue: boolean) => setValue(newValue);
  const reset = () => setValue(initialValue);

  return { value, toggle, set, reset };
};

/**
 * useUpdateEffect Hook
 * 
 * Like useEffect but skips the first render.
 * Useful for effects that shouldn't run on mount.
 * 
 * Features:
 * - ✅ Skips initial render
 * - ✅ Runs on dependency changes
 * - ✅ Prevents unintended side effects on mount
 * 
 * @param effect - Effect function
 * @param dependencies - Dependency array
 * 
 * @example
 * useUpdateEffect(() => {
 *   // This runs when count changes, but NOT on mount
 *   console.log(`Count updated to: ${count}`);
 * }, [count]);
 */
export const useUpdateEffect = (
  effect: () => void | (() => void),
  dependencies: React.DependencyList
): void => {
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    const cleanup = effect();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
};
