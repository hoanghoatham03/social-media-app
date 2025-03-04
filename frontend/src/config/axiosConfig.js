import axios from "axios";
import { BASE_URL, WHITE_LIST_ROUTES } from "../utils/appConstant";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

const renewAccessToken = async () => {
  try {
    const response = await axiosInstance.get(
      "/user/refresh",
      {},
      { withCredentials: true }
    );
    return response.data.data.accessToken;
  } catch (error) {
    console.error("Failed to renew access token:", error);
    throw error;
  }
};

axiosInstance.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      config.headers.set("Content-Type", "multipart/form-data");
    } else {
      config.headers.set("Content-Type", "application/json");
    }

    const token = localStorage.getItem("accessToken");
    if (token && !WHITE_LIST_ROUTES.includes(config.url)) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers.set("Accept", "application/json");
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    //if status code is 401 or 403, and access token is not expired refresh token

    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      const originalRequest = error.config;

      if (!originalRequest._retry) {
        originalRequest._retry = true;
        try {
          //renew access token
          const newAccessToken = await renewAccessToken();

          //save new access token to localStorage
          localStorage.setItem("accessToken", newAccessToken);

          //update header Authorization with new access token
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

          //send original request again
          return axiosInstance(originalRequest);
        } catch (error) {
          return Promise.reject(error); //if failed to renew token, return error
        }
      }
    }
    //if status code is 405, logout user
    if (error.response && error.response.status === 405) {
      localStorage.removeItem("accessToken");
      localStorage.setItem("isLoggedIn", "false");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
