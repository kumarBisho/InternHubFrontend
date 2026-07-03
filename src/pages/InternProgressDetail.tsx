import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import profileService from '../services/profileService';
import taskService from '../services/taskService';

interface Skill {
  id?: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

interface ProfileData {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  bio?: string;
  startDate?: string;
  endDate?: string;
  interests?: string;
  profileImageUrl?: string;
  skills: Skill[];
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  endDate: string;
  projectId?: string;
}

export default function InternProgressDetail() {
  const { externId } = useParams<{ externId: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!externId) {
      setError('Intern ID not provided');
      setLoading(false);
      return;
    }

    loadInternProgress();
  }, [externId]);

  const loadInternProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!externId) {
        setError('Intern ID not provided');
        return;
      }

      // Fetch profile and tasks in parallel
      const [profileData, tasksData] = await Promise.all([
        profileService.getUserProfile(externId),
        taskService.getTasksAssignedToIntern(externId)
      ]);

      setProfile(profileData);
      setTasks(Array.isArray(tasksData) ? tasksData : [tasksData]);
    } catch (err: any) {
      console.error('Error loading intern progress:', err);
      setError(typeof err === 'string' ? err : 'Failed to load intern progress data');
      setProfile(null);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(t => t.status?.toLowerCase() === status.toLowerCase());
  };

  const getProgressPercentage = () => {
    if (tasks.length === 0) return 0;
    const completed = getTasksByStatus('completed').length;
    return Math.round((completed / tasks.length) * 100);
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
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'expert':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'beginner':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const getInitials = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`;
    }
    return '?';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />

      <div className="flex-1 p-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Intern Progress</h1>
          <p className="text-gray-600">View detailed progress information</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-6xl mx-auto">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-red-800 font-medium mb-2">Error Loading Progress</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
              <button
                onClick={loadInternProgress}
                className="px-4 py-2 bg-red-100 text-red-700 rounded font-medium hover:bg-red-200 transition flex-shrink-0"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* Content */}
        {!loading && profile && (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-start gap-6 mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-semibold flex-shrink-0">
                  {getInitials()}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <p className="text-gray-600 mt-1">{profile.email}</p>
                  <span className="inline-block px-4 py-2 text-sm font-medium rounded-full mt-3 bg-purple-100 text-purple-800">
                    Intern
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.phone && (
                    <div className="flex items-start gap-3">
                      <span className="text-xl">📱</span>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="text-gray-900 font-medium">{profile.phone}</p>
                      </div>
                    </div>
                  )}
                  {profile.department && (
                    <div className="flex items-start gap-3">
                      <span className="text-xl">🏢</span>
                      <div>
                        <p className="text-sm text-gray-600">Department</p>
                        <p className="text-gray-900 font-medium">{profile.department}</p>
                      </div>
                    </div>
                  )}
                  {profile.position && (
                    <div className="flex items-start gap-3">
                      <span className="text-xl">💼</span>
                      <div>
                        <p className="text-sm text-gray-600">Position</p>
                        <p className="text-gray-900 font-medium">{profile.position}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                  <p className="text-gray-700">{profile.bio}</p>
                </div>
              )}
            </div>

            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Tasks</p>
                    <p className="text-4xl font-bold text-indigo-600 mt-2">{tasks.length}</p>
                  </div>
                  <span className="text-4xl opacity-20">📋</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Completed</p>
                    <p className="text-4xl font-bold text-green-600 mt-2">{getTasksByStatus('completed').length}</p>
                  </div>
                  <span className="text-4xl opacity-20">✅</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Overall Progress</p>
                    <p className="text-4xl font-bold text-purple-600 mt-2">{getProgressPercentage()}%</p>
                  </div>
                  <span className="text-4xl opacity-20">📊</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Progress</h3>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full transition-all duration-500"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                {getTasksByStatus('completed').length} of {tasks.length} tasks completed
              </p>
            </div>

            {/* Tasks by Status */}
            {tasks.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Assigned Tasks</h3>

                {/* In Progress Tasks */}
                {getTasksByStatus('inprogress').length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                      In Progress ({getTasksByStatus('inprogress').length})
                    </h4>
                    <div className="space-y-3">
                      {getTasksByStatus('inprogress').map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">{task.title}</p>
                            <p className="text-sm text-gray-600 mt-1">Due: {formatDate(task.endDate)}</p>
                          </div>
                          <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pending Tasks */}
                {getTasksByStatus('pending').length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
                      Pending ({getTasksByStatus('pending').length})
                    </h4>
                    <div className="space-y-3">
                      {getTasksByStatus('pending').map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">{task.title}</p>
                            <p className="text-sm text-gray-600 mt-1">Due: {formatDate(task.endDate)}</p>
                          </div>
                          <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed Tasks */}
                {getTasksByStatus('completed').length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      Completed ({getTasksByStatus('completed').length})
                    </h4>
                    <div className="space-y-3">
                      {getTasksByStatus('completed').map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg opacity-75">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">{task.title}</p>
                            <p className="text-sm text-gray-600 mt-1">Completed on: {formatDate(task.endDate)}</p>
                          </div>
                          <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className="text-green-600 font-bold text-lg">✓</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Skills Section */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Skills</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.skills.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="font-medium text-gray-900">{skill.name}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(skill.level)}`}>
                        {skill.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
