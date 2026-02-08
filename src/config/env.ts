import dotenv from "dotenv";

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing");
}

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is missing");
}

export const config = {
  port: process.env.PORT || 3000,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiry: process.env.JWT_EXPIRY || "21d",
  mongoUri: process.env.MONGO_URI,
};
