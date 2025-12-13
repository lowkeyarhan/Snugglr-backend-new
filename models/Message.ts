import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    // Which chatroom this message belongs to
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat", // uses the SAME name as your ChatRoom model
      required: true,
    },

    // Who sent the message
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Message content (only for normal messages)
    text: {
      type: String,
      trim: true,
    },

    // Type of message
    // "text"   -> normal user message
    // "system" -> join/leave/reveal messages
    type: {
      type: String,
      enum: ["text", "system"],
      default: "text",
    },

    // List of users who have read this message
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

// Index for fast message loading per chat (latest first)
messageSchema.index({ chatId: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
