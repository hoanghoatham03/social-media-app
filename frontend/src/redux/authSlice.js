import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  suggestedFollowUsers: [],
  suggestedChatUsers: [],
  userProfile: null,
  selectedUser: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthUser: (state, action) => {
      state.user = action.payload;
    },
    setSuggestedFollowUsers: (state, action) => {
      state.suggestedFollowUsers = action.payload;
    },
    setSuggestedChatUsers: (state, action) => {
      state.suggestedChatUsers = action.payload;
    },
    setUserProfile: (state, action) => {
      state.userProfile = action.payload;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
  },
});

export const {
  setAuthUser,
  setSuggestedFollowUsers,
  setSuggestedChatUsers,
  setUserProfile,
  setSelectedUser,
} = authSlice.actions;

export default authSlice.reducer;
