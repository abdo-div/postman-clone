import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error.js';
import { env } from '../config/env.config.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = err;

  if (!(error instanceof AppError)) {
    error = new AppError('An unexpected server error occurred', 500, 'INTERNAL_SERVER_ERROR');
  }

  const appError = error as AppError;

  const response = {
    success: false,
    error: {
      code: appError.errorCode,
      message: appError.message,
      ...(appError.details ? { details: appError.details } : {}),
      ...(env.NODE_ENV === 'development' ? { stack: appError.stack } : {}),
    },
  };

  res.status(appError.statusCode).json(response);
};