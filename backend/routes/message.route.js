import express from "express";
import {
  CheckandCreateConversation,
  getConversation,
  getAllConversations,
  getAllMessages,
  sendMessage,
} from "../controllers/message.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.route("/").post(isAuthenticated, CheckandCreateConversation);
router.route("/conversation/:conversationId").get(isAuthenticated, getConversation);
router.route("/conversation").get(isAuthenticated, getAllConversations);
router.route("/conversation/:conversationId/messages").get(isAuthenticated, getAllMessages);
router.route("/message/create").post(isAuthenticated, sendMessage);

export default router;
