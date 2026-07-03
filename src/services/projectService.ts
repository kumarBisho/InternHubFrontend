import api from './api';

interface Project {
  id: string;
  title: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  techStack?: string[];
  progress?: number;
  repositoryUrl?: string;
  documentationUrl?: string;
  demoUrl?: string;
  createdAt: string;
  createdById: string;
}

interface CreateProjectRequest {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  techStack?: string; // JSON stringified array
  progress: number;
  repositoryUrl?: string | null;
  documentationUrl?: string | null;
  demoUrl?: string | null;
  status: string;
}

const projectService = {
  // Get all projects assigned to current user
  getProjects: async (): Promise<Project[]> => {
    try {
      const response = await api.get('/Projects');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch projects:', error);
      throw error.response?.data?.message || 'Failed to fetch projects';
    }
  },

  // Get single project by ID
  getProjectById: async (projectId: string): Promise<Project> => {
    try {
      const response = await api.get(`/Projects/${projectId}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch project:', error);
      throw error.response?.data?.message || 'Failed to fetch project';
    }
  },

  // Create a new project (Admin/Mentor only)
  createProject: async (projectData: CreateProjectRequest): Promise<Project> => {
    try {
      const response = await api.post('/Projects', projectData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create project:', error);
      throw error.response?.data?.message || 'Failed to create project';
    }
  },

  // Update project (Admin only)
  updateProject: async (projectId: string, projectData: Partial<Project>): Promise<Project> => {
    try {
      const response = await api.put(`/Projects/${projectId}`, projectData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to update project:', error);
      throw error.response?.data?.message || 'Failed to update project';
    }
  },

  // Delete project (Admin only)
  deleteProject: async (projectId: string): Promise<void> => {
    try {
      await api.delete(`/Projects/${projectId}`);
    } catch (error: any) {
      console.error('Failed to delete project:', error);
      throw error.response?.data?.message || 'Failed to delete project';
    }
  },

  // Assign project to intern with mentor
  assignProject: async (
    projectId: string,
    assignmentData: { InternId: string; MentorId: string }
  ): Promise<void> => {
    try {
      console.log('Assigning project with data:', { projectId, assignmentData });
      await api.post(`/Projects/${projectId}/assign`, assignmentData);
      console.log('Project assigned successfully');
    } catch (error: any) {
      console.error('Failed to assign project:', error);
      console.error('Error response:', error.response);
      console.error('Error details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        details: error.response?.data?.details,
        data: error.response?.data,
      });
      
      const errorMsg = 
        error.response?.data?.details || 
        error.response?.data?.message || 
        'Failed to assign project';
      throw errorMsg;
    }
  },

  // Get project assignments (interns assigned to a project)
  getProjectAssignments: async (projectId: string): Promise<any[]> => {
    try {
      const response = await api.get(`/ProjectAssignments/project/${projectId}`);
      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error: any) {
      console.error('Failed to fetch project assignments:', error);
      // Return empty array if endpoint doesn't exist, as it's optional
      return [];
    }
  },

  // Get projects assigned to a mentor
  getProjectsForMentor: async (mentorId: string): Promise<Project[]> => {
    try {
      const response = await api.get(`/projects/mentor/${mentorId}`);
      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error: any) {
      console.error('Failed to fetch projects for mentor:', error);
      throw error.response?.data?.message || 'Failed to fetch projects for mentor';
    }
  },

  // Get projects for a specific intern (using project_assignments table)
  getProjectsForIntern: async (internId: string): Promise<Project[]> => {
    try {
      // Use the same endpoint as getProjects but accept internId parameter
      // This queries the project_assignments table for projects assigned to this intern
      const response = await api.get(`/projects/intern/${internId}`);
      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error: any) {
      console.error('Failed to fetch projects for intern:', error);
      throw error.response?.data?.message || 'Failed to fetch projects for intern';
    }
  },
};

export default projectService;
