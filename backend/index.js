import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoutes from "./routes/user.route.js";

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




// Start server
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
