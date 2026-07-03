import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';

interface UsersState {
  items: User[];
  currentUser: User | null;
  loading: boolean;
  error: Error | null;
  total: number;
}

const initialState: UsersState = {
  items: [],
  currentUser: null,
  loading: false,
  error: null,
  total: 0,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // Fetch users
    fetchUsersStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchUsersSuccess: (state, action: PayloadAction<{ users: User[]; total: number }>) => {
      state.loading = false;
      state.items = action.payload.users;
      state.total = action.payload.total;
      state.error = null;
    },
    fetchUsersFailure: (state, action: PayloadAction<Error>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch user details
    fetchUserStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchUserSuccess: (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.currentUser = action.payload;
      state.error = null;
    },
    fetchUserFailure: (state, action: PayloadAction<Error>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update user
    updateUserStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateUserSuccess: (state, action: PayloadAction<User>) => {
      state.loading = false;
      const index = state.items.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.currentUser?.id === action.payload.id) {
        state.currentUser = action.payload;
      }
      state.error = null;
    },
    updateUserFailure: (state, action: PayloadAction<Error>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete user
    deleteUserStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteUserSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.items = state.items.filter((u) => u.id !== action.payload);
      if (state.currentUser?.id === action.payload) {
        state.currentUser = null;
      }
      state.error = null;
    },
    deleteUserFailure: (state, action: PayloadAction<Error>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Set current user
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset
    resetUsers: () => initialState,
  },
});

export const {
  fetchUsersStart,
  fetchUsersSuccess,
  fetchUsersFailure,
  fetchUserStart,
  fetchUserSuccess,
  fetchUserFailure,
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  setCurrentUser,
  clearError,
  resetUsers,
} = usersSlice.actions;

export default usersSlice.reducer;
