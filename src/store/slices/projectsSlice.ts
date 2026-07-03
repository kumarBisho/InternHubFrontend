import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Project } from '../../types';

interface ProjectsState {
  items: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: Error | null;
  total: number;
  currentPage: number;
  pageSize: number;
}

const initialState: ProjectsState = {
  items: [],
  currentProject: null,
  loading: false,
  error: null,
  total: 0,
  currentPage: 1,
  pageSize: 10,
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    // Fetch projects
    fetchProjectsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchProjectsSuccess: (
      state,
      action: PayloadAction<{ projects: Project[]; total: number }>
    ) => {
      state.loading = false;
      state.items = action.payload.projects;
      state.total = action.payload.total;
      state.error = null;
    },
    fetchProjectsFailure: (state, action: PayloadAction<Error>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create project
    createProjectStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createProjectSuccess: (state, action: PayloadAction<Project>) => {
      state.loading = false;
      state.items.push(action.payload);
      state.error = null;
    },
    createProjectFailure: (state, action: PayloadAction<Error>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update project
    updateProjectStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateProjectSuccess: (state, action: PayloadAction<Project>) => {
      state.loading = false;
      const index = state.items.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.currentProject?.id === action.payload.id) {
        state.currentProject = action.payload;
      }
      state.error = null;
    },
    updateProjectFailure: (state, action: PayloadAction<Error>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete project
    deleteProjectStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteProjectSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.items = state.items.filter((p) => p.id !== action.payload);
      if (state.currentProject?.id === action.payload) {
        state.currentProject = null;
      }
      state.error = null;
    },
    deleteProjectFailure: (state, action: PayloadAction<Error>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Set current project
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload;
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
    resetProjects: () => initialState,
  },
});

export const {
  fetchProjectsStart,
  fetchProjectsSuccess,
  fetchProjectsFailure,
  createProjectStart,
  createProjectSuccess,
  createProjectFailure,
  updateProjectStart,
  updateProjectSuccess,
  updateProjectFailure,
  deleteProjectStart,
  deleteProjectSuccess,
  deleteProjectFailure,
  setCurrentProject,
  setPagination,
  clearError,
  resetProjects,
} = projectsSlice.actions;

export default projectsSlice.reducer;
