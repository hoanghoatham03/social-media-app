import { createContext, useContext, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { setHasUnreadMessage, setOnlineUsers } from "@/redux/conversationSlice";
import { addNotification } from "@/redux/notificationSlide";
import { toast } from "sonner";

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) return;

    // Connect to the Socket.IO server
    const socketInstance = io(import.meta.env.VITE_REACT_APP_BE_URL, {
      query: { userId: user._id },
      // Prevent socket from disconnecting when navigating between pages
      forceNew: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      transports: ["websocket"],
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);

      // Explicitly emit the user_connected event when socket connects
      socketInstance.emit("user_connected", user._id);
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    // Listen for online users updates
    socketInstance.on("getOnlineUsers", (onlineUserIds) => {
      console.log("Online users updated:", onlineUserIds);
      // Update Redux with online users
      dispatch(setOnlineUsers(onlineUserIds));
    });

    // Add event listener for page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && socketInstance) {
        // When the page becomes visible again, ensure we're marked as connected
        socketInstance.emit("user_connected", user._id);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Add event listener for page before unload
    const handleBeforeUnload = () => {
      // Only emit disconnect when actually closing the page/app
      socketInstance.emit("user_disconnected", user._id);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Listen for unread message notifications
    socketInstance.on("notify_unread_message", (messageData) => {
      console.log("Unread message notification received", messageData);
      // Set unread message flag in Redux store
      dispatch(setHasUnreadMessage(true));
    });

    // Listen for new like notifications
    socketInstance.on("newNotification", (notification) => {
      console.log("New notification received:", notification);

      if (notification.type === "like") {
        // Add to Redux store
        dispatch(addNotification(notification));

        // Show toast notification
        toast(
          <div className="flex items-center gap-2">
            <img
              src={notification.userInfo?.profilePicture?.url || "https://res.cloudinary.com/dkqxladop/image/upload/v1740154423/rd3twsr2e5oaafwtmgzv.png"}
              alt="User avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
            <span>
              <span className="font-bold">
                {notification.userInfo?.username}
              </span>{" "}
              liked your post
            </span>
          </div>
        );
      }
    });

    // Request online users immediately after connection
    socketInstance.on("connect", () => {
      socketInstance.emit("getOnlineUsers");
    });

    setSocket(socketInstance);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      socketInstance.disconnect();
      setSocket(null);
    };
  }, [user, dispatch]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
