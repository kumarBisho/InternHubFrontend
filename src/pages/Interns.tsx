import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import FeedbackForm from '../components/FeedbackForm';
import authService from '../services/authService';
import userService from '../services/userService';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  phoneNumber?: string;
  department?: string;
}

export default function Interns() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [interns, setInterns] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState<User | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if user is mentor
    const userRole = user.role?.toLowerCase();
    if (userRole !== 'mentor' && userRole !== '3') {
      navigate('/dashboard');
      return;
    }

    fetchInterns();
  }, []);

  const fetchInterns = async () => {
    try {
      setLoading(true);
      if (!user) {
        setError('User not found');
        return;
      }
      const assignedInterns = await userService.getInternsByMentor(user.id);
      setInterns(assignedInterns);
      setError(null);
    } catch (err) {
      console.error('Error fetching interns:', err);
      setError(typeof err === 'string' ? err : 'Failed to load assigned interns');
      setInterns([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      
      <div className="flex-1 p-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Assigned Interns</h1>
          {/* <p className="text-gray-600">Manage all interns assigned to you</p> */}
        </div>

        {/* Statistics Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8 max-w-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Assigned Interns</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{interns.length}</p>
            </div>
            <div className="text-5xl opacity-20">👨‍🎓</div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && interns.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-4">👨‍🎓</div>
            <p className="text-xl font-semibold text-gray-900 mb-2">No interns assigned yet</p>
            <p className="text-gray-600">You don't have any interns assigned to you</p>
          </div>
        )}

        {/* Interns Grid */}
        {!loading && interns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interns.map((intern: User) => (
              <div
                key={intern.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 relative"
              >
                {/* Three-Dot Menu Button - Top Right */}
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === intern.id ? null : intern.id)}
                    className="cursor-pointer p-2 hover:bg-gray-100 rounded-full transition text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {openMenuId === intern.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => {
                          navigate(`/intern-progress/${intern.id}`);
                          setOpenMenuId(null);
                        }}
                        className="cursor-pointer block w-full text-left px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-t-lg transition font-medium"
                      >
                        👁️ View Progress
                      </button>
                      <button
                        onClick={() => {
                          setSelectedIntern(intern);
                          setFeedbackModalOpen(true);
                          setOpenMenuId(null);
                        }}
                        className="cursor-pointer block w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-b-lg transition font-medium"
                      >
                        ✉️ Send Feedback
                      </button>
                    </div>
                  )}
                </div>

                {/* Avatar and Basic Info */}
                <div className="flex items-start justify-between mb-4 pr-8" >
                  <div className="flex items-center gap-4 flex-1">
                    <div onClick={() => navigate(`/profile/${intern.id}`)} className="cursor-pointer w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
                      {intern.firstName.charAt(0)}
                      {intern.lastName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">
                        <span onClick={() => navigate(`/profile/${intern.id}`)} className="cursor-pointer hover:text-indigo-600 transition">
                          {intern.firstName} {intern.lastName}
                        </span>
                      </h3>
                      <span className="inline-block px-3 py-1 text-xs font-medium rounded-full mt-1 bg-purple-100 text-purple-800">
                        Intern
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feedback Form Modal */}
      {selectedIntern && (
        <FeedbackForm
          isOpen={feedbackModalOpen}
          internId={selectedIntern.id}
          internName={`${selectedIntern.firstName} ${selectedIntern.lastName}`}
          onClose={() => {
            setFeedbackModalOpen(false);
            setSelectedIntern(null);
          }}
          onSuccess={() => {
            // Could refresh data or show success message
            setFeedbackModalOpen(false);
            setSelectedIntern(null);
          }}
        />
      )}
    </div>
  ); 
} 
