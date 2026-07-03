import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RouteLoader from './RouteLoader';
import authService from '../services/authService';

// ============================================================================
// Lazy-loaded Pages (Code Splitting for Better Performance)
// ============================================================================

// Public Pages
const Landing = lazy(() => import('../pages/Landing'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const About = lazy(() => import('../pages/About'));
const NotFound = lazy(() => import('../pages/NotFound'));
const ForbiddenPage = lazy(() => import('../pages/ForbiddenPage.tsx'));

// Dashboard Pages
const Home = lazy(() => import('../pages/Home'));
const Mentor = lazy(() => import('../pages/Mentor'));

// Project Management
const ProjectManagement = lazy(() => import('../pages/ProjectManagement'));
const Projects = lazy(() => import('../pages/Projects'));
const ProjectDetailPage = lazy(() => import('../pages/ProjectDetailPage'));

// Task Management
const Tasks = lazy(() => import('../pages/Tasks'));

// User Management
const UserProfile = lazy(() => import('../pages/UserProfile'));
const ViewUserProfile = lazy(() => import('../pages/ViewUserProfile'));
const Users = lazy(() => import('../pages/Users'));

// Internship Management
const Interns = lazy(() => import('../pages/Interns'));
const UserProgressDetail = lazy(() => import('../pages/UserProgressDetail'));
const InternFeedback = lazy(() => import('../pages/InternFeedback'));

// Analytics
const AnalyticsDashboard = lazy(() => import('../pages/AnalyticsDashboard'));

// Search & Collaboration
const AdvancedSearch = lazy(() => import('../pages/AdvancedSearch'));
const CollaborationCenter = lazy(() => import('../pages/CollaborationCenter'));

// ============================================================================
// Route Configuration
// ============================================================================

interface RouteConfig {
  path: string;
  element: React.LazyExoticComponent<React.FC>;
  isProtected?: boolean;
  requiredRoles?: string[];
  title: string;
  description?: string;
}

// Public routes accessible to everyone
const PUBLIC_ROUTES: RouteConfig[] = [
  {
    path: '/',
    element: Landing,
    title: 'InternHub - Internship Management System',
    description: 'Manage internships efficiently with InternHub',
  },
  {
    path: '/about',
    element: About,
    title: 'About - InternHub',
    description: 'Learn more about InternHub',
  },
  {
    path: '/reset-password',
    element: ResetPassword,
    title: 'Reset Password - InternHub',
    description: 'Reset your password',
  },
];

// Protected routes accessible only to authenticated users
const PROTECTED_ROUTES: RouteConfig[] = [
  // Dashboard
  {
    path: '/dashboard',
    element: Home,
    isProtected: true,
    title: 'Dashboard - InternHub',
    description: 'Your InternHub dashboard',
  },

  // User Profile
  {
    path: '/profile',
    element: UserProfile,
    isProtected: true,
    title: 'My Profile - InternHub',
    description: 'View and edit your profile',
  },
  {
    path: '/profile/:userId',
    element: ViewUserProfile,
    isProtected: true,
    title: 'User Profile - InternHub',
  },

  // Admin/Manager Routes
  {
    path: '/admin/projects',
    element: ProjectManagement,
    isProtected: true,
    requiredRoles: ['Admin', 'Manager'],
    title: 'Project Management - InternHub',
    description: 'Manage all internship projects',
  },

  {
    path: '/manager/projects',
    element: Projects,
    isProtected: true,
    requiredRoles: ['Manager'],
    title: 'Projects - InternHub',
    description: 'View and manage projects',
  },

  {
    path: '/projects/:projectId',
    element: ProjectDetailPage,
    isProtected: true,
    title: 'Project Details - InternHub',
    description: 'View project details and assignments',
  },

  {
    path: '/manager/tasks',
    element: Tasks,
    isProtected: true,
    requiredRoles: ['Manager'],
    title: 'Tasks - InternHub',
    description: 'Manage project tasks',
  },

  {
    path: '/manager/users',
    element: Users,
    isProtected: true,
    requiredRoles: ['Manager'],
    title: 'Users - InternHub',
    description: 'Manage user accounts',
  },

  {
    path: '/manager/progress',
    element: Interns,
    isProtected: true,
    requiredRoles: ['Manager'],
    title: 'Intern Progress - InternHub',
    description: 'Track intern progress and development',
  },

  // Mentor Routes
  {
    path: '/mentor/interns',
    element: Interns,
    isProtected: true,
    requiredRoles: ['Mentor'],
    title: 'My Interns - InternHub',
    description: 'View your assigned interns',
  },

  {
    path: '/intern/mentor',
    element: Mentor,
    isProtected: true,
    requiredRoles: ['Intern'],
    title: 'Mentor - InternHub',
    description: 'View your mentor information',
  },

  {
    path: '/user-progress/:userId',
    element: UserProgressDetail,
    isProtected: true,
    title: 'Progress Detail - InternHub',
    description: 'View detailed progress information',
  },

  {
    path: '/intern-progress/:userId',
    element: UserProgressDetail,
    isProtected: true,
    title: 'Progress Detail - InternHub',
    description: 'View detailed progress information',
  },

  {
    path: '/intern/feedback',
    element: InternFeedback,
    isProtected: true,
    requiredRoles: ['Intern'],
    title: 'Feedback - InternHub',
    description: 'View feedback from your mentors',
  },

  // General Protected Routes
  {
    path: '/tasks',
    element: Tasks,
    isProtected: true,
    title: 'Tasks - InternHub',
    description: 'Manage your tasks',
  },

  {
    path: '/users',
    element: Users,
    isProtected: true,
    title: 'Users - InternHub',
    description: 'Browse users',
  },

  // Analytics
  {
    path: '/analytics',
    element: AnalyticsDashboard,
    isProtected: true,
    requiredRoles: ['Manager', 'Admin'],
    title: 'Analytics - InternHub',
    description: 'View analytics and insights',
  },

  // Search & Collaboration
  {
    path: '/search',
    element: AdvancedSearch,
    isProtected: true,
    title: 'Advanced Search - InternHub',
    description: 'Search projects, tasks, and users',
  },

  {
    path: '/collaboration',
    element: CollaborationCenter,
    isProtected: true,
    title: 'Collaboration - InternHub',
    description: 'Collaborate with your team',
  },
];

// ============================================================================
// Route Renderer
// ============================================================================

/**
 * Renders a route with proper wrapping
 */
function renderRoute(config: RouteConfig, index: number) {
  const Element = config.element;
  const element = (
    <RouteLoader>
      <Element />
    </RouteLoader>
  );

  if (config.isProtected) {
    return (
      <Route
        key={`${config.path}-${index}`}
        path={config.path}
        element={
          <ProtectedRoute requiredRoles={config.requiredRoles}>
            {element}
          </ProtectedRoute>
        }
      />
    );
  }

  return (
    <Route
      key={`${config.path}-${index}`}
      path={config.path}
      element={element}
    />
  );
}

// ============================================================================
// Main AppRoutes Component
// ============================================================================

export default function AppRoutes() {
  const isAuthenticated = authService.isAuthenticated();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        {PUBLIC_ROUTES.map((route, index) => renderRoute(route, index))}

        {/* Auth Routes - Redirect to dashboard if already authenticated */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <RouteLoader>
                <Suspense fallback={<div>Loading...</div>}>
                  <Login />
                </Suspense>
              </RouteLoader>
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <RouteLoader>
                <Suspense fallback={<div>Loading...</div>}>
                  <Register />
                </Suspense>
              </RouteLoader>
            )
          }
        />

        {/* Protected Routes */}
        {PROTECTED_ROUTES.map((route, index) =>
          renderRoute(route, index + PUBLIC_ROUTES.length + 2)
        )}

        {/* Forbidden Page */}
        <Route
          path="/403"
          element={
            <RouteLoader>
              <ForbiddenPage />
            </RouteLoader>
          }
        />

        {/* 404 - Not Found (must be last) */}
        <Route
          path="*"
          element={
            <RouteLoader>
              <NotFound />
            </RouteLoader>
          }
        />
      </Routes>
    </Router>
  );
}

