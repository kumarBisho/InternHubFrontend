// Export reducers
export { default as authReducer } from './authSlice';
export { default as projectsReducer } from './projectsSlice';
export { default as tasksReducer } from './tasksSlice';
export { default as notificationsReducer } from './notificationsSlice';
export { default as usersReducer } from './usersSlice';

// Export auth actions only
export {
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
  clearError as authClearError,
} from './authSlice';

// Export project actions
export {
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
  setPagination as projectSetPagination,
  clearError as projectClearError,
  resetProjects,
} from './projectsSlice';

// Export task actions
export {
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
  setPagination as taskSetPagination,
  clearError as taskClearError,
  resetTasks,
} from './tasksSlice';

// Export notification actions
export {
  fetchNotificationsStart,
  fetchNotificationsSuccess,
  fetchNotificationsFailure,
  addNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearNotifications,
  clearError as notificationClearError,
} from './notificationsSlice';

// Export user actions
export {
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
  clearError as userClearError,
  resetUsers,
} from './usersSlice';

