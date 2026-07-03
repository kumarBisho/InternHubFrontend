import { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  registerStart,
  registerSuccess,
  registerFailure,
  setUser,
  setTokens,
  authClearError,
} from '../store/slices';
import authService from '../services/authService';
import { useTokenRefresh } from './useTokenRefresh';
import type { AuthTokens, User } from '../types';

interface UseAuthReturn {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<{ user: User; tokens: AuthTokens }>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<User>;
  logout: () => void;
  clearError: () => void;
}

/**
 * useAuth Hook
 * 
 * Manages authentication state including login, register, logout, and token management.
 * Automatically restores auth state from localStorage on mount.
 * 
 * Features:
 * - ✅ Proper dependency arrays (prevents memory leaks)
 * - ✅ Error handling with typed errors
 * - ✅ Loading state management
 * - ✅ localStorage persistence
 * - ✅ Memory leak prevention with ref tracking
 * 
 * @returns {UseAuthReturn} Auth state and methods
 * 
 * @example
 * const { user, isAuthenticated, login, logout } = useAuth();
 * 
 * const handleLogin = async () => {
 *   try {
 *     await login('user@example.com', 'password');
 *   } catch (error) {
 *     console.error('Login failed:', error);
 *   }
 * };
 */
export const useAuth = (): UseAuthReturn => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const isInitializedRef = useRef(false);
  const { startTokenRefresh, stopTokenRefresh } = useTokenRefresh();

  // Initialize auth from localStorage on mount (only once)
  useEffect(() => {
    // Prevent double-initialization in React StrictMode
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const user = JSON.parse(storedUser) as User;
        const tokens: AuthTokens = {
          accessToken: storedToken,
          refreshToken: localStorage.getItem('refreshToken') || '',
          expiresIn: 900,
        };
        dispatch(setUser(user));
        dispatch(setTokens(tokens));
      } catch (error) {
        console.error('Failed to restore auth from storage:', error);
        // Clear corrupted storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    }
    // Empty dependency array - runs only once
  }, []);

  /**
   * Login with email and password
   * 
   * @param email User email
   * @param password User password
   * @returns Promise with user and tokens
   * @throws Error if login fails
   */
  const login = useCallback(
    async (email: string, password: string) => {
      dispatch(loginStart());
      try {
        const response = (await authService.login(email, password)) as any;
        const user: User = response.user || response;
        const tokens: AuthTokens = {
          accessToken: response.accessToken || response.token || '',
          refreshToken: response.refreshToken || '',
          expiresIn: response.accessTokenExpiresIn ? (response.accessTokenExpiresIn - Math.floor(Date.now() / 1000)) : 900,
        };
        dispatch(loginSuccess({ user, tokens }));
        
        // Initialize proactive token refresh
        if (response.accessTokenExpiresIn && response.refreshTokenExpiresIn) {
          const loginTime = new Date().toLocaleTimeString();
          const accessExpiryTime = new Date(response.accessTokenExpiresIn * 1000).toLocaleTimeString();
          const refreshExpiryTime = new Date(response.refreshTokenExpiresIn * 1000).toLocaleTimeString();
          
          console.log(
            `[useAuth] ✅ LOGIN SUCCESSFUL at ${loginTime}\n` +
            `          User: ${user.email}\n` +
            `          Access Token:   expires at ${accessExpiryTime} (14 minutes)\n` +
            `          Refresh Token:  expires at ${refreshExpiryTime} (7 days)\n` +
            `          🔄 Starting 14-minute refresh cycle...`
          );
          startTokenRefresh({
            accessTokenExpiresIn: response.accessTokenExpiresIn,
            refreshTokenExpiresIn: response.refreshTokenExpiresIn,
          });
        }
        
        return { user, tokens };
      } catch (error: any) {
        const authError = error instanceof Error ? error : new Error(String(error));
        dispatch(loginFailure(authError));
        throw authError;
      }
    },
    [dispatch, startTokenRefresh]
  );

  /**
   * Register new user account
   * 
   * @param email User email
   * @param password User password
   * @param firstName First name
   * @param lastName Last name
   * @returns Promise with created user
   * @throws Error if registration fails
   */
  const register = useCallback(
    async (email: string, password: string, firstName: string, lastName: string) => {
      dispatch(registerStart());
      try {
        const response = (await authService.register(email, password, firstName, lastName)) as any;
        const user: User = response.user || response;
        dispatch(registerSuccess(user));
        return user;
      } catch (error: any) {
        const authError = error instanceof Error ? error : new Error(String(error));
        dispatch(registerFailure(authError));
        throw authError;
      }
    },
    [dispatch]
  );

  /**
   * Logout current user
   * Clears auth state and localStorage
   */
  const handleLogout = useCallback(() => {
    authService.logout();
    stopTokenRefresh();
    dispatch(logout());
  }, [dispatch, stopTokenRefresh]);

  /**
   * Clear any auth errors
   */
  const handleClearError = useCallback(() => {
    dispatch(authClearError());
  }, [dispatch]);

  return {
    user: auth.data || null,
    tokens: auth.tokens || null,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.loading,
    error: auth.error,
    login,
    register,
    logout: handleLogout,
    clearError: handleClearError,
  };
};
