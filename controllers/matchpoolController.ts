import { Request, Response } from "express";
import MatchPool from "../models/matches/MatchPool";

// user joins/creates a match pool
export const joinMatchPool = async (req: Request, res: Response) => {
  const { mood, description } = req.body;

  // check if mood is provided
  if (!mood) {
    return res.status(400).json({ message: "Mood is required" });
  }

  // set expires at
  const expiresAt = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000); // 1 day

  // update or create match pool
  await MatchPool.findOneAndUpdate(
    { user: req.user._id },
    {
      user: req.user._id,
      institution: req.user.institution,
      mood,
      description: description || null,
      expiresAt,
    },
    { upsert: true, new: true }
  );

  return res.status(200).json({ message: "Joined match pool" });
};

// user leaves the match pool
export const leaveMatchPool = async (req: Request, res: Response) => {
  await MatchPool.deleteOne({ user: req.user._id });
  return res.status(200).json({ message: "Left match pool" });
};
