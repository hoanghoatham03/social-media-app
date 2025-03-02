import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    likeNotification: [], // [1,2,3]
    hasUnreadNotifications: false,
  },
  reducers: {
    setLikeNotification: (state, action) => {
      if (action.payload.type === "like") {
        state.likeNotification.push(action.payload);
        state.hasUnreadNotifications = true;
      } else if (action.payload.type === "dislike") {
        state.likeNotification = state.likeNotification.filter(
          (item) => item.userId !== action.payload.userId
        );
      }
    },
    clearNotifications: (state) => {
      state.hasUnreadNotifications = false;
    },
    clearLikeNotifications: (state) => {
      state.likeNotification = [];
    },
    addNotification: (state, action) => {
      state.likeNotification.push(action.payload);
      state.hasUnreadNotifications = true;
    },
    removeNotification: (state, action) => {
      state.likeNotification = state.likeNotification.filter(
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
  clearLikeNotifications,
  addNotification,
  removeNotification,
} = notificationSlice.actions;
export default notificationSlice.reducer;
