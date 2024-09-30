import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import {
  registerService,
  loginService,
  getUserService,
  updateUserService,
  getSuggestedUsersService,
  followUserService,
} from "../services/user.service.js";

export const register = async (req, res) => {
  try {
    const user = req.body;
    const savedUser = await registerService(user);
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const login = async (req, res) => {
  try {
    const user = req.body;
    const { accessToken, ...userInfo } = await loginService(user);
    return res
    .status(200)
    .cookie("token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1 * 24 * 60 * 60 * 1000,
    })
    .json(userInfo);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const logout = async (req, res) => {
  try {
    res.status(200).cookie("token", "", { maxAge: 0 }).json({
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
