import { axiosInstance } from "../config/axiosConfig";

export const getPostsForNewsFeed = async (page, limit) => {
    const response = await axiosInstance.post("/post/news-feed", {page, limit});
    return response.data;
}

export const createPost = async (formData) => {
    const response = await axiosInstance.post("/post/create", formData);
    return response.data;
}

export const likePost = async (postId) => {
    const response = await axiosInstance.post("/post/like", {postId});
    return response.data;
}

export const unlikePost = async (postId) => {
    const response = await axiosInstance.post("/post/unlike", {postId});
    return response.data;
}

export const bookmarkPost = async (postId) => {
    const response = await axiosInstance.post("/post/bookmark", {postId});
    return response.data;
}

export const updatePost = async (postId, formData) => {
    const response = await axiosInstance.post("/post/update", {postId, formData});
    return response.data;
}

export const deletePost = async (postId) => {
    const response = await axiosInstance.post("/post/delete", {postId});
    return response.data;
}

export const getPostById = async (postId) => {
    const response = await axiosInstance.get(`/post/${postId}`);
    return response.data;
}

export const getPostOfUser = async (userId) => {
    const response = await axiosInstance.get(`/post/user/${userId}`);
    return response.data;
}












