import api from './api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
}

const userService = {
  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    try {
      console.log('Fetching all users from /Users endpoint');
      const response = await api.get('/Users');
      console.log('Users fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.message,
        details: error.response?.data?.details,
        data: error.response?.data,
      });
      
      // Provide specific error messages
      if (error.response?.status === 401) {
        throw 'Unauthorized: Please log in again';
      }
      if (error.response?.status === 403) {
        throw 'Forbidden: You do not have permission to view users (Admin or Mentor role required)';
      }
      
      throw error.response?.data?.details || 
            error.response?.data?.message || 
            'Failed to fetch users';
    }
  },

  // Get users by role
  getUsersByRole: async (role: string): Promise<User[]> => {
    try {
      const response = await api.get(`/Users?role=${role}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      throw error.response?.data?.message || 'Failed to fetch users';
    }
  },

  // Get current user profile
  getUserProfile: async (): Promise<User> => {
    try {
      const response = await api.get('/Users/profile');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch user profile:', error);
      throw error.response?.data?.message || 'Failed to fetch user profile';
    }
  },

  // Get interns assigned to a mentor for a specific project
  getInternsByMentorAndProject: async (mentorId: string, projectId: string): Promise<User[]> => {
    try {
      console.log('Fetching interns for mentor on project:', { mentorId, projectId });
      const response = await api.get(`/Users/mentor/${mentorId}/project/${projectId}/interns`);
      console.log('Interns for mentor on project:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch interns for project:', error);
      
      if (error.response?.status === 404) {
        // No interns found or endpoint doesn't exist
        return [];
      }
      if (error.response?.status === 403) {
        throw 'Forbidden: You do not have permission to view interns for this project';
      }
      
      throw error.response?.data?.message || error.response?.data?.details || 'Failed to fetch interns';
    }
  },

  // Get interns assigned to a mentor
  getInternsByMentor: async (mentorId: string): Promise<User[]> => {
    try {
      console.log('======== GET INTERNS BY MENTOR ========');
      console.log('Mentor ID:', mentorId);
      console.log('Calling endpoint: /Users/mentor/' + mentorId + '/interns');
      
      const response = await api.get(`/Users/mentor/${mentorId}/interns`);
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      console.log('========================================');
      return response.data;
    } catch (error: any) {
      console.error('======== ERROR FETCHING INTERNS ========');
      console.error('Error type:', typeof error);
      console.error('Error message:', error.message);
      console.error('Response status:', error.response?.status);
      console.error('Response statusText:', error.response?.statusText);
      console.error('Response data:', error.response?.data);
      console.error('Response headers:', error.response?.headers);
      console.error('Full error:', error);
      console.error('========================================');
      
      // Provide specific error messages
      if (error.response?.status === 401) {
        throw 'Unauthorized: Your session has expired. Please log in again.';
      }
      if (error.response?.status === 403) {
        throw 'Forbidden: You do not have permission to view interns (Mentor role required)';
      }
      if (error.response?.status === 404) {
        throw 'No interns found for this mentor';
      }
      
      throw error.response?.data?.details || 
            error.response?.data?.message || 
            'Failed to fetch interns';
    }
  },

  // Get assigned mentor for an intern
  getAssignedMentor: async (internId: string): Promise<User> => {
    try {
      console.log('Fetching mentor for intern:', internId);
      const response = await api.get(`/Users/intern/${internId}/mentor`);
      console.log('Mentor response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching assigned mentor:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      
      if (error.response?.status === 404) {
        throw 'No mentor assigned to you yet. Please contact the admin.';
      }
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw 'You are not authorized to access this resource. Please log in again.';
      }
      
      throw error.response?.data?.message || error.response?.data?.details || 'Failed to fetch assigned mentor';
    }
  },

  // Get all mentors and interns (for Manager and Admin)
  getAllMentorsAndInterns: async (): Promise<User[]> => {
    try {
      console.log('Fetching all mentors and interns');
      const response = await api.get('/Users/mentors-and-interns');
      console.log('Mentors and interns fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch mentors and interns:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.message,
        details: error.response?.data?.details,
      });
      
      if (error.response?.status === 401) {
        throw 'Unauthorized: Please log in again';
      }
      if (error.response?.status === 403) {
        throw 'Forbidden: You do not have permission to view mentors and interns (Admin or Manager role required)';
      }
      
      throw error.response?.data?.details || 
            error.response?.data?.message || 
            'Failed to fetch mentors and interns';
    }
  },
};

export default userService;
