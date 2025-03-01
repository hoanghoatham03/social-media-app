import { createSlice } from "@reduxjs/toolkit";

const conversationSlice = createSlice({
  name: "conversation",
  initialState: {
    conversations: [],
    selectedConversation: null,
    isStartChat: false,
    onlineUsers: [],
    type: null,
    hasUnreadMessage: false,
  },
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },
    setSelectedConversation: (state, action) => {
      state.selectedConversation = action.payload;
    },
    setIsStartChat: (state, action) => {
      state.isStartChat = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    setHasUnreadMessage: (state, action) => {
      state.hasUnreadMessage = action.payload;
    },
    // Add a new conversation to the list without fetching all conversations
    addNewConversation: (state, action) => {
      const newConversation = action.payload;

      // Check if the conversation already exists
      const exists = state.conversations.some(
        (conv) => conv._id === newConversation._id
      );

      if (!exists) {
        // Add the new conversation to the beginning of the array (most recent)
        state.conversations = [newConversation, ...state.conversations];
      }
    },
    updateConversation: (state, action) => {
      const updatedConversation = action.payload;

      // Find the conversation index
      const conversationIndex = state.conversations.findIndex(
        (conv) => conv._id === updatedConversation._id
      );

      if (conversationIndex >= 0) {
        // Remove the conversation from its current position
        state.conversations.splice(conversationIndex, 1);

        // Add updated conversation at the beginning (most recent)
        state.conversations.unshift(updatedConversation);

        // Also update the selected conversation if it's the same one
        if (
          state.selectedConversation &&
          state.selectedConversation._id === updatedConversation._id
        ) {
          state.selectedConversation = updatedConversation;
        }
      }
    },
    updateConversationOrder: (state, action) => {
      const { conversationId, message } = action.payload;

      // Find the conversation
      const conversationIndex = state.conversations.findIndex(
        (conv) => conv._id === conversationId
      );

      if (conversationIndex >= 0) {
        // Remove the conversation from its current position
        const conversation = state.conversations[conversationIndex];

        // Update the conversation with the latest message
        if (message) {
          conversation.lastMessage = {
            content: message.content,
            createdAt: message.createdAt,
          };
          conversation.lastMessageAt = message.createdAt;
        }

        // If it's not already at the top, move it there
        if (conversationIndex > 0) {
          state.conversations.splice(conversationIndex, 1);
          state.conversations.unshift(conversation);
        }

        // Also update the selected conversation if it's the same one
        if (
          state.selectedConversation &&
          state.selectedConversation._id === conversationId
        ) {
          state.selectedConversation = {
            ...state.selectedConversation,
            lastMessage: conversation.lastMessage,
          };
        }
      }
    },
    // New reducer that only updates conversation list without touching selectedConversation
    updateConversationListOnly: (state, action) => {
      const { conversationId, message } = action.payload;

      // Find the conversation
      const conversationIndex = state.conversations.findIndex(
        (conv) => conv._id === conversationId
      );

      if (conversationIndex >= 0) {
        // Create a deep copy of the conversation
        const conversation = JSON.parse(
          JSON.stringify(state.conversations[conversationIndex])
        );

        // Check if the incoming message is newer than what we already have
        const messageTime = message?.createdAt
          ? new Date(message.createdAt).getTime()
          : 0;

        const existingLastMessageTime = conversation.lastMessageAt
          ? new Date(conversation.lastMessageAt).getTime()
          : conversation.lastMessage?.createdAt
          ? new Date(conversation.lastMessage.createdAt).getTime()
          : 0;

        // Only update if the new message is newer or there is no existing timestamp
        if (
          !existingLastMessageTime ||
          messageTime >= existingLastMessageTime
        ) {
          // Update the conversation with the latest message
          if (message) {
            conversation.lastMessage = {
              content: message.content,
              createdAt: message.createdAt,
            };
            conversation.lastMessageAt = message.createdAt;
          }

          // Create a new array with all conversations except the updated one
          const updatedConversations = state.conversations.filter(
            (conv) => conv._id !== conversationId
          );

          // Add the updated conversation at the beginning
          updatedConversations.unshift(conversation);

          // Replace the entire conversations array at once
          state.conversations = updatedConversations;
        }
      }
    },
  },
});

export const {
  setConversations,
  setSelectedConversation,
  setIsStartChat,
  setOnlineUsers,
  setHasUnreadMessage,
  updateConversationOrder,
  updateConversation,
  updateConversationListOnly,
  addNewConversation,
} = conversationSlice.actions;

export default conversationSlice.reducer;
