import * as signalR from "@microsoft/signalr";
import authService from "./authService";

export interface ActivityLog {
  id: number;
  userId: string;
  userName: string;
  userEmail: string;
  actionType: string;
  resourceType: string;
  resourceId?: number;
  resourceName: string;
  description: string;
  timestamp: string;
  changeDetails?: string;
}

export interface PresenceStatus {
  userId: string;
  userName: string;
  userEmail: string;
  isOnline: boolean;
  lastActiveAt: string;
  currentPage: string;
  currentResourceId?: number;
}

export interface CollaborativeComment {
  id: number;
  userId: string;
  userName: string;
  userEmail: string;
  content: string;
  resourceType: string;
  resourceId: number;
  createdAt: string;
  updatedAt?: string;
  replyCount: number;
  replies?: CommentReply[];
}

export interface CommentReply {
  id: number;
  userId: string;
  userName: string;
  userEmail: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CollaborationMetrics {
  onlineUsersCount: number;
  activeTasksCount: number;
  todaysActivityCount: number;
  commentsCount: number;
  lastUpdated: string;
}

class CollaborationService {
  private connection: signalR.HubConnection | null = null;
  private isConnected = false;
  private listeners: { [key: string]: ((data: any) => void)[] } = {};

  async connect(): Promise<void> {
    if (this.isConnected) return;

    const token = authService.getAccessToken();
    if (!token) {
      throw new Error("No authentication token available");
    }

    const signalRUrl = import.meta.env['VITE_SIGNALR_URL'] 
      ? `${import.meta.env['VITE_SIGNALR_URL']}/collaboration`
      : "https://internhubbackend-h4qp.onrender.com/hubs/collaboration";

    // Add token as query parameter for better WebSocket support
    const urlWithToken = `${signalRUrl}?access_token=${encodeURIComponent(token)}`;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(urlWithToken, {
        accessTokenFactory: () => token,
        withCredentials: true,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .withHubProtocol(new signalR.JsonHubProtocol())
      .build();

    this.setupListeners();

    try {
      await this.connection.start();
      console.log("✅ Collaboration hub connected");
      this.isConnected = true;
    } catch (err) {
      console.error("❌ Collaboration connection failed:", err);
      throw err;
    }
  }

  private setupListeners(): void {
    if (!this.connection) return;

    // Connection established
    this.connection.on("ConnectionEstablished", (data: any) => {
      console.log("Connection established:", data);
      this.emit("connectionEstablished", data);
    });

    // User joined
    this.connection.on("UserJoined", (presence: PresenceStatus) => {
      console.log("User joined:", presence.userName);
      this.emit("userJoined", presence);
    });

    // User left
    this.connection.on("UserLeft", (data: { userId: string }) => {
      console.log("User left:", data.userId);
      this.emit("userLeft", data);
    });

    // Presence updated
    this.connection.on("PresenceUpdated", (presence: PresenceStatus) => {
      this.emit("presenceUpdated", presence);
    });

    // Activity logged
    this.connection.on("ActivityLogged", (activity: ActivityLog) => {
      console.log("Activity:", activity.actionType);
      this.emit("activityLogged", activity);
    });

    // Comment added
    this.connection.on("CommentAdded", (comment: CollaborativeComment) => {
      console.log("Comment added:", comment.content);
      this.emit("commentAdded", comment);
    });

    // Task updated
    this.connection.on("TaskUpdated", (data: any) => {
      console.log("Task updated:", data);
      this.emit("taskUpdated", data);
    });

    // Project updated
    this.connection.on("ProjectUpdated", (data: any) => {
      console.log("Project updated:", data);
      this.emit("projectUpdated", data);
    });

    // Online users
    this.connection.on("OnlineUsers", (data: any) => {
      this.emit("onlineUsers", data);
    });

    // User joined resource
    this.connection.on("UserJoinedResource", (data: any) => {
      console.log("User joined resource:", data);
      this.emit("userJoinedResource", data);
    });

    // User left resource
    this.connection.on("UserLeftResource", (data: any) => {
      console.log("User left resource:", data);
      this.emit("userLeftResource", data);
    });

    // Pong
    this.connection.on("Pong", () => {
      console.log("Pong received");
    });

    // Error
    this.connection.on("Error", (data: any) => {
      console.error("Hub error:", data);
      this.emit("error", data);
    });
  }

  private emit(eventType: string, data: any): void {
    const callbacks = this.listeners[eventType] || [];
    callbacks.forEach((callback) => callback(data));
  }

  on(eventType: string, callback: (data: any) => void): void {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(callback);
  }

  off(eventType: string, callback?: (data: any) => void): void {
    if (callback) {
      this.listeners[eventType] = (this.listeners[eventType] || []).filter(
        (cb) => cb !== callback
      );
    } else {
      this.listeners[eventType] = [];
    }
  }

  clearListeners(eventType?: string): void {
    if (eventType) {
      this.listeners[eventType] = [];
    } else {
      this.listeners = {};
    }
  }

  async updatePresence(presence: PresenceStatus): Promise<void> {
    if (!this.connection) throw new Error("Not connected");
    await this.connection.invoke("UpdatePresence", presence);
  }

  async logActivity(activity: ActivityLog): Promise<void> {
    if (!this.connection) throw new Error("Not connected");
    await this.connection.invoke("LogActivity", activity);
  }

  async addComment(comment: {
    content: string;
    resourceType: string;
    resourceId: number;
  }): Promise<void> {
    if (!this.connection) throw new Error("Not connected");
    await this.connection.invoke("AddComment", comment);
  }

  async joinResourceGroup(resourceType: string, resourceId: number): Promise<void> {
    if (!this.connection) throw new Error("Not connected");
    await this.connection.invoke("JoinResourceGroup", resourceType, resourceId);
  }

  async leaveResourceGroup(
    resourceType: string,
    resourceId: number
  ): Promise<void> {
    if (!this.connection) throw new Error("Not connected");
    await this.connection.invoke("LeaveResourceGroup", resourceType, resourceId);
  }

  async taskUpdated(taskId: number, updates: any): Promise<void> {
    if (!this.connection) throw new Error("Not connected");
    await this.connection.invoke("TaskUpdated", taskId, updates);
  }

  async projectUpdated(projectId: number, updates: any): Promise<void> {
    if (!this.connection) throw new Error("Not connected");
    await this.connection.invoke("ProjectUpdated", projectId, updates);
  }

  async getOnlineUsers(): Promise<void> {
    if (!this.connection) throw new Error("Not connected");
    await this.connection.invoke("GetOnlineUsers");
  }

  async ping(): Promise<void> {
    if (!this.connection) throw new Error("Not connected");
    await this.connection.invoke("Ping");
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
        this.isConnected = false;
        console.log("Collaboration hub disconnected");
      } catch (err) {
        console.error("Error disconnecting:", err);
      }
    }
  }

  isConnectedStatus(): boolean {
    return this.isConnected;
  }
}

const collaborationService = new CollaborationService();
export default collaborationService;
