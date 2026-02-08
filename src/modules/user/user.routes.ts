import { Router } from "express";
import { getMyProfile, updateMyProfile } from "./user.controller";
import { authMiddleware } from "../../core/middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/me", getMyProfile);
router.patch("/me", updateMyProfile);

export default router;
