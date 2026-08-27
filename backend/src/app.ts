import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.config.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { authUserMiddleware } from "./middlewares/rbac.middleware.js";
import { NotFoundError } from "./errors/app-error.js";
import { generalRateLimiter } from "./middlewares/rateLimit.middleware.js";
import executorRoutes from "./modules/executor/executor.routes.js";
import runnerRouter from "./modules/runner/runner.routes.js";
import collectionRouter from "./modules/collection/collection.routes.js";
import requestRouter from "./modules/request/request.routes.js";
import environmentRouter from "./modules/environment/environment.routes.js";
import historyRouter from "./modules/history/history.routes.js";
import importerRouter from "./modules/importer/importer.routes.js";
import workspaceRouter from "./modules/workspace/workspace.routes.js";
import { httpLogger } from "./middlewares/logger.middleware.js";
import healthRoutes from "./modules/health/health.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import { setupSwagger } from "./middlewares/swagger.middleware.js";

const app: Application = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(httpLogger);

// Stamp every response with the API version
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-API-Version", "1");
  next();
});

app.use(authUserMiddleware);

// Healthcheck Endpoints (/health, /ready) — excluded from auth + rate limiting
app.use(healthRoutes);

// Interactive API Docs
setupSwagger(app);

// General rate limiting for all API routes
app.use("/api", generalRateLimiter);

// API v1 Feature Routes
app.use("/api/v1/executor", executorRoutes);
app.use("/api/v1/runner", runnerRouter);
app.use("/api/v1/collections", collectionRouter);
app.use("/api/v1/requests", requestRouter);
app.use("/api/v1/environments", environmentRouter);
app.use("/api/v1/history", historyRouter);
app.use("/api/v1/import", importerRouter);
app.use("/api/v1/workspaces", workspaceRouter);
app.use("/api/v1/auth", authRoutes);

// 404 Catch-All
app.use((_req, _res, next) => {
  next(new NotFoundError("The requested endpoint does not exist"));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
