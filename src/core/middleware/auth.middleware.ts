import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../../config/env";

// Authenticate a user
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if token is provided
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No token",
      });
    }

    // Get token
    const token = authHeader.split(" ")[1];
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret) as {
      userId: string;
      emailId: string;
      role: string;
      institution: string;
    };

    // Set user in request
    req.user = {
      _id: decoded.userId,
      role: decoded.role,
      institution: decoded.institution,
    };

    // Next middleware
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// Admin middleware
export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  // Check if user is an admin or superadmin
  if (req.user.role !== "admin" && req.user.role !== "superadmin") {
    return res.status(403).json({
      success: false,
      message: "Admins or superadmins only",
    });
  }

  // Next middleware
  next();
};

// Superadmin middleware
export const superadminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  // Check if user is a superadmin
  if (req.user.role !== "superadmin") {
    return res.status(403).json({
      success: false,
      message: "Superadmins only",
    });
  }

  // Next middleware
  next();
};
