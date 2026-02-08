import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "match",
        "message",
        "confession",
        "like",
        "comment",
        "admin",
        "system",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    body: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    actionUrl: {
      type: String,
      trim: true,
    },
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    relatedChat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
    },
    relatedPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Confession",
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Notification", notificationSchema);
