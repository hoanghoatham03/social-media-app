import {axiosInstance} from "../config/axiosConfig";

// Check if conversation exists between users, if not create one
export const CheckandCreateConversation = async (data) => {
  try {
    const response = await axiosInstance.post("/message", data);
    return response.data;
  } catch (error) {
    console.error("Error checking/creating conversation:", error);
    throw error;
  }
};

// Get a specific conversation by ID
export const getConversation = async (conversationId) => {
  try {
    const response = await axiosInstance.get(
      `/message/conversation/${conversationId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting conversation:", error);
    throw error;
  }
};

// Get all conversations for the current user
export const getAllConversations = async () => {
  try {
    const response = await axiosInstance.get("/message/conversation");
    return response.data;
  } catch (error) {
    console.error("Error getting all conversations:", error);
    throw error;
  }
};

// Get messages for a specific conversation with pagination
export const getAllMessages = async (conversationId, page = 1, limit = 20) => {
  try {
    const response = await axiosInstance.get(
      `/message/conversation/${conversationId}/messages?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting messages:", error);
    throw error;
  }
};

// Send a new message
export const sendMessage = async (messageData) => {
  try {
    const response = await axiosInstance.post(
      "/message/message/create",
      messageData
    );
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};
