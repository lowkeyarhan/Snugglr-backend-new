import Confession from "../models/confessions/Confession";
import Comment from "../models/confessions/Comment";
import Like from "../models/confessions/Like";

// create a new confession
export const createConfession = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ message: "Confession text required" });
    }

    const confession = await Confession.create({
      user: req.user._id,
      institution: req.user.institution,
      confession: text.trim(),
    });

    res.status(201).json({
      success: true,
      data: confession,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// get all confessions
export const getConfessions = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const confessions = await Confession.find({
      institution: req.user.institution,
    })
      .populate("user", "username profilePicture")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((page - 1) * limit)
      .lean();

    const total = await Confession.countDocuments({
      institution: req.user.institution,
    });

    res.status(200).json({
      success: true,
      data: {
        confessions,
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalConfessions: total,
      },
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Error fetching confessions",
    });
  }
};

// like a confession
export const likeConfession = async (req, res) => {
  try {
    const { confessionId } = req.params;
    const userId = req.user._id;

    // check if confession exists
    const confession = await Confession.findOne({
      _id: confessionId,
      institution: req.user.institution,
    });

    // if confession does not exist, return 404
    if (!confession) {
      return res.status(404).json({ message: "Confession not found" });
    }

    // check if user has already liked the confession
    const existingLike = await Like.findOne({
      user: userId,
      targetId: confessionId,
      targetType: "confession",
    });

    // if user has already liked the confession, unlike it
    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });
      await Confession.findByIdAndUpdate(confessionId, {
        $inc: { likesCount: -1 },
      });

      return res.status(200).json({ success: true, liked: false });
    }

    // like the confession
    await Like.create({
      user: userId,
      targetId: confessionId,
      targetType: "confession",
    });

    // update the confession likes count
    await Confession.findByIdAndUpdate(confessionId, {
      $inc: { likesCount: 1 },
    });

    return res.status(200).json({ success: true, liked: true });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Error liking confession",
    });
  }
};

// comment on a confession
export const commentOnConfession = async (req, res) => {
  try {
    const { confessionId } = req.params;
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ message: "Comment text required" });
    }

    // check if confession exists
    const confession = await Confession.findOne({
      _id: confessionId,
      institution: req.user.institution,
    });

    // if confession does not exist, return 404
    if (!confession) {
      return res.status(404).json({ message: "Confession not found" });
    }

    // create a new comment
    const comment = await Comment.create({
      confession: confessionId,
      user: req.user._id,
      text: text.trim(),
      parentComment: null,
    });

    return res.status(201).json({
      success: true,
      data: comment,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Error adding comment",
    });
  }
};

// reply to a comment on a confession (nested comments, parent comment is required)
export const replyToComment = async (req, res) => {
  try {
    const { confessionId, commentId } = req.params;
    const { text } = req.body;

    // check if reply text is provided
    if (!text?.trim()) {
      return res.status(400).json({ message: "Reply text required" });
    }
    // check if confession exists
    const confession = await Confession.findOne({
      _id: confessionId,
      institution: req.user.institution,
    });

    // if confession does not exist, return 404
    if (!confession) {
      return res.status(404).json({ message: "Confession not found" });
    }

    // check if parent comment exists
    const parentComment = await Comment.findOne({
      _id: commentId,
      confession: confessionId,
    });

    // if parent comment does not exist, return 404
    if (!parentComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // create a new reply
    const reply = await Comment.create({
      confession: confessionId,
      user: req.user._id,
      text: text.trim(),
      parentComment: commentId,
    });

    return res.status(201).json({
      success: true,
      data: reply,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Error replying to comment",
    });
  }
};

// like a comment
export const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    // check if comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // check if user has already liked the comment
    const existingLike = await Like.findOne({
      user: userId,
      targetId: commentId,
      targetType: "comment",
    });

    // if user has already liked the comment, unlike it
    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });
      await Comment.findByIdAndUpdate(commentId, {
        $inc: { likesCount: -1 },
      });

      return res.status(200).json({ success: true, liked: false });
    }

    // like the comment
    await Like.create({
      user: userId,
      targetId: commentId,
      targetType: "comment",
    });

    // update the comment likes count
    await Comment.findByIdAndUpdate(commentId, {
      $inc: { likesCount: 1 },
    });

    return res.status(200).json({ success: true, liked: true });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Error liking comment",
    });
  }
};

// get all comments for a confession
export const getCommentsForConfession = async (req, res) => {
  try {
    const { confessionId } = req.params;

    // check if confession exists
    const confession = await Confession.findOne({
      _id: confessionId,
      institution: req.user.institution,
    });

    // if confession does not exist, return 404
    if (!confession) {
      return res.status(404).json({ message: "Confession not found" });
    }

    // get all comments for the confession
    const comments = await Comment.find({ confession: confessionId })
      .populate("user", "username profilePicture")
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({ success: true, data: comments });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Error fetching comments",
    });
  }
};
