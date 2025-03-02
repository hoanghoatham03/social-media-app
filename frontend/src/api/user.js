import { axiosInstance } from "../config/axiosConfig";

export const getSuggestFollowUser = async () => {
  try {
    const response = await axiosInstance.get("/user/suggest/follow");
    console.log("response", response);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getSuggestChatUser = async () => {
  try {
    const response = await axiosInstance.get("/user/suggest/chat");
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getUserProfile = async (userId) => {
  try {
    const response = await axiosInstance.get(`/user/${userId}/profile`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const updateUserProfile = async (formData) => {
  try {
    const response = await axiosInstance.post("/user/profile/edit", formData);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const followUser = async (followId) => {
  try {
    const response = await axiosInstance.post(`/user/follow/${followId}`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const searchUser = async (username) => {
  try {
    const response = await axiosInstance.get(
      `/user/search?username=${username}`
    );
    return response.data;
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
};
