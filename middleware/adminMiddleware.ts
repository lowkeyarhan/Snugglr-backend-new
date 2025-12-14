import { Request, Response, NextFunction } from "express";

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // check if user is authenticated
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  // check if user is an admin
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admins only. Touch grass.",
    });
  }

  // continue to the next middleware
  next();
};
