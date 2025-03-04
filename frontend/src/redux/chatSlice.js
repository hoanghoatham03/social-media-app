import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    conversations: [],
    messages: [],
  },
  reducers: {
    setConversations: (state, action) => {
      state.conversations = Array.isArray(action.payload) ? action.payload : [];
    },
    setMessages: (state, action) => {
      state.messages = Array.isArray(action.payload) ? action.payload : [];
    },
    addMessage: (state, action) => {
      if (action.payload) {
        state.messages = [...state.messages, action.payload]; // Avoid using push
      }
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { setConversations, setMessages, addMessage, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;
