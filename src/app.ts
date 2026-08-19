import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.config.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { NotFoundError } from "./errors/app-error.js";
import executorRoutes from "./modules/executor/executor.routes.js";
const app: Application = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

// Healthcheck Endpoint
app.get("/health", (_req, res) => {
  res
    .status(200)
    .json({ status: "healthy", timestamp: new Date().toISOString() });
});
// API v1 Feature Routes
app.use("/api/v1/executor", executorRoutes);
// 404 Catch-All
app.use((_req, _res, next) => {
  next(new NotFoundError("The requested endpoint does not exist"));
});
// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
