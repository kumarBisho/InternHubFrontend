import React, { useEffect, useState, useRef } from "react";
import NotificationCenter from "./NotificationCenter";
import ErrorBoundary from "./ErrorBoundary";
import notificationService from "../services/notificationService";

const NotificationBell: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const notificationMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    const initialize = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("NotificationBell: No token found");
          if (isMounted) setIsLoading(false);
          return;
        }

        console.log("NotificationBell: Initializing with token");
        
        try {
          // Initialize SignalR connection
          await notificationService.initializeConnection(token);
          
          if (isMounted) {
            setIsConnected(notificationService.isHubConnected());
            console.log("NotificationBell: Connected to SignalR");
          }

          // Subscribe to real-time notifications
          try {
            unsubscribe = notificationService.subscribeToNotifications((notification) => {
              console.log("NotificationBell: Received notification", notification);
              if (isMounted && !notification.isRead) {
                setUnreadCount((prev) => prev + 1);
              }
            });
          } catch (subError) {
            console.warn("NotificationBell: Subscription error", subError);
          }
        } catch (connError) {
          console.warn("NotificationBell: SignalR connection error", connError);
        }

        if (isMounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("NotificationBell: Initialization error", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initialize();

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

  // Close notification menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Close notification menu if click is outside
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleBellClick = () => {
    console.log("NotificationBell: Bell clicked, toggling open state");
    setIsOpen(!isOpen);
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }} className="rounded-lg hover:bg-gray-100" ref={notificationMenuRef}>
      {/* Bell Button */}
      <button
        onClick={handleBellClick}
        style={{
          cursor: "pointer",
          padding: "8px",
          background: "none",
          border: "none",
          fontSize: "20px",
          position: "relative",
          transition: "opacity 0.2s",
          opacity: isLoading ? 0.5 : 1,
        }}
        title={isConnected ? "Notifications" : "Notifications (Connecting...)"}
        disabled={isLoading}
      >
        🔔
        
        {/* Connection Status Indicator */}
        <span
          style={{
            position: "absolute",
            bottom: "2px",
            right: "2px",
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: isConnected ? "#22c55e" : "#ef4444",
            display: "inline-block",
          }}
          title={isConnected ? "Connected" : "Disconnected"}
        />

        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              backgroundColor: "#ef4444",
              color: "white",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "bold",
              border: "2px solid white",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Center Dropdown */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            right: "0",
            top: "48px",
            width: "400px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            border: "1px solid #e2e8f0",
            zIndex: 999,
            maxHeight: "500px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <ErrorBoundary
            fallback={
              <div style={{ padding: "16px", textAlign: "center", color: "#ef4444" }}>
                <p>Failed to load notifications</p>
              </div>
            }
          >
            <NotificationCenter 
              isOpen={isOpen} 
              onClose={() => {
                setIsOpen(false);
              }}
              onMarkRead={() => {
                setUnreadCount(prev => Math.max(0, prev - 1));
              }}
            />
          </ErrorBoundary>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
