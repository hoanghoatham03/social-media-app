import { Server } from "socket.io";
import express from "express";
import http from "http";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FE_URL,
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {}; // this map stores socket id corresponding the user id; userId -> socketId

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

// Helper function to broadcast online users to all clients
const broadcastOnlineUsers = () => {
  io.emit("getOnlineUsers", Object.keys(userSocketMap));
};

// Helper function to notify about new conversation
export const notifyNewConversation = (userId, conversationData) => {
  const socketId = userSocketMap[userId];
  if (socketId) {
    io.to(socketId).emit("new_conversation", conversationData);
  }
};

// Socket connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // Emit online users to all connected clients
  broadcastOnlineUsers();

  // Handle specific request for online users
  socket.on("getOnlineUsers", () => {
    socket.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  // Handle user_connected event
  socket.on("user_connected", (userId) => {
    if (userId) {
      userSocketMap[userId] = socket.id;
      broadcastOnlineUsers();
    }
  });

  // Handle user_disconnected event
  socket.on("user_disconnected", (userId) => {
    if (userId) {
      delete userSocketMap[userId];
      broadcastOnlineUsers();
    }
  });

  // Handle new message event
  socket.on("send_message", (messageData) => {
    const receiverSocketId = userSocketMap[messageData.receiver];


    const isFirstMessage =
      messageData.isFirstMessage || messageData.isNewConversation;


    // Send message to the specific receiver if online
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive_message", messageData);
    }

    // Also send back to the sender to update their UI
    socket.emit("receive_message", messageData);

    // Notify unread message to the receiver
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("notify_unread_message", messageData);
    }

    // If this is a new conversation (indicated by isNewConversation flag)
    if (
      (isFirstMessage || messageData.isNewConversation) &&
      messageData.conversationDetails
    ) {
      // Notify both sender and receiver to add the new conversation
      socket.emit("new_conversation", messageData.conversationDetails);

      if (receiverSocketId) {
        // For the recipient, also include a flag that this is an incoming new conversation
        const dataForReceiver = {
          ...messageData.conversationDetails,
          isIncomingNewConversation: true,
        };
        io.to(receiverSocketId).emit("new_conversation", dataForReceiver);
      }
    }
  });

  // Handle disconnect event
  socket.on("disconnect", () => {
    // Find which userId this socket belongs to
    const userIdToRemove = Object.keys(userSocketMap).find(
      (key) => userSocketMap[key] === socket.id
    );

    if (userIdToRemove) {
      delete userSocketMap[userIdToRemove];
      broadcastOnlineUsers();
    }
  });
});

export { app, server, io };
