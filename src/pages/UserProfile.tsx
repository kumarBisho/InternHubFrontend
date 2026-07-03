import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import authService from '../services/authService';
import profileService from '../services/profileService';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface Skill {
  id?: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
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

export default function UserProfile() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    department: '',
    position: '',
    bio: '',
    startDate: '',
    endDate: '',
    interests: '',
    profileImageUrl: '',
    skills: [],
  });
  const [newSkill, setNewSkill] = useState({ name: '', level: 'Beginner' as const });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(formData.profileImageUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    // Load profile data when component mounts (in production, fetch from API)
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const profileData = await profileService.getMyProfile();
      const imageUrl = profileData.profileImageUrl || '';
      setImagePreview(imageUrl);
      setFormData(prev => ({
        ...prev,
        phone: profileData.phone || '',
        department: profileData.department || '',
        position: profileData.position || '',
        bio: profileData.bio || '',
        startDate: profileData.startDate ? profileData.startDate.split('T')[0] : '',
        endDate: profileData.endDate ? profileData.endDate.split('T')[0] : '',
        interests: profileData.interests || '',
        profileImageUrl: imageUrl,
        skills: profileData.skills || [],
      }));
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile data' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.name.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, { ...newSkill, id: Date.now().toString() }]
      }));
      setNewSkill({ name: '', level: 'Beginner' });
    }
  };

  const handleRemoveSkill = (id?: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.id !== id)
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setMessage(null);

      // Prepare data for API - remove skill IDs and ensure proper date format
      const profileUpdateData = {
        phone: formData.phone && formData.phone.trim() ? formData.phone : undefined,
        department: formData.department && formData.department.trim() ? formData.department : undefined,
        position: formData.position && formData.position.trim() ? formData.position : undefined,
        bio: formData.bio && formData.bio.trim() ? formData.bio : undefined,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        interests: formData.interests && formData.interests.trim() ? formData.interests : undefined,
        profileImageUrl: formData.profileImageUrl && formData.profileImageUrl.trim() ? formData.profileImageUrl : undefined,
        // Only send skill name and level, not the ID (backend will generate new IDs)
        skills: formData.skills.map(s => ({
          name: s.name,
          level: s.level
        })),
      };

      console.log('Sending profile data:', profileUpdateData);

      // Save to backend
      await profileService.updateMyProfile(profileUpdateData);

      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: typeof error === 'string' ? error : 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    loadProfileData();
    setIsEditing(false);
    setNewSkill({ name: '', level: 'Beginner' });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select a valid image file' });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData(prev => ({
          ...prev,
          profileImageUrl: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch(level) {
      case 'Beginner': return 'bg-blue-100 text-blue-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-orange-100 text-orange-800';
      case 'Expert': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Success/Error Messages */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-300 text-green-800' 
                : 'bg-red-50 border-red-300 text-red-800'
            }`}>
              <p className="font-medium">{message.text}</p>
            </div>
          )}

          {/* Main Profile Section */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 relative">
            {/* Header Background */}
            {/* <div className="h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600"></div> */}
            <div className="h-32 bg-gradient-to-r from-gray-100 via-gray-150 to-gray-200"></div>

            {/* Profile Info */}
            <div className="px-8 pb-8 relative">
              
              {/* Avatar and Basic Info */}
              <div className="flex flex-col md:flex-row md:items-start md:space-x-6 -mt-16 mb-8 pb-8 border-b border-gray-200">
                <div className="flex flex-col items-start">
                  {/* Avatar */}
                  <div className="relative">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Profile"
                        className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-5xl border-4 border-white shadow-lg flex-shrink-0 object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-5xl border-4 border-white shadow-lg flex-shrink-0">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                    )}
                    {isEditing && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition hover:scale-110"
                        title="Upload Profile Picture"
                      >
                        📷
                      </button>
                    )}
                  </div>

                  {/* Edit Button - Below Avatar */}
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="cursor-pointer mt-4 px-6 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2"
                      title="Edit Profile"
                    >
                      ✏️ Edit Profile
                    </button>
                  )}

                  {/* Hidden File Input */}
                  {isEditing && (
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  )}
                </div>

                <div className="mt-4 md:mt-0 flex-1">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {formData.firstName} {formData.lastName}
                  </h2>
                  {formData.position && (
                    <div className="mt-2 mb-3 flex items-center gap-2">
                      <span className="text-xl">💼</span>
                      <span className="text-lg font-semibold text-gray-800">{formData.position}</span>
                    </div>
                  )}
                  {formData.department && (
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <span className="text-lg">🏢</span>
                      <p>{formData.department}</p>
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                      {user.role === 'Admin' || user.role === '1' ? 'Administrator' : user.role === 'Manager' || user.role === '2' ? 'Manager' : user.role === 'Mentor' || user.role === '3' ? 'Mentor' : 'Intern'}
                    </span>
                    {formData.startDate && (
                      <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                        📅 {new Date(formData.startDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Grid Layout for Profile Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{formData.firstName}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{formData.lastName}</p>
                  )}
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <p className="text-gray-900 font-medium break-all">{formData.email}</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  ) : (
                    <p className="text-gray-900">{formData.phone || 'Not provided'}</p>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="department"
                      value={formData.department || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., Engineering, Marketing"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  ) : (
                    <p className="text-gray-900">{formData.department || 'Not provided'}</p>
                  )}
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Position</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="position"
                      value={formData.position || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., Senior Developer, Product Manager"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  ) : (
                    <p className="text-gray-900">{formData.position || 'Not provided'}</p>
                  )}
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  ) : (
                    <p className="text-gray-900">{formData.startDate ? new Date(formData.startDate).toLocaleDateString() : 'Not provided'}</p>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  ) : (
                    <p className="text-gray-900">{formData.endDate ? new Date(formData.endDate).toLocaleDateString() : 'Not provided'}</p>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Professional Bio</label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio || ''}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself, your experience, and interests..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                  />
                ) : (
                  <p className="text-gray-900 whitespace-pre-wrap">{formData.bio || 'No bio provided'}</p>
                )}
              </div>

              {/* Interests */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Interests & Hobbies</label>
                {isEditing ? (
                  <textarea
                    name="interests"
                    value={formData.interests || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., Web Development, AI/ML, Photography, Music"
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                  />
                ) : (
                  <p className="text-gray-900">{formData.interests || 'No interests provided'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
              <h3 className="text-2xl font-bold text-gray-900">🎯 Professional Skills</h3>
            </div>

            <div className="p-8">
              {/* Skills Grid */}
              {formData.skills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {formData.skills.map((skill, index) => (
                    <div key={skill.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{skill.name}</p>
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(skill.level)}`}>
                          {skill.level}
                        </span>
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveSkill(skill.id)}
                          className="cursor-pointer ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 mb-8">
                  <p className="text-lg">No skills added yet</p>
                  <p className="text-sm mt-1">Click Edit Profile to add your professional skills</p>
                </div>
              )}

              {/* Add Skill Section */}
              {isEditing && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Add New Skill</h4>
                  <div className="flex flex-col md:flex-row gap-3">
                    <input
                      type="text"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                      placeholder="e.g., React, Python, Project Management"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                    <select
                      value={newSkill.level}
                      onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value as any })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                    <button
                      onClick={handleAddSkill}
                      className="cursor-pointer px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleSave}
                disabled={loading}
                className="cursor-pointer flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '💾 Saving...' : '💾 Save Changes'}
              </button>
              <button
                onClick={handleCancel}
                className="cursor-pointer flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Account Actions */}
          {/* <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Account Actions</h3>
            <button
              onClick={handleLogout}
              className="cursor-pointer w-full px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
            >
              🚪 Logout
            </button>
          </div> */}
        </div>
      </main>

      <Footer />
    </div>
  );
}
