import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import projectService from '../services/projectService';
import Header from '../components/Header';
import TaskDetailsModal from '../components/TaskDetailsModal';

interface ProjectAssignment {
  id: string;
  projectId: string;
  internId: string;
  mentorId?: string;
  assignedAt: string;
  Intern?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    createdAt: string;
    profilePicture?: string;
  };
  Mentor?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    createdAt: string;
    profilePicture?: string;
  };
  intern?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    createdAt: string;
    profilePicture?: string;
  };
  mentor?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    createdAt: string;
    profilePicture?: string;
  };
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    createdAt: string;
    profilePicture?: string;
  };
}

interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  endDate?: string;
  dueDate?: string;
  priority?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  assignments?: Array<{
    id: string;
    userId: string;
    taskId: string;
    user?: {
      id: string;
      firstName: string;
      lastName: string;
      profilePicture?: string;
      email?: string;
    };
  }>;
}

interface EnrichedProject {
  id: string;
  title: string;
  description?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  createdById?: string;
  createdBy?: string;
  techStack?: string[];
  progress?: number;
  repositoryUrl?: string;
  documentationUrl?: string;
  demoUrl?: string;
  assignments?: ProjectAssignment[];
  tasks?: Task[];
}

export const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<EnrichedProject | null>(null);
  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      navigate('/projects');
      return;
    }

    const fetchProjectDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const projectData = (await projectService.getProjectById(projectId)) as unknown as EnrichedProject;
        setProject(projectData);
      } catch (err) {
        setError(typeof err === 'string' ? err : 'Failed to fetch project details');
        console.error('Error fetching project details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId, navigate]);

  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTaskPriorityColor = (priority: string | undefined | any) => {
    if (!priority) return 'bg-gray-100 text-gray-800';
    const lowerPriority = String(priority).toLowerCase();
    switch (lowerPriority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Map numeric status IDs to readable status names
  const getStatusName = (status: string | number | undefined | any): string => {
    if (!status) return 'Unknown';
    const statusStr = String(status).toLowerCase().trim();
    
    // Map numeric IDs to names
    const statusMap: { [key: string]: string } = {
      '0': 'To Do',
      '1': 'In Progress',
      '2': 'In Review',
      '3': 'Completed',
      'todo': 'To Do',
      'to do': 'To Do',
      'in progress': 'In Progress',
      'in review': 'In Review',
      'completed': 'Completed',
      'done': 'Completed',
    };
    
    return statusMap[statusStr] || statusStr.charAt(0).toUpperCase() + statusStr.slice(1);
  };

  // Map numeric priority IDs to readable priority names
  const getPriorityName = (priority: string | number | undefined | any): string => {
    if (!priority) return 'Unknown';
    const priorityStr = String(priority).toLowerCase().trim();
    
    // Map numeric IDs to names
    const priorityMap: { [key: string]: string } = {
      '0': 'Low',
      '1': 'Medium',
      '2': 'High',
      '3': 'Critical',
      'low': 'Low',
      'medium': 'Medium',
      'high': 'High',
      'critical': 'Critical',
    };
    
    return priorityMap[priorityStr] || priorityStr.charAt(0).toUpperCase() + priorityStr.slice(1);
  };

  const parseTechStack = (tech: string | string[] | undefined): string[] => {
    if (!tech) return [];
    if (Array.isArray(tech)) return tech;
    try {
      const parsed = JSON.parse(tech);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const getTaskStatusColor = (status: string | undefined | any) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    const lowerStatus = String(status).toLowerCase();
    switch (lowerStatus) {
      case 'to do':
        return 'bg-gray-100 text-gray-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'in review':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const assignedInterns = (project?.assignments || []).map((a) => ({
    ...a,
    user: a.Intern || a.intern || a.user,
  }));

  const tasks = project?.tasks || [];

  const handleTaskTitleClick = (taskId: string) => {
    setSelectedTaskForDetails(taskId);
    setShowTaskDetailsModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-semibold">Error</p>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!loading && project && (
          <div className="space-y-8">
            {/* Project Overview */}
            <section>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-indigo-600">📋</span> Project Overview
              </h3>
              <div className="bg-white rounded-lg p-6 space-y-4 shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{project.title || 'Loading...'}</h2>
                    <h3 className="text-sm font-bold text-gray-600 mb-1">Description:</h3>
                    <p className="text-gray-900 leading-relaxed">{project.description || 'No description available'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 mb-1">Start Date</h3>
                      <p className="text-gray-900 font-medium">{formatDate(project.startDate)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 mb-1">End Date</h3>
                      <p className="text-gray-900 font-medium">{formatDate(project.endDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                {project.progress !== undefined && (
                  <div>
                    <div className="flex justify-between mb-2 items-center">
                      <span className="text-sm font-semibold text-gray-700">Project Progress</span>
                      <span className="text-sm font-bold text-indigo-600">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          project.progress <= 33
                            ? 'bg-red-500'
                            : project.progress <= 66
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(project.progress, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Tech Stack */}
                {project.techStack && (() => {
                  const techArray = parseTechStack(project.techStack);
                  return techArray.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-3">Tech Stack</p>
                      <div className="flex flex-wrap gap-2">
                        {techArray.map((tech, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Links */}
                <div className="pt-4 border-t border-gray-200 flex flex-wrap gap-3">
                  {project.repositoryUrl && (
                    <a
                      href={project.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium"
                    >
                      <span>🔗</span> Repository
                    </a>
                  )}
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                    >
                      <span>🌐</span> Live Demo
                    </a>
                  )}
                  {project.documentationUrl && (
                    <a
                      href={project.documentationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                    >
                      <span>📄</span> Documentation
                    </a>
                  )}
                </div>
              </div>
            </section>

            {/* Assigned Interns */}
            <section>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-600">👥</span> Assigned Interns ({assignedInterns.length})
              </h3>
              {assignedInterns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assignedInterns.map((assignment) => (
                    <div 
                      className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm hover:shadow-md hover:border-indigo-400 transition"
                    >
                      <div className="flex items-center gap-4">
                        {assignment.user?.profilePicture ? (
                          <img
                            src={assignment.user.profilePicture}
                            alt={`${assignment.user.firstName} ${assignment.user.lastName}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-indigo-400 flex items-center justify-center">
                            <span 
                              key={assignment.id}
                              onClick={() => navigate(`/profile/${assignment.user?.id}`)}
                              className="cursor-pointer text-white font-bold text-lg">
                              {assignment.user?.firstName?.charAt(0)}{assignment.user?.lastName?.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            <span
                              key={assignment.id}
                              onClick={() => navigate(`/profile/${assignment.user?.id}`)}
                              className="cursor-pointer hover:text-indigo-600 transition">
                              {assignment.user?.firstName} {assignment.user?.lastName}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600">{assignment.user?.email}</p>
                          <p className="text-xs text-indigo-600 font-medium mt-1">
                            Assigned: {formatDate(assignment.assignedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg p-6 text-center border border-gray-200">
                  <p className="text-gray-500">No interns assigned to this project yet</p>
                </div>
              )}
            </section>

            {/* Project Tasks */}
            <section>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-purple-600">✓</span> Project Tasks ({tasks.length})
              </h3>
              {tasks.length > 0 ? (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-indigo-300 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <button
                            onClick={() => handleTaskTitleClick(task.id)}
                            className="font-semibold text-gray-900 text-lg mb-1 hover:text-indigo-600 transition cursor-pointer text-left"
                          >
                            {task.title}
                          </button>
                          {/* <p className="text-sm text-gray-600">{task.description || 'No description'}</p> */}
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getTaskStatusColor(task.status)}`}>
                            {getStatusName(task.status)}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getTaskPriorityColor(task.priority)}`}>
                            {getPriorityName(task.priority)}
                          </span>
                        </div>
                      </div>

                      {/* Task Details */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 font-medium">Due Date</p>
                          <p className="text-gray-900">{formatDate(task.dueDate || task.endDate)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium">Created</p>
                          <p className="text-gray-900">{formatDate(task.createdAt)}</p>
                        </div>
                        {task.assignments && task.assignments.length > 0 && (
                          <div>
                            <p className="text-gray-600 font-medium">Assigned To ({task.assignments.length})</p>
                            <div className="flex gap-1">
                              {task.assignments.slice(0, 2).map((assignment) => (
                                <img
                                  key={assignment.id}
                                  src={assignment.user?.profilePicture}
                                  alt={assignment.user?.firstName}
                                  title={`${assignment.user?.firstName} ${assignment.user?.lastName}`}
                                  className="w-6 h-6 rounded-full object-cover border border-gray-300"
                                />
                              ))}
                              {task.assignments.length > 2 && (
                                <span className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-700">
                                  +{task.assignments.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg p-6 text-center border border-gray-200">
                  <p className="text-gray-500">No tasks created for this project yet</p>
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {/* Task Details Modal */}
      <TaskDetailsModal
        isOpen={showTaskDetailsModal}
        taskId={selectedTaskForDetails || ''}
        projectTitle={project?.title || 'Project'}
        onClose={() => {
          setShowTaskDetailsModal(false);
          setSelectedTaskForDetails(null);
        }}
      />
    </div>
  );
};

export default ProjectDetailPage;
