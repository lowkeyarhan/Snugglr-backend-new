import MatchPool from "./models/MatchPool";
import Match from "./models/Match";
import ChatRoom from "../chat/models/ChatRoom";
import Notification from "../user/models/Notification";
import { AppError } from "../../core/errors/AppError";

export class MatchingService {
  async getMyMatchPool(userId: string) {
    const entry = await MatchPool.findOne({ user: userId }).lean();
    return entry;
  }

  async joinMatchPool(
    userId: string,
    institution: string,
    mood: string,
    description?: string,
  ) {
    if (!mood) {
      throw new AppError("Mood is required", 400);
    }

    const expiresAt = new Date(Date.now() + 20 * 60 * 1000);

    await MatchPool.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        institution,
        mood,
        description: description || null,
        expiresAt,
      },
      { upsert: true, new: true },
    );

    return { message: "Joined match pool" };
  }

  async leaveMatchPool(userId: string) {
    await MatchPool.deleteOne({ user: userId });
    return { message: "Left match pool" };
  }

  async tryMatch(userId: string) {
    const me = await MatchPool.findOne({ user: userId });
    if (!me) throw new AppError("Not in pool", 400);

    const candidate = await MatchPool.findOne({
      institution: me.institution,
      mood: me.mood,
      user: { $ne: me.user },
    });

    if (!candidate) {
      return { matched: false };
    }

    await MatchPool.deleteMany({
      user: { $in: [me.user, candidate.user] },
    });

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const match = await Match.create({
      userA: me.user,
      userB: candidate.user,
      institute: me.institution,
      expiresAt,
    });

    const chat = await ChatRoom.create({
      institute: me.institution,
      users: [me.user, candidate.user],
      type: "personal",
      anonymous: true,
      status: "LOCKED",
      expiresAt,
    });

    await chat.save();

    await Notification.insertMany([
      {
        user: me.user,
        type: "system",
        title: "It's a match 👀",
        body: "Someone from your college is in the same mood 👀 Want to make the first move?",
        actionUrl: `/chats/${chat._id}`,
      },
      {
        user: candidate.user,
        type: "system",
        title: "It's a match 👀",
        body: "Someone from your college is in the same mood 👀 Want to make the first move?",
        actionUrl: `/chats/${chat._id}`,
      },
    ]);

    return {
      matched: true,
      chatId: chat._id,
    };
  }
}
