import cloudinary from "../utils/cloudinary.js";
import Post from "../models/post.model.js";
import {
  getPostsForNewsFeedService,
  createPostService,
} from "../services/post.service.js";
import getDataUri from "../utils/datauri.js";

//get posts for news feed
export const getPostsForNewsFeed = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      message: "User ID is required",
      success: false,
    });
  }

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const { posts, hasMore } = await getPostsForNewsFeedService(
      userId,
      page,
      limit
    );

    res.status(200).json({
      message: "Posts of following users fetched successfully",
      success: true,
      data: posts,
      hasMore,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

//create post
export const createPost = async (req, res) => {
  try {
    const { userId, desc } = req.body;
    const image = req.file;

    if (!userId || !image) {
      return res.status(400).json({
        message: "Image is required",
        success: false,
      });
    }

    // Get data URI
    const fileUri = await getDataUri(image);

    // Create post
    const post = await createPostService(userId, desc, fileUri);

    res.status(201).json({
      message: "Post created successfully",
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({
      message: error.message || "Internal server error",
      success: false,
    });
  }
};
