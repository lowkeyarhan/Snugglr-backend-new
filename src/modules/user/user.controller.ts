import { NextFunction, Request, Response } from "express";
import { UserService } from "./user.service";

const userService = new UserService();

export const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await userService.getMyProfile(req.user!._id);
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch profile",
    });
  } finally {
    next();
  }
};

export const updateMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const updatedUser = await userService.updateMyProfile(
      req.user!._id,
      req.body,
    );
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  } finally {
    next();
  }
};
