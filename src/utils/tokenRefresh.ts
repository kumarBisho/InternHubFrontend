/**
 * Token Refresh Management Utility
 * 
 * Handles proactive token refresh to keep users logged in for the full refresh token lifetime
 * instead of just for the access token lifetime.
 * 
 * Standard Implementation:
 * - Access token: 15 minutes
 * - Refresh token: 7 days
 * - Proactive refresh: 1 minute before access token expires
 * - User stays logged in for 7 days (not kicked out at 15 minutes)
 */

let refreshTimeout: number | null = null;

export interface TokenExpirationInfo {
  accessTokenExpiresIn: number; // Unix timestamp in seconds
  refreshTokenExpiresIn: number; // Unix timestamp in seconds
}

/**
 * Schedules automatic token refresh
 * Refreshes the access token 1 minute before it expires
 */
export const scheduleTokenRefresh = (expirationInfo: TokenExpirationInfo) => {
  // Clear any existing timeout
  clearTokenRefreshSchedule();

  const now = Date.now() / 1000; // Current time in seconds
  const accessTokenExpiresAt = expirationInfo.accessTokenExpiresIn;
  const timeUntilExpiry = accessTokenExpiresAt - now;

  // Refresh 1 minute (60 seconds) before expiry, minimum 10 seconds
  const refreshBuffer = Math.max(60, 10); // 60 seconds before token expires
  const timeUntilRefresh = timeUntilExpiry - refreshBuffer;

  const currentTime = new Date().toLocaleTimeString();
  const refreshTime = new Date(Date.now() + timeUntilRefresh * 1000).toLocaleTimeString();
  const expiryTime = new Date(accessTokenExpiresAt * 1000).toLocaleTimeString();

  if (timeUntilRefresh <= 0) {
    // Token expires very soon, refresh immediately
    console.warn('[Token] ⚠️ Access token expires in less than 1 minute, refreshing immediately');
    refreshAccessToken();
    return;
  }

  console.log(
    `[Token] 🔄 SCHEDULING TOKEN REFRESH\n` +
    `        Current Time:    ${currentTime}\n` +
    `        Refresh At:      ${refreshTime} (in ${Math.round(timeUntilRefresh / 60)} minutes)\n` +
    `        Token Expires:   ${expiryTime} (in ${Math.round(timeUntilExpiry / 60)} minutes)\n` +
    `        ➜ Next refresh cycle starts every ~14 minutes for 7 days`
  );

  refreshTimeout = setTimeout(() => {
    const triggerTime = new Date().toLocaleTimeString();
    console.log(`[Token] ✅ REFRESH TRIGGERED at ${triggerTime} - fetching new access token...`);
    refreshAccessToken();
  }, timeUntilRefresh * 1000);
};

/**
 * Clears the token refresh schedule
 */
export const clearTokenRefreshSchedule = () => {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
    refreshTimeout = null;
    console.debug('[Token] Token refresh schedule cleared');
  }
};

/**
 * Performs the actual token refresh
 */
const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      console.warn('[Token] No refresh token available, redirecting to login');
      handleTokenExpired();
      return;
    }

    const response = await fetch(
      `${import.meta.env['VITE_API_BASE_URL'] || 'http://localhost:5248/api'}/Auth/refresh-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      }
    );

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const data = await response.json();
    const { accessToken, refreshToken: newRefreshToken, accessTokenExpiresIn, refreshTokenExpiresIn } = data;

    // Update tokens in localStorage
    localStorage.setItem('accessToken', accessToken);
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }

    const refreshCompletedTime = new Date().toLocaleTimeString();
    console.log(
      `[Token] ✅ TOKEN REFRESH SUCCESSFUL at ${refreshCompletedTime}\n` +
      `        New Access Token:  Valid for 14 minutes\n` +
      `        New Refresh Token: Valid for 7 days\n` +
      `        📍 Rescheduling next refresh...`
    );

    // Schedule next refresh
    if (accessTokenExpiresIn && refreshTokenExpiresIn) {
      scheduleTokenRefresh({
        accessTokenExpiresIn,
        refreshTokenExpiresIn,
      });
    }

    // Dispatch event to notify listeners (e.g., API client)
    window.dispatchEvent(
      new CustomEvent('tokenRefreshed', {
        detail: { accessToken, refreshToken: newRefreshToken },
      })
    );
  } catch (error) {
    console.error('[Token] Automatic token refresh failed:', error);
    // On refresh failure, token is likely expired, redirect to login
    handleTokenExpired();
  }
};

/**
 * Handles token expiration - clears tokens and redirects to login
 */
export const handleTokenExpired = () => {
  console.warn('[Token] Token expired or refresh failed, logging out');
  clearTokenRefreshSchedule();
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

/**
 * Initializes token refresh management
 * Call this after successful login
 */
export const initializeTokenRefresh = (expirationInfo: TokenExpirationInfo) => {
  console.log('[Token] Initializing token refresh management');
  scheduleTokenRefresh(expirationInfo);
};
