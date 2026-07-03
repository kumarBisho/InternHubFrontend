import { useEffect, useCallback } from 'react';
import { initializeTokenRefresh, clearTokenRefreshSchedule } from '@utils/tokenRefresh';
import type { TokenExpirationInfo } from '@utils/tokenRefresh';

/**
 * Custom hook for managing proactive token refresh
 * 
 * Usage:
 * ```
 * const { startTokenRefresh, stopTokenRefresh } = useTokenRefresh();
 * 
 * // After login
 * startTokenRefresh({
 *   accessTokenExpiresIn: response.accessTokenExpiresIn,
 *   refreshTokenExpiresIn: response.refreshTokenExpiresIn
 * });
 * ```
 */
export const useTokenRefresh = () => {
  // Start token refresh management
  const startTokenRefresh = useCallback((expirationInfo: TokenExpirationInfo) => {
    initializeTokenRefresh(expirationInfo);
  }, []);

  // Stop token refresh management
  const stopTokenRefresh = useCallback(() => {
    clearTokenRefreshSchedule();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup is handled manually when user logs out
    };
  }, []);

  return { startTokenRefresh, stopTokenRefresh };
};
