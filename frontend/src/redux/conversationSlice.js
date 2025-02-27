import { createSlice } from "@reduxjs/toolkit";

const conversationSlice = createSlice({
  name: "conversation",
  initialState: {
    conversations: [],
    selectedConversation: null,
    isStartChat: false,
    onlineUsers: [],
    type: null,
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
        // Create a copy of the conversation
        const conversation = { ...state.conversations[conversationIndex] };

        // Update the conversation with the latest message
        if (message) {
          conversation.lastMessage = {
            content: message.content,
            createdAt: message.createdAt,
          };
          conversation.lastMessageAt = message.createdAt;
        }

        // Update conversations array
        const newConversations = [...state.conversations];

        // Remove from current position
        newConversations.splice(conversationIndex, 1);

        // Add to beginning
        newConversations.unshift(conversation);

        // Replace entire array at once to avoid multiple renders
        state.conversations = newConversations;
      }
    },
  },
});

export const {
  setConversations,
  setSelectedConversation,
  setIsStartChat,
  setOnlineUsers,
  updateConversationOrder,
  updateConversation,
  updateConversationListOnly,
} = conversationSlice.actions;

export default conversationSlice.reducer;
