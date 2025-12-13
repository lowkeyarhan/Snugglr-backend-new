import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
      index: true,
    },

    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    type: {
      type: String,
      enum: ["personal", "group"],
      required: true,
    },

    groupName: {
      type: String,
      trim: true,
    },

    revealed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ensure consistent ordering for 1–1 chats
chatSchema.pre("save", function () {
  if (this.type === "personal" && this.users.length === 2) {
    this.users.sort((a, b) => a.toString().localeCompare(b.toString()));
  }
});

// prevent duplicate personal chats
chatSchema.index(
  { users: 1, institute: 1 },
  {
    unique: true,
    partialFilterExpression: { type: "personal" },
  }
);

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
