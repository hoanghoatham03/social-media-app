import { useEffect, useState, useMemo, useRef, useCallback } from "react";
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
  addNewConversation,
} from "@/redux/conversationSlice";
import { CheckandCreateConversation } from "@/api/message";
import { useSocket } from "@/context/SocketProvider";
import { getInitials } from "@/utils/utils";

// Create a debounce function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

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
  const conversationRefreshTimerRef = useRef(null);
  const processedConversationIds = useRef(new Set()); // Track processed conversation IDs
  const initialLoadComplete = useRef(false);
  const lastMessageTimestamps = useRef({}); // Track last message timestamps per conversation

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await getAllConversations();
      if (response.success) {
        // Store the last message timestamp for each conversation
        if (Array.isArray(response.data)) {
          response.data.forEach((conv) => {
            if (conv._id) {
              const timestamp = conv.lastMessageAt
                ? new Date(conv.lastMessageAt).getTime()
                : conv.lastMessage?.createdAt
                ? new Date(conv.lastMessage.createdAt).getTime()
                : 0;

              lastMessageTimestamps.current[conv._id] = timestamp;
            }
          });
        }

        dispatch(setConversations(response.data));
        // Mark all fetched conversation IDs as processed
        response.data.forEach((conv) => {
          if (conv._id) processedConversationIds.current.add(conv._id);
        });
        initialLoadComplete.current = true;
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

  // Memoized function to check if we already have a conversation
  const hasConversation = useCallback(
    (conversationId) => {
      return conversations.some((conv) => conv._id === conversationId);
    },
    [conversations]
  );

  // Create new conversation object from minimal data if needed
  const createConversationFromMessage = useCallback(
    (message) => {
      // If we have required data to build a minimal conversation object
      if (message && message.conversation && message.sender) {
        const otherUser = message.sender;
        const conversationId = message.conversation;

        return {
          _id: conversationId,
          members: [otherUser, user],
          lastMessage: {
            content: message.content,
            createdAt: message.createdAt,
          },
          lastMessageAt: message.createdAt,
          createdAt: message.createdAt || new Date(),
        };
      }
      return null;
    },
    [user]
  );

  // Memoized function to add a new conversation efficiently
  const addConversationToStore = useCallback(
    (conversation) => {
      if (!conversation || !conversation._id) {
        console.warn("Attempted to add invalid conversation:", conversation);
        return false;
      }

      // Check if we've already processed this conversation ID
      if (processedConversationIds.current.has(conversation._id)) {
        return false;
      }

      // Check if the conversation already exists in our store
      if (!hasConversation(conversation._id)) {
        // Add to our processed set
        processedConversationIds.current.add(conversation._id);
        // Add to Redux store
        dispatch(addNewConversation(conversation));
        return true;
      }

      return false;
    },
    [dispatch, hasConversation]
  );

  useEffect(() => {
    fetchConversations();
    fetchSuggestedUsers();
  }, []);

  useEffect(() => {
    if (!socket || !initialLoadComplete.current) return;

    // Create a debounced update function
    const debouncedUpdateConversation = debounce((conversationId, message) => {
      dispatch(
        updateConversationListOnly({
          conversationId,
          message,
        })
      );
    }, 300); // 300ms debounce time

    // Handle real-time message updates without affecting ChatBox
    const handleReceiveMessage = (message) => {
      console.log("Receive message:", message);

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

      if (conversationId) {
        // Check if this conversation exists in our current list
        const existingConversation = hasConversation(conversationId);

        if (existingConversation) {
          // Get the message timestamp
          const messageTime = new Date(message.createdAt).getTime();

          // Check if this message is newer than the last one we processed for this conversation
          const lastTimestamp =
            lastMessageTimestamps.current[conversationId] || 0;

          // Only update if this message is newer
          if (messageTime >= lastTimestamp) {
            // Update our timestamp record
            lastMessageTimestamps.current[conversationId] = messageTime;

            // Use debounced update to prevent rapid re-renders
            debouncedUpdateConversation(conversationId, {
              content: message.content,
              createdAt: message.createdAt,
            });
          }
        } else if (message.conversationDetails) {
          // If we have explicit conversation details, use them
          console.log(
            "Adding new conversation from explicit details:",
            message.conversationDetails
          );

          // Store timestamp for this new conversation
          if (message.createdAt && message.conversationDetails._id) {
            lastMessageTimestamps.current[message.conversationDetails._id] =
              new Date(message.createdAt).getTime();
          }

          const added = addConversationToStore(message.conversationDetails);

          // If we successfully added a new conversation, update suggested users
          if (added) {
            fetchSuggestedUsers();
          }
        } else {
          // If we don't have conversation details but can build minimal conversation info
          console.log("Attempting to create conversation from message data");

          const minimalConversation = createConversationFromMessage(message);

          if (minimalConversation) {
            // Store timestamp for this new conversation
            if (message.createdAt && minimalConversation._id) {
              lastMessageTimestamps.current[minimalConversation._id] = new Date(
                message.createdAt
              ).getTime();
            }

            const added = addConversationToStore(minimalConversation);
            if (added) {
              fetchSuggestedUsers();
            }
          } else {
            // As a last resort, only increment suggested users refresh counter
            // without fetching all conversations
            fetchSuggestedUsers();
          }
        }
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    // Listen for online users updates
    const handleOnlineUsers = (users) => {
      dispatch(setOnlineUsers(users));
    };

    socket.on("getOnlineUsers", handleOnlineUsers);

    // Listen for new conversation events
    socket.on("new_conversation", (conversation) => {
      console.log("New conversation received:", conversation);

      if (conversation && conversation._id) {
        // Add the conversation directly to Redux
        const added = addConversationToStore(conversation);

        // If this is an incoming new conversation, may need extra handling
        if (conversation.isIncomingNewConversation) {
          console.log("Received incoming new conversation", conversation);
        }

        // If we successfully added a new conversation, update suggested users
        if (added) {
          fetchSuggestedUsers();
        }
      }
    });

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("getOnlineUsers", handleOnlineUsers);
      socket.off("new_conversation");

      // Clear any pending timers on unmount
      if (conversationRefreshTimerRef.current) {
        clearTimeout(conversationRefreshTimerRef.current);
      }
    };
  }, [
    socket,
    dispatch,
    addConversationToStore,
    hasConversation,
    createConversationFromMessage,
    user,
  ]);

  const handleUserClick = async (userId) => {
    try {
      const response = await CheckandCreateConversation({ receiverId: userId });
      if (response.success) {
        // Store the timestamp for this conversation
        if (response.data && response.data._id) {
          const timestamp = response.data.lastMessageAt
            ? new Date(response.data.lastMessageAt).getTime()
            : response.data.lastMessage?.createdAt
            ? new Date(response.data.lastMessage.createdAt).getTime()
            : response.data.createdAt
            ? new Date(response.data.createdAt).getTime()
            : Date.now();

          lastMessageTimestamps.current[response.data._id] = timestamp;
        }

        // Add the new conversation to Redux directly instead of fetching all
        addConversationToStore(response.data);
        // Set this as the selected conversation
        dispatch(setSelectedConversation(response.data));
        // Update suggested users list
        fetchSuggestedUsers();
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
      // For sorting, prefer the lastMessageAt property if available
      const timeA = a.lastMessageAt
        ? new Date(a.lastMessageAt).getTime()
        : a.lastMessage?.createdAt
        ? new Date(a.lastMessage.createdAt).getTime()
        : new Date(a.createdAt || 0).getTime();

      const timeB = b.lastMessageAt
        ? new Date(b.lastMessageAt).getTime()
        : b.lastMessage?.createdAt
        ? new Date(b.lastMessage.createdAt).getTime()
        : new Date(b.createdAt || 0).getTime();

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
