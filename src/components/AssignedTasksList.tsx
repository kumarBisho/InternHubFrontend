import { useState, useEffect, useRef } from 'react';
import taskService from '../services/taskService';
import authService from '../services/authService';
import TaskDetailsModal from './TaskDetailsModal';

interface TaskAssignment {
  id: number;
  taskId: string;
  internId: string;
  internName: string;
  internEmail: string;
  assignedAt: string;
}

interface AssignedTask {
  id: string;
  title: string;
  projectId: string;
  endDate: string;
  priority: string;
  status: string;
  createdAt: string;
  assignments: TaskAssignment[];
}

export default function AssignedTasksList() {
  const user = useRef(authService.getCurrentUser()).current;
  const [activeTab, setActiveTab] = useState<'current' | 'completed'>('current');
  const [currentTasks, setCurrentTasks] = useState<AssignedTask[]>([]);
  const [completedTasks, setCompletedTasks] = useState<AssignedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);
  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<string | null>(null);
  

  useEffect(() => {
    // Only fetch once on mount
    if (!hasFetched.current && user) {
      hasFetched.current = true;
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      let current: AssignedTask[] = [];
      let completed: AssignedTask[] = [];

      if (user?.role?.toLowerCase() === 'intern') {
        // Fetch intern's own tasks
        current = await taskService.getMyAssignedTasks();
        completed = await taskService.getMyCompletedTasks();
      } else if (user?.role?.toLowerCase() === 'mentor' || user?.role === '2') {
        // Mentors would need to select an intern or this could show system-wide tasks
        // For now, we'll fetch their own if they have any
        try {
          current = await taskService.getMyAssignedTasks();
          completed = await taskService.getMyCompletedTasks();
        } catch {
          current = [];
          completed = [];
        }
      }

      setCurrentTasks(Array.isArray(current) ? current : []);
      setCompletedTasks(Array.isArray(completed) ? completed : []);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to fetch tasks');
      setCurrentTasks([]);
      setCompletedTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
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
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const tasksToDisplay = activeTab === 'current' ? currentTasks : completedTasks;
  const totalTasks = currentTasks.length + completedTasks.length;

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  const handleTaskTitleClick = (taskId: string) => {
    setSelectedTaskForDetails(taskId);
    setShowTaskDetailsModal(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Assigned Tasks</h2>
        <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
          {totalTasks} total
        </span>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('current')}
            className={`cursor-pointer pb-4 font-medium transition-colors relative ${
              activeTab === 'current'
                ? 'text-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Currently Assigned{' '}
            <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'current'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {currentTasks.length}
            </span>
            {activeTab === 'current' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`cursor-pointer pb-4 font-medium transition-colors relative ${
              activeTab === 'completed'
                ? 'text-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Completed{' '}
            <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'completed'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {completedTasks.length}
            </span>
            {activeTab === 'completed' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 rounded-full"></div>
            )}
          </button>
        </div>
      </div>

      {/* Task List */}
      {tasksToDisplay.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            {activeTab === 'current' ? '📋' : '✅'}
          </div>
          <p className="text-gray-600 font-medium">
            {activeTab === 'current'
              ? 'No tasks currently assigned'
              : 'No completed tasks yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasksToDisplay.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow bg-gray-50"
            >

              {/* Task Details */}
              <div className="flex-1">
                <button
                  onClick={() => handleTaskTitleClick(task.id)}
                  className="font-semibold text-gray-900 text-lg mb-1 hover:text-indigo-600 transition cursor-pointer text-left"
                >
                  {task.title}
                </button>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <span>🕐</span>
                    <span>Due: {formatDate(task.endDate)}</span>
                  </div>
                </div>

                {/* Assigned To */}
                {task.assignments && task.assignments.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-1">Assigned to:</p>
                    <div className="flex flex-wrap gap-2">
                      {task.assignments.map((assignment) => (
                        <span
                          key={assignment.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 rounded-full text-xs"
                        >
                          <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                          {assignment.internName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Priority Badge */}
              <div className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </div>
            </div>
          ))}

          {/* Task Details Modal */}
          <TaskDetailsModal
            isOpen={showTaskDetailsModal}
            taskId={selectedTaskForDetails || ''}
            projectTitle={''}
            onClose={() => {
              setShowTaskDetailsModal(false);
              setSelectedTaskForDetails(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
