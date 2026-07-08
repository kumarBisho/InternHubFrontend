import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import { scheduleTokenRefresh } from '../utils/tokenRefresh';

const API_BASE_URL = import.meta.env['VITE_API_URL'] || 'https://internhubbackend-h4qp.onrender.com';
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if refresh is in progress to prevent multiple simultaneous refresh requests
let isRefreshing = false;
let failedQueue: Array<{
  onSuccess: (token: string) => void;
  onError: (error: AxiosError) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.onError(error);
    } else if (token) {
      prom.onSuccess(token);
    }
  });
  failedQueue = [];
};

// Request interceptor: Add token to headers and setup retry logic
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Initialize retry count
  if (!config.headers['X-Retry-Count']) {
    config.headers['X-Retry-Count'] = '0';
  }
  
  if (import.meta.env.DEV) {
    console.debug(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  }
  
  return config;
});

// Response interceptor: Handle token refresh on 401 and implement retry logic
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.debug(`[API] Response ${response.status} from ${response.config.url}`);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    const retryCount = parseInt(originalRequest.headers['X-Retry-Count'] || '0', 10);

    // Handle timeout and network errors with retry
    if (
      error.message === 'Network Error' ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ETIMEDOUT'
    ) {
      if (retryCount < MAX_RETRIES) {
        originalRequest.headers['X-Retry-Count'] = (retryCount + 1).toString();
        // Exponential backoff
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return api(originalRequest);
      }
    }

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            onSuccess: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            onError: (err: AxiosError) => {
              reject(err);
            },
          });
        });
      }

      // Mark as retried to prevent infinite loops
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh token endpoint
        const response = await axios.post(
          `${API_BASE_URL}/Auth/refresh-token`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const { accessToken, refreshToken: newRefreshToken, accessTokenExpiresIn, refreshTokenExpiresIn } = response.data;

        // Update tokens in storage
        localStorage.setItem('accessToken', accessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        // Update Authorization header
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Schedule next refresh if expiration info is available
        if (accessTokenExpiresIn && refreshTokenExpiresIn) {
          console.log('[API] Scheduling next token refresh after interceptor refresh');
          scheduleTokenRefresh({
            accessTokenExpiresIn,
            refreshTokenExpiresIn,
          });
        }

        // Process queued requests
        isRefreshing = false;
        processQueue(null, accessToken);

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token is invalid or expired
        console.error('Token refresh failed:', refreshError);
        
        // Clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        isRefreshing = false;
        processQueue(error, null);
        
        // Redirect to login page
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Log API errors in development
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (import.meta.env.DEV) {
      console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        message: error.message,
      });
    }
    return Promise.reject(error);
  }
);

export default api;
