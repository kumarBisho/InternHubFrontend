import { useState, useEffect } from 'react';
import type { Feedback } from '../types/domain';
import feedbackService from '../services/feedbackService';
import { useNavigate } from 'react-router-dom';

interface FeedbackDetailProps {
  feedbackId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackDetail({ feedbackId, isOpen, onClose }: FeedbackDetailProps) {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && feedbackId) {
      loadFeedback();
    }
  }, [isOpen, feedbackId]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await feedbackService.getFeedbackById(feedbackId);
      setFeedback(data);
    } catch (err) {
      console.error('Error loading feedback:', err);
      setError('Failed to load feedback details');
    } finally {
      setLoading(false);
    }
  };

  const getFeedbackTypeInfo = (type: string) => {
    switch (type) {
      case 'TaskFeedback':
        return { icon: '📋', label: 'Task Feedback', color: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'ProjectFeedback':
        return { icon: '📊', label: 'Project Feedback', color: 'bg-green-100 text-green-800 border-green-300' };
      case 'GeneralFeedback':
        return { icon: '💬', label: 'General Feedback', color: 'bg-purple-100 text-purple-800 border-purple-300' };
      default:
        return { icon: '📝', label: type, color: 'bg-gray-100 text-gray-800 border-gray-300' };
    }
  };

  const getRatingDisplay = (rating?: number) => {
    if (!rating) return 'Not rated';
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  const typeInfo = feedback ? getFeedbackTypeInfo(feedback.type) : null;

  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <h2 className="text-2xl font-bold text-gray-900">📝 Feedback Details</h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-gray-500 hover:text-gray-700 text-2xl transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="m-6 p-4 bg-red-50 border border-red-300 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Feedback Content */}
        {!loading && feedback && (
          <div className="p-8 space-y-6">
            {/* Mentor Info */}
            <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
              <div onClick={() => feedback && navigate(`/profile/${feedback.mentorId}`)}  className="cursor-pointer w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {feedback.mentorName?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  <span onClick={() => feedback && navigate(`/profile/${feedback.mentorId}`)} className="cursor-pointer hover:text-indigo-600 transition">
                  {feedback.mentorName}
                  </span>
                </h3>
                <p className="text-sm text-gray-600 mt-1">Mentor</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">{formatDate(feedback.createdAt)}</p>
              </div>
            </div>

            {/* Feedback Type and Rating */}
            <div className="flex flex-wrap items-center gap-4">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-medium text-sm ${typeInfo?.color}`}>
                {typeInfo?.icon} {typeInfo?.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-yellow-500 font-medium text-lg">{getRatingDisplay(feedback.rating)}</span>
                <span className="text-xs text-gray-600">
                  {feedback.rating ? `${feedback.rating}/5` : 'Not rated'}
                </span>
              </div>
            </div>

            {/* Title */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{feedback.title}</h3>
            </div>

            {/* Context Information */}
            {(feedback.taskTitle || feedback.projectTitle) && (
              <div className="space-y-3">
                {feedback.taskTitle && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-900 mb-1">📋 Related Task</p>
                    <p className="text-blue-800">{feedback.taskTitle}</p>
                  </div>
                )}
                {feedback.projectTitle && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-green-900 mb-1">📊 Related Project</p>
                    <p className="text-green-800">{feedback.projectTitle}</p>
                  </div>
                )}
              </div>
            )}

            {/* Feedback Content */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Description:</h4>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{feedback.content}</p>
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-600 mb-1">Created</p>
                <p className="text-sm font-semibold text-gray-900">{formatDate(feedback.createdAt)}</p>
              </div>
              {feedback.updatedAt && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-medium text-gray-600 mb-1">Updated</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(feedback.updatedAt)}</p>
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-600 mb-1">Status</p>
                <p className="text-sm font-semibold text-gray-900">Received</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {/* <div className="sticky bottom-0 flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="cursor-pointer px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Close
          </button>
        </div> */}
      </div>
    </div>
  );
}
