import { createStoryService, getStoriesForFeedService, viewStoryService, deleteStoryItemService } from "../services/story.service.js";  
import  getDataUri from "../utils/datauri.js";


// Get stories for user's feed
export const getStoriesForFeed = async (req, res) => {
  try {
    const userId = req.userId;
    const stories = await getStoriesForFeedService(userId);

    res.status(200).json({
      success: true,
      stories,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to get stories for feed",
    });
  }
};

// Create a new story
export const createStory = async (req, res) => {
  
    try {
      const userId = req.userId;

      const image = req.file;

      // Get data URI
    const fileUri = await getDataUri(image);

      // Check if file exists
      if (!image) {
        return res.status(400).json({
          success: false,
          message: "Story image is required",
        });
      }

      const story = await createStoryService(userId, fileUri);
      res.status(201).json({
        success: true,
        story,
      });
    } catch (err) {
      console.error("Error creating story:", err);
      res.status(500).json({
        success: false,
        message: "Failed to create story",
      });
    }
};

// Mark a story as viewed
export const viewStory = async (req, res, next) => {
  try {
    const viewerId = req.userId;
    const { storyId } = req.params;

    if (!storyId) {
      return next(createError(400, "Story ID is required"));
    }

    const result = await viewStoryService(storyId, viewerId);

    res.status(200).json({
      success: true,
      message: "Story marked as viewed",
    });
  } catch (err) {
    next(err);
  }
};

// Delete story item
export  const deleteStoryItem = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { storyId, itemId } = req.params;

    if (!storyId || !itemId) {
      return next(createError(400, "Story ID and Item ID are required"));
    }

      const updatedStory = await deleteStoryItemService(
      userId,
      storyId,
      itemId
    );

    res.status(200).json({
      success: true,
      message: "Story item deleted successfully",
      story: updatedStory,
    });
  } catch (err) {
    next(err);
  }
};
