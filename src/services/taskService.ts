import api from './api';

interface Task {
  id: string;
  title: string;
  projectId: string;
  endDate: string;
  priority: string;
  status: string;
  createdAt: string;
}

interface AssignedTask {
  id: string;
  title: string;
  projectId: string;
  endDate: string;
  priority: string;
  status: string;
  createdAt: string;
  assignments: TaskAssignment[];
}

interface TaskAssignment {
  id: number;
  taskId: string;
  internId: string;
  internName: string;
  internEmail: string;
  assignedAt: string;
}

interface CreateTaskRequest {
  title: string;
  projectId: string;
  endDate: string;
  priority: string;
}

interface AssignTaskRequest {
  taskId: string;
  internIds: string[];
}

const taskService = {
  // Create a new task
  createTask: async (taskData: CreateTaskRequest): Promise<Task> => {
    try {
      console.log('Creating task with data:', taskData);
      const response = await api.post('/tasks', taskData);
      console.log('Task created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create task:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.response?.data?.message,
      });
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.title || 
                      error.response?.data || 
                      'Failed to create task';
      throw typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg);
    }
  },

  // Get task by ID
  getTaskById: async (taskId: string): Promise<Task> => {
    try {
      const response = await api.get(`/tasks/${taskId}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch task:', error);
      throw error.response?.data?.message || 'Failed to fetch task';
    }
  },

  // Get all tasks for a project
  getTasksByProject: async (projectId: string): Promise<Task[]> => {
    try {
      const response = await api.get(`/tasks/project/${projectId}`);
      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error: any) {
      console.error('Failed to fetch project tasks:', error);
      throw error.response?.data?.message || 'Failed to fetch project tasks';
    }
  },

  // Get task with assignments
  getTaskWithAssignments: async (taskId: string): Promise<AssignedTask> => {
    try {
      const response = await api.get(`/tasks/${taskId}/assignments`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch task assignments:', error);
      throw error.response?.data?.message || 'Failed to fetch task assignments';
    }
  },

  // Assign task to interns
  assignTaskToInterns: async (assignData: AssignTaskRequest): Promise<TaskAssignment[]> => {
    try {
      const response = await api.post('/tasks/assign', assignData);
      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error: any) {
      console.error('Failed to assign task:', error);
      throw error.response?.data?.message || 'Failed to assign task';
    }
  },

  // Get tasks assigned to intern
  getTasksAssignedToIntern: async (internId: string): Promise<AssignedTask[]> => {
    try {
      const response = await api.get(`/tasks/assigned/${internId}`);
      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error: any) {
      console.error('Failed to fetch assigned tasks:', error);
      throw error.response?.data?.message || 'Failed to fetch assigned tasks';
    }
  },

  // Get my assigned tasks (for interns)
  getMyAssignedTasks: async (): Promise<AssignedTask[]> => {
    try {
      const response = await api.get('/tasks/assigned/me/current');
      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error: any) {
      console.error('Failed to fetch my assigned tasks:', error);
      throw error.response?.data?.message || 'Failed to fetch my assigned tasks';
    }
  },

  // Get completed tasks for intern
  getCompletedTasksForIntern: async (internId: string): Promise<AssignedTask[]> => {
    try {
      const response = await api.get(`/tasks/completed/${internId}`);
      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error: any) {
      console.error('Failed to fetch completed tasks:', error);
      throw error.response?.data?.message || 'Failed to fetch completed tasks';
    }
  },

  // Get my completed tasks (for interns)
  getMyCompletedTasks: async (): Promise<AssignedTask[]> => {
    try {
      const response = await api.get('/tasks/completed/me/current');
      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error: any) {
      console.error('Failed to fetch my completed tasks:', error);
      throw error.response?.data?.message || 'Failed to fetch my completed tasks';
    }
  },

  // Update task
  updateTask: async (taskId: string, taskData: Partial<Task>): Promise<Task> => {
    try {
      console.log('Updating task:', taskId, 'with data:', taskData);
      const response = await api.put(`/tasks/${taskId}`, taskData);
      console.log('Task updated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to update task:', error);
      console.error('Error details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        details: error.response?.data?.details,
        data: error.response?.data,
      });
      throw error.response?.data?.details || 
            error.response?.data?.message || 
            'Failed to update task';
    }
  },

  // Delete task
  deleteTask: async (taskId: string): Promise<void> => {
    try {
      await api.delete(`/tasks/${taskId}`);
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      throw error.response?.data?.message || 'Failed to delete task';
    }
  },
};

export default taskService;
