import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const FeatureCard = ({ icon, title, description }: { icon: string; title: string; description: string }) => (
  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:scale-105 transition duration-300 border border-gray-100">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="z-10">

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Manage Your <span className="text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">Internship</span> Like Never Before
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                InternHub is the ultimate platform for interns, mentors, and managers to collaborate seamlessly, track projects, and achieve success together.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-indigo-500/50 transform hover:scale-105 transition duration-300 text-center"
                >
                  Get Started Now
                </Link>
                {/* <Link
                  to="/login"
                  className="px-8 py-4 border-2 border-indigo-600 text-indigo-600 rounded-xl font-bold text-lg hover:bg-indigo-50 transition duration-300 text-center"
                >
                  Sign In
                </Link> */}
              </div>

            </div>

            {/* Right - Interactive Image */}
            <div className="relative z-10 hidden lg:block">
              <div className="relative">
                {/* Floating Card 1 */}
                <div className="absolute top-10 -left-10 bg-white rounded-2xl p-6 shadow-2xl w-64 transform -rotate-12 hover:rotate-0 transition duration-300">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Task Completed</p>
                      <p className="text-sm text-gray-600">Web Design</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full w-4/5"></div>
                  </div>
                </div>

                {/* Main Image Container */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-12 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                  </div>
                  <div className="relative z-10 flex items-center justify-center h-96">
                    <div className="text-center">
                      <div className="text-8xl mb-4 animate-bounce">📊</div>
                      <p className="text-white font-bold text-2xl">Project Dashboard</p>
                    </div>
                  </div>
                </div>

                {/* Floating Card 2 */}
                <div className="absolute bottom-10 -right-10 bg-white rounded-2xl p-6 shadow-2xl w-64 transform rotate-12 hover:rotate-0 transition duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-bold text-gray-900">Team Members</p>
                      <p className="text-sm text-gray-600">Active Today</p>
                    </div>
                    <span className="text-3xl">👥</span>
                  </div>
                  <div className="flex -space-x-4">
                    <img
                      src="https://i.pravatar.cc/150?img=1"
                      alt="User"
                      className="w-10 h-10 rounded-full border-2 border-white hover:scale-110 transition"
                    />
                    <img
                      src="https://i.pravatar.cc/150?img=2"
                      alt="User"
                      className="w-10 h-10 rounded-full border-2 border-white hover:scale-110 transition"
                    />
                    <img
                      src="https://i.pravatar.cc/150?img=3"
                      alt="User"
                      className="w-10 h-10 rounded-full border-2 border-white hover:scale-110 transition"
                    />
                    <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold border-2 border-white">
                      +5
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/* <section className="py-16 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <InteractiveCounter end={10000} label="Active Users" />
            <InteractiveCounter end={5000} label="Projects Completed" />
            <InteractiveCounter end={500} label="Teams" />
            <InteractiveCounter end={98} label="% Satisfaction" />
          </div>
        </div>
      </section> */}

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Powerful <span className="text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">Features</span>
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to manage your internship journey effectively
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon="📋"
              title="Project Management"
              description="Organize, track, and manage all your internship projects in one centralized location."
            />
            <FeatureCard
              icon="✅"
              title="Task Tracking"
              description="Break down projects into tasks, assign them, and monitor progress with real-time updates."
            />
            <FeatureCard
              icon="👥"
              title="Team Collaboration"
              description="Work seamlessly with mentors and team members with built-in communication tools."
            />
            <FeatureCard
              icon="🔔"
              title="Notifications"
              description="Stay updated with instant notifications for tasks, updates, and team activities."
            />
            <FeatureCard
              icon="📊"
              title="Analytics Dashboard"
              description="Get insights into your progress with comprehensive analytics and performance metrics."
            />
            <FeatureCard
              icon="🔐"
              title="Secure Platform"
              description="Your data is protected with enterprise-grade security and encryption."
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl font-bold text-gray-900 mb-6">
                Why Choose <span className="text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">InternHub?</span>
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                InternHub is designed with interns, mentors, and managers in mind. We understand the unique challenges of managing internship programs and have built the perfect solution.
              </p>
              <ul className="space-y-4">
                {['Intuitive & Easy to Use', 'Real-time Collaboration', 'Powerful Analytics', 'Excellent Support'].map((item, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white">
                      ✓
                    </div>
                    <span className="text-gray-700 font-semibold">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-12 h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="text-9xl mb-4 animate-spin" style={{ animationDuration: '3s' }}>
                  🎯
                </div>
                <p className="text-white font-bold text-2xl">Your Success is Our Mission</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <defs>
              <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="2" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <h2 className="text-5xl font-bold text-white mb-6">
            Ready to Transform Your Internship Experience?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of interns and mentors already using InternHub to succeed
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition duration-300"
          >
            Get Started Now
          </Link>
        </div>
      </section> */}

      <Footer />
    </div>
  );
}
