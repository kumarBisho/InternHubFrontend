import { useState, useEffect } from 'react';
import taskService from '../services/taskService';
import userService from '../services/userService';

interface InternOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AssignTaskModalProps {
  isOpen: boolean;
  taskId: string;
  projectId: string;
  taskTitle: string;
  mentorId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignTaskModal({
  isOpen,
  taskId,
  projectId,
  taskTitle,
  mentorId,
  onClose,
  onSuccess,
}: AssignTaskModalProps) {
  const [selectedInterns, setSelectedInterns] = useState<string[]>([]);
  const [availableInterns, setAvailableInterns] = useState<InternOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchingInterns, setFetchingInterns] = useState(false);

  useEffect(() => {
    if (isOpen && mentorId && projectId) {
      setSelectedInterns([]);
      fetchProjectInterns();
    }
  }, [isOpen, mentorId, projectId]);

  const fetchProjectInterns = async () => {
    setFetchingInterns(true);
    setError(null);
    try {
      // Fetch interns assigned to the mentor for this specific project
      const interns = await userService.getInternsByMentorAndProject(mentorId, projectId);
      
      if (interns && interns.length > 0) {
        // Map to InternOption interface
        const internOptions = interns.map((intern: any) => ({
          id: intern.id,
          firstName: intern.firstName || 'Unknown',
          lastName: intern.lastName || '',
          email: intern.email || '',
        }));
        setAvailableInterns(internOptions);
        console.log('Fetched interns for mentor on project:', internOptions);
      } else {
        setAvailableInterns([]);
        console.log('No interns found for mentor on this project');
      }
    } catch (err) {
      console.error('Failed to fetch interns:', err);
      // Show error message to user
      setError(typeof err === 'string' ? err : 'Failed to fetch interns for this project');
      setAvailableInterns([]);
    } finally {
      setFetchingInterns(false);
    }
  };

  const handleInternToggle = (internId: string) => {
    setSelectedInterns((prev) =>
      prev.includes(internId) ? prev.filter((id) => id !== internId) : [...prev, internId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (selectedInterns.length === 0) {
        throw new Error('Please select at least one intern');
      }

      await taskService.assignTaskToInterns({
        taskId,
        internIds: selectedInterns,
      });

      setSelectedInterns([]);
      onSuccess();
      onClose();
    } catch (err) {
      setError(typeof err === 'string' ? err : (err as any).message || 'Failed to assign task');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Assign Task to Interns</h2>
        <p className="text-gray-600 text-sm mb-6">Task: <span className="font-semibold">{taskTitle}</span></p>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Interns to Assign ({selectedInterns.length} selected)
            </label>

            {fetchingInterns ? (
              <div className="text-center py-4 text-gray-500">Loading interns...</div>
            ) : availableInterns.length === 0 ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded text-sm">
                No interns assigned to you for this project. Please ask admin to assign interns to this project first.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-4 bg-gray-50">
                {availableInterns.map((intern) => (
                  <label key={intern.id} className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded transition">
                    <input
                      type="checkbox"
                      checked={selectedInterns.includes(intern.id)}
                      onChange={() => handleInternToggle(intern.id)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                      disabled={loading}
                    />
                    <span className="ml-3 flex-1">
                      <span className="block text-sm font-medium text-gray-900">
                        {intern.firstName} {intern.lastName}
                      </span>
                      <span className="text-xs text-gray-600">{intern.email}</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition disabled:opacity-50"
              disabled={loading || selectedInterns.length === 0 || fetchingInterns}
            >
              {loading ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

