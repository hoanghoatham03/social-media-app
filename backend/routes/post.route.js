import express from "express";
import {
  getPostsForNewsFeed,
  createPost,
  getPostById,
  getPostOfUser,
  likePost,
  unlikePost,
  updatePost,
  deletePost,
  bookmarkPost,
} from "../controllers/post.controller.js";
import { upload } from "../middlewares/multer.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
const router = express.Router();

router.route("/news-feed").post(isAuthenticated, getPostsForNewsFeed);
router.route("/:postId").get(isAuthenticated, getPostById);
router.route("/user/:userId").get(isAuthenticated, getPostOfUser);
router.route("/").post(upload.single("image"), isAuthenticated, createPost);
router
  .route("/update")
  .post(upload.single("image"), isAuthenticated, updatePost);
router.route("/delete").post(isAuthenticated, deletePost);
router.route("/like").post(isAuthenticated, likePost);
router.route("/unlike").post(isAuthenticated, unlikePost);
router.route("/bookmark").post(isAuthenticated, bookmarkPost);

export default router;
