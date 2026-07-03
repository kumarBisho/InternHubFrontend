import React, { useEffect, useState } from "react";
import type { Notification } from "../services/notificationService";
import { NotificationType } from "../services/notificationService";
import notificationService from "../services/notificationService";

interface NotificationCenterProps {
  isOpen?: boolean;
  onClose?: () => void;
  onMarkRead?: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen = false,
  onClose,
  onMarkRead,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Load notifications on component mount
  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      try {
        setIsLoading(true);
        const data = await notificationService.getNotifications();
        if (isMounted) {
          setNotifications(data || []);
          const unread = (data || []).filter((n) => !n.isRead).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error("Failed to load notifications:", error);
        if (isMounted) {
          setHasError(true);
          setNotifications([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadNotifications();

    // Subscribe to real-time notifications
    let unsubscribe: (() => void) | null = null;
    try {
      unsubscribe = notificationService.subscribeToNotifications((newNotification) => {
        if (isMounted) {
          setNotifications((prev) => [newNotification, ...prev]);
          if (!newNotification.isRead) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      });
    } catch (error) {
      console.warn("Failed to subscribe to notifications:", error);
    }

    return () => {
      isMounted = false;
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (e) {
          console.warn("Error unsubscribing:", e);
        }
      }
    };
  }, []);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      onMarkRead?.();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      // Call onMarkRead for each unread notification that becomes read
      for (let i = 0; i < unreadCount; i++) {
        onMarkRead?.();
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (notificationId: number) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  // Clear all read notifications
  const handleClearRead = async () => {
    try {
      await notificationService.clearReadNotifications();
      setNotifications((prev) => prev.filter((n) => !n.isRead));
    } catch (error) {
      console.error("Failed to clear read notifications:", error);
    }
  };

  // Navigate to notification action
  const handleNavigateToNotification = (notification: Notification) => {
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
      handleMarkAsRead(notification.id);
    }
  };

  // Filter notifications based on view
  const displayedNotifications = showUnreadOnly
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  // Get notification color
  const getNotificationBgColor = (type: NotificationType, isRead: boolean) => {
    if (isRead) return "bg-slate-50";

    const colors: Record<NotificationType, string> = {
      [NotificationType.TaskAssigned]: "bg-blue-50",
      [NotificationType.TaskUpdated]: "bg-cyan-50",
      [NotificationType.TaskCompleted]: "bg-green-50",
      [NotificationType.ProjectCreated]: "bg-purple-50",
      [NotificationType.ProjectUpdated]: "bg-yellow-50",
      [NotificationType.ProjectAssignment]: "bg-indigo-50",
      [NotificationType.CommentAdded]: "bg-orange-50",
      [NotificationType.UserMentioned]: "bg-red-50",
      [NotificationType.CollaborationInvite]: "bg-pink-50",
      [NotificationType.DeadlineReminder]: "bg-red-50",
      [NotificationType.StatusChanged]: "bg-gray-50",
      [NotificationType.PriorityChanged]: "bg-amber-50",
      [NotificationType.GeneralNotification]: "bg-slate-50",
    };
    return colors[type] || "bg-slate-50";
  };

  return (
    <div className={`notification-center ${isOpen ? "open" : "closed"}`}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="cursor-pointer text-slate-500 hover:text-slate-700 text-xl"
            >
              ✕
            </button>
          )}
        </div>

        {/* Control buttons */}
        <div className="flex gap-2 text-sm">
          <button
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className={`cursor-pointer px-3 py-1 rounded border transition-colors ${
              showUnreadOnly
                ? "bg-blue-100 border-blue-300 text-blue-700"
                : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {showUnreadOnly ? "Unread" : "All"}
          </button>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="cursor-pointer px-3 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Mark all as read
            </button>
          )}

          {notifications.some((n) => n.isRead) && (
            <button
              onClick={handleClearRead}
              className="cursor-pointer px-3 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Clear read
            </button>
          )}

          <button
            onClick={() => window.location.reload()}
            className="cursor-pointer px-3 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
            disabled={isLoading}
          >
            🔄
          </button>
        </div>
      </div>

      {/* Notification list */}
      <div className="notification-list max-h-96 overflow-y-auto">
        {hasError ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500 text-center">
              <div className="text-3xl mb-2">⚠️</div>
              <p>Failed to load notifications</p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-slate-500">Loading notifications...</div>
          </div>
        ) : displayedNotifications.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-slate-500 text-center">
              <div className="text-3xl mb-2">📭</div>
              <p>
                {showUnreadOnly
                  ? "No unread notifications"
                  : "No notifications yet"}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {displayedNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-slate-100 transition-colors border-l-4 ${
                  notification.isRead ? "border-slate-200" : "border-blue-500"
                } ${getNotificationBgColor(notification.type, notification.isRead)}`}
              >
                <div
                  onClick={() =>
                    notification.actionUrl
                      ? handleNavigateToNotification(notification)
                      : handleMarkAsRead(notification.id)
                  }
                  className="mb-2"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">
                      {notificationService.getNotificationIcon(
                        notification.type
                      )}
                    </span>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900 truncate">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {notification.message}
                      </p>
                      {notification.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {notification.description}
                        </p>
                      )}
                      <div className="mt-2 text-xs text-slate-500">
                        {formatTime(notification.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mt-2 ml-11">
                  {!notification.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id);
                      }}
                      className="cursor-pointer text-xs px-2 py-1 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Mark as read
                    </button>
                  )}

                  {notification.actionUrl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigateToNotification(notification);
                      }}
                      className="cursor-pointer text-xs px-2 py-1 rounded bg-blue-100 border border-blue-300 text-blue-700 hover:bg-blue-200 transition-colors"
                    >
                      View
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNotification(notification.id);
                    }}
                    className="cursor-pointer text-xs px-2 py-1 rounded bg-white border border-slate-300 text-slate-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 px-4 py-2 text-center text-xs text-slate-500">
        {notifications.length > 0
          ? `${notifications.filter((n) => !n.isRead).length} of ${notifications.length} unread`
          : "No notifications"}
      </div>
    </div>
  );
};

export default NotificationCenter;
