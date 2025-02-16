import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import { sendMessageService, createConversationService, getConversationService, getAllConversationsService, getAllMessagesService } from "../services/message.service.js";

//create conversation if conversation is exists then return the conversation
export const createConversation = async (req, res) => {
    const { members } = req.body;

    try {
        const conversation = await createConversationService(members);
        res.status(200).json({
            success: true,
            data: conversation,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}


//get conversation
export const getConversation = async (req, res) => {
    const { conversationId } = req.params;
    try {
        const conversation = await getConversationService(conversationId);
        res.status(200).json({
            success: true,
            data: conversation,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

//get all conversations
export const getAllConversations = async (req, res) => {
    const userId = req.userId;
    try {
        const conversations = await getAllConversationsService(userId);
        res.status(200).json({
            success: true,
            data: conversations,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}


//send message
export const sendMessage = async (req, res) => {
    const { message, conversationId } = req.body;
    const senderId = req.userId;
    try {
    const message = await sendMessageService(message, conversationId, senderId);

    res.status(200).json({
        success: true,
        data: message,
    });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

//get all messages with pagination
export const getAllMessages = async (req, res) => {
    const { conversationId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    try {
        const { messages, totalPages } = await getAllMessagesService(conversationId, page, limit);
        res.status(200).json({
            success: true,
            data: messages,
            totalPages,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}
