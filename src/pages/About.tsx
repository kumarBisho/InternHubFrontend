import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-indigo-600">
                InternHub
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* About Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About InternHub</h1>
        <div className="bg-white rounded-lg shadow p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What is InternHub?</h2>
            <p className="text-gray-600 leading-relaxed">
              InternHub is a comprehensive project management platform designed specifically for
              internship programs. It helps interns, mentors, and managers collaborate efficiently
              and track project progress seamlessly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Features</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Project Management</li>
              <li>Task Tracking</li>
              <li>Team Collaboration</li>
              <li>Real-time Notifications</li>
              <li>User Profiles</li>
              <li>Dashboard Analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Get Started</h2>
            <p className="text-gray-600 mb-4">
              Ready to get started? Sign up for an account today!
            </p>
            <Link
              to="/register"
              className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Create Account
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
