// User related types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  profilePicture?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  userId: string;
  phone?: string;
  department?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  experience?: string;
}

// Project related types
export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'Active' | 'Completed' | 'On Hold' | 'Archived';
  startDate: string;
  endDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  assignments?: ProjectAssignment[];
  tasks?: ProjectTask[];
  mentorId?: string;
}

export interface ProjectAssignment {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  assignedAt: string;
  user?: User;
}

// Task related types
export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'In Review' | 'Completed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  dueDate?: string;
  createdAt: string;
  updatedAt?: string;
  assignments?: ProjectTaskAssignment[];
  comments?: CollaborativeComment[];
}

export interface ProjectTaskAssignment {
  id: string;
  taskId: string;
  userId: string;
  assignedAt: string;
  user?: User;
}

// Activity & Collaboration types
export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
  user?: User;
  details?: Record<string, any>;
}

export interface CollaborativeComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  user?: User;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: 'Task' | 'Project' | 'Message' | 'System' | 'Comment';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedResourceId?: string;
  relatedResourceType?: string;
}

// Dashboard types
export interface DashboardData {
  activeProjects: number;
  completedProjects: number;
  assignedTasks: number;
  completedTasks: number;
  overdueTasks: number;
  recentActivities: ActivityLog[];
  upcomingTasks: ProjectTask[];
}

export interface AnalyticsData {
  projectsCreated: number;
  tasksCompleted: number;
  collaborators: number;
  hoursWorked?: number;
  completionRate?: number;
  timeSeriesData?: TimeSeriesPoint[];
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
  label?: string;
}

// Search types
export interface SearchResult<T = any> {
  id: string;
  title: string;
  description?: string;
  type: 'project' | 'task' | 'user';
  relevance: number;
  data: T;
}

export interface SearchFilters {
  query: string;
  type?: 'project' | 'task' | 'user';
  status?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

// Presence & Collaboration types
export interface UserPresence {
  userId: string;
  user: User;
  status: 'online' | 'away' | 'offline';
  lastSeen: string;
  currentResource?: string;
}

export interface PresenceUpdate {
  userId: string;
  status: 'online' | 'away' | 'offline';
  currentResource?: string;
}

// Feedback types
export interface Feedback {
  id: string;
  mentorId: string;
  mentorName: string;
  internId: string;
  internName: string;
  title: string;
  content: string;
  type: 'TaskFeedback' | 'ProjectFeedback' | 'GeneralFeedback';
  taskId?: string;
  taskTitle?: string;
  projectId?: string;
  projectTitle?: string;
  rating?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface FeedbackListItem {
  id: string;
  mentorName: string;
  title: string;
  type: 'TaskFeedback' | 'ProjectFeedback' | 'GeneralFeedback';
  rating?: number;
  createdAt: string;
  isUnread: boolean;
}

export interface CreateFeedbackRequest {
  internId: string;
  title: string;
  content: string;
  type: 'TaskFeedback' | 'ProjectFeedback' | 'GeneralFeedback';
  taskId?: string;
  projectId?: string;
  rating?: number;
}

export interface UpdateFeedbackRequest {
  title: string;
  content: string;
  rating?: number;
}

export interface PaginatedFeedback {
  items: FeedbackListItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages?: number;
}
