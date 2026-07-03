import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Header from '../components/Header';
import analyticsService, {
  type AnalyticsDashboard as IAnalyticsDashboard
} from '../services/analyticsService';
import { Card, Button } from '../components/ui';
import '../styles/analytics.css';

const AnalyticsDashboard = () => {
  const [dashboard, setDashboard] = useState<IAnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getDashboard(
        dateRange.startDate || undefined,
        dateRange.endDate || undefined
      );
      setDashboard(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load analytics dashboard');
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field: string, value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    loadDashboard();
  };

  if (loading && !dashboard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <p className="text-neutral-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="min-h-screen bg-neutral-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="alert alert-error">
            <p>{error}</p>
            <Button onClick={loadDashboard}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  const { teamPerformance, projectsProgress, internPerformance, completionTrends } = dashboard;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Header />
      
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-neutral-900 mb-4">Analytics Dashboard</h1>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  className="input"
                />
              </div>
              <Button onClick={handleApplyFilters} variant="primary">
                Apply Filters
              </Button>
              <Button
                onClick={() => {
                  setDateRange({ startDate: '', endDate: '' });
                  loadDashboard();
                }}
                variant="outline"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card variant="elevated">
            <div className="p-6">
              <p className="text-sm font-medium text-neutral-500 mb-2">Total Interns</p>
              <p className="text-3xl font-bold text-primary-600">{teamPerformance.totalInterns}</p>
            </div>
          </Card>

          <Card variant="elevated">
            <div className="p-6">
              <p className="text-sm font-medium text-neutral-500 mb-2">Overall Completion Rate</p>
              <p className="text-3xl font-bold text-success-600">
                {teamPerformance.overallCompletionRate.toFixed(1)}%
              </p>
            </div>
          </Card>

          <Card variant="elevated">
            <div className="p-6">
              <p className="text-sm font-medium text-neutral-500 mb-2">Avg Team Performance</p>
              <p className="text-3xl font-bold text-accent-600">
                {teamPerformance.averageInternPerformance.toFixed(1)}/100
              </p>
            </div>
          </Card>

          <Card variant="elevated">
            <div className="p-6">
              <p className="text-sm font-medium text-neutral-500 mb-2">Pending Tasks</p>
              <p className="text-3xl font-bold text-warning-600">{teamPerformance.tasksPending}</p>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Task Completion Trends */}
          <Card variant="elevated">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Task Completion Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={completionTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    style={{ fontSize: '0.875rem' }}
                  />
                  <YAxis stroke="#9ca3af" style={{ fontSize: '0.875rem' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="completionRate"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ fill: '#2563eb', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Completion Rate (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Task Status Distribution */}
          <Card variant="elevated">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Task Status Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Completed', value: teamPerformance.tasksCompleted },
                      { name: 'Pending', value: teamPerformance.tasksPending }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#2563eb" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Projects Progress */}
        {projectsProgress.length > 0 && (
          <Card variant="elevated" className="mb-8">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Project Progress</h2>
              {projectsProgress.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={projectsProgress}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="projectTitle"
                      stroke="#9ca3af"
                      style={{ fontSize: '0.875rem' }}
                    />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '0.875rem' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="progressPercentage"
                      fill="#2563eb"
                      name="Progress (%)"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-neutral-500">No project data available</p>
              )}
            </div>
          </Card>
        )}

        {/* Top Performers */}
        {internPerformance.length > 0 && (
          <Card variant="elevated">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Top Performers</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900">
                        Intern
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900">
                        Tasks Completed
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900">
                        Completion Rate
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900">
                        Performance Score
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {internPerformance
                      .sort((a, b) => b.performanceScore - a.performanceScore)
                      .slice(0, 10)
                      .map((intern) => (
                        <tr key={intern.userId} className="border-b border-neutral-200 hover:bg-neutral-50">
                          <td className="px-4 py-3 text-sm text-neutral-900">
                            {intern.firstName} {intern.lastName}
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-600">
                            {intern.tasksCompleted}/{intern.totalTasksAssigned}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {intern.completionRate.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold">
                            <div className="flex items-center">
                              <div className="w-16 bg-neutral-200 rounded-full h-2 mr-2">
                                <div
                                  className="bg-primary-600 h-2 rounded-full"
                                  style={{ width: `${intern.performanceScore}%` }}
                                ></div>
                              </div>
                              {intern.performanceScore.toFixed(1)}/100
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        )}
      </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
