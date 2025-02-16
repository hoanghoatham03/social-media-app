import express from "express";
import {
  createConversation,
  getConversation,
  getAllConversations,
  getAllMessages,
  sendMessage,
} from "../controllers/message.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.route("/").post(isAuthenticated, createConversation);
router.route("/:conversationId").get(isAuthenticated, getConversation);
router.route("/").get(isAuthenticated, getAllConversations);
router.route("/:conversationId").get(isAuthenticated, getAllMessages);
router.route("/:conversationId").post(isAuthenticated, sendMessage);

export default router;
