import { axiosInstance } from "../config/axiosConfig";

export const getSuggestUser = async () => {
  try {
    const response = await axiosInstance.get("/user/suggest");
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
