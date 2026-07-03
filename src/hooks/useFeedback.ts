import { useState, useCallback } from 'react';
import feedbackService from '../services/feedbackService';
import type {
    Feedback,
    CreateFeedbackRequest,
    UpdateFeedbackRequest,
    PaginatedFeedback,
} from '../types/domain';

/**
 * useFeedback Hook
 *
 * Manages feedback operations including creating, fetching, updating, and deleting feedback.
 * Integrates with the feedback service and provides easy-to-use state management.
 *
 * Features:
 * - Create feedback with loading states
 * - Fetch feedback by various criteria
 * - Update feedback
 * - Delete feedback
 * - Pagination support
 *
 * @example
 * const {
 *   feedback,
 *   isLoading,
 *   error,
 *   successMessage,
 *   createFeedback,
 *   getFeedbackReceivedByIntern,
 * } = useFeedback();
 */
export const useFeedback = () => {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [feedbackList, setFeedbackList] = useState<PaginatedFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Clear messages
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  // Create feedback
  const createFeedback = useCallback(
    async (feedbackData: CreateFeedbackRequest) => {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      try {
        const result = await feedbackService.createFeedback(feedbackData);
        setFeedback(result);
        setSuccessMessage('Feedback created successfully');
        return result;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || 'Failed to create feedback';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Get feedback by ID
  const getFeedbackById = useCallback(async (feedbackId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await feedbackService.getFeedbackById(feedbackId);
      setFeedback(result);
      return result;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to fetch feedback';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get feedback received by intern
  const getFeedbackReceivedByIntern = useCallback(
    async (internId: string, pageNumber: number = 1, pageSize: number = 20) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await feedbackService.getFeedbackReceivedByIntern(
          internId,
          pageNumber,
          pageSize
        );
        setFeedbackList(result);
        return result;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || 'Failed to fetch feedback';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Get feedback given by mentor
  const getFeedbackGivenByMentor = useCallback(
    async (mentorId: string, pageNumber: number = 1, pageSize: number = 20) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await feedbackService.getFeedbackGivenByMentor(
          mentorId,
          pageNumber,
          pageSize
        );
        setFeedbackList(result);
        return result;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || 'Failed to fetch feedback';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Get feedback for task
  const getFeedbackForTask = useCallback(
    async (taskId: string, pageNumber: number = 1, pageSize: number = 20) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await feedbackService.getFeedbackForTask(taskId, pageNumber, pageSize);
        setFeedbackList(result);
        return result;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || 'Failed to fetch feedback';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Get feedback for project
  const getFeedbackForProject = useCallback(
    async (projectId: string, pageNumber: number = 1, pageSize: number = 20) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await feedbackService.getFeedbackForProject(projectId, pageNumber, pageSize);
        setFeedbackList(result);
        return result;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || 'Failed to fetch feedback';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Get feedback by type
  const getFeedbackByType = useCallback(
    async (internId: string, feedbackType: 'TaskFeedback' | 'ProjectFeedback' | 'GeneralFeedback') => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await feedbackService.getFeedbackByType(internId, feedbackType);
        return result;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || 'Failed to fetch feedback';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Update feedback
  const updateFeedback = useCallback(async (feedbackId: string, updateData: UpdateFeedbackRequest) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await feedbackService.updateFeedback(feedbackId, updateData);
      setSuccessMessage('Feedback updated successfully');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to update feedback';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete feedback
  const deleteFeedback = useCallback(async (feedbackId: string) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await feedbackService.deleteFeedback(feedbackId);
      setSuccessMessage('Feedback deleted successfully');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to delete feedback';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    feedback,
    feedbackList,
    isLoading,
    error,
    successMessage,
    clearMessages,
    createFeedback,
    getFeedbackById,
    getFeedbackReceivedByIntern,
    getFeedbackGivenByMentor,
    getFeedbackForTask,
    getFeedbackForProject,
    getFeedbackByType,
    updateFeedback,
    deleteFeedback,
  };
};
