import Confession from "./models/Confession";
import Comment from "./models/Comment";
import Like from "./models/Like";
import Notification from "../user/models/Notification";
import { AppError } from "../../core/errors/AppError";

export class SocialService {
  async createConfession(userId: string, institution: string, text: string) {
    if (!text?.trim()) {
      throw new AppError("Confession text required", 400);
    }

    const confession = await Confession.create({
      user: userId,
      institution,
      confession: text.trim(),
    });

    return confession;
  }

  async getConfessions(
    institution: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const confessions = await Confession.find({ institution })
      .populate("user", "username profilePicture")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const total = await Confession.countDocuments({ institution });

    return {
      confessions,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalConfessions: total,
    };
  }

  async likeConfession(
    confessionId: string,
    userId: string,
    institution: string,
  ) {
    const confession = await Confession.findOne({
      _id: confessionId,
      institution,
    });
    if (!confession) throw new AppError("Confession not found", 404);

    const existingLike = await Like.findOne({
      user: userId,
      targetId: confessionId,
      targetType: "confession",
    });

    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });
      await Confession.findByIdAndUpdate(confessionId, {
        $inc: { likesCount: -1 },
      });
      return { liked: false };
    }

    await Like.create({
      user: userId,
      targetId: confessionId,
      targetType: "confession",
    });

    await Confession.findByIdAndUpdate(confessionId, {
      $inc: { likesCount: 1 },
    });

    if (confession.user.toString() !== userId.toString()) {
      await Notification.create({
        user: confession.user,
        type: "like",
        title: "Your post is getting attention",
        body: "Someone liked your confession",
        actionUrl: `/confession/${confessionId}`,
        relatedUser: userId,
        relatedPost: confessionId,
      });
    }

    return { liked: true };
  }

  async commentOnConfession(
    confessionId: string,
    userId: string,
    institution: string,
    text: string,
  ) {
    if (!text?.trim()) {
      throw new AppError("Comment text required", 400);
    }

    const confession = await Confession.findOne({
      _id: confessionId,
      institution,
    });
    if (!confession) throw new AppError("Confession not found", 404);

    const comment = await Comment.create({
      confession: confessionId,
      user: userId,
      text: text.trim(),
      parentComment: null,
    });

    if (confession.user.toString() !== userId.toString()) {
      await Notification.create({
        user: confession.user,
        type: "comment",
        title: "New reply",
        body: "Someone replied to your confession",
        actionUrl: `/confession/${confessionId}`,
        relatedUser: userId,
        relatedPost: confessionId,
      });
    }

    return comment;
  }

  async replyToComment(
    confessionId: string,
    commentId: string,
    userId: string,
    institution: string,
    text: string,
  ) {
    if (!text?.trim()) {
      throw new AppError("Reply text required", 400);
    }

    const confession = await Confession.findOne({
      _id: confessionId,
      institution,
    });
    if (!confession) throw new AppError("Confession not found", 404);

    const parentComment = await Comment.findOne({
      _id: commentId,
      confession: confessionId,
    });
    if (!parentComment) throw new AppError("Comment not found", 404);

    const reply = await Comment.create({
      confession: confessionId,
      user: userId,
      text: text.trim(),
      parentComment: commentId,
    });

    if (parentComment.user.toString() !== userId.toString()) {
      await Notification.create({
        user: parentComment.user,
        type: "comment",
        title: "New reply",
        body: "Someone replied to your comment",
        actionUrl: `/confession/${confessionId}`,
        relatedUser: userId,
        relatedPost: confessionId,
      });
    }

    return reply;
  }

  async likeComment(commentId: string, userId: string) {
    const comment = await Comment.findById(commentId);
    if (!comment) throw new AppError("Comment not found", 404);

    const existingLike = await Like.findOne({
      user: userId,
      targetId: commentId,
      targetType: "comment",
    });

    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });
      await Comment.findByIdAndUpdate(commentId, { $inc: { likesCount: -1 } });
      return { liked: false };
    }

    await Like.create({
      user: userId,
      targetId: commentId,
      targetType: "comment",
    });

    await Comment.findByIdAndUpdate(commentId, { $inc: { likesCount: 1 } });

    if (comment.user.toString() !== userId.toString()) {
      await Notification.create({
        user: comment.user,
        type: "like",
        title: "Your comment got a like",
        body: "Someone liked your comment",
        actionUrl: `/confession/${comment.confession}`,
        relatedUser: userId,
        relatedPost: comment.confession,
      });
    }

    return { liked: true };
  }

  async getCommentsForConfession(confessionId: string, institution: string) {
    const confession = await Confession.findOne({
      _id: confessionId,
      institution,
    });
    if (!confession) throw new AppError("Confession not found", 404);

    const comments = await Comment.find({ confession: confessionId })
      .populate("user", "username profilePicture")
      .sort({ createdAt: 1 })
      .lean();

    return comments;
  }
}
