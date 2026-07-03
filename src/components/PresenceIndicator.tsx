import { useEffect, useState } from 'react';
import type { PresenceStatus } from '../services/collaborationService';
import collaborationService from '../services/collaborationService';
import '../styles/collaboration.css';

interface PresenceIndicatorProps {
  showDetails?: boolean;
}

export default function PresenceIndicator({ showDetails = false }: PresenceIndicatorProps) {
  const [onlineUsers, setOnlineUsers] = useState<PresenceStatus[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Register listeners BEFORE connecting
    const userJoinedHandler = (presence: PresenceStatus) => {
      console.log('User joined:', presence);
      setOnlineUsers((prev) => {
        const exists = prev.some((u) => u.userId === presence.userId);
        return exists ? prev : [...prev, presence];
      });
    };

    const userLeftHandler = ({ userId }: { userId: string }) => {
      console.log('User left:', userId);
      setOnlineUsers((prev) => prev.filter((u) => u.userId !== userId));
    };

    const presenceUpdatedHandler = (presence: PresenceStatus) => {
      console.log('Presence updated:', presence);
      setOnlineUsers((prev) =>
        prev.map((u) => (u.userId === presence.userId ? presence : u))
      );
    };

    const onlineUsersHandler = (data: any) => {
      console.log('Raw online users data from backend:', data);
      
      // Helper to convert PascalCase to camelCase
      const convertToPresenceStatus = (item: any): PresenceStatus => ({
        userId: item.userId || item.UserId,
        userName: item.userName || item.UserName,
        userEmail: item.userEmail || item.UserEmail,
        isOnline: item.isOnline !== undefined ? item.isOnline : item.IsOnline,
        lastActiveAt: item.lastActiveAt || item.LastActiveAt,
        currentPage: item.currentPage || item.CurrentPage,
        currentResourceId: item.currentResourceId || item.CurrentResourceId,
      });

      let usersArray: PresenceStatus[] = [];

      // Handle different response formats
      if (Array.isArray(data)) {
        // Direct array
        usersArray = data.map(convertToPresenceStatus);
      } else if (data && Array.isArray(data.OnlineUsers)) {
        // OnlineUsersDto with PascalCase property
        usersArray = data.OnlineUsers.map(convertToPresenceStatus);
      } else if (data && Array.isArray(data.onlineUsers)) {
        // camelCase fallback
        usersArray = data.onlineUsers.map(convertToPresenceStatus);
      }

      console.log('Converted online users:', usersArray);
      setOnlineUsers(usersArray);
    };

    // Register all listeners
    collaborationService.on('userJoined', userJoinedHandler);
    collaborationService.on('userLeft', userLeftHandler);
    collaborationService.on('presenceUpdated', presenceUpdatedHandler);
    collaborationService.on('onlineUsers', onlineUsersHandler);

    // Then initialize connection
    const initConnection = async () => {
      try {
        if (!collaborationService.isConnectedStatus()) {
          console.log('Connecting to collaboration service...');
          await collaborationService.connect();
          console.log('Connected successfully');
        }
        setIsConnected(true);

        // Get initial online users after connection is established
        setTimeout(async () => {
          try {
            console.log('Requesting online users...');
            await collaborationService.getOnlineUsers();
          } catch (error) {
            console.error('Failed to get online users:', error);
          }
        }, 500); // Small delay to ensure listeners are ready
      } catch (error) {
        console.error('Connection failed:', error);
      }
    };

    initConnection();

    return () => {
      // Cleanup listeners
      collaborationService.clearListeners('userJoined');
      collaborationService.clearListeners('userLeft');
      collaborationService.clearListeners('presenceUpdated');
      collaborationService.clearListeners('onlineUsers');
    };
  }, []);

  if (!isConnected) {
    return (
      <div className="presence-indicator status-offline">
        <span className="indicator-dot"></span>
        <span className="indicator-text">Offline</span>
      </div>
    );
  }

  if (!showDetails) {
    return (
      <div className="presence-indicator status-online">
        <span className="indicator-dot"></span>
        <span className="indicator-text">Online ({onlineUsers.length})</span>
      </div>
    );
  }

  return (
    <div className="presence-container">
      <div className="presence-header">
        <h3 className="presence-title">
          👥 Online Users ({onlineUsers.length})
        </h3>
        <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </span>
      </div>

      {onlineUsers.length > 0 ? (
        <div className="online-users-list">
          {onlineUsers.map((user) => (
            <div key={user.userId} className="user-presence-item">
              <div className="user-avatar">
                {user.userName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div className="user-presence-info">
                <div className="user-presence-name">{user.userName}</div>
                <div className="user-presence-page">
                  {user.currentPage || 'Dashboard'}
                </div>
              </div>
              <span className="presence-badge">● Online</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-users-message">
          <span>No users currently online</span>
        </div>
      )}
    </div>
  );
}
