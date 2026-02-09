import "./config/env";
import app from "./app";
import { connectDB } from "./config/db";
import { setupSwaggerRequests } from "./config/swagger";
import { config } from "./config/env";

const startServer = async () => {
  try {
    await connectDB();

    setupSwaggerRequests();

    app.listen(config.port, () => {
      console.log(`Server is running on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
