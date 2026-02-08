import { Router } from "express";
import {
  getMyMatchPool,
  joinMatchPool,
  leaveMatchPool,
  tryMatch,
} from "./match.controller";
import { authMiddleware } from "../../core/middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/pool", getMyMatchPool);
router.post("/pool", joinMatchPool);
router.delete("/pool", leaveMatchPool);
router.post("/try", tryMatch);

export default router;
