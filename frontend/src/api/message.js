import axiosInstance from "../config/axiosConfig";

export const CheckandCreateConversation = async (data) => {
  const response = await axiosInstance.post("/message", data);
  return response.data;
};

export const getConversation = async (conversationId) => {
  const response = await axiosInstance.get(`/message/conversation/${conversationId}`);
  return response.data;
};

export const getAllConversations = async () => {
  const response = await axiosInstance.get("/message/conversation");
  return response.data;
};

export const getAllMessages = async (conversationId, page = 1, limit = 20) => {
  const response = await axiosInstance.get(
    `/message/conversation/${conversationId}/messages?page=${page}&limit=${limit}`
  );
  return response.data;
};

export const sendMessage = async (messageData) => {
  const response = await axiosInstance.post("/message/message/create", messageData);
  return response.data;
};








