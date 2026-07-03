import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import projectService from '../services/projectService';
import authService from '../services/authService';
import CreateProjectModal from '../components/CreateProjectModal';

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

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

const ProjectCard = ({ project, onClick }: ProjectCardProps) => {
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

  const progress = project.progress || 0;

  return (
    <div 
      className="bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition duration-300 border border-gray-100"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition">
            <span onClick={onClick} className="cursor-pointer hover:text-indigo-600 transition">
              {project.title}
            </span>
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">{project.description || 'No description available'}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
          {project.status || 'Active'}
        </span>
      </div>

      {/* Dates */}
      <div className="flex gap-6 mb-4 text-sm text-gray-600">
        <div>
          <span className="font-semibold">Start:</span> {formatDate(project.startDate)}
        </div>
        <div>
          <span className="font-semibold">End:</span> {formatDate(project.endDate)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between mb-2 items-center">
          <span className="text-sm font-semibold text-gray-700">Progress</span>
          <span className="text-sm font-bold text-indigo-600">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              progress <= 33 ? 'bg-red-500' :
              progress <= 66 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Tech Stack */}
      {project.techStack && project.techStack.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {project.techStack.map((tech, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium hover:bg-indigo-200 transition"
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      {/* Links */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
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
  );
};

export default function Projects() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isShowCreateModal, setIsShowCreateModal] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjects();
      setProjects(Array.isArray(data) ? data : [data]);
      setError(null);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter projects by status
  const filteredProjects = filterStatus === 'all'
    ? projects
    : projects.filter(p => p.status?.toLowerCase() === filterStatus.toLowerCase());

  const activeProjects = projects.filter(p => p.status?.toLowerCase() === 'active' || p.status?.toLowerCase() === 'in-progress').length;
  const completedProjects = projects.filter(p => p.status?.toLowerCase() === 'completed' || p.status?.toLowerCase() === 'done').length;

  const handleProjectCardClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Assigned Projects</h1>
              </div>
            <div className="flex items-center gap-4">
              {user?.role?.toLowerCase() === 'admin' && (
                <button
                  onClick={() => setIsShowCreateModal(true)}
                  className="cursor-pointer px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition flex items-center gap-2"
                >
                  <span className="text-lg">+</span> New Project
                </button>
              )}
              <div className="text-right">
                <div className="text-3xl font-bold text-indigo-600">{projects.length}</div>
                <div className="text-gray-600 text-sm">Total Projects</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-md border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Projects</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{activeProjects}</p>
              </div>
              <div className="text-5xl">📊</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completed Projects</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{completedProjects}</p>
              </div>
              <div className="text-5xl">✅</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Progress</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {projects.length > 0 
                    ? Math.round((projects.reduce((sum, p) => sum + (p.progress || 0), 0)) / projects.length)
                    : 0}%
                </p>
              </div>
              <div className="text-5xl">🎯</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <div className="flex gap-4">
            {[
              { label: 'All Projects', value: 'all', count: projects.length },
              { label: 'Active', value: 'active', count: activeProjects },
              { label: 'Completed', value: 'completed', count: completedProjects },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setFilterStatus(tab.value)}
                className={`cursor-pointer px-4 py-3 font-medium border-b-2 transition ${
                  filterStatus === tab.value
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4 animate-bounce">
                <span className="text-3xl">📦</span>
              </div>
              <p className="text-gray-600 font-medium">Loading your projects...</p>
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
            <p className="text-xl font-semibold text-gray-900 mb-2">No projects assigned yet</p>
            <p className="text-gray-600 mb-8">You don't have any assigned projects. Check back later!</p>
          </div>
        )}

        {/* No filtered results */}
        {!loading && projects.length > 0 && filteredProjects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl font-semibold text-gray-900 mb-2">No {filterStatus} projects</p>
            <p className="text-gray-600">Try selecting a different filter tab</p>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && filteredProjects.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredProjects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project}
                onClick={() => handleProjectCardClick(project.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isShowCreateModal}
        onClose={() => setIsShowCreateModal(false)}
        onProjectCreated={fetchProjects}
      />
    </div>
  );
}
