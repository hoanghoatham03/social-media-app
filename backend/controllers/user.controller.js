import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import {
  registerService,
  loginService,
  getUserService,
  updateUserService,
  getSuggestedUsersService,
  followUserService,
  refreshAccessTokenService,
  logoutService,
} from "../services/user.service.js";
import { getPopularPosts } from "./post.controller.js";

// Register a new user
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    //check if all fields are provided
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    //register the user
    const newUser = await registerService(username, email, password);

    return res.status(201).json({
      message: "User created successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

// Login a user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    //login the user
    const { userInfo, accessToken, refreshToken } = await loginService(
      email,
      password
    );

    //set the cookie
    return res
      .status(200)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      })
      .json({
        user: userInfo,
        accessToken: accessToken,
      });
  } catch (error) {
    res.status(500).json(error);
  }
};

//refresh the access token
export const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;
  const accessToken = await refreshAccessTokenService(refreshToken);
  res.status(200).json({ accessToken });
};

//logout the user
export const logout = async (req, res) => {
  try {
    const userId = req.body.userId;
    
    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
        success: false,
      });
    }
    
    await logoutService(userId);
    res.status(200).cookie("refreshToken", "", { maxAge: 0 }).json({
      message: "User logged out",
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

export const getUser = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await getUserService(userId);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const updateUser = async (req, res) => {
  const userId = req.params.id;
  try {
    const updatedUser = await updateUserService(userId, req);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const getSuggestedUsers = async (req, res) => {
  const userId = req.params.id;
  try {
    const suggestedUsers = await getSuggestedUsersService(userId);
    res.status(200).json(suggestedUsers);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const followUser = async (req, res) => {
  const userId = req.params.id;
  const followId = req.body.id;

  try {
    const user = await followUserService(userId, followId);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
};
