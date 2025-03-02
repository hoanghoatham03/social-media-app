import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Comment from "../models/comment.model.js";
import cloudinary from "../utils/cloudinary.js";
import { getReceiverSocketId, io } from "../utils/socket.js";

//get posts for explore
export const getPostsForExploreService = async (userId, page, limit) => {
  try {
    const skip = (page - 1) * limit;
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "_id username profilePicture");

    const hasMore = posts.length === limit;
    return { posts, hasMore };
  } catch (error) {
    throw new Error(error.message);
  }
};
//get posts of following users
export const getPostsOfFollowingUsersService = async (
  userId,
  page,
  limit,
  followingUsers
) => {
  try {
    let hasMoreFollowingPosts = true;

    const skip = (page - 1) * limit;
    const posts = await Post.find({ author: { $in: followingUsers } })
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

    const countFollowingPosts = await Post.countDocuments({
      author: { $in: followingUsers },
    });

    const countFollowingPostsPages = Math.floor(countFollowingPosts / limit);

    if (posts.length < limit) {
      hasMoreFollowingPosts = false;
    }

    return { posts, hasMoreFollowingPosts, countFollowingPostsPages };
  } catch (error) {
    throw new Error(error.message);
  }
};

//get other posts
export const getOtherPostsService = async (
  userId,
  page,
  limit,
  followingUsers
) => {
  try {
    const skip = (page - 1) * limit;
    let hasMoreOtherPosts = true;
    const posts = await Post.find({ author: { $nin: followingUsers } })
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

    if (posts.length < limit) {
      hasMoreOtherPosts = false;
    }

    return { posts, hasMoreOtherPosts };
  } catch (error) {
    throw new Error(error.message);
  }
};

//get posts for news feed
export const getPostsForNewsFeedService = async (
  userId,
  page = 1,
  limit = 5
) => {
  try {
    const user = await User.findById(userId).select("following");
    const followingUsers = user?.following || [];

    let posts = [];
    let hasMore = true;
    let countFollowingPostsPages = 0;

    // Get posts of following users first
    if (followingUsers.length > 0) {
      const result = await getPostsOfFollowingUsersService(
        userId,
        page,
        limit,
        followingUsers
      );
      posts = [...posts, ...result.posts];
      hasMore = result.hasMoreFollowingPosts;
      countFollowingPostsPages = result.countFollowingPostsPages;
    }

    // Get posts of other users if no following posts or reached end
    if (posts.length === 0 || !hasMore) {
      const result = await getOtherPostsService(
        userId,
        page - countFollowingPostsPages,
        limit,
        followingUsers
      );
      posts = [...posts, ...result.posts];
      hasMore = result.hasMoreOtherPosts;
    }

    return { posts, hasMore };
  } catch (error) {
    console.error("Get posts for news feed error:", error);
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
    await post.populate({
      path: "author",
      select: "_id username profilePicture",
    });

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
    await post.updateOne({ $inc: { totalLikes: 1 } });

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

    await post.updateOne({ $pull: { likes: userId } });
    await post.updateOne({ $inc: { totalLikes: -1 } });

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
