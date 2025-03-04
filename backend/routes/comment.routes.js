import express from "express";
import { createComment, getCommentsOfPost, likeComment, createReplyComment, getReplies, likeReplyComment, deleteComment, deleteReplyComment } from "../controllers/comment.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.route("/:postId").post(isAuthenticated, createComment);
router.route("/:postId").get(isAuthenticated, getCommentsOfPost);
router.route("/like/:commentId").post(isAuthenticated, likeComment);
router.route("/reply/:commentId").post(isAuthenticated, createReplyComment);
router.route("/reply/:commentId").get(isAuthenticated, getReplies);
router.route("/like-reply/:replyId").post(isAuthenticated, likeReplyComment);
router.route("/delete-comment/:commentId").delete(isAuthenticated, deleteComment);
router.route("/delete-reply/:replyId").delete(isAuthenticated, deleteReplyComment);

export default router;
