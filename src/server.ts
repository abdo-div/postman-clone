import dns from "node:dns";

// Force Node to use Google Public DNS for all hostname lookups
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import http from "node:http";
import app from "./app.js";
import { env } from "./config/env.config.js";
import { logger } from "./config/logger.js";
import { connectDatabase } from "./config/database.config.js";
import { initSocketServer } from './config/socket.js';
import './modules/runner/runner.worker.js';

const server = http.createServer(app);
initSocketServer(server);

const startServer = () => {
  connectDatabase().then(() => {
    logger.info("✅ Database connection established successfully");
  });
  server.listen(env.PORT, () => {
    logger.info(`🚀 Server listening on port ${env.PORT} [${env.NODE_ENV}]`);
    logger.info(`📖 API Docs available at http://localhost:${env.PORT}/api/docs`);
  });
};

const gracefulShutdown = (signal: string) => {
  logger.warn(`Received ${signal}. Shutting down server gracefully...`);
  server.close(() => {
    logger.info("🔒 HTTP server closed.");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("❌ Forced shutdown due to timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

startServer();
