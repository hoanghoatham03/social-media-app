import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
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
    },
    { timestamps: true }
    );

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;