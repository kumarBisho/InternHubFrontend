import api from './api';
import type {
    Feedback,
    FeedbackListItem,
    CreateFeedbackRequest,
    UpdateFeedbackRequest,
    PaginatedFeedback,
} from '../types/domain';

const feedbackService = {
  // Create new feedback
  createFeedback: async (feedbackData: CreateFeedbackRequest): Promise<Feedback> => {
    try {
      console.log('Creating feedback with data:', feedbackData);
      const response = await api.post('/feedback', feedbackData);
      console.log('Feedback created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating feedback:', error);
      throw error;
    }
  },

  // Get feedback by ID
  getFeedbackById: async (feedbackId: string): Promise<Feedback> => {
    try {
      console.log('Fetching feedback:', feedbackId);
      const response = await api.get(`/feedback/${feedbackId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching feedback:', error);
      throw error;
    }
  },

  // Get feedback received by intern
  getFeedbackReceivedByIntern: async (
    internId: string,
    pageNumber: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedFeedback> => {
    try {
      console.log(`Fetching feedback received by intern ${internId}`, { pageNumber, pageSize });
      const response = await api.get(`/feedback/received/${internId}`, {
        params: { pageNumber, pageSize },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching received feedback:', error);
      throw error;
    }
  },

  // Get feedback given by mentor
  getFeedbackGivenByMentor: async (
    mentorId: string,
    pageNumber: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedFeedback> => {
    try {
      console.log(`Fetching feedback given by mentor ${mentorId}`, { pageNumber, pageSize });
      const response = await api.get(`/feedback/given/${mentorId}`, {
        params: { pageNumber, pageSize },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching given feedback:', error);
      throw error;
    }
  },

  // Get feedback for a specific task
  getFeedbackForTask: async (
    taskId: string,
    pageNumber: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedFeedback> => {
    try {
      console.log(`Fetching feedback for task ${taskId}`, { pageNumber, pageSize });
      const response = await api.get(`/feedback/task/${taskId}`, {
        params: { pageNumber, pageSize },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching task feedback:', error);
      throw error;
    }
  },

  // Get feedback for a specific project
  getFeedbackForProject: async (
    projectId: string,
    pageNumber: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedFeedback> => {
    try {
      console.log(`Fetching feedback for project ${projectId}`, { pageNumber, pageSize });
      const response = await api.get(`/feedback/project/${projectId}`, {
        params: { pageNumber, pageSize },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching project feedback:', error);
      throw error;
    }
  },

  // Get feedback by type
  getFeedbackByType: async (
    internId: string,
    feedbackType: 'TaskFeedback' | 'ProjectFeedback' | 'GeneralFeedback'
  ): Promise<FeedbackListItem[]> => {
    try {
      console.log(`Fetching ${feedbackType} for intern ${internId}`);
      const response = await api.get(`/feedback/type/${internId}`, {
        params: { type: feedbackType },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching feedback by type:', error);
      throw error;
    }
  },

  // Update feedback
  updateFeedback: async (
    feedbackId: string,
    updateData: UpdateFeedbackRequest
  ): Promise<{ message: string }> => {
    try {
      console.log('Updating feedback:', feedbackId, updateData);
      const response = await api.put(`/feedback/${feedbackId}`, updateData);
      console.log('Feedback updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating feedback:', error);
      throw error;
    }
  },

  // Delete feedback
  deleteFeedback: async (feedbackId: string): Promise<{ message: string }> => {
    try {
      console.log('Deleting feedback:', feedbackId);
      const response = await api.delete(`/feedback/${feedbackId}`);
      console.log('Feedback deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting feedback:', error);
      throw error;
    }
  },
};

export default feedbackService;
