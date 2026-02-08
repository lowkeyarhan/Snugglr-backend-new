import { Router } from "express";
import {
  createConfession,
  getConfessions,
  likeConfession,
  commentOnConfession,
  replyToComment,
  likeComment,
  getCommentsForConfession,
} from "./social.controller";
import { authMiddleware } from "../../core/middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/", createConfession);
router.get("/", getConfessions);
router.post("/:confessionId/like", likeConfession);
router.post("/:confessionId/comment", commentOnConfession);
router.get("/:confessionId/comments", getCommentsForConfession);
router.post("/:confessionId/comment/:commentId/reply", replyToComment);
router.post("/comment/:commentId/like", likeComment);

export default router;
