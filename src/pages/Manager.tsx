import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import api from '../services/api';

interface ManagerDashboard {
  role: string;
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  totalUsers: number;
  totalInterns: number;
  totalMentors: number;
}

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

export default function Manager() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [dashboard, setDashboard] = useState<ManagerDashboard | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch dashboard
        const dashboardResponse = await api.get('/dashboard');
        setDashboard(dashboardResponse.data);
        
        // Fetch all projects
        const projectsResponse = await api.get('/projects');
        setProjects(projectsResponse.data || []);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
        setError(errorMessage);
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 flex-1">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Manager Dashboard</h1>
          {/* <p className="text-gray-600 text-lg">View and manage projects, tasks, and team progress</p> */}
        </div>

        {/* Read-Only Badge */}
        {/* <div className="mb-6 inline-block bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-700 font-medium">📖 Read-Only Access - You have view-only permissions</p>
        </div> */}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 font-medium">Error loading dashboard: {error}</p>
          </div>
        )}

        {/* Dashboard Content */}
        {!loading && dashboard && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Projects Card */}
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Projects</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{dashboard.totalProjects}</p>
                    <p className="text-green-600 text-sm mt-2">{dashboard.activeProjects} Active</p>
                  </div>
                  <div className="text-4xl">📋</div>
                </div>
              </div>

              {/* Tasks Card */}
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Tasks</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{dashboard.totalTasks}</p>
                    <p className="text-yellow-600 text-sm mt-2">{dashboard.pendingTasks} Pending</p>
                  </div>
                  <div className="text-4xl">✓</div>
                </div>
              </div>

              {/* Users Card */}
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{dashboard.totalUsers}</p>
                    <p className="text-blue-600 text-sm mt-2">{dashboard.totalInterns} Interns</p>
                  </div>
                  <div className="text-4xl">👥</div>
                </div>
              </div>

              {/* Completion Card */}
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Completed Tasks</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{dashboard.completedTasks}</p>
                    <p className="text-gray-600 text-sm mt-2">
                      {dashboard.totalTasks > 0 
                        ? Math.round((dashboard.completedTasks / dashboard.totalTasks) * 100) 
                        : 0}% Complete
                    </p>
                  </div>
                  <div className="text-4xl">✅</div>
                </div>
              </div>
            </div>

            {/* Projects Section */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">All Projects</h2>
              {projects.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
                  <p className="text-gray-600 text-lg">No projects found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <div
                      className="bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition duration-300 border border-gray-100"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            <span key={project.id} onClick={()=> navigate(`/projects/${project.id}`)} className='cursor-pointer hover:text-indigo-600 transition'>
                              {project.title}
                            </span>
                            </h3>
                          <p className="text-gray-600 text-sm line-clamp-2">{project.description || 'No description'}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ml-4 ${
                          project.status?.toLowerCase() === 'active' || project.status?.toLowerCase() === 'in-progress'
                            ? 'bg-green-100 text-green-800'
                            : project.status?.toLowerCase() === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : project.status?.toLowerCase() === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status || 'Active'}
                        </span>
                      </div>

                      {/* Dates */}
                      <div className="flex gap-4 mb-4 text-xs text-gray-600">
                        {project.startDate && (
                          <div>
                            <span className="font-semibold">Start:</span> {new Date(project.startDate).toLocaleDateString()}
                          </div>
                        )}
                        {project.endDate && (
                          <div>
                            <span className="font-semibold">End:</span> {new Date(project.endDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {project.progress !== undefined && (
                        <div className="mb-4">
                          <div className="flex justify-between mb-1 items-center">
                            <span className="text-xs font-semibold text-gray-700">Progress</span>
                            <span className="text-xs font-bold text-indigo-600">{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(project.progress, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Tech Stack */}
                      {project.techStack && project.techStack.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1">
                          {project.techStack.slice(0, 3).map((tech, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.techStack.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                              +{project.techStack.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Access Navigation */}
            {/* <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"> */}
              {/* Tasks Navigation */}
              {/* <div
                className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 cursor-pointer hover:shadow-lg transition border-2 border-yellow-200"
                onClick={() => navigateTo('/manager/tasks')}
              >
                <p className="text-yellow-700 font-semibold text-lg mb-2">✓ Tasks</p>
                <p className="text-yellow-600 text-sm">Monitor project tasks</p>
              </div> */}

              {/* Users Navigation */}
              {/* <div
                className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 cursor-pointer hover:shadow-lg transition border-2 border-green-200"
                onClick={() => navigateTo('/manager/users')}
              >
                <p className="text-green-700 font-semibold text-lg mb-2">👥 Users</p>
                <p className="text-green-600 text-sm">View team members</p>
              </div> */}

              {/* Progress Navigation */}
              {/* <div
                className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 cursor-pointer hover:shadow-lg transition border-2 border-purple-200"
                onClick={() => navigateTo('/manager/progress')}
              >
                <p className="text-purple-700 font-semibold text-lg mb-2">📊 Progress</p>
                <p className="text-purple-600 text-sm">Track intern progress</p>
              </div> */}
            {/* </div> */}

            {/* Summary Statistics */}
            {/* <div className="mt-8 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Team Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-gray-600 text-sm">Team Members</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{dashboard.totalUsers}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {dashboard.totalMentors} Mentors, {dashboard.totalInterns} Interns
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Active Projects</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{dashboard.activeProjects}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {dashboard.totalProjects - dashboard.activeProjects} Inactive
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Task Completion</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {dashboard.totalTasks > 0 
                      ? Math.round((dashboard.completedTasks / dashboard.totalTasks) * 100) 
                      : 0}%
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    {dashboard.completedTasks} of {dashboard.totalTasks} completed
                  </p>
                </div>
              </div>
            </div> */}
          </>
        )}
      </main>
    </div>
  );
}
