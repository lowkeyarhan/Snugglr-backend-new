import dotenv from "dotenv";

// load environment variables
dotenv.config();

import express from "express";
import cors from "cors";
import authRoute from "./routes/authRoute";
import connectDB from "./configs/mongoDb";

// connect to MongoDB
connectDB();

// express configurations
const app = express();
const port = process.env.PORT || 3000;
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

// CORS configuration
app.use(
  cors({
    origin: clientUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// test route
app.get("/", async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Snugglr API is running!",
    version: "1.0.0",
  });
});

// routes
app.use("/api/auth", authRoute);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
