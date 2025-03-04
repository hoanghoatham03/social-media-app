import Story from "../models/story.model.js";
import User from "../models/user.model.js";
import cloudinary from "../utils/cloudinary.js";

// Get stories for user's feed (followed users + user's own)
export const getStoriesForFeedService = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Get stories from followed users and self
    const stories = await Story.find({
      userId: { $in: [...user.following, userId] },
      "items.0": { $exists: true },
    })
      .populate("userId", "username profilePicture")
      .populate({
        path: "viewers.userId",
        select: "username profilePicture",
        model: "User",
      })
      .sort({ "items.createdAt": -1 })


    // Add viewed flag
    const storiesWithViewedStatus = stories.map((story) => {
      const viewed = story.viewers.some(
        (viewer) =>
          viewer.userId && viewer.userId._id.toString() === userId.toString()
      );

      return {
        _id: story._id,
        userId: story.userId,
        items: story.items,
        viewers: story.viewers,
        viewed,
      };
    });

    return storiesWithViewedStatus;
  } catch (error) {
    console.error("Error in getStoriesForFeed:", error);
    throw error;
  }
};

// Create a new story
export const createStoryService = async (userId, fileUri) => {
  try {
    // Check if user already has a story
    let story = await Story.findOne({ userId });

    //upload to cloudinary
    const result = await cloudinary.uploader.upload(fileUri, {
      resource_type: "auto",
    });

    const newItem = {
      url: result.url,
      type: "image",
    };

    if (!story) {
      // Create a new story if it doesn't exist
      story = new Story({
        userId,
        items: [newItem],
      });
    } else {
      // Add new item to existing story
      story.items.push(newItem);
    }

    await story.save();
    return story;
  } catch (error) {
    throw error;
  }
};

// View a story
export const viewStoryService = async (storyId, viewerId) => {
  try {
    const story = await Story.findById(storyId);
    if (!story) {
      throw new Error("Story not found");
    }

    // Check if already viewed
    const alreadyViewed = story.viewers.some(
      (viewer) => viewer.userId.toString() === viewerId.toString()
    );

    const user = await User.findById(viewerId);

    if (!alreadyViewed) {
      // Add viewer
      story.viewers.push({
        userId: viewerId,
        profilePicture: user.profilePicture.url,
        viewedAt: new Date(),
      });

      await story.save();
    }

    return { success: true };
  } catch (error) {
    throw error;
  }
};

// Delete a story item
export const deleteStoryItemService = async (userId, storyId, itemId) => {
  try {
    const story = await Story.findById(storyId);

    if (!story) {
      throw new Error("Story not found");
    }

    // Verify ownership
    if (story.userId.toString() !== userId.toString()) {
      throw new Error("Not authorized to delete this story");
    }

    // Find and remove the story item
    const itemIndex = story.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    //remove the story item from the viewers
    story.viewers = story.viewers.filter(
      (viewer) => viewer.userId.toString() !== userId.toString()
    );

    //if the story has no items, delete the story
    if (story.items.length === 0) {
      await Story.findByIdAndDelete(storyId);
    }

    if (itemIndex === -1) {
      throw new Error("Story item not found");
    }

    story.items.splice(itemIndex, 1);
    await story.save();

    return story;
  } catch (error) {
    throw error;
  }
};
