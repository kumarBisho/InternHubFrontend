import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import projectService from '../services/projectService';
import taskService from '../services/taskService';
import Header from '../components/Header';
import CreateTaskModal from '../components/CreateTaskModal';
import AssignTaskModal from '../components/AssignTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import AssignedTasksList from '../components/AssignedTasksList';
import TaskDetailsModal from '../components/TaskDetailsModal';

interface Project {
  id: string;
  title: string;
  description?: string;
  status: string;
  createdAt: string;
}

interface Task {
  id: string;
  title: string;
  projectId: string;
  endDate: string;
  priority: string;
  status: string;
  createdAt: string;
}

export default function Tasks() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [view, setView] = useState<'mentor' | 'intern'>('intern');
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  useEffect(() =>{
    // Only initialize once on mount
    if (hasInitialized.current) return;
    
    if (!user) {
      navigate('/login');
      return;
    }

    hasInitialized.current = true;

    const initializeView = async () => {
      try {
        // Determine view based on user role
        const userRole = user.role?.toLowerCase();
        
        // Redirect admin users away from tasks page
        if (userRole === 'admin' || user.role === '1') {
          navigate('/dashboard');
          return;
        }
        
        if (userRole === 'mentor' || userRole === '3') {
          setView('mentor');
          setIsReadOnly(false);
          await fetchProjects();
        } else if (userRole === 'manager' || userRole === '2') {
          // Manager gets read-only access
          setView('mentor');
          setIsReadOnly(true);
          await fetchProjects();
        } else if (userRole === 'intern' || userRole === '4') {
          setView('intern');
        }
      } finally {
        setLoading(false);
      }
    };

    initializeView();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-task-menu]')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectService.getProjects();
      setProjects(Array.isArray(response) ? response : [response]);
      setError(null);
    } catch (err) {
      setError('Failed to load projects');
      console.error(err);
    }
  };

  const handleProjectSelect = async (projectId: string) => {
    setSelectedProject(projectId);
    try {
      const projectTasks = await taskService.getTasksByProject(projectId);
      setTasks(Array.isArray(projectTasks) ? projectTasks : [projectTasks]);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setTasks([]);
    }
  };

  const handleTaskCreated = () => {
    if (selectedProject) {
      handleProjectSelect(selectedProject);
    }
  };

  const handleTaskAssigned = () => {
    if (selectedProject) {
      handleProjectSelect(selectedProject);
    }
  };

  const handleMenuClick = (taskId: string) => {
    setOpenMenuId(openMenuId === taskId ? null : taskId);
  };

  const handleTaskTitleClick = (taskId: string) => {
    setSelectedTaskForDetails(taskId);
    setShowTaskDetailsModal(true);
  };

  const handleAssignTaskClick = (task: Task) => {
    if (!selectedProject) {
      setError('No project selected');
      return;
    }
    setSelectedTaskId(task.id);
    setShowAssignTaskModal(true);
    setOpenMenuId(null);
  };

  const handleEditClick = (task: Task) => {
    setSelectedTask(task);
    setShowEditTaskModal(true);
    setOpenMenuId(null);
  };

  const handleDeleteClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setShowDeleteConfirm(true);
    setOpenMenuId(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTaskId) return;

    try {
      setDeleteLoading(true);
      setDeleteError(null);
      await taskService.deleteTask(selectedTaskId);
      
      // Remove from list
      setTasks(tasks.filter(t => t.id !== selectedTaskId));
      setShowDeleteConfirm(false);
      setSelectedTaskId(null);
    } catch (err) {
      setDeleteError(typeof err === 'string' ? err : 'Failed to delete task');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleTaskUpdated = () => {
    if (selectedProject) {
      handleProjectSelect(selectedProject);
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

  const getStatusColor = (status: string) => {
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
  };



  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (view === 'intern') {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header />
        
        <div className="flex-1 py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Tasks</h1>
            <AssignedTasksList />
          </div>
        </div>
      </div>
    );
  }

  // Mentor View
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Temporary header section for page title */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          </div>
        </div>
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Projects</h2>
              {projects.length === 0 ? (
                <p className="text-gray-600 text-sm">No projects available</p>
              ) : (
                <div className="space-y-2">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleProjectSelect(project.id)}
                      className={`cursor-pointer w-full text-left px-4 py-2 rounded-lg transition ${
                        selectedProject === project.id
                          ? 'bg-indigo-100 text-indigo-700 font-semibold'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <p className="font-medium truncate">{project.title}</p>
                      <p className="text-xs opacity-75">{formatDate(project.createdAt)}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tasks Section */}
          <div className="lg:col-span-2">
            {selectedProject ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Project Tasks</h2>
                  {!isReadOnly && (
                    <button
                      onClick={() => setShowCreateTaskModal(true)}
                      className="cursor-pointer px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition"
                    >
                      + Create Task
                    </button>
                  )}
                </div>

                {tasks.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">No tasks created yet</p>
                    {!isReadOnly && (
                      <button
                        onClick={() => setShowCreateTaskModal(true)}
                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 font-medium transition"
                      >
                        Create the first task
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition bg-gray-50"
                      >
                        <div className="flex-1">
                          <button
                            onClick={() => handleTaskTitleClick(task.id)}
                            className="cursor-pointer font-semibold text-gray-900 hover:text-indigo-600 transition text-left text-base"
                          >
                            {task.title}
                          </button>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span>Due: {formatDate(task.endDate)}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        
                        {!isReadOnly && (
                          /* Three-dot menu */
                          <div className="relative inline-block" data-task-menu>
                            <button
                              onClick={() => handleMenuClick(task.id)}
                              className="cursor-pointer p-2 text-gray-600 hover:bg-gray-200 rounded-full transition"
                              title="More options"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="5" r="2" />
                                <circle cx="12" cy="12" r="2" />
                                <circle cx="12" cy="19" r="2" />
                              </svg>
                            </button>

                            {openMenuId === task.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 border border-gray-200" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => handleAssignTaskClick(task)}
                                  className="cursor-pointer w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition flex items-center gap-2"
                                >
                                  <span>👥</span>
                                  <span>Assign</span>
                                </button>
                                <button
                                  onClick={() => handleEditClick(task)}
                                  className="cursor-pointer w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition flex items-center gap-2 border-t border-gray-200"
                                >
                                  <span>✏️</span>
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(task.id)}
                                  className="cursor-pointer w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition flex items-center gap-2 border-t border-gray-200"
                                >
                                  <span>🗑️</span>
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-600 text-lg">Select a project to view and create tasks</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <TaskDetailsModal
        isOpen={showTaskDetailsModal}
        taskId={selectedTaskForDetails || ''}
        projectTitle={projects.find((p) => p.id === selectedProject)?.title || 'Project'}
        onClose={() => {
          setShowTaskDetailsModal(false);
          setSelectedTaskForDetails(null);
        }}
      />

      <CreateTaskModal
        isOpen={showCreateTaskModal && !!selectedProject}
        projectId={selectedProject || ''}
        projectTitle={projects.find((p) => p.id === selectedProject)?.title || 'Project'}
        onClose={() => setShowCreateTaskModal(false)}
        onSuccess={handleTaskCreated}
      />

      <AssignTaskModal
        isOpen={showAssignTaskModal && !!selectedProject && !!selectedTaskId}
        taskId={selectedTaskId || ''}
        projectId={selectedProject || ''}
        taskTitle={tasks.find((t) => t.id === selectedTaskId)?.title || 'Task'}
        mentorId={user?.id || ''}
        onClose={() => {
          setShowAssignTaskModal(false);
          setSelectedTaskId(null);
        }}
        onSuccess={handleTaskAssigned}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={showEditTaskModal}
        task={selectedTask}
        onClose={() => {
          setShowEditTaskModal(false);
          setSelectedTask(null);
        }}
        onUpdateSuccess={handleTaskUpdated}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <span className="text-5xl">⚠️</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                Delete Task?
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete this task? This action cannot be undone.
              </p>

              {deleteError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                  {deleteError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedTaskId(null);
                    setDeleteError(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

