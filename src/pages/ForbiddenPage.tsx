import { Link } from 'react-router-dom';
import { SEOHead } from '../hooks/usePageTitle';

export default function ForbiddenPage() {
  return (
    <>
      <SEOHead
        title="403 - Forbidden - InternHub"
        description="You don't have permission to access this page"
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>
          <p className="text-2xl text-gray-700 mb-4">Access Forbidden</p>
          <p className="text-gray-600 mb-4">
            Sorry, you don't have permission to access this page.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Please contact your administrator if you believe this is an error.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/dashboard"
              className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Go to Dashboard
            </Link>
            <Link
              to="/"
              className="inline-block px-8 py-3 bg-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-400 transition"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
