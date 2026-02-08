import { Router } from "express";
import {
  getUserChats,
  getChatRoom,
  getMessages,
  sendMessage,
  createPersonalChat,
  createGroupChat,
} from "./chat.controller";
import { authMiddleware } from "../../core/middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", getUserChats);
router.post("/personal", createPersonalChat);
router.post("/group", createGroupChat);
router.get("/:chatId", getChatRoom);
router.get("/:chatId/messages", getMessages);
router.post("/:chatId/messages", sendMessage);

export default router;
