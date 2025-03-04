import { axiosInstance } from "../config/axiosConfig";

export const register = async (username, email, password) => {
   const response = await axiosInstance.post("/user/register", { username, email, password });
   return response.data;
}

export const login = async (email, password) => {
   const response = await axiosInstance.post("/user/login", { email, password });
   return response.data;
}

export const logout = async () => {
   const response = await axiosInstance.get("/user/logout");
   return response.data;
}


