import { randomUUID } from "node:crypto";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error.js";
import { logger } from "../config/logger.js";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const operationId = randomUUID();

  logger.error(
    { err, stack: err.stack, operationId, method: req.method, url: req.originalUrl },
    "Request error caught by error handler",
  );

  // Operational errors (AppError) are safe to surface to the client
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
        details: err.details,
        operationId,
      },
    });
  }

  // Unexpected errors: log full detail server-side, show a generic client-safe message
  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong on our end. Please try again later.",
      operationId,
    },
  });
};