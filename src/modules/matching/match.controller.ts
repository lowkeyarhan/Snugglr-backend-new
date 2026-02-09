import { NextFunction, Request, Response } from "express";
import { MatchingService } from "./match.service";

const matchingService = new MatchingService();

export const getMyMatchPool = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const entry = await matchingService.getMyMatchPool(req.user!._id);
    res.status(200).json({ entry });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Error fetching match pool",
    });
  } finally {
    next();
  }
};

export const joinMatchPool = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { mood, description } = req.body;
    const result = await matchingService.joinMatchPool(
      req.user!._id,
      req.user!.institution,
      mood,
      description,
    );
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 400).json({
      message: error.message,
    });
  } finally {
    next();
  }
};

export const leaveMatchPool = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await matchingService.leaveMatchPool(req.user!._id);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Error leaving match pool",
    });
  } finally {
    next();
  }
};

export const tryMatch = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await matchingService.tryMatch(req.user!._id);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Internal server error",
    });
  } finally {
    next();
  }
};
