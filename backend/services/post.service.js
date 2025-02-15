import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Comment from "../models/comment.model.js";
import cloudinary from "../utils/cloudinary.js";
import { getReceiverSocketId } from "../utils/socket.js";

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

//update post
export const updatePostService = async (postId, userId, desc, fileUri) => {
  try {
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    if (post.author.toString() !== userId) {
      throw new Error("You are not authorized to update this post");
    }

    if (desc) {
      post.desc = desc;
    }

    if (fileUri) {
      const cloudResponse = await cloudinary.uploader.upload(fileUri, {
        resource_type: "auto",
      });
      
      post.image = {
        public_id: cloudResponse.public_id,
        url: cloudResponse.url,
      };  
    }

    await post.save();
    return post;
  } catch (error) {
    throw new Error(error.message);
  }
};

//delete post
export const deletePostService = async (postId, userId) => {
  try {
    const post = await Post.findById(postId);

    if (!post) {
      throw new Error("Post not found");
    }

    if (post.author.toString() !== userId) {
      throw new Error("You are not authorized to delete this post");
    }

    //delete post
    await Post.findByIdAndDelete(postId);

    //delete comments
    await Comment.deleteMany({ postId });

    //delete post from user's posts
    await User.findByIdAndUpdate(userId, { $pull: { posts: postId } });

    return "Post deleted successfully";
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

//get post by id
export const getPostByIdService = async (postId) => {
  try {
    const post = await Post.findById(postId);

    if (!post) {
      throw new Error("Post not found");
    }

    return post;
  } catch (error) {
    throw new Error(error.message);
  }
};

//like post
export const likePostService = async (postId, userId) => {
  try {
    const post = await Post.findById(postId);
    const postAuthorId = post.author.toString();
    if (!post) {
      throw new Error("Post not found");
    }

    //like post
    await post.updateOne({ $addToSet: { likes: userId } });

    //real time notification
    const user = await User.findById(userId).select("username profilePicture");
    const receiverSocketId = getReceiverSocketId(postAuthorId);

    if (postAuthorId !== userId) {
      const notification = {
        type: "like",
        user: userId,
        userInfo: {
          username: user.username,
          profilePicture: user.profilePicture,
        },
        postId,
        message: `${user.username} liked your post`,
      };
      io.to(receiverSocketId).emit("newNotification", notification);
    }

    return "Post liked successfully";
  } catch (error) {
    throw new Error(error.message);
  }
};

//unlike post
export const unlikePostService = async (postId, userId) => {
  try {
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } });
    return "Post unliked successfully";
  } catch (error) {
    throw new Error(error.message);
  }
};

//bookmark post
export const bookmarkPostService = async (postId, userId) => {
  try {
    const post = await Post.findById(postId);

    if (!post) {
      throw new Error("Post not found");
    }

    const user = await User.findById(userId);

    //check if user already bookmarked the post
    const isBookmarked = user.bookmarks.includes(postId);

    if (isBookmarked) {
      await User.findByIdAndUpdate(userId, { $pull: { bookmarks: postId } });
      return "Post unbookmarked successfully";
    }

    await User.findByIdAndUpdate(userId, { $addToSet: { bookmarks: postId } });
    return "Post bookmarked successfully";
  } catch (error) {
    throw new Error(error.message);
  }
};
