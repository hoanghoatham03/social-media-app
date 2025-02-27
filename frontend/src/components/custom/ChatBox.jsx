import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Send } from "lucide-react";
import { getAllMessages, sendMessage } from "@/api/message";
import { setMessages, addMessage } from "@/redux/chatSlice";
import {
  setOnlineUsers,
  updateConversationListOnly,
} from "@/redux/conversationSlice";
import { useSocket } from "@/context/SocketProvider";
import { getInitials, formatDate } from "@/utils/utils";

// Helper function to generate a guaranteed unique ID
const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const ChatBox = () => {
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const processedMessageIds = useRef(new Set());
  const dispatch = useDispatch();
  const { socket } = useSocket();
  const { user } = useSelector((state) => state.auth);
  const { selectedConversation, onlineUsers } = useSelector(
    (state) => state.conversation
  );
  const { messages } = useSelector((state) => state.chat);

  const getOtherUser = () => {
    if (!selectedConversation) return null;
    return selectedConversation.members.find(
      (member) => member._id !== user._id
    );
  };

  const otherUser = getOtherUser();

  const fetchMessages = async () => {
    if (!selectedConversation) return;

    try {
      setLoading(true);
      const response = await getAllMessages(selectedConversation._id);
      if (response.success) {
        // Ensure messages is always an array and log the first message to debug
        const messageArray = Array.isArray(response.data) ? response.data : [];
        if (messageArray.length > 0) {
          console.log("First message structure:", messageArray[0]);
        }

        // Reset the processed message IDs when fetching a new conversation
        processedMessageIds.current.clear();

        // Add each message ID to the processed set to avoid duplicates
        messageArray.forEach((msg) => {
          if (msg._id) {
            processedMessageIds.current.add(msg._id);
          }
        });

        dispatch(setMessages(messageArray));
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      // Set empty array on error
      dispatch(setMessages([]));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedConversation) {
      // Reset messages when conversation changes
      dispatch(setMessages([]));
      fetchMessages();
    }
  }, [selectedConversation]);

  useEffect(() => {
    // Listen for online users updates
    if (!socket) return;

    const handleOnlineUsers = (users) => {
      dispatch(setOnlineUsers(users));
    };

    socket.on("getOnlineUsers", handleOnlineUsers);

    return () => {
      socket.off("getOnlineUsers", handleOnlineUsers);
    };
  }, [socket, dispatch]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Helper to add a message if it's not a duplicate
  const addMessageIfNew = (message) => {
    // Ensure the message has an ID
    const messageWithId = message._id
      ? message
      : { ...message, _id: generateUniqueId() };

    // Check if we've already processed this message
    if (processedMessageIds.current.has(messageWithId._id)) {
      console.log("Skipping duplicate message:", messageWithId._id);
      return;
    }

    // Add this message ID to our processed set
    processedMessageIds.current.add(messageWithId._id);

    // Add the message to the Redux store
    dispatch(addMessage(messageWithId));
  };

  useEffect(() => {
    if (!socket || !selectedConversation) return;

    // Listen for incoming messages
    const handleReceiveMessage = (message) => {
      console.log("Received message:", message);
      if (message.conversation === selectedConversation._id) {
        addMessageIfNew(message);
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket, selectedConversation]);

  const handleSendMessage = async (e) => {
    // Ensure we prevent the default form submit behavior
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    // Don't allow sending empty messages or while already sending
    if (!newMessage.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);

      const messageData = {
        conversation: selectedConversation._id,
        content: newMessage.trim(),
        receiver: otherUser._id,
      };

      // Use truly unique ID for optimistic messages
      const optimisticId = generateUniqueId();

      // Optimistic update
      const optimisticMessage = {
        _id: optimisticId,
        sender: {
          _id: user._id,
          username: user.username,
          profilePicture: user.profilePicture,
        },
        content: newMessage.trim(),
        createdAt: new Date().toISOString(),
        conversation: selectedConversation._id,
        temporary: true,
      };

      // Clear input before sending to improve UX
      setNewMessage("");

      // Add optimistic message as a new message
      addMessageIfNew(optimisticMessage);

      // Use a separate worker thread to update the conversation list
      setTimeout(() => {
        // Update the conversation list only without affecting selected conversation
        dispatch(
          updateConversationListOnly({
            conversationId: selectedConversation._id,
            message: {
              content: newMessage.trim(),
              createdAt: new Date().toISOString(),
            },
          })
        );
      }, 0);

      // Send message via API for persistence first
      const response = await sendMessage(messageData);

      if (response.success) {
        // If API call succeeds, add the server-returned message ID to our processed set
        // to prevent duplicates when the socket event is received
        if (response.data && response.data._id) {
          processedMessageIds.current.add(response.data._id);
        }

        // Emit the message via socket ONLY after successful API call
        if (socket) {
          socket.emit("send_message", {
            ...messageData,
            _id: response.data?._id, // Include the server-generated ID if available
          });
        }
      } else {
        // If failed, remove the optimistic message
        const filteredMessages = messages.filter(
          (msg) => msg._id !== optimisticId
        );
        dispatch(setMessages(filteredMessages));
        processedMessageIds.current.delete(optimisticId);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    // Send message on Enter key (without Shift key)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Check if the otherUser is online
  const isOtherUserOnline = otherUser && onlineUsers.includes(otherUser._id);

  if (!selectedConversation) {
    return (
      <div className="flex items-center justify-center h-full">
        Select a conversation
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border rounded-md">
      {/* Chat header */}
      <div className="flex items-center p-4 border-b">
        <Avatar className="h-10 w-10">
          <AvatarImage src={otherUser?.profilePicture?.url} />
          <AvatarFallback>
            {otherUser && getInitials(otherUser.username || "")}
          </AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <p className="font-medium">{otherUser?.username}</p>
          <div className="text-sm flex items-center">
            <span
              className={`h-2 w-2 rounded-full mr-2 ${
                isOtherUserOnline ? "bg-green-500" : "bg-gray-400"
              }`}
            ></span>
            <span
              className={`${
                isOtherUserOnline ? "text-green-600" : "text-gray-500"
              }`}
            >
              {isOtherUserOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* Messages container */}
      <div className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p>Loading messages...</p>
          </div>
        ) : !Array.isArray(messages) || messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isMyMessage = message.sender?._id === user._id;
              // Ensure each message has a unique key, fallback to index if _id is missing
              const messageKey = message._id || `msg-${index}`;

              return (
                <div
                  key={messageKey}
                  className={`flex ${
                    isMyMessage ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isMyMessage && (
                    <Avatar className="h-8 w-8 mr-2 mt-1">
                      <AvatarImage src={message.sender?.profilePicture?.url} />
                      <AvatarFallback>
                        {getInitials(message.sender?.username || "")}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[70%] ${
                      isMyMessage
                        ? "bg-blue-500 text-white rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-lg"
                        : "bg-gray-200 text-gray-800 rounded-tl-sm rounded-tr-lg rounded-br-lg rounded-bl-lg"
                    } p-3 break-words`}
                  >
                    <p>{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isMyMessage ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {formatDate(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button
          type="button"
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || sending}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatBox;
