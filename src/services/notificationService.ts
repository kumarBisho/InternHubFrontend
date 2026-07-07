import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import api from "./api";

export interface Notification {
  id: number;
  userId: string;
  title: string;
  message: string;
  description?: string;
  type: NotificationType;
  triggeredByUserId?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export const NotificationType = {
  TaskAssigned: "TaskAssigned",
  TaskUpdated: "TaskUpdated",
  TaskCompleted: "TaskCompleted",
  ProjectCreated: "ProjectCreated",
  ProjectUpdated: "ProjectUpdated",
  ProjectAssignment: "ProjectAssignment",
  CommentAdded: "CommentAdded",
  UserMentioned: "UserMentioned",
  CollaborationInvite: "CollaborationInvite",
  DeadlineReminder: "DeadlineReminder",
  StatusChanged: "StatusChanged",
  PriorityChanged: "PriorityChanged",
  GeneralNotification: "GeneralNotification",
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

class NotificationService {
  private hubConnection: HubConnection | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 seconds

  /**
   * Initialize SignalR connection to notifications hub
   */
  async initializeConnection(token: string): Promise<void> {
    if (this.hubConnection) {
      return;
    }

    const apiUrl = import.meta.env['VITE_API_URL'] || "https://internhubbackend-h4qp.onrender.com";
    const hubUrl = `${apiUrl}/hubs/notifications`;

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
        skipNegotiation: false,
        transport: 1, // WebSockets
      })
      .withAutomaticReconnect([
        0, 2000, 5000, 10000, 15000, 30000,
      ])
      .configureLogging(LogLevel.Information)
      .build();

    this.setupEventListeners();

    try {
      await this.hubConnection.start();
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log("✅ Notification hub connected");
    } catch (error) {
      console.error("❌ Failed to connect to notification hub:", error);
      this.scheduleReconnect(token);
    }
  }

  /**
   * Setup SignalR event listeners
   */
  private setupEventListeners(): void {
    if (!this.hubConnection) return;

    // Listen for incoming notifications
    this.hubConnection.on("ReceiveNotification", (notification: Notification) => {
      console.log("📬 Received notification:", notification);
      this.handleNotificationReceived(notification);
    });

    // Connection status events
    this.hubConnection.onreconnecting(() => {
      console.log("🔄 Reconnecting to notification hub...");
      this.isConnected = false;
    });

    this.hubConnection.onreconnected(() => {
      console.log("✅ Reconnected to notification hub");
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.hubConnection.onclose(() => {
      console.log("❌ Disconnected from notification hub");
      this.isConnected = false;
    });
  }

  /**
   * Schedule automatic reconnection
   */
  private scheduleReconnect(token: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("❌ Max reconnect attempts reached");
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `⏳ Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectDelay}ms`
    );

    setTimeout(() => {
      this.initializeConnection(token).catch(() => {
        this.scheduleReconnect(token);
      });
    }, this.reconnectDelay);
  }

  /**
   * Handle incoming notification - dispatch custom event
   */
  private handleNotificationReceived(notification: Notification): void {
    // Dispatch custom event for React components to listen to
    const event = new CustomEvent("notificationReceived", {
      detail: notification,
    });
    window.dispatchEvent(event);

    // Play notification sound if enabled
    this.playNotificationSound(notification.type);

    // Show toast notification for important types
    this.showToastNotification(notification);
  }

  /**
   * Play notification sound
   */
  private playNotificationSound(type: NotificationType): void {
    // You can implement sound playing here
    // For now, just using console log
    console.log(`🔔 Sound for notification type: ${type}`);
  }

  /**
   * Show toast notification (can be integrated with toast library)
   */
  private showToastNotification(notification: Notification): void {
    // This can be integrated with a toast library like react-toastify
    console.log(`🎉 Toast: ${notification.title} - ${notification.message}`);
  }

  /**
   * Get all notifications for current user
   */
  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await api.get("/notification");
      return response.data?.data || [];
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      throw error; // Propagate to be caught by error boundary or hook
    }
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get("/notification/unread-count");
      return response.data?.data || 0;
    } catch (error) {
      console.error("Failed to get unread count:", error);
      return 0;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: number): Promise<void> {
    try {
      await api.post(`/notification/${notificationId}/mark-read`);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      await api.post("/notification/mark-all-read");
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      throw error;
    }
  }

  /**
   * Clear all read notifications
   */
  async clearReadNotifications(): Promise<void> {
    try {
      await api.delete("/notification/clear-read");
    } catch (error) {
      console.error("Failed to clear read notifications:", error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: number): Promise<void> {
    try {
      await api.delete(`/notification/${notificationId}`);
    } catch (error) {
      console.error("Failed to delete notification:", error);
      throw error;
    }
  }

  /**
   * Check if connected to hub
   */
  isHubConnected(): boolean {
    return this.isConnected && (this.hubConnection?.state as any) === 1; // 1 = Connected
  }

  /**
   * Disconnect from hub
   */
  async disconnect(): Promise<void> {
    if (this.hubConnection) {
      try {
        await this.hubConnection.stop();
        this.isConnected = false;
        console.log("✅ Notification hub disconnected");
      } catch (error) {
        console.error("Failed to disconnect from notification hub:", error);
      }
    }
  }

  /**
   * Subscribe to notification events
   */
  subscribeToNotifications(callback: (notification: Notification) => void): () => void {
    if (typeof window === "undefined") {
      console.warn("Window object is not available");
      return () => {};
    }

    const listener = (event: Event) => {
      try {
        const customEvent = event as CustomEvent<Notification>;
        callback(customEvent.detail);
      } catch (error) {
        console.error("Error in notification callback:", error);
      }
    };

    window.addEventListener("notificationReceived", listener);

    // Return unsubscribe function
    return () => {
      window.removeEventListener("notificationReceived", listener);
    };
  }

  /**
   * Get notification icon based on type
   */
  getNotificationIcon(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
      [NotificationType.TaskAssigned]: "📋",
      [NotificationType.TaskUpdated]: "✏️",
      [NotificationType.TaskCompleted]: "✅",
      [NotificationType.ProjectCreated]: "🚀",
      [NotificationType.ProjectUpdated]: "📝",
      [NotificationType.ProjectAssignment]: "👥",
      [NotificationType.CommentAdded]: "💬",
      [NotificationType.UserMentioned]: "👤",
      [NotificationType.CollaborationInvite]: "🤝",
      [NotificationType.DeadlineReminder]: "⏰",
      [NotificationType.StatusChanged]: "🔄",
      [NotificationType.PriorityChanged]: "⚡",
      [NotificationType.GeneralNotification]: "ℹ️",
    };
    return icons[type] || "📬";
  }

  /**
   * Get notification color based on type
   */
  getNotificationColor(type: NotificationType): string {
    const colors: Record<NotificationType, string> = {
      [NotificationType.TaskAssigned]: "blue",
      [NotificationType.TaskUpdated]: "cyan",
      [NotificationType.TaskCompleted]: "green",
      [NotificationType.ProjectCreated]: "purple",
      [NotificationType.ProjectUpdated]: "yellow",
      [NotificationType.ProjectAssignment]: "indigo",
      [NotificationType.CommentAdded]: "orange",
      [NotificationType.UserMentioned]: "red",
      [NotificationType.CollaborationInvite]: "pink",
      [NotificationType.DeadlineReminder]: "red",
      [NotificationType.StatusChanged]: "gray",
      [NotificationType.PriorityChanged]: "amber",
      [NotificationType.GeneralNotification]: "slate",
    };
    return colors[type] || "slate";
  }
}

export default new NotificationService();
