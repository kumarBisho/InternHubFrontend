import api from './api';

export interface TaskSearchResult {
  taskId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  projectId: string;
  projectTitle: string;
  endDate: string;
  createdAt: string;
}

export interface ProjectSearchResult {
  projectId: string;
  title: string;
  description: string;
  status: string;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  createdAt: string;
}

export interface UserSearchResult {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  emailConfirmed: boolean;
  createdAt: string;
}

export interface PaginatedResults<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GlobalSearchResult {
  tasks: TaskSearchResult[];
  projects: ProjectSearchResult[];
  users: UserSearchResult[];
}

export interface TaskSearchRequest {
  searchQuery?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface ProjectSearchRequest {
  searchQuery?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  techStack?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface UserSearchRequest {
  searchQuery?: string;
  role?: string;
  isActive?: boolean;
  emailConfirmed?: boolean;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDescending?: boolean;
}

class SearchService {
  private baseUrl = '/search';

  async searchTasks(
    request: TaskSearchRequest
  ): Promise<PaginatedResults<TaskSearchResult>> {
    const response = await api.post<PaginatedResults<TaskSearchResult>>(
      `${this.baseUrl}/tasks`,
      request
    );
    return response.data;
  }

  async searchProjects(
    request: ProjectSearchRequest
  ): Promise<PaginatedResults<ProjectSearchResult>> {
    const response = await api.post<PaginatedResults<ProjectSearchResult>>(
      `${this.baseUrl}/projects`,
      request
    );
    return response.data;
  }

  async searchUsers(
    request: UserSearchRequest
  ): Promise<PaginatedResults<UserSearchResult>> {
    const response = await api.post<PaginatedResults<UserSearchResult>>(
      `${this.baseUrl}/users`,
      request
    );
    return response.data;
  }

  async globalSearch(query: string): Promise<GlobalSearchResult> {
    const response = await api.post<GlobalSearchResult>(
      `${this.baseUrl}/global`,
      {
        searchQuery: query,
        searchIn: ['tasks', 'projects', 'users'],
        pageSize: 10
      }
    );
    return response.data;
  }

  async quickSearch(query: string): Promise<GlobalSearchResult> {
    const response = await api.get<GlobalSearchResult>(
      `${this.baseUrl}/quick`,
      { params: { query } }
    );
    return response.data;
  }
}

export default new SearchService();
