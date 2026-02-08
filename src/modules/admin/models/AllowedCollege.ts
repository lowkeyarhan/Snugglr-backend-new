import mongoose from "mongoose";

const AllowedCollegeSchema = new mongoose.Schema(
  {
    institutionName: {
      type: String,
      required: true,
      trim: true,
    },
    domain: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("AllowedCollege", AllowedCollegeSchema);
