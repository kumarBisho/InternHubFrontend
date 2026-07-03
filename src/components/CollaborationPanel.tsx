import { useEffect, useState } from 'react';
import PresenceIndicator from './PresenceIndicator';
import ActivityFeed from './ActivityFeed';
import '../styles/collaboration.css';

interface CollaborationPanelProps {
  resourceType?: string;
  resourceId?: number;
  compact?: boolean;
}

export default function CollaborationPanel({
  resourceType,
  resourceId,
  compact = false,
}: CollaborationPanelProps) {
  const [activeTab, setActiveTab] = useState<'activity' | 'presence'>('activity');

  useEffect(() => {
    const fetchMetrics = async () => {
      // Metrics fetched from API
    };

    fetchMetrics();

    // Refresh metrics every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (compact) {
    return (
      <div className="collaboration-compact">
        <PresenceIndicator showDetails={false} />
        <ActivityFeed limit={5} resourceType={resourceType} resourceId={resourceId} />
      </div>
    );
  }

  return (
    <div className="collaboration-panel">
      <div className="collaboration-header">
        <h2 className="collaboration-title">🤝 Real-time Collaboration</h2>
      </div>

      <div className="collaboration-tabs">
        <button
          className={`collaboration-tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          📊 Activity Feed
        </button>
        <button
          className={`collaboration-tab ${activeTab === 'presence' ? 'active' : ''}`}
          onClick={() => setActiveTab('presence')}
        >
          👥 Online Users
        </button>
      </div>

      <div className="collaboration-content">
        {activeTab === 'activity' ? (
          <ActivityFeed
            limit={50}
            resourceType={resourceType}
            resourceId={resourceId}
          />
        ) : (
          <PresenceIndicator showDetails={true} />
        )}
      </div>
    </div>
  );
}
