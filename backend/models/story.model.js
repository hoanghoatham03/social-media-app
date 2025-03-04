import mongoose from "mongoose";

const storyItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["image", "video"],
    default: "image",
  },
  url: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // Auto-delete after 24 hours (in seconds)
  },
});

const storySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [storyItemSchema],
    viewers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

storySchema.index({ userId: 1, "items.createdAt": -1 });

storySchema.pre("save", function (next) {
  if (this.items.length === 0) {
    this.deleteOne();
  }
  next();
});

export default mongoose.model("Story", storySchema);
