import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AsyncState, AuthTokens } from '../../types';
import type { User } from '../../types';

interface AuthSliceState extends AsyncState<User> {
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
}

const initialState: AuthSliceState = {
  data: null,
  status: 'idle',
  error: null,
  loading: false,
  tokens: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login
    loginStart: (state) => {
      state.status = 'loading';
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; tokens: AuthTokens }>) => {
      state.status = 'success';
      state.loading = false;
      state.data = action.payload.user;
      state.tokens = action.payload.tokens;
      state.isAuthenticated = true;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<Error>) => {
      state.status = 'error';
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.tokens = null;
    },

    // Logout
    logout: (state) => {
      state.data = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
    },

    // Register
    registerStart: (state) => {
      state.status = 'loading';
      state.loading = true;
      state.error = null;
    },
    registerSuccess: (state, action: PayloadAction<User>) => {
      state.status = 'success';
      state.loading = false;
      state.data = action.payload;
      state.error = null;
    },
    registerFailure: (state, action: PayloadAction<Error>) => {
      state.status = 'error';
      state.loading = false;
      state.error = action.payload;
    },

    // Token refresh
    refreshTokenSuccess: (state, action: PayloadAction<AuthTokens>) => {
      state.tokens = action.payload;
    },
    refreshTokenFailure: (state) => {
      state.isAuthenticated = false;
      state.tokens = null;
      state.data = null;
    },

    // Set user (from stored data)
    setUser: (state, action: PayloadAction<User>) => {
      state.data = action.payload;
      state.isAuthenticated = true;
    },

    // Set tokens
    setTokens: (state, action: PayloadAction<AuthTokens>) => {
      state.tokens = action.payload;
      state.isAuthenticated = true;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  registerStart,
  registerSuccess,
  registerFailure,
  refreshTokenSuccess,
  refreshTokenFailure,
  setUser,
  setTokens,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
