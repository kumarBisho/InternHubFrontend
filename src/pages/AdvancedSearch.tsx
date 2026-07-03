import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import { Card, Button } from '../components/ui';
import { useNavigate } from 'react-router-dom';
import TaskDetailsModal from '../components/TaskDetailsModal';

import searchService, {
  type TaskSearchResult,
  type ProjectSearchResult,
  type UserSearchResult,
  type TaskSearchRequest,
  type ProjectSearchRequest,
  type UserSearchRequest,
  type PaginatedResults
} from '../services/searchService';
import '../styles/search.css';

type SearchTab = 'all' | 'tasks' | 'projects' | 'users';

const AdvancedSearch = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Results
  const [taskResults, setTaskResults] = useState<PaginatedResults<TaskSearchResult> | null>(null);
  const [projectResults, setProjectResults] = useState<PaginatedResults<ProjectSearchResult> | null>(null);
  const [userResults, setUserResults] = useState<PaginatedResults<UserSearchResult> | null>(null);

  // Task Details Modal
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [selectedTaskProjectTitle, setSelectedTaskProjectTitle] = useState<string>('');

  // Filters
  const [taskFilters, setTaskFilters] = useState<TaskSearchRequest>({
    searchQuery: initialQuery,
    status: '',
    priority: '',
    pageNumber: 1,
    pageSize: 20,
    sortBy: 'CreatedAt',
    sortDescending: true
  });

  const [projectFilters, setProjectFilters] = useState<ProjectSearchRequest>({
    searchQuery: initialQuery,
    status: '',
    pageNumber: 1,
    pageSize: 20,
    sortBy: 'CreatedAt',
    sortDescending: true
  });

  const [userFilters, setUserFilters] = useState<UserSearchRequest>({
    searchQuery: initialQuery,
    role: '',
    pageNumber: 1,
    pageSize: 20,
    sortBy: 'FirstName',
    sortDescending: false
  });

  useEffect(() => {
    // Load all results on page mount
    performSearch('all');
  }, []);

  const performSearch = async (
    tab: SearchTab = activeTab,
    tFilters?: TaskSearchRequest,
    pFilters?: ProjectSearchRequest,
    uFilters?: UserSearchRequest
  ) => {
    try {
      setLoading(true);
      setError('');

      const taskF = tFilters || taskFilters;
      const projectF = pFilters || projectFilters;
      const userF = uFilters || userFilters;

      if (tab === 'all' || tab === 'tasks') {
        const results = await searchService.searchTasks(taskF);
        setTaskResults(results);
      }

      if (tab === 'all' || tab === 'projects') {
        const results = await searchService.searchProjects(projectF);
        setProjectResults(results);
      }

      if (tab === 'all' || tab === 'users') {
        const results = await searchService.searchUsers(userF);
        setUserResults(results);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Search failed');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Use empty string if no query entered (will show all results)
    const searchQuery = query.trim() || '';
    
    const filters = {
      tasks: { ...taskFilters, searchQuery: searchQuery, pageNumber: 1 },
      projects: { ...projectFilters, searchQuery: searchQuery, pageNumber: 1 },
      users: { ...userFilters, searchQuery: searchQuery, pageNumber: 1 }
    };

    setTaskFilters(filters.tasks as TaskSearchRequest);
    setProjectFilters(filters.projects as ProjectSearchRequest);
    setUserFilters(filters.users as UserSearchRequest);
    setSearchParams({ q: searchQuery });
    
    // Pass new filters directly and set tab to 'all'
    setActiveTab('all');
    performSearch('all', filters.tasks as TaskSearchRequest, filters.projects as ProjectSearchRequest, filters.users as UserSearchRequest);
  };

  const handleTaskFilterChange = (key: string, value: string | number | boolean) => {
    setTaskFilters(prev => ({ ...prev, [key]: value, pageNumber: 1 }));
  };

  const handleProjectFilterChange = (key: string, value: string | number | boolean) => {
    setProjectFilters(prev => ({ ...prev, [key]: value, pageNumber: 1 }));
  };

  const handleUserFilterChange = (key: string, value: string | number | boolean) => {
    setUserFilters(prev => ({ ...prev, [key]: value, pageNumber: 1 }));
  };

  const resetFilters = () => {
    setTaskFilters({ searchQuery: query, status: '', priority: '', pageNumber: 1, pageSize: 20, sortBy: 'CreatedAt', sortDescending: true });
    setProjectFilters({ searchQuery: query, status: '', pageNumber: 1, pageSize: 20, sortBy: 'CreatedAt', sortDescending: true });
    setUserFilters({ searchQuery: query, role: '', pageNumber: 1, pageSize: 20, sortBy: 'FirstName', sortDescending: false });
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Header />

      <div className="flex-1">
        {/* Search Header */}
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-neutral-900 mb-4">Advanced Search</h1>

            {/* Search Bar */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Enter search query..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="input flex-1"
              />
              <Button onClick={handleSearch} variant="primary">
                Search
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-neutral-200">
              {(['all', 'tasks', 'projects', 'users'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    performSearch(tab);
                  }}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeTab === tab && (
                    <span className="ml-1 text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                      {tab === 'all'
                        ? (taskResults?.totalCount || 0) +
                          (projectResults?.totalCount || 0) +
                          (userResults?.totalCount || 0)
                        : tab === 'tasks'
                        ? taskResults?.totalCount || 0
                        : tab === 'projects'
                        ? projectResults?.totalCount || 0
                        : userResults?.totalCount || 0}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {error && (
            <div className="alert alert-error mb-6">
              <p>{error}</p>
            </div>
          )}

          {loading && (
            <div className="flex justify-center py-12">
              <div className="loading-spinner"></div>
            </div>
          )}

          {!loading && (activeTab === 'all' || activeTab === 'tasks') && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-neutral-900">Tasks</h2>
                {activeTab === 'tasks' && (
                  <div className="flex gap-2">
                    <select
                      value={taskFilters.status || ''}
                      onChange={(e) => handleTaskFilterChange('status', e.target.value)}
                      className="input w-auto text-sm"
                    >
                      <option value="">All Status</option>
                      <option value="Active">Active</option>
                      <option value="InProgress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>

                    <select
                      value={taskFilters.priority || ''}
                      onChange={(e) => handleTaskFilterChange('priority', e.target.value)}
                      className="input w-auto text-sm"
                    >
                      <option value="">All Priority</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>

                    <Button onClick={resetFilters} variant="outline" className="text-sm">
                      Reset
                    </Button>
                  </div>
                )}
              </div>

              {taskResults && taskResults.items.length > 0 ? (
                <div className="space-y-3">
                  {taskResults.items.map(task => (
                    <Card key={task.taskId} variant="flat">
                      <div className="p-4 hover:bg-neutral-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h3 
                            className="font-semibold text-neutral-900 cursor-pointer hover:text-indigo-600 transition"
                            onClick={() => {
                              setSelectedTaskId(task.taskId);
                              setSelectedTaskProjectTitle(task.projectTitle);
                              setIsTaskDetailsOpen(true);
                            }}
                          >
                            {task.title}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded font-medium ${
                            task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'InProgress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600 mb-2">Project: {task.projectTitle}</p>
                        <div className="flex gap-2 text-xs text-neutral-500">
                          <span className={`px-2 py-1 rounded ${
                            task.priority === 'High' ? 'bg-red-100 text-red-700' :
                            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {task.priority}
                          </span>
                          <span>Due: {new Date(task.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  No tasks found
                </div>
              )}
            </div>
          )}

          {!loading && (activeTab === 'all' || activeTab === 'projects') && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-neutral-900">Projects</h2>
                {activeTab === 'projects' && (
                  <div className="flex gap-2">
                    <select
                      value={projectFilters.status || ''}
                      onChange={(e) => handleProjectFilterChange('status', e.target.value)}
                      className="input w-auto text-sm"
                    >
                      <option value="">All Status</option>
                      <option value="Active">Active</option>
                      <option value="InProgress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>

                    <Button onClick={resetFilters} variant="outline" className="text-sm">
                      Reset
                    </Button>
                  </div>
                )}
              </div>

              {projectResults && projectResults.items.length > 0 ? (
                <div className="space-y-3">
                  {projectResults.items.map(project => (
                    <Card key={project.projectId} variant="flat">
                      <div className="p-4 hover:bg-neutral-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-neutral-900">
                            <span key={project.projectId} className="cursor-pointer hover:text-indigo-600 transition" onClick={() => navigate(`/projects/${project.projectId}`)} >
                              {project.title}
                            </span>
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded font-medium ${
                            project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            project.status === 'InProgress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600 mb-3">{project.description}</p>
                        <div className="mb-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-neutral-600">Progress</span>
                            <span className="font-medium">{project.progress}%</span>
                          </div>
                          <div className="w-full bg-neutral-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-colors ${
                                project.progress <= 33 ? 'bg-red-500' :
                                project.progress <= 66 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-xs text-neutral-500">
                          {project.completedTasks}/{project.totalTasks} tasks completed
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  No projects found
                </div>
              )}
            </div>
          )}

          {!loading && (activeTab === 'all' || activeTab === 'users') && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-neutral-900">Users</h2>
                {activeTab === 'users' && (
                  <div className="flex gap-2">
                    <select
                      value={userFilters.role || ''}
                      onChange={(e) => handleUserFilterChange('role', e.target.value)}
                      className="input w-auto text-sm"
                    >
                      <option value="">All Roles</option>
                      <option value="Admin">Admin</option>
                      <option value="Manager">Manager</option>
                      <option value="Mentor">Mentor</option>
                      <option value="Intern">Intern</option>
                    </select>

                    <Button onClick={resetFilters} variant="outline" className="text-sm">
                      Reset
                    </Button>
                  </div>
                )}
              </div>

              {userResults && userResults.items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {userResults.items.map(user => (
                    <Card key={user.userId} variant="flat">
                      <div className="p-4 hover:bg-neutral-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-neutral-900">
                            <span className="cursor-pointer hover:text-indigo-600 transition" onClick={() => navigate(`/profile/${user.userId}`)}>
                              {user.firstName} {user.lastName}
                            </span>
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded font-medium ${
                            user.role === 'Admin' ? 'bg-red-100 text-red-800' :
                            user.role === 'Manager' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'Mentor' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600 mb-2">{user.email}</p>
                        <div className="flex gap-2 text-xs text-neutral-500">
                          {user.isActive ? (
                            <span className="text-green-600 font-medium">✓ Active</span>
                          ) : (
                            <span className="text-red-600 font-medium">✗ Inactive</span>
                          )}
                          {user.emailConfirmed && (
                            <span className="text-blue-600">Email verified</span>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  No users found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Task Details Modal */}
        <TaskDetailsModal
          isOpen={isTaskDetailsOpen}
          taskId={selectedTaskId}
          projectTitle={selectedTaskProjectTitle}
          onClose={() => {
            setIsTaskDetailsOpen(false);
            setSelectedTaskId('');
            setSelectedTaskProjectTitle('');
          }}
        />
      </div>
    </div>
  );
};

export default AdvancedSearch;
