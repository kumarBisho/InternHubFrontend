import { useState, useEffect } from 'react';
import projectService from '../services/projectService';
import userService from '../services/userService';

interface AssignProjectModalProps {
  isOpen: boolean;
  projectId?: string;
  onClose: () => void;
  onAssignmentSuccess: () => void;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export default function AssignProjectModal({
  isOpen,
  projectId,
  onClose,
  onAssignmentSuccess,
}: AssignProjectModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interns, setInterns] = useState<User[]>([]);
  const [mentors, setMentors] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedIntern, setSelectedIntern] = useState<string>('');
  const [selectedMentor, setSelectedMentor] = useState<string>('');

  // Fetch users and reset form on modal open
  useEffect(() => {
    if (isOpen) {
      // Reset form fields
      setSelectedIntern('');
      setSelectedMentor('');
      setError(null);
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      setError(null);
      console.log('Loading users for project assignment...');
      
      const allUsers = await userService.getAllUsers();
      console.log('Users loaded successfully:', allUsers);

      // Filter interns and mentors
      const internsList = allUsers.filter(
        u => u.role?.toLowerCase() === 'intern' || u.role?.toLowerCase() === '3'
      );
      const mentorsList = allUsers.filter(
        u => u.role?.toLowerCase() === 'mentor' || u.role?.toLowerCase() === '2'
      );

      console.log('Filtered interns:', internsList.length, 'mentors:', mentorsList.length);
      
      setInterns(internsList);
      setMentors(mentorsList);
    } catch (err: any) {
      const errorMessage = typeof err === 'string' ? err : 'Failed to load users';
      console.error('Error loading users:', err);
      setError(errorMessage);
      setInterns([]);
      setMentors([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!projectId) {
      setError('No project selected');
      return;
    }

    if (!selectedIntern) {
      setError('Please select an intern');
      return;
    }

    if (!selectedMentor) {
      setError('Please select a mentor');
      return;
    }

    try {
      setLoading(true);
      console.log('Submitting assignment with:', {
        projectId,
        InternId: selectedIntern,
        MentorId: selectedMentor,
      });

      await projectService.assignProject(projectId, {
        InternId: selectedIntern,
        MentorId: selectedMentor,
      });

      // Reset form
      setSelectedIntern('');
      setSelectedMentor('');

      onAssignmentSuccess();
      onClose();
    } catch (err: any) {
      console.error('Assignment error caught:', err);
      const errorMessage = typeof err === 'string' ? err : 'Failed to assign project';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">Assign Project</h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-white hover:bg-white/20 p-2 rounded-lg transition"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loadingUsers ? (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-full animate-spin">
                <span>⏳</span>
              </div>
              <p className="text-gray-600 mt-2">Loading users...</p>
            </div>
          ) : (
            <>
              {/* Select Intern */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Intern *
                </label>
                {interns.length === 0 ? (
                  <p className="text-gray-500 text-sm p-3 bg-gray-50 rounded-lg">
                    No interns available
                  </p>
                ) : (
                  <select
                    value={selectedIntern}
                    onChange={e => setSelectedIntern(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:bg-gray-100"
                  >
                    <option value="">Choose an intern...</option>
                    {interns.map(intern => (
                      <option key={intern.id} value={intern.id}>
                        {intern.firstName} {intern.lastName} ({intern.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Select Mentor */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Mentor *
                </label>
                {mentors.length === 0 ? (
                  <p className="text-gray-500 text-sm p-3 bg-gray-50 rounded-lg">
                    No mentors available
                  </p>
                ) : (
                  <select
                    value={selectedMentor}
                    onChange={e => setSelectedMentor(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:bg-gray-100"
                  >
                    <option value="">Choose a mentor...</option>
                    {mentors.map(mentor => (
                      <option key={mentor.id} value={mentor.id}>
                        {mentor.firstName} {mentor.lastName} ({mentor.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Assignment Info */}
              {selectedIntern && selectedMentor && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-blue-700 text-sm">
                    <strong>Ready to assign:</strong><br />
                    Intern: {interns.find(i => i.id === selectedIntern)?.firstName}{' '}
                    {interns.find(i => i.id === selectedIntern)?.lastName}<br />
                    Mentor: {mentors.find(m => m.id === selectedMentor)?.firstName}{' '}
                    {mentors.find(m => m.id === selectedMentor)?.lastName}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading || loadingUsers}
              className="cursor-pointer flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || loadingUsers}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Assigning...
                </>
              ) : (
                <>
                  <span>✓</span>
                  Assign Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
