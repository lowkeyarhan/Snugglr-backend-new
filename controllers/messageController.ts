import Message from "../models/Message";
import Chat from "../models/ChatRoom";
import User from "../models/User";

// get messages for a chatroom
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const currentUserId = req.user._id;

    // pagination parameters (from query)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // calculate skip value for pagination
    const skip = (page - 1) * limit;

    // check if chatroom exists
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // check if user is a participant
    const isParticipant = chat.users.some(
      (id) => id.toString() === currentUserId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant of this chat",
      });
    }

    // fetch paginated messages
    const messages = await Message.find({ chatId })
      .populate("sender", "name username image")
      .sort({ createdAt: -1 }) // latest first
      .skip(skip)
      .limit(limit);

    // total message count (for frontend pagination)
    const totalMessages = await Message.countDocuments({ chatId });

    return res.status(200).json({
      success: true,
      data: {
        messages,
        pagination: {
          page,
          limit,
          totalMessages,
          totalPages: Math.ceil(totalMessages / limit),
        },
        revealed: chat.revealed,
      },
    });
  } catch (error) {
    console.error("Get Messages Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error fetching messages",
    });
  }
};

// send a new message
export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;
    const currentUserId = req.user._id;

    // validate message
    if (!text || text.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message text is required",
      });
    }

    // check if chatroom exists
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // check if user is participant
    const isParticipant = chat.users.some(
      (id) => id.toString() === currentUserId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to send messages in this chat",
      });
    }

    // create message
    const message = await Message.create({
      chatId,
      sender: currentUserId,
      text: text.trim(),
    });

    // populate sender for frontend
    await message.populate("sender", "name username image");

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: { message },
    });
  } catch (error) {
    console.error("Send Message Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error sending message",
    });
  }
};
