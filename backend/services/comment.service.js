import Comment from "../models/comment.model.js";
import ReplyComment from "../models/replyComment.model.js";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import { getReceiverSocketId, io } from "../utils/socket.js";

//create comment
export const createCommentService = async (postId, desc, userId) => {
    try {
        const post = await Post.findById(postId);

        if (!post) {
            throw new Error("Post not found");
        }

        //create comment
        const comment = await Comment.create({
            postId,
            desc,
            userId,
        });

        //update post comments
        await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } });
        await Post.findByIdAndUpdate(postId, { $inc: { totalComments: 1 } });

        //populate comment
        comment.populate("userId", "_id username profilePicture");

        //get author of the post
        const authorId = post.userId;
        const receiverSocketId = getReceiverSocketId(authorId);

        //send notification to user
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("getNotification", {
                user: userId,
                userInfo: {
                    username: user.username,
                    profilePicture: user.profilePicture,
                },
                type: "comment",
                postId: postId,
                commentId: comment._id,
                message: `${user.username} commented on your post`,
            });
        }
        return comment;
    } catch (error) {
        console.log("Error in createCommentService", error);
        throw new Error(error);
    }
};

//delete comment
export const deleteCommentService = async (commentId, userId) => {
    try {
        const comment = await Comment.findById(commentId);

        if (!comment) {
            throw new Error("Comment not found");
        }
        
        if (comment.userId.toString() !== userId) {
            throw new Error("You are not authorized to delete this comment");
        }

        //delete comment
        await Comment.findByIdAndDelete(commentId);

        //delete replies
        await ReplyComment.deleteMany({ commentId });

        //update post comments
        await Post.findByIdAndUpdate(comment.postId, { $pull: { comments: commentId } });
        await Post.findByIdAndUpdate(comment.postId, { $inc: { totalComments: -1 } });


        return "Comment deleted successfully";
    } catch (error) {
        console.log("Error in deleteCommentService", error);
        throw new Error(error);
    }
};

//get comments of a post
export const getCommentsService = async (postId, page, limit) => {
    try {
        const post = await Post.findById(postId);

        if (!post) {
            throw new Error("Post not found");
        }

        const skip = (page - 1) * limit;

        //get comments
        const comments = await Comment.find({ postId })
        .populate("userId", "_id username profilePicture")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        //get total comments
        const totalComments = post.totalComments;

        //get total pages
        const totalPages = Math.ceil(totalComments / limit);
    
        return {
            comments,
            totalPages,
            currentPage: parseInt(page),
        };
    } catch (error) {
        console.log("Error in getCommentsService", error);
        throw new Error(error);
    }
};

//like comment
export const likeCommentService = async (commentId, userId) => {
    try {
        const comment = await Comment.findById(commentId);

        if (!comment) {
            throw new Error("Comment not found");
        }

        const user = await User.findById(userId);

        //check if user already liked the comment
        const isLiked = comment.likes.includes(userId);
        
        if (isLiked) {
            await comment.updateOne({ $pull: { likes: userId } });
            await comment.updateOne({ $inc: { totalLikes: -1 } });

            return "Comment unliked successfully";
        }

        //get author of the comment
        const authorId = comment.userId;
        const receiverSocketId = getReceiverSocketId(authorId);

        //send notification to user
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("getNotification", {
                user: user._id,
                userInfo: {
                    username: user.username,
                    profilePicture: user.profilePicture,
                },
                type: "like",
                postId: comment.postId,
                commentId: comment._id,
                message: `${user.username} liked your comment`,
            });
        }

        //update comment likes
        await comment.updateOne({ $addToSet: { likes: userId } });
        await comment.updateOne({ $inc: { totalLikes: 1 } });

        return "Comment liked successfully";
        
    } catch (error) {
        console.log("Error in likeCommentService", error);
        throw new Error(error);
    }
};

