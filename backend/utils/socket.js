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

// Socket connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // Emit online users to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle user_connected event
  socket.on("user_connected", (userId) => {
    userSocketMap[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  // Handle user_disconnected event
  socket.on("user_disconnected", (userId) => {
    if (userId) {
      delete userSocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  // Handle new message event
  socket.on("send_message", (messageData) => {
    const receiverSocketId = userSocketMap[messageData.receiver];

    // Send message to the specific receiver if online
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive_message", messageData);
    }

    // Also send back to the sender to update their UI
    socket.emit("receive_message", messageData);
  });

  // Handle disconnect event
  socket.on("disconnect", () => {
    if (userId) {
      delete userSocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, server, io };
