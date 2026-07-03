import { Link } from 'react-router-dom';
import { SEOHead } from '../hooks/usePageTitle';

export default function NotFound() {
  return (
    <>
      <SEOHead
        title="404 - Page Not Found - InternHub"
        description="The page you're looking for doesn't exist"
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-2xl text-gray-700 mb-8">Page Not Found</p>
          <p className="text-gray-600 mb-8">
            Sorry, the page you're looking for doesn't exist.
          </p>
          <Link
            to="/"
            className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    </>
  );
}
