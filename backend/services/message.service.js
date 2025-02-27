import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import User from "../models/user.model.js";
import { getReceiverSocketId, io } from "../utils/socket.js";

// Check conversation and create if not exists
export const CheckandCreateConversationService = async ({
  receiverId,
  senderId,
}) => {
  try {
    const members = [senderId, receiverId];

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      members: { $all: members },
    }).populate({
      path: "members",
      select: "username profilePicture isOnline",
    });

    if (existingConversation) {
      return existingConversation;
    }

    // Create new conversation if it doesn't exist
    const newConversation = await Conversation.create({
      members,
      lastMessageAt: new Date(),
    });

    // Populate the members information
    const populatedConversation = await Conversation.findById(
      newConversation._id
    ).populate({
      path: "members",
      select: "username profilePicture isOnline",
    });

    return populatedConversation;
  } catch (error) {
    console.log("error in CheckandCreateConversationService", error);
    throw new Error(error.message);
  }
};

// Get conversation by ID
export const getConversationService = async (conversationId) => {
  try {
    const conversation = await Conversation.findById(conversationId)
      .populate({
        path: "members",
        select: "username profilePicture isOnline",
      })
      .populate("lastMessage");

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    return conversation;
  } catch (error) {
    console.log("error in getConversationService", error);
    throw new Error(error.message);
  }
};

// Get all conversations for a user
export const getAllConversationsService = async (userId) => {
  try {
    const conversations = await Conversation.find({
      members: { $in: [userId] },
    })
      .populate({
        path: "members",
        select: "username profilePicture isOnline",
      })
      .populate("lastMessage")
      .sort({ lastMessageAt: -1 }); // Sort by newest messages first

    return conversations || [];
  } catch (error) {
    console.log("error in getAllConversationsService", error);
    throw new Error(error.message);
  }
};

// Send message
export const sendMessageService = async ({
  content,
  conversation,
  sender,
  receiver,
}) => {
  try {
    // Create and save new message
    const newMessage = new Message({
      content,
      conversation,
      sender,
      receiver,
      readBy: [sender],
    });

    await newMessage.save();

    // Populate sender information
    const populatedMessage = await Message.findById(newMessage._id).populate({
      path: "sender",
      select: "username profilePicture",
    });

    // Update conversation with last message and timestamp
    await Conversation.findByIdAndUpdate(
      conversation,
      {
        lastMessage: newMessage._id,
        lastMessageAt: new Date(),
      },
      { new: true }
    );

    // Get receiver socket ID and emit message event if online
    const receiverSocketId = getReceiverSocketId(receiver);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive_message", populatedMessage);
    }

    return populatedMessage;
  } catch (error) {
    console.log("error in sendMessageService", error);
    throw new Error(error.message);
  }
};

// Get all messages for a conversation
export const getAllMessagesService = async (
  conversationId,
  page = 1,
  limit = 20
) => {
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Find messages with populated user info, sorted by creation time
    const messages = await Message.find({ conversation: conversationId })
      .populate({
        path: "sender",
        select: "username profilePicture",
      })
      .sort({ createdAt: -1 }) // Newest first
      .skip((page - 1) * limit)
      .limit(limit);

    // Get total count for pagination
    const totalMessages = await Message.countDocuments({
      conversation: conversationId,
    });
    const totalPages = Math.ceil(totalMessages / limit);

    // Return messages in chronological order (oldest first) for display
    // Ensure we always return an array even if no messages are found
    return {
      messages: Array.isArray(messages) ? messages.reverse() : [],
      totalPages,
    };
  } catch (error) {
    console.log("error in getAllMessagesService", error);
    throw new Error(error.message);
  }
};
