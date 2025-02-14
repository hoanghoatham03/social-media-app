import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Comment from "../models/comment.model.js";
import cloudinary from "../utils/cloudinary.js";

//get posts for news feed
export const getPostsForNewsFeedService = async (
  userId,
  page = 1,
  limit = 5
) => {
  try {
    const skip = (page - 1) * limit;
    const user = await User.findById(userId).select("following");
    const followingUsers = user?.following || [];

    let posts = [];
    let hasMore = true;

    // Get posts of following users
    if (followingUsers.length > 0) {
      posts = await Post.find({ author: { $in: followingUsers } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "_id username profilePicture")
        .populate({
          path: "comments",
          populate: {
            path: "userId",
            select: "_id username profilePicture",
          },
        });
    }

    // If no following users or no posts, get other posts
    if (!posts || posts.length === 0) {
      posts = await Post.find({
        author: { $nin: [...followingUsers, userId] },
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "_id username profilePicture")
        .populate({
          path: "comments",
          populate: {
            path: "userId",
            select: "_id username profilePicture",
          },
        });
    }

    hasMore = posts.length === limit;
    return { posts, hasMore };
  } catch (error) {
    console.error("Get posts error:", error);
    throw new Error(error.message);
  }
};

//create post
export const createPostService = async (userId, desc, fileUri) => {
  try {
    //upload image to cloudinary
    const cloudResponse = await cloudinary.uploader.upload(fileUri, {
      resource_type: "auto",
    });

    //create post
    const post = await Post.create({
      author: userId,
      desc,
      image: {
        public_id: cloudResponse.public_id,
        url: cloudResponse.url,
      },
    });

    //update user posts
    await User.findByIdAndUpdate(userId, { $push: { posts: post._id } });

    //save author info in post
    post.populate("author", "_id username profilePicture");

    return post;
  } catch (error) {
    throw new Error(error.message);
  }
};

//get post of a user
export const getPostOfUserService = async (userId, page, limit) => {
  try {
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "_id username profilePicture");

    return posts;
  } catch (error) {
    throw new Error(error.message);
  }
};
