export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly details: unknown;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode = 500,
    errorCode = "INTERNAL_ERROR",
    details: unknown = null,
  ) {
    super(message);
    this.name = errorCode;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "bad request", errorCode = "BAD_REQUEST", details: unknown = null) {
    super(message, 400, errorCode, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "resource not found", errorCode = "NOT_FOUND") {
    super(message, 404, errorCode);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized access", errorCode = "UNAUTHORIZED") {
    super(message, 401, errorCode);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden resource access", errorCode = "FORBIDDEN") {
    super(message, 403, errorCode);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists", errorCode = "CONFLICT") {
    super(message, 409, errorCode);
  }
}