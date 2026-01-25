require("dotenv").config({ path: __dirname + "/../.env" });

const mongoose = require("mongoose");
const app = require("./app");
const connectDB = require("./config/db");
const logger = require("./config/logger");

const PORT = process.env.PORT || 5000;

let server;

const startServer = async () => {
  try {
    // Start server first, then connect to DB
    server = app.listen(PORT, () => {
      logger.info(`TalkAi backend running on port ${PORT}`);
    });
    
    // Connect to DB after server is running
    await connectDB();
    logger.info('Database connected successfully');
  } catch (err) {
    logger.error("Failed to start server", { error: err.message });
    // Don't exit - let server run without DB for basic functionality
    if (!server) {
      process.exit(1);
    }
  }
};

const shutdown = async (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    logger.info("HTTP server closed");

    try {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed");
      process.exit(0);
    } catch (err) {
      logger.error("Shutdown error", { error: err.message });
      process.exit(1);
    }
  });

  // force exit if shutdown hangs
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

startServer();

