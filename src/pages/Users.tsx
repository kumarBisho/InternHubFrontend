import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import authService from '../services/authService';
import userService from '../services/userService';
import InternListModal from '../components/InternListModal';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  phoneNumber?: string;
  department?: string;
}

export default function Users() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [users, setUsers] = useState<User[]>([]);
  const [mentorInterns, setMentorInterns] = useState<{ [key: string]: User[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<'all' | 'mentor' | 'intern'>('all');
  const [isMentorView, setIsMentorView] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showInternListModal, setShowInternListModal] = useState(false);
  const [selectedMentorForInterns, setSelectedMentorForInterns] = useState<User | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    console.log("=== CURRENT LOGGED IN USER ===");
    console.log("Full user object:", user);
    console.log("User ID:", user.id);
    console.log("User Email:", user.email);
    console.log("User FirstName:", user.firstName);
    console.log("User LastName:", user.lastName);
    console.log("User Role:", user.role);
    console.log("User Role (lowercase):", user.role?.toLowerCase());
    console.log("==============================");

    // Check if user is admin, manager, or mentor
    const userRole = user.role?.toLowerCase();
    const isAdmin = userRole === 'admin' || userRole === '1';
    const isManager = userRole === 'manager' || userRole === '2';
    const isMentor = userRole === 'mentor' || userRole === '3';
    
    console.log("Role check - isAdmin:", isAdmin, "isManager:", isManager, "isMentor:", isMentor);
    
    if (!isAdmin && !isManager && !isMentor) {
      navigate('/dashboard');
      return;
    }

    setIsMentorView(isMentor);
    fetchUsers(isMentor);
  }, []);

  const fetchUsers = async (isMentor: boolean) => {
    try {
      setLoading(true);
      
      if (isMentor) {
        // For mentors, fetch only their assigned interns
        if (!user) return;
        
        console.log("=== FETCHING INTERNS FOR MENTOR ===");
        console.log("Mentor ID to send:", user.id);
        console.log("Mentor ID Type:", typeof user.id);
        console.log("API Endpoint: /User/mentor/" + user.id + "/interns");
        
        const interns = await userService.getInternsByMentor(user.id);
        setUsers(interns);
        
        // Set themselves in the mentorInterns map
        const mentorInternMap: { [key: string]: User[] } = {};
        mentorInternMap[user.id] = interns;
        setMentorInterns(mentorInternMap);
        console.log("=== INTERNS FETCHED SUCCESSFULLY ===");
        console.log("Interns count:", interns.length);
      } else {
        // For admins and managers, fetch all mentors and interns
        const mentorsAndInterns = await userService.getAllMentorsAndInterns();
        setUsers(mentorsAndInterns);
        
        // Fetch interns for each mentor
        const mentors = mentorsAndInterns.filter((u: any) => {
          const role = String(u.role).toLowerCase();
          return role === '3' || role === 'mentor';
        });
        
        const internsByMentorMap: { [key: string]: User[] } = {};
        for (const mentor of mentors) {
          try {
            const interns = await userService.getInternsByMentor(mentor.id);
            internsByMentorMap[mentor.id] = interns;
          } catch (err) {
            console.error(`Failed to fetch interns for mentor ${mentor.id}:`, err);
            internsByMentorMap[mentor.id] = [];
          }
        }
        
        setMentorInterns(internsByMentorMap);
      }
      
      setError(null);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplay = (role: string | undefined) => {
    if (!role) return 'Unknown';
    const roleStr = String(role).toLowerCase();
    if (roleStr === '1' || roleStr === 'admin') return 'Admin';
    if (roleStr === '2' || roleStr === 'manager') return 'Manager';
    if (roleStr === '3' || roleStr === 'mentor') return 'Mentor';
    if (roleStr === '4' || roleStr === 'intern') return 'Intern';
    return 'User';
  };

  const getRoleBadgeColor = (role: string | undefined) => {
    const roleStr = String(role).toLowerCase();
    if (roleStr === '1' || roleStr === 'admin') return 'bg-red-100 text-red-800';
    if (roleStr === '2' || roleStr === 'manager') return 'bg-yellow-100 text-yellow-800';
    if (roleStr === '3' || roleStr === 'mentor') return 'bg-blue-100 text-blue-800';
    if (roleStr === '4' || roleStr === 'intern') return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getFilteredUsers = () => {
    if (filterRole === 'all') {
      return users;
    }
    return users.filter((u: any) => {
      const role = String(u.role).toLowerCase();
      if (filterRole === 'mentor') {
        return role === '3' || role === 'mentor';
      }
      if (filterRole === 'intern') {
        return role === '4' || role === 'intern';
      }
      return false;
    });
  };

  const handleViewProgress = (user: User) => {
    navigate(`/user-progress/${user.id}`);
    setOpenMenuId(null);
  };

  const handleMenuClick = (userId: string) => {
    setOpenMenuId(openMenuId === userId ? null : userId);
  };

  // Get mentor for an intern
  // Get mentor for an intern
  const getMentorForIntern = (internId: string): User | null => {
    for (const [mentorId, interns] of Object.entries(mentorInterns)) {
      if (!interns) {
        continue;
      }
      const foundIntern = interns.find((i) => i.id === internId);
      if (foundIntern) {
        const mentor = users.find((u) => u.id === mentorId);
        if (mentor) {
          return mentor;
        }
        // Continue to next mentor if this one not found
        continue;
      }
    }
    return null;
  };

  // Close menu when clicking outside
  useEffect(() => {
    if (!openMenuId) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-user-menu]')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  const filteredUsers = getFilteredUsers();
  const mentorCount = users.filter((u: any) => {
    const role = String(u.role).toLowerCase();
    return role === '3' || role === 'mentor';
  }).length;
  const internCount = users.filter((u: any) => {
    const role = String(u.role).toLowerCase();
    return role === '4' || role === 'intern';
  }).length;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-8">
          {isMentorView ? (
            <>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Interns</h1>
              <p className="text-gray-600">View all interns assigned to you</p>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Users Management</h1>
              {/* <p className="text-gray-600">Manage all mentors and interns in the system</p> */}
            </>
          )}
        </div>

        {/* Statistics Cards */}
        {!isMentorView && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{users.length}</p>
              </div>
              <div className="text-5xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Mentors</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{mentorCount}</p>
              </div>
              <div className="text-5xl">👨‍🏫</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Interns</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{internCount}</p>
              </div>
              <div className="text-5xl">👨‍🎓</div>
            </div>
          </div>
        </div>
        )}

        {/* Filter Tabs - Only for Admin */}
        {!isMentorView && (
        <div className="mb-8 border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => setFilterRole('all')}
              className={`cursor-pointer px-4 py-2 font-medium transition ${
                filterRole === 'all'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Users ({users.length})
            </button>
            <button
              onClick={() => setFilterRole('mentor')}
              className={`cursor-pointer px-4 py-2 font-medium transition ${
                filterRole === 'mentor'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mentors ({mentorCount})
            </button>
            <button
              onClick={() => setFilterRole('intern')}
              className={`cursor-pointer px-4 py-2 font-medium transition ${
                filterRole === 'intern'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Interns ({internCount})
            </button>
          </div>
        </div>
        )}

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
        {!loading && filteredUsers.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-4">👤</div>
            <p className="text-xl font-semibold text-gray-900 mb-2">No {isMentorView ? 'interns' : 'users'} found</p>
            <p className="text-gray-600">{isMentorView ? 'No interns assigned to you yet' : `No ${filterRole === 'all' ? 'users' : filterRole}s in the system yet`}</p>
          </div>
        )}

        {/* Users Grid */}
        {!loading && filteredUsers.length > 0 && (
          <div className="max-w-7xl mx-auto space-y-6">
            {filteredUsers.map((u: User) => {
              const isUserMentor = String(u.role).toLowerCase() === '3' || String(u.role).toLowerCase() === 'mentor';
              
              return (
                <div key={u.id} className="bg-white rounded-lg shadow p-6 relative">
                  {/* Three-Dot Menu - Top Right */}
                  <div className="absolute top-6 right-6" data-user-menu>
                    <button
                      onClick={() => handleMenuClick(u.id)}
                      className="cursor-pointer p-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
                      title="More options"
                      aria-label="More options"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="12" cy="19" r="2" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {openMenuId === u.id && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
                        {/* View Progress - For All Users */}
                        <button
                          onClick={() => handleViewProgress(u)}
                          className="cursor-pointer w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition flex items-center gap-2 border-b border-gray-100 rounded-t-lg"
                        >
                          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>View Progress</span>
                        </button>

                        {/* For Interns: View Mentor */}
                        {(!isUserMentor && (String(u.role).toLowerCase() === '4' || String(u.role).toLowerCase() === 'intern')) && (
                          <>
                            {getMentorForIntern(u.id) ? (
                              <button
                                onClick={() => {
                                  const mentor = getMentorForIntern(u.id);
                                  if (mentor) {
                                    navigate(`/profile/${mentor.id}`);
                                    setOpenMenuId(null);
                                  }
                                }}
                                className="cursor-pointer w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition flex items-center gap-2 border-b border-gray-100"
                              >
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Mentor</span>
                              </button>
                            ) : (
                              <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-xs text-gray-500 italic">No mentor assigned</p>
                              </div>
                            )}
                          </>
                        )}

                        {/* For Mentors: View Assigned Interns */}
                        {isUserMentor && (
                          <button
                            onClick={() => {
                              setSelectedMentorForInterns(u);
                              setShowInternListModal(true);
                              setOpenMenuId(null);
                            }}
                            className="cursor-pointer w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition flex items-center gap-2 rounded-b-lg"
                          >
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM16 16a5 5 0 010 10H4m0-10a5 5 0 110 10H4" />
                            </svg>
                            <span>Interns</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* User Card */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4 flex-1 pr-8">
                      <div onClick={() => navigate(`/profile/${u.id}`)} className="cursor-pointer w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
                        {u.firstName.charAt(0)}
                        {u.lastName.charAt(0)}
                      </div>
                      <div className="flex-1"
                      >
                        <h3 className="font-semibold text-gray-900">
                          <span onClick={() => navigate(`/profile/${u.id}`)} className="cursor-pointer hover:text-indigo-600 transition">
                            {u.firstName} {u.lastName}
                          </span>
                        </h3>
                        <span
                          className={`inline-block px-3 py-1 text-xs font-medium rounded-full mt-1 ${getRoleBadgeColor(u.role)}`}
                        >
                          {getRoleDisplay(u.role)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Intern List Modal */}
      <InternListModal
        isOpen={showInternListModal}
        mentorName={selectedMentorForInterns ? `${selectedMentorForInterns.firstName} ${selectedMentorForInterns.lastName}` : ''}
        interns={selectedMentorForInterns ? mentorInterns[selectedMentorForInterns.id] || [] : []}
        onClose={() => {
          setShowInternListModal(false);
          setSelectedMentorForInterns(null);
        }}
      />
    </div>
  );
}
