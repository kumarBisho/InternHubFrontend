import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from '../hooks/usePageTitle';
import projectService from '../services/projectService';
import authService from '../services/authService';
import Header from '../components/Header';
import AssignProjectModal from '../components/AssignProjectModal';
import EditProjectModal from '../components/EditProjectModal';

interface Project {
  id: string;
  title: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  createdById: string;
  techStack?: string[];
  progress?: number;
  repositoryUrl?: string;
  documentationUrl?: string;
  demoUrl?: string;
}

export default function ProjectManagement() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if user has permission to access this page (Admin only)
    const userRole = user.role?.toLowerCase();
    if (userRole !== 'admin' && userRole !== '1') {
      navigate('/dashboard');
      return;
    }

    fetchProjects();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if the click is outside any menu
      if (!target.closest('[data-menu]')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      // Fetch all projects for management
      const response = await projectService.getProjects();
      setProjects(Array.isArray(response) ? response : [response]);
      setError(null);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignClick = (projectId: string) => {
    setSelectedProjectId(projectId);
    setShowAssignModal(true);
    setOpenMenuId(null);
  };

  const handleEditClick = (project: Project) => {
    setSelectedProject(project);
    setShowEditModal(true);
    setOpenMenuId(null);
  };

  const handleDeleteClick = (projectId: string) => {
    setSelectedProjectId(projectId);
    setShowDeleteConfirm(true);
    setOpenMenuId(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProjectId) return;

    try {
      setDeleteLoading(true);
      setDeleteError(null);
      await projectService.deleteProject(selectedProjectId);
      
      // Remove from list
      setProjects(projects.filter(p => p.id !== selectedProjectId));
      setShowDeleteConfirm(false);
      setSelectedProjectId(undefined);
    } catch (err) {
      setDeleteError(typeof err === 'string' ? err : 'Failed to delete project');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAssignmentSuccess = () => {
    fetchProjects();
  };

  const handleUpdateSuccess = () => {
    fetchProjects();
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'in-progress':
        return 'bg-green-100 text-green-800';
      case 'completed':
      case 'done':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'on-hold':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleProjectCardClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <>
      <SEOHead
        title="Project Management - InternHub"
        description="Manage and oversee all internship projects"
        keywords={['projects', 'management', 'internship', 'admin']}
      />
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header />

      {/* Main Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4 animate-bounce">
                <span className="text-3xl">📦</span>
              </div>
              <p className="text-gray-600 font-medium">Loading projects...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <div className="flex items-center gap-4">
              <span className="text-3xl">⚠️</span>
              <div>
                <p className="font-semibold text-red-800">Error loading projects</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
              <button
                onClick={fetchProjects}
                className="cursor-pointer ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && projects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl font-semibold text-gray-900 mb-2">No projects available</p>
            <p className="text-gray-600">Create new projects to get started</p>
          </div>
        )}

        {/* Projects Table */}
        {!loading && projects.length > 0 && (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Project Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Start Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">End Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Progress</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {projects.map((project) => (
                    <tr
                      key={project.id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p 
                          className="font-semibold text-gray-900">
                            <span 
                            key={project.id}
                            onClick={() => handleProjectCardClick(project.id)}
                            className="cursor-pointer hover:text-indigo-600 transition">
                              {project.title}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {project.description?.substring(0, 50)}
                            {project.description && project.description.length > 50 ? '...' : ''}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {project.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(project.startDate)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(project.endDate)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full"
                              style={{ width: `${project.progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-bold text-gray-700 w-10">
                            {project.progress || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative inline-block" data-menu>
                          <button
                            onClick={() => setOpenMenuId(openMenuId === project.id ? null : project.id)}
                            className="cursor-pointer p-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
                            title="More options"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="5" r="2" />
                              <circle cx="12" cy="12" r="2" />
                              <circle cx="12" cy="19" r="2" />
                            </svg>
                          </button>

                          {openMenuId === project.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 border border-gray-200" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleAssignClick(project.id)}
                                className="cursor-pointer w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition flex items-center gap-2"
                              >
                                <span>👥</span>
                                <span>Assign</span>
                              </button>
                              <button
                                onClick={() => handleEditClick(project)}
                                className="cursor-pointer w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition flex items-center gap-2 border-t border-gray-200"
                              >
                                <span>✏️</span>
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteClick(project.id)}
                                className="cursor-pointer w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition flex items-center gap-2 border-t border-gray-200"
                              >
                                <span>🗑️</span>
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Assign Project Modal */}
      <AssignProjectModal
        isOpen={showAssignModal}
        projectId={selectedProjectId}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedProjectId(undefined);
        }}
        onAssignmentSuccess={handleAssignmentSuccess}
      />

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={showEditModal}
        project={selectedProject}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProject(null);
        }}
        onUpdateSuccess={handleUpdateSuccess}
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
                Delete Project?
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete this project? This action cannot be undone.
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
                    setSelectedProjectId(undefined);
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
    </>
  );
}
