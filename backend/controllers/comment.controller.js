import Comment from "../models/comment.model.js";
import ReplyComment from "../models/replyComment.model.js";
import { createCommentService, 
    getCommentsService, 
    likeCommentService, 
    createReplyCommentService, 
    getRepliesService, 
    likeReplyCommentService, 
    deleteCommentService, 
    deleteReplyCommentService } from "../services/comment.service.js";

//create comment
export const createComment = async (req, res) => {
  const { postId } = req.params;
  const { desc } = req.body;
  const userId = req.userId;

  if ( !desc ) {
    return res.status(400).json({
      message: "Description is required",
      success: false,
    });
  }

  try {
    const comment = await createCommentService(postId, desc, userId);

    res.status(200).json({
      message: "Comment created successfully",
      success: true,
      data: comment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

//get comments of a post
export const getCommentsOfPost = async (req, res) => {
  const { postId } = req.params;
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  
  try {
    const {comments, totalPages, currentPage} = await getCommentsService(postId, page, limit);

    res.status(200).json({
      message: "Comments fetched successfully",
      success: true,    
      data: {
        comments,
        totalPages,
        currentPage,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

//like comment
export const likeComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.userId;

  try {
    const result = await likeCommentService(commentId, userId);

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

//create reply comment
export const createReplyComment = async (req, res) => {
  const { commentId } = req.params;
  const { desc } = req.body;
  const userId = req.userId;

  if ( !desc ) {
    return res.status(400).json({
      message: "Description is required",
      success: false,
    });
  }

  try {
    const result = await createReplyCommentService(commentId, desc, userId);

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

//get replies of a comment
export const getReplies = async (req, res) => {
  const { commentId } = req.params;
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;

  try {
    const {replies, totalPages, currentPage} = await getRepliesService(commentId, page, limit);

    res.status(200).json({
      message: "Replies fetched successfully",
      success: true,
      data: {
        replies,
        totalPages,
        currentPage,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

//like reply comment
export const likeReplyComment = async (req, res) => {
  const { replyId } = req.body;
  const userId = req.userId;

  try {
    const result = await likeReplyCommentService(replyId, userId);

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

//delete comment
export const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.userId;

  try {
    const result = await deleteCommentService(commentId, userId);

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

//delete reply comment
export const deleteReplyComment = async (req, res) => {
  const { replyId } = req.params;
  const userId = req.userId;

  try {
    const result = await deleteReplyCommentService(replyId, userId);

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
