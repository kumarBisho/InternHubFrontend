import api from './api';

interface CreateSkill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

interface ProfileData {
  phone?: string;
  department?: string;
  position?: string;
  bio?: string;
  startDate?: string;
  endDate?: string;
  interests?: string;
  profileImageUrl?: string;
  skills: CreateSkill[];
}

interface ProfileResponse extends ProfileData {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;  // Added: User's role
}

const profileService = {
  // Get current user's profile
  getMyProfile: async (): Promise<ProfileResponse> => {
    try {
      const response = await api.get('/profile/me');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      throw error.response?.data?.message || 'Failed to fetch profile';
    }
  },

  // Update current user's profile
  updateMyProfile: async (profileData: ProfileData): Promise<void> => {
    try {
      console.log('Sending profile update request:', profileData);
      const response = await api.put('/profile/me', profileData);
      console.log('Profile update response:', response.data);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      
      const errorMessage = 
        error.response?.data?.error ||
        error.response?.data?.message || 
        error.response?.data?.details ||
        error.message ||
        'Failed to update profile';
      
      throw errorMessage;
    }
  },

  // Get user profile by ID (Admin only)
  getUserProfile: async (userId: string): Promise<ProfileResponse> => {
    try {
      const response = await api.get(`/profile/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch user profile:', error);
      throw error.response?.data?.message || 'Failed to fetch user profile';
    }
  },
};

export default profileService;
