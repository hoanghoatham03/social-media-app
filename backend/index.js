import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import { createServer } from "http";
import { initSocket } from "./utils/socket.js";

// Config
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/post", postRoutes);

const httpServer = createServer(app);
initSocket(httpServer);

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
