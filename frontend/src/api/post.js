import { axiosInstance } from "../config/axiosConfig";

export const getPostsForNewsFeed = async (page, limit) => {
  const response = await axiosInstance.post("/post/news-feed", { page, limit });
  return response.data;
};

export const createPost = async (formData) => {
  const response = await axiosInstance.post("/post/create", formData);
  return response.data;
};

export const likePost = async (postId) => {
  const response = await axiosInstance.post("/post/like", { postId });
  return response.data;
};

export const unlikePost = async (postId) => {
  const response = await axiosInstance.post("/post/unlike", { postId });
  return response.data;
};

export const bookmarkPost = async (postId) => {
  const response = await axiosInstance.post("/post/bookmark", { postId });
  return response.data;
};

export const updatePost = async (postId, postData) => {
  try {
    const response = await axiosInstance.put(`/post/${postId}`, postData, {
      headers: {
        "Content-Type":
          postData instanceof FormData
            ? "multipart/form-data"
            : "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deletePost = async (postId) => {
  const response = await axiosInstance.post("/post/delete", { postId });
  return response.data;
};

export const getPostById = async (postId) => {
  const response = await axiosInstance.get(`/post/${postId}`);
  return response.data;
};

export const getPostOfUser = async (userId) => {
  const response = await axiosInstance.get(`/post/user/${userId}`);
  return response.data;
};

export const getPostsForExplore = async (page, limit) => {
  const response = await axiosInstance.post("/post/explore", { page, limit });
  return response.data;
};
