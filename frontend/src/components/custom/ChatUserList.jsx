import { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getAllConversations } from "@/api/message";
import { getSuggestChatUser } from "@/api/user";
import {
  setConversations,
  setSelectedConversation,
  setIsStartChat,
  setOnlineUsers,
  updateConversationListOnly,
} from "@/redux/conversationSlice";
import { CheckandCreateConversation } from "@/api/message";
import { useSocket } from "@/context/SocketProvider";
import { getInitials } from "@/utils/utils";

const ChatUserList = () => {
  const dispatch = useDispatch();
  const { conversations, onlineUsers } = useSelector(
    (state) => state.conversation
  );
  const { user } = useSelector((state) => state.auth);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const processedMessageIds = useRef(new Set());

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await getAllConversations();
      if (response.success) {
        dispatch(setConversations(response.data));
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedUsers = async () => {
    try {
      const response = await getSuggestChatUser();
      if (response.success) {
        setSuggestedUsers(response.data.suggestedChatUsers);
      }
    } catch (error) {
      console.error("Error fetching suggested users:", error);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchSuggestedUsers();
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Handle real-time message updates without affecting ChatBox
    const handleReceiveMessage = (message) => {
      // Prevent processing the same message multiple times
      if (message._id && processedMessageIds.current.has(message._id)) {
        return;
      }

      // Add message ID to processed set
      if (message._id) {
        processedMessageIds.current.add(message._id);
      }

      // Find the conversation that this message belongs to
      const conversationId = message.conversation;

      // Use the new reducer that only updates the conversation list without touching selectedConversation
      if (conversationId) {
        // Use setTimeout to defer the update and prevent blocking the UI
        setTimeout(() => {
          dispatch(
            updateConversationListOnly({
              conversationId,
              message: {
                content: message.content,
                createdAt: message.createdAt,
              },
            })
          );
        }, 0);
      } else {
        // If this is a new conversation, fetch all conversations
        // This should be rare since new conversations are usually created explicitly
        fetchConversations();
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    // Listen for online users updates
    const handleOnlineUsers = (users) => {
      dispatch(setOnlineUsers(users));
    };

    socket.on("getOnlineUsers", handleOnlineUsers);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("getOnlineUsers", handleOnlineUsers);
    };
  }, [socket, dispatch]);

  const handleUserClick = async (userId) => {
    try {
      const response = await CheckandCreateConversation({ receiverId: userId });
      if (response.success) {
        dispatch(setSelectedConversation(response.data));
        // Refresh conversations list to ensure latest order
        fetchConversations();
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const handleConversationClick = (conversation) => {
    dispatch(setSelectedConversation(conversation));
    dispatch(setIsStartChat(true));
  };

  const getOtherUser = (conversation) => {
    return conversation.members.find((member) => member._id !== user._id);
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  // Memoize sorted conversations to prevent unnecessary re-renders
  const sortedConversations = useMemo(() => {
    if (!Array.isArray(conversations)) return [];

    return [...conversations].sort((a, b) => {
      const timeA = a.lastMessage?.createdAt
        ? new Date(a.lastMessage.createdAt).getTime()
        : 0;
      const timeB = b.lastMessage?.createdAt
        ? new Date(b.lastMessage.createdAt).getTime()
        : 0;
      return timeB - timeA;
    });
  }, [conversations]);

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto">
      {/* Conversations Section */}
      <div className="mb-4">
        <div className="p-4 border-b">
          <h3 className="font-medium text-lg">Conversations</h3>
        </div>

        {sortedConversations.length > 0 ? (
          <div className="space-y-1">
            {sortedConversations.map((conversation) => {
              const otherUser = getOtherUser(conversation);
              const isOnline = isUserOnline(otherUser?._id);
              return (
                <div
                  key={conversation._id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => handleConversationClick(conversation)}
                >
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={otherUser?.profilePicture?.url} />
                      <AvatarFallback>
                        {otherUser && getInitials(otherUser.username || "")}
                      </AvatarFallback>
                    </Avatar>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">{otherUser?.username}</p>
                      <span
                        className={`text-xs ${
                          isOnline ? "text-green-600" : "text-gray-400"
                        }`}
                      >
                        {isOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage
                        ? conversation.lastMessage.content
                        : "Start a conversation"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-3 text-gray-500 text-sm">
            No conversations yet. Start chatting with someone below!
          </div>
        )}
      </div>

      {/* Suggested Users Section */}
      <div>
        <div className="p-4 border-b border-t">
          <h3 className="font-medium text-lg">Suggested Users</h3>
        </div>
        {Array.isArray(suggestedUsers) && suggestedUsers.length > 0 ? (
          <div className="space-y-1">
            {suggestedUsers.map((suggestedUser) => {
              const isOnline = isUserOnline(suggestedUser._id);
              return (
                <div
                  key={suggestedUser._id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => handleUserClick(suggestedUser._id)}
                >
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={suggestedUser?.profilePicture?.url} />
                      <AvatarFallback>
                        {getInitials(suggestedUser.username || "")}
                      </AvatarFallback>
                    </Avatar>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">{suggestedUser.username}</p>
                      <span
                        className={`text-xs ${
                          isOnline ? "text-green-600" : "text-gray-400"
                        }`}
                      >
                        {isOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Start a conversation
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-3 text-gray-500 text-sm">
            No suggested users available at the moment.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatUserList;
