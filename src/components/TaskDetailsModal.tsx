import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import taskService from '../services/taskService';

interface TaskAssignment {
  id: number;
  taskId: string;
  internId: string;
  internName: string;
  internEmail: string;
  assignedAt: string;
}

interface TaskDetails {
  id: string;
  title: string;
  projectId: string;
  projectTitle: string;
  description?: string;
  endDate: string;
  priority: string;
  status: string;
  createdAt: string;
  createdBy?: string; // Mentor/Task Creator
  assignments: TaskAssignment[];
}

interface TaskDetailsModalProps {
  isOpen: boolean;
  taskId: string;
  projectTitle: string;
  onClose: () => void;
}

export default function TaskDetailsModal({ isOpen, taskId, projectTitle, onClose }: TaskDetailsModalProps) {
  const [taskDetails, setTaskDetails] = useState<TaskDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTaskDetails();
    }
  }, [isOpen, taskId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await taskService.getTaskWithAssignments(taskId);
      setTaskDetails({
        ...response,
        projectTitle: projectTitle,
      });
    } catch (err) {
      console.error('Failed to fetch task details:', err);
      setError(typeof err === 'string' ? err : 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Task Details</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
              <button
                onClick={fetchTaskDetails}
                className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded font-medium hover:bg-red-200 transition cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : taskDetails ? (
            <div className="space-y-6">
              {/* Task Title */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Task Title</h3>
                <p className="mt-2 text-2xl font-bold text-gray-900">{taskDetails.title}</p>
              </div>

              {/* Project Title */}
              {/* <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Project</h3>
                <p className="mt-2 text-lg text-gray-900 font-medium">{taskDetails.projectTitle}</p>
              </div> */}

              {/* Status and Priority Row */}
              <div className="border-t border-gray-200 pt-6 grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Status</h3>
                  <div className="mt-2">
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(taskDetails.status)}`}>
                      {taskDetails.status}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Priority</h3>
                  <div className="mt-2">
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getPriorityColor(taskDetails.priority)}`}>
                      {taskDetails.priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deadline */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Deadline</h3>
                <p className="mt-2 text-lg text-gray-900 font-medium">
                  {formatDate(taskDetails.endDate)}
                </p>
              </div>

              {/* Task Creator/Mentor */}
              {taskDetails.createdBy && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Task Creator (Mentor)</h3>
                  <p className="mt-2 text-lg text-gray-900 font-medium">{taskDetails.createdBy}</p>
                </div>
              )}

              {/* Assigned Interns */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Assigned Interns ({taskDetails.assignments?.length || 0})
                </h3>
                {taskDetails.assignments && taskDetails.assignments.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {taskDetails.assignments.map((intern) => (
                      <div
                        key={intern.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        {/* Avatar */}
                        <div onClick={() => navigate(`/profile/${intern.internId}`)} className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 cursor-pointer hover:shadow-lg transition">
                          {getInitials(intern.internName)}
                        </div>

                        {/* Intern Info */}
                        <div className="flex-1">
                          <p onClick={() => navigate(`/profile/${intern.internId}`)} className="font-semibold text-gray-900 cursor-pointer hover:text-indigo-600 transition">
                            {intern.internName}
                          </p>
                          <p className="text-sm text-gray-600">{intern.internEmail}</p>
                        </div>

                        {/* Assigned Date */}
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Assigned on</p>
                          <p className="text-sm font-medium text-gray-900">{formatDate(intern.assignedAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
                    <p className="text-gray-600 text-center">No interns assigned to this task yet</p>
                  </div>
                )}
              </div>

              {/* Task Description */}
              {taskDetails.description && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Description</h3>
                  <p className="mt-2 text-gray-700 leading-relaxed">{taskDetails.description}</p>
                </div>
              )}

              {/* Created Date */}
              <div className="border-t border-gray-200 pt-6 pb-2">
                <p className="text-xs text-gray-500">Task created on {formatDate(taskDetails.createdAt)}</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper Functions
function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-blue-100 text-blue-800';
    case 'inprogress':
    case 'in-progress':
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'completed':
    case 'done':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getPriorityColor(priority: string): string {
  switch (priority?.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-700';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700';
    case 'low':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
