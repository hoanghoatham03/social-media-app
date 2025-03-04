import express from "express";
const router = express.Router();
import { getStoriesForFeed, createStory, viewStory, deleteStoryItem } from "../controllers/story.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { upload } from "../middlewares/multer.js";

// All routes require authentication
router.use(isAuthenticated);


router.get("/", getStoriesForFeed);


router.post("/create", upload.single("image"), createStory);


router.post("/view/:storyId", viewStory);


router.delete("/:storyId/item/:itemId", deleteStoryItem);

export default router;
