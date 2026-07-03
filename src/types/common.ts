// Common utility types
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  status: AsyncStatus;
  error: Error | null;
  loading: boolean;
}

export interface PageState<T> {
  items: T[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  error: Error | null;
}

// Modal types
export interface ModalState {
  isOpen: boolean;
  title?: string;
  data?: any;
}

// Form types
export interface FormError {
  field: string;
  message: string;
}

export interface FormState {
  errors: FormError[];
  isDirty: boolean;
  isSubmitting: boolean;
  submitError?: string;
}

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;
}

// Notification types for UI
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// Filter & Sort types
export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  [key: string]: string | number | boolean | string[] | undefined;
}

// Request options
export interface RequestOptions {
  timeout?: number;
  retries?: number;
  skipInterceptors?: boolean;
  cancelToken?: any;
}

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ValueOf<T> = T[keyof T];
