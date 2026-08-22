import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.config.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { authUserMiddleware } from "./middlewares/rbac.middleware.js";
import { NotFoundError } from "./errors/app-error.js";
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

const app: Application = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());
app.use(httpLogger);
app.use(authUserMiddleware);

// Healthcheck Endpoints (/health, /ready)
app.use(healthRoutes);

// API v1 Feature Routes
app.use("/api/v1/executor", executorRoutes);
app.use("/api/v1/runner", runnerRouter);
app.use("/api/v1/collections", collectionRouter);
app.use("/api/v1/requests", requestRouter);
app.use("/api/v1/environments", environmentRouter);
app.use("/api/v1/history", historyRouter);
app.use("/api/v1/import", importerRouter);
app.use("/api/v1/workspaces", workspaceRouter);

// 404 Catch-All
app.use((_req, _res, next) => {
  next(new NotFoundError("The requested endpoint does not exist"));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
