import express from "express";
import { getPostsForNewsFeed, createPost } from "../controllers/post.controller.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

router.route("/news-feed").get(getPostsForNewsFeed);
router.route("/").post(upload.single("image"), createPost);

export default router;
