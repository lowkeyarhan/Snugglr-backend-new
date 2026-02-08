import User from "./models/User";
import { AppError } from "../../core/errors/AppError";

export class UserService {
  async getMyProfile(userId: string) {
    const user = await User.findById(userId)
      .select("-password -__v")
      .populate("institution", "name");

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  }

  async updateMyProfile(userId: string, updates: any) {
    const ALLOWED_FIELDS = [
      "name", "profilePicture", "phoneNumber", "birthday", "pronouns", "gender",
      "community", "interests", "musicPreferences", "favoriteShows", "memeVibe",
      "favArtists", "favMovies", "favAlbums", "favSpotOnCampus", "loveLanguage",
      "quirkyFacts", "idealDate", "fantasies",
    ];

    const filteredUpdates: any = {};
    for (const field of ALLOWED_FIELDS) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      throw new AppError("No editable fields provided", 400);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    )
      .select("-password -__v")
      .populate("institution", "name");

    return updatedUser;
  }
}
