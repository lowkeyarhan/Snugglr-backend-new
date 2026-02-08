import { Request, Response } from "express";
import { SocialService } from "./social.service";

const socialService = new SocialService();

export const createConfession = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    const confession = await socialService.createConfession(
      req.user!._id,
      req.user!.institution,
      text,
    );
    res.status(201).json({ success: true, data: confession });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getConfessions = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const data = await socialService.getConfessions(
      req.user!.institution,
      page,
      limit,
    );
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error fetching confessions",
    });
  }
};

export const likeConfession = async (req: Request, res: Response) => {
  try {
    const { confessionId } = req.params;
    const result = await socialService.likeConfession(
      confessionId,
      req.user!._id,
      req.user!.institution,
    );
    return res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error liking confession",
    });
  }
};

export const commentOnConfession = async (req: Request, res: Response) => {
  try {
    const { confessionId } = req.params;
    const { text } = req.body;
    const comment = await socialService.commentOnConfession(
      confessionId,
      req.user!._id,
      req.user!.institution,
      text,
    );
    return res.status(201).json({ success: true, data: comment });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error adding comment",
    });
  }
};

export const replyToComment = async (req: Request, res: Response) => {
  try {
    const { confessionId, commentId } = req.params;
    const { text } = req.body;
    const reply = await socialService.replyToComment(
      confessionId,
      commentId,
      req.user!._id,
      req.user!.institution,
      text,
    );
    return res.status(201).json({ success: true, data: reply });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const likeComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const result = await socialService.likeComment(commentId, req.user!._id);
    return res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error liking comment",
    });
  }
};

export const getCommentsForConfession = async (req: Request, res: Response) => {
  try {
    const { confessionId } = req.params;
    const comments = await socialService.getCommentsForConfession(
      confessionId,
      req.user!.institution,
    );
    return res.status(200).json({ success: true, data: comments });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error fetching comments",
    });
  }
};
