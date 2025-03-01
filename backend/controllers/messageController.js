import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { getReceiverSocketId, notifyNewConversation } from "../utils/socket.js";
import { io } from "../utils/socket.js";

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { content, receiverId, conversationId } = req.body;
    const senderId = req.user._id;

    let conversation;
    let isNewConversation = false;

    // If conversationId is not provided, create a new conversation
    if (!conversationId) {
      // Check if a conversation already exists between these users
      conversation = await Conversation.findOne({
        members: { $all: [senderId, receiverId] },
      }).populate({
        path: "members",
        select: "username email profilePicture",
      });

      // If no conversation exists, create a new one
      if (!conversation) {
        conversation = await Conversation.create({
          members: [senderId, receiverId],
        });

        // Populate the members for socket data
        conversation = await Conversation.findById(conversation._id).populate({
          path: "members",
          select: "username email profilePicture",
        });

        isNewConversation = true;
      }
    } else {
      // Find existing conversation by ID
      conversation = await Conversation.findById(conversationId).populate({
        path: "members",
        select: "username email profilePicture",
      });

      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
    }

    // Create a new message
    const newMessage = await Message.create({
      sender: senderId,
      content,
      conversation: conversation._id,
    });

    // Update conversation with last message
    conversation.lastMessage = newMessage._id;
    conversation.lastMessageAt = newMessage.createdAt;
    await conversation.save();

    // Get populated message for response
    const populatedMessage = await Message.findById(newMessage._id).populate({
      path: "sender",
      select: "username email profilePicture",
    });

    // Create complete conversation details for socket
    const conversationDetails = {
      _id: conversation._id,
      members: conversation.members,
      lastMessage: {
        content: populatedMessage.content,
        createdAt: populatedMessage.createdAt,
      },
      lastMessageAt: conversation.lastMessageAt,
      createdAt: conversation.createdAt,
    };

    // Prepare socket data
    const socketData = {
      _id: populatedMessage._id,
      content: populatedMessage.content,
      sender: populatedMessage.sender,
      receiver: receiverId,
      conversation: conversation._id,
      createdAt: populatedMessage.createdAt,
      isNewConversation: isNewConversation,
      isFirstMessage: isNewConversation, // Adding this flag for clarity
      // Always include conversation details with every message
      conversationDetails: conversationDetails,
    };

    // If this is a new conversation, also notify via separate channel
    if (isNewConversation) {
      // Notify both users directly about the new conversation
      notifyNewConversation(senderId, conversationDetails);
      notifyNewConversation(receiverId, {
        ...conversationDetails,
        isIncomingNewConversation: true,
      });
    }

    // Get the socket ID of the receiver
    const receiverSocketId = getReceiverSocketId(receiverId);

    // If the receiver is online, send them the message via socket
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive_message", socketData);
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
