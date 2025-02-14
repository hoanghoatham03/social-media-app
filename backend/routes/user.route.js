import express from "express";
import {
  followUser,
  getSuggestUser,
  getUserProfile,
  login,
  logout,
  register,
  updateUserProfile,
  refreshAccessToken,
} from "../controllers/user.controller.js";
import { getPostOfUser } from "../controllers/post.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

// Auth Routes
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/refresh").post(refreshAccessToken);
router.route("/logout").post(isAuthenticated, logout);

// User Routes
router.route("/:id/profile").get(isAuthenticated, getUserProfile);
router
  .route("/:id/profile/edit")
  .post(isAuthenticated, upload.single("profilePicture"), updateUserProfile);
router.route("/suggest/:id").get(isAuthenticated, getSuggestUser);
router.route("/follow/:id").post(isAuthenticated, followUser);
router.route("/:userId/posts").post(isAuthenticated, getPostOfUser);

export default router;
