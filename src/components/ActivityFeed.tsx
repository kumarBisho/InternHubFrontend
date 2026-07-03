import { useEffect, useState } from 'react';
import type { ActivityLog } from '../services/collaborationService';
import collaborationService from '../services/collaborationService';
import * as collaborationApi from '../services/collaborationApi';
import '../styles/collaboration.css';

interface ActivityFeedProps {
  resourceType?: string;
  resourceId?: number;
  limit?: number;
  autoScroll?: boolean;
}

export default function ActivityFeed({
  resourceType,
  resourceId,
  limit = 50,
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        if (resourceType && resourceId) {
          const data = await collaborationApi.getResourceActivities(resourceType, resourceId);
          setActivities(Array.isArray(data) ? data : []);
        } else {
          const data = await collaborationApi.getRecentActivities(limit);
          setActivities(Array.isArray(data) ? data : []);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError('Failed to load activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();

    // Listen for real-time activity updates
    collaborationService.on('activityLogged', (activity: ActivityLog) => {
      setActivities((prev) => {
        const updated = [activity, ...prev];
        // Keep only limit items
        return updated.slice(0, limit);
      });
    });

    // Connect to collaboration service if not already connected
    if (!collaborationService.isConnectedStatus()) {
      collaborationService.connect().catch(console.error);
    }
  }, [resourceType, resourceId, limit]);

  const getActionIcon = (actionType: string): string => {
    const icons: { [key: string]: string } = {
      Created: '✨',
      Updated: '🔄',
      Completed: '✅',
      Assigned: '👤',
      Commented: '💬',
      Deleted: '🗑️',
      Moved: '➡️',
      Started: '▶️',
      Paused: '⏸️',
    };
    return icons[actionType] || '📝';
  };

  const getResourceColor = (resourceType: string): string => {
    const colors: { [key: string]: string } = {
      Task: '#3b82f6',
      Project: '#8b5cf6',
      User: '#ec4899',
      Comment: '#f59e0b',
    };
    return colors[resourceType] || '#6b7280';
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="activity-feed-container">
        <div className="activity-loading">
          <div className="spinner"></div>
          <p>Loading activities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="activity-feed-container">
        <div className="activity-error">
          <p>⚠️ {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-feed-container">
      <div className="activity-feed-header">
        <h3 className="activity-feed-title">📊 Activity Feed</h3>
        <span className="activity-count">{activities.length} activities</span>
      </div>

      {activities.length > 0 ? (
        <div className="activity-timeline">
          {activities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-marker">
                <span className="activity-icon" title={activity.actionType}>
                  {getActionIcon(activity.actionType)}
                </span>
              </div>

              <div className="activity-content">
                <div className="activity-header-row">
                  <span className="activity-user-name">{activity.userName}</span>
                  <span className="activity-action">{activity.actionType}</span>
                  {activity.resourceType && (
                    <span
                      className="activity-resource-badge"
                      style={{
                        backgroundColor: getResourceColor(activity.resourceType),
                      }}
                    >
                      {activity.resourceType}
                    </span>
                  )}
                </div>

                <div className="activity-description">
                  {activity.resourceName && (
                    <strong>{activity.resourceName}</strong>
                  )}
                  {activity.description && <p>{activity.description}</p>}
                </div>

                <div className="activity-footer">
                  <time className="activity-time">
                    {formatTime(activity.timestamp)}
                  </time>
                  {activity.changeDetails && (
                    <span className="activity-details-indicator">
                      📋 Details
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="activity-empty">
          <p>No activities yet</p>
        </div>
      )}
    </div>
  );
}
