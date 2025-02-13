import cloudinary from "../utils/cloudinary.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Comment from "../models/comment.model.js";

//get popular posts
export const getPopularPosts = async (req, res) => {
  try {
    //get 5 posts with the most likes
    const posts = await Post.find().sort({ likes: -1 }).limit(5);
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
