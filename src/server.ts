import dns from "node:dns";

// Force Node to use Google Public DNS for all hostname lookups
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import http from "node:http";
import app from "./app.js";
import { env } from "./config/env.config.js";
import { connectDatabase } from "./config/database.config.js";
import { initSocketServer } from './config/socket.js';
import './modules/runner/runner.worker.js';
const server = http.createServer(app);
initSocketServer(server);
const startServer = () => {
  connectDatabase().then(() => {
    console.log("✅ Database connection established successfully");
  });
  server.listen(env.PORT, () => {
    console.log(`🚀 Server listening on port ${env.PORT} [${env.NODE_ENV}]`);
  });
};

const gracefulShutdown = (signal: string) => {
  console.log(`\n⚠️ Received ${signal}. Shutting down server gracefully...`);
  server.close(() => {
    console.log("🔒 HTTP server closed.");
    // Close database / redis connections here
    process.exit(0);
  });

  setTimeout(() => {
    console.error("❌ Forced shutdown due to timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

startServer();
