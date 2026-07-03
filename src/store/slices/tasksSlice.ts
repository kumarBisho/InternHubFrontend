import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ProjectTask } from '../../types';

interface TasksState {
  items: ProjectTask[];
  currentTask: ProjectTask | null;
  loading: boolean;
  error: Error | null;
  total: number;
  currentPage: number;
  pageSize: number;
}

const initialState: TasksState = {
  items: [],
  currentTask: null,
  loading: false,
  error: null,
  total: 0,
  currentPage: 1,
  pageSize: 10,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Fetch tasks
    fetchTasksStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchTasksSuccess: (
      state,
      action: PayloadAction<{ tasks: ProjectTask[]; total: number }>
    ) => {
      state.loading = false;
      state.items = action.payload.tasks;
      state.total = action.payload.total;
      state.error = null;
    },
    fetchTasksFailure: (state, action: PayloadAction<Error>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create task
    createTaskStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createTaskSuccess: (state, action: PayloadAction<ProjectTask>) => {
      state.loading = false;
      state.items.push(action.payload);
      state.error = null;
    },
    createTaskFailure: (state, action: PayloadAction<Error>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update task
    updateTaskStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateTaskSuccess: (state, action: PayloadAction<ProjectTask>) => {
      state.loading = false;
      const index = state.items.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.currentTask?.id === action.payload.id) {
        state.currentTask = action.payload;
      }
      state.error = null;
    },
    updateTaskFailure: (state, action: PayloadAction<Error>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete task
    deleteTaskStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteTaskSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.items = state.items.filter((t) => t.id !== action.payload);
      if (state.currentTask?.id === action.payload) {
        state.currentTask = null;
      }
      state.error = null;
    },
    deleteTaskFailure: (state, action: PayloadAction<Error>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Set current task
    setCurrentTask: (state, action: PayloadAction<ProjectTask | null>) => {
      state.currentTask = action.payload;
    },

    // Set pagination
    setPagination: (
      state,
      action: PayloadAction<{ pageNumber: number; pageSize: number }>
    ) => {
      state.currentPage = action.payload.pageNumber;
      state.pageSize = action.payload.pageSize;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset
    resetTasks: () => initialState,
  },
});

export const {
  fetchTasksStart,
  fetchTasksSuccess,
  fetchTasksFailure,
  createTaskStart,
  createTaskSuccess,
  createTaskFailure,
  updateTaskStart,
  updateTaskSuccess,
  updateTaskFailure,
  deleteTaskStart,
  deleteTaskSuccess,
  deleteTaskFailure,
  setCurrentTask,
  setPagination,
  clearError,
  resetTasks,
} = tasksSlice.actions;

export default tasksSlice.reducer;
