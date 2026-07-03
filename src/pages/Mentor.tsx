import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
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

export default function Mentor() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [mentor, setMentor] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      console.log('❌ No user found, redirecting to login');
      navigate('/login');
      return;
    }

    console.log('✓ User found, fetching mentor data...');
    fetchMentorAndProjects();
  }, []);

  const fetchMentorAndProjects = async () => {
    try {
      setLoading(true);
      if (!user) {
        console.log('❌ fetchMentorAndProjects: User not found');
        setError('User not found. Please log in again.');
        return;
      }
      
      console.log('\n=== FETCHING MENTOR ===');
      console.log('Step 1: Current logged-in user:');
      console.log('  - ID:', user.id);
      console.log('  - Name:', user.firstName, user.lastName);
      console.log('  - Email:', user.email);
      
      console.log('\nStep 2: Calling API with InternId:', user.id);
      const assignedMentor = await userService.getAssignedMentor(user.id);
      
      console.log('\nStep 3: API Response:');
      console.log('  - Status: Success');
      console.log('  - Mentor:', assignedMentor);
      
      if (assignedMentor) {
        console.log('  - Mentor ID:', assignedMentor.id);
        console.log('  -Mentor Name:', assignedMentor.firstName, assignedMentor.lastName);
        console.log('  - Mentor Email:', assignedMentor.email);
      }
      
      setMentor(assignedMentor);
      setError(null);
      console.log('=== MENTOR FETCH COMPLETE ===\n');
    } catch (err: any) {
      console.error('\n❌ ERROR FETCHING MENTOR:');
      console.error('Error type:', typeof err);
      console.error('Error value:', err);
      console.error('Error message:', err.message);
      console.error('Full error:', err);
      
      let errorMsg = 'Failed to load assigned mentor';
      if (typeof err === 'string') {
        errorMsg = err;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      console.error('Final error message to display:', errorMsg);
      setError(errorMsg);
      setMentor(null);
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Mentor</h1>
          {/* <p className="text-gray-600">View your assigned mentor's information</p> */}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-red-800 font-medium mb-2">Error Loading Mentor</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
              <button
                onClick={fetchMentorAndProjects}
                className="cursor-pointer px-4 py-2 bg-red-100 text-red-700 rounded font-medium hover:bg-red-200 transition flex-shrink-0"
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

        {/* No Mentor State */}
        {!loading && !mentor && !error && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-4">👨‍🏫</div>
            <p className="text-xl font-semibold text-gray-900 mb-2">No mentor assigned yet</p>
            <p className="text-gray-600">You don't have a mentor assigned to you yet. Please contact the admin.</p>
          </div>
        )}

        {/* Mentor Card */}
        {!loading && mentor && (
          <div className="max-w-2xl mx-auto">
            {/* Main Mentor Card */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              {/* Header with Avatar */}
              <div className="flex items-start gap-6 mb-8">
                <div onClick={() => mentor && navigate(`/profile/${mentor.id}`)} className="cursor-pointer w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-semibold flex-shrink-0">
                  {mentor.firstName.charAt(0)}
                  {mentor.lastName.charAt(0)}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900">
                    <span onClick={() => mentor && navigate(`/profile/${mentor.id}`)} className="cursor-pointer hover:text-indigo-600 transition">
                      {mentor.firstName} {mentor.lastName}
                    </span>
                  </h2>
                  <span className="inline-block px-4 py-2 text-sm font-medium rounded-full mt-2 bg-blue-100 text-blue-800">
                    Mentor
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-t border-gray-200 pt-8 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="text-2xl pt-1">📧</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600">Email Address</p>
                      <p className="text-gray-900 font-medium break-all">{mentor.email}</p>
                    </div>
                  </div>

                  {mentor.phoneNumber && (
                    <div className="flex items-start gap-4">
                      <div className="text-2xl pt-1">📱</div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Phone Number</p>
                        <p className="text-gray-900 font-medium">{mentor.phoneNumber}</p>
                      </div>
                    </div>
                  )}

                  {mentor.department && (
                    <div className="flex items-start gap-4">
                      <div className="text-2xl pt-1">🏢</div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Department</p>
                        <p className="text-gray-900 font-medium">{mentor.department}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
