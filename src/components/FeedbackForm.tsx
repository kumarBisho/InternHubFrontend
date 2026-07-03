import { useState, useEffect } from 'react';
import { useFeedback } from '../hooks/useFeedback';
import type { CreateFeedbackRequest } from '../types/domain';

interface FeedbackFormProps {
  isOpen: boolean;
  internId?: string;
  internName?: string;
  taskId?: string;
  taskTitle?: string;
  projectId?: string;
  projectTitle?: string;
  onClose: () => void;
  onSuccess: () => void;
  feedbackType?: 'TaskFeedback' | 'ProjectFeedback' | 'GeneralFeedback';
}

export default function FeedbackForm({
  isOpen,
  internId = '',
  internName = '',
  taskId,
  taskTitle,
  projectId,
  projectTitle,
  onClose,
  onSuccess,
  feedbackType = 'GeneralFeedback',
}: FeedbackFormProps) {
  const { createFeedback, isLoading, error, clearMessages } = useFeedback();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    rating: 3,
    type: feedbackType,
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    // Reset form when modal opens
    if (isOpen) {
      setFormData({
        title: '',
        content: '',
        rating: 3,
        type: feedbackType,
      });
      setValidationError(null);
      clearMessages();
    }
  }, [isOpen, feedbackType, clearMessages]);

  const validateForm = (): boolean => {
    if (!internId) {
      setValidationError('Intern ID is required');
      return false;
    }
    if (!formData.title.trim()) {
      setValidationError('Feedback title is required');
      return false;
    }
    if (formData.title.trim().length < 5) {
      setValidationError('Feedback title must be at least 5 characters');
      return false;
    }
    if (!formData.content.trim()) {
      setValidationError('Feedback content is required');
      return false;
    }
    if (formData.content.trim().length < 10) {
      setValidationError('Feedback content must be at least 10 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!validateForm()) {
      return;
    }

    try {
      const feedbackData: CreateFeedbackRequest = {
        internId,
        title: formData.title.trim(),
        content: formData.content.trim(),
        type: formData.type as 'TaskFeedback' | 'ProjectFeedback' | 'GeneralFeedback',
        ...(taskId && { taskId }),
        ...(projectId && { projectId }),
        rating: formData.rating,
      };

      await createFeedback(feedbackData);

      setFormData({
        title: '',
        content: '',
        rating: 3,
        type: feedbackType,
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating feedback:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 md:p-8 max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Send Feedback</h2>
        {internName && (
          <p className="text-gray-600 text-sm mb-6">
            To: <span className="font-semibold">{internName}</span>
          </p>
        )}

        {(error || validationError) && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error || validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Feedback Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Type</label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as 'TaskFeedback' | 'ProjectFeedback' | 'GeneralFeedback',
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="GeneralFeedback">General Feedback</option>
              <option value="TaskFeedback">Task Feedback</option>
              <option value="ProjectFeedback">Project Feedback</option>
            </select>
          </div>

          {/* Context Information */}
          {taskTitle && (
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Task:</span> {taskTitle}
              </p>
            </div>
          )}

          {projectTitle && (
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Project:</span> {projectTitle}
              </p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Feedback Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g., Excellent project completion"
              disabled={isLoading}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.title.length}/200 characters</p>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Feedback Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Provide detailed feedback including strengths, areas for improvement, and suggestions..."
              disabled={isLoading}
              maxLength={2000}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.content.length}/2000 characters</p>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Performance Rating</label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className={`cursor-pointer text-2xl transition-colors ${
                    star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
                  } hover:text-yellow-300 disabled:opacity-50`}
                  disabled={isLoading}
                >
                  ★
                </button>
              ))}
              <span className="text-sm text-gray-600 ml-2">
                {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][formData.rating - 1]}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
