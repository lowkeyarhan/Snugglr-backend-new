import express from "express";
import cors from "cors";
import { config } from "./config/env";
import { errorMiddleware } from "./core/middleware/error.middleware";
import { setupSwaggerResponses } from "./config/swagger";

import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/user.routes";
import chatRoutes from "./modules/chat/chat.routes";
import matchRoutes from "./modules/matching/match.routes";
import socialRoutes from "./modules/social/social.routes";
import adminRoutes from "./modules/admin/admin.routes";

const app = express();

setupSwaggerResponses(app);

app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/profile", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/confession", socialRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorMiddleware);

export default app;
