import { axiosInstance } from "../config/axiosConfig";

export const getStoriesForFeed = async () => {
  const response = await axiosInstance.get("/story");
  return response.data;
};

export const createStory = async (formData) => {
  const response = await axiosInstance.post("/story/create", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const viewStory = async (storyId) => {
  const response = await axiosInstance.post(`/story/view/${storyId}`);
  return response.data;
};

export const deleteStoryItem = async (storyId, itemId) => {
  const response = await axiosInstance.delete(
    `/story/${storyId}/item/${itemId}`
  );
  return response.data;
};
