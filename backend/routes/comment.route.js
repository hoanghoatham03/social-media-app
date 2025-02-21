import express from "express";
import { createComment, getCommentsOfPost, likeComment, createReplyComment, getReplies, likeReplyComment, deleteComment, deleteReplyComment } from "../controllers/comment.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.route("/:postId").post(isAuthenticated, createComment);
router.route("/:postId").get(isAuthenticated, getCommentsOfPost);
router.route("/like").post(isAuthenticated, likeComment);
router.route("/reply").post(isAuthenticated, createReplyComment);
router.route("/replies/:commentId").get(isAuthenticated, getReplies);
router.route("/like-reply").post(isAuthenticated, likeReplyComment);
router.route("/delete-comment/:commentId").delete(isAuthenticated, deleteComment);
router.route("/delete-reply/:replyId").delete(isAuthenticated, deleteReplyComment);

export default router;
