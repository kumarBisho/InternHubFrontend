import authService from "./authService";

const API_URL = import.meta.env['VITE_API_URL'] 
  ? `${import.meta.env['VITE_API_URL']}/api/collaboration`
  : "http://localhost:5248/api/collaboration";

export interface ActivityLogFilter {
  userId?: number;
  resourceType?: string;
  resourceId?: number;
  actionType?: string;
  fromDate?: string;
  toDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface CollaborationResponse<T> {
  activities?: T[];
  activities_?: T[];
  comments?: T[];
  onlineUsers?: T[];
  totalCount?: number;
  pageNumber?: number;
  pageSize?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

// Get activities with filtering
export async function getActivities(
  filter: ActivityLogFilter
): Promise<CollaborationResponse<any>> {
  const token = authService.getAccessToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_URL}/activities`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(filter),
  });

  if (!response.ok) throw new Error("Failed to fetch activities");
  return response.json();
}

// Get recent activities
export async function getRecentActivities(limit: number = 20): Promise<any[]> {
  const token = authService.getAccessToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_URL}/activities/recent/${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Failed to fetch recent activities");
  return response.json();
}

// Get resource activities
export async function getResourceActivities(
  resourceType: string,
  resourceId: number
): Promise<any[]> {
  const token = authService.getAccessToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(
    `${API_URL}/activities/${resourceType}/${resourceId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) throw new Error("Failed to fetch resource activities");
  return response.json();
}

// Get comments for a resource
export async function getComments(
  resourceType: string,
  resourceId: number
): Promise<any[]> {
  const token = authService.getAccessToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(
    `${API_URL}/comments/${resourceType}/${resourceId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) throw new Error("Failed to fetch comments");
  return response.json();
}

// Add a comment via REST (though SignalR is preferred)
export async function addComment(comment: {
  content: string;
  resourceType: string;
  resourceId: number;
}): Promise<any> {
  const token = authService.getAccessToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_URL}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(comment),
  });

  if (!response.ok) throw new Error("Failed to add comment");
  return response.json();
}

// Update a comment
export async function updateComment(
  commentId: number,
  updates: { content: string }
): Promise<any> {
  const token = authService.getAccessToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_URL}/comments/${commentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) throw new Error("Failed to update comment");
  return response.json();
}

// Delete a comment
export async function deleteComment(commentId: number): Promise<void> {
  const token = authService.getAccessToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_URL}/comments/${commentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Failed to delete comment");
}

// Get online users
export async function getOnlineUsers(): Promise<any> {
  const token = authService.getAccessToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_URL}/online-users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Failed to fetch online users");
  return response.json();
}

// Get collaboration metrics
export async function getCollaborationMetrics(): Promise<any> {
  const token = authService.getAccessToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_URL}/metrics`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Failed to fetch metrics");
  return response.json();
}
