import { useEffect, useState } from 'react';
import { useFeedback } from '../hooks/useFeedback';
import type { FeedbackListItem } from '../types/domain';

interface FeedbackListProps {
  internId?: string;
  mentorId?: string;
  taskId?: string;
  projectId?: string;
  title?: string;
  onSelectFeedback?: (feedbackId: string) => void;
  pageSize?: number;
}

const getRatingDisplay = (rating?: number) => {
  if (!rating) return 'N/A';
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getFeedbackTypeColor = (type: string) => {
  switch (type) {
    case 'TaskFeedback':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'ProjectFeedback':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'GeneralFeedback':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

export default function FeedbackList({
  internId,
  mentorId,
  taskId,
  projectId,
  title = 'Feedback',
  onSelectFeedback,
  pageSize = 10,
}: FeedbackListProps) {
  const { feedbackList, isLoading, error, getFeedbackReceivedByIntern, getFeedbackGivenByMentor, getFeedbackForTask, getFeedbackForProject } = useFeedback();
  const [currentPage, setCurrentPage] = useState(1);
  const [noResults, setNoResults] = useState(false);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setNoResults(false);

        if (internId) {
          const result = await getFeedbackReceivedByIntern(internId, currentPage, pageSize);
          if (result.items.length === 0 && currentPage === 1) {
            setNoResults(true);
          }
        } else if (mentorId) {
          const result = await getFeedbackGivenByMentor(mentorId, currentPage, pageSize);
          if (result.items.length === 0 && currentPage === 1) {
            setNoResults(true);
          }
        } else if (taskId) {
          const result = await getFeedbackForTask(taskId, currentPage, pageSize);
          if (result.items.length === 0 && currentPage === 1) {
            setNoResults(true);
          }
        } else if (projectId) {
          const result = await getFeedbackForProject(projectId, currentPage, pageSize);
          if (result.items.length === 0 && currentPage === 1) {
            setNoResults(true);
          }
        }
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setNoResults(true);
      }
    };

    fetchFeedback();
  }, [internId, mentorId, taskId, projectId, currentPage, pageSize, getFeedbackReceivedByIntern, getFeedbackGivenByMentor, getFeedbackForTask, getFeedbackForProject]);

  if (isLoading && !feedbackList) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading feedback...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-red-600 mb-4">⚠️ Error</div>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (noResults || !feedbackList || feedbackList.items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Feedback Yet</h3>
        <p className="text-gray-600">{internId ? 'You haven\'t received any feedback yet.' : 'No feedback found.'}</p>
      </div>
    );
  }

  const totalPages = feedbackList.totalPages || Math.ceil(feedbackList.totalCount / pageSize);

  return (
    <div className="space-y-4">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600 mt-1">
          Showing {feedbackList.items.length} of {feedbackList.totalCount} feedback
        </p>
      </div>

      {/* Feedback Items */}
      <div className="space-y-3">
        {feedbackList.items.map((item: FeedbackListItem) => (
          <div
            className={`bg-white border rounded-lg p-4 transition-all ${
              onSelectFeedback ? 'hover:shadow-md hover:border-indigo-300' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  <span key={item.id}
                    onClick={() => onSelectFeedback?.(item.id)}
                    className='cursor-pointer hover:text-indigo-600 transition'>
                    {item.title}
                  </span>
                </h3>
                <p className="text-sm text-gray-600">{item.mentorName}</p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getFeedbackTypeColor(item.type)}`}
                >
                  {item.type === 'TaskFeedback'
                    ? '📋 Task'
                    : item.type === 'ProjectFeedback'
                    ? '📊 Project'
                    : '💬 General'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <div>
                {item.rating && (
                  <span className="text-yellow-500 font-medium">{getRatingDisplay(item.rating)}</span>
                )}
              </div>
              <time>{formatDate(item.createdAt)}</time>
            </div>

            {item.isUnread && (
              <div className="inline-block bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-medium">
                New
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1 || isLoading}
            className="cursor-pointer px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                const distance = Math.abs(page - currentPage);
                return distance < 3 || page === 1 || page === totalPages;
              })
              .map((page, idx, arr) => (
                <div key={page}>
                  {idx > 0 && arr[idx - 1] !== page - 1 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={`cursor-pointer px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      page === currentPage
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                </div>
              ))}
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || isLoading}
            className="cursor-pointer px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
