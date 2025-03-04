import { axiosInstance } from "../config/axiosConfig";

export const createComment = async (postId, desc) => {
  const res = await axiosInstance.post(`/comment/${postId}`, { desc });
  return res.data;
};

export const getCommentsOfPost = async (postId) => {
  const res = await axiosInstance.get(`/comment/${postId}`);
  return res.data;
};

export const likeComment = async (commentId) => {
  const res = await axiosInstance.post(`/comment/like/${commentId}`);
  return res.data;
};

export const createReplyComment = async (commentId, desc) => {
  const res = await axiosInstance.post(`/comment/reply/${commentId}`, { desc });
  return res.data;
};

export const getReplies = async (commentId) => {
  const res = await axiosInstance.get(`/comment/reply/${commentId}`);
  return res.data;
};

export const likeReplyComment = async (replyId) => {
  const res = await axiosInstance.post(`/comment/like-reply/${replyId}`);
  return res.data;
};

export const deleteComment = async (commentId) => {
  const res = await axiosInstance.delete(`/comment/delete-comment/${commentId}`);
  return res.data;
};

export const deleteReplyComment = async (replyId) => {
  const res = await axiosInstance.delete(`/comment/delete-reply/${replyId}`);
  return res.data;
};








