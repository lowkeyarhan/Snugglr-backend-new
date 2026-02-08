import User from "../user/models/User";
import AllowedCollege from "./models/AllowedCollege";
import ChatRoom from "../chat/models/ChatRoom";
import Message from "../chat/models/Message";
import Match from "../matching/models/Match";
import MatchPool from "../matching/models/MatchPool";
import Confession from "../social/models/Confession";
import Comment from "../social/models/Comment";
import Like from "../social/models/Like";
import Notification from "../user/models/Notification";
import { AppError } from "../../core/errors/AppError";

export class AdminService {
  async appointAdmin(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    if (user.role === "admin") throw new AppError("Already admin", 400);
    if (user.role === "superadmin")
      throw new AppError("Cannot modify superadmin", 403);

    user.role = "admin";
    await user.save();
    return { message: "Admin appointed" };
  }

  async removeAdmin(requesterId: string, userId: string) {
    if (requesterId === userId)
      throw new AppError("You cannot remove yourself", 400);

    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    if (user.role !== "admin") throw new AppError("User is not an admin", 400);

    user.role = "user";
    await user.save();
    return { message: "Admin removed" };
  }

  async getAllDomains(isActive?: string) {
    const filter: any = {};
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const domains = await AllowedCollege.find(filter).sort({
      institutionName: 1,
    });
    return domains;
  }

  async addDomain(
    domain: string,
    institutionName: string,
    isActive: boolean = true,
  ) {
    if (!domain || !institutionName) {
      throw new AppError("Domain & institution required", 400);
    }

    const exists = await AllowedCollege.findOne({
      domain: domain.toLowerCase(),
    });
    if (exists) throw new AppError("Domain already exists", 400);

    const newDomain = await AllowedCollege.create({
      domain: domain.toLowerCase(),
      institutionName,
      isActive,
    });

    return newDomain;
  }

  async updateDomain(
    id: string,
    domain: string,
    institutionName: string,
    isActive: boolean,
  ) {
    if (!domain || !institutionName) {
      throw new AppError("Domain & institution required", 400);
    }

    const updated = await AllowedCollege.findByIdAndUpdate(
      id,
      { domain, institutionName, isActive },
      { new: true, runValidators: true },
    );

    if (!updated) throw new AppError("Domain not found", 404);
    return updated;
  }

  async deleteDomain(id: string) {
    const deleted = await AllowedCollege.findByIdAndDelete(id);
    if (!deleted) throw new AppError("Domain not found", 404);
    return { message: "Domain deleted" };
  }

