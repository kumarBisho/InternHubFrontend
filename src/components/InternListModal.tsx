import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  phoneNumber?: string;
  department?: string;
}

interface InternListModalProps {
  isOpen: boolean;
  mentorName: string;
  interns: User[];
  onClose: () => void;
}

export default function InternListModal({ isOpen, mentorName, interns, onClose }: InternListModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleInternClick = (internId: string) => {
    navigate(`/profile/${internId}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Assigned Interns</h2>
            <p className="text-purple-100 text-sm mt-1">Mentor: {mentorName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {interns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-5xl mb-4">👨‍🎓</div>
              <p className="text-xl font-semibold text-gray-900 mb-2">No Interns Assigned</p>
              <p className="text-gray-600">This mentor has no interns assigned yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {interns.map((intern) => (
                <div
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 transitiongroup"
                >
                  {/* Avatar */}
                  <div 
                    key={intern.id}
                    onClick={() => handleInternClick(intern.id)}
                    className="cursor-pointer w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0 group-hover:shadow-lg transition">
                    {intern.firstName.charAt(0)}
                    {intern.lastName.charAt(0)}
                  </div>

                  {/* Intern Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition">
                      <span 
                        key={intern.id}
                        onClick={() => handleInternClick(intern.id)}
                        className="cursor-pointer hover:text-indigo-600 transition">
                        {intern.firstName} {intern.lastName}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">{intern.email}</p>
                    {intern.department && (
                      <p className="text-xs text-gray-500 mt-1">📍 {intern.department}</p>
                    )}
                  </div>

                  {/* Arrow Icon */}
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
