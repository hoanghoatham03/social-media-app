import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import messageRoutes from "./routes/message.routes.js";
import storyRoutes from "./routes/story.routes.js";
import { createServer } from "http";
import { app, server } from "./utils/socket.js";

// Config
dotenv.config();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(urlencoded({ extended: true, limit: "50mb" }));
const corsOptions = {
  origin: ["https://social-media-app-fuxy.onrender.com"],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/post", postRoutes);
app.use("/api/v1/comment", commentRoutes);
app.use("/api/v1/message", messageRoutes);
app.use("/api/v1/story", storyRoutes);

// Start server
server.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
