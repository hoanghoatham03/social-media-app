import { createSlice } from "@reduxjs/toolkit";

const exploreSlice = createSlice({
  name: "explore",
  initialState: {
    posts: [],
    hasMore: true,
    page: 1,
  },
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload;
    },
    setHasMore: (state, action) => {
      state.hasMore = action.payload;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
  },
});

export const { setPosts, setHasMore, setPage } = exploreSlice.actions;
export default exploreSlice.reducer;
