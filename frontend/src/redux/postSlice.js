import { createSlice } from "@reduxjs/toolkit";

const postSlice = createSlice({
  name: "post",
  initialState: {
    posts: [],
    selectedPost: null,
    page: 1,
    hasMore: true,
  },
  reducers: {
    setPosts: (state, action) => {
      if (state.page === 1) {
        state.posts = action.payload;
      } else {
        state.posts = [...state.posts, ...action.payload];
      }
    },
    setSelectedPost: (state, action) => {
      state.selectedPost = action.payload;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setHasMore: (state, action) => {
      state.hasMore = action.payload;
    },
    togglePostLike: (state, action) => {
      const { postId, userId, isLiking } = action.payload;
      const post = state.posts.find((p) => p._id === postId);
      if (post) {
        if (isLiking) {
          if (!post.likes.includes(userId)) {
            post.likes.push(userId);
            post.totalLikes = (post.totalLikes || 0) + 1;
          }
        } else {
          post.likes = post.likes.filter((id) => id !== userId);
          post.totalLikes = Math.max((post.totalLikes || 0) - 1, 0);
        }
      }
    },
  },
});

export const {
  setPosts,
  setSelectedPost,
  setPage,
  setHasMore,
  togglePostLike,
} = postSlice.actions;
export default postSlice.reducer;
