import { Request, Response } from "express";
import { AuthService } from "./auth.service";

const authService = new AuthService();

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.registerUser(email, password);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: result,
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, phoneNumber, password } = req.body;
    const result = await authService.loginUser(email, phoneNumber, password);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error logging in",
    });
  }
};
