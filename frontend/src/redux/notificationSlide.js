import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    likeAndCommentNotification: [], // [1,2,3]
    hasUnreadNotifications: false,
  },
  reducers: {
    setLikeNotification: (state, action) => {
      if (action.payload.type === "like") {
        state.likeAndCommentNotification.push(action.payload);
        state.hasUnreadNotifications = true;
      } else if (action.payload.type === "dislike") {
        state.likeAndCommentNotification = state.likeAndCommentNotification.filter(
          (item) => item.userId !== action.payload.userId
        );
      }
    },
    clearNotifications: (state) => {
      state.hasUnreadNotifications = false;
    },
    clearLikeAndCommentNotifications: (state) => {
      state.likeAndCommentNotification = [];
    },
    addNotification: (state, action) => {
      state.likeAndCommentNotification.unshift(action.payload);
      state.hasUnreadNotifications = true;
    },
    removeNotification: (state, action) => {
      state.likeAndCommentNotification = state.likeAndCommentNotification.filter(
        (item) =>
          item.postId !== action.payload.postId ||
          item.userId !== action.payload.userId
      );
    },
  },
});
export const {
  setLikeNotification,
  clearNotifications,
  clearLikeAndCommentNotifications,
  addNotification,
  removeNotification,
} = notificationSlice.actions;
export default notificationSlice.reducer;
