import api from './api';

export interface TaskCompletionTrend {
  date: string;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  totalTasks: number;
  completionRate: number;
}

export interface ProjectProgress {
  projectId: string;
  projectTitle: string;
  status: string;
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
  startDate: string;
  endDate: string | null;
  assignedInterns: number;
}

export interface InternPerformance {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  totalTasksAssigned: number;
  tasksCompleted: number;
  tasksPending: number;
  completionRate: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  performanceScore: number;
}

export interface TeamPerformance {
  totalInterns: number;
  totalTasksAssigned: number;
  tasksCompleted: number;
  tasksPending: number;
  overallCompletionRate: number;
  averageInternPerformance: number;
  onTimeCount: number;
  lateCount: number;
  averageTaskDuration: number;
}

export interface AnalyticsDashboard {
  teamPerformance: TeamPerformance;
  projectsProgress: ProjectProgress[];
  internPerformance: InternPerformance[];
  completionTrends: TaskCompletionTrend[];
}

class AnalyticsService {
  private baseUrl = '/analytics';

  async getDashboard(
    startDate?: string,
    endDate?: string,
    projectId?: string
  ): Promise<AnalyticsDashboard> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (projectId) params.append('projectId', projectId);

    const response = await api.get<AnalyticsDashboard>(
      `${this.baseUrl}/dashboard`,
      { params }
    );
    return response.data;
  }

  async getProjectsProgress(
    startDate?: string,
    endDate?: string,
    projectId?: string
  ): Promise<ProjectProgress[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (projectId) params.append('projectId', projectId);

    const response = await api.get<ProjectProgress[]>(
      `${this.baseUrl}/projects/progress`,
      { params }
    );
    return response.data;
  }

  async getInternsPerformance(
    startDate?: string,
    endDate?: string,
    userId?: string
  ): Promise<InternPerformance[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (userId) params.append('userId', userId);

    const response = await api.get<InternPerformance[]>(
      `${this.baseUrl}/interns/performance`,
      { params }
    );
    return response.data;
  }

  async getTeamPerformance(
    startDate?: string,
    endDate?: string
  ): Promise<TeamPerformance> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get<TeamPerformance>(
      `${this.baseUrl}/team/performance`,
      { params }
    );
    return response.data;
  }

  async getCompletionTrends(
    startDate?: string,
    endDate?: string
  ): Promise<TaskCompletionTrend[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get<TaskCompletionTrend[]>(
      `${this.baseUrl}/trends/completion`,
      { params }
    );
    return response.data;
  }
}

export default new AnalyticsService();