//create reply comment
export const createReplyCommentService = async (commentId, desc, userId) => {
    try {
        const comment = await Comment.findById(commentId);

        if (!comment) {
            throw new Error("Comment not found");
        }

        //create reply comment
        const replyComment = await ReplyComment.create({
            commentId,
            desc,
            userId,
        });

        //populate reply comment
        replyComment.populate("userId", "_id username profilePicture");

        //get receiver socket id
        const authorId = comment.userId;
        const receiverSocketId = getReceiverSocketId(authorId);

        //send notification to user
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("getNotification", {
                user: userId,
                userInfo: {
                    username: user.username,
                    profilePicture: user.profilePicture,
                },
                type: "reply",
                postId: comment.postId,
                commentId: comment._id,
                replyCommentId: replyComment._id,
                message: `${user.username} replied to your comment`,
            });
        }

        //update comment replies
        await comment.updateOne({ $push: { replies: replyComment._id } });
        await comment.updateOne({ $inc: { totalReplies: 1 } });

        return "Reply comment created successfully";
    } catch (error) {
        console.log("Error in createReplyCommentService", error);
        throw new Error(error);
    }
};

//delete reply comment
export const deleteReplyCommentService = async (replyId, userId) => {
    try {
        const replyComment = await ReplyComment.findById(replyId);

        if (!replyComment) {
            throw new Error("Reply comment not found");
        }
        
        if (replyComment.userId.toString() !== userId) {
            throw new Error("You are not authorized to delete this reply comment");
        }

        //delete reply comment
        await ReplyComment.findByIdAndDelete(replyId);

        //update comment replies
        await Comment.findByIdAndUpdate(replyComment.commentId, { $pull: { replies: replyId } });
        await Comment.findByIdAndUpdate(replyComment.commentId, { $inc: { totalReplies: -1 } });

        return "Reply comment deleted successfully";
    } catch (error) {
        console.log("Error in deleteReplyCommentService", error);
        throw new Error(error);
    }
};

//get replies of a comment
export const getRepliesService = async (commentId, page, limit) => {
    try {
        const comment = await Comment.findById(commentId);

        if (!comment) {
            throw new Error("Comment not found");
        }
        
        //get replies
        const replies = await ReplyComment.find({ commentId })
        .populate("userId", "_id username profilePicture")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        //get total replies
        const totalReplies = comment.totalReplies;

        //get total pages
        const totalPages = Math.ceil(totalReplies / limit);

        return {
            replies,
            totalPages,
            currentPage: parseInt(page),
        };
    } catch (error) {
        console.log("Error in getRepliesService", error);
        throw new Error(error);
    }
};

//like reply comment
export const likeReplyCommentService = async (replyId, userId) => {
    try {
        const replyComment = await ReplyComment.findById(replyId);

        if (!replyComment) {
            throw new Error("Reply comment not found");
        }

        const user = await User.findById(userId);

        //check if user already liked the reply comment
        const isLiked = replyComment.likes.includes(userId);
        
        if (isLiked) {
            await replyComment.updateOne({ $pull: { likes: userId } });
            await replyComment.updateOne({ $inc: { totalLikes: -1 } });

            return "Reply comment unliked successfully";
        }


        //get receiver socket id
        const authorId = replyComment.userId;
        const receiverSocketId = getReceiverSocketId(authorId);

        //send notification to user
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("getNotification", {
                user: userId,
                userInfo: {
                    username: user.username,
                    profilePicture: user.profilePicture,
                },
                type: "like",
                postId: replyComment.postId,
                commentId: replyComment.commentId,
                replyCommentId: replyComment._id,
                message: `${user.username} liked your reply comment`,
            });
        }

        //update reply comment likes
        await replyComment.updateOne({ $addToSet: { likes: userId } });
        await replyComment.updateOne({ $inc: { totalLikes: 1 } });

        return "Reply comment liked successfully";
    } catch (error) {
        console.log("Error in likeReplyCommentService", error);
        throw new Error(error);
    }
};