// Environment configuration for development, staging, and production

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Base API URL based on environment
const getApiUrl = (): string => {
  if (isDevelopment) {
    return import.meta.env['VITE_API_URL'] || 'http://localhost:5248';
  }
  return import.meta.env['VITE_API_URL'] || 'https://internhubbackend-h4qp.onrender.com';
};

// SignalR Hub URL
const getSignalRUrl = (): string => {
  const baseUrl = getApiUrl();
  return `${baseUrl}/hubs`;
};

export const config = {
  isDevelopment,
  isProduction,
  apiUrl: getApiUrl(),
  signalRUrl: getSignalRUrl(),
  apiEndpoints: {
    collaboration: `${getApiUrl()}/api/collaboration`,
    search: `${getApiUrl()}/api/search`,
    analytics: `${getApiUrl()}/api/analytics`,
    auth: `${getApiUrl()}/api/auth`,
    notifications: `${getApiUrl()}/api/notifications`,
  },
  signalrHubs: {
    notifications: `${getSignalRUrl()}/notifications`,
    collaboration: `${getSignalRUrl()}/collaboration`,
  },
  timeouts: {
    api: 30000,
    signalR: 10000,
  },
};

export default config;
