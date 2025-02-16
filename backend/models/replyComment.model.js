import mongoose from "mongoose";


//reply comment schema
const replyCommentSchema = new mongoose.Schema({
  commentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  desc: {
    type: String,
    max: 500,
  },
  likes: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
  },
  totalLikes: {
    type: Number,
    default: 0,
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
  },
});

const ReplyComment = mongoose.model("ReplyComment", replyCommentSchema);

export default ReplyComment;

