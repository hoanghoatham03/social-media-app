import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    conversations: [],
    messages: [],
  },
  reducers: {
    setConversations: (state, action) => {
      // Ensure conversations is always an array
      state.conversations = Array.isArray(action.payload) ? action.payload : [];
    },
    setMessages: (state, action) => {
      // Ensure messages is always an array
      state.messages = Array.isArray(action.payload) ? action.payload : [];
    },
    addMessage: (state, action) => {
      // Add a single message to the messages array
      if (action.payload) {
        state.messages.push(action.payload);
      }
    },
    clearMessages: (state) => {
      // Reset messages to an empty array
      state.messages = [];
    },
  },
});

export const { setConversations, setMessages, addMessage, clearMessages } =
  chatSlice.actions;
export default chatSlice.reducer;
