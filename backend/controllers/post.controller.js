import cloudinary from "../utils/cloudinary.js";
import Post from "../models/post.model.js";
import {
  getPostsForNewsFeedService,
  createPostService,
  getPostOfUserService,
  getPostByIdService,
  likePostService,
  unlikePostService,
  updatePostService,
  deletePostService,
  bookmarkPostService,
  getPostsForExploreService,
} from "../services/post.service.js";
import getDataUri from "../utils/datauri.js";

//get posts for explore
export const getPostsForExplore = async (req, res) => {
  const userId = req.userId;
  const page = req.body.page || 1;
  const limit = req.body.limit || 5;

  if (!userId) {
    return res.status(400).json({
      message: "User ID is required",
      success: false,
    });
  }

  try {
    const { posts, hasMore } = await getPostsForExploreService(userId, page, limit);

    res.status(200).json({
      message: "Posts for explore fetched successfully",
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

//get posts for news feed
export const getPostsForNewsFeed = async (req, res) => {
  const userId = req.userId;
  const page = req.body.page || 1;
  const limit = req.body.limit || 5;

  if (!userId) {
    return res.status(400).json({
      message: "User ID is required",
      success: false,
    });
  }

  try {
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
    const userId = req.userId;
    const { desc } = req.body;
    const image = req.file;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
        success: false,
      });
    }

    if (!image) {
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

//update post
export const updatePost = async (req, res) => {
  const userId = req.userId;
  const { postId } = req.params;
  const { desc } = req.body;
  const image = req.file;

  //check if don't have any info to update
  if (!desc && !image) {
    return res.status(400).json({
      message: "No info to update",
      success: false,
    });
  }

  if (!postId || !userId) {
    return res.status(400).json({
      message: "Post ID and User ID are required",
      success: false,
    });
  }

  //if image is provided, get data uri
  let fileUri;
  if (image) {
    fileUri = await getDataUri(image);
  }

  try {
    const postUpdated = await updatePostService(postId, userId, desc, fileUri);

    res.status(200).json({
      message: "Post updated successfully",
      success: true,
      data: postUpdated,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

//delete post
export const deletePost = async (req, res) => {
  const userId = req.userId;
  const { postId } = req.body;
  
  if (!postId || !userId) {
    return res.status(400).json({
      message: "Post ID and User ID are required",
      success: false,
    });
  }

  try {
    const result = await deletePostService(postId, userId);

    res.status(200).json({
      message: result,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

//get post of a user
export const getPostOfUser = async (req, res) => {
  const userId = req.userId;
  const page = req.body.page || 1;
  const limit = req.body.limit || 5;

  if (!userId) {
    return res.status(400).json({
      message: "User ID is required",
      success: false,
    });
  }

  try {
    const posts = await getPostOfUserService(userId, page, limit);

    res.status(200).json({
      message: "Posts of user fetched successfully",
      success: true,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

//get post by id
export const getPostById = async (req, res) => {
  const { postId } = req.params;

  if (!postId) {
    return res.status(400).json({
      message: "Post ID is required",
      success: false,
    });
  }

  try {
    const post = await getPostByIdService(postId);

    res.status(200).json({
      message: "Post fetched successfully",
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

//like post
export const likePost = async (req, res) => {
  const userId = req.userId;
  const { postId } = req.body;

  if (!postId || !userId) {
    return res.status(400).json({
      message: "Post ID and User ID are required",
      success: false,
    });
  }

  try {
    const result = await likePostService(postId, userId);

    res.status(200).json({
      message: result,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

//unlike post
export const unlikePost = async (req, res) => {
  const userId = req.userId;
  const { postId } = req.body;

  if (!postId || !userId) {
    return res.status(400).json({
      message: "Post ID and User ID are required",
      success: false,
    });
  }

  try {
    const result = await unlikePostService(postId, userId);

    res.status(200).json({
      message: result,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

//bookmark post
export const bookmarkPost = async (req, res) => {
  const userId = req.userId;
  const { postId } = req.body;
  
  if (!postId || !userId) {
    return res.status(400).json({
      message: "Post ID and User ID are required",
      success: false,
    });
  }

  try {
    const result = await bookmarkPostService(postId, userId);

    res.status(200).json({
      message: result,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};


