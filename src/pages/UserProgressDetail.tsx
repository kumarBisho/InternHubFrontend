import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import profileService from '../services/profileService';
import taskService from '../services/taskService';
import projectService from '../services/projectService';
import { useNavigate } from 'react-router-dom';

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
  role?: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  endDate: string;
  projectId?: string;
}

interface Project {
  id: string;
  title: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  progress?: number;
  techStack?: string[];
  repositoryUrl?: string;
  documentationUrl?: string;
  demoUrl?: string;
}

export default function UserProgressDetail() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isIntern, setIsIntern] = useState(false);  // Track if user is an Intern

  useEffect(() => {
    if (!userId) {
      setError('User ID not provided');
      setLoading(false);
      return;
    }

    loadUserProgress();
  }, [userId]);

  const loadUserProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!userId) {
        setError('User ID not provided');
        return;
      }

      console.log('[UserProgressDetail] ========== LOAD START ==========');
      console.log('[UserProgressDetail] Loading data for userId:', userId);

      // STEP 1: Fetch profile (now includes role)
      console.log('[UserProgressDetail] STEP 1: Fetching profile...');
      const profileData = await profileService.getUserProfile(userId);
      console.log('[UserProgressDetail] Profile fetched:', profileData);
      console.log('[UserProgressDetail] Profile raw role field:', profileData?.role, 'Type:', typeof profileData?.role);

      // Extract role from profile - backend returns role NAME not number (e.g., "Admin", "Manager", "Mentor", "Intern")
      const userRole = (profileData?.role?.toString().toLowerCase().trim() || '');
      console.log('[UserProgressDetail] User role extracted:', userRole, 'Original:', profileData?.role);

      // Determine if user is Intern, Mentor, Manager, or Admin
      const isIntern = userRole === 'intern';
      const isMentor = userRole === 'mentor';
      const isManager = userRole === 'manager';
      const isAdmin = userRole === 'admin';
      console.log('[UserProgressDetail] Role classification - Intern:', isIntern, 'Mentor:', isMentor, 'Manager:', isManager, 'Admin:', isAdmin);

      // STEP 2: Fetch PROJECTS based on role
      console.log('[UserProgressDetail] STEP 2: Fetching projects based on role...');
      let projectsArray: Project[] = [];
      try {
        if (isMentor) {
          console.log('[UserProgressDetail] 👨‍🏫 Mentor detected - fetching projects for mentor');
          const projectsData = await projectService.getProjectsForMentor(userId);
          projectsArray = Array.isArray(projectsData) ? projectsData : 
                         (projectsData ? [projectsData] : []);
        } else if (isIntern) {
          console.log('[UserProgressDetail] 👨‍💼 Intern detected - fetching projects for intern');
          const projectsData = await projectService.getProjectsForIntern(userId);
          projectsArray = Array.isArray(projectsData) ? projectsData : 
                         (projectsData ? [projectsData] : []);
        } else if (isManager || isAdmin) {
          console.log('[UserProgressDetail] 👔 Manager/Admin detected - fetching all projects');
          const projectsData = await projectService.getProjects();
          projectsArray = Array.isArray(projectsData) ? projectsData : 
                         (projectsData ? [projectsData] : []);
        } else {
          console.warn('[UserProgressDetail] ⚠️ Unknown role - treating as Intern');
          const projectsData = await projectService.getProjectsForIntern(userId);
          projectsArray = Array.isArray(projectsData) ? projectsData : 
                         (projectsData ? [projectsData] : []);
        }
        console.log('[UserProgressDetail] ✅ Projects fetched successfully');
        console.log('[UserProgressDetail] Total projects assigned:', projectsArray.length);
        console.log('[UserProgressDetail] Projects:', projectsArray);
      } catch (projectErr: any) {
        console.error('[UserProgressDetail] ❌ ERROR fetching projects:', {
          message: projectErr.message,
          status: projectErr.response?.status,
          statusText: projectErr.response?.statusText,
          responseData: projectErr.response?.data
        });
        projectsArray = [];
      }

      // STEP 3: Fetch TASKS - Only for Interns
      console.log('[UserProgressDetail] STEP 3: Fetching tasks (only for Interns)...');
      let tasksArray: Task[] = [];
      if (isIntern) {
        try {
          console.log('[UserProgressDetail] 📋 Fetching tasks for intern');
          const tasksData = await taskService.getTasksAssignedToIntern(userId);
          tasksArray = Array.isArray(tasksData) ? tasksData : 
                      (tasksData ? [tasksData] : []);
          console.log('[UserProgressDetail] ✅ Tasks fetched successfully');
          console.log('[UserProgressDetail] Total tasks assigned:', tasksArray.length);
          console.log('[UserProgressDetail] Tasks:', tasksArray);
        } catch (taskErr: any) {
          console.error('[UserProgressDetail] ❌ ERROR fetching tasks:', {
            message: taskErr.message,
            status: taskErr.response?.status,
            statusText: taskErr.response?.statusText,
            responseData: taskErr.response?.data
          });
          tasksArray = [];
        }
      } else {
        console.log('[UserProgressDetail] ℹ️ Skipping task fetch - not an Intern (role:', userRole + ')');
      }

      // STEP 4: Combine and set state
      console.log('[UserProgressDetail] STEP 4: Combining data...');
      const profileWithRole: ProfileData = {
        ...profileData,
        role: userRole  // Use the role we extracted
      };

      console.log('[UserProgressDetail] Profile created with role:');
      console.log('  - profileData.role:', profileData?.role);
      console.log('  - userRole:', userRole);
      console.log('  - profileWithRole.role:', profileWithRole.role);
      console.log('  - Full profileWithRole:', profileWithRole);
      console.log('[UserProgressDetail] Profile:', profileWithRole);
      console.log('[UserProgressDetail] User Role:', userRole);
      console.log('[UserProgressDetail] Projects count:', projectsArray.length);
      console.log('[UserProgressDetail] Tasks count:', tasksArray.length);
      console.log('[UserProgressDetail] Is Intern:', isIntern, '| Is Mentor:', isMentor, '| Is Manager:', isManager, '| Is Admin:', isAdmin);
      console.log('═══════════════════════════════════════════════════════');

      setProfile(profileWithRole);
      setProjects(projectsArray);
      setTasks(tasksArray);
      setIsIntern(isIntern);  // Set isIntern state

      console.log('[UserProgressDetail] ========== LOAD COMPLETE ==========');
    } catch (err: any) {
      console.error('[UserProgressDetail] ❌ FATAL ERROR:', err);
      setError(typeof err === 'string' ? err : 'Failed to load user progress data');
      setProfile(null);
      setTasks([]);
      setProjects([]);
      setIsIntern(false);
    } finally {
      setLoading(false);
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(t => {
      if (!t.status || typeof t.status !== 'string') return false;
      return t.status.toLowerCase() === status.toLowerCase();
    });
  };

  const getCompletedProjectsCount = () => {
    if (projects.length === 0) return 0;
    return projects.filter(p => {
      if (!p.status || typeof p.status !== 'string') return false;
      return p.status.toLowerCase() === 'completed';
    }).length;
  };

  const getTaskPercentage = () => {
    if (tasks.length === 0) return 0;
    const completed = getTasksByStatus('completed').length;
    return Math.round((completed / tasks.length) * 100);
  };

  const getProjectPercentage = () => {
    if (projects.length === 0) return 0;
    const completedCount = getCompletedProjectsCount();
    return Math.round((completedCount * 100) / projects.length);
  };;


  const getLevelColor = (level: string | undefined) => {
    if (!level || typeof level !== 'string') return 'bg-gray-100 text-gray-800';
    switch (level.toLowerCase()) {
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


  const getRoleDisplay = (role: string | undefined) => {
    console.log('[getRoleDisplay] CALLED');
    console.log('  - Input role:', role);
    console.log('  - Type:', typeof role);
    console.log('  - Is undefined?', role === undefined);
    console.log('  - Is null?', role === null);
    console.log('  - Is empty string?', role === '');
    
    // Handle falsy values - but log what we got
    if (role === undefined || role === null) {
      console.log('[getRoleDisplay]  → Returning "User" (no role provided)');
      return 'User';
    }
    
    // Convert to string and trim
    const roleStr = String(role).toLowerCase().trim();
    console.log('  - Processed roleStr:', roleStr);
    
    // Check for role matches - backend returns "Admin", "Manager", "Mentor", "Intern"
    if (roleStr === 'admin') {
      console.log('[getRoleDisplay]  → Returning "Admin"');
      return 'Admin';
    }
    if (roleStr === 'manager') {
      console.log('[getRoleDisplay]  → Returning "Manager"');
      return 'Manager';
    }
    if (roleStr === 'mentor') {
      console.log('[getRoleDisplay]  → Returning "Mentor"');
      return 'Mentor';
    }
    if (roleStr === 'intern') {
      console.log('[getRoleDisplay]  → Returning "Intern"');
      return 'Intern';
    }
    
    // Unknown role - return as-is with capitalization
    console.log('[getRoleDisplay]  → Unknown role, returning capitalized:', role);
    return String(role).charAt(0).toUpperCase() + String(role).slice(1).toLowerCase();
  };

  const getRoleBadgeColor = (role: string | undefined) => {
    if (!role) return 'bg-gray-100 text-gray-800';
    
    const roleStr = String(role).toLowerCase().trim();
    if (roleStr === 'admin') return 'bg-red-100 text-red-800';
    if (roleStr === 'manager') return 'bg-yellow-100 text-yellow-800';
    if (roleStr === 'mentor') return 'bg-blue-100 text-blue-800';
    if (roleStr === 'intern') return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
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
        <div className="max-w-6xl mx-auto mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">User Progress</h1>
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
                onClick={loadUserProgress}
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
                <div onClick={() => navigate(`/profile/${profile.id}`)} className="cursor-pointer w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-semibold flex-shrink-0">
                  {getInitials()}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900">
                    <span onClick={() => navigate(`/profile/${profile.id}`)} className="cursor-pointer hover:text-indigo-600 transition">
                        {profile.firstName} {profile.lastName}
                    </span>
                  </h2>
                  <p className="text-gray-600 mt-1">{profile.email}</p>
                  <span className={`inline-block px-4 py-2 text-sm font-medium rounded-full mt-3 ${getRoleBadgeColor(profile.role)}`}>
                    {getRoleDisplay(profile.role)}
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

            {/* Progress Overview - Only for Interns */}
            {isIntern && (
              <>
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
                        <p className="text-4xl font-bold text-purple-600 mt-2">{getTaskPercentage()}%</p>
                      </div>
                      <span className="text-4xl opacity-20">📊</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Task Progress</h3>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full transition-all duration-500"
                      style={{ width: `${getTaskPercentage()}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    {getTasksByStatus('completed').length} of {tasks.length} tasks completed
                  </p>
                </div>
              </>
            )}

            {/* Project Summary */}
            {projects.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Projects</p>
                      <p className="text-4xl font-bold text-indigo-600 mt-2">{projects.length}</p>
                    </div>
                    <span className="text-4xl opacity-20">📁</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Completed</p>
                      <p className="text-4xl font-bold text-green-600 mt-2">{getCompletedProjectsCount()}</p>
                    </div>
                    <span className="text-4xl opacity-20">✅</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Overall Progress</p>
                      <p className="text-4xl font-bold text-purple-600 mt-2">{getProjectPercentage()}%</p>
                    </div>
                    <span className="text-4xl opacity-20">📊</span>
                  </div>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Project Progress</h3>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full transition-all duration-500"
                  style={{ width: `${getProjectPercentage()}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                {getCompletedProjectsCount()} of {projects.length} projects completed
              </p>
            </div>

            {/* Skills Section */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Skills</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.skills.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="font-medium text-gray-900">{skill.name}</span>
                      <span className={'px-3 py-1 rounded-full text-sm font-medium ' + getLevelColor(skill.level)}>
                        {skill.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assigned Tasks Section - Independent Display */}
            {/* {isIntern && tasks.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Assigned Tasks</h3>
                <div className="space-y-4">
                  {tasks.map((task) => {
                    const statusClass = 
                      task.status?.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status?.toLowerCase() === 'in progress' ? 'bg-blue-100 text-blue-800' :
                      task.status?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800';
                    
                    const priorityClass = 
                      task.priority?.toLowerCase() === 'high' ? 'bg-red-100 text-red-800' :
                      task.priority?.toLowerCase() === 'medium' ? 'bg-orange-100 text-orange-800' :
                      'bg-green-100 text-green-800';

                    const statusDisplay =
                      task.status?.toLowerCase() === 'completed' ? '✓ Completed' :
                      task.status?.toLowerCase() === 'in progress' ? '⏳ In Progress' :
                      '○ Not Started';

                    return (
                      <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-lg">{task.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">Task ID: {task.id}</p>
                          </div>
                          <div className="flex gap-2">
                            <span className={'px-3 py-1 rounded-full text-xs font-medium ' + statusClass}>
                              {task.status || 'Unknown'}
                            </span>
                            <span className={'px-3 py-1 rounded-full text-xs font-medium ' + priorityClass}>
                              {task.priority || 'N/A'}
                            </span>
                          </div>
                        </div>
                        
                        {task.projectId && (
                          <p className="text-sm text-gray-600 mb-2">Project ID: {task.projectId}</p>
                        )}
                        
                        {task.endDate && (
                          <div className="flex items-center text-sm text-gray-600 mb-3">
                            <span className="mr-2">📅</span>
                            <span>Due: {new Date(task.endDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <span className="inline-block w-2 h-2 bg-gray-400 rounded-full"></span>
                          <span>{statusDisplay}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )} */}

            {/* No Tasks Message */}
            {/* {isIntern && tasks.length === 0 && (
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📋</span>
                  <div>
                    <h4 className="font-semibold text-blue-900">No Tasks Assigned</h4>
                    <p className="text-sm text-blue-800 mt-1">You don't have any assigned tasks yet. Check back later or contact your mentor.</p>
                  </div>
                </div>
              </div>
            )} */}
          </div>
        )}
      </div>

    </div>
  );
}
