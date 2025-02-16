import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import { getReceiverSocketId, io } from "../utils/socket.js";

//create conversation
export const createConversationService = async (members) => {
  try {
    const existingConversation = await Conversation.findOne({
      members: { $all: members },
    });
    if (existingConversation) {
      return existingConversation;
    }

    const conversation = await Conversation.create({ members });
    await conversation.save();

    return conversation;
  } catch (error) {
    console.log("error in createConversationService", error);
    throw new Error(error);
  }
};

//get conversation
export const getConversationService = async (conversationId) => {
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    return conversation;
  } catch (error) {
    console.log("error in getConversationService", error);
    throw new Error(error);
  }
};

//get all conversations
export const getAllConversationsService = async (userId) => {
  try {
    const conversations = await Conversation.find({ members: { $in: [userId] } });

    if (!conversations) {
      throw new Error("No conversations found");
    }

    return conversations;
  } catch (error) {
    console.log("error in getAllConversationsService", error);
    throw new Error(error);
  }
};

//send message
export const sendMessageService = async (message, conversationId, senderId) => {
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  if (!conversation.members.includes(senderId)) {
    throw new Error("You are not a member of this conversation");
  }

  try {
    const newMessage = new Message({
      message: message,
      conversationId: conversationId,
      senderId: senderId,
    });

    await newMessage.save();

    for (const member of conversation.members) {
      const receiverSocketId = getReceiverSocketId(member);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }
    }

    conversation.lastMessage = newMessage;
    await conversation.save();

    return newMessage;
  } catch (error) {
    console.log("error in sendMessageService", error);
    throw new Error(error);
  }
};

//get all messages
export const getAllMessagesService = async (conversationId, page, limit) => {
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    const messages = await Message.find({ conversationId: conversationId }).skip((page - 1) * limit).limit(limit);
    const totalMessages = await Message.countDocuments({ conversationId: conversationId });
    const totalPages = Math.ceil(totalMessages / limit);
    return { messages, totalPages };
  } catch (error) {
    console.log("error in getAllMessagesService", error);
    throw new Error(error);
  }
};


