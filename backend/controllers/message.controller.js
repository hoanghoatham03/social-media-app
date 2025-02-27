import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import {
  sendMessageService,
  CheckandCreateConversationService,
  getConversationService,
  getAllConversationsService,
  getAllMessagesService,
} from "../services/message.service.js";

// Check if conversation exists, if not create a new one
export const CheckandCreateConversation = async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.userId;

  if (!receiverId) {
    return res.status(400).json({
      success: false,
      message: "Receiver ID is required",
    });
  }

  try {
    const conversation = await CheckandCreateConversationService({
      receiverId,
      senderId,
    });

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error("Error in CheckandCreateConversation:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a specific conversation by ID
export const getConversation = async (req, res) => {
  const { conversationId } = req.params;

  if (!conversationId) {
    return res.status(400).json({
      success: false,
      message: "Conversation ID is required",
    });
  }

  try {
    const conversation = await getConversationService(conversationId);

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error("Error in getConversation:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all conversations for the current user
export const getAllConversations = async (req, res) => {
  const userId = req.userId;

  try {
    const conversations = await getAllConversationsService(userId);

    res.status(200).json({
      success: true,
      data: conversations || [],
    });
  } catch (error) {
    console.error("Error in getAllConversations:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Send a new message
export const sendMessage = async (req, res) => {
  const { content, conversation, receiver } = req.body;
  const sender = req.userId;

  if (!content || !conversation || !receiver) {
    return res.status(400).json({
      success: false,
      message: "Content, conversation ID, and receiver ID are required",
    });
  }

  try {
    const message = await sendMessageService({
      content,
      conversation,
      sender,
      receiver,
    });

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all messages for a specific conversation with pagination
export const getAllMessages = async (req, res) => {
  const { conversationId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  if (!conversationId) {
    return res.status(400).json({
      success: false,
      message: "Conversation ID is required",
    });
  }

  try {
    const { messages, totalPages } = await getAllMessagesService(
      conversationId,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: messages || [],
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error in getAllMessages:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
