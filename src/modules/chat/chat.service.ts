import ChatRoom from "./models/ChatRoom";
import Message from "./models/Message";
import User from "../user/models/User";
import { AppError } from "../../core/errors/AppError";

export class ChatService {
  async getUserChats(userId: string) {
    const chats = await ChatRoom.aggregate([
      {
        $match: {
          users: userId,
          $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }],
        },
      },
      {
        $lookup: {
          from: "messages",
          localField: "_id",
          foreignField: "chatId",
          as: "messages",
        },
      },
      {
        $addFields: {
          lastMessage: { $arrayElemAt: [{ $slice: ["$messages", -1] }, 0] },
        },
      },
      { $sort: { updatedAt: -1 } },
      {
        $project: {
          messages: 0,
        },
      },
    ]);

    return chats.map((chat: any) => ({
      ...chat,
      displayName:
        chat.type === "group"
          ? chat.groupName
          : chat.anonymous
            ? "Anonymous Chat"
            : null,
    }));
  }

  async getChatRoom(chatId: string, userId: string) {
    const chat = await ChatRoom.findById(chatId);
    if (!chat) throw new AppError("Chat not found", 404);

    const isParticipant = chat.users.some(
      (id: any) => id.toString() === userId.toString(),
    );
    if (!isParticipant) throw new AppError("Not a participant", 403);

    return {
      _id: chat._id,
      type: chat.type,
      status: chat.status,
      anonymous: chat.anonymous,
      expiresAt: chat.expiresAt,
      groupName: chat.groupName,
    };
  }

  async getMessages(
    chatId: string,
    userId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const chat = await ChatRoom.findById(chatId);
    if (!chat) throw new AppError("Chat not found", 404);

    const isParticipant = chat.users.some(
      (id: any) => id.toString() === userId.toString(),
    );
    if (!isParticipant)
      throw new AppError("You are not a participant of this chat", 403);

    const skip = (page - 1) * limit;

    let query = Message.find({ chatId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (!chat.anonymous) {
      query = query.populate("sender", "name username image");
    }

    const messages = await query;
    const totalMessages = await Message.countDocuments({ chatId });

    return {
      messages,
      pagination: {
        page,
        limit,
        totalMessages,
        totalPages: Math.ceil(totalMessages / limit),
      },
      chatStatus: chat.status,
      anonymous: chat.anonymous,
    };
  }

  async sendMessage(chatId: string, userId: string, text: string) {
    if (!text?.trim()) {
      throw new AppError("Message text is required", 400);
    }

    const chat = await ChatRoom.findById(chatId);
    if (!chat) throw new AppError("Chat not found", 404);

    const isParticipant = chat.users.some(
      (id: any) => id.toString() === userId.toString(),
    );
    if (!isParticipant)
      throw new AppError(
        "You are not allowed to send messages in this chat",
        403,
      );

    if (chat.status !== "ACTIVE") {
      throw new AppError("Chat is locked or expired", 403);
    }

    const message = await Message.create({
      chatId,
      sender: userId,
      text: text.trim(),
    });

    if (!chat.anonymous) {
      await message.populate("sender", "name username image");
    }

    return message;
  }

  async createPersonalChat(userIds: string[]) {
    if (userIds.length !== 2) {
      throw new AppError("Personal chat requires exactly 2 users", 400);
    }

    const users = await User.find({ _id: { $in: userIds } }).select(
      "institution",
    );
    if (users.length !== userIds.length) {
      throw new AppError("Invalid users provided", 400);
    }

    const instituteSet = new Set(
      users.map((u: any) => u.institution?.toString()),
    );
    if (instituteSet.size !== 1) {
      throw new AppError("Users must belong to the same institution", 400);
    }

    const institution = users[0]?.institution?.toString();
    const sortedUsers = [...userIds].sort((a, b) => a.localeCompare(b));

    const existingChat = await ChatRoom.findOne({
      type: "personal",
      institute: institution,
      users: sortedUsers,
    });

    if (existingChat) return existingChat;

    const chat = await ChatRoom.create({
      type: "personal",
      institute: institution,
      users: sortedUsers as any,
    });

    return chat;
  }

  async createGroupChat(userIds: string[], groupName: string) {
    if (userIds.length < 3) {
      throw new AppError("Group chat needs at least 3 users", 400);
    }

    if (!groupName?.trim()) {
      throw new AppError("Group name is required", 400);
    }

    const users = await User.find({ _id: { $in: userIds } }).select(
      "institution",
    );
    if (users.length !== userIds.length) {
      throw new AppError("Invalid users provided", 400);
    }

    const instituteSet = new Set(
      users.map((u: any) => u.institution?.toString()),
    );
    if (instituteSet.size !== 1) {
      throw new AppError("Users must belong to the same institution", 400);
    }

    const institution = users[0]?.institution?.toString();

    const chat = await ChatRoom.create({
      type: "group",
      institute: institution,
      users: userIds as any,
      groupName,
    });

    return chat;
  }
}
