import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error.js";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // Print real error stack in dev console to debug instantly
  console.error("🔥 Server Error Caught:", err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.name,
        message: err.message,
        details: err.details,
      },
    });
  }

  // Fallback for unexpected native JS/Node errors
  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: err.message || "An unexpected server error occurred",
    },
  });
};
