// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env['VITE_API_BASE_URL'] || 'http://localhost:5248/api',
  TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  DEFAULT_PAGE: 1,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50],
};

// Project Status
export const PROJECT_STATUS = {
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  ON_HOLD: 'On Hold',
  ARCHIVED: 'Archived',
} as const;

// Task Status
export const TASK_STATUS = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  COMPLETED: 'Completed',
} as const;

// Task Priority
export const TASK_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'Admin',
  MENTOR: 'Mentor',
  INTERN: 'Intern',
  MANAGER: 'Manager',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  TASK: 'Task',
  PROJECT: 'Project',
  MESSAGE: 'Message',
  SYSTEM: 'System',
  COMMENT: 'Comment',
} as const;

// Toast Messages Duration
export const TOAST_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 7000,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  PREFERENCES: 'userPreferences',
  THEME: 'theme',
};

// Default Values
export const DEFAULTS = {
  AVATAR_URL: '/api/assets/default-avatar.jpg',
  PROJECT_IMAGE: '/api/assets/default-project.jpg',
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh-token',
  
  // Projects
  PROJECTS: '/projects',
  PROJECT_DETAILS: (id: string) => `/projects/${id}`,
  
  // Tasks
  TASKS: '/tasks',
  TASK_DETAILS: (id: string) => `/tasks/${id}`,
  
  // Users
  USERS: '/users',
  USER_PROFILE: '/users/profile',
  
  // Notifications
  NOTIFICATIONS: '/notifications',
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  API: 'yyyy-MM-dd',
  TIME: 'HH:mm:ss',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Successfully created.',
  UPDATED: 'Successfully updated.',
  DELETED: 'Successfully deleted.',
  LOGGED_IN: 'Logged in successfully.',
  LOGGED_OUT: 'Logged out successfully.',
};
