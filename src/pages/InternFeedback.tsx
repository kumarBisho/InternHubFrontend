import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Header from '../components/Header';
import FeedbackList from '../components/FeedbackList';
import FeedbackDetail from '../components/FeedbackDetail';
import authService from '../services/authService';

export default function InternFeedback() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(null);
  const [feedbackDetailOpen, setFeedbackDetailOpen] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  // Only allow interns to view this page
  if (user.role === 'Admin' || user.role === 'Manager' || user.role === 'Mentor' || user.role === '1' || user.role === '2' || user.role === '3') {
    navigate('/403');
    return null;
  }

  const handleFeedbackRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleSelectFeedback = (feedbackId: string) => {
    setSelectedFeedbackId(feedbackId);
    setFeedbackDetailOpen(true);
  };

  const handleCloseFeedbackDetail = () => {
    setFeedbackDetailOpen(false);
    setSelectedFeedbackId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">📝 Feedback Received</h1>
            {/* <p className="text-lg text-gray-600">
              View all feedback and guidance from your mentors to help you grow and improve
            </p> */}
          </div>

          {/* Feedback Section */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">All Feedback from Mentors</h2>
                {/* <p className="text-gray-600 text-sm mt-1">Track your progress through mentor feedback</p> */}
              </div>
              <button
                onClick={handleFeedbackRefresh}
                className="cursor-pointer px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                title="Refresh Feedback"
              >
                🔄 Refresh
              </button>
            </div>

            <div className="p-8">
              <FeedbackList
                key={refreshKey}
                internId={user.id}
                title=""
                pageSize={15}
                onSelectFeedback={handleSelectFeedback}
              />
            </div>
          </div>

          {/* Feedback Detail Modal */}
          {selectedFeedbackId && (
            <FeedbackDetail
              feedbackId={selectedFeedbackId}
              isOpen={feedbackDetailOpen}
              onClose={handleCloseFeedbackDetail}
            />
          )}

          {/* Tips Section */}
          {/* <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Tips for Getting the Most Out of Feedback</h3>
            <ul className="space-y-2 text-blue-800">
              <li>✓ Read all feedback carefully and reflect on the suggestions</li>
              <li>✓ Ask your mentor for clarification if you need more guidance</li>
              <li>✓ Use the feedback to identify areas for improvement</li>
              <li>✓ Track your progress and celebrate improvements</li>
            </ul>
          </div> */}
        </div>
      </main>

      {/* <Footer /> */}
    </div>
  );
}
