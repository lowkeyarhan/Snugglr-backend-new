import { Request, Response } from "express";
import { ChatService } from "./chat.service";

const chatService = new ChatService();

export const getUserChats = async (req: Request, res: Response) => {
  try {
    const chats = await chatService.getUserChats(req.user!._id);
    return res.status(200).json({ success: true, data: chats });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error fetching chats",
    });
  }
};

export const getChatRoom = async (req: Request, res: Response) => {
  try {
    const chat = await chatService.getChatRoom(
      req.params.chatId,
      req.user!._id,
    );
    return res.status(200).json({ success: true, data: chat });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const data = await chatService.getMessages(
      req.params.chatId,
      req.user!._id,
      page,
      limit,
    );
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    const message = await chatService.sendMessage(
      req.params.chatId,
      req.user!._id,
      text,
    );
    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: { message },
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createPersonalChat = async (req: Request, res: Response) => {
  try {
    const { userIds } = req.body;
    const chat = await chatService.createPersonalChat(userIds);
    return res.status(chat ? 200 : 201).json(chat);
  } catch (error: any) {
    return res.status(error.statusCode || 400).json({
      message: error.message,
    });
  }
};

export const createGroupChat = async (req: Request, res: Response) => {
  try {
    const { userIds, groupName } = req.body;
    const chat = await chatService.createGroupChat(userIds, groupName);
    return res.status(201).json(chat);
  } catch (error: any) {
    return res.status(error.statusCode || 400).json({
      message: error.message,
    });
  }
};
