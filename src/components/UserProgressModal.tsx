import React, { useEffect, useState } from 'react';
import taskService from '../services/taskService';
import projectService from '../services/projectService';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role?: string;
  email?: string;
}

interface UserProgressModalProps {
  user: User | null;
  onClose: () => void;
}

interface TaskProgress {
  totalAssigned: number;
  completed: number;
  percentage: number;
}

interface ProjectProgress {
  totalAssigned: number;
  active: number;
  percentage: number;
}

export const UserProgressModal: React.FC<UserProgressModalProps> = ({ user, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskProgress, setTaskProgress] = useState<TaskProgress | null>(null);
  const [projectProgress, setProjectProgress] = useState<ProjectProgress | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchProgress = async () => {
      setLoading(true);
      setError(null);
      try {
        const isIntern = String(user.role).toLowerCase() === '4' || String(user.role).toLowerCase() === 'intern';

        if (isIntern) {
          // Fetch task progress for intern
          try {
            const assignedTasks = await taskService.getTasksAssignedToIntern(user.id);
            const completedTasks = await taskService.getCompletedTasksForIntern(user.id);
            
            const total = Array.isArray(assignedTasks) ? assignedTasks.length : 0;
            const completed = Array.isArray(completedTasks) ? completedTasks.length : 0;
            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

            setTaskProgress({
              totalAssigned: total,
              completed: completed,
              percentage: percentage
            });
          } catch (err) {
            console.error('Error fetching task progress:', err);
            setError('Failed to fetch task progress');
          }
        } else {
          // Fetch project progress for mentor
          try {
            const projects = await projectService.getProjectsForMentor(user.id);
            const totalAssigned = Array.isArray(projects) ? projects.length : 0;
            // Count active projects (status is not 'Completed')
            const active = Array.isArray(projects) 
              ? projects.filter((p: any) => p.status !== 'Completed').length 
              : 0;
            const percentage = totalAssigned > 0 ? Math.round((active / totalAssigned) * 100) : 0;

            setProjectProgress({
              totalAssigned: totalAssigned,
              active: active,
              percentage: percentage
            });
          } catch (err) {
            console.error('Error fetching project progress:', err);
            setError('Failed to fetch project progress');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user]);

  if (!user) return null;

  const isIntern = String(user.role).toLowerCase() === '4' || String(user.role).toLowerCase() === 'intern';

  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {user.firstName} {user.lastName}'s Progress
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-gray-400 hover:text-gray-600 transition font-bold text-xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          ) : isIntern && taskProgress ? (
            <div className="space-y-4">
              {/* Role badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  Intern
                </span>
              </div>

              {/* Task Statistics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{taskProgress.totalAssigned}</p>
                  <p className="text-xs text-gray-600 mt-1">Total Assigned</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{taskProgress.completed}</p>
                  <p className="text-xs text-gray-600 mt-1">Completed</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Task Completion Progress</p>
                  <p className="text-sm font-bold text-indigo-600">{taskProgress.percentage}%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${taskProgress.percentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{taskProgress.completed}</span> of{' '}
                  <span className="font-medium">{taskProgress.totalAssigned}</span> tasks completed
                </p>
              </div>
            </div>
          ) : !isIntern && projectProgress ? (
            <div className="space-y-4">
              {/* Role badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                  Mentor
                </span>
              </div>

              {/* Project Statistics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">{projectProgress.totalAssigned}</p>
                  <p className="text-xs text-gray-600 mt-1">Total Assigned</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{projectProgress.active}</p>
                  <p className="text-xs text-gray-600 mt-1">Active</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Active Project Ratio</p>
                  <p className="text-sm font-bold text-indigo-600">{projectProgress.percentage}%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${projectProgress.percentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{projectProgress.active}</span> of{' '}
                  <span className="font-medium">{projectProgress.totalAssigned}</span> projects are active
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm">No progress data available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            className="cursor-pointer w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
