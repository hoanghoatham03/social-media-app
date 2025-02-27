import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import {
  registerService,
  loginService,
  getUserService,
  updateUserService,
  getSuggestFollowUserService,
  followUserService,
  refreshAccessTokenService,
  logoutService,
  getSuggestChatUserService,
} from "../services/user.service.js";

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
        message: "User logged in successfully",
        success: true,
        data: {
          user: userInfo,
          accessToken: accessToken,
        },
      });
  } catch (error) {
    res.status(500).json(error);
  }
};

//refresh the access token
export const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({
      message: "Unauthorized",
      success: false,
    });
  }
  const accessToken = await refreshAccessTokenService(refreshToken);
  res.status(200).json({
    message: "Access token refreshed successfully",
    success: true,
    data: {
      accessToken,
    },
  });
};

//logout the user
export const logout = async (req, res) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
        success: false,
      });
    }
    
    await logoutService(userId);
    res.status(200).cookie("refreshToken", "", { maxAge: 0 }).json({
      message: "User logged out successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

//get the user
export const getUserProfile = async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({
      message: "User ID is required",
      success: false,
    });
  }

   try {
    const user = await getUserService(userId);
    res.status(200).json({
      message: "User profile fetched successfully",
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(500).json(error);
  }
  
};

//update the user profile
export const updateUserProfile = async (req, res) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(400).json({
      message: "User ID is required",
      success: false,
    });
  }

  try {
    const updatedUser = await updateUserService(userId, req);
    res.status(200).json({
      message: "User updated successfully",
      success: true,
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

//get suggest follow user
export const getSuggestFollowUser = async (req, res) => {
  const userId = req.userId;

  try {
    const suggestedFollowUsers = await getSuggestFollowUserService(userId);
    res.status(200).json({
      message: "Suggested users fetched successfully",
      success: true,
      data: {
        suggestedFollowUsers,
      },
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

//follow a user
export const followUser = async (req, res) => {
  const userId = req.userId;
  const followId = req.params.followId;

  try {
    const result = await followUserService(userId, followId);
    res.status(200).json({
      message: result,
      success: true,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

//get suggest chat user
export const getSuggestChatUser = async (req, res) => {
  const userId = req.userId;

  try {
    const suggestedChatUsers = await getSuggestChatUserService(userId);
    res.status(200).json({
      message: "Suggested users fetched successfully",
      success: true,
      data: {
        suggestedChatUsers,
      },
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

