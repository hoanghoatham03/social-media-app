import express from "express";
import {
  followUser,
  getSuggestedUsers,
  getUser,
  login,
  logout,
  register,
  updateUser,
  refreshAccessToken,
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

// Auth Routes
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(logout);
router.route("/refresh").post(refreshAccessToken);

// User Routes
router.route("/:id/profile").get(isAuthenticated, getUser);
router
  .route("/profile/edit")
  .post(isAuthenticated, upload.single("profilePicture"), updateUser);
router.route("/suggested/:id").get(isAuthenticated, getSuggestedUsers);
router.route("follow/:id").post(isAuthenticated, followUser);

export default router;
