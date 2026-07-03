import api from './api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  accessTokenExpiresIn?: number;
  refreshTokenExpiresIn?: number;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

const authService = {
  register: async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    roleId: number = 3
  ): Promise<void> => {
    try {
      const response = await api.post('/Auth/register', {
        email,
        password,
        firstName,
        lastName,
        roleId: roleId || 3, // Default roleId to 3 (Intern role)
      });
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || error.response?.data || error.message || 'Registration failed';
      throw typeof message === 'string' ? message : JSON.stringify(message);
    }
  },

  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await api.post('/Auth/login', {
        email,
        password,
      });
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      const errorData = error.response?.data;
      const status = error.response?.status;

      // Handle specific error statuses
      if (status === 400 && errorData) {
        // 400 Bad Request - account verification/approval/inactive issues
        throw {
          message: errorData.message || 'Login failed',
          details: errorData.details || '',
        };
      }

      if (status === 401) {
        // 401 Unauthorized - invalid credentials
        throw {
          message: 'Invalid email or password',
          details: 'Please check your credentials and try again.',
        };
      }

      if (status === 500) {
        // 500 Server Error - might be verification related
        throw {
          message: 'Account verification required',
          details: 'Your account needs to be verified before you can log in. Please check your email for the verification link.',
        };
      }

      // Generic error handling
      if (errorData && typeof errorData === 'object') {
        throw {
          message: errorData.message || 'Login failed',
          details: errorData.details || '',
        };
      }

      throw {
        message: error.message || 'Login failed',
        details: 'Please try again or contact support.',
      };
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/Auth/logout');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    } catch (error: any) {
      console.error('Logout error:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      throw error.response?.data?.message || 'Logout failed';
    }
  },

  confirmEmail: async (token: string): Promise<void> => {
    try {
      const response = await api.get(`/Auth/confirm-email?token=${token}`);
      return response.data;
    } catch (error: any) {
      console.error('Email confirmation error:', error);
      throw error.response?.data?.message || 'Email confirmation failed';
    }
  },

  getCurrentUser: (): User | null => {
    const user = localStorage.getItem('user');
    const parsedUser = user ? JSON.parse(user) : null;
    if (parsedUser) {
      console.log("=== GET CURRENT USER ===");
      console.log("User from localStorage:", parsedUser);
      console.log("User ID:", parsedUser.id);
      console.log("User ID Type:", typeof parsedUser.id);
      console.log("========================");
    }
    return parsedUser;
  },

  getUser: (): User | null => {
    return authService.getCurrentUser();
  },

  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem('refreshToken');
  },

  refreshToken: async (): Promise<RefreshTokenResponse> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/Auth/refresh-token', { refreshToken });
      
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
      }

      return response.data;
    } catch (error: any) {
      console.error('Token refresh error:', error);
      // Clear auth data if refresh fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      throw error.response?.data?.message || 'Token refresh failed';
    }
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('accessToken');
  },

  forgotPassword: async (email: string): Promise<void> => {
    try {
      const response = await api.post('/Auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      console.error('Forgot password error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to send password reset email';
      throw typeof message === 'string' ? message : JSON.stringify(message);
    }
  },

  resetPassword: async (token: string, newPassword: string, confirmPassword: string): Promise<void> => {
    try {
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      const response = await api.post('/Auth/reset-password', {
        token,
        newPassword,
        confirmPassword,
      });
      return response.data;
    } catch (error: any) {
      console.error('Reset password error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to reset password';
      throw typeof message === 'string' ? message : JSON.stringify(message);
    }
  },

  validateResetToken: async (token: string): Promise<{ message: string; email: string }> => {
    try {
      const response = await api.get(`/Auth/validate-reset-token?token=${token}`);
      return response.data;
    } catch (error: any) {
      console.error('Token validation error:', error);
      const message = error.response?.data?.message || error.message || 'Invalid or expired token';
      throw typeof message === 'string' ? message : JSON.stringify(message);
    }
  },
};

export default authService;
