import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import profileService from '../services/profileService';

interface Skill {
  id?: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

interface ProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  bio?: string;
  startDate?: string;
  endDate?: string;
  interests?: string;
  profileImageUrl?: string;
  skills: Skill[];
}

export default function ViewUserProfile() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) {
      setError('User ID not provided');
      setLoading(false);
      return;
    }

    loadUserProfile();
  }, [userId]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!showMenu) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!userId) {
        setError('User ID not provided');
        return;
      }

      const profileData = await profileService.getUserProfile(userId);
      setProfile(profileData);
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError(typeof err === 'string' ? err : 'Failed to load profile data');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`;
    }
    return '?';
  };

  const getSkillLevelClass = (level: string): string => {
    switch (level) {
      case 'Expert':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const handleViewProgress = () => {
    if (userId) {
      setShowMenu(false);
      navigate(`/user-progress/${userId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />

      <div className="flex-1 p-8">

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-red-800 font-medium mb-2">Error Loading Profile</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
              <button
                onClick={loadUserProfile}
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

        {/* Profile Card */}
        {!loading && profile && (
          <div className="max-w-2xl mx-auto">
            {/* Main Profile Card */}
            <div className="bg-white rounded-lg shadow-lg p-8 relative">
            {/* Three-Dot Menu Button */}
              <div className="absolute top-8 right-8" ref={menuRef}>
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="cursor-pointer p-1 rounded-full hover:bg-gray-200 transition"
                    aria-label="Options menu"
                  >
                    <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="5" r="2.5" />
                      <circle cx="12" cy="12" r="2.5" />
                      <circle cx="12" cy="19" r="2.5" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <button
                        onClick={handleViewProgress}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-center gap-2 border-b border-gray-100 last:border-b-0"
                      >
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span className="cursor-pointer text-gray-700 font-medium">View Progress</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Header with Avatar */}
              <div className="flex items-start gap-6 mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-semibold flex-shrink-0">
                  {getInitials()}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {profile.firstName} {profile.lastName}
                  </h2>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-t border-gray-200 pt-8 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h3>
                <div className="space-y-4">
                  {profile.email && (
                    <div className="flex items-start gap-4">
                      <div className="text-2xl pt-1">📧</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-600">Email Address</p>
                        <p className="text-gray-900 font-medium break-all">{profile.email}</p>
                      </div>
                    </div>
                  )}

                  {profile.phone && (
                    <div className="flex items-start gap-4">
                      <div className="text-2xl pt-1">📱</div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Phone Number</p>
                        <p className="text-gray-900 font-medium">{profile.phone}</p>
                      </div>
                    </div>
                  )}

                  {profile.department && (
                    <div className="flex items-start gap-4">
                      <div className="text-2xl pt-1">🏢</div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Department</p>
                        <p className="text-gray-900 font-medium">{profile.department}</p>
                      </div>
                    </div>
                  )}

                  {profile.position && (
                    <div className="flex items-start gap-4">
                      <div className="text-2xl pt-1">💼</div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Position</p>
                        <p className="text-gray-900 font-medium">{profile.position}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio Section */}
              {profile.bio && (
                <div className="border-t border-gray-200 pt-8 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
                  <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {/* Interests Section */}
              {profile.interests && (
                <div className="border-t border-gray-200 pt-8 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Interests</h3>
                  <p className="text-gray-700">{profile.interests}</p>
                </div>
              )}

              {/* Skills Section */}
              {profile.skills && profile.skills.length > 0 && (
                <div className="border-t border-gray-200 pt-8 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Skills</h3>
                  <div className="space-y-3">
                    {profile.skills.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-900">{skill.name}</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSkillLevelClass(skill.level)}`}>
                          {skill.level}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Back Button */}
              <div className="border-t border-gray-200 pt-8">
                <button
                  onClick={() => navigate(-1)}
                  className="cursor-pointer w-full px-6 py-3 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
