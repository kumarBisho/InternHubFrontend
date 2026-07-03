import { useState, useCallback, useEffect } from 'react';

interface UseLocalStorageOptions {
  /** IfString true, serialize/deserialize as JSON; if false, store as-is */
  serialize?: boolean;
  /** Initial value if nothing in localStorage */
  initialValue?: any;
  /** Sync across browser tabs */
  syncData?: boolean;
}

interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
  reset: () => void;
}

/**
 * useLocalStorage Hook
 * 
 * Manages state synchronized with browser localStorage.
 * Provides cross-tab synchronization.
 * 
 * Features:
 * - ✅ Automatic localStorage persistence
 * - ✅ JSON serialization/deserialization
 * - ✅ Cross-tab synchronization via storage events
 * - ✅ Full TypeScript generic support
 * - ✅ Error handling for corrupted data
 * - ✅ Easy reset to initial value
 * - ✅ Memory leak prevention
 * 
 * @typeParam T - Type of stored value
 * @param key - localStorage key
 * @param options - Configuration options
 * @returns {UseLocalStorageReturn<T>} Value and setter methods
 * 
 * @example
 * // Simple string storage
 * const { value: theme, setValue: setTheme } = useLocalStorage<string>(
 *   'app-theme',
 *   { initialValue: 'light' }
 * );
 * 
 * const toggleTheme = () => {
 *   setTheme(prev => prev === 'light' ? 'dark' : 'light');
 * };
 * 
 * @example
 * // Complex object storage with sync
 * const { value: preferences, setValue: setPreferences } = useLocalStorage(
 *   'user-preferences',
 *   {
 *     initialValue: { notifications: true, language: 'en' },
 *     serialize: true,
 *     syncData: true  // Sync across tabs
 *   }
 * );
 * 
 * @example
 * // Usage in form
 * const { value: formData, setValue, reset } = useLocalStorage(
 *   'form-draft',
 *   { initialValue: initialFormState }
 * );
 * 
 * const handleChange = (field: string, value: any) => {
 *   setValue(prev => ({ ...prev, [field]: value }));
 * };
 * 
 * const handleReset = () => {
 *   reset();  // Reverts to initialValue
 * };
 */
export const useLocalStorage = <T = any>(
  key: string,
  options?: UseLocalStorageOptions
): UseLocalStorageReturn<T> => {
  const shouldSerialize = options?.serialize !== false;
  const initialValue = options?.initialValue as T;
  const shouldSync = options?.syncData ?? false;

  /**
   * Read from localStorage
   */
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }

      return shouldSerialize ? JSON.parse(item) : (item as any as T);
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  const [value, setValue] = useState<T>(readValue);

  /**
   * Update value and localStorage
   */
  const setValueProxy = useCallback(
    (nextValue: T | ((prev: T) => T)) => {
      try {
        // Compute new value
        const newValue = nextValue instanceof Function ? nextValue(value) : nextValue;

        // Store to localStorage
        if (typeof window !== 'undefined') {
          if (shouldSerialize) {
            window.localStorage.setItem(key, JSON.stringify(newValue));
          } else {
            window.localStorage.setItem(key, String(newValue));
          }
        }

        // Update state
        setValue(newValue);

        // Dispatch custom event for cross-tab sync
        if (shouldSync && typeof window !== 'undefined') {
          window.dispatchEvent(
            new Event('local-storage', {
              bubbles: true,
            })
          );
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, value, shouldSerialize, shouldSync]
  );

  /**
   * Remove value from localStorage
   */
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      setValue(initialValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    removeValue();
  }, [removeValue]);

  /**
   * Listen for storage changes from other tabs
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = shouldSerialize ? JSON.parse(e.newValue) : (e.newValue as any as T);
          setValue(newValue);
        } catch (error) {
          console.warn(`Error parsing storage event for key "${key}":`, error);
        }
      }
    };

    const handleCustomEvent = () => {
      const newValue = readValue();
      setValue(newValue);
    };

    if (shouldSync && typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('local-storage', handleCustomEvent);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('local-storage', handleCustomEvent);
      };
    }
    return undefined;
  }, [key, shouldSerialize, shouldSync, readValue]);

  return {
    value,
    setValue: setValueProxy,
    removeValue,
    reset,
  };
};
