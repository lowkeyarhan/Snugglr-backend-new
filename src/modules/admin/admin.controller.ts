import { Request, Response } from "express";
import { AdminService } from "./admin.service";

const adminService = new AdminService();

export const appointAdmin = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const result = await adminService.appointAdmin(userId);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const removeAdmin = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result = await adminService.removeAdmin(req.user!._id, userId);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const getAllDomains = async (req: Request, res: Response) => {
  try {
    const { isActive } = req.query;
    const domains = await adminService.getAllDomains(isActive as string);
    res.json({ success: true, data: domains });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const addDomain = async (req: Request, res: Response) => {
  try {
    const { domain, institutionName, isActive = true } = req.body;
    const newDomain = await adminService.addDomain(
      domain,
      institutionName,
      isActive,
    );
    res.status(201).json({ success: true, data: newDomain });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const updateDomain = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { domain, institutionName, isActive } = req.body;
    const updated = await adminService.updateDomain(
      id,
      domain,
      institutionName,
      isActive,
    );
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const deleteDomain = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await adminService.deleteDomain(id);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search, role, isActive } = req.query;
    const data = await adminService.getAllUsers(
      Number(page),
      Number(limit),
      search as string,
      role as string,
      isActive as string,
    );
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error fetching users",
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const data = await adminService.getUserById(userId);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result = await adminService.deleteUser(req.user!._id, userId);
    return res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;
    const user = await adminService.updateUserStatus(userId, isActive);
    return res.status(200).json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      data: user,
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllChatrooms = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, type, status, anonymous } = req.query;
    const data = await adminService.getAllChatrooms(
      Number(page),
      Number(limit),
      type as string,
      status as string,
      anonymous as string,
    );
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getChatroomStats = async (req: Request, res: Response) => {
  try {
    const stats = await adminService.getChatroomStats();
    return res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getChatroomById = async (req: Request, res: Response) => {
  try {
    const { chatroomId } = req.params;
    const data = await adminService.getChatroomById(chatroomId);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteChatroom = async (req: Request, res: Response) => {
  try {
    const { chatroomId } = req.params;
    const result = await adminService.deleteChatroom(chatroomId);
    return res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllMatches = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const data = await adminService.getAllMatches(
      Number(page),
      Number(limit),
      status as string,
    );
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMatchStats = async (req: Request, res: Response) => {
  try {
    const stats = await adminService.getMatchStats();
    return res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMatchById = async (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;
    const data = await adminService.getMatchById(matchId);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteMatch = async (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;
    const result = await adminService.deleteMatch(matchId);
    return res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllMatchPoolEntries = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, mood } = req.query;
    const data = await adminService.getAllMatchPoolEntries(
      Number(page),
      Number(limit),
      mood as string,
    );
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMatchPoolStats = async (req: Request, res: Response) => {
  try {
    const stats = await adminService.getMatchPoolStats();
    return res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMatchPoolEntryById = async (req: Request, res: Response) => {
  try {
    const { entryId } = req.params;
    const data = await adminService.getMatchPoolEntryById(entryId);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteMatchPoolEntry = async (req: Request, res: Response) => {
  try {
    const { entryId } = req.params;
    const result = await adminService.deleteMatchPoolEntry(entryId);
    return res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};
