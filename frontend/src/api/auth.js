import { axiosInstance } from "../config/axiosConfig";

export const register = async (username, email, password) => {
   const response = await axiosInstance.post("/user/register", { username, email, password });
   return response.data;
}

