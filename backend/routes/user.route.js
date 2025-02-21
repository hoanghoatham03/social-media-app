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
router.route("/refresh").get(refreshAccessToken);
router.route("/logout").get(isAuthenticated, logout);

// User Routes
router.route("/:id/profile").get(isAuthenticated, getUserProfile);
router
  .route("/profile/edit")
  .post(isAuthenticated, upload.single("profilePicture"), updateUserProfile);
router.route("/suggest").get(isAuthenticated, getSuggestUser);
router.route("/follow/:followId").post(isAuthenticated, followUser);


export default router;
