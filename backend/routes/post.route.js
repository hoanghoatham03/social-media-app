import express from "express";
import { getPostsForNewsFeed, createPost } from "../controllers/post.controller.js";
import { upload } from "../middlewares/multer.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
const router = express.Router();

router.route("/news-feed").post(isAuthenticated, getPostsForNewsFeed);
router.route("/").post(upload.single("image"),isAuthenticated, createPost);


export default router;
