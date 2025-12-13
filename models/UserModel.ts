import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    // user authentication fields
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [30, "Name must be less than 30 characters"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [6, "Username must be at least 6 characters"],
      maxlength: [30, "Username must be less than 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
      lowercase: true,
      maxlength: [50, "Email must be less than 50 characters"],
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    // user profile fields
    phoneNumber: {
      type: String,
      trim: true,
    },
    birthday: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    pronouns: {
      type: String,
      trim: true,
    },
    // user preferences fields
    favArtists: {
      type: [String],
      default: [],
    },

    favMovies: {
      type: [String],
      default: [],
    },

    favAlbums: {
      type: [String],
      default: [],
    },

    favSpotOnCampus: {
      type: String,
      trim: true,
    },

    loveLanguage: {
      type: String,
      trim: true,
    },
    quirkyFacts: {
      type: String,
      maxlength: [500, "Quirky facts must be less than 500 characters"],
    },

    idealDate: {
      type: String,
      maxlength: [500, "Ideal date must be less than 500 characters"],
    },

    fantasies: {
      type: String,
      maxlength: [500, "Fantasies must be less than 500 characters"],
    },

    // user status fields
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;
