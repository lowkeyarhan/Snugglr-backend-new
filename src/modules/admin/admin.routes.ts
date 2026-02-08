import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  deleteUser,
  updateUserStatus,
  appointAdmin,
  removeAdmin,
  getAllDomains,
  addDomain,
  updateDomain,
  deleteDomain,
  getAllChatrooms,
  getChatroomById,
  deleteChatroom,
  getChatroomStats,
  getAllMatches,
  getMatchById,
  deleteMatch,
  getMatchStats,
  getAllMatchPoolEntries,
  getMatchPoolEntryById,
  deleteMatchPoolEntry,
  getMatchPoolStats,
} from "./admin.controller";
import { authMiddleware, adminMiddleware, superadminMiddleware } from "../../core/middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/users", adminMiddleware, getAllUsers);
router.get("/users/:userId", adminMiddleware, getUserById);
router.delete("/users/:userId", adminMiddleware, deleteUser);
router.patch("/users/:userId/status", adminMiddleware, updateUserStatus);

router.post("/appoint", superadminMiddleware, appointAdmin);
router.delete("/remove/:userId", superadminMiddleware, removeAdmin);

router.get("/domains", adminMiddleware, getAllDomains);
router.post("/domains", adminMiddleware, addDomain);
router.put("/domains/:id", adminMiddleware, updateDomain);
router.delete("/domains/:id", adminMiddleware, deleteDomain);

router.get("/chatrooms", adminMiddleware, getAllChatrooms);
router.get("/chatrooms/stats", adminMiddleware, getChatroomStats);
router.get("/chatrooms/:chatroomId", adminMiddleware, getChatroomById);
router.delete("/chatrooms/:chatroomId", adminMiddleware, deleteChatroom);

router.get("/matches", adminMiddleware, getAllMatches);
router.get("/matches/stats", adminMiddleware, getMatchStats);
router.get("/matches/:matchId", adminMiddleware, getMatchById);
router.delete("/matches/:matchId", adminMiddleware, deleteMatch);

router.get("/matchpool", adminMiddleware, getAllMatchPoolEntries);
router.get("/matchpool/stats", adminMiddleware, getMatchPoolStats);
router.get("/matchpool/:entryId", adminMiddleware, getMatchPoolEntryById);
router.delete("/matchpool/:entryId", adminMiddleware, deleteMatchPoolEntry);

export default router;
