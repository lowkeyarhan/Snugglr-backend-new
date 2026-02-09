import { NextFunction, Request, Response } from "express";
import { ChatService } from "./chat.service";

const chatService = new ChatService();

export const getUserChats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const chats = await chatService.getUserChats(req.user!._id);
    res.status(200).json({ success: true, data: chats });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error fetching chats",
    });
  } finally {
    next();
  }
};

export const getChatRoom = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const chat = await chatService.getChatRoom(
      req.params.chatId,
      req.user!._id,
    );
    res.status(200).json({ success: true, data: chat });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  } finally {
    next();
  }
};

export const getMessages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const data = await chatService.getMessages(
      req.params.chatId,
      req.user!._id,
      page,
      limit,
    );
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  } finally {
    next();
  }
};

export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { text } = req.body;
    const message = await chatService.sendMessage(
      req.params.chatId,
      req.user!._id,
      text,
    );
    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: { message },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  } finally {
    next();
  }
};

export const createPersonalChat = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userIds } = req.body;
    const chat = await chatService.createPersonalChat(userIds);
    res.status(chat ? 200 : 201).json(chat);
  } catch (error: any) {
    res.status(error.statusCode || 400).json({
      message: error.message,
    });
  } finally {
    next();
  }
};

export const createGroupChat = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userIds, groupName } = req.body;
    const chat = await chatService.createGroupChat(userIds, groupName);
    res.status(201).json(chat);
  } catch (error: any) {
    res.status(error.statusCode || 400).json({
      message: error.message,
    });
  } finally {
    next();
  }
};