  async getAllUsers(
    page: number,
    limit: number,
    search?: string,
    role?: string,
    isActive?: string,
  ) {
    const filter: any = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .populate("institution", "institutionName domain")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const totalUsers = await User.countDocuments(filter);

    return {
      users,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
      },
    };
  }

  async getUserById(userId: string) {
    const user = await User.findById(userId)
      .select("-password")
      .populate("institution", "institutionName domain")
      .lean();

    if (!user) throw new AppError("User not found", 404);

    const [confessionsCount, commentsCount, matchesCount] = await Promise.all([
      Confession.countDocuments({ user: userId }),
      Comment.countDocuments({ user: userId }),
      Match.countDocuments({ $or: [{ userA: userId }, { userB: userId }] }),
    ]);

    return {
      user,
      stats: { confessionsCount, commentsCount, matchesCount },
    };
  }

  async deleteUser(requesterId: string, userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    if (user.role === "superadmin")
      throw new AppError("Cannot delete superadmin", 403);
    if (requesterId === userId)
      throw new AppError("Cannot delete yourself", 400);

    await Confession.deleteMany({ user: userId });
    await Comment.deleteMany({ user: userId });
    await Like.deleteMany({ user: userId });
    await Match.deleteMany({ $or: [{ userA: userId }, { userB: userId }] });
    await MatchPool.deleteOne({ user: userId });
    await Notification.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);

    return { message: "User and associated data deleted successfully" };
  }

  async updateUserStatus(userId: string, isActive: boolean) {
    if (isActive === undefined) {
      throw new AppError("isActive field is required", 400);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true },
    ).select("-password");
    if (!user) throw new AppError("User not found", 404);
    return user;
  }

  async getAllChatrooms(
    page: number,
    limit: number,
    type?: string,
    status?: string,
    anonymous?: string,
  ) {
    const filter: any = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (anonymous !== undefined) filter.anonymous = anonymous === "true";

    const chatrooms = await ChatRoom.find(filter)
      .populate("users", "username email")
      .populate("institute", "institutionName")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const chatroomsWithCount = await Promise.all(
      chatrooms.map(async (chat: any) => ({
        ...chat,
        messageCount: await Message.countDocuments({ chatId: chat._id }),
      })),
    );

    const totalChatrooms = await ChatRoom.countDocuments(filter);

    return {
      chatrooms: chatroomsWithCount,
      pagination: {
        page,
        limit,
        totalChatrooms,
        totalPages: Math.ceil(totalChatrooms / limit),
      },
    };
  }

  async getChatroomStats() {
    const [total, byType, byStatus, anonymousCount, totalMessages] =
      await Promise.all([
        ChatRoom.countDocuments(),
        ChatRoom.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }]),
        ChatRoom.aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        ChatRoom.countDocuments({ anonymous: true }),
        Message.countDocuments(),
      ]);

    return { total, byType, byStatus, anonymousCount, totalMessages };
  }

  async getChatroomById(chatroomId: string) {
    const chatroom = await ChatRoom.findById(chatroomId)
      .populate("users", "username email")
      .populate("institute", "institutionName")
      .lean();

    if (!chatroom) throw new AppError("Chatroom not found", 404);

    const messageCount = await Message.countDocuments({ chatId: chatroomId });
    const lastMessage = await Message.findOne({ chatId: chatroomId })
      .sort({ createdAt: -1 })
      .lean();

    return { ...chatroom, messageCount, lastMessage };
  }

  async deleteChatroom(chatroomId: string) {
    const chatroom = await ChatRoom.findByIdAndDelete(chatroomId);
    if (!chatroom) throw new AppError("Chatroom not found", 404);

    const { deletedCount } = await Message.deleteMany({ chatId: chatroomId });
    return { message: "Chatroom deleted", messagesDeleted: deletedCount };
  }

  async getAllMatches(page: number, limit: number, status?: string) {
    const filter: any = {};
    if (status) filter.status = status;

    const matches = await Match.find(filter)
      .populate("userA", "username email")
      .populate("userB", "username email")
      .populate("institute", "institutionName")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const totalMatches = await Match.countDocuments(filter);

    return {
      matches,
      pagination: {
        page,
        limit,
        totalMatches,
        totalPages: Math.ceil(totalMatches / limit),
      },
    };
  }

  async getMatchStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [total, byStatus, createdToday, createdThisWeek] = await Promise.all([
      Match.countDocuments(),
      Match.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Match.countDocuments({ createdAt: { $gte: today } }),
      Match.countDocuments({ createdAt: { $gte: weekAgo } }),
    ]);

    return { total, byStatus, createdToday, createdThisWeek };
  }

  async getMatchById(matchId: string) {
    const match = await Match.findById(matchId)
      .populate("userA", "username email")
      .populate("userB", "username email")
      .populate("institute", "institutionName")
      .lean();

    if (!match) throw new AppError("Match not found", 404);

    const chatroom = await ChatRoom.findOne({
      type: "personal",
      anonymous: true,
      users: { $all: [(match as any).userA._id, (match as any).userB._id] },
    }).lean();

    return { ...match, chatroom };
  }

  async deleteMatch(matchId: string) {
    const match = await Match.findByIdAndDelete(matchId);
    if (!match) throw new AppError("Match not found", 404);
    return { message: "Match deleted" };
  }

  async getAllMatchPoolEntries(page: number, limit: number, mood?: string) {
    const filter: any = {};
    if (mood) filter.mood = mood;

    const entries = await MatchPool.find(filter)
      .populate("user", "username email")
      .populate("institution", "institutionName")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const totalEntries = await MatchPool.countDocuments(filter);

    return {
      entries,
      pagination: {
        page,
        limit,
        totalEntries,
        totalPages: Math.ceil(totalEntries / limit),
      },
    };
  }

  async getMatchPoolStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const in24Hours = new Date();
    in24Hours.setHours(in24Hours.getHours() + 24);

    const [total, byMood, entriesToday, expiringIn24h] = await Promise.all([
      MatchPool.countDocuments(),
      MatchPool.aggregate([{ $group: { _id: "$mood", count: { $sum: 1 } } }]),
      MatchPool.countDocuments({ createdAt: { $gte: today } }),
      MatchPool.countDocuments({ expiresAt: { $lte: in24Hours } }),
    ]);

    return { total, byMood, entriesToday, expiringIn24h };
  }

  async getMatchPoolEntryById(entryId: string) {
    const entry = await MatchPool.findById(entryId)
      .populate("user", "username email")
      .populate("institution", "institutionName")
      .lean();

    if (!entry) throw new AppError("Match pool entry not found", 404);
    return entry;
  }

  async deleteMatchPoolEntry(entryId: string) {
    const entry = await MatchPool.findByIdAndDelete(entryId);
    if (!entry) throw new AppError("Match pool entry not found", 404);
    return { message: "Match pool entry deleted" };
  }
}
